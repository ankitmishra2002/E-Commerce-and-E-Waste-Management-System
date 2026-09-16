import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { wishlists, products, productMedia } from '../models/schema.js';
import { addItem as addToCart } from './cart.service.js';

export const getWishlist = async (userId) => {
  const items = await db.select({
    id: wishlists.id,
    addedAt: wishlists.addedAt,
    product: {
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stock: products.stock,
      isActive: products.isActive
    }
  })
  .from(wishlists)
  .leftJoin(products, eq(wishlists.productId, products.id))
  .where(eq(wishlists.userId, userId));

  // Populate product media for each item
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

  return itemsWithMedia.filter(item => item.product);
};

export const addItem = async (userId, productId) => {
  // Check if already exists
  const [existing] = await db.select()
    .from(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
    .limit(1);

  if (existing) {
    return existing;
  }

  // Check if product exists
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || product.isDeleted) {
    throw new Error('Product not found');
  }

  const [newItem] = await db.insert(wishlists).values({
    userId,
    productId
  }).returning();

  return newItem;
};

export const removeItem = async (userId, productId) => {
  await db.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
  return { success: true };
};

export const moveToCart = async (userId, productId) => {
  let result;
  
  if (db.transaction) {
    result = await db.transaction(async (tx) => {
      // Add to cart
      const cartItem = await addToCart(userId, productId, 1);
      
      // Delete from wishlist
      await tx.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
      
      return cartItem;
    });
  } else {
    const cartItem = await addToCart(userId, productId, 1);
    await db.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    result = cartItem;
  }

  return result;
};
