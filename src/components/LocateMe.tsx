import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, AlertCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { searchPlaces, coarsenPlace, PlaceSuggestion, formatPlaceLabel } from "@/lib/geocoding";

interface TemporaryLocation {
  lat: number;
  lng: number;
  label: string;
}

interface LocateMeProps {
  onLocationPreview: (location: TemporaryLocation) => void;
  className?: string;
}

type LocationState = "idle" | "requesting" | "success" | "error";

export function LocateMe({ onLocationPreview, className }: LocateMeProps) {
  const [state, setState] = useState<LocationState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Debounced search for places
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await searchPlaces(searchQuery);
        setSuggestions(results);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocateMe = () => {
    // Debounce - prevent multiple simultaneous requests
    if (isRequesting) return;

    // Check if geolocation is available
    if (!navigator.geolocation) {
      setState("error");
      setErrorMessage("Your browser doesn't support geolocation. Please enter coordinates manually.");
      setShowSearchForm(true);
      return;
    }

    // Check for secure origin (HTTPS or localhost)
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      setState("error");
      setErrorMessage("Location requires a secure connection (HTTPS). Enter coordinates manually instead.");
      setShowSearchForm(true);
      return;
    }

    setState("requesting");
    setIsRequesting(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(3));
        const lng = Number(position.coords.longitude.toFixed(3));
        
        setState("success");
        setIsRequesting(false);
        
        onLocationPreview({
          lat,
          lng,
          label: "Current position",
        });

        toast({
          title: "Location found",
          description: `Previewing: ${lat}, ${lng}`,
        });
      },
      (error) => {
        setState("error");
        setIsRequesting(false);
        
        let message = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "We couldn't access location. You can allow it in your browser settings, or enter coordinates manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "We couldn't get a fix. Try again or enter coordinates manually.";
            break;
          case error.TIMEOUT:
            message = "It's taking too long to locate you. Try again or enter coordinates manually.";
            break;
          default:
            message = "An error occurred. Try again or enter coordinates manually.";
        }
        
        setErrorMessage(message);
        setShowSearchForm(true);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  };

  const handleSuggestionSelect = async (suggestion: PlaceSuggestion) => {
    setSelectedPlace(suggestion);
    setSuggestions([]);
    setSearchQuery(suggestion.display_name);

    // Coarsen coordinates for privacy
    const label = formatPlaceLabel(suggestion);
    const coarsenedPlace = coarsenPlace(
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon),
      label
    );

    setState("success");
    onLocationPreview({
      lat: coarsenedPlace.lat,
      lng: coarsenedPlace.lng,
      label: coarsenedPlace.label,
    });

    toast({
      title: "Location previewed",
      description: `Previewing: ${coarsenedPlace.label}`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  return (
    <div className={`p-4 space-y-4 ${className || ''}`}>
      {/* Locate Me Button */}
      <div>
        <Button
          onClick={handleLocateMe}
          disabled={isRequesting}
          className="w-full"
          variant="outline"
          aria-live="polite"
        >
          {isRequesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting your location…
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Locate me
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          We'll only use your device location to preview on the map. Nothing is saved.
        </p>
      </div>

      {/* Status Messages */}
      {state === "error" && errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Search Form */}
      {(showSearchForm || state === "error") && (
        <div className="space-y-3 pt-3 border-t" ref={searchRef}>
          <h3 className="text-sm font-medium">Search for a location</h3>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for a city or place..."
                className="pl-9"
                aria-label="Search for location"
                aria-autocomplete="list"
                aria-controls="location-suggestions"
              />
            </div>

            {/* Suggestions Dropdown */}
            {(suggestions.length > 0 || loadingSuggestions) && (
              <div
                id="location-suggestions"
                className="absolute z-[9999] w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-y-auto"
                role="listbox"
              >
                {loadingSuggestions ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                    Searching...
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.place_id}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm border-b last:border-b-0"
                      role="option"
                      aria-selected={selectedPlace?.place_id === suggestion.place_id}
                    >
                      <div className="font-medium text-foreground">
                        {suggestion.address?.city ||
                          suggestion.address?.town ||
                          suggestion.address?.village ||
                          suggestion.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {suggestion.display_name}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedPlace && (
            <div className="p-3 bg-accent/50 rounded-md">
              <p className="text-sm font-medium text-foreground mb-1">
                ✓ Selected location
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedPlace.display_name}
              </p>
            </div>
          )}
        </div>
      )}

      {!showSearchForm && state !== "error" && (
        <Button
          onClick={() => setShowSearchForm(true)}
          variant="ghost"
          size="sm"
          className="w-full text-xs"
        >
          Or search for a location
        </Button>
      )}
    </div>
  );
}
