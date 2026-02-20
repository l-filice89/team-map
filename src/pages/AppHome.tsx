import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/auth/AuthContext";
import { WorldMap, WorldMapMarker, TemporaryLocation } from "@/components/WorldMap";
import { getAllLocations, LocationResponse, createOrUpdateLocation } from "@/lib/locationsApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MapPin } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { LocateMe } from "@/components/LocateMe";
import { CoarsenedPlace } from "@/lib/geocoding";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AppHome() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [markers, setMarkers] = useState<WorldMapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewPlace, setPreviewPlace] = useState<CoarsenedPlace | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [temporaryLocation, setTemporaryLocation] = useState<TemporaryLocation | null>(null);
  const [showLocateMe, setShowLocateMe] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const locations = await getAllLocations();
        
        if (!mounted) return;

        // Transform API data to WorldMap marker format
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

  const handlePlaceSelect = (place: CoarsenedPlace) => {
    // Show preview pin on map
    setPreviewPlace(place);
  };

  const handleLocationPreview = (location: TemporaryLocation) => {
    // Show temporary location on map (not saved)
    setTemporaryLocation(location);
    // Close the locate me popover after location is selected
    setShowLocateMe(false);
  };

  const handleSaveLocation = async (place: CoarsenedPlace) => {
    try {
      setIsSaving(true);
      setError(null);

      // Save location via API (upserts user's single location)
      await createOrUpdateLocation({
        lat: place.lat,
        lng: place.lng,
        label: place.label,
      });

      // Clear preview
      setPreviewPlace(null);
      setShowPicker(false);

      // Show success toast
      toast({
        title: "Location saved",
        description: `Your location has been updated to ${place.label}.`,
      });

      // Refresh markers to show updated location
      const locations = await getAllLocations();
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
      console.error("Failed to save location:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save location";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Combine actual markers with preview (if any)
  const displayMarkers: WorldMapMarker[] = [
    ...markers,
    ...(previewPlace && user
      ? [
          {
            id: "preview",
            lat: previewPlace.lat,
            lng: previewPlace.lng,
            label: previewPlace.label + " (Preview)",
            user: {
              id: user.id,
              fullName: user.displayName,
              email: user.email,
              avatarUrl: user.avatarUrl,
            },
            updatedAt: new Date().toISOString(),
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} />
      
      <main 
        className="flex-1 flex flex-col"
        role="region"
        aria-label="Team locations map"
      >
        <div className="container max-w-7xl mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Around the World Map
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View your team's current locations around the globe
              </p>
            </div>
            <div className="flex gap-2">
              <Popover open={showLocateMe} onOpenChange={setShowLocateMe}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (showPicker) setShowPicker(false);
                    }}
                  >
                    <MapPin className="h-4 w-4" />
                    Locate Me
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[400px] p-0" 
                  align="end"
                  side="bottom"
                  sideOffset={8}
                >
                  <LocateMe
                    onLocationPreview={handleLocationPreview}
                  />
                </PopoverContent>
              </Popover>
              
              <Button
                onClick={() => {
                  setShowPicker(!showPicker);
                  if (showLocateMe) setShowLocateMe(false);
                }}
                variant={showPicker ? "secondary" : "default"}
                size="lg"
              >
                <MapPin className="h-4 w-4" />
                {showPicker ? "Close" : "Check In"}
              </Button>
            </div>
          </div>

          {/* Location Picker Card */}
          {showPicker && (
            <Card>
              <CardHeader>
                <CardTitle>Check In to Your Location</CardTitle>
                <CardDescription>
                  Select a city or place to share where you're working from. We only save approximate coordinates (city-level) for privacy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LocationPicker
                  onPlaceSelect={handlePlaceSelect}
                  onSave={handleSaveLocation}
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4" role="alert" aria-live="polite">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex-1 min-h-[500px]" aria-live="polite" aria-busy={loading}>
            <WorldMap 
              markers={displayMarkers}
              temporaryLocation={temporaryLocation}
              loading={loading}
              theme={theme}
              className="h-full"
              onMarkerClick={(marker) => {
                console.log("Marker clicked:", marker);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
