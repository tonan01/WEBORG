import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const { user } = useContext(AuthContext);

    const refreshCartCount = useCallback(async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const res = await cartService.get();
            if (res.data && res.data.items) {
                const count = res.data.items.reduce((total, item) => total + item.quantity, 0);
                setCartCount(count);
            } else {
                setCartCount(0);
            }
        } catch (err) {
            console.error('Error refreshing cart count', err);
            setCartCount(0);
        }
    }, [user]);

    useEffect(() => {
        refreshCartCount();
    }, [refreshCartCount]);

    return (
        <CartContext.Provider value={{ cartCount, refreshCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
