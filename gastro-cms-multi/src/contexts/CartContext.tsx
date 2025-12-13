'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';

// Hilfsfunktion für Steuerberechnung
function calculateTaxBreakdown(items: CartItem[]) {
  let subtotalNet = 0;
  let totalTax = 0;
  const taxGroups: { [key: number]: { amount: number; label: string } } = {};

  items.forEach(item => {
    const itemTotal = item.totalPrice;
    const itemNet = itemTotal / (1 + item.taxRate);
    const itemTax = itemTotal - itemNet;

    subtotalNet += itemNet;
    totalTax += itemTax;

    // Gruppiere nach Steuersätzen
    const rateKey = item.taxRate;
    if (!taxGroups[rateKey]) {
      const label = item.taxRate === 0.10 ? 'MwSt. 10% (Speisen)' :
        item.taxRate === 0.20 ? 'MwSt. 20% (Getränke)' :
          `MwSt. ${(item.taxRate * 100).toFixed(0)}%`;
      taxGroups[rateKey] = { amount: 0, label };
    }
    taxGroups[rateKey].amount += itemTax;
  });

  const taxBreakdown = Object.entries(taxGroups).map(([rate, data]) => ({
    rate: parseFloat(rate),
    amount: Math.round(data.amount * 100) / 100,
    label: data.label
  })).sort((a, b) => b.rate - a.rate);

  return {
    subtotalNet: Math.round(subtotalNet * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    taxBreakdown
  };
}

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  extras: CartExtra[];
  totalPrice: number;
  taxRate: number; // Steuersatz des Produkts
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'PRODUCT_SPECIFIC';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
}

