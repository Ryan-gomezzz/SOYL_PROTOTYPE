import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

const REGION = process.env.AWS_REGION || 'us-east-1';
const CART_TABLE = process.env.CART_TABLE || 'SOYL-Cart';
const WISHLIST_TABLE = process.env.WISHLIST_TABLE || 'SOYL-Wishlist';
const ddb = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddb);

// Types
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  priceAtAdd: number;
  quantity: number;
  metadata?: Record<string, any>;
}

export interface Cart {
  cartId: string;
  userId: string | null;
  items: CartItem[];
  couponCode?: string;
  shippingEstimate?: { serviceId: string; price: number };
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  note?: string;
  addedAt: string;
}

export interface Wishlist {
  wishlistId: string;
  userId: string;
  name: string;
  items: WishlistItem[];
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper: Extract user ID from JWT token or event
function getUserId(event: APIGatewayProxyEvent): string | null {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) return null;
  
  try {
    // In production, decode JWT to get userId
    // For now, we'll extract from a mock format or use the token directly
    const token = authHeader.replace('Bearer ', '');
    // Mock: token format is "userId-timestamp" or just "userId"
    const userId = token.split('-')[0];
    return userId;
  } catch {
    return null;
  }
}

// Helper: Get cart for user (or create new one)
async function getOrCreateCart(userId: string | null): Promise<Cart> {
  if (!userId) {
    // Anonymous cart - return empty cart structure
    return {
      cartId: `anon-${crypto.randomUUID()}`,
      userId: null,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const existingCart = await ddbDoc.send(new GetCommand({
    TableName: CART_TABLE,
    Key: { userId }
  }));

  if (existingCart.Item) {
    return existingCart.Item as Cart;
  }

  // Create new cart
  const newCart: Cart = {
    cartId: crypto.randomUUID(),
    userId,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await ddbDoc.send(new PutCommand({
    TableName: CART_TABLE,
    Item: newCart,
  }));

  return newCart;
}

// GET /api/cart
export async function getCartHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  const cart = await getOrCreateCart(userId);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ cart }),
  };
}

// POST /api/cart/items
export async function addItemHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  const cart = await getOrCreateCart(userId);

  const body = JSON.parse(event.body || '{}');
  const { productId, variantId, name, priceAtAdd, quantity = 1, metadata } = body;

  if (!productId || !name || priceAtAdd === undefined) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Missing required fields: productId, name, priceAtAdd' }),
    };
  }

  const existingItemIndex = cart.items.findIndex(
    item => item.productId === productId && item.variantId === variantId
  );

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      productId,
      variantId,
      name,
      priceAtAdd,
      quantity,
      metadata,
    };
    cart.items.push(newItem);
  }

  cart.updatedAt = new Date().toISOString();

  if (userId) {
    await ddbDoc.send(new PutCommand({
      TableName: CART_TABLE,
      Item: cart,
    }));
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ cart }),
  };
}

// PATCH /api/cart/items/:itemId
export async function updateItemHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  const cart = await getOrCreateCart(userId);

  const itemId = event.pathParameters?.itemId;
  const body = JSON.parse(event.body || '{}');
  const { quantity, variantId } = body;

  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Item not found' }),
    };
  }

  if (quantity !== undefined) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
  }

  if (variantId !== undefined) {
    cart.items[itemIndex].variantId = variantId;
  }

  cart.updatedAt = new Date().toISOString();

  if (userId) {
    await ddbDoc.send(new PutCommand({
      TableName: CART_TABLE,
      Item: cart,
    }));
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ cart }),
  };
}

// DELETE /api/cart/items/:itemId
export async function deleteItemHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  const cart = await getOrCreateCart(userId);

  const itemId = event.pathParameters?.itemId;
  cart.items = cart.items.filter(item => item.id !== itemId);
  cart.updatedAt = new Date().toISOString();

  if (userId) {
    await ddbDoc.send(new PutCommand({
      TableName: CART_TABLE,
      Item: cart,
    }));
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ cart }),
  };
}

// POST /api/cart/merge
export async function mergeCartHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Must be authenticated to merge cart' }),
    };
  }

  const localCart = JSON.parse(event.body || '{}');
  const serverCart = await getOrCreateCart(userId);

  // Merge strategy: combine items, add quantities for matching products
  localCart.items?.forEach((localItem: CartItem) => {
    const existingItemIndex = serverCart.items.findIndex(
      item => item.productId === localItem.productId && item.variantId === localItem.variantId
    );

    if (existingItemIndex >= 0) {
      serverCart.items[existingItemIndex].quantity += localItem.quantity;
    } else {
      serverCart.items.push(localItem);
    }
  });

  serverCart.updatedAt = new Date().toISOString();

  await ddbDoc.send(new PutCommand({
    TableName: CART_TABLE,
    Item: serverCart,
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ cart: serverCart }),
  };
}

// POST /api/cart/apply-coupon
export async function applyCouponHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  const cart = await getOrCreateCart(userId);

  const { couponCode } = JSON.parse(event.body || '{}');

  // TODO: Validate coupon against database
  // For now, accept basic validation
  if (couponCode && couponCode.length > 0) {
    cart.couponCode = couponCode;
    cart.updatedAt = new Date().toISOString();

    if (userId) {
      await ddbDoc.send(new PutCommand({
        TableName: CART_TABLE,
        Item: cart,
      }));
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ cart }),
  };
}

