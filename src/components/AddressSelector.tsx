import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Navigation, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBSLCUfwLEVtlKj531pvyeEygQDkED3-zU';

interface AddressSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
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

export default function AddressSelector({
  open,
  onOpenChange,
  onSelectAddress,
  initialAddress,
}: AddressSelectorProps) {
  const { toast } = useToast();
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const mapRef = useRef<google.maps.Map | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(defaultCenter);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'FoodDeliveryApp/1.0' } }
      );
      if (!response.ok) throw new Error('Reverse geocoding failed');
      const data = await response.json();
      if (data.display_name) {
        setSelectedAddress(data.display_name);
      }
    } catch {
      toast({ title: 'Geocoding failed', description: 'Unable to get address.', variant: 'destructive' });
    }
  };

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedCoords({ lat, lng });
      await reverseGeocode(lat, lng);
    }
  }, []);

  const handleMarkerDragEnd = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedCoords({ lat, lng });
      await reverseGeocode(lat, lng);
    }
  }, []);

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ma&limit=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'FoodDeliveryApp/1.0' } }
      );
      const data = await response.json();
      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setSelectedCoords({ lat, lng });
        setSelectedAddress(data[0].display_name);
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(16);
        toast({ title: 'Address found!' });
      } else {
        toast({ title: 'Not found', description: 'Try a different search term', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Search failed', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Not supported', variant: 'destructive' });
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedCoords({ lat, lng });
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(16);
        await reverseGeocode(lat, lng);
        setIsLoadingLocation(false);
        toast({ title: 'Location found!' });
      },
      (error) => {
        const messages: Record<number, string> = {
          1: 'Location access denied.',
          2: 'Location unavailable.',
          3: 'Request timed out.',
        };
        toast({ title: 'Cannot access location', description: messages[error.code] || 'Unknown error', variant: 'destructive' });
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (selectedAddress) {
      onSelectAddress(selectedAddress, selectedCoords.lat, selectedCoords.lng);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Select Delivery Address</DialogTitle>
          <DialogDescription>Search for your address or drag the pin to your exact location</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pb-4 space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for an address in Morocco..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
                  className="pl-9"
                />
              </div>
              <Button onClick={searchAddress} disabled={isSearching} variant="secondary">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={getCurrentLocation} disabled={isLoadingLocation} className="w-full">
              {isLoadingLocation ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Navigation className="h-4 w-4 mr-2" />}
              Use Current Location
            </Button>
          </div>

          <div className="flex-1 w-full min-h-[400px]">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={selectedCoords}
                zoom={14}
                onLoad={onLoad}
                onClick={handleMapClick}
                options={mapOptions}
              >
                <Marker
                  position={selectedCoords}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                  title="Delivery Location"
                />
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

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
            <Button onClick={handleConfirm} disabled={!selectedAddress} className="w-full" size="lg">
              Confirm Delivery Address
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
