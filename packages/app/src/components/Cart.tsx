import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  designId?: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedItems = localStorage.getItem('soyl_cart');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  const updateCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('soyl_cart', JSON.stringify(newItems));
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    updateCart(newItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const newItems = items.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    updateCart(newItems);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setIsLoading(true);
    // TODO: Implement checkout logic
    setTimeout(() => {
      setIsLoading(false);
      alert('Checkout functionality coming soon!');
    }, 1000);
  };

  return (
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
                <div className="text-center py-12">
                  <ShoppingCartIcon className="h-16 w-16 text-soyl-silver/30 mx-auto mb-4" />
                  <p className="text-soyl-silver">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="btn-primary mt-6"
                  >
                    Continue Shopping
                  </button>
                </div>
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
                              ${item.price.toFixed(2)}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded border border-soyl-gold/50 text-soyl-gold hover:bg-soyl-gold/10 transition-colors"
                              >
                                −
                              </button>
                              <span className="text-soyl-white font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded border border-soyl-gold/50 text-soyl-gold hover:bg-soyl-gold/10 transition-colors"
                              >
                                +
                              </button>
                              
                              <button
                                onClick={() => removeItem(item.id)}
                                className="ml-auto p-2 hover:bg-red-900/20 rounded transition-colors"
                              >
                                <TrashIcon className="h-5 w-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-8 pt-6 border-t-2 border-soyl-gold/30">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-soyl-silver text-lg">Total:</span>
                      <span className="text-soyl-gold font-serif font-bold text-3xl">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="btn-primary w-full py-4 text-lg"
                    >
                      {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook to add items to cart from anywhere
export const addToCart = (item: Omit<CartItem, 'quantity'>) => {
  const savedItems = localStorage.getItem('soyl_cart');
  const items: CartItem[] = savedItems ? JSON.parse(savedItems) : [];
  
  const existingItem = items.find(i => i.id === item.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    items.push({ ...item, quantity: 1 });
  }
  
  localStorage.setItem('soyl_cart', JSON.stringify(items));
};

export default Cart;

