import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { carts, cartItems, products, productMedia } from '../models/schema.js';

export const getOrCreateCart = async (userId) => {
  let [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  
  if (!cart) {
    [cart] = await db.insert(carts).values({ userId }).returning();
  }
  
  return cart;
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  // Fetch cart items joined with products
  const items = await db.select({
    id: cartItems.id,
    quantity: cartItems.quantity,
    addedAt: cartItems.addedAt,
    product: {
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stock: products.stock,
      isActive: products.isActive,
      isDeleted: products.isDeleted,
      vendorId: products.vendorId
    }
  })
  .from(cartItems)
  .leftJoin(products, eq(cartItems.productId, products.id))
  .where(eq(cartItems.cartId, cart.id));

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

  // Filter out items where the product no longer exists or is deleted
  const activeItems = itemsWithMedia.filter(item => item.product && !item.product.isDeleted && item.product.isActive);

  return {
    id: cart.id,
    userId: cart.userId,
    items: activeItems,
    totalItems: activeItems.reduce((acc, curr) => acc + curr.quantity, 0),
    totalAmount: activeItems.reduce((acc, curr) => acc + (parseFloat(curr.product.price) * curr.quantity), 0).toFixed(2)
  };
};

export const addItem = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);

  // Verify product
  const [product] = await db.select().from(products).where(and(eq(products.id, productId), eq(products.isDeleted, false))).limit(1);
  if (!product || !product.isActive) {
    throw new Error('Product not found or unavailable');
  }

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock. Only ${product.stock} units available.`);
  }

  // Check if item is already in cart
  const [existingItem] = await db.select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
    .limit(1);

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw new Error(`Insufficient stock. You already have ${existingItem.quantity} items in cart, and cannot add ${quantity} more.`);
    }
    
    const [updated] = await db.update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, existingItem.id))
      .returning();
    return updated;
  } else {
    const [newItem] = await db.insert(cartItems).values({
      cartId: cart.id,
      productId,
      quantity
    }).returning();
    return newItem;
  }
};

export const updateItem = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCart(userId);

  // Find item
  const [item] = await db.select().from(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id))).limit(1);
  if (!item) {
    throw new Error('Cart item not found');
  }

  // Check stock
  const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
  if (!product || product.isDeleted || !product.isActive) {
    throw new Error('Product is no longer available');
  }

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock. Only ${product.stock} units available.`);
  }

  const [updated] = await db.update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, itemId))
    .returning();
  return updated;
};

export const removeItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
  return { success: true };
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  return { success: true };
};
