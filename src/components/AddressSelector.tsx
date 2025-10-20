import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Custom draggable marker icon
const customIcon = L.divIcon({
  html: `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 0C15.168 0 8 7.168 8 16C8 28 24 48 24 48C24 48 40 28 40 16C40 7.168 32.832 0 24 0Z" fill="hsl(15 75% 55%)"/>
      <circle cx="24" cy="16" r="6" fill="white"/>
    </svg>
  `,
  className: 'custom-pin-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

// Component to handle map clicks
function MapClickHandler({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Draggable marker component
function DraggableMarker({ 
  position, 
  onDragEnd 
}: { 
  position: [number, number]; 
  onDragEnd: (lat: number, lng: number) => void 
}) {
  const markerRef = useRef<L.Marker>(null);

  return (
    <Marker
      draggable={true}
      position={position}
      icon={customIcon}
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker) {
            const pos = marker.getLatLng();
            onDragEnd(pos.lat, pos.lng);
          }
        },
      }}
    />
  );
}

export default function AddressSelector({ 
  open, 
  onOpenChange, 
  onSelectAddress,
  initialAddress 
}: AddressSelectorProps) {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([33.5731, -7.5898]); // Casablanca default
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapKey, setMapKey] = useState(0);

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
        setMapKey(prev => prev + 1); // Force map re-render with new center
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
        setMapKey(prev => prev + 1); // Force map re-render with new center
        
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

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedCoords([lat, lng]);
    await reverseGeocode(lat, lng);
  };

  const handleMarkerDragEnd = async (lat: number, lng: number) => {
    setSelectedCoords([lat, lng]);
    await reverseGeocode(lat, lng);
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
          <div className="flex-1 w-full">
            {open && (
              <MapContainer
                key={mapKey}
                center={selectedCoords}
                zoom={14}
                className="h-full w-full"
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
                <DraggableMarker position={selectedCoords} onDragEnd={handleMarkerDragEnd} />
              </MapContainer>
            )}
          </div>

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
