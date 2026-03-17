import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Upload, ScanText, Check, X, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface ParsedMenuItem {
  name: string;
  price: number | null;
  description: string;
  category: string;
}

interface MenuOCRUploadProps {
  restaurantId: string;
  onItemsAdded?: (count: number) => void;
}

export default function MenuOCRUpload({ restaurantId, onItemsAdded }: MenuOCRUploadProps) {
  const [scanning, setScanning] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedMenuItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    setScanning(true);
    setParsedItems([]);
    setRawText("");

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in first');
        return;
      }

      const response = await supabase.functions.invoke('ocr-menu', {
        body: { imageBase64: base64 },
      });

      if (response.error) throw response.error;

      const result = response.data;
      setRawText(result.rawText || '');
      setParsedItems(result.items || []);

      if (result.items?.length > 0) {
        toast.success(`Found ${result.items.length} menu items!`);
      } else {
        toast.info('No menu items detected. Try a clearer image.');
      }
    } catch (error: any) {
      console.error('OCR error:', error);
      toast.error(error.message || 'Failed to scan menu');
    } finally {
      setScanning(false);
    }
  };

  const updateItem = (index: number, field: keyof ParsedMenuItem, value: string | number | null) => {
    setParsedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const saveItems = async () => {
    if (parsedItems.length === 0) return;
    setSaving(true);

    try {
      const itemsToInsert = parsedItems
        .filter(item => item.name && item.price !== null && item.price > 0)
        .map(item => ({
          restaurant_id: restaurantId,
          name: item.name,
          price: item.price!,
          description: item.description || null,
          category: item.category || 'General',
          is_available: true,
        }));

      if (itemsToInsert.length === 0) {
        toast.error('No valid items to save. Each item needs a name and price.');
        return;
      }

      const { error } = await supabase.from('menu_items').insert(itemsToInsert);
      if (error) throw error;

      toast.success(`${itemsToInsert.length} menu items added!`);
      setParsedItems([]);
      setRawText("");
      onItemsAdded?.(itemsToInsert.length);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save menu items');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanText className="h-5 w-5 text-primary" />
          Menu Scanner (OCR)
        </CardTitle>
        <CardDescription>
          Upload a photo of your physical menu and we'll automatically extract items, prices, and categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
          {scanning ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Scanning menu image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-3">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Take a photo or upload menu image</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JPG, PNG • Max 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Parsed Items */}
        {parsedItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Detected Items ({parsedItems.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParsedItems([])}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={saveItems}
                  disabled={saving}
                >
                  {saving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /> Save All to Menu</>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {parsedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {item.category}
                  </Badge>
                  
                  {editingIndex === index ? (
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        value={item.price ?? ''}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || null)}
                        placeholder="Price"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      )}
                    </div>
                  )}

                  <span className="font-semibold text-primary shrink-0">
                    {item.price != null ? `${item.price} MAD` : '—'}
                  </span>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Text Preview */}
        {rawText && parsedItems.length === 0 && (
          <div className="space-y-2">
            <Label>Detected Text</Label>
            <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap max-h-[200px] overflow-y-auto">
              {rawText}
            </pre>
            <p className="text-xs text-muted-foreground">
              No menu items could be automatically parsed. You can add items manually.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
