import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, XMarkIcon, ShareIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { getCurrentUser } from '../lib/auth';
import { addToCart } from './Cart';

interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  note?: string;
  addedAt: string;
}

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001';

const Wishlist = ({ isOpen, onClose }: WishlistProps) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    loadWishlist();
  }, [isOpen]);

  const loadWishlist = async () => {
    const user = getCurrentUser();
    if (!user) {
      onClose();
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.wishlist?.items || []);
        // Load product details for each item
        loadProductDetails(data.wishlist?.items || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist', err);
    }
  };

  const loadProductDetails = async (items: WishlistItem[]) => {
    // TODO: Fetch product details from catalog API
    // For now, use a simple mapping
    const savedProducts = localStorage.getItem('soyl_products');
    if (savedProducts) {
      const products = JSON.parse(savedProducts);
      const details: Record<string, any> = {};
      items.forEach(item => {
        const product = products.find((p: any) => p.id === item.productId);
        if (product) {
          details[item.id] = product;
        }
      });
      setProductDetails(details);
    }
  };

  const removeItem = async (id: string) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      await fetch(`${API_BASE}/api/wishlist/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
        },
      });
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const handleShare = async () => {
    const user = getCurrentUser();
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/wishlist/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setShareLink(data.shareLink || data.shareToken);
      }
    } catch (err) {
      console.error('Failed to generate share link', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    const product = productDetails[item.id];
    if (!product) return;

    await addToCart({
      productId: item.productId,
      name: product.name,
      priceAtAdd: product.price,
      image: product.image,
      variantId: item.variantId,
    });

    // Toast notification
    // In a real implementation, use a toast library
    alert(`${product.name} added to cart!`);
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

          {/* Wishlist Sidebar */}
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
                  <HeartIcon className="h-6 w-6 text-soyl-gold" />
                  <h2 className="font-serif text-2xl font-semibold text-soyl-gold">
                    Wishlist
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-soyl-gold/10 rounded-lg transition-colors"
                    aria-label="Share wishlist"
                    disabled={isLoading}
                  >
                    <ShareIcon className="h-6 w-6 text-soyl-gold" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-soyl-gold/10 rounded-lg transition-colors"
                    aria-label="Close wishlist"
                  >
                    <XMarkIcon className="h-6 w-6 text-soyl-silver hover:text-soyl-gold" />
                  </button>
                </div>
              </div>
              {items.length > 0 && (
                <p className="text-soyl-silver text-sm mt-2">
                  {items.length} {items.length === 1 ? 'item' : 'items'} saved
                </p>
              )}
            </div>

            {/* Share Link */}
            {shareLink && (
              <motion.div
                className="mx-6 mt-4 p-4 bg-soyl-gold/10 border border-soyl-gold/30 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-soyl-silver text-sm mb-2">Share Link:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}${shareLink}`}
                    readOnly
                    className="input-field flex-1 text-xs"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${shareLink}`);
                      alert('Link copied!');
                    }}
                    className="btn-secondary text-xs"
                  >
                    Copy
                  </button>
                </div>
              </motion.div>
            )}

            {/* Wishlist Items */}
            <div className="p-6">
              {items.length === 0 ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <HeartIcon className="h-16 w-16 text-soyl-silver/30 mx-auto mb-4" />
                  <p className="text-soyl-silver">Your wishlist is empty</p>
                  <p className="text-soyl-silver text-sm mt-2">
                    Save items you love for later
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const product = productDetails[item.id];
                    return (
                      <motion.div
                        key={item.id}
                        className="card p-4 border-2 border-soyl-gold/20"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <div className="flex items-start space-x-4">
                          {product?.image && (
                            <img
                              src={product.image}
                              alt={product.name || 'Product'}
                              className="w-20 h-20 object-cover rounded-lg border border-soyl-gold/30"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-serif text-lg font-semibold text-soyl-white mb-1">
                              {product?.name || 'Product'}
                            </h3>
                            {product?.price && (
                              <p className="text-soyl-gold font-bold text-xl mb-2">
                                ${product.price.toFixed(2)}
                              </p>
                            )}
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                              >
                                <ShoppingCartIcon className="h-4 w-4" />
                                Add to Cart
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 hover:bg-red-900/20 rounded transition-colors"
                                aria-label="Remove item"
                              >
                                <TrashIcon className="h-5 w-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook to add items to wishlist
export const addToWishlist = async (item: {
  productId: string;
  variantId?: string;
  note?: string;
}) => {
  const user = getCurrentUser();
  if (!user) {
    alert('Please login to add items to your wishlist');
    return;
  }

  try {
    await fetch(`${API_BASE}/api/wishlist/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('soyl_id_token') || ''}`,
      },
      body: JSON.stringify(item),
    });
    
    // Dispatch event to update wishlist UI
    window.dispatchEvent(new Event('wishlistUpdated'));
  } catch (err) {
    console.error('Failed to add to wishlist', err);
  }
};

export default Wishlist;

