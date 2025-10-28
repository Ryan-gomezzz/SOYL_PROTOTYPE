import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as cartWishlist from './cart-wishlist-api';
import { chatbotResponsesHandler } from './chatbot-api';
import * as cartApi from './cart-api';
import * as checkoutApi from './checkout-api';

export async function routeRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const path = event.path || '';
  const method = event.httpMethod || 'GET';

  console.log(`Routing: ${method} ${path}`);

  // Cart API routes
  if (path.startsWith('/api/cart')) {
    if (method === 'GET' && path === '/api/cart') {
      return cartWishlist.getCartHandler(event);
    }
    if (method === 'POST' && path === '/api/cart/items') {
      return cartWishlist.addItemHandler(event);
    }
    if (method === 'PATCH' && path.startsWith('/api/cart/items/')) {
      return cartWishlist.updateItemHandler(event);
    }
    if (method === 'DELETE' && path.startsWith('/api/cart/items/')) {
      return cartWishlist.deleteItemHandler(event);
    }
    if (method === 'POST' && path === '/api/cart/merge') {
      return cartWishlist.mergeCartHandler(event);
    }
    if (method === 'POST' && path === '/api/cart/apply-coupon') {
      return cartWishlist.applyCouponHandler(event);
    }
    if (method === 'POST' && path === '/api/cart/validate-checkout') {
      return cartWishlist.validateCheckoutHandler(event);
    }
  }

  // Wishlist API routes
  if (path.startsWith('/api/wishlist')) {
    if (method === 'GET' && path === '/api/wishlist') {
      return cartWishlist.getWishlistHandler(event);
    }
    if (method === 'POST' && path === '/api/wishlist/items') {
      return cartWishlist.addWishlistItemHandler(event);
    }
    if (method === 'DELETE' && path.startsWith('/api/wishlist/items/')) {
      return cartWishlist.deleteWishlistItemHandler(event);
    }
    if (method === 'POST' && path === '/api/wishlist/share') {
      return cartWishlist.shareWishlistHandler(event);
    }
    if (method === 'GET' && path.startsWith('/api/wishlist/shared/')) {
      return cartWishlist.getSharedWishlistHandler(event);
    }
  }

  // Cart API routes
  if (path.startsWith('/api/cart')) {
    if (method === 'GET' && path === '/api/cart') {
      return cartApi.getCartHandler(event);
    }
    if ((method === 'POST' || method === 'PATCH') && path === '/api/cart') {
      return cartApi.updateCartHandler(event);
    }
    if (method === 'DELETE' && path.startsWith('/api/cart/')) {
      return cartApi.deleteCartItemHandler(event);
    }
    if (method === 'POST' && path === '/api/cart/coupon') {
      return cartApi.applyCouponHandler(event);
    }
  }

  // Address API routes
  if (path.startsWith('/api/addresses')) {
    if (method === 'GET' && path === '/api/addresses') {
      return checkoutApi.getAddressesHandler(event);
    }
    if (method === 'POST' && path === '/api/addresses') {
      return checkoutApi.createAddressHandler(event);
    }
    if (method === 'DELETE' && path.startsWith('/api/addresses/')) {
      return checkoutApi.deleteAddressHandler(event);
    }
  }

  // Shipping API routes
  if (path.startsWith('/api/shipping')) {
    if (method === 'GET' && path.startsWith('/api/shipping')) {
      return checkoutApi.getShippingOptionsHandler(event);
    }
  }

  // Payment API routes
  if (path.startsWith('/api/payments')) {
    if (method === 'POST' && path === '/api/payments/mock') {
      return checkoutApi.mockPaymentHandler(event);
    }
  }

  // Order API routes
  if (path.startsWith('/api/orders')) {
    if (method === 'POST' && path === '/api/orders') {
      return checkoutApi.createOrderHandler(event);
    }
    if (method === 'GET' && path.startsWith('/api/orders/') && !path.includes('/invoice')) {
      return checkoutApi.getOrderHandler(event);
    }
    if (method === 'GET' && path.includes('/invoice')) {
      return checkoutApi.getOrderInvoiceHandler(event);
    }
  }

  // Notification API routes
  if (path.startsWith('/api/notifications')) {
    if (method === 'POST' && path === '/api/notifications/send-order-email') {
      return checkoutApi.sendOrderEmailHandler(event);
    }
  }

  // Chatbot API routes
  if (path.startsWith('/api/chatbot')) {
    if (method === 'POST' && path === '/api/chatbot-responses') {
      return chatbotResponsesHandler(event);
    }
  }

  // Default: not found
  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: 'Route not found' }),
  };
}

