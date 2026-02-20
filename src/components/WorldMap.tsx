import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { escapeHtml } from "@/lib/escapeHtml";
import { formatRelativeTime } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import { createRoot } from "react-dom/client";

// Fix for default marker icons in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface WorldMapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  user: {
    id: string;
    fullName: string;
    email?: string;
    avatarUrl?: string;
  };
  updatedAt: string;
}

export interface TemporaryLocation {
  lat: number;
  lng: number;
  label: string;
}

interface WorldMapProps {
  markers: WorldMapMarker[];
  temporaryLocation?: TemporaryLocation | null;
  className?: string;
  onMarkerClick?: (marker: WorldMapMarker) => void;
  loading?: boolean;
  theme?: string;
}

export function WorldMap({
  markers,
  temporaryLocation,
  className,
  onMarkerClick,
  loading,
  theme = "light",
}: WorldMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const temporaryMarker = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log(
      "[WorldMap] Initializing map, container:",
      mapContainer.current
    );

    // Create map
    map.current = L.map(mapContainer.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    });

    console.log("[WorldMap] Map initialized:", map.current);

    // Create markers layer
    markersLayer.current = L.layerGroup().addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update tile layer based on theme
  useEffect(() => {
    if (!map.current) return;

    const lightTileUrl =
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    const darkTileUrl =
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    // Remove existing tile layers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.current?.removeLayer(layer);
      }
    });

    // Add new tile layer
    L.tileLayer(theme === "dark" ? darkTileUrl : lightTileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);
  }, [theme]);

  // Update markers
  useEffect(() => {
    console.log(
      "[WorldMap] Markers update effect - map:",
      !!map.current,
      "markersLayer:",
      !!markersLayer.current,
      "markers count:",
      markers.length
    );

    if (!map.current || !markersLayer.current) return;

    // Clear existing markers
    markersLayer.current.clearLayers();

    if (markers.length === 0) {
      map.current.setView([20, 0], 2);
      return;
    }

    console.log("[WorldMap] Adding markers:", markers);

    // Add markers
    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng]);

      // Create popup content
      const popupDiv = document.createElement("div");
      popupDiv.className = "p-2 min-w-[200px]";

      const initials = marker.user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const safeFullName = escapeHtml(marker.user.fullName);
      const safeEmail = escapeHtml(marker.user.email ?? "");
      const safeLabel = marker.label ? escapeHtml(marker.label) : "";
      const safeInitials = escapeHtml(initials);
      const safeUpdatedAt = escapeHtml(formatRelativeTime(marker.updatedAt));

      popupDiv.innerHTML = `
        <div class="flex items-center gap-3 mb-2">
          <div class="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            ${safeInitials}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-foreground leading-tight mb-0.5">
              ${safeFullName}
            </p>
            ${
              marker.user.email
                ? `
              <p class="text-xs text-muted-foreground truncate">
                ${safeEmail}
              </p>
            `
                : ""
            }
          </div>
        </div>
        ${
          safeLabel
            ? `
          <p class="text-sm text-foreground mb-1">
            📍 ${safeLabel}
          </p>
        `
            : ""
        }
        <p class="text-xs text-muted-foreground">
          Updated ${safeUpdatedAt}
        </p>
      `;

      leafletMarker.bindPopup(popupDiv);

      leafletMarker.on("click", () => {
        onMarkerClick?.(marker);
      });

      markersLayer.current?.addLayer(leafletMarker);
    });

    // Fit bounds to markers
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [markers, onMarkerClick]);

  // Handle temporary location preview
  useEffect(() => {
    if (!map.current) return;

    // Remove existing temporary marker
    if (temporaryMarker.current) {
      map.current.removeLayer(temporaryMarker.current);
      temporaryMarker.current = null;
    }

    if (!temporaryLocation) return;

    // Create custom icon for temporary pin (distinct visual style)
    const temporaryIcon = L.divIcon({
      className: "temporary-marker",
      html: `
        <div style="
          position: relative;
          width: 30px;
          height: 30px;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 20px solid hsl(var(--primary));
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          "></div>
          <div style="
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 12px;
            background: hsl(var(--background));
            border: 2px solid hsl(var(--primary));
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    // Create temporary marker (no popup on click)
    temporaryMarker.current = L.marker(
      [temporaryLocation.lat, temporaryLocation.lng],
      {
        icon: temporaryIcon,
      }
    );

    temporaryMarker.current.addTo(map.current);

    // Center map on temporary location with animation
    map.current.setView([temporaryLocation.lat, temporaryLocation.lng], 10, {
      animate: true,
      duration: 0.5,
    });
  }, [temporaryLocation]);

  return (
    <div
      className={cn(
        "relative w-full rounded-lg overflow-hidden border",
        className
      )}
      style={{ height: "500px" }}
    >
      {/* Always render the map container so it can initialize properly */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Show loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-[1000] pointer-events-none">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Show empty state overlay when no markers and no temporary location */}
      {!loading && markers.length === 0 && !temporaryLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-[1000] pointer-events-none">
          <div className="text-center p-8">
            <p className="text-lg font-medium text-foreground mb-2">
              No locations yet
            </p>
            <p className="text-sm text-muted-foreground">
              Team members' locations will appear here once they check in
            </p>
          </div>
        </div>
      )}

      <style>{`
        .leaflet-popup-content-wrapper {
          background: hsl(var(--popover)) !important;
          color: hsl(var(--popover-foreground)) !important;
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        
        .leaflet-popup-tip {
          background: hsl(var(--popover)) !important;
        }
        
        .leaflet-popup-close-button {
          color: hsl(var(--muted-foreground)) !important;
          font-size: 20px !important;
          padding: 4px 8px !important;
        }
        
        .leaflet-popup-close-button:hover {
          color: hsl(var(--foreground)) !important;
        }
        
        .leaflet-control-zoom a {
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: hsl(var(--accent)) !important;
        }
        
        .leaflet-control-attribution {
          background: hsl(var(--background) / 0.8) !important;
          color: hsl(var(--muted-foreground)) !important;
          font-size: 10px !important;
        }
        
        .leaflet-control-attribution a {
          color: hsl(var(--primary)) !important;
        }
      `}</style>
    </div>
  );
}
