import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export interface Address {
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

export interface ShippingOption {
  id: string;
  label: string;
  price: number;
  estimatedDays: number[];
}

export interface Order {
  orderId: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: any[];
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

// Mock data
const mockAddresses: Address[] = [
  {
    addressId: 'addr_1',
    name: 'Ryan Gomez',
    phone: '+91 98765 43210',
    line1: '123 MG Road',
    line2: 'Apartment 4B',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    isDefault: true,
  }
];

const mockShippingOptions: ShippingOption[] = [
  {
    id: 'SHIP_STD',
    label: 'Standard Delivery',
    price: 40,
    estimatedDays: [3, 7],
  },
  {
    id: 'SHIP_EXP',
    label: 'Express Delivery',
    price: 150,
    estimatedDays: [1, 2],
  },
];

const mockOrders: Order[] = [];

// Address API handlers
export async function getAddressesHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Get addresses handler called');
  
  try {
    // In a real implementation, fetch from DynamoDB based on userId/sessionId
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(mockAddresses),
    };
  } catch (error) {
    console.error('Error getting addresses:', error);
    
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

export async function createAddressHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Create address handler called');
  
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
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'line1', 'city', 'state', 'pincode', 'country'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Create new address
    const newAddress: Address = {
      addressId: `addr_${Date.now()}`,
      name: body.name,
      phone: body.phone,
      line1: body.line1,
      line2: body.line2 || '',
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      country: body.country,
      isDefault: mockAddresses.length === 0, // First address is default
    };

    mockAddresses.push(newAddress);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(newAddress),
    };
  } catch (error) {
    console.error('Error creating address:', error);
    
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

export async function deleteAddressHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Delete address handler called');
  
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
    const addressId = event.pathParameters?.addressId;
    
    if (!addressId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Address ID is required' }),
      };
    }

    // Remove address
    const index = mockAddresses.findIndex(addr => addr.addressId === addressId);
    if (index === -1) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Address not found' }),
      };
    }

    mockAddresses.splice(index, 1);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Address deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting address:', error);
    
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

// Shipping API handler
export async function getShippingOptionsHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Get shipping options handler called');
  
  try {
    // In a real implementation, calculate shipping based on address and cart weight
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(mockShippingOptions),
    };
  } catch (error) {
    console.error('Error getting shipping options:', error);
    
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

// Payment API handler
export async function mockPaymentHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Mock payment handler called');
  
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
    
    // Validate required fields
    const requiredFields = ['checkoutId', 'method', 'amount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Simulate payment processing
    const simulate = body.simulate || 'success';
    
    if (simulate === 'fail') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          paymentId: `pay_${Date.now()}`,
          status: 'FAILED',
          error: 'INSUFFICIENT_FUNDS',
          message: 'Mock: payment declined',
        }),
      };
    }

    // Successful payment
    const paymentResponse = {
      paymentId: `pay_${Date.now()}`,
      status: 'SUCCESS',
      gatewayResponse: 'Mock OK',
      transactionRef: `TXN_${Date.now()}`,
      checkoutId: body.checkoutId,
      method: body.method,
      amount: body.amount,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(paymentResponse),
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    
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

// Order API handlers
export async function createOrderHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Create order handler called');
  
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
    
    // Validate required fields
    const requiredFields = ['checkoutId', 'paymentId', 'cartSnapshot', 'addressSnapshot', 'shipping', 'total'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Create order
    const orderId = `ORD_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${String(mockOrders.length + 1).padStart(4, '0')}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days from now

    const newOrder: Order = {
      orderId,
      status: 'CONFIRMED',
      items: body.cartSnapshot.items || [],
      subtotal: body.cartSnapshot.subtotal || 0,
      shipping: body.shipping === 'SHIP_STD' ? 40 : 150,
      tax: (body.cartSnapshot.subtotal + (body.shipping === 'SHIP_STD' ? 40 : 150)) * 0.18,
      total: body.total,
      currency: 'INR',
      address: body.addressSnapshot,
      paymentMethod: body.paymentMethod || 'MOCK_CARD',
      createdAt: new Date().toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      trackingNumber: `TRK${Date.now()}`,
    };

    mockOrders.push(newOrder);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        orderId: newOrder.orderId,
        status: newOrder.status,
        estimatedDelivery: newOrder.estimatedDelivery,
      }),
    };
  } catch (error) {
    console.error('Error creating order:', error);
    
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

export async function getOrderHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Get order handler called');
  
  try {
    const orderId = event.pathParameters?.orderId;
    
    if (!orderId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Order ID is required' }),
      };
    }

    const order = mockOrders.find(o => o.orderId === orderId);
    
    if (!order) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Order not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error('Error getting order:', error);
    
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

export async function getOrderInvoiceHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Get order invoice handler called');
  
  try {
    const orderId = event.pathParameters?.orderId;
    
    if (!orderId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Order ID is required' }),
      };
    }

    const order = mockOrders.find(o => o.orderId === orderId);
    
    if (!order) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Order not found' }),
      };
    }

    // In a real implementation, generate PDF invoice
    // For now, return a mock PDF content
    const mockPdfContent = `Invoice for Order ${orderId}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderId}.pdf"`,
        'Access-Control-Allow-Origin': '*',
      },
      body: mockPdfContent,
    };
  } catch (error) {
    console.error('Error getting order invoice:', error);
    
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

// Notification API handler
export async function sendOrderEmailHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Send order email handler called');
  
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
    
    const { orderId, email } = body;
    
    if (!orderId || !email) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Order ID and email are required' }),
      };
    }

    // In a real implementation, send email via SES or similar service
    console.log(`Sending order confirmation email to ${email} for order ${orderId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        message: 'Order confirmation email sent successfully',
        orderId,
        email,
      }),
    };
  } catch (error) {
    console.error('Error sending order email:', error);
    
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
