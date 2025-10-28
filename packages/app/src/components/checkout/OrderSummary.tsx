import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon,
  TruckIcon,
  ReceiptPercentIcon
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
}

interface Address {
  addressId: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface ShippingOption {
  id: string;
  label: string;
  price: number;
  estimatedDays: number[];
}

interface OrderSummaryProps {
  cart: Cart;
  selectedShipping?: ShippingOption | null;
  selectedAddress?: Address | null;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  selectedShipping,
  selectedAddress,
  total,
}) => {
  const subtotal = cart.subtotal;
  const shipping = selectedShipping?.price || 0;
  const tax = (subtotal + shipping) * 0.18; // 18% GST
  const finalTotal = subtotal + shipping + tax;

  return (
    <div className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6 sticky top-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBagIcon className="w-6 h-6 text-soyl-gold" />
        Order Summary
      </h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <motion.div
            key={item.itemId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
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
              <div className="flex items-center gap-2 mt-1">
                <span className="text-soyl-gold text-sm font-semibold">
                  ₹{item.price.toFixed(2)}
                </span>
                <span className="text-soyl-silver text-xs">× {item.quantity}</span>
              </div>
            </div>

            {/* Item Total */}
            <div className="text-soyl-gold font-semibold text-sm">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Address */}
      {selectedAddress && (
        <div className="mb-6 p-4 bg-soyl-gold/5 border border-soyl-gold/20 rounded-lg">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <TruckIcon className="w-4 h-4 text-soyl-gold" />
            Delivery Address
          </h3>
          <div className="text-sm text-soyl-silver">
            <p className="font-medium text-soyl-white">{selectedAddress.name}</p>
            <p>{selectedAddress.phone}</p>
            <p>{selectedAddress.line1}</p>
            {selectedAddress.line2 && <p>{selectedAddress.line2}</p>}
            <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
            <p>{selectedAddress.country}</p>
          </div>
        </div>
      )}

      {/* Selected Shipping */}
      {selectedShipping && (
        <div className="mb-6 p-4 bg-soyl-gold/5 border border-soyl-gold/20 rounded-lg">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <TruckIcon className="w-4 h-4 text-soyl-gold" />
            Shipping Method
          </h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{selectedShipping.label}</p>
              <p className="text-xs text-soyl-silver">
                {selectedShipping.estimatedDays[0]}-{selectedShipping.estimatedDays[1]} days
              </p>
            </div>
            <span className="text-soyl-gold font-semibold">
              ₹{selectedShipping.price.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        
        {selectedShipping && (
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1">
            Tax (GST 18%)
            <span 
              className="text-soyl-silver cursor-help"
              title="Goods and Services Tax"
            >
              ℹ️
            </span>
          </span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-soyl-gold/20 pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-soyl-gold">₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-soyl-silver text-xs mb-2">
          <ReceiptPercentIcon className="w-4 h-4" />
          Secure Checkout
        </div>
        <p className="text-xs text-soyl-silver">
          Your payment information is encrypted and secure
        </p>
      </div>

      {/* Estimated Delivery */}
      {selectedShipping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-soyl-gold/10 border border-soyl-gold/30 rounded-lg"
        >
          <p className="text-sm font-medium text-soyl-gold mb-1">
            Estimated Delivery
          </p>
          <p className="text-xs text-soyl-silver">
            {selectedShipping.estimatedDays[0]}-{selectedShipping.estimatedDays[1]} business days
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OrderSummary;
