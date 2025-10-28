import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export interface CartItem {
  itemId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
}

// Mock cart data for demonstration
const mockCart: Cart = {
  cartId: 'cart_123',
  items: [
    {
      itemId: 'item_1',
      sku: 'TSHIRT001',
      name: 'SOYL Premium T-Shirt',
      price: 999.99,
      quantity: 2,
      thumbnail: '/images/tshirt-1.jpg'
    },
    {
      itemId: 'item_2',
      sku: 'HOODIE001',
      name: 'SOYL Signature Hoodie',
      price: 1999.99,
      quantity: 1,
      thumbnail: '/images/hoodie-1.jpg'
    }
  ],
  subtotal: 3999.97,
  currency: 'INR'
};

export async function getCartHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Get cart handler called');
  
  try {
    // In a real implementation, you would fetch from DynamoDB based on userId/sessionId
    // For now, return mock data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(mockCart),
    };
  } catch (error) {
    console.error('Error getting cart:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

export async function updateCartHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Update cart handler called');
  
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    
    // Handle different update operations
    if (body.itemId && body.quantity !== undefined) {
      // Update item quantity
      const updatedItems = mockCart.items.map(item => 
        item.itemId === body.itemId 
          ? { ...item, quantity: Math.max(1, Math.min(10, body.quantity)) }
          : item
      );
      
      mockCart.items = updatedItems;
      mockCart.subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } else if (body.sku && body.quantity !== undefined) {
      // Add new item
      const existingItem = mockCart.items.find(item => item.sku === body.sku);
      
      if (existingItem) {
        existingItem.quantity = Math.max(1, Math.min(10, existingItem.quantity + body.quantity));
      } else {
        // Add new item (in real implementation, fetch product details from database)
        const newItem: CartItem = {
          itemId: `item_${Date.now()}`,
          sku: body.sku,
          name: `Product ${body.sku}`,
          price: 999.99,
          quantity: Math.max(1, Math.min(10, body.quantity)),
          thumbnail: '/images/placeholder.jpg'
        };
        mockCart.items.push(newItem);
      }
      
      mockCart.subtotal = mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(mockCart),
    };
  } catch (error) {
    console.error('Error updating cart:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

export async function deleteCartItemHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Delete cart item handler called');
  
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const itemId = event.pathParameters?.itemId;
    
    if (!itemId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Item ID is required' }),
      };
    }

    // Remove item from cart
    mockCart.items = mockCart.items.filter(item => item.itemId !== itemId);
    mockCart.subtotal = mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(mockCart),
    };
  } catch (error) {
    console.error('Error deleting cart item:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

export async function applyCouponHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Apply coupon handler called');
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { code } = body;
    
    if (!code) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Coupon code is required' }),
      };
    }

    // Mock coupon validation
    const validCoupons: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE100': { discount: 100, type: 'fixed' },
      'FIRST20': { discount: 20, type: 'percentage' },
    };

    const coupon = validCoupons[code.toUpperCase()];
    
    if (!coupon) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Invalid coupon code' }),
      };
    }

    // Apply discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (mockCart.subtotal * coupon.discount) / 100;
    } else {
      discountAmount = Math.min(coupon.discount, mockCart.subtotal);
    }

    // Update cart with discount
    const updatedCart = {
      ...mockCart,
      couponCode: code,
      discount: discountAmount,
      subtotal: mockCart.subtotal - discountAmount,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(updatedCart),
    };
  } catch (error) {
    console.error('Error applying coupon:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}
