import { useCallback, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBSLCUfwLEVtlKj531pvyeEygQDkED3-zU';

interface RiderNavigationMapProps {
  restaurantLat?: number;
  restaurantLng?: number;
  restaurantName?: string;
  restaurantAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryAddress?: string;
}

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 33.5731, lng: -7.5898 };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
};

const RiderNavigationMap = ({
  restaurantLat,
  restaurantLng,
  restaurantName,
  restaurantAddress,
  deliveryLat,
  deliveryLng,
  deliveryAddress,
}: RiderNavigationMapProps) => {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const mapRef = useRef<google.maps.Map | null>(null);
  const [, setMapLoaded] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoaded(true);

    const bounds = new google.maps.LatLngBounds();
    if (restaurantLat && restaurantLng) bounds.extend({ lat: restaurantLat, lng: restaurantLng });
    if (deliveryLat && deliveryLng) bounds.extend({ lat: deliveryLat, lng: deliveryLng });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 60);
    }
  }, [restaurantLat, restaurantLng, deliveryLat, deliveryLng]);

  if (!isLoaded) {
    return (
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border flex items-center justify-center bg-muted">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  const routeCoordinates: google.maps.LatLngLiteral[] = [];
  if (restaurantLat && restaurantLng) routeCoordinates.push({ lat: restaurantLat, lng: restaurantLng });
  if (deliveryLat && deliveryLng) routeCoordinates.push({ lat: deliveryLat, lng: deliveryLng });

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={restaurantLat && restaurantLng ? { lat: restaurantLat, lng: restaurantLng } : defaultCenter}
        zoom={13}
        onLoad={onLoad}
        options={mapOptions}
      >
        {restaurantLat && restaurantLng && (
          <Marker
            position={{ lat: restaurantLat, lng: restaurantLng }}
            label={{ text: '🍽️', fontSize: '24px' }}
            title={`Pickup: ${restaurantName || 'Restaurant'} - ${restaurantAddress || ''}`}
          />
        )}

        {deliveryLat && deliveryLng && (
          <Marker
            position={{ lat: deliveryLat, lng: deliveryLng }}
            label={{ text: '📍', fontSize: '24px' }}
            title={`Delivery: ${deliveryAddress || ''}`}
          />
        )}

        {routeCoordinates.length === 2 && (
          <Polyline
            path={routeCoordinates}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.7,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>

      {!restaurantLat && !deliveryLat && (
        <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm flex items-center justify-center">
          <p className="text-muted-foreground font-medium">
            Location data unavailable
          </p>
        </div>
      )}
    </div>
  );
};

export default RiderNavigationMap;
