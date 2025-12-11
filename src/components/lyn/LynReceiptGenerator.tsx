import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Printer, Download, X } from "lucide-react";

interface LynReceiptGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  restaurant: any;
}

const LynReceiptGenerator = ({ open, onOpenChange, order, restaurant }: LynReceiptGeneratorProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const items = (order.items || []) as any[];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && receiptRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${order.receipt_number}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                padding: 20px;
                max-width: 300px;
                margin: 0 auto;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .text-sm { font-size: 12px; }
              .text-lg { font-size: 18px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-4 { margin-bottom: 16px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .border-dashed { border-top: 1px dashed #000; }
              .flex { display: flex; justify-content: space-between; }
              @media print {
                body { print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadReceipt = () => {
    const receiptContent = `
========================================
           ${restaurant.name}
========================================
${restaurant.address}
Tel: ${restaurant.phone}

Receipt: ${order.receipt_number}
Date: ${format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
Type: ${order.order_type.replace("_", " ").toUpperCase()}
${order.table_number ? `Table: ${order.table_number}` : ""}
${order.customer_name ? `Customer: ${order.customer_name}` : ""}
----------------------------------------
ITEMS:
${items.map((item: any) => `${item.quantity}x ${item.name}`.padEnd(25) + `${(item.price * item.quantity).toFixed(2)} DH`).join('\n')}
----------------------------------------
Subtotal:${Number(order.subtotal).toFixed(2).padStart(20)} DH
${Number(order.discount) > 0 ? `Discount:${(-Number(order.discount)).toFixed(2).padStart(20)} DH\n` : ""}
TOTAL:${Number(order.total).toFixed(2).padStart(23)} DH
----------------------------------------
Payment: ${order.payment_method?.toUpperCase()}
Status: ${order.payment_status?.toUpperCase()}
========================================
        Thank you for dining with us!
           See you again soon!
========================================
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Receipt Preview</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div 
          ref={receiptRef}
          className="bg-white text-black p-4 rounded-lg font-mono text-sm"
          style={{ minWidth: "280px" }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">{restaurant.name}</h2>
            <p className="text-xs">{restaurant.address}</p>
            <p className="text-xs">Tel: {restaurant.phone}</p>
          </div>

          <div className="border-t border-dashed border-black py-2">
            <p className="font-bold">{order.receipt_number}</p>
            <p className="text-xs">
              {format(new Date(order.created_at), "MMM d, yyyy • HH:mm")}
            </p>
            <p className="text-xs capitalize">Type: {order.order_type.replace("_", " ")}</p>
            {order.table_number && (
              <p className="text-xs">Table: {order.table_number}</p>
            )}
            {order.customer_name && (
              <p className="text-xs">Customer: {order.customer_name}</p>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-black py-2">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-black py-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{Number(order.subtotal).toFixed(2)} DH</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{Number(order.discount).toFixed(2)} DH</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base mt-1">
              <span>TOTAL</span>
              <span>{Number(order.total).toFixed(2)} DH</span>
            </div>
          </div>

          {/* Payment */}
          <div className="border-t border-dashed border-black py-2 text-xs">
            <p>Payment: {order.payment_method?.toUpperCase()}</p>
            <p>Status: {order.payment_status?.toUpperCase()}</p>
          </div>

          {/* Footer */}
          <div className="border-t border-dashed border-black py-2 text-center text-xs">
            <p>Thank you for dining with us!</p>
            <p>See you again soon!</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="flex-1" onClick={downloadReceipt}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LynReceiptGenerator;
