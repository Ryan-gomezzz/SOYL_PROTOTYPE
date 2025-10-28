import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  itemId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
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
}

interface Order {
  orderId: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  address: Address;
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
        
        // Track analytics
        trackEvent('order_viewed', {
          orderId: id,
          status: orderData.status,
          total: orderData.total,
        });
      } else {
        throw new Error('Order not found');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!order) return;

    setDownloadingInvoice(true);
    try {
      const response = await fetch(`/api/orders/${order.orderId}/invoice`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Track analytics
        trackEvent('invoice_downloaded', {
          orderId: order.orderId,
        });
      } else {
        throw new Error('Failed to download invoice');
      }
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const trackEvent = (eventName: string, parameters: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-400';
      case 'SHIPPED':
        return 'text-blue-400';
      case 'DELIVERED':
        return 'text-soyl-gold';
      case 'CANCELLED':
        return 'text-red-400';
      default:
        return 'text-soyl-silver';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'SHIPPED':
      case 'DELIVERED':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'CANCELLED':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-soyl-black text-soyl-white pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
            <p className="text-soyl-silver mb-8">
              {error || 'The order you are looking for does not exist.'}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soyl-black text-soyl-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircleIcon className="w-12 h-12 text-green-400" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-soyl-silver">
              Thank you for your purchase. We've sent a confirmation email to your registered email address.
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Info */}
              <div>
                <h2 className="text-xl font-bold mb-4">Order Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-soyl-silver">Order ID:</span>
                    <span className="font-mono text-soyl-gold">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soyl-silver">Status:</span>
                    <span className={`flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soyl-silver">Order Date:</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soyl-silver">Payment Method:</span>
                    <span className="flex items-center gap-2">
                      <CreditCardIcon className="w-4 h-4" />
                      {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 
                       order.paymentMethod === 'MOCK_CARD' ? 'Credit/Debit Card' :
                       order.paymentMethod === 'MOCK_UPI' ? 'UPI Payment' : order.paymentMethod}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-soyl-silver">Tracking Number:</span>
                      <span className="font-mono text-soyl-gold">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div>
                <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CalendarIcon className="w-5 h-5 text-soyl-gold mt-0.5" />
                    <div>
                      <p className="text-soyl-silver text-sm">Estimated Delivery</p>
                      <p className="font-semibold">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-soyl-gold mt-0.5" />
                    <div>
                      <p className="text-soyl-silver text-sm">Delivery Address</p>
                      <div className="text-sm">
                        <p className="font-semibold">{order.address.name}</p>
                        <p>{order.address.line1}</p>
                        {order.address.line2 && <p>{order.address.line2}</p>}
                        <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                        <p>{order.address.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.itemId} className="flex items-center gap-4 p-4 bg-soyl-black/20 rounded-lg">
                  <div className="w-16 h-16 bg-soyl-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-soyl-silver text-sm">SKU: {item.sku}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-soyl-gold font-semibold">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <span className="text-soyl-silver text-sm">× {item.quantity}</span>
                      <span className="text-soyl-gold font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 18%)</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-soyl-gold/20 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-soyl-gold">₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={downloadInvoice}
              disabled={downloadingInvoice}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-soyl-gold hover:bg-soyl-gold/90 disabled:bg-gray-600 text-soyl-black rounded-lg font-semibold transition-colors"
            >
              {downloadingInvoice ? (
                <>
                  <div className="w-4 h-4 border-2 border-soyl-black border-t-transparent rounded-full animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download Invoice
                </>
              )}
            </button>
            
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-soyl-gold text-soyl-gold hover:bg-soyl-gold hover:text-soyl-black rounded-lg font-semibold transition-colors"
            >
              <EyeIcon className="w-5 h-5" />
              View All Orders
            </Link>
            
            <Link
              to="/catalog"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-soyl-gold/30 text-soyl-gold hover:border-soyl-gold rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-soyl-silver text-sm mb-4">
              Need help with your order? Contact our customer support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="mailto:support@soyl.com" className="text-soyl-gold hover:text-soyl-gold/80">
                support@soyl.com
              </a>
              <a href="tel:+91-9876543210" className="text-soyl-gold hover:text-soyl-gold/80">
                +91-9876543210
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
