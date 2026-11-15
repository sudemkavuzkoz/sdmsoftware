'use client';

import React, { createContext, useContext, useState, useSyncExternalStore } from 'react';
import { Product, CartItem, LicenseTier } from '@/lib/types';

const CART_STORAGE_KEY = 'sdm_cart';
const CART_CHANGE_EVENT = 'sdm-cart-change';
const EMPTY_CART: CartItem[] = [];

let cachedCartRaw: string | null | undefined;
let cachedCartItems: CartItem[] = EMPTY_CART;

function subscribeCart(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener();
  window.addEventListener(CART_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw === cachedCartRaw) {
      return cachedCartItems;
    }
    cachedCartRaw = raw;
    if (!raw) {
      cachedCartItems = EMPTY_CART;
      return cachedCartItems;
    }
    const parsed = JSON.parse(raw);
    cachedCartItems = Array.isArray(parsed) ? parsed : EMPTY_CART;
    return cachedCartItems;
  } catch {
    cachedCartItems = EMPTY_CART;
    return cachedCartItems;
  }
}

function getCartServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function updateStoredCart(updater: (prev: CartItem[]) => CartItem[]) {
  const next = updater(getCartSnapshot());
  try {
    const serialized = JSON.stringify(next);
    localStorage.setItem(CART_STORAGE_KEY, serialized);
    cachedCartRaw = serialized;
    cachedCartItems = next;
  } catch {
    cachedCartItems = next;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  }
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, licenseTier?: LicenseTier) => void;
  removeFromCart: (productId: string, licenseTier: LicenseTier) => void;
  updateQuantity: (productId: string, licenseTier: LicenseTier, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  couponCode: string;
  discountRate: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  const calculateTierPrice = (basePrice: number, tier: LicenseTier): number => {
    switch (tier) {
      case 'standard':
        return basePrice;
      case 'commercial':
        return Math.round(basePrice * 1.5);
      case 'extended':
        return Math.round(basePrice * 2.5);
      default:
        return basePrice;
    }
  };

  const addToCart = (product: Product, licenseTier: LicenseTier = 'standard') => {
    const unitPrice = calculateTierPrice(product.price, licenseTier);

    updateStoredCart(prev => {
      const existingIdx = prev.findIndex(
        i => i.product.id === product.id && i.licenseTier === licenseTier
      );

      if (existingIdx > -1) {
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { product, licenseTier, unitPrice, quantity: 1 }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, licenseTier: LicenseTier) => {
    updateStoredCart(prev =>
      prev.filter(i => !(i.product.id === productId && i.licenseTier === licenseTier))
    );
  };

  const updateQuantity = (productId: string, licenseTier: LicenseTier, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, licenseTier);
      return;
    }
    updateStoredCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.licenseTier === licenseTier
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    updateStoredCart(() => EMPTY_CART);
    setCouponCode('');
    setDiscountRate(0);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SDM10' || clean === 'YAZILIM10') {
      setCouponCode(clean);
      setDiscountRate(0.10);
      return { success: true, message: '%10 İndirim kuponu başarıyla uygulandı!' };
    }
    if (clean === 'SDM20') {
      setCouponCode(clean);
      setDiscountRate(0.20);
      return { success: true, message: '%20 VIP İndirim kuponu uygulandı!' };
    }
    return { success: false, message: 'Geçersiz kupon kodu. (Deneyin: SDM10 veya SDM20)' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountRate(0);
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
  const discountAmount = Math.round(subtotal * discountRate);
  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        couponCode,
        discountRate,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        total,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
