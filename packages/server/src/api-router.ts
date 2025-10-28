import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as cartWishlist from './cart-wishlist-api';
import { chatbotResponsesHandler } from './chatbot-api';

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

