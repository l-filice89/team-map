import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/auth/AuthContext";
import { WorldMapMarker } from "@/components/WorldMap";
import { getAllLocations, LocationResponse } from "@/lib/locationsApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Navigation } from "lucide-react";
import { DistanceList } from "@/components/DistanceList";
import { OriginSelector, Origin } from "@/components/OriginSelector";
import { LocateMe } from "@/components/LocateMe";
import { Button } from "@/components/ui/button";
import { TemporaryLocation } from "@/components/WorldMap";

export default function ListPage() {
  const { user } = useAuth();
  const [markers, setMarkers] = useState<WorldMapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [showLocateMe, setShowLocateMe] = useState(false);
  const markerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    let mounted = true;

    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const locations = await getAllLocations();
        
        if (!mounted) return;

        // Transform API data to marker format
        const transformedMarkers: WorldMapMarker[] = locations.map((loc: LocationResponse) => ({
          id: loc.id,
          lat: loc.lat,
          lng: loc.lng,
          label: loc.label || "Location",
          user: {
            id: loc.user_id,
            fullName: loc.user?.full_name || loc.user?.email?.split("@")[0] || "User",
            email: loc.user?.email,
            avatarUrl: undefined,
          },
          updatedAt: loc.created_at,
        }));

        setMarkers(transformedMarkers);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to fetch locations:", err);
        setError(err instanceof Error ? err.message : "Failed to load locations");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLocations();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLocationPreview = (location: TemporaryLocation) => {
    // When user uses "Locate Me", set it as the origin
    setOrigin({
      lat: location.lat,
      lng: location.lng,
      label: location.label,
    });
    setShowLocateMe(false);
  };

  const handleMarkerClick = (marker: WorldMapMarker) => {
    // Scroll to marker in list (visual feedback)
    const element = markerRefs.current[marker.id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus();
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} />
      
      <main 
        className="flex-1 flex flex-col"
        role="region"
        aria-label="Team locations list"
      >
        <div className="container max-w-4xl mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Team Distances
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View your teammates sorted by distance from a chosen origin
              </p>
            </div>
            <Button
              onClick={() => setShowLocateMe(!showLocateMe)}
              variant={showLocateMe ? "secondary" : "outline"}
              size="lg"
            >
              <Navigation className="h-4 w-4" />
              {showLocateMe ? "Close" : "Use My Location"}
            </Button>
          </div>

          {/* Locate Me Card */}
          {showLocateMe && (
            <LocateMe
              onLocationPreview={handleLocationPreview}
              className="max-w-md"
            />
          )}

          {/* Origin Selector */}
          <OriginSelector
            currentOrigin={origin}
            onOriginChange={setOrigin}
          />

          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}

          {/* Distance-sorted List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading locations...</p>
              </div>
            </div>
          ) : (
            <DistanceList
              markers={markers}
              origin={origin}
              onMarkerClick={handleMarkerClick}
            />
          )}
        </div>
      </main>
    </div>
  );
}
