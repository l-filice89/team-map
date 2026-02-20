import { useState, useRef, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  searchPlaces,
  coarsenPlace,
  formatPlaceLabel,
  type PlaceSuggestion,
  type CoarsenedPlace,
} from "@/lib/geocoding";

interface LocationPickerProps {
  onPlaceSelect: (place: CoarsenedPlace) => void;
  onSave: (place: CoarsenedPlace) => Promise<void>;
  isSaving?: boolean;
  className?: string;
}

export function LocationPicker({
  onPlaceSelect,
  onSave,
  isSaving = false,
  className,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<CoarsenedPlace | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    const label = formatPlaceLabel(suggestion);
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    // Coarsen coordinates for privacy (city-level precision)
    const coarsened = coarsenPlace(lat, lng, label);

    setSelectedPlace(coarsened);
    setCustomLabel(coarsened.label);
    setSearchQuery(label);
    setShowSuggestions(false);
    
    // Notify parent for map preview
    onPlaceSelect(coarsened);
  };

  const handleSave = async () => {
    if (!selectedPlace) return;

    // Use custom label if user modified it
    const finalPlace: CoarsenedPlace = {
      ...selectedPlace,
      label: customLabel.trim() || selectedPlace.label,
    };

    await onSave(finalPlace);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const canSave = selectedPlace && customLabel.trim().length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* City/Place Search */}
      <div className="space-y-2">
        <Label htmlFor="place-search" className="text-sm font-medium">
          Choose your city or a nearby place
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            id="place-search"
            type="text"
            placeholder="Search for a city or place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9"
            aria-autocomplete="list"
            aria-controls="place-suggestions"
            aria-expanded={showSuggestions}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              id="place-suggestions"
              role="listbox"
              className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.place_id}
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors focus:bg-accent focus:text-accent-foreground focus:outline-none border-b border-border last:border-b-0"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {formatPlaceLabel(suggestion)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {suggestion.display_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          We only save the city/place name and approximate location (not your exact address).
        </p>
      </div>

      {/* Label Input (editable) */}
      {selectedPlace && (
        <div className="space-y-2">
          <Label htmlFor="location-label" className="text-sm font-medium">
            Label (optional)
          </Label>
          <Input
            id="location-label"
            type="text"
            placeholder="e.g., HQ, Remote, Traveling in..."
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            maxLength={100}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Customize how this location appears on the map.
          </p>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={!canSave || isSaving}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            Save location
          </>
        )}
      </Button>

      {/* Selected Place Confirmation */}
      {selectedPlace && (
        <div
          className="text-xs text-muted-foreground flex items-center gap-1"
          role="status"
          aria-live="polite"
        >
          <MapPin className="h-3 w-3" />
          <span>
            Selected: {selectedPlace.label} ({selectedPlace.lat.toFixed(2)}, {selectedPlace.lng.toFixed(2)})
          </span>
        </div>
      )}
    </div>
  );
}
