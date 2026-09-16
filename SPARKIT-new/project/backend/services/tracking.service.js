import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { trackingEvents, orders, orderItems, users } from '../models/schema.js';

export const addEvent = async (orderId, status, note, updatedBy, location = null) => {
  const [event] = await db.insert(trackingEvents).values({
    orderId,
    status,
    updatedBy,
    note,
    location,
    timestamp: new Date()
  }).returning();

  return event;
};

export const getTrackingTimeline = async (orderId, requestingUserId, requestingUserRole) => {
  // 1. Fetch order details to check permissions
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    throw new Error('Order not found');
  }

  // 2. Validate ownership
  if (requestingUserRole === 'USER') {
    if (order.userId !== requestingUserId) {
      throw new Error('Not authorized to view tracking for this order');
    }
  } else if (requestingUserRole === 'VENDOR') {
    // Check if vendor has items in this order
    const items = await db.select()
      .from(orderItems)
      .where(and(eq(orderItems.orderId, orderId), eq(orderItems.vendorId, requestingUserId)))
      .limit(1);
    if (items.length === 0) {
      throw new Error('Not authorized to view tracking for this order');
    }
  }

  // 3. Fetch tracking events joined with user's name
  const events = await db.select({
    id: trackingEvents.id,
    orderId: trackingEvents.orderId,
    status: trackingEvents.status,
    note: trackingEvents.note,
    location: trackingEvents.location,
    timestamp: trackingEvents.timestamp,
    updatedByName: users.name
  })
  .from(trackingEvents)
  .leftJoin(users, eq(trackingEvents.updatedBy, users.id))
  .where(eq(trackingEvents.orderId, orderId))
  .orderBy(trackingEvents.timestamp);

  return events;
};
