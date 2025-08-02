import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { TripAdapter } from "@/lib/adapter/trip.adapter";

// Predefined set of visually distinct colors
const TRIP_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

// Function to get a consistent color for a trip based on its ID
const getTripColor = (tripId: string): string => {
  // Use the trip ID to generate a consistent index
  const hash = tripId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TRIP_COLORS[hash % TRIP_COLORS.length];
};

interface TripMapProps {
  trips: TripAdapter[];
  onTripClick: (trip: TripAdapter) => void;
  customCenter?: { lat: number; lng: number };
  customZoom?: number;
}

export function TripMap({ trips, onTripClick, customCenter, customZoom }: TripMapProps) {
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // Calculate bounds and center based on all trip locations
  const { mapCenter, zoom } = useMemo(() => {
    if (customCenter && customZoom) {
      return { mapCenter: customCenter, zoom: customZoom };
    }

    if (trips.length === 0) {
      return { mapCenter: { lat: 30, lng: 0 }, zoom: 2 };
    }

    // Collect all coordinates
    const coordinates: { lat: number; lng: number }[] = [];
    trips.forEach(trip => {
      trip.trip_cities.forEach(city => {
        if (city.lat && city.lng) {
          coordinates.push({ lat: city.lat, lng: city.lng });
        }
      });
    });

    if (coordinates.length === 0) {
      return { mapCenter: { lat: 30, lng: 0 }, zoom: 2 };
    }

    // Calculate bounds
    const bounds = coordinates.reduce((bounds, coord) => {
      return {
        minLat: Math.min(bounds.minLat, coord.lat),
        maxLat: Math.max(bounds.maxLat, coord.lat),
        minLng: Math.min(bounds.minLng, coord.lng),
        maxLng: Math.max(bounds.maxLng, coord.lng),
      };
    }, {
      minLat: coordinates[0].lat,
      maxLat: coordinates[0].lat,
      minLng: coordinates[0].lng,
      maxLng: coordinates[0].lng,
    });

    // Calculate center
    const center = {
      lat: (bounds.minLat + bounds.maxLat) / 2,
      lng: (bounds.minLng + bounds.maxLng) / 2,
    };

    // Calculate appropriate zoom level based on bounds
    const latDiff = bounds.maxLat - bounds.minLat;
    const lngDiff = bounds.maxLng - bounds.minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let calculatedZoom = 2;
    if (maxDiff < 0.5) calculatedZoom = 11;
    else if (maxDiff < 1) calculatedZoom = 10;
    else if (maxDiff < 5) calculatedZoom = 8;
    else if (maxDiff < 10) calculatedZoom = 6;
    else if (maxDiff < 20) calculatedZoom = 5;
    else if (maxDiff < 40) calculatedZoom = 4;
    else if (maxDiff < 80) calculatedZoom = 3;

    // For single location trips, use a closer zoom
    if (coordinates.length === 1) {
      calculatedZoom = 10;
    }

    return { mapCenter: center, zoom: calculatedZoom };
  }, [trips, customCenter, customZoom]);

  // Premium map styling
  const mapOptions = useMemo<google.maps.MapOptions>(() => {
    // Base options that don't require the Google Maps API to be loaded
    const options: google.maps.MapOptions = {
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.fill",
          stylers: [{ color: "#ffffff" }, { lightness: 17 }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }],
        },
        {
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }, { lightness: 18 }],
        },
        {
          featureType: "road.local",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }, { lightness: 16 }],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#f5f5f5" }, { lightness: 21 }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#dedede" }, { lightness: 21 }],
        },
        {
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }],
        },
        {
          elementType: "labels.text.fill",
          stylers: [{ saturation: 36 }, { color: "#333333" }, { lightness: 40 }],
        },
        {
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#f2f2f2" }, { lightness: 19 }],
        },
        {
          featureType: "administrative",
          elementType: "geometry.fill",
          stylers: [{ color: "#fefefe" }, { lightness: 20 }],
        },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    };

    // Add options that require the Google Maps API to be loaded
    if (typeof google !== 'undefined') {
      options.zoomControlOptions = {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      };
    }

    return options;
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-300 mb-4"></div>
          <p className="text-neutral-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <GoogleMap
        options={mapOptions}
        zoom={zoom}
        center={mapCenter}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >
        {trips.flatMap(trip => 
          trip.trip_cities.map(city => {
            const isHovered = trip.id === hoveredTripId;
            const tripColor = getTripColor(trip.id);
            
            return (
              <MarkerF
                key={city.id}
                position={{ lat: city.lat, lng: city.lng }}
                title={`${trip.title} - ${city.name}`}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: isHovered ? 10 : 8,
                  fillColor: tripColor,
                  fillOpacity: isHovered ? 0.9 : 0.7,
                  strokeWeight: isHovered ? 2 : 1,
                  strokeColor: "#FFFFFF",
                }}
                onClick={() => onTripClick(trip)}
                onMouseOver={() => setHoveredTripId(trip.id)}
                onMouseOut={() => setHoveredTripId(null)}
                animation={isHovered ? google.maps.Animation.BOUNCE : undefined}
              />
            );
          })
        )}
      </GoogleMap>
    </div>
  );
} 