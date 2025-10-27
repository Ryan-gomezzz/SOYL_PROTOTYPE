import { describe, it, expect } from '@jest/globals';
import {
  getCartHandler,
  addItemHandler,
  mergeCartHandler,
  getWishlistHandler,
  shareWishlistHandler
} from './cart-wishlist-api';

// Mock event factory
const createMockEvent = (path: string, method: string, body?: any, userId?: string) => ({
  path,
  httpMethod: method,
  body: body ? JSON.stringify(body) : undefined,
  headers: {
    Authorization: userId ? `Bearer ${userId}-token` : '',
  },
  pathParameters: {},
} as any);

describe('Cart API', () => {
  it('should get empty cart for new user', async () => {
    const event = createMockEvent('/api/cart', 'GET', undefined, 'user-123');
    const result = await getCartHandler(event);
    
    expect(result.statusCode).toBe(200);
    const data = JSON.parse(result.body);
    expect(data.cart).toBeDefined();
    expect(data.cart.items).toEqual([]);
  });

  it('should add item to cart', async () => {
    const event = createMockEvent('/api/cart/items', 'POST', {
      productId: 'prod-123',
      name: 'Test Product',
      priceAtAdd: 99.99,
      quantity: 1
    }, 'user-123');
    
    const result = await addItemHandler(event);
    expect(result.statusCode).toBe(200);
    const data = JSON.parse(result.body);
    expect(data.cart.items.length).toBe(1);
    expect(data.cart.items[0].name).toBe('Test Product');
  });

  it('should merge local cart with server cart', async () => {
    const localCart = {
      items: [
        {
          id: 'item-1',
          productId: 'prod-123',
          name: 'Local Product',
          priceAtAdd: 50,
          quantity: 2
        }
      ]
    };

    const event = createMockEvent('/api/cart/merge', 'POST', localCart, 'user-123');
    const result = await mergeCartHandler(event);
    
    expect(result.statusCode).toBe(200);
    const data = JSON.parse(result.body);
    expect(data.cart.items.length).toBeGreaterThan(0);
  });

  it('should reject unauthorized cart operations', async () => {
    const event = createMockEvent('/api/cart/merge', 'POST', { items: [] });
    const result = await mergeCartHandler(event);
    
    expect(result.statusCode).toBe(401);
  });
});

describe('Wishlist API', () => {
  it('should get empty wishlist for new user', async () => {
    const event = createMockEvent('/api/wishlist', 'GET', undefined, 'user-123');
    const result = await getWishlistHandler(event);
    
    expect(result.statusCode).toBe(200);
    const data = JSON.parse(result.body);
    expect(data.wishlist).toBeDefined();
    expect(data.wishlist.items).toEqual([]);
  });

  it('should generate shareable wishlist link', async () => {
    const event = createMockEvent('/api/wishlist/share', 'POST', undefined, 'user-123');
    const result = await shareWishlistHandler(event);
    
    expect(result.statusCode).toBe(200);
    const data = JSON.parse(result.body);
    expect(data.shareToken).toBeDefined();
    expect(data.shareLink).toBeDefined();
  });

  it('should reject unauthorized wishlist operations', async () => {
    const event = createMockEvent('/api/wishlist', 'GET');
    const result = await getWishlistHandler(event);
    
    expect(result.statusCode).toBe(401);
  });
});

