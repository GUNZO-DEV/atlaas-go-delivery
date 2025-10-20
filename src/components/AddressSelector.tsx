import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Navigation, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddressSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
}

export default function AddressSelector({ 
  open, 
  onOpenChange, 
  onSelectAddress,
  initialAddress 
}: AddressSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([-7.5898, 33.5731]); // Casablanca default
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (!open || !mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: selectedCoords,
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add draggable marker
    const el = document.createElement('div');
    el.className = 'w-12 h-12 flex items-center justify-center';
    el.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 0C15.168 0 8 7.168 8 16C8 28 24 48 24 48C24 48 40 28 40 16C40 7.168 32.832 0 24 0Z" fill="hsl(15 75% 55%)"/>
        <circle cx="24" cy="16" r="6" fill="white"/>
      </svg>
    `;

    marker.current = new mapboxgl.Marker({
      element: el,
      draggable: true,
    })
      .setLngLat(selectedCoords)
      .addTo(map.current);

    // Update address when marker is dragged
    marker.current.on('dragend', async () => {
      const lngLat = marker.current!.getLngLat();
      setSelectedCoords([lngLat.lng, lngLat.lat]);
      await reverseGeocode(lngLat.lng, lngLat.lat);
    });

    // Update address when map is clicked
    map.current.on('click', async (e) => {
      marker.current?.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      setSelectedCoords([e.lngLat.lng, e.lngLat.lat]);
      await reverseGeocode(e.lngLat.lng, e.lngLat.lat);
    });

    // Get initial address for default location
    reverseGeocode(selectedCoords[0], selectedCoords[1]);

    return () => {
      map.current?.remove();
    };
  }, [open]);

  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      console.log('Starting reverse geocode with:', { lng, lat });
      console.log('Mapbox token:', mapboxgl.accessToken ? 'Token exists' : 'NO TOKEN');
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      console.log('Geocoding response:', data);
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        console.log('Setting address:', address);
        setSelectedAddress(address);
      } else {
        console.error('No features in geocoding response');
        toast({
          title: 'Address not found',
          description: 'Unable to determine address for this location',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast({
        title: 'Geocoding failed',
        description: 'Unable to get address. Please search manually.',
        variant: 'destructive',
      });
    }
  };

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=MA&proximity=-7.5898,33.5731`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setSelectedCoords([lng, lat]);
        setSelectedAddress(data.features[0].place_name);
        
        // Update map and marker
        map.current?.flyTo({ center: [lng, lat], zoom: 15 });
        marker.current?.setLngLat([lng, lat]);
      } else {
        toast({
          title: 'Address not found',
          description: 'Please try a different search term',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Unable to search for address',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;
        
        setSelectedCoords([lng, lat]);
        map.current?.flyTo({ center: [lng, lat], zoom: 15 });
        marker.current?.setLngLat([lng, lat]);
        
        await reverseGeocode(lng, lat);
        setIsLoadingLocation(false);
        
        toast({
          title: 'Location found!',
          description: 'Using your current location',
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Please enable location access in your browser settings';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again or search for your address.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        toast({
          title: 'Cannot access location',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleConfirm = () => {
    if (selectedAddress) {
      onSelectAddress(selectedAddress, selectedCoords[1], selectedCoords[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Select Delivery Address</DialogTitle>
          <DialogDescription>
            Search for your address or drag the pin to your exact location
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="px-6 pb-4 space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for an address in Morocco..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                  className="pl-9"
                />
              </div>
              <Button 
                onClick={searchAddress} 
                disabled={isSearching}
                variant="secondary"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full"
            >
              {isLoadingLocation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Use Current Location
            </Button>
          </div>

          {/* Map */}
          <div ref={mapContainer} className="flex-1 w-full" />

          {/* Address Display & Confirm */}
          <div className="p-6 pt-4 border-t bg-background">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">Selected Address</p>
                <p className="text-sm text-muted-foreground break-words">
                  {selectedAddress || 'Drag the pin to select your delivery address'}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedAddress}
              className="w-full"
              size="lg"
            >
              Confirm Delivery Address
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
