import { useCallback, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBSLCUfwLEVtlKj531pvyeEygQDkED3-zU';

interface LiveTrackingMapProps {
  restaurantLat?: number;
  restaurantLng?: number;
  riderLat?: number;
  riderLng?: number;
  customerLat?: number;
  customerLng?: number;
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

const LiveTrackingMap = ({
  restaurantLat,
  restaurantLng,
  riderLat,
  riderLng,
  customerLat,
  customerLng,
  deliveryAddress,
}: LiveTrackingMapProps) => {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const mapRef = useRef<google.maps.Map | null>(null);
  const [, setMapLoaded] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoaded(true);

    const bounds = new google.maps.LatLngBounds();
    if (restaurantLat && restaurantLng) bounds.extend({ lat: restaurantLat, lng: restaurantLng });
    if (customerLat && customerLng) bounds.extend({ lat: customerLat, lng: customerLng });
    if (riderLat && riderLng) bounds.extend({ lat: riderLat, lng: riderLng });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 60);
    }
  }, [restaurantLat, restaurantLng, customerLat, customerLng, riderLat, riderLng]);

  if (!isLoaded) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  const center = riderLat && riderLng
    ? { lat: riderLat, lng: riderLng }
    : restaurantLat && restaurantLng
      ? { lat: restaurantLat, lng: restaurantLng }
      : defaultCenter;

  const routeCoordinates: google.maps.LatLngLiteral[] = [];
  if (restaurantLat && restaurantLng) routeCoordinates.push({ lat: restaurantLat, lng: restaurantLng });
  if (riderLat && riderLng) routeCoordinates.push({ lat: riderLat, lng: riderLng });
  if (customerLat && customerLng) routeCoordinates.push({ lat: customerLat, lng: customerLng });

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        options={mapOptions}
      >
        {restaurantLat && restaurantLng && (
          <Marker
            position={{ lat: restaurantLat, lng: restaurantLng }}
            label={{ text: '🍽️', fontSize: '24px' }}
            title="Restaurant"
          />
        )}

        {customerLat && customerLng && (
          <Marker
            position={{ lat: customerLat, lng: customerLng }}
            label={{ text: '📍', fontSize: '24px' }}
            title={deliveryAddress || 'Delivery Location'}
          />
        )}

        {riderLat && riderLng && (
          <Marker
            position={{ lat: riderLat, lng: riderLng }}
            label={{ text: '🏍️', fontSize: '28px' }}
            title="Rider"
          />
        )}

        {routeCoordinates.length >= 2 && (
          <Polyline
            path={routeCoordinates}
            options={{
              strokeColor: '#10b981',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>

      {!riderLat && (
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center pointer-events-none">
          <p className="text-muted-foreground font-medium">
            Waiting for rider location...
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