export interface CartExtra {
  extraGroupId: number;
  extraItemId: number;
  name: string;
  price: number;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  subtotalAfterDiscount: number;
  // Steuerberechnung
  subtotalNet: number;
  totalTax: number;
  taxBreakdown: Array<{
    rate: number;
    amount: number;
    label: string;
  }>;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_CART_ID'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART_DATA'; payload: Partial<CartState> }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_EXTRAS'; payload: { id: string; extras: CartExtra[] } }
  | { type: 'APPLY_COUPON'; payload: Coupon }
  | { type: 'REMOVE_COUPON' }
  | { type: 'RESET_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART_ID':
      return { ...state, cartId: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CART_DATA':
      return { ...state, ...action.payload };

    case 'ADD_ITEM': {
      // Prüfe ob ein identisches Produkt bereits im Warenkorb ist (gleiche productId und gleiche extras)
      const existingItemIndex = state.items.findIndex(item => {
        // Gleiche Produkt-ID
        if (item.productId !== action.payload.productId) return false;

        // Gleiche Anzahl von Extras
        if (item.extras.length !== action.payload.extras.length) return false;

        // Gleiche Extras (gleiche extraItemId und extraGroupId)
        const extrasMatch = item.extras.every(itemExtra =>
          action.payload.extras.some(payloadExtra =>
            itemExtra.extraItemId === payloadExtra.extraItemId &&
            itemExtra.extraGroupId === payloadExtra.extraGroupId
          )
        ) && action.payload.extras.every(payloadExtra =>
          item.extras.some(itemExtra =>
            itemExtra.extraItemId === payloadExtra.extraItemId &&
            itemExtra.extraGroupId === payloadExtra.extraGroupId
          )
        );

        return extrasMatch;
      });

      let newItems;
      let newTotalItems;

      if (existingItemIndex > -1) {
        // Identisches Produkt existiert bereits, erhöhe Menge
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity,
          totalPrice: (newItems[existingItemIndex].quantity + action.payload.quantity) *
            (newItems[existingItemIndex].price +
              newItems[existingItemIndex].extras.reduce((sum, extra) => sum + extra.price, 0))
        };
        newTotalItems = state.totalItems + action.payload.quantity;
      } else {
        // Neues Item hinzufügen
        newItems = [...state.items, action.payload];
        newTotalItems = state.totalItems + action.payload.quantity;
      }

      const newTotalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Berechne Steueraufschlüsselung
      const taxCalculation = calculateTaxBreakdown(newItems);

      // Recalculate discount if coupon is applied
      let newDiscountAmount = 0;
      let newSubtotalAfterDiscount = newTotalPrice;

      if (state.appliedCoupon) {
        const coupon = state.appliedCoupon;
        if (coupon.discountType === 'PERCENTAGE') {
          newDiscountAmount = (newTotalPrice * coupon.discountValue) / 100;
          if (coupon.maximumDiscount && newDiscountAmount > coupon.maximumDiscount) {
            newDiscountAmount = coupon.maximumDiscount;
          }
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
          newDiscountAmount = coupon.discountValue;
          if (newDiscountAmount > newTotalPrice) {
            newDiscountAmount = newTotalPrice;
          }
        }
        newSubtotalAfterDiscount = newTotalPrice - newDiscountAmount;
      }

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        discountAmount: newDiscountAmount,
        subtotalAfterDiscount: newSubtotalAfterDiscount,
        subtotalNet: taxCalculation.subtotalNet,
        totalTax: taxCalculation.totalTax,
        taxBreakdown: taxCalculation.taxBreakdown
      };
    }

    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (!itemToRemove) return state;

      const newItems = state.items.filter(item => item.id !== action.payload);
      const newTotalItems = state.totalItems - itemToRemove.quantity;
      const newTotalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Berechne Steueraufschlüsselung
      const taxCalculation = calculateTaxBreakdown(newItems);

      // Recalculate discount if coupon is applied
      let newDiscountAmount = 0;
      let newSubtotalAfterDiscount = newTotalPrice;

      if (state.appliedCoupon) {
        const coupon = state.appliedCoupon;
        if (coupon.discountType === 'PERCENTAGE') {
          newDiscountAmount = (newTotalPrice * coupon.discountValue) / 100;
          if (coupon.maximumDiscount && newDiscountAmount > coupon.maximumDiscount) {
            newDiscountAmount = coupon.maximumDiscount;
          }
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
          newDiscountAmount = coupon.discountValue;
          if (newDiscountAmount > newTotalPrice) {
            newDiscountAmount = newTotalPrice;
          }
        }
        newSubtotalAfterDiscount = newTotalPrice - newDiscountAmount;
      }

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        discountAmount: newDiscountAmount,
        subtotalAfterDiscount: newSubtotalAfterDiscount,
        subtotalNet: taxCalculation.subtotalNet,
        totalTax: taxCalculation.totalTax,
        taxBreakdown: taxCalculation.taxBreakdown
      };
    }

    case 'UPDATE_QUANTITY': {
      const itemIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (itemIndex === -1) return state;

      const item = state.items[itemIndex];
      const newQuantity = action.payload.quantity;

      if (newQuantity <= 0) {
        // Item entfernen wenn Menge 0 oder negativ
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.id });
      }

      const newItems = [...state.items];
      newItems[itemIndex] = {
        ...item,
        quantity: newQuantity,
        totalPrice: newQuantity * (item.price + item.extras.reduce((sum, extra) => sum + extra.price, 0))
      };

      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Berechne Steueraufschlüsselung
      const taxCalculation = calculateTaxBreakdown(newItems);

      // Recalculate discount if coupon is applied
      let newDiscountAmount = 0;
      let newSubtotalAfterDiscount = newTotalPrice;

      if (state.appliedCoupon) {
        const coupon = state.appliedCoupon;
        if (coupon.discountType === 'PERCENTAGE') {
          newDiscountAmount = (newTotalPrice * coupon.discountValue) / 100;
          if (coupon.maximumDiscount && newDiscountAmount > coupon.maximumDiscount) {
            newDiscountAmount = coupon.maximumDiscount;
          }
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
          newDiscountAmount = coupon.discountValue;
          if (newDiscountAmount > newTotalPrice) {
            newDiscountAmount = newTotalPrice;
          }
        }
        newSubtotalAfterDiscount = newTotalPrice - newDiscountAmount;
      }

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        discountAmount: newDiscountAmount,
        subtotalAfterDiscount: newSubtotalAfterDiscount,
        subtotalNet: taxCalculation.subtotalNet,
        totalTax: taxCalculation.totalTax,
        taxBreakdown: taxCalculation.taxBreakdown
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        appliedCoupon: null,
        discountAmount: 0,
        subtotalAfterDiscount: 0,
        subtotalNet: 0,
        totalTax: 0,
        taxBreakdown: []
      };

    case 'UPDATE_EXTRAS': {
      const itemIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (itemIndex === -1) return state;

      const item = state.items[itemIndex];
      const newItems = [...state.items];
      const extrasPrice = action.payload.extras.reduce((sum, extra) => sum + extra.price, 0);

      newItems[itemIndex] = {
        ...item,
        extras: action.payload.extras,
        totalPrice: item.quantity * (item.price + extrasPrice)
      };

      const newTotalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Berechne Steueraufschlüsselung
      const taxCalculation = calculateTaxBreakdown(newItems);

      // Recalculate discount if coupon is applied
      let newDiscountAmount = 0;
      let newSubtotalAfterDiscount = newTotalPrice;

      if (state.appliedCoupon) {
        const coupon = state.appliedCoupon;
        if (coupon.discountType === 'PERCENTAGE') {
          newDiscountAmount = (newTotalPrice * coupon.discountValue) / 100;
          if (coupon.maximumDiscount && newDiscountAmount > coupon.maximumDiscount) {
            newDiscountAmount = coupon.maximumDiscount;
          }
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
          newDiscountAmount = coupon.discountValue;
          if (newDiscountAmount > newTotalPrice) {
            newDiscountAmount = newTotalPrice;
          }
        }
        newSubtotalAfterDiscount = newTotalPrice - newDiscountAmount;
      }

      return {
        ...state,
        items: newItems,
        totalPrice: newTotalPrice,
        discountAmount: newDiscountAmount,
        subtotalAfterDiscount: newSubtotalAfterDiscount,
        subtotalNet: taxCalculation.subtotalNet,
        totalTax: taxCalculation.totalTax,
        taxBreakdown: taxCalculation.taxBreakdown
      };
    }

    case 'APPLY_COUPON': {
      const coupon = action.payload;
      const totalPrice = state.totalPrice;

      let discountAmount = 0;

      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (totalPrice * coupon.discountValue) / 100;
        if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
          discountAmount = coupon.maximumDiscount;
        }
      } else if (coupon.discountType === 'FIXED_AMOUNT') {
        discountAmount = coupon.discountValue;
        if (discountAmount > totalPrice) {
          discountAmount = totalPrice;
        }
      }

      const subtotalAfterDiscount = totalPrice - discountAmount;

      return {
        ...state,
        appliedCoupon: coupon,
        discountAmount,
        subtotalAfterDiscount
      };
    }

    case 'REMOVE_COUPON':
      return {
        ...state,
        appliedCoupon: null,
        discountAmount: 0,
        subtotalAfterDiscount: state.totalPrice
      };

    case 'RESET_CART':
      return {
        cartId: null,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        appliedCoupon: null,
        discountAmount: 0,
        subtotalAfterDiscount: 0,
        subtotalNet: 0,
        totalTax: 0,
        taxBreakdown: [],
        loading: false,
        error: null
      };

    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  updateExtras: (id: string, extras: CartExtra[]) => Promise<void>;
  applyCoupon: (coupon: Coupon) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  createCart: () => Promise<void>;
} | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const toast = useToast();

  const [state, dispatch] = useReducer(cartReducer, {
    cartId: null,
    items: [],
    totalItems: 0,
    totalPrice: 0,
    appliedCoupon: null,
    discountAmount: 0,
    subtotalAfterDiscount: 0,
    subtotalNet: 0,
    totalTax: 0,
    taxBreakdown: [],
    loading: false,
    error: null
  });

  // Erstelle oder lade Warenkorb beim ersten Laden
  useEffect(() => {
    const initializeCart = async () => {
      // Prüfe ob bereits eine Cart-ID im localStorage gespeichert ist
      const savedCartId = localStorage.getItem('cart-id');

      if (savedCartId) {
        dispatch({ type: 'SET_CART_ID', payload: savedCartId });
        await loadCart(savedCartId);
      } else {
        // Prüfe ob es einen alten localStorage-Warenkorb gibt, den wir migrieren können
        const oldCart = localStorage.getItem('cart');
        if (oldCart) {
          try {
            const cartData = JSON.parse(oldCart);
            if (cartData.items && cartData.items.length > 0) {
              // Migriere alten Warenkorb zur neuen API
              await migrateOldCart(cartData);
              return;
            }
          } catch (error) {
            console.warn('Fehler beim Parsen des alten Warenkorbs:', error);
          }
        }
        await createCart();
      }
    };

    initializeCart();
  }, []); // Leere Dependencies - nur einmal beim Mount ausführen

  const migrateOldCart = useCallback(async (oldCartData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Erstelle neuen Warenkorb
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const cart = await response.json();
        dispatch({ type: 'SET_CART_ID', payload: cart.id });
        localStorage.setItem('cart-id', cart.id);

        // Migriere alle Items
        for (const item of oldCartData.items) {
          await fetch(`/api/cart/${cart.id}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity,
              extras: item.extras || []
            })
          });
        }

        // Lade den neuen Warenkorb
        await loadCart(cart.id);

        // Lösche alten localStorage-Warenkorb
        localStorage.removeItem('cart');

        console.log('Warenkorb erfolgreich migriert');
      } else {
        throw new Error('Fehler beim Erstellen des neuen Warenkorbs');
      }
    } catch (error) {
      console.error('Fehler beim Migrieren des Warenkorbs:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Migrieren des Warenkorbs' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART_ID', payload: data.id });
        localStorage.setItem('cart-id', data.id);
      } else {
        const error = await response.json();
        dispatch({ type: 'SET_ERROR', payload: error.error || 'Fehler beim Erstellen des Warenkorbs' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Erstellen des Warenkorbs' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadCart = useCallback(async (cartId?: string) => {
    const currentCartId = cartId || state.cartId;
    if (!currentCartId) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/cart?cartId=${currentCartId}`);

      if (response.ok) {
        const cartData = await response.json();
        dispatch({ type: 'SET_CART_DATA', payload: cartData });
      } else if (response.status === 410) {
        // Warenkorb ist abgelaufen, erstelle neuen
        localStorage.removeItem('cart-id');
        dispatch({ type: 'RESET_CART' });
        // Erstelle neuen Warenkorb über useEffect
        window.location.reload();
      } else {
        const error = await response.json();
        dispatch({ type: 'SET_ERROR', payload: error.error || 'Fehler beim Laden des Warenkorbs' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Laden des Warenkorbs' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.cartId]);

  const addItem = useCallback(async (item: Omit<CartItem, 'id' | 'totalPrice'>) => {
    if (!state.cartId) {
      // Erstelle neuen Warenkorb und füge Item hinzu
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const cart = await response.json();
        dispatch({ type: 'SET_CART_ID', payload: cart.id });
        localStorage.setItem('cart-id', cart.id);

        // Füge Item zum neuen Warenkorb hinzu
        const itemResponse = await fetch(`/api/cart/${cart.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            extras: item.extras
          })
        });

        if (itemResponse.ok) {
          await loadCart();
        }
      }
      return;
    }

    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/cart/${state.cartId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity,
          extras: item.extras
        })
      });

      if (response.ok) {
        const cartItem = await response.json();
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        toast.success(`${item.name} wurde zum Warenkorb hinzugefügt`, 3000);
      } else if (response.status === 410) {
        // Warenkorb ist abgelaufen, erstelle neuen
        localStorage.removeItem('cart-id');
        await createCart();
        // Versuche erneut hinzuzufügen
        await addItem(item);
      } else {
        const error = await response.json();
        dispatch({ type: 'SET_ERROR', payload: error.error || 'Fehler beim Hinzufügen zum Warenkorb' });
        toast.error(error.error || 'Fehler beim Hinzufügen zum Warenkorb');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Hinzufügen zum Warenkorb' });
    }
  }, [state.cartId, loadCart]);

  const removeItem = useCallback(async (id: string) => {
    if (!state.cartId) return;

    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/cart/${state.cartId}/items/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
      } else if (response.status === 410) {
        // Warenkorb ist abgelaufen
        localStorage.removeItem('cart-id');
        dispatch({ type: 'RESET_CART' });
        await createCart();
      } else {
        const error = await response.json();
        dispatch({ type: 'SET_ERROR', payload: error.error || 'Fehler beim Entfernen aus dem Warenkorb' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Entfernen aus dem Warenkorb' });
    }
  }, [state.cartId]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (!state.cartId) return;

    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/cart/${state.cartId}/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
      } else if (response.status === 410) {
        // Warenkorb ist abgelaufen
        localStorage.removeItem('cart-id');
        dispatch({ type: 'RESET_CART' });
        await createCart();
      } else {
        const error = await response.json();
        dispatch({ type: 'SET_ERROR', payload: error.error || 'Fehler beim Aktualisieren der Menge' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Aktualisieren der Menge' });
    }
  }, [state.cartId]);

  const updateExtras = useCallback(async (id: string, extras: CartExtra[]) => {
    if (!state.cartId) return;

    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/cart/${state.cartId}/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extras })
      });

      if (response.ok) {
        dispatch({ type: 'UPDATE_EXTRAS', payload: { id, extras } });
      } else if (response.status === 410) {
        // Warenkorb ist abgelaufen
        localStorage.removeItem('cart-id');
        dispatch({ type: 'RESET_CART' });
        await createCart();
      } else {
        const error = await response.json();
        dispatch({ type: 'SET_ERROR', payload: error.error || 'Fehler beim Aktualisieren der Extras' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Aktualisieren der Extras' });
    }
  }, [state.cartId]);

  const applyCoupon = useCallback(async (coupon: Coupon) => {
    dispatch({ type: 'APPLY_COUPON', payload: coupon });
  }, []);

  const removeCoupon = useCallback(async () => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const clearCart = useCallback(async () => {
    if (!state.cartId) return;

    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      // Lösche alle Items aus der Datenbank
      const items = state.items;
      for (const item of items) {
        await fetch(`/api/cart/${state.cartId}/items/${item.id}`, {
          method: 'DELETE'
        });
      }

      // Lösche Cart-ID aus localStorage
      localStorage.removeItem('cart-id');

      // Setze State zurück
      dispatch({ type: 'RESET_CART' });

      // Erstelle neuen leeren Warenkorb für zukünftige Bestellungen
      await createCart();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Leeren des Warenkorbs' });
    }
  }, [state.cartId, state.items, createCart]);

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      updateExtras,
      applyCoupon,
      removeCoupon,
      clearCart,
      loadCart,
      createCart
    }}>
      {children}
    </CartContext.Provider>
  );
};