// POST /api/cart/validate-checkout
export async function validateCheckoutHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  const cart = await getOrCreateCart(userId);

  // Validate inventory, pricing, shipping
  const validationResults = {
    valid: true,
    errors: [] as string[],
    subtotal: cart.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0),
    shipping: cart.shippingEstimate?.price || 0,
    tax: 0, // Calculate tax
    total: 0,
  };

  // Check each item for inventory
  for (const item of cart.items) {
    // TODO: Check actual inventory against database
    // For now, just validate structure
    if (item.quantity <= 0) {
      validationResults.valid = false;
      validationResults.errors.push(`Invalid quantity for ${item.name}`);
    }
  }

  if (validationResults.valid) {
    // Calculate totals
    validationResults.tax = validationResults.subtotal * 0.08; // 8% tax example
    validationResults.total = validationResults.subtotal + validationResults.shipping + validationResults.tax;
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(validationResults),
  };
}

// GET /api/wishlist
export async function getWishlistHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Must be authenticated' }),
    };
  }

  const result = await ddbDoc.send(new GetCommand({
    TableName: WISHLIST_TABLE,
    Key: { userId },
  }));

  const wishlist = result.Item ? (result.Item as Wishlist) : {
    wishlistId: crypto.randomUUID(),
    userId,
    name: 'My Wishlist',
    items: [],
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ wishlist }),
  };
}

// POST /api/wishlist/items
export async function addWishlistItemHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Must be authenticated' }),
    };
  }

  const body = JSON.parse(event.body || '{}');
  const { productId, variantId, note } = body;

  if (!productId) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Missing productId' }),
    };
  }

  // Get existing wishlist
  const result = await ddbDoc.send(new GetCommand({
    TableName: WISHLIST_TABLE,
    Key: { userId },
  }));

  let wishlist: Wishlist;
  if (result.Item) {
    wishlist = result.Item as Wishlist;
  } else {
    wishlist = {
      wishlistId: crypto.randomUUID(),
      userId,
      name: 'My Wishlist',
      items: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Check if already exists
  const existingIndex = wishlist.items.findIndex(
    item => item.productId === productId && item.variantId === variantId
  );

  if (existingIndex >= 0) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ wishlist, message: 'Already in wishlist' }),
    };
  }

  // Add item
  const newItem: WishlistItem = {
    id: crypto.randomUUID(),
    productId,
    variantId,
    note,
    addedAt: new Date().toISOString(),
  };

  wishlist.items.push(newItem);
  wishlist.updatedAt = new Date().toISOString();

  await ddbDoc.send(new PutCommand({
    TableName: WISHLIST_TABLE,
    Item: wishlist,
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ wishlist }),
  };
}

// DELETE /api/wishlist/items/:id
export async function deleteWishlistItemHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Must be authenticated' }),
    };
  }

  const itemId = event.pathParameters?.id;

  // Get existing wishlist
  const result = await ddbDoc.send(new GetCommand({
    TableName: WISHLIST_TABLE,
    Key: { userId },
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Wishlist not found' }),
    };
  }

  const wishlist = result.Item as Wishlist;
  wishlist.items = wishlist.items.filter(item => item.id !== itemId);
  wishlist.updatedAt = new Date().toISOString();

  await ddbDoc.send(new PutCommand({
    TableName: WISHLIST_TABLE,
    Item: wishlist,
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ wishlist }),
  };
}

// POST /api/wishlist/share
export async function shareWishlistHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Must be authenticated' }),
    };
  }

  const result = await ddbDoc.send(new GetCommand({
    TableName: WISHLIST_TABLE,
    Key: { userId },
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Wishlist not found' }),
    };
  }

  const wishlist = result.Item as Wishlist;

  // Generate share token
  const shareToken = crypto.randomBytes(16).toString('hex');
  wishlist.shareToken = shareToken;
  wishlist.isPublic = true;
  wishlist.updatedAt = new Date().toISOString();

  await ddbDoc.send(new PutCommand({
    TableName: WISHLIST_TABLE,
    Item: wishlist,
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ 
      shareToken,
      shareLink: `/wishlist/${shareToken}` 
    }),
  };
}

// GET /api/wishlist/shared/:token
export async function getSharedWishlistHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const token = event.pathParameters?.token;

  // Scan for wishlist with matching share token
  // In production, use GSI for better performance
  const result = await ddbDoc.send(new GetCommand({
    TableName: WISHLIST_TABLE,
    Key: { userId: token } // Simplified - should use GSI
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Shared wishlist not found' }),
    };
  }

  const wishlist = result.Item as Wishlist;
  if (!wishlist.isPublic || wishlist.shareToken !== token) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Access denied' }),
    };
  }

  // Return wishlist without sensitive user data
  const publicWishlist = {
    wishlistId: wishlist.wishlistId,
    name: wishlist.name,
    items: wishlist.items,
    isPublic: wishlist.isPublic,
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ wishlist: publicWishlist }),
  };
}

