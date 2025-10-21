import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

export default function CartButton() {
  const { getTotalItems, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const itemCount = getTotalItems();
  const total = getTotalPrice();

  if (itemCount === 0) return null;

  return (
    <Button
      onClick={() => navigate('/checkout')}
      size="lg"
      className="fixed bottom-6 right-6 z-50 shadow-lg"
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5 mr-2" />
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
          >
            {itemCount}
          </Badge>
        )}
      </div>
      <span className="ml-2">{total.toFixed(2)} MAD</span>
    </Button>
  );
}
