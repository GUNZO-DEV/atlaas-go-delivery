import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Printer, Download, X, ChefHat, Receipt } from "lucide-react";

interface LynReceiptGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  restaurant: any;
}

type ReceiptType = "customer" | "kitchen";
type PaperSize = "80mm" | "58mm";

const LynReceiptGenerator = ({ open, onOpenChange, order, restaurant }: LynReceiptGeneratorProps) => {
  const customerReceiptRef = useRef<HTMLDivElement>(null);
  const kitchenReceiptRef = useRef<HTMLDivElement>(null);
  const [receiptType, setReceiptType] = useState<ReceiptType>("customer");
  const [paperSize, setPaperSize] = useState<PaperSize>("80mm");

  const items = (order.items || []) as any[];
  const paperWidth = paperSize === "80mm" ? "72mm" : "48mm";
  const fontSize = paperSize === "80mm" ? "12px" : "10px";

  const getThermalPrintStyles = (type: ReceiptType) => `
    @page {
      size: ${paperSize} auto;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', 'Lucida Console', Monaco, monospace;
      font-size: ${fontSize};
      line-height: 1.3;
      width: ${paperWidth};
      padding: 2mm;
      color: #000;
      background: #fff;
    }
    .receipt-header {
      text-align: center;
      margin-bottom: 3mm;
    }
    .receipt-title {
      font-size: ${paperSize === "80mm" ? "16px" : "14px"};
      font-weight: bold;
      margin-bottom: 1mm;
    }
    .receipt-subtitle {
      font-size: ${paperSize === "80mm" ? "10px" : "9px"};
    }
    .dashed-line {
      border-top: 1px dashed #000;
      margin: 2mm 0;
    }
    .solid-line {
      border-top: 2px solid #000;
      margin: 2mm 0;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      margin: 1mm 0;
    }
    .item-name {
      flex: 1;
      word-break: break-word;
    }
    .item-qty {
      font-weight: bold;
      min-width: 25px;
    }
    .item-price {
      text-align: right;
      min-width: 45px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: ${paperSize === "80mm" ? "14px" : "12px"};
      margin-top: 2mm;
    }
    .info-row {
      margin: 1mm 0;
    }
    .text-center {
      text-align: center;
    }
    .text-bold {
      font-weight: bold;
    }
    .text-large {
      font-size: ${paperSize === "80mm" ? "18px" : "14px"};
      font-weight: bold;
    }
    .kitchen-item {
      padding: 2mm 0;
      border-bottom: 1px dashed #ccc;
    }
    .kitchen-item:last-child {
      border-bottom: none;
    }
    .kitchen-qty {
      font-size: ${paperSize === "80mm" ? "20px" : "16px"};
      font-weight: bold;
    }
    .kitchen-name {
      font-size: ${paperSize === "80mm" ? "14px" : "12px"};
      font-weight: bold;
    }
    .order-type-badge {
      display: inline-block;
      padding: 1mm 3mm;
      border: 2px solid #000;
      font-weight: bold;
      margin: 2mm 0;
    }
    .notes-section {
      background: #f5f5f5;
      padding: 2mm;
      margin: 2mm 0;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;

  const handlePrint = (type: ReceiptType) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const ref = type === "customer" ? customerReceiptRef : kitchenReceiptRef;
    if (!ref.current) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type === "customer" ? "Customer Receipt" : "Kitchen Ticket"} - ${order.receipt_number}</title>
          <style>${getThermalPrintStyles(type)}</style>
        </head>
        <body>
          ${ref.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const downloadReceipt = () => {
    const receiptContent = `
${"=".repeat(40)}
${restaurant.name.toUpperCase().padStart(20 + restaurant.name.length / 2)}
${"=".repeat(40)}
${restaurant.address}
Tel: ${restaurant.phone}

Receipt: ${order.receipt_number}
Date: ${format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
Type: ${order.order_type.replace("_", " ").toUpperCase()}
${order.table_number ? `Table: ${order.table_number}` : ""}
${order.customer_name ? `Customer: ${order.customer_name}` : ""}
${"-".repeat(40)}
ITEMS:
${items.map((item: any) => 
  `${item.quantity}x ${item.name}`.padEnd(28) + 
  `${(item.price * item.quantity).toFixed(2)} DH`
).join('\n')}
${"-".repeat(40)}
${"Subtotal:".padEnd(28)}${Number(order.subtotal).toFixed(2)} DH
${Number(order.discount) > 0 ? `${"Discount:".padEnd(28)}-${Number(order.discount).toFixed(2)} DH\n` : ""}
${"TOTAL:".padEnd(28)}${Number(order.total).toFixed(2)} DH
${"-".repeat(40)}
Payment: ${order.payment_method?.toUpperCase() || "N/A"}
Status: ${order.payment_status?.toUpperCase() || "PENDING"}
${"=".repeat(40)}
${"Thank you for dining with us!".padStart(34)}
${"See you again soon!".padStart(29)}
${"=".repeat(40)}
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.receipt_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Receipt & Kitchen Ticket</span>
          </DialogTitle>
        </DialogHeader>

        {/* Paper Size Selector */}
        <div className="flex items-center gap-4 mb-2">
          <Label className="text-sm">Paper Size:</Label>
          <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="80mm">80mm (Standard)</SelectItem>
              <SelectItem value="58mm">58mm (Compact)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={receiptType} onValueChange={(v) => setReceiptType(v as ReceiptType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Customer Receipt
            </TabsTrigger>
            <TabsTrigger value="kitchen" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Kitchen Ticket
            </TabsTrigger>
          </TabsList>

          {/* Customer Receipt */}
          <TabsContent value="customer" className="mt-4">
            <div 
              ref={customerReceiptRef}
              className="bg-white text-black p-3 rounded border font-mono text-xs mx-auto"
              style={{ maxWidth: paperSize === "80mm" ? "280px" : "200px" }}
            >
              {/* Header */}
              <div className="text-center mb-3">
                <div className="text-base font-bold">{restaurant.name}</div>
                <div className="text-[10px]">{restaurant.address}</div>
                <div className="text-[10px]">Tel: {restaurant.phone}</div>
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Order Info */}
              <div className="mb-2">
                <div className="font-bold">{order.receipt_number}</div>
                <div className="text-[10px]">
                  {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                </div>
                <div className="inline-block border border-black px-2 py-0.5 text-[10px] font-bold mt-1">
                  {order.order_type.replace("_", " ").toUpperCase()}
                </div>
                {order.table_number && (
                  <div className="text-[10px] mt-1">Table: {order.table_number}</div>
                )}
                {order.customer_name && (
                  <div className="text-[10px]">Client: {order.customer_name}</div>
                )}
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Items */}
              <div className="space-y-1">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="flex-1">
                      <span className="font-bold">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="ml-2">{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{Number(order.subtotal).toFixed(2)} DH</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Remise</span>
                    <span>-{Number(order.discount).toFixed(2)} DH</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>TOTAL</span>
                  <span>{Number(order.total).toFixed(2)} DH</span>
                </div>
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Payment Info */}
              <div className="text-[10px] space-y-0.5">
                <div>Paiement: {order.payment_method?.toUpperCase() || "N/A"}</div>
                <div>Statut: {order.payment_status === "paid" ? "PAYÉ" : "EN ATTENTE"}</div>
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Footer */}
              <div className="text-center text-[10px]">
                <div className="font-bold">Merci de votre visite!</div>
                <div>À bientôt!</div>
              </div>
            </div>

            {/* Customer Actions */}
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={() => handlePrint("customer")}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" onClick={downloadReceipt}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Kitchen Ticket */}
          <TabsContent value="kitchen" className="mt-4">
            <div 
              ref={kitchenReceiptRef}
              className="bg-white text-black p-3 rounded border font-mono text-xs mx-auto"
              style={{ maxWidth: paperSize === "80mm" ? "280px" : "200px" }}
            >
              {/* Kitchen Header */}
              <div className="text-center mb-2">
                <div className="text-lg font-bold">🍳 CUISINE</div>
                <div className="border-2 border-black px-3 py-1 inline-block font-bold text-sm mt-1">
                  {order.order_type.replace("_", " ").toUpperCase()}
                </div>
              </div>

              <div className="border-t-2 border-black my-2" />

              {/* Order Info */}
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-sm">{order.receipt_number}</div>
                <div className="text-[10px]">
                  {format(new Date(order.created_at), "HH:mm")}
                </div>
              </div>

              {order.table_number && (
                <div className="text-center bg-black text-white py-1 font-bold text-sm mb-2">
                  TABLE {order.table_number}
                </div>
              )}

              {order.customer_name && (
                <div className="text-center font-bold mb-2">
                  Client: {order.customer_name}
                </div>
              )}

              <div className="border-t-2 border-black my-2" />

              {/* Items - Large and Clear for Kitchen */}
              <div className="space-y-2">
                {items.map((item: any, index: number) => (
                  <div key={index} className="border-b border-dashed border-gray-400 pb-2 last:border-0">
                    <div className="flex items-start gap-2">
                      <span className="text-xl font-bold min-w-[30px]">{item.quantity}x</span>
                      <span className="text-sm font-bold flex-1">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes Section */}
              {order.notes && (
                <>
                  <div className="border-t-2 border-black my-2" />
                  <div className="bg-yellow-100 p-2 border border-yellow-400">
                    <div className="font-bold text-[10px] mb-1">⚠️ NOTES:</div>
                    <div className="text-xs">{order.notes}</div>
                  </div>
                </>
              )}

              <div className="border-t-2 border-black my-2" />

              {/* Footer */}
              <div className="text-center text-[10px]">
                <div>Total articles: {items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</div>
              </div>
            </div>

            {/* Kitchen Actions */}
            <div className="flex gap-2 mt-4">
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => handlePrint("kitchen")}>
                <ChefHat className="h-4 w-4 mr-2" />
                Imprimer Ticket Cuisine
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Print Both */}
        <div className="border-t pt-4 mt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              handlePrint("kitchen");
              setTimeout(() => handlePrint("customer"), 500);
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer les deux (Cuisine + Client)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LynReceiptGenerator;
