import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingCartIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';
import Toast, { useAddToCartAnimation } from './AddToCartAnimation';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  priceAtAdd: number;
  quantity: number;
  image?: string;
  designId?: string;
  metadata?: Record<string, any>;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: (item: CartItem) => void;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001';

const Cart = ({ isOpen, onClose, onItemAdded }: CartProps) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [shipmentEstimate, setShipmentEstimate] = useState(0);
  const [tax, setTax] = useState(0);
  const { triggerAnimation, ToastComponent } = useAddToCartAnimation();

  useEffect(() => {
    loadCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isOpen]);

  const loadCart = async () => {
    const user = getCurrentUser();
    if (user) {
      // Load from server
      try {
        const response = await fetch(`${API_BASE}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setItems(data.cart?.items || []);
          setCouponCode(data.cart?.couponCode || '');
          if (data.cart?.shippingEstimate) {
            setShipmentEstimate(data.cart.shippingEstimate.price || 0);
          }
        }
      } catch (err) {
        console.error('Failed to load cart from server', err);
      }
    } else {
      // Load from localStorage
    const savedItems = localStorage.getItem('soyl_cart');
    if (savedItems) {
        const parsed = JSON.parse(savedItems);
        setItems(parsed.items || parsed);
      }
    }
  };

  const updateCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    
    const user = getCurrentUser();
    if (user) {
      // Sync to server
      try {
        await fetch(`${API_BASE}/api/cart/items/${newItems[0]?.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
          },
          body: JSON.stringify({ quantity: newItems.find(i => i.id === newItems[0]?.id)?.quantity }),
        });
      } catch (err) {
        console.error('Failed to sync cart to server', err);
      }
    } else {
      // Save to localStorage
    localStorage.setItem('soyl_cart', JSON.stringify(newItems));
    }
  };

  const removeItem = async (id: string) => {
    const user = getCurrentUser();
    
    if (user) {
      // Remove from server
      try {
        await fetch(`${API_BASE}/api/cart/items/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
          },
        });
      } catch (err) {
        console.error('Failed to remove item from server', err);
      }
    }
    
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    if (!user) {
      localStorage.setItem('soyl_cart', JSON.stringify(newItems));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    const user = getCurrentUser();
    if (user) {
      try {
        await fetch(`${API_BASE}/api/cart/items/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
          },
          body: JSON.stringify({ quantity }),
        });
      } catch (err) {
        console.error('Failed to update quantity', err);
      }
    }
    
    const newItems = items.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setItems(newItems);
    if (!user) {
      localStorage.setItem('soyl_cart', JSON.stringify(newItems));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    const user = getCurrentUser();
    if (user) {
      try {
        const response = await fetch(`${API_BASE}/api/cart/apply-coupon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
          },
          body: JSON.stringify({ couponCode }),
        });
        if (response.ok) {
          setDiscount(5); // Mock discount
        }
      } catch (err) {
        console.error('Failed to apply coupon', err);
      }
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    
    const user = getCurrentUser();
    
    // Validate checkout
    if (user) {
      try {
        const response = await fetch(`${API_BASE}/api/cart/validate-checkout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
          },
        });
        const data = await response.json();
        
        if (!data.valid) {
          alert(data.errors?.join('\n') || 'Checkout validation failed');
          setIsLoading(false);
          return;
        }
        
        setTax(data.tax || 0);
        setShipmentEstimate(data.shipping || 0);
      } catch (err) {
        console.error('Checkout validation failed', err);
      }
    }
    
    // Navigate to checkout (or show success)
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      navigate('/checkout');
    }, 1000);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.priceAtAdd || item.price || 0) * item.quantity, 0);
    return {
      subtotal,
      discount,
      shipping: shipmentEstimate,
      tax: subtotal * 0.08, // 8% tax
      total: subtotal - discount + shipmentEstimate + (subtotal * 0.08)
    };
  };

  const totals = calculateTotals();

  return (
    <>
      {ToastComponent}
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Cart Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-soyl-black border-l-2 border-soyl-gold/30 z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-soyl-black border-b-2 border-soyl-gold/30 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShoppingCartIcon className="h-6 w-6 text-soyl-gold" />
                  <h2 className="font-serif text-2xl font-semibold text-soyl-gold">
                    Shopping Cart
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-soyl-gold/10 rounded-lg transition-colors"
                  aria-label="Close cart"
                >
                  <XMarkIcon className="h-6 w-6 text-soyl-silver hover:text-soyl-gold" />
                </button>
              </div>
              {items.length > 0 && (
                <p className="text-soyl-silver text-sm mt-2">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in cart
                </p>
              )}
            </div>

            {/* Cart Items */}
            <div className="p-6">
              {items.length === 0 ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ShoppingCartIcon className="h-16 w-16 text-soyl-silver/30 mx-auto mb-4" />
                  <p className="text-soyl-silver">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="btn-primary mt-6"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        className="card p-4 border-2 border-soyl-gold/20"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <div className="flex items-start space-x-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg border border-soyl-gold/30"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-serif text-lg font-semibold text-soyl-white mb-1">
                              {item.name}
                            </h3>
                            <p className="text-soyl-gold font-bold text-xl mb-2">
                              ${(item.priceAtAdd || item.price || 0).toFixed(2)}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded border border-soyl-gold/50 text-soyl-gold hover:bg-soyl-gold/10 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="text-soyl-white font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded border border-soyl-gold/50 text-soyl-gold hover:bg-soyl-gold/10 transition-colors"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                              
                              <button
                                onClick={() => removeItem(item.id)}
                                className="ml-auto p-2 hover:bg-red-900/20 rounded transition-colors"
                                aria-label="Remove item"
                              >
                                <TrashIcon className="h-5 w-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Coupon Code */}
                  <div className="mt-6 pt-6 border-t-2 border-soyl-gold/30">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        className="input-field flex-1"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="btn-secondary"
                        disabled={!couponCode}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-6 pt-6 border-t-2 border-soyl-gold/30">
                    <div className="space-y-2">
                      <div className="flex justify-between text-soyl-silver">
                        <span>Subtotal</span>
                        <span>${totals.subtotal.toFixed(2)}</span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Discount</span>
                          <span>-${totals.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-soyl-silver">
                        <span>Shipping</span>
                        <span>{totals.shipping > 0 ? `$${totals.shipping.toFixed(2)}` : 'Free'}</span>
                      </div>
                      <div className="flex justify-between text-soyl-silver">
                        <span>Tax</span>
                        <span>${totals.tax.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t-2 border-soyl-gold/50">
                      <div className="flex justify-between items-center">
                        <span className="text-soyl-white text-xl font-bold">Total:</span>
                      <span className="text-soyl-gold font-serif font-bold text-3xl">
                          ${totals.total.toFixed(2)}
                      </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="btn-primary w-full py-4 text-lg mt-6 flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                      {!isLoading && <ArrowRightIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};

// Hook to add items to cart from anywhere (with server sync support)
export const addToCart = async (item: {
  productId: string;
  name: string;
  priceAtAdd: number;
  image?: string;
  metadata?: Record<string, any>;
  variantId?: string;
}) => {
  const user = getCurrentUser();
  
  if (user) {
    // Add to server cart
    try {
      await fetch(`${API_BASE}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          priceAtAdd: item.priceAtAdd,
          metadata: item.metadata,
        }),
      });
    } catch (err) {
      console.error('Failed to add item to server cart', err);
    }
  } else {
    // Add to localStorage
    const savedItems = localStorage.getItem('soyl_cart');
    const items: any[] = savedItems ? JSON.parse(savedItems) : [];
    
    const existingItem = items.find(i => i.productId === item.productId && i.variantId === item.variantId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
      items.push({ 
        ...item, 
        quantity: 1,
        id: `item-${Date.now()}`,
      });
    }
    
    localStorage.setItem('soyl_cart', JSON.stringify(items));
  }
  
  // Dispatch custom event to update cart UI
  window.dispatchEvent(new Event('cartUpdated'));
};

// Export cart merge function for use in auth flow
export const mergeCartWithServer = async () => {
  const user = getCurrentUser();
  if (!user) return;
  
  const localCart = localStorage.getItem('soyl_cart');
  if (!localCart) return;
  
  try {
    await fetch(`${API_BASE}/api/cart/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
      },
      body: localCart,
    });
    
    // Clear local cart after merge
    localStorage.removeItem('soyl_cart');
  } catch (err) {
    console.error('Failed to merge cart', err);
  }
};

export default Cart;

