import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';

    // Initialize map centered on Morocco
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-6.8498, 34.0209], // Morocco coordinates
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers when coordinates are available
    if (restaurantLat && restaurantLng) {
      const restaurantEl = document.createElement('div');
      restaurantEl.className = 'w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg';
      restaurantEl.innerHTML = '<span class="text-white text-xl">🍽️</span>';
      
      new mapboxgl.Marker(restaurantEl)
        .setLngLat([restaurantLng, restaurantLat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3 class="font-semibold">Restaurant</h3>'))
        .addTo(map.current);
    }

    if (customerLat && customerLng) {
      const customerEl = document.createElement('div');
      customerEl.className = 'w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg';
      customerEl.innerHTML = '<span class="text-white text-xl">📍</span>';
      
      new mapboxgl.Marker(customerEl)
        .setLngLat([customerLng, customerLat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3 class="font-semibold">Delivery Location</h3><p class="text-sm">${deliveryAddress || ''}</p>`))
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update rider marker position in real-time
  useEffect(() => {
    if (!map.current || !riderLat || !riderLng) return;

    if (!riderMarker.current) {
      const riderEl = document.createElement('div');
      riderEl.className = 'w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-pulse';
      riderEl.innerHTML = '<span class="text-white text-2xl">🏍️</span>';
      
      riderMarker.current = new mapboxgl.Marker(riderEl)
        .setLngLat([riderLng, riderLat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3 class="font-semibold">Rider Location</h3><p class="text-sm">Live tracking</p>'))
        .addTo(map.current);
      
      // Center map on rider
      map.current.flyTo({
        center: [riderLng, riderLat],
        zoom: 14,
        essential: true
      });
    } else {
      // Smoothly move marker to new position
      riderMarker.current.setLngLat([riderLng, riderLat]);
      
      // Keep rider in view
      map.current.panTo([riderLng, riderLat]);
    }

    // Draw route if all coordinates available
    if (map.current && restaurantLat && restaurantLng && customerLat && customerLng) {
      const coordinates = [
        [restaurantLng, restaurantLat],
        [riderLng, riderLat],
        [customerLng, customerLat]
      ];

      if (map.current.getSource('route')) {
        (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        });
      } else {
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates
              }
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10b981',
            'line-width': 4,
            'line-dasharray': [2, 2]
          }
        });
      }
    }
  }, [riderLat, riderLng, restaurantLat, restaurantLng, customerLat, customerLng]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      {!riderLat && (
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground font-medium">
            Waiting for rider location...
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
