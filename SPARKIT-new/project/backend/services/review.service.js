import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { reviews, products, orderItems, orders, users } from '../models/schema.js';
import * as notificationService from './notification.service.js';

export const createReview = async (userId, productId, reviewData) => {
  // Check if product exists
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || product.isDeleted) {
    throw new Error('Product not found');
  }

  // Check if user already reviewed this product
  const [existingReview] = await db.select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
    .limit(1);
  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }

  // Cross-check if it's a verified purchase (DELIVERED order containing this product)
  const deliveredOrder = await db.select()
    .from(orderItems)
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(
      eq(orders.userId, userId),
      eq(orderItems.productId, productId),
      eq(orders.status, 'DELIVERED')
    ))
    .limit(1);

  const isVerifiedPurchase = deliveredOrder.length > 0;

  const [newReview] = await db.insert(reviews).values({
    ...reviewData,
    userId,
    productId,
    isVerifiedPurchase
  }).returning();

  // Send real-time notification to product owner (vendor)
  const [reviewer] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
  await notificationService.create(
    product.vendorId,
    'NEW_REVIEW',
    'New review on your product',
    `${reviewer?.name || 'A customer'} left a ${reviewData.rating}★ review on your product "${product.name}"`,
    { productId, reviewId: newReview.id }
  );

  return newReview;
};

export const updateReview = async (reviewId, userId, reviewData) => {
  const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (!review) {
    throw new Error('Review not found');
  }

  if (review.userId !== userId) {
    throw new Error('Not authorized to update this review');
  }

  const [updated] = await db.update(reviews)
    .set({
      ...reviewData,
      updatedAt: new Date()
    })
    .where(eq(reviews.id, reviewId))
    .returning();

  return updated;
};

export const deleteReview = async (reviewId, userId, role) => {
  const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (!review) {
    throw new Error('Review not found');
  }

  if (role !== 'ADMIN' && review.userId !== userId) {
    throw new Error('Not authorized to delete this review');
  }

  await db.delete(reviews).where(eq(reviews.id, reviewId));
  return { success: true };
};

export const getVendorProductReviews = async (vendorId, productId) => {
  // Verify vendor owns the product
  const [product] = await db.select().from(products).where(and(eq(products.id, productId), eq(products.vendorId, vendorId))).limit(1);
  if (!product) {
    throw new Error('Product not found or not owned by this vendor');
  }

  return db.select().from(reviews).where(eq(reviews.productId, productId));
};
