import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CreditCardIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface PaymentMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: string;
  amount: number;
  onSuccess: (data: any) => void;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

const PaymentMockModal: React.FC<PaymentMockModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  onSuccess,
}) => {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processingTime, setProcessingTime] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstInput = modalRef.current.querySelector('input');
      firstInput?.focus();
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  // Escape key handling
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const validateCardForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardData.name.trim()) {
      newErrors.name = 'Cardholder name is required';
    }

    if (!cardData.number.trim()) {
      newErrors.number = 'Card number is required';
    } else if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardData.number)) {
      newErrors.number = 'Please enter a valid 16-digit card number';
    }

    if (!cardData.expiry.trim()) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = 'Please enter expiry in MM/YY format';
    }

    if (!cardData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3}$/.test(cardData.cvv)) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpiForm = () => {
    const newErrors: Record<string, string> = {};

    if (!upiId.trim()) {
      newErrors.upi = 'UPI ID is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(upiId)) {
      newErrors.upi = 'Please enter a valid UPI ID';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handlePayment = async () => {
    let isValid = false;

    if (paymentMethod === 'MOCK_CARD') {
      isValid = validateCardForm();
    } else if (paymentMethod === 'MOCK_UPI') {
      isValid = validateUpiForm();
    } else if (paymentMethod === 'COD') {
      isValid = true;
    }

    if (!isValid) return;

    setStatus('processing');
    setProcessingTime(0);

    // Simulate processing time
    const interval = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);

    try {
      // Simulate API call
      const response = await fetch('/api/payments/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutId: `chk_${Date.now()}`,
          method: paymentMethod,
          amount,
          card: paymentMethod === 'MOCK_CARD' ? {
            name: cardData.name,
            last4: cardData.number.slice(-4),
            expMonth: parseInt(cardData.expiry.split('/')[0]),
            expYear: parseInt('20' + cardData.expiry.split('/')[1]),
          } : undefined,
          upiId: paymentMethod === 'MOCK_UPI' ? upiId : undefined,
          simulate: 'success', // Always simulate success for demo
        }),
      });

      if (response.ok) {
        const paymentData = await response.json();
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setStatus('success');
        
        // Track analytics
        trackEvent('payment_success', {
          paymentId: paymentData.paymentId,
          method: paymentMethod,
          amount,
        });

        // Call success callback after delay
        setTimeout(() => {
          onSuccess(paymentData);
        }, 1500);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setStatus('failed');
      
      // Track analytics
      trackEvent('payment_failed', {
        method: paymentMethod,
        amount,
        error: 'network_error',
      });
    } finally {
      clearInterval(interval);
    }
  };

  const trackEvent = (eventName: string, parameters: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setCardData({ name: '', number: '', expiry: '', cvv: '' });
    setUpiId('');
    setErrors({});
    setProcessingTime(0);
  };

  const handleClose = () => {
    if (status === 'processing') return; // Prevent closing during processing
    resetForm();
    onClose();
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-soyl-black border border-soyl-gold/20 rounded-lg w-full max-w-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-soyl-gold/20">
                <h2 id="payment-modal-title" className="text-xl font-bold">
                  {paymentMethod === 'MOCK_CARD' && 'Card Payment'}
                  {paymentMethod === 'MOCK_UPI' && 'UPI Payment'}
                  {paymentMethod === 'COD' && 'Cash on Delivery'}
                </h2>
                <button
                  onClick={handleClose}
                  disabled={status === 'processing'}
                  className="p-2 hover:bg-soyl-gold/10 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Close payment modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Amount */}
                <div className="text-center mb-6">
                  <p className="text-soyl-silver text-sm">Amount to pay</p>
                  <p className="text-3xl font-bold text-soyl-gold">₹{amount.toFixed(2)}</p>
                </div>

                {/* Payment Form */}
                {status === 'idle' && (
                  <div className="space-y-4">
                    {paymentMethod === 'MOCK_CARD' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardData.name}
                            onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-3 py-2 bg-soyl-white/5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                              errors.name ? 'border-red-500' : 'border-soyl-gold/30'
                            }`}
                            placeholder="John Doe"
                            aria-describedby={errors.name ? 'name-error' : undefined}
                          />
                          {errors.name && (
                            <p id="name-error" className="text-red-400 text-sm mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardData.number}
                            onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                            className={`w-full px-3 py-2 bg-soyl-white/5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                              errors.number ? 'border-red-500' : 'border-soyl-gold/30'
                            }`}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            aria-describedby={errors.number ? 'number-error' : undefined}
                          />
                          {errors.number && (
                            <p id="number-error" className="text-red-400 text-sm mt-1">
                              {errors.number}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                              className={`w-full px-3 py-2 bg-soyl-white/5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                                errors.expiry ? 'border-red-500' : 'border-soyl-gold/30'
                              }`}
                              placeholder="MM/YY"
                              maxLength={5}
                              aria-describedby={errors.expiry ? 'expiry-error' : undefined}
                            />
                            {errors.expiry && (
                              <p id="expiry-error" className="text-red-400 text-sm mt-1">
                                {errors.expiry}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              value={cardData.cvv}
                              onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                              className={`w-full px-3 py-2 bg-soyl-white/5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                                errors.cvv ? 'border-red-500' : 'border-soyl-gold/30'
                              }`}
                              placeholder="123"
                              maxLength={3}
                              aria-describedby={errors.cvv ? 'cvv-error' : undefined}
                            />
                            {errors.cvv && (
                              <p id="cvv-error" className="text-red-400 text-sm mt-1">
                                {errors.cvv}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {paymentMethod === 'MOCK_UPI' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className={`w-full px-3 py-2 bg-soyl-white/5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                            errors.upi ? 'border-red-500' : 'border-soyl-gold/30'
                          }`}
                          placeholder="yourname@paytm"
                          aria-describedby={errors.upi ? 'upi-error' : undefined}
                        />
                        {errors.upi && (
                          <p id="upi-error" className="text-red-400 text-sm mt-1">
                            {errors.upi}
                          </p>
                        )}
                      </div>
                    )}

                    {paymentMethod === 'COD' && (
                      <div className="text-center py-8">
                        <TruckIcon className="w-16 h-16 text-soyl-gold mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Cash on Delivery</h3>
                        <p className="text-soyl-silver text-sm">
                          Pay ₹{amount.toFixed(2)} when your order arrives
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handlePayment}
                      className="w-full bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black py-3 rounded-lg font-semibold transition-colors"
                    >
                      {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                    </button>
                  </div>
                )}

                {/* Processing State */}
                {status === 'processing' && (
                  <div className="text-center py-8">
                    <motion.div
                      className="w-16 h-16 border-4 border-soyl-gold border-t-transparent rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                    <p className="text-soyl-silver text-sm">
                      Please wait while we process your payment...
                    </p>
                    <p className="text-soyl-gold text-sm mt-2">
                      {processingTime}s
                    </p>
                  </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-green-400">
                      Payment Successful!
                    </h3>
                    <p className="text-soyl-silver text-sm">
                      Your order is being processed
                    </p>
                  </div>
                )}

                {/* Failed State */}
                {status === 'failed' && (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-red-400">
                      Payment Failed
                    </h3>
                    <p className="text-soyl-silver text-sm mb-4">
                      There was an error processing your payment
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="px-6 py-2 bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black rounded-lg font-semibold transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-soyl-gold/20 bg-soyl-white/5 rounded-b-lg">
                <p className="text-xs text-soyl-silver text-center">
                  This is a mock payment system for demonstration purposes only.
                  No real money will be charged.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentMockModal;
