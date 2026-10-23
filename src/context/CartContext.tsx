'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, LicenseTier } from '@/lib/types';

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
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  // localStorage Senkronizasyonu
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sdm_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // LocalStorage okuma hatası yok sayılır
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sdm_cart', JSON.stringify(items));
    } catch {
      // Hata yok sayılır
    }
  }, [items]);

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

    setItems(prev => {
      const existingIdx = prev.findIndex(
        i => i.product.id === product.id && i.licenseTier === licenseTier
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }

      return [...prev, { product, licenseTier, unitPrice, quantity: 1 }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, licenseTier: LicenseTier) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.licenseTier === licenseTier)));
  };

  const updateQuantity = (productId: string, licenseTier: LicenseTier, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, licenseTier);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId && item.licenseTier === licenseTier
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
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
