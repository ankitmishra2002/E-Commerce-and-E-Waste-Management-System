import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { orders, orderItems, products, cartItems, carts, addresses, returns, users, productMedia } from '../models/schema.js';
import { getCart, clearCart } from './cart.service.js';
import * as trackingService from './tracking.service.js';
import * as notificationService from './notification.service.js';
import * as cache from './cache.service.js';

// Phase 2 Razorpay Placeholders - Scaffolded
/*
const Razorpay = require('razorpay');
export const createRazorpayOrder = async (orderId) => {
  // TODO Phase 2: Initialize Razorpay, fetch order, create payment order
};
export const verifyPaymentSignature = async (paymentDetails) => {
  // TODO Phase 2: Cryptographic validation of signature
};
*/

export const createOrder = async (userId, { addressId, paymentMethod }) => {
  // Fetch cart
  const cart = await getCart(userId);
  if (cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Fetch address to verify existence and ownership
  const [address] = await db.select().from(addresses).where(and(eq(addresses.id, addressId), eq(addresses.userId, userId))).limit(1);
  if (!address) {
    throw new Error('Shipping address not found');
  }

  let createdOrder;

  // Perform checkout atomically in a transaction to prevent race conditions
  if (db.transaction) {
    createdOrder = await db.transaction(async (tx) => {
      // 1. Double check stock and decrement inventory
      for (const item of cart.items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.product.id)).limit(1);
        if (!product || product.isDeleted || !product.isActive) {
          throw new Error(`Product ${item.product.name} is no longer available`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        // Decrement stock
        await tx.update(products)
          .set({ stock: product.stock - item.quantity, updatedAt: new Date() })
          .where(eq(products.id, product.id));
      }

      // 2. Insert Order
      const [order] = await tx.insert(orders).values({
        userId,
        addressId,
        totalAmount: cart.totalAmount,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod
      }).returning();

      // 3. Insert Order Items
      const orderItemsValues = cart.items.map(item => ({
        orderId: order.id,
        productId: item.product.id,
        vendorId: item.product.vendorId, // Denormalized for fast vendor aggregation
        quantity: item.quantity,
        priceAtPurchase: item.product.price
      }));

      await tx.insert(orderItems).values(orderItemsValues);

      // 4. Clear Cart
      const [userCart] = await tx.select().from(carts).where(eq(carts.userId, userId)).limit(1);
      if (userCart) {
        await tx.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
      }

      return order;
    });
  } else {
    // Fallback logic
    for (const item of cart.items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.product.id)).limit(1);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      await db.update(products).set({ stock: product.stock - item.quantity }).where(eq(products.id, product.id));
    }
    const [order] = await db.insert(orders).values({
      userId,
      addressId,
      totalAmount: cart.totalAmount,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod
    }).returning();
    const orderItemsValues = cart.items.map(item => ({
      orderId: order.id,
      productId: item.product.id,
      vendorId: item.product.vendorId,
      quantity: item.quantity,
      priceAtPurchase: item.product.price
    }));
    await db.insert(orderItems).values(orderItemsValues);
    await clearCart(userId);
    createdOrder = order;
  }

  // Create PENDING tracking event
  await trackingService.addEvent(createdOrder.id, 'PENDING', 'Order placed', userId);

  // Send notification to customer
  await notificationService.create(
    userId,
    'ORDER_PLACED',
    'Order placed',
    `Your order #${createdOrder.id.substring(0, 8)} has been placed`,
    { orderId: createdOrder.id }
  );

  // Send notification to each vendor involved in this order
  const uniqueVendorIds = [...new Set(cart.items.map(item => item.product.vendorId).filter(Boolean))];
  for (const vId of uniqueVendorIds) {
    try {
      await notificationService.create(
        vId,
        'NEW_ORDER',
        'New Order Received',
        `You have received a new order #${createdOrder.id.substring(0, 8)} for your products`,
        { orderId: createdOrder.id }
      );
    } catch (err) {
      console.error(`Failed to notify vendor ${vId}:`, err.message);
    }
  }

  // Clear product details cache for ordered items (stock updated)
  for (const item of cart.items) {
    await cache.del(`products:detail:${item.product.id}`);
  }

  return createdOrder;
};

