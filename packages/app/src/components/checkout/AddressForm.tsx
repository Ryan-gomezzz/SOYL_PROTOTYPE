import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  PlusIcon, 
  CheckIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

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

interface AddressFormProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  onAddressSave: (address: Omit<Address, 'addressId' | 'isDefault'>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  addresses,
  selectedAddress,
  onAddressSelect,
  onAddressSave,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+91|91)?[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Indian phone number';
    }

    if (!formData.line1.trim()) {
      newErrors.line1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onAddressSave(formData);
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    });
    setErrors({});
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Address will be removed from the list by parent component
        window.location.reload(); // Simple refresh for now
      } else {
        throw new Error('Failed to delete address');
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert('Failed to delete address. Please try again.');
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add +91 prefix if not present
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Existing Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Saved Addresses</h3>
          {addresses.map((address) => (
            <div
              key={address.addressId}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAddress?.addressId === address.addressId
                  ? 'border-soyl-gold bg-soyl-gold/10'
                  : 'border-soyl-gold/30 hover:border-soyl-gold/50'
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{address.name}</h4>
                    {address.isDefault && (
                      <span className="px-2 py-1 bg-soyl-gold text-soyl-black text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-soyl-silver text-sm mb-1">{address.phone}</p>
                  <p className="text-soyl-silver text-sm">
                    {address.line1}
                    {address.line2 && `, ${address.line2}`}
                  </p>
                  <p className="text-soyl-silver text-sm">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-soyl-silver text-sm">{address.country}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(address);
                    }}
                    className="p-2 text-soyl-gold hover:bg-soyl-gold/10 rounded-lg transition-colors"
                    aria-label="Edit address"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address.addressId);
                    }}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-label="Delete address"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Address Button */}
      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="w-full p-4 border-2 border-dashed border-soyl-gold/30 hover:border-soyl-gold/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-soyl-gold"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Address
        </button>
      )}

      {/* Address Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-soyl-white/5 border border-soyl-gold/20 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-soyl-silver hover:text-soyl-white transition-colors"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 bg-soyl-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-soyl-gold/30'
                    }`}
                    placeholder="Enter your full name"
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-red-400 text-sm mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))}
                    className={`w-full px-3 py-2 bg-soyl-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-soyl-gold/30'
                    }`}
                    placeholder="+91 98765 43210"
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-red-400 text-sm mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={formData.line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, line1: e.target.value }))}
                  className={`w-full px-3 py-2 bg-soyl-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                    errors.line1 ? 'border-red-500' : 'border-soyl-gold/30'
                  }`}
                  placeholder="House number, street name"
                  aria-describedby={errors.line1 ? 'line1-error' : undefined}
                />
                {errors.line1 && (
                  <p id="line1-error" className="text-red-400 text-sm mt-1">
                    {errors.line1}
                  </p>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.line2}
                  onChange={(e) => setFormData(prev => ({ ...prev, line2: e.target.value }))}
                  className="w-full px-3 py-2 bg-soyl-black border border-soyl-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className={`w-full px-3 py-2 bg-soyl-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-soyl-gold/30'
                    }`}
                    placeholder="City"
                    aria-describedby={errors.city ? 'city-error' : undefined}
                  />
                  {errors.city && (
                    <p id="city-error" className="text-red-400 text-sm mt-1">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className={`w-full px-3 py-2 bg-soyl-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                      errors.state ? 'border-red-500' : 'border-soyl-gold/30'
                    }`}
                    placeholder="State"
                    aria-describedby={errors.state ? 'state-error' : undefined}
                  />
                  {errors.state && (
                    <p id="state-error" className="text-red-400 text-sm mt-1">
                      {errors.state}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    className={`w-full px-3 py-2 bg-soyl-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent ${
                      errors.pincode ? 'border-red-500' : 'border-soyl-gold/30'
                    }`}
                    placeholder="560001"
                    maxLength={6}
                    aria-describedby={errors.pincode ? 'pincode-error' : undefined}
                  />
                  {errors.pincode && (
                    <p id="pincode-error" className="text-red-400 text-sm mt-1">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 bg-soyl-black border border-soyl-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              {/* Save Address Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="saveAddress"
                  defaultChecked
                  className="w-4 h-4 text-soyl-gold bg-soyl-black border-soyl-gold/30 rounded focus:ring-soyl-gold focus:ring-2"
                />
                <label htmlFor="saveAddress" className="text-sm text-soyl-silver">
                  Save this address to your account for faster checkout next time
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-soyl-gold hover:bg-soyl-gold/90 disabled:bg-gray-600 text-soyl-black py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-soyl-black border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-soyl-gold/30 text-soyl-gold hover:border-soyl-gold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressForm;
