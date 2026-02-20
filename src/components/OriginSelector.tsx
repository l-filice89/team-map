import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, X, Loader2, Navigation } from "lucide-react";
import { searchPlaces, coarsenPlace, PlaceSuggestion, formatPlaceLabel } from "@/lib/geocoding";

export interface Origin {
  lat: number;
  lng: number;
  label: string;
}

interface OriginSelectorProps {
  currentOrigin: Origin | null;
  onOriginChange: (origin: Origin | null) => void;
  className?: string;
}

export function OriginSelector({ currentOrigin, onOriginChange, className }: OriginSelectorProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  const handleSuggestionSelect = async (suggestion: PlaceSuggestion) => {
    const label = formatPlaceLabel(suggestion);
    const coarsenedPlace = coarsenPlace(
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon),
      label
    );

    onOriginChange({
      lat: coarsenedPlace.lat,
      lng: coarsenedPlace.lng,
      label: coarsenedPlace.label,
    });

    setSuggestions([]);
    setSearchQuery("");
    setShowSearch(false);
  };

  const handleClearOrigin = () => {
    onOriginChange(null);
    setSearchQuery("");
    setShowSearch(false);
  };

  return (
    <Card className={className}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Origin Point</h3>
          </div>
          {currentOrigin && (
            <Button
              onClick={handleClearOrigin}
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              aria-label="Clear origin"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {currentOrigin ? (
          <div className="p-3 bg-accent/50 rounded-md">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {currentOrigin.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentOrigin.lat.toFixed(3)}, {currentOrigin.lng.toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No origin selected. Distances will show as unknown.
          </p>
        )}

        {!showSearch ? (
          <Button
            onClick={() => setShowSearch(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <MapPin className="mr-2 h-3 w-3" />
            Choose origin
          </Button>
        ) : (
          <div className="space-y-2" ref={searchRef}>
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a city or place..."
                className="text-sm"
                autoFocus
                aria-label="Search for origin location"
              />

              {(suggestions.length > 0 || loadingSuggestions) && (
                <div className="absolute z-[9999] w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
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
            <Button
              onClick={() => setShowSearch(false)}
              variant="ghost"
              size="sm"
              className="w-full text-xs"
            >
              Cancel
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-2 border-t">
          Distances are estimates from your selected origin. Your precise location is not saved.
        </p>
      </div>
    </Card>
  );
}
