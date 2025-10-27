import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

interface ToastProps {
  message: string;
  productName?: string;
  onViewCart?: () => void;
}

const Toast = ({ message, productName, onViewCart }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="bg-soyl-gold text-soyl-black px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
            <CheckCircleIcon className="h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{message}</p>
              {productName && <p className="text-sm opacity-80">{productName}</p>}
            </div>
            {onViewCart && (
              <button
                onClick={onViewCart}
                className="text-soyl-black underline text-sm font-semibold hover:opacity-80"
              >
                View Cart
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

// Hook to trigger add-to-cart animation
export const useAddToCartAnimation = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [productName, setProductName] = useState('');
  const [onViewCart, setOnViewCart] = useState<(() => void) | undefined>();

  const triggerAnimation = (message: string, productName?: string, onViewCart?: () => void) => {
    setToastMessage(message);
    setProductName(productName || '');
    setOnViewCart(() => onViewCart);
    setShowToast(true);
  };

  const ToastComponent = showToast ? (
    <Toast
      message={toastMessage}
      productName={productName}
      onViewCart={onViewCart}
    />
  ) : null;

  return { triggerAnimation, ToastComponent };
};

// Animated product card with add-to-cart effect
interface AnimatedProductCardProps {
  children: React.ReactNode;
  onAddToCart?: () => void;
}

export const AnimatedProductCard = ({ children, onAddToCart }: AnimatedProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

// Heart animation for wishlist
export const WishlistButton = ({ 
  isInWishlist, 
  onToggle 
}: { 
  isInWishlist: boolean; 
  onToggle: () => void;
}) => {
  return (
    <motion.button
      onClick={onToggle}
      className="p-2 rounded-lg transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        color: isInWishlist ? '#D4AF37' : '#C0C0C0',
      }}
    >
      <motion.svg
        className="w-5 h-5"
        fill={isInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        animate={{ scale: isInWishlist ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </motion.svg>
    </motion.button>
  );
};

