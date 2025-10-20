import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveTrackingMapProps {
  restaurantLat?: number;
  restaurantLng?: number;
  riderLat?: number;
  riderLng?: number;
  customerLat?: number;
  customerLng?: number;
  deliveryAddress?: string;
}

// Custom icons
const restaurantIcon = L.divIcon({
  html: '<div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"><span class="text-white text-xl">🍽️</span></div>',
  className: 'custom-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const customerIcon = L.divIcon({
  html: '<div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"><span class="text-white text-xl">📍</span></div>',
  className: 'custom-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const riderIcon = L.divIcon({
  html: '<div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-pulse"><span class="text-white text-2xl">🏍️</span></div>',
  className: 'custom-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

// Component to auto-center map on rider
function MapUpdater({ riderLat, riderLng }: { riderLat?: number; riderLng?: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (riderLat && riderLng) {
      map.setView([riderLat, riderLng], 14);
    }
  }, [riderLat, riderLng, map]);
  
  return null;
}

const LiveTrackingMap = ({
  restaurantLat,
  restaurantLng,
  riderLat,
  riderLng,
  customerLat,
  customerLng,
  deliveryAddress
}: LiveTrackingMapProps) => {
  const center: [number, number] = riderLat && riderLng 
    ? [riderLat, riderLng] 
    : [33.5731, -7.5898]; // Casablanca default

  // Route coordinates
  const routeCoordinates: [number, number][] = [];
  if (restaurantLat && restaurantLng && riderLat && riderLng && customerLat && customerLng) {
    routeCoordinates.push(
      [restaurantLat, restaurantLng],
      [riderLat, riderLng],
      [customerLat, customerLng]
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        className="absolute inset-0 rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater riderLat={riderLat} riderLng={riderLng} />

        {restaurantLat && restaurantLng && (
          <Marker position={[restaurantLat, restaurantLng]} icon={restaurantIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">Restaurant</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {customerLat && customerLng && (
          <Marker position={[customerLat, customerLng]} icon={customerIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">Delivery Location</h3>
                <p className="text-sm">{deliveryAddress || ''}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {riderLat && riderLng && (
          <Marker position={[riderLat, riderLng]} icon={riderIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">Rider Location</h3>
                <p className="text-sm">Live tracking</p>
              </div>
            </Popup>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#10b981"
            weight={4}
            dashArray="5, 10"
          />
        )}
      </MapContainer>

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
