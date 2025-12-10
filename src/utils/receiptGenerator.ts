import { format } from "date-fns";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  special_instructions: string | null;
  menu_item: {
    name: string;
    image_url: string | null;
  } | null;
}

export interface ReceiptOrder {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  created_at: string;
  restaurant: {
    name: string;
    image_url: string | null;
  } | null;
  order_items: OrderItem[];
}

export interface ReceiptData {
  order: ReceiptOrder;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export const generateReceiptHTML = (data: ReceiptData): string => {
  const { order, businessName = "Atlaas Go", businessAddress = "Ifrane, Morocco", businessPhone = "+212 XXX XXX XXX" } = data;
  const orderDate = format(new Date(order.created_at), "PPP 'at' p");
  const subtotal = order.total_amount;
  const deliveryFee = order.delivery_fee;
  const total = subtotal + deliveryFee;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - Order #${order.id.slice(0, 8).toUpperCase()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .receipt {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      padding: 24px;
      text-align: center;
    }
    .header h1 { font-size: 24px; margin-bottom: 4px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .order-info {
      padding: 20px;
      background: #fafafa;
      border-bottom: 1px dashed #e5e5e5;
    }
    .order-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .order-info-row:last-child { margin-bottom: 0; }
    .order-info-label { color: #666; }
    .order-info-value { font-weight: 600; color: #333; }
    .restaurant {
      padding: 20px;
      border-bottom: 1px dashed #e5e5e5;
    }
    .restaurant h3 { font-size: 16px; color: #333; margin-bottom: 4px; }
    .restaurant p { font-size: 13px; color: #666; }
    .items {
      padding: 20px;
    }
    .items h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .item:last-of-type { border-bottom: none; }
    .item-details { flex: 1; }
    .item-name { font-weight: 500; color: #333; font-size: 14px; }
    .item-qty { color: #666; font-size: 13px; }
    .item-note { color: #999; font-size: 12px; font-style: italic; margin-top: 2px; }
    .item-price { font-weight: 600; color: #333; font-size: 14px; }
    .totals {
      padding: 20px;
      background: #fafafa;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
    }
    .total-row.final {
      border-top: 2px solid #333;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 700;
    }
    .delivery {
      padding: 20px;
      border-top: 1px dashed #e5e5e5;
    }
    .delivery h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .delivery p { font-size: 14px; color: #333; }
    .footer {
      padding: 20px;
      text-align: center;
      background: #fafafa;
      border-top: 1px dashed #e5e5e5;
    }
    .footer p { font-size: 12px; color: #999; margin-bottom: 4px; }
    .footer .thanks { font-size: 16px; color: #333; font-weight: 600; margin-bottom: 8px; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${businessName}</h1>
      <p>Order Receipt</p>
    </div>
    
    <div class="order-info">
      <div class="order-info-row">
        <span class="order-info-label">Order ID</span>
        <span class="order-info-value">#${order.id.slice(0, 8).toUpperCase()}</span>
      </div>
      <div class="order-info-row">
        <span class="order-info-label">Date</span>
        <span class="order-info-value">${orderDate}</span>
      </div>
      <div class="order-info-row">
        <span class="order-info-label">Status</span>
        <span class="order-info-value" style="color: #22c55e;">✓ Delivered</span>
      </div>
    </div>

    <div class="restaurant">
      <h3>${order.restaurant?.name || 'Restaurant'}</h3>
    </div>

    <div class="items">
      <h3>Order Items</h3>
      ${order.order_items?.map(item => `
        <div class="item">
          <div class="item-details">
            <div class="item-name">${item.menu_item?.name || 'Item'}</div>
            <div class="item-qty">Qty: ${item.quantity}</div>
            ${item.special_instructions ? `<div class="item-note">${item.special_instructions}</div>` : ''}
          </div>
          <div class="item-price">${item.price.toFixed(2)} MAD</div>
        </div>
      `).join('') || '<p style="color: #999; font-size: 14px;">No items</p>'}
    </div>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)} MAD</span>
      </div>
      <div class="total-row">
        <span>Delivery Fee</span>
        <span>${deliveryFee.toFixed(2)} MAD</span>
      </div>
      <div class="total-row final">
        <span>Total</span>
        <span>${total.toFixed(2)} MAD</span>
      </div>
    </div>

    <div class="delivery">
      <h3>Delivery Address</h3>
      <p>${order.delivery_address}</p>
    </div>

    <div class="footer">
      <p class="thanks">Thank you for your order!</p>
      <p>${businessName}</p>
      <p>${businessAddress}</p>
      <p>${businessPhone}</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const downloadReceipt = (order: ReceiptOrder) => {
  const html = generateReceiptHTML({ order });
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new window for printing
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
  
  // Clean up the URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const shareReceipt = async (order: ReceiptOrder): Promise<boolean> => {
  const total = (order.total_amount + order.delivery_fee).toFixed(2);
  const shareData = {
    title: `Order Receipt - ${order.restaurant?.name || 'Atlaas Go'}`,
    text: `Order #${order.id.slice(0, 8).toUpperCase()} from ${order.restaurant?.name || 'Restaurant'}\nTotal: ${total} MAD\nDelivered to: ${order.delivery_address}`,
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      return false;
    }
  }
  
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareData.text);
    return true;
  } catch {
    return false;
  }
};
