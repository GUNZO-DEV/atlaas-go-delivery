import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Navigation, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface AddressSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
}

// Custom draggable marker icon with inline styles to ensure visibility
const customIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 48px; height: 48px;">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
        <path d="M24 0C15.168 0 8 7.168 8 16C8 28 24 48 24 48C24 48 40 28 40 16C40 7.168 32.832 0 24 0Z" fill="#f97316"/>
        <circle cx="24" cy="16" r="6" fill="white"/>
      </svg>
    </div>
  `,
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

export default function AddressSelector({ 
  open, 
  onOpenChange, 
  onSelectAddress,
  initialAddress 
}: AddressSelectorProps) {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([33.5731, -7.5898]); // Casablanca default
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!open || !mapContainer.current || map.current) return;

    // Create map
    map.current = L.map(mapContainer.current).setView(selectedCoords, 14);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    // Add draggable marker
    marker.current = L.marker(selectedCoords, {
      icon: customIcon,
      draggable: true
    }).addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', async () => {
      if (marker.current) {
        const pos = marker.current.getLatLng();
        setSelectedCoords([pos.lat, pos.lng]);
        await reverseGeocode(pos.lat, pos.lng);
      }
    });

    // Handle map click
    map.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords([lat, lng]);
      marker.current?.setLatLng([lat, lng]);
      await reverseGeocode(lat, lng);
    });

    // Get initial address
    reverseGeocode(selectedCoords[0], selectedCoords[1]);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [open]);

  // Update marker position when coords change
  useEffect(() => {
    if (map.current && marker.current) {
      marker.current.setLatLng(selectedCoords);
      map.current.setView(selectedCoords, 14);
    }
  }, [selectedCoords]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          }
        }
      );
      const data = await response.json();
      
      if (data.display_name) {
        setSelectedAddress(data.display_name);
      } else {
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ma&addressdetails=1&limit=1`,
        {
          headers: {
            'Accept-Language': 'en',
          }
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        setSelectedCoords([lat, lng]);
        setSelectedAddress(data[0].display_name);
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
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setSelectedCoords([lat, lng]);
        await reverseGeocode(lat, lng);
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
      onSelectAddress(selectedAddress, selectedCoords[0], selectedCoords[1]);
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
