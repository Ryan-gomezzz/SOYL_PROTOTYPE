import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  CreditCardIcon, 
  TruckIcon, 
  MapPinIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import AddressForm from '../components/checkout/AddressForm';
import PaymentMockModal from '../components/checkout/PaymentMockModal';
import OrderSummary from '../components/checkout/OrderSummary';

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

interface CheckoutData {
  cartId: string;
  addressId?: string;
  shippingId?: string;
  contactEmail: string;
  billingSameAsShipping: boolean;
  paymentMethod?: string;
}

const CheckoutLayout: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const steps = [
    { id: 1, name: 'Contact & Address', icon: MapPinIcon },
    { id: 2, name: 'Shipping', icon: TruckIcon },
    { id: 3, name: 'Payment', icon: CreditCardIcon },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load cart
      const cartResponse = await fetch('/api/cart');
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setCart(cartData);
      }

      // Load addresses
      const addressesResponse = await fetch('/api/addresses');
      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json();
        setAddresses(addressesData);
        const defaultAddress = addressesData.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }

    } catch (err) {
      console.error('Failed to load checkout data:', err);
      setError('Failed to load checkout data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = async (address: Address) => {
    setSelectedAddress(address);
    
    // Load shipping options for this address
    try {
      const response = await fetch(`/api/shipping?addressId=${address.addressId}&cartId=${cart?.cartId}`);
      if (response.ok) {
        const shippingData = await response.json();
        setShippingOptions(shippingData);
        
        // Auto-select first shipping option
        if (shippingData.length > 0) {
          setSelectedShipping(shippingData[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load shipping options:', err);
    }
  };

  const handleAddressSave = async (addressData: Omit<Address, 'addressId' | 'isDefault'>) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addressData, saveForFuture: true }),
      });

      if (response.ok) {
        const newAddress = await response.json();
        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddress(newAddress);
        
        // Load shipping options for new address
        await handleAddressSelect(newAddress);
      } else {
        throw new Error('Failed to save address');
      }
    } catch (err) {
      console.error('Failed to save address:', err);
      setError('Failed to save address. Please try again.');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedAddress) {
      setError('Please select or add an address to continue.');
      return;
    }
    
    if (currentStep === 2 && !selectedShipping) {
      setError('Please select a shipping option to continue.');
      return;
    }

    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setError(null);
    setCurrentStep(prev => prev - 1);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setCheckoutData(prev => ({
      ...prev,
      cartId: cart?.cartId || '',
      addressId: selectedAddress?.addressId,
      shippingId: selectedShipping?.id,
      contactEmail: selectedAddress?.phone || '',
      billingSameAsShipping: true,
      paymentMethod: method,
    }));
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutId: paymentData.checkoutId,
          paymentId: paymentData.paymentId,
          cartSnapshot: cart,
          addressSnapshot: selectedAddress,
          shipping: selectedShipping?.id,
          total: calculateTotal(),
          currency: 'INR',
        }),
      });

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        
        // Send confirmation email
        await fetch('/api/notifications/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            email: checkoutData?.contactEmail,
          }),
        });

        // Redirect to order confirmation
        window.location.href = `/order-confirmation/${orderData.orderId}`;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      console.error('Failed to complete order:', err);
      setError('Failed to complete order. Please try again.');
    }
  };

  const calculateTotal = () => {
    if (!cart || !selectedShipping) return 0;
    const subtotal = cart.subtotal;
    const shipping = selectedShipping.price;
    const tax = (subtotal + shipping) * 0.18; // 18% GST
    return subtotal + shipping + tax;
  };

  const trackEvent = (eventName: string, parameters: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
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
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-soyl-silver mb-8">
              Add some items to your cart before proceeding to checkout.
            </p>
            <a
              href="/catalog"
              className="inline-flex items-center gap-2 bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soyl-black text-soyl-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Checkout</h1>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between max-w-2xl">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isCompleted 
                        ? 'bg-soyl-gold border-soyl-gold text-soyl-black' 
                        : isActive 
                        ? 'border-soyl-gold text-soyl-gold' 
                        : 'border-soyl-silver text-soyl-silver'
                    }`}>
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-soyl-gold' : 'text-soyl-silver'
                    }`}>
                      {step.name}
                    </span>
                    {index < steps.length - 1 && (
                      <ArrowRightIcon className="w-4 h-4 text-soyl-silver mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Contact & Address */}
                {currentStep === 1 && (
                  <div className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <MapPinIcon className="w-6 h-6 text-soyl-gold" />
                      Contact & Address
                    </h2>
                    
                    <AddressForm
                      addresses={addresses}
                      selectedAddress={selectedAddress}
                      onAddressSelect={handleAddressSelect}
                      onAddressSave={handleAddressSave}
                    />
                  </div>
                )}

                {/* Step 2: Shipping */}
                {currentStep === 2 && (
                  <div className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <TruckIcon className="w-6 h-6 text-soyl-gold" />
                      Shipping Options
                    </h2>
                    
                    <div className="space-y-4">
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedShipping?.id === option.id
                              ? 'border-soyl-gold bg-soyl-gold/10'
                              : 'border-soyl-gold/30 hover:border-soyl-gold/50'
                          }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{option.label}</h3>
                              <p className="text-soyl-silver text-sm">
                                {option.estimatedDays[0]}-{option.estimatedDays[1]} days
                              </p>
                            </div>
                            <div className="text-soyl-gold font-semibold">
                              ₹{option.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <CreditCardIcon className="w-6 h-6 text-soyl-gold" />
                      Payment Method
                    </h2>
                    
                    <div className="space-y-4">
                      <div
                        className="p-4 border border-soyl-gold/30 rounded-lg cursor-pointer hover:border-soyl-gold/50 transition-colors"
                        onClick={() => handlePaymentMethodSelect('MOCK_CARD')}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCardIcon className="w-6 h-6 text-soyl-gold" />
                          <div>
                            <h3 className="font-semibold">Credit/Debit Card</h3>
                            <p className="text-soyl-silver text-sm">Visa, Mastercard, RuPay</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className="p-4 border border-soyl-gold/30 rounded-lg cursor-pointer hover:border-soyl-gold/50 transition-colors"
                        onClick={() => handlePaymentMethodSelect('MOCK_UPI')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                            UPI
                          </div>
                          <div>
                            <h3 className="font-semibold">UPI Payment</h3>
                            <p className="text-soyl-silver text-sm">PhonePe, Google Pay, Paytm</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className="p-4 border border-soyl-gold/30 rounded-lg cursor-pointer hover:border-soyl-gold/50 transition-colors"
                        onClick={() => handlePaymentMethodSelect('COD')}
                      >
                        <div className="flex items-center gap-3">
                          <TruckIcon className="w-6 h-6 text-soyl-gold" />
                          <div>
                            <h3 className="font-semibold">Cash on Delivery</h3>
                            <p className="text-soyl-silver text-sm">Pay when your order arrives</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {checkoutData?.paymentMethod && (
                      <div className="mt-6">
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="w-full bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black py-3 rounded-lg font-semibold transition-colors"
                        >
                          Complete Payment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-soyl-gold/30 text-soyl-gold hover:border-soyl-gold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Previous
                </button>
                
                {currentStep < 3 && (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black rounded-lg font-semibold transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                cart={cart}
                selectedShipping={selectedShipping}
                selectedAddress={selectedAddress}
                total={calculateTotal()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentMockModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentMethod={checkoutData?.paymentMethod || ''}
          amount={calculateTotal()}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default CheckoutLayout;
