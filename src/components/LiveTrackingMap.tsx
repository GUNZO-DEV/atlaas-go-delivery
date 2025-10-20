import { useEffect, useRef } from 'react';
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

const LiveTrackingMap = ({
  restaurantLat,
  restaurantLng,
  riderLat,
  riderLng,
  customerLat,
  customerLng,
  deliveryAddress
}: LiveTrackingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<{
    restaurant?: L.Marker;
    customer?: L.Marker;
    rider?: L.Marker;
  }>({});
  const routeLine = useRef<L.Polyline | null>(null);

  // Custom icons
  const restaurantIcon = L.divIcon({
    html: '<div style="width: 40px; height: 40px; background: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><span style="font-size: 1.25rem;">🍽️</span></div>',
    className: 'custom-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const customerIcon = L.divIcon({
    html: '<div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><span style="font-size: 1.25rem;">📍</span></div>',
    className: 'custom-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const riderIcon = L.divIcon({
    html: '<div style="width: 48px; height: 48px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"><span style="font-size: 1.5rem;">🏍️</span></div>',
    className: 'custom-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const center: [number, number] = riderLat && riderLng 
      ? [riderLat, riderLng] 
      : [33.5731, -7.5898];

    map.current = L.map(mapContainer.current).setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add/update restaurant marker
  useEffect(() => {
    if (!map.current || !restaurantLat || !restaurantLng) return;

    if (!markers.current.restaurant) {
      markers.current.restaurant = L.marker([restaurantLat, restaurantLng], {
        icon: restaurantIcon
      }).addTo(map.current);
      markers.current.restaurant.bindPopup('<div style="padding: 8px;"><h3 style="font-weight: 600;">Restaurant</h3></div>');
    } else {
      markers.current.restaurant.setLatLng([restaurantLat, restaurantLng]);
    }
  }, [restaurantLat, restaurantLng]);

  // Add/update customer marker
  useEffect(() => {
    if (!map.current || !customerLat || !customerLng) return;

    if (!markers.current.customer) {
      markers.current.customer = L.marker([customerLat, customerLng], {
        icon: customerIcon
      }).addTo(map.current);
      markers.current.customer.bindPopup(`<div style="padding: 8px;"><h3 style="font-weight: 600;">Delivery Location</h3><p style="font-size: 0.875rem;">${deliveryAddress || ''}</p></div>`);
    } else {
      markers.current.customer.setLatLng([customerLat, customerLng]);
    }
  }, [customerLat, customerLng, deliveryAddress]);

  // Add/update rider marker and route
  useEffect(() => {
    if (!map.current) return;

    if (riderLat && riderLng) {
      if (!markers.current.rider) {
        markers.current.rider = L.marker([riderLat, riderLng], {
          icon: riderIcon
        }).addTo(map.current);
        markers.current.rider.bindPopup('<div style="padding: 8px;"><h3 style="font-weight: 600;">Rider Location</h3><p style="font-size: 0.875rem;">Live tracking</p></div>');
        map.current.setView([riderLat, riderLng], 14);
      } else {
        markers.current.rider.setLatLng([riderLat, riderLng]);
        map.current.setView([riderLat, riderLng]);
      }

      // Draw route
      if (restaurantLat && restaurantLng && customerLat && customerLng) {
        const routeCoordinates: [number, number][] = [
          [restaurantLat, restaurantLng],
          [riderLat, riderLng],
          [customerLat, customerLng]
        ];

        if (routeLine.current) {
          routeLine.current.setLatLngs(routeCoordinates);
        } else {
          routeLine.current = L.polyline(routeCoordinates, {
            color: '#10b981',
            weight: 4,
            dashArray: '5, 10'
          }).addTo(map.current);
        }
      }
    }
  }, [riderLat, riderLng, restaurantLat, restaurantLng, customerLat, customerLng]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
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
