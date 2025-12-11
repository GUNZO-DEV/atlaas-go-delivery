import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Split, CheckCircle, Printer } from "lucide-react";

interface LynBillSplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  guestsCount: number;
  onPaySplit: (splits: any[]) => void;
}

const LynBillSplitDialog = ({ 
  open, onOpenChange, order, guestsCount, onPaySplit 
}: LynBillSplitDialogProps) => {
  const [splitType, setSplitType] = useState<"equal" | "custom" | "items">("equal");
  const [customAmounts, setCustomAmounts] = useState<number[]>(
    Array(guestsCount).fill(order.total / guestsCount)
  );
  const [selectedItems, setSelectedItems] = useState<Record<number, number[]>>({});

  const items = (order.items || []) as any[];
  const total = order.total || 0;

  // Equal split calculation
  const equalSplit = total / guestsCount;

  // Update custom amounts count when guests change
  const adjustGuestSplits = (count: number) => {
    const newAmounts = Array(count).fill(total / count);
    setCustomAmounts(newAmounts);
  };

  // Calculate remaining for custom split
  const customTotal = customAmounts.reduce((sum, amt) => sum + (amt || 0), 0);
  const customRemaining = total - customTotal;

  // Toggle item selection for a guest
  const toggleItemForGuest = (guestIndex: number, itemIndex: number) => {
    const current = selectedItems[guestIndex] || [];
    if (current.includes(itemIndex)) {
      setSelectedItems({
        ...selectedItems,
        [guestIndex]: current.filter(i => i !== itemIndex)
      });
    } else {
      setSelectedItems({
        ...selectedItems,
        [guestIndex]: [...current, itemIndex]
      });
    }
  };

  // Calculate item-based split totals
  const getItemSplitTotal = (guestIndex: number) => {
    const itemIndexes = selectedItems[guestIndex] || [];
    return itemIndexes.reduce((sum, idx) => {
      const item = items[idx];
      return sum + (item ? item.price * item.quantity : 0);
    }, 0);
  };

  const handlePrintSplit = (guestIndex: number, amount: number) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Split Bill - Guest ${guestIndex + 1}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 280px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .total { font-size: 18px; font-weight: bold; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SPLIT BILL</h2>
            <p>Guest ${guestIndex + 1} of ${guestsCount}</p>
          </div>
          <div class="divider"></div>
          <p>Table: ${order.table_number}</p>
          <p>Receipt: ${order.receipt_number}</p>
          <div class="divider"></div>
          ${splitType === "items" ? `
            <p><strong>Items:</strong></p>
            ${(selectedItems[guestIndex] || []).map(idx => {
              const item = items[idx];
              return item ? `<p>${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(0)} DH</p>` : '';
            }).join('')}
          ` : `
            <p>Split Type: ${splitType === "equal" ? "Equal Split" : "Custom Amount"}</p>
          `}
          <div class="divider"></div>
          <div class="total">
            AMOUNT DUE: ${amount.toFixed(0)} DH
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Split className="h-5 w-5" />
            Split Bill - {total.toFixed(0)} DH
          </DialogTitle>
        </DialogHeader>

        {/* Split Type Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={splitType === "equal" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setSplitType("equal")}
          >
            <Users className="h-4 w-4 mr-1" />
            Equal
          </Button>
          <Button
            variant={splitType === "custom" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setSplitType("custom")}
          >
            Custom
          </Button>
          <Button
            variant={splitType === "items" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setSplitType("items")}
          >
            By Items
          </Button>
        </div>

        <ScrollArea className="max-h-[400px]">
          {/* Equal Split */}
          {splitType === "equal" && (
            <div className="space-y-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Each guest pays</p>
                <p className="text-3xl font-bold">{equalSplit.toFixed(0)} DH</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {Array(guestsCount).fill(0).map((_, index) => (
                  <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">Guest {index + 1}</p>
                      <p className="text-lg font-bold text-primary">{equalSplit.toFixed(0)} DH</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handlePrintSplit(index, equalSplit)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Split */}
          {splitType === "custom" && (
            <div className="space-y-3">
              {customRemaining !== 0 && (
                <Badge variant={customRemaining > 0 ? "destructive" : "default"} className="w-full justify-center py-1">
                  {customRemaining > 0 ? `${customRemaining.toFixed(0)} DH remaining` : `${Math.abs(customRemaining).toFixed(0)} DH over`}
                </Badge>
              )}
              
              {customAmounts.map((amount, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                  <span className="font-medium w-20">Guest {index + 1}</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const newAmounts = [...customAmounts];
                      newAmounts[index] = parseFloat(e.target.value) || 0;
                      setCustomAmounts(newAmounts);
                    }}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">DH</span>
                  <Button size="sm" variant="outline" onClick={() => handlePrintSplit(index, amount)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Item-based Split */}
          {splitType === "items" && (
            <div className="space-y-4">
              {Array(guestsCount).fill(0).map((_, guestIndex) => (
                <div key={guestIndex} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Guest {guestIndex + 1}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getItemSplitTotal(guestIndex).toFixed(0)} DH
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handlePrintSplit(guestIndex, getItemSplitTotal(guestIndex))}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {items.map((item, itemIndex) => {
                      const isSelected = (selectedItems[guestIndex] || []).includes(itemIndex);
                      return (
                        <Badge
                          key={itemIndex}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleItemForGuest(guestIndex, itemIndex)}
                        >
                          {item.name} ({(item.price * item.quantity).toFixed(0)})
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700" 
            onClick={() => {
              const splits = splitType === "equal" 
                ? Array(guestsCount).fill(equalSplit)
                : splitType === "custom"
                ? customAmounts
                : Array(guestsCount).fill(0).map((_, i) => getItemSplitTotal(i));
              onPaySplit(splits);
              onOpenChange(false);
            }}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirm Split
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LynBillSplitDialog;
