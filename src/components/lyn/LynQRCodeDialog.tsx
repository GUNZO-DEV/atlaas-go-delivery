import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Printer, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LynQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: {
    id: string;
    name: string;
  };
  table?: {
    id: string;
    table_number: string;
  };
  tables?: Array<{ id: string; table_number: string }>;
}

const LynQRCodeDialog = ({ open, onOpenChange, restaurant, table, tables }: LynQRCodeDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState(table);

  const baseUrl = window.location.origin;
  const currentTable = selectedTable || table;
  const menuUrl = currentTable 
    ? `${baseUrl}/order/${restaurant.id}/${currentTable.table_number}`
    : `${baseUrl}/order/${restaurant.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 500;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 30, 300, 300);
        ctx.font = "bold 24px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(restaurant.name, 200, 380);
        if (currentTable) {
          ctx.font = "20px sans-serif";
          ctx.fillText(`Table ${currentTable.table_number}`, 200, 420);
        }
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText("Scan to order", 200, 460);
      }

      const link = document.createElement("a");
      link.download = `qr-${restaurant.name}${currentTable ? `-table-${currentTable.table_number}` : ""}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const printQR = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${restaurant.name}${currentTable ? ` - Table ${currentTable.table_number}` : ""}</title>
          <style>
            body { 
              font-family: sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0;
            }
            .container {
              text-align: center;
              padding: 40px;
              border: 2px solid #000;
              border-radius: 16px;
            }
            h1 { margin: 20px 0 5px; font-size: 28px; }
            h2 { margin: 0 0 10px; font-size: 22px; color: #666; }
            p { color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${document.getElementById("qr-code-svg")?.outerHTML}
            <h1>${restaurant.name}</h1>
            ${currentTable ? `<h2>Table ${currentTable.table_number}</h2>` : ""}
            <p>Scan to view menu & order</p>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
  };

  // Show table selector if no specific table and tables list available
  const showTableSelector = !table && tables && tables.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentTable ? `Table ${currentTable.table_number} QR Code` : "Select Table"}
          </DialogTitle>
        </DialogHeader>

        {showTableSelector && !selectedTable && (
          <ScrollArea className="max-h-60">
            <div className="grid grid-cols-4 gap-2">
              {tables.map(t => (
                <Button
                  key={t.id}
                  variant="outline"
                  onClick={() => setSelectedTable(t)}
                  className="h-12"
                >
                  {t.table_number}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}

        {(currentTable || !showTableSelector) && (
          <>
            <Card className="bg-white">
              <CardContent className="p-6 flex flex-col items-center">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={menuUrl}
                  size={200}
                  level="H"
                  includeMargin
                />
                <p className="mt-4 font-semibold text-black">{restaurant.name}</p>
                {currentTable && <p className="text-gray-600">Table {currentTable.table_number}</p>}
                <p className="text-xs text-gray-400 mt-2">Scan to order</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={copyLink} className="flex-col h-auto py-3">
                {copied ? <Check className="h-5 w-5 mb-1" /> : <Copy className="h-5 w-5 mb-1" />}
                <span className="text-xs">Copy Link</span>
              </Button>
              <Button variant="outline" onClick={downloadQR} className="flex-col h-auto py-3">
                <Download className="h-5 w-5 mb-1" />
                <span className="text-xs">Download</span>
              </Button>
              <Button variant="outline" onClick={printQR} className="flex-col h-auto py-3">
                <Printer className="h-5 w-5 mb-1" />
                <span className="text-xs">Print</span>
              </Button>
            </div>

            {showTableSelector && selectedTable && (
              <Button variant="ghost" onClick={() => setSelectedTable(undefined)} className="w-full">
                ← Back to table list
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LynQRCodeDialog;
