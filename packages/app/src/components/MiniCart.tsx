import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface CartItem {
  itemId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

interface Cart {
  cartId: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
}

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniCart: React.FC<MiniCartProps> = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Load cart data
  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && cartRef.current) {
      const firstButton = cartRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, [isOpen]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      } else {
        // Fallback to localStorage
        const localCart = localStorage.getItem('soyl_cart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        }
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        
        // Track analytics
        trackEvent('mini_cart_update', {
          itemId,
          quantity: newQuantity,
          cartId: cart?.cartId,
        });
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        
        // Track analytics
        trackEvent('mini_cart_remove', {
          itemId,
          cartId: cart?.cartId,
        });
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const trackEvent = (eventName: string, parameters: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  };

  const handleCheckout = () => {
    trackEvent('mini_cart_checkout', {
      cartId: cart?.cartId,
      itemCount: cart?.items.length || 0,
    });
    onClose();
    window.location.href = '/checkout';
  };

  const handleViewCart = () => {
    trackEvent('mini_cart_view_full', {
      cartId: cart?.cartId,
    });
    onClose();
    window.location.href = '/cart';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            ref={cartRef}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 h-full w-96 max-w-[90vw] bg-soyl-black border-l border-soyl-gold/20 z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mini-cart-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-soyl-gold/20">
              <h2 id="mini-cart-title" className="text-xl font-bold">
                Shopping Cart ({cart?.items.length || 0})
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-soyl-gold/10 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    className="w-6 h-6 border-2 border-soyl-gold border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="w-16 h-16 text-soyl-gold mx-auto mb-4" />
                  <p className="text-soyl-silver">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {cart.items.map((item) => (
                      <motion.div
                        key={item.itemId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center gap-3 p-3 bg-soyl-white/5 rounded-lg"
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-soyl-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <p className="text-soyl-silver text-xs">SKU: {item.sku}</p>
                          <p className="text-soyl-gold text-sm font-semibold">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 rounded-full border border-soyl-gold/30 hover:bg-soyl-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="w-3 h-3 mx-auto" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="w-6 h-6 rounded-full border border-soyl-gold/30 hover:bg-soyl-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="w-3 h-3 mx-auto" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.itemId)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                          aria-label="Remove item"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-soyl-gold/20 p-6">
                {/* Subtotal */}
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-soyl-gold font-bold text-lg">
                    ₹{cart.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black py-3 rounded-lg font-semibold transition-colors"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={handleViewCart}
                    className="w-full border border-soyl-gold text-soyl-gold hover:bg-soyl-gold hover:text-soyl-black py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Full Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCart;