export const getOrders = async (userId, page = 1, limit = 10) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const offset = (parsedPage - 1) * parsedLimit;

  const userOrders = await db.select({
    id: orders.id,
    userId: orders.userId,
    addressId: orders.addressId,
    status: orders.status,
    totalAmount: orders.totalAmount,
    paymentStatus: orders.paymentStatus,
    paymentMethod: orders.paymentMethod,
    createdAt: orders.createdAt,
    updatedAt: orders.updatedAt,
    address: {
      id: addresses.id,
      label: addresses.label,
      line1: addresses.line1,
      line2: addresses.line2,
      city: addresses.city,
      state: addresses.state,
      pincode: addresses.pincode,
      country: addresses.country
    }
  })
  .from(orders)
  .leftJoin(addresses, eq(orders.addressId, addresses.id))
  .where(eq(orders.userId, userId))
  .orderBy(desc(orders.createdAt))
  .limit(parsedLimit)
  .offset(offset);

  const ordersWithItems = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db.select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.priceAtPurchase,
        priceAtPurchase: orderItems.priceAtPurchase,
        returnStatus: returns.status,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug
        }
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(returns, eq(orderItems.id, returns.orderItemId))
      .where(eq(orderItems.orderId, order.id));

      const itemsWithMedia = await Promise.all(
        items.map(async (item) => {
          if (!item.product) return item;
          const media = await db.select()
            .from(productMedia)
            .where(eq(productMedia.productId, item.product.id))
            .orderBy(productMedia.position)
            .limit(1);
          return {
            ...item,
            product: {
              ...item.product,
              thumbnail: media[0]?.url || null
            }
          };
        })
      );

      return { ...order, items: itemsWithMedia };
    })
  );

  const [countResult] = await db.select({ count: sql`count(*)::int` }).from(orders).where(eq(orders.userId, userId));
  const total = countResult?.count || 0;

  return {
    orders: ordersWithItems,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const getOrderById = async (orderId, userId, role) => {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error('Order not found');

  // Verify authorization
  const items = await db.select({
    id: orderItems.id,
    quantity: orderItems.quantity,
    price: orderItems.priceAtPurchase,
    priceAtPurchase: orderItems.priceAtPurchase,
    vendorId: orderItems.vendorId,
    product: {
      id: products.id,
      name: products.name,
      slug: products.slug
    }
  })
  .from(orderItems)
  .leftJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orderItems.orderId, orderId));

  const itemsWithMedia = await Promise.all(
    items.map(async (item) => {
      if (!item.product) return item;
      const media = await db.select()
        .from(productMedia)
        .where(eq(productMedia.productId, item.product.id))
        .orderBy(productMedia.position)
        .limit(1);
      return {
        ...item,
        product: {
          ...item.product,
          thumbnail: media[0]?.url || null
        }
      };
    })
  );

  if (role !== 'ADMIN' && order.userId !== userId) {
    // If VENDOR, make sure they own at least one item
    const hasVendorItem = items.some(item => item.vendorId === userId);
    if (!hasVendorItem) {
      throw new Error('Not authorized to view this order');
    }
  }

  const [address] = await db.select().from(addresses).where(eq(addresses.id, order.addressId)).limit(1);
  
  const [customer] = await db.select({
    name: users.name,
    email: users.email
  }).from(users).where(eq(users.id, order.userId)).limit(1);

  // If return requests exist
  const returnRequests = await db.select().from(returns).where(eq(returns.orderId, orderId));

  return {
    ...order,
    customer,
    address,
    items: role === 'VENDOR' ? itemsWithMedia.filter(item => item.vendorId === userId) : itemsWithMedia,
    returns: returnRequests
  };
};

export const cancelOrder = async (orderId, userId) => {
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  if (!order) throw new Error('Order not found');

  if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
    throw new Error(`Order cannot be cancelled in status ${order.status}`);
  }

  // Restore inventory stock in a transaction
  if (db.transaction) {
    await db.transaction(async (tx) => {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of items) {
        await tx.execute(
          sql`UPDATE ${products} SET stock = stock + ${item.quantity}, updated_at = NOW() WHERE id = ${item.productId}`
        );
      }
      await tx.update(orders).set({ status: 'CANCELLED', updatedAt: new Date() }).where(eq(orders.id, orderId));
    });
  } else {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      await db.execute(sql`UPDATE ${products} SET stock = stock + ${item.quantity} WHERE id = ${item.productId}`);
    }
    await db.update(orders).set({ status: 'CANCELLED' }).where(eq(orders.id, orderId));
  }

  // Add CANCELLED tracking event
  await trackingService.addEvent(orderId, 'CANCELLED', 'Cancelled by customer', userId);

  // Send notification to customer
  await notificationService.create(
    userId,
    'ORDER_STATUS_CHANGED',
    'Order cancelled',
    `Your order #${orderId.substring(0, 8)} has been cancelled`,
    { orderId }
  );

  // Clear product details cache for items whose stock is restored
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    await cache.del(`products:detail:${item.productId}`);
  }

  return { success: true };
};

