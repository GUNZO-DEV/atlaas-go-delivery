import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OrderNotesInputProps {
  value: string;
  onChange: (value: string) => void;
}

const OrderNotesInput = ({ value, onChange }: OrderNotesInputProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-primary" />
        <Label htmlFor="order-notes" className="text-base font-semibold">
          Special Instructions (Optional)
        </Label>
      </div>
      <Textarea
        id="order-notes"
        placeholder="E.g., 'No sauce', 'Extra spicy', 'Please ring doorbell', etc."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] resize-none"
        maxLength={500}
      />
      <p className="text-xs text-muted-foreground mt-2">
        {value.length}/500 characters
      </p>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground">💡 Quick examples:</p>
        <div className="flex flex-wrap gap-2">
          {["No onions", "Extra spicy 🌶️", "Leave at door", "Call on arrival"].map((example) => (
            <button
              key={example}
              onClick={() => onChange(value ? `${value}, ${example}` : example)}
              className="text-xs px-2 py-1 rounded-md bg-accent hover:bg-accent/80 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default OrderNotesInput;