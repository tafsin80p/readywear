"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "./ToastContext";

export interface CartItem {
  id: string; // unique id based on product id + size + color
  productId: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  items: CartItem[];
  addToCart: (product: any, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  // Optional: Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('readywear_cart');
    if (savedCart) {
      try { setItems(JSON.parse(savedCart)); } catch (e) {}
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    localStorage.setItem('readywear_cart', JSON.stringify(items));
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: any, quantity = 1, size?: string, color?: string) => {
    const cartItemId = `${product.id}-${size || 'default'}-${color || 'default'}`;
    
    setItems(prev => {
      const existingItem = prev.find(item => item.id === cartItemId);
      if (existingItem) {
        return prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, {
        id: cartItemId,
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity,
        size,
        color
      }];
    });
    
    toast(`${product.title} কার্টে যোগ করা হয়েছে!`);
    openCart(); // Open sidebar when item is added
  };

  const removeFromCart = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      toast(`${item.title} কার্ট থেকে মুছে ফেলা হয়েছে!`, "info");
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      isCartOpen, openCart, closeCart, 
      items, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
