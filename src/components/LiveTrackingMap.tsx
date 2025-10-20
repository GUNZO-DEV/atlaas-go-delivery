import { useEffect, useRef } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';

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
  const map = useRef<atlas.Map | null>(null);
  const riderMarker = useRef<atlas.HtmlMarker | null>(null);
  const restaurantMarker = useRef<atlas.HtmlMarker | null>(null);
  const customerMarker = useRef<atlas.HtmlMarker | null>(null);
  const lineLayer = useRef<atlas.layer.LineLayer | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on Morocco
    map.current = new atlas.Map(mapContainer.current, {
      center: [-6.8498, 34.0209],
      zoom: 12,
      language: 'en-US',
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: import.meta.env.VITE_AZURE_MAPS_KEY || ''
      }
    });

    map.current.events.add('ready', () => {
      if (!map.current) return;

      // Add zoom controls
      map.current.controls.add(new atlas.control.ZoomControl(), {
        position: atlas.ControlPosition.TopRight
      });

      // Add restaurant marker
      if (restaurantLat && restaurantLng) {
        const restaurantEl = document.createElement('div');
        restaurantEl.className = 'w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg';
        restaurantEl.innerHTML = '<span class="text-white text-xl">🍽️</span>';
        
        restaurantMarker.current = new atlas.HtmlMarker({
          position: [restaurantLng, restaurantLat],
          htmlContent: restaurantEl.outerHTML,
          popup: new atlas.Popup({
            content: '<div class="p-2"><h3 class="font-semibold">Restaurant</h3></div>',
            pixelOffset: [0, -30]
          })
        });
        map.current.markers.add(restaurantMarker.current);
      }

      // Add customer marker
      if (customerLat && customerLng) {
        const customerEl = document.createElement('div');
        customerEl.className = 'w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg';
        customerEl.innerHTML = '<span class="text-white text-xl">📍</span>';
        
        customerMarker.current = new atlas.HtmlMarker({
          position: [customerLng, customerLat],
          htmlContent: customerEl.outerHTML,
          popup: new atlas.Popup({
            content: `<div class="p-2"><h3 class="font-semibold">Delivery Location</h3><p class="text-sm">${deliveryAddress || ''}</p></div>`,
            pixelOffset: [0, -30]
          })
        });
        map.current.markers.add(customerMarker.current);
      }
    });

    return () => {
      map.current?.dispose();
    };
  }, []);

  // Update rider marker position in real-time
  useEffect(() => {
    if (!map.current || !riderLat || !riderLng) return;

    map.current.events.add('ready', () => {
      if (!map.current) return;

      if (!riderMarker.current) {
        const riderEl = document.createElement('div');
        riderEl.className = 'w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-pulse';
        riderEl.innerHTML = '<span class="text-white text-2xl">🏍️</span>';
        
        riderMarker.current = new atlas.HtmlMarker({
          position: [riderLng, riderLat],
          htmlContent: riderEl.outerHTML,
          popup: new atlas.Popup({
            content: '<div class="p-2"><h3 class="font-semibold">Rider Location</h3><p class="text-sm">Live tracking</p></div>',
            pixelOffset: [0, -30]
          })
        });
        map.current.markers.add(riderMarker.current);
        
        // Center map on rider
        map.current.setCamera({
          center: [riderLng, riderLat],
          zoom: 14
        });
      } else {
        // Update marker position
        riderMarker.current.setOptions({
          position: [riderLng, riderLat]
        });
        
        // Keep rider in view
        map.current.setCamera({
          center: [riderLng, riderLat]
        });
      }

      // Draw route if all coordinates available
      if (restaurantLat && restaurantLng && customerLat && customerLng) {
        const dataSource = map.current.sources.getById('route-source') as atlas.source.DataSource;
        
        if (dataSource) {
          dataSource.clear();
          dataSource.add(new atlas.data.LineString([
            [restaurantLng, restaurantLat],
            [riderLng, riderLat],
            [customerLng, customerLat]
          ]));
        } else {
          const newDataSource = new atlas.source.DataSource('route-source');
          map.current.sources.add(newDataSource);
          
          newDataSource.add(new atlas.data.LineString([
            [restaurantLng, restaurantLat],
            [riderLng, riderLat],
            [customerLng, customerLat]
          ]));
          
          lineLayer.current = new atlas.layer.LineLayer(newDataSource, 'route-layer', {
            strokeColor: '#10b981',
            strokeWidth: 4,
            strokeDashArray: [2, 2]
          });
          map.current.layers.add(lineLayer.current);
        }
      }
    });
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
