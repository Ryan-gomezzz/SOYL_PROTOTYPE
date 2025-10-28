# SOYL Cart & Checkout System

## Overview

Complete end-to-end cart and checkout system with mock payment processing, address management, and order confirmation. Built with React components and REST API endpoints.

## Features

### Cart Management
- **Cart Page**: Full cart view with item management, quantity controls, and coupon application
- **Mini Cart**: Header dropdown with quick edit capabilities
- **Real-time Updates**: Live subtotal calculation and item management
- **Coupon Support**: Apply discount codes with validation

### Checkout Flow
- **3-Step Process**: Contact/Address → Shipping → Payment
- **Address Management**: Save, edit, and delete addresses
- **Shipping Options**: Standard and express delivery with pricing
- **Payment Methods**: Mock Card, UPI, and Cash on Delivery

### Order Management
- **Order Confirmation**: Detailed order summary with tracking
- **Invoice Download**: PDF invoice generation
- **Email Notifications**: Order confirmation emails
- **Order Tracking**: Status updates and delivery estimates

## Components

### Frontend Components

#### Pages
- `Cart.tsx` - Full cart page with item management
- `Checkout.tsx` - 3-step checkout process
- `OrderConfirmation.tsx` - Order success page

#### Components
- `MiniCart.tsx` - Header dropdown cart
- `AddressForm.tsx` - Address input with validation
- `PaymentMockModal.tsx` - Payment processing modal
- `OrderSummary.tsx` - Checkout summary sidebar

### Backend API

#### Cart API (`/api/cart`)
- `GET /api/cart` - Get cart contents
- `POST/PATCH /api/cart` - Add/update items
- `DELETE /api/cart/{itemId}` - Remove item
- `POST /api/cart/coupon` - Apply coupon code

#### Address API (`/api/addresses`)
- `GET /api/addresses` - Get saved addresses
- `POST /api/addresses` - Create new address
- `DELETE /api/addresses/{addressId}` - Delete address

#### Shipping API (`/api/shipping`)
- `GET /api/shipping?addressId={id}&cartId={id}` - Get shipping options

#### Payment API (`/api/payments`)
- `POST /api/payments/mock` - Process mock payment

#### Order API (`/api/orders`)
- `POST /api/orders` - Create new order
- `GET /api/orders/{orderId}` - Get order details
- `GET /api/orders/{orderId}/invoice` - Download invoice PDF

#### Notification API (`/api/notifications`)
- `POST /api/notifications/send-order-email` - Send order confirmation email

## Data Schemas

### Cart
```typescript
interface Cart {
  cartId: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
}

interface CartItem {
  itemId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
}
```

### Address
```typescript
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
```

### Order
```typescript
interface Order {
  orderId: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: CartItem[];
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
```

## User Flow

1. **Add to Cart**: User adds products to cart
2. **View Cart**: User reviews items, applies coupons, adjusts quantities
3. **Checkout**: User proceeds to 3-step checkout
4. **Address**: Select or add delivery address
5. **Shipping**: Choose shipping method and see costs
6. **Payment**: Select payment method and process payment
7. **Confirmation**: View order details and download invoice

## Validation Rules

### Cart Items
- Quantity: 1-10 items per product
- Price: Must be positive numbers
- SKU: Required for all items

### Addresses
- Name: Required, minimum 2 characters
- Phone: Required, valid Indian phone number format
- Address Line 1: Required, minimum 5 characters
- City: Required, minimum 2 characters
- State: Required, minimum 2 characters
- Pincode: Required, exactly 6 digits (India)

### Payment
- Card Number: 16 digits with proper formatting
- Expiry: MM/YY format
- CVV: 3 digits
- UPI ID: Valid email format

## Analytics Events

The system tracks the following events:

- `add_to_cart` - Item added to cart
- `remove_from_cart` - Item removed from cart
- `update_cart_item` - Item quantity updated
- `view_cart` - Cart page viewed
- `checkout_start` - Checkout process initiated
- `payment_attempt` - Payment processing started
- `payment_success` - Payment completed successfully
- `payment_failed` - Payment failed
- `order_completed` - Order created successfully
- `order_viewed` - Order details viewed
- `invoice_downloaded` - Invoice PDF downloaded

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: ARIA labels and roles throughout
- **Focus Management**: Proper focus handling in modals and forms
- **Error Announcements**: Live regions for validation messages
- **High Contrast**: Meets WCAG guidelines for color contrast

## Security Considerations

- **Mock Payments**: No real payment processing, uses tokenized responses
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Proper CORS headers for API endpoints
- **Error Handling**: Graceful error handling without exposing internals

## Mock Payment Behavior

### Payment Methods
- **Mock Card**: Simulates credit/debit card processing
- **Mock UPI**: Simulates UPI payment (PhonePe, Google Pay, Paytm)
- **Cash on Delivery**: Immediate order creation with payment due on delivery

### Simulation Options
- `simulate: "success"` - Always succeeds (default)
- `simulate: "fail"` - Always fails with error message
- `simulate: "delay"` - Delays response for testing

### Security
- Only stores last 4 digits of card numbers
- No full PAN storage
- Tokenized payment responses

## Testing Scenarios

### Cart Operations
- Add items to cart
- Update quantities (1-10 range)
- Remove items
- Apply valid/invalid coupons
- Empty cart handling

### Checkout Flow
- Guest checkout
- Logged-in user checkout
- Address validation
- Shipping option selection
- Payment method selection

### Payment Processing
- Successful payments
- Failed payments
- Network errors
- Invalid card details

### Order Management
- Order creation
- Order confirmation
- Invoice download
- Email notifications

## Environment Variables

```bash
# Cart & Checkout
CART_TABLE=SOYL-Cart
ADDRESS_TABLE=SOYL-Addresses
ORDER_TABLE=SOYL-Orders

# Payment
PAYMENT_GATEWAY_URL=https://api.payment-gateway.com
PAYMENT_WEBHOOK_SECRET=your-webhook-secret

# Email
SES_REGION=us-east-1
FROM_EMAIL=noreply@soyl.com
```

## Deployment Notes

1. **Database Tables**: Ensure DynamoDB tables exist for cart, addresses, and orders
2. **API Gateway**: Configure CORS for frontend domain
3. **Email Service**: Set up SES for order confirmation emails
4. **PDF Generation**: Configure PDF service for invoice generation
5. **Analytics**: Set up Google Analytics or similar for event tracking

## Future Enhancements

- **Real Payment Integration**: Integrate with actual payment gateways
- **Inventory Management**: Real-time stock checking
- **Multi-currency**: Support for different currencies
- **Guest Checkout**: Enhanced guest user experience
- **Order Tracking**: Real-time shipment tracking
- **Returns/Refunds**: Return and refund management
- **Subscription Orders**: Recurring order support
- **Bulk Orders**: Business customer bulk ordering
