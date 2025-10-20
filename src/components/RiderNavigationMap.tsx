import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RiderNavigationMapProps {
  restaurantLat?: number;
  restaurantLng?: number;
  restaurantName?: string;
  restaurantAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryAddress?: string;
}

const RiderNavigationMap = ({
  restaurantLat,
  restaurantLng,
  restaurantName,
  restaurantAddress,
  deliveryLat,
  deliveryLng,
  deliveryAddress
}: RiderNavigationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  // Custom icons
  const restaurantIcon = L.divIcon({
    html: '<div style="width: 40px; height: 40px; background: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><span style="font-size: 1.25rem;">🍽️</span></div>',
    className: 'custom-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const deliveryIcon = L.divIcon({
    html: '<div style="width: 40px; height: 40px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><span style="font-size: 1.25rem;">📍</span></div>',
    className: 'custom-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Default center (Morocco)
    const center: [number, number] = [33.5731, -7.5898];
    
    map.current = L.map(mapContainer.current).setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing layers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current?.removeLayer(layer);
      }
    });

    const bounds: L.LatLngExpression[] = [];

    // Add restaurant marker
    if (restaurantLat && restaurantLng) {
      const marker = L.marker([restaurantLat, restaurantLng], {
        icon: restaurantIcon
      }).addTo(map.current);
      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">Pickup Location</h3>
          <p style="font-size: 0.875rem; font-weight: 500;">${restaurantName || 'Restaurant'}</p>
          <p style="font-size: 0.75rem; color: #6b7280;">${restaurantAddress || ''}</p>
        </div>
      `);
      bounds.push([restaurantLat, restaurantLng]);
    }

    // Add delivery marker
    if (deliveryLat && deliveryLng) {
      const marker = L.marker([deliveryLat, deliveryLng], {
        icon: deliveryIcon
      }).addTo(map.current);
      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">Delivery Location</h3>
          <p style="font-size: 0.75rem; color: #6b7280;">${deliveryAddress || ''}</p>
        </div>
      `);
      bounds.push([deliveryLat, deliveryLng]);
    }

    // Draw route line
    if (restaurantLat && restaurantLng && deliveryLat && deliveryLng) {
      L.polyline(
        [[restaurantLat, restaurantLng], [deliveryLat, deliveryLng]], 
        {
          color: '#3b82f6',
          weight: 4,
          dashArray: '10, 10',
          opacity: 0.7
        }
      ).addTo(map.current);
    }

    // Fit bounds to show all markers
    if (bounds.length > 0) {
      map.current.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    }
  }, [restaurantLat, restaurantLng, restaurantName, restaurantAddress, deliveryLat, deliveryLng, deliveryAddress]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" />
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