export const requestReturn = async (userId, orderId, { orderItemId, reason }) => {
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  if (!order) throw new Error('Order not found');

  if (order.status !== 'DELIVERED') {
    throw new Error('Returns can only be requested for delivered orders');
  }

  const [item] = await db.select().from(orderItems).where(and(eq(orderItems.id, orderItemId), eq(orderItems.orderId, orderId))).limit(1);
  if (!item) throw new Error('Order item not found');

  const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
  
  // Enforce return window days check
  const returnWindowMs = (product?.returnWindowDays || 7) * 24 * 60 * 60 * 1000;
  const orderDeliveredTime = new Date(order.updatedAt).getTime(); // Assumes updatedAt represents delivery date since status changed to DELIVERED
  const currentTime = Date.now();

  if (currentTime - orderDeliveredTime > returnWindowMs) {
    throw new Error(`Return window of ${product?.returnWindowDays || 7} days has expired for this product.`);
  }

  // Create Return request
  let returnReq;

  if (db.transaction) {
    returnReq = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(returns).values({
        orderId,
        orderItemId,
        userId,
        reason,
        status: 'REQUESTED'
      }).returning();

      await tx.update(orders).set({ status: 'RETURN_REQUESTED', updatedAt: new Date() }).where(eq(orders.id, orderId));
      
      return inserted;
    });
  } else {
    const [inserted] = await db.insert(returns).values({
      orderId,
      orderItemId,
      userId,
      reason,
      status: 'REQUESTED'
    }).returning();
    await db.update(orders).set({ status: 'RETURN_REQUESTED' }).where(eq(orders.id, orderId));
    returnReq = inserted;
  }

  // Add RETURN_REQUESTED tracking event
  await trackingService.addEvent(orderId, 'RETURN_REQUESTED', 'Return requested', userId);

  // Send notification to customer
  await notificationService.create(
    userId,
    'RETURN_REQUESTED',
    'Return requested',
    `Return request submitted for #${orderId.substring(0, 8)}`,
    { orderId, returnId: returnReq.id }
  );

  return returnReq;
};

export const getVendorOrders = async (vendorId) => {
  // Fetch order items belonging to this vendor
  const vendorItems = await db.select().from(orderItems).where(eq(orderItems.vendorId, vendorId));
  const orderIds = [...new Set(vendorItems.map(item => item.orderId))];
  
  if (orderIds.length === 0) return [];

  const list = await db.select().from(orders).where(sql`${orders.id} IN (${sql.raw(orderIds.map(id => `'${id}'`).join(','))})`);
  
  const formatted = await Promise.all(
    list.map(async (order) => {
      const items = await db.select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.priceAtPurchase,
        priceAtPurchase: orderItems.priceAtPurchase,
        product: {
          id: products.id,
          name: products.name
        }
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(and(eq(orderItems.orderId, order.id), eq(orderItems.vendorId, vendorId)));

      return { ...order, items };
    })
  );

  return formatted;
};

export const updateVendorOrderStatus = async (vendorId, orderId, status) => {
  // Confirm the order actually has products belonging to this vendor
  const vendorItems = await db.select().from(orderItems).where(and(eq(orderItems.orderId, orderId), eq(orderItems.vendorId, vendorId)));
  if (vendorItems.length === 0) {
    throw new Error('Order does not contain products from this vendor');
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    throw new Error('Order not found');
  }

  const updateData = { status, updatedAt: new Date() };
  if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
    updateData.paymentStatus = 'PAID';
  }

  const [updated] = await db.update(orders).set(updateData).where(eq(orders.id, orderId)).returning();

  // Log tracking event
  await trackingService.addEvent(orderId, status, `Order status updated to ${status} by vendor`, vendorId);

  // Send notification to customer
  await notificationService.create(
    order.userId,
    'ORDER_STATUS_CHANGED',
    'Order Status Update',
    `Your order #${orderId.substring(0, 8)} status is now ${status}`,
    { orderId }
  );

  return updated;
};

export const getAdminOrders = async () => {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  
  const formatted = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db.select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.priceAtPurchase,
        priceAtPurchase: orderItems.priceAtPurchase,
        product: {
          id: products.id,
          name: products.name
        }
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));
      
      const [customer] = await db.select({ name: users.name }).from(users).where(eq(users.id, order.userId)).limit(1);

      return { ...order, customerName: customer?.name || 'Unknown', items };
    })
  );

  return formatted;
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    throw new Error('Order not found');
  }

  const updateData = { status, updatedAt: new Date() };
  if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
    updateData.paymentStatus = 'PAID';
  }

  const [updated] = await db.update(orders).set(updateData).where(eq(orders.id, orderId)).returning();

  // Log tracking event
  await trackingService.addEvent(orderId, status, `Order status updated to ${status} by administrator`, order.userId);

  // Send notification to customer
  await notificationService.create(
    order.userId,
    'ORDER_STATUS_CHANGED',
    'Order Status Update',
    `Your order #${orderId.substring(0, 8)} status is now ${status}`,
    { orderId }
  );

  return updated;
};
