"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "./ToastContext";

export interface CartItem {
  id: string; // unique id based on product id + size + color
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  attributes?: Record<string, string>;
}

interface CartContextType {
  isLoaded: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  items: CartItem[];
  addToCart: (product: any, quantity?: number, size?: string, color?: string, attributes?: Record<string, string>, openSidebar?: boolean) => void;
  buyNow: (product: any, quantity?: number, size?: string, color?: string, attributes?: Record<string, string>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount & sanitize stale / corrupted items
  useEffect(() => {
    const savedCart = localStorage.getItem('readywear_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Filter out legacy corrupted items where id starts with "undefined"
          const clean = parsed.filter(item => 
            item && item.title && !String(item.id).startsWith("undefined") && item.productId && item.productId !== "undefined"
          );
          setItems(clean);
        }
      } catch (e) {
        setItems([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    localStorage.setItem('readywear_cart', JSON.stringify(items));
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const getProductImage = (product: any) => {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    if (product.image) return product.image;
    return "";
  };

  const addToCart = (product: any, quantity = 1, size?: string, color?: string, attributes?: Record<string, string>, openSidebar = true) => {
    const prodId = String(product._id || product.id || '');
    const attrString = attributes ? Object.entries(attributes).map(([k, v]) => `${k}:${v}`).sort().join('-') : '';
    const cartItemId = `${prodId}-${size || 'default'}-${color || 'default'}${attrString ? `-${attrString}` : ''}`;
    
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
        productId: prodId,
        title: product.name || product.title,
        price: product.price,
        image: getProductImage(product),
        quantity,
        size,
        color,
        attributes
      }];
    });
    
    toast(`${product.name || product.title} কার্টে যোগ করা হয়েছে!`);
    if (openSidebar) {
      openCart();
    }
  };

  const buyNow = (product: any, quantity = 1, size?: string, color?: string, attributes?: Record<string, string>) => {
    const prodId = String(product._id || product.id || '');
    const attrString = attributes ? Object.entries(attributes).map(([k, v]) => `${k}:${v}`).sort().join('-') : '';
    const cartItemId = `${prodId}-${size || 'default'}-${color || 'default'}${attrString ? `-${attrString}` : ''}`;

    const singleItem: CartItem = {
      id: cartItemId,
      productId: prodId,
      title: product.name || product.title,
      price: product.price,
      image: getProductImage(product),
      quantity,
      size,
      color,
      attributes
    };

    // Replaces the cart with only this newly selected product
    setItems([singleItem]);
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

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      isLoaded,
      isCartOpen, openCart, closeCart, 
      items, addToCart, buyNow, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount 
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
