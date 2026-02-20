import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Navigation } from "lucide-react";
import { WorldMapMarker } from "./WorldMap";
import { Origin } from "./OriginSelector";
import { safeDistance, formatDistance } from "@/lib/distance";
import { formatRelativeTime } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";

interface MarkerWithDistance extends WorldMapMarker {
  distance: number | null;
}

interface DistanceListProps {
  markers: WorldMapMarker[];
  origin: Origin | null;
  onMarkerClick?: (marker: WorldMapMarker) => void;
  className?: string;
}

/**
 * Sort markers by distance from origin.
 * 
 * Rules:
 * - Primary: ascending distance (closest first)
 * - Unknown distances come after known distances
 * - Ties broken by user full name (A→Z)
 * - Further ties broken by updatedAt (newest first)
 */
function sortByDistance(a: MarkerWithDistance, b: MarkerWithDistance): number {
  // Both have known distances
  if (a.distance !== null && b.distance !== null) {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    // Tie-breaker: name
    const nameCompare = a.user.fullName.localeCompare(b.user.fullName);
    if (nameCompare !== 0) return nameCompare;
    // Further tie-breaker: newest first
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }
  
  // Unknown distances come last
  if (a.distance === null && b.distance !== null) return 1;
  if (a.distance !== null && b.distance === null) return -1;
  
  // Both unknown: sort by name, then updatedAt
  const nameCompare = a.user.fullName.localeCompare(b.user.fullName);
  if (nameCompare !== 0) return nameCompare;
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function DistanceList({ markers, origin, onMarkerClick, className }: DistanceListProps) {
  // Compute distances and sort markers
  // Memoized to avoid recomputation when markers/origin haven't changed
  const sortedMarkers = useMemo(() => {
    const withDistances: MarkerWithDistance[] = markers.map(marker => ({
      ...marker,
      distance: safeDistance(origin, { lat: marker.lat, lng: marker.lng }),
    }));
    
    return withDistances.sort(sortByDistance);
  }, [markers, origin]);

  if (markers.length === 0) {
    return (
      <Card className={className}>
        <div className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-foreground mb-1">No locations to show yet</p>
          <p className="text-xs text-muted-foreground">
            Team members' locations will appear here once they check in
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div 
        className="divide-y"
        role="list"
        aria-label="Team members sorted by distance"
        aria-live="polite"
      >
        {sortedMarkers.map((marker) => {
          const initials = marker.user.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const distanceText = marker.distance !== null
            ? formatDistance(marker.distance)
            : "Unknown";

          return (
            <button
              key={marker.id}
              onClick={() => onMarkerClick?.(marker)}
              className={cn(
                "w-full p-4 text-left hover:bg-accent/50 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
              )}
              role="listitem"
              aria-label={`${marker.user.fullName}, ${marker.label || 'location'}, distance: ${distanceText}`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {marker.user.fullName}
                    </p>
                    <span
                      className={cn(
                        "text-xs font-medium flex-shrink-0",
                        marker.distance !== null ? "text-primary" : "text-muted-foreground"
                      )}
                      aria-label={`Distance: ${distanceText}`}
                    >
                      {distanceText}
                    </span>
                  </div>

                  {marker.label && (
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-foreground truncate">
                        {marker.label}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Updated {formatRelativeTime(marker.updatedAt)}</span>
                    {marker.user.email && (
                      <>
                        <span>•</span>
                        <span className="truncate">{marker.user.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
