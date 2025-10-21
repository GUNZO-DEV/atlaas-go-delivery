import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  specialInstructions?: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateInstructions: (menuItemId: string, instructions: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    // If cart has items from a different restaurant, clear it
    if (restaurantId && restaurantId !== newItem.restaurantId) {
      if (!confirm('Your cart contains items from another restaurant. Clear cart and add this item?')) {
        return;
      }
      setItems([]);
    }

    setRestaurantId(newItem.restaurantId);

    setItems(prev => {
      const existingItem = prev.find(item => item.menuItemId === newItem.menuItemId);
      if (existingItem) {
        return prev.map(item =>
          item.menuItemId === newItem.menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.menuItemId !== menuItemId);
      if (filtered.length === 0) {
        setRestaurantId(null);
      }
      return filtered;
    });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateInstructions = (menuItemId: string, instructions: string) => {
    setItems(prev =>
      prev.map(item =>
        item.menuItemId === menuItemId ? { ...item, specialInstructions: instructions } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);

  const getTotalPrice = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        addItem,
        removeItem,
        updateQuantity,
        updateInstructions,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
