import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { notifications } from '../models/schema.js';

let _io = null;

export const setIo = (io) => {
  _io = io;
};

export const create = async (userId, type, title, body, metadata = null) => {
  const [notif] = await db.insert(notifications).values({
    userId,
    type,
    title,
    body,
    isRead: false,
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: new Date()
  }).returning();

  // Parse metadata if returned as JSON string
  const formattedNotif = {
    ...notif,
    metadata: notif.metadata ? (typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : notif.metadata) : null
  };

  // Emit to user's private socket room if Socket.io is active
  if (_io) {
    try {
      _io.to(`user:${userId}`).emit('notification', formattedNotif);
    } catch (err) {
      console.error('Error emitting Socket.io notification:', err.message);
    }
  }

  return formattedNotif;
};

export const getForUser = async (userId, page = 1, limit = 20) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 20;
  const offset = (parsedPage - 1) * parsedLimit;

  // Retrieve notifications
  const list = await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(parsedLimit)
    .offset(offset);

  const formattedList = list.map(item => ({
    ...item,
    metadata: item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) : null
  }));

  // Fetch count of total
  const [totalCountResult] = await db.select({ count: sql`COUNT(*)::int` })
    .from(notifications)
    .where(eq(notifications.userId, userId));
  const total = totalCountResult?.count || 0;

  // Fetch count of unread
  const [unreadCountResult] = await db.select({ count: sql`COUNT(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  const unreadCount = unreadCountResult?.count || 0;

  return {
    notifications: formattedList,
    total,
    unreadCount,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const markRead = async (notificationId, userId) => {
  const [updated] = await db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  if (!updated) {
    throw new Error('Notification not found or access denied');
  }

  return {
    ...updated,
    metadata: updated.metadata ? (typeof updated.metadata === 'string' ? JSON.parse(updated.metadata) : updated.metadata) : null
  };
};

export const markAllRead = async (userId) => {
  await db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return { success: true };
};

export default {
  setIo,
  create,
  getForUser,
  markRead,
  markAllRead
};
