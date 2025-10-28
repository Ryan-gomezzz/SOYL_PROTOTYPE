import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon,
  ArrowLeftIcon,
  TagIcon
} from '@heroicons/react/24/outline';

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
  couponCode?: string;
  discount?: number;
}

interface CartPageProps {
  onCheckout?: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ onCheckout }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Load cart data
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        // Use mock data for development
        const mockCart: Cart = {
          cartId: 'cart_dev_123',
          items: [
            {
              itemId: 'item_1',
              sku: 'TSHIRT001',
              name: 'SOYL Premium T-Shirt',
              price: 999.99,
              quantity: 2,
              thumbnail: '/placeholder-product.svg'
            },
            {
              itemId: 'item_2',
              sku: 'HOODIE001',
              name: 'SOYL Signature Hoodie',
              price: 1999.99,
              quantity: 1,
              thumbnail: '/placeholder-product.svg'
            }
          ],
          subtotal: 3999.97,
          currency: 'INR'
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setCart(mockCart);
        return;
      }
      
      // Production: try API call
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
      
      // Fallback to localStorage
      const localCart = localStorage.getItem('soyl_cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      } else {
        setError('Failed to load cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;

    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        // Update cart locally in development
        if (cart) {
          const updatedItems = cart.items.map(item => 
            item.itemId === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          );
          
          const updatedCart = {
            ...cart,
            items: updatedItems,
            subtotal: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          };
          
          setCart(updatedCart);
          
          // Track analytics
          trackEvent('update_cart_item', {
            itemId,
            quantity: newQuantity,
            cartId: cart.cartId,
          });
        }
        return;
      }
      
      // Production: API call
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        
        // Track analytics
        trackEvent('update_cart_item', {
          itemId,
          quantity: newQuantity,
          cartId: cart?.cartId,
        });
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        // Remove item locally in development
        if (cart) {
          const updatedItems = cart.items.filter(item => item.itemId !== itemId);
          const updatedCart = {
            ...cart,
            items: updatedItems,
            subtotal: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          };
          
          setCart(updatedCart);
          
          // Track analytics
          trackEvent('remove_from_cart', {
            itemId,
            cartId: cart.cartId,
          });
        }
        return;
      }
      
      // Production: API call
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        
        // Track analytics
        trackEvent('remove_from_cart', {
          itemId,
          cartId: cart?.cartId,
        });
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        // Mock coupon validation in development
        const validCoupons: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
          'WELCOME10': { discount: 10, type: 'percentage' },
          'SAVE100': { discount: 100, type: 'fixed' },
          'FIRST20': { discount: 20, type: 'percentage' },
        };

        const coupon = validCoupons[couponCode.toUpperCase()];
        
        if (!coupon) {
          setCouponError('Invalid coupon code');
          return;
        }

        // Apply discount locally
        if (cart) {
          let discountAmount = 0;
          if (coupon.type === 'percentage') {
            discountAmount = (cart.subtotal * coupon.discount) / 100;
          } else {
            discountAmount = Math.min(coupon.discount, cart.subtotal);
          }

          const updatedCart = {
            ...cart,
            couponCode: couponCode.toUpperCase(),
            discount: discountAmount,
            subtotal: cart.subtotal - discountAmount,
          };
          
          setCart(updatedCart);
          setCouponCode('');
          
          // Track analytics
          trackEvent('coupon_applied', {
            couponCode: couponCode.toUpperCase(),
            cartId: cart.cartId,
          });
        }
        return;
      }
      
      // Production: API call
      const response = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        setCouponCode('');
        
        // Track analytics
        trackEvent('coupon_applied', {
          couponCode,
          cartId: cart?.cartId,
        });
      } else {
        const errorData = await response.json();
        setCouponError(errorData.message || 'Invalid coupon code');
      }
    } catch (err) {
      console.error('Failed to apply coupon:', err);
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const trackEvent = (eventName: string, parameters: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) return;
    
    trackEvent('checkout_start', {
      cartId: cart.cartId,
      itemCount: cart.items.length,
      subtotal: cart.subtotal,
    });

    if (onCheckout) {
      onCheckout();
    } else {
      window.location.href = '/checkout';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soyl-black text-soyl-white pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              className="w-8 h-8 border-2 border-soyl-gold border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-soyl-black text-soyl-white pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBagIcon className="w-24 h-24 text-soyl-gold mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-soyl-silver mb-8">
              Find something you love and add it to your cart to get started.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soyl-black text-soyl-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-soyl-gold hover:text-soyl-gold/80 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.itemId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6"
                    >
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 bg-soyl-gold/10 rounded-lg flex items-center justify-center">
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.svg';
                            }}
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                          <p className="text-soyl-silver text-sm mb-2">SKU: {item.sku}</p>
                          <p className="text-soyl-gold font-semibold">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-full border border-soyl-gold/30 hover:bg-soyl-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="w-4 h-4 mx-auto" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="w-8 h-8 rounded-full border border-soyl-gold/30 hover:bg-soyl-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="w-4 h-4 mx-auto" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.itemId)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    <TagIcon className="w-4 h-4 inline mr-1" />
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 bg-soyl-black border border-soyl-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || applyingCoupon}
                      className="px-4 py-2 bg-soyl-gold hover:bg-soyl-gold/90 disabled:bg-gray-600 text-soyl-black rounded-lg font-medium transition-colors"
                    >
                      {applyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-400 text-sm mt-1">{couponError}</p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{(cart.subtotal + (cart.discount || 0)).toFixed(2)}</span>
                  </div>
                  {cart.discount && cart.discount > 0 && (
                    <div className="flex justify-between text-soyl-gold">
                      <span>Discount ({cart.couponCode})</span>
                      <span>-₹{cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-soyl-silver">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST 18%)</span>
                    <span className="text-soyl-silver">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-soyl-gold/20 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{cart.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black py-3 rounded-lg font-semibold transition-colors"
                >
                  Proceed to Checkout
                </button>

                <p className="text-xs text-soyl-silver mt-4 text-center">
                  Shipping and taxes calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
