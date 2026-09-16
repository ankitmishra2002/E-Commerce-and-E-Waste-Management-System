import fs from 'fs';
import { eq, and, gte, lte, like, or, sql, desc, asc, not } from 'drizzle-orm';
import { db } from '../config/db.js';
import { products, productMedia, reviews, categories, users, orderItems, orders } from '../models/schema.js';
import cloudinary from '../config/cloudinary.js';
import * as cache from './cache.service.js';

// Get paginated and filtered product list
export const getProducts = async (filters = {}) => {
  const cacheKey = `products:list:${JSON.stringify(filters)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const {
    page = 1,
    limit = 10,
    category,
    vendorId,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    search,
    inStock
  } = filters;

  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const offset = (parsedPage - 1) * parsedLimit;

  // Build filter conditions
  // Only show products that have at least one media entry (uploaded image/video)
  const hasMediaSubquery = sql`EXISTS (SELECT 1 FROM product_media pm WHERE pm.product_id = ${products.id})`;
  const conditions = [eq(products.isDeleted, false), eq(products.isActive, true), hasMediaSubquery];

  if (vendorId) {
    conditions.push(eq(products.vendorId, vendorId));
  }

  // Handle category filtering by slug or ID
  if (category) {
    // Check if category is a UUID or slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let categoryId = category;
    
    if (!uuidRegex.test(category)) {
      // Find category by slug
      const [foundCat] = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
      if (foundCat) {
        categoryId = foundCat.id;
      }
    }
    
    // Support subcategories: find all child categories of this category
    const subCats = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, categoryId));
    const catIds = [categoryId, ...subCats.map(c => c.id)];
    
    conditions.push(sql`${products.categoryId} IN (${sql.raw(catIds.map(id => `'${id}'`).join(','))})`);
  }

  if (minPrice) {
    conditions.push(gte(products.price, minPrice.toString()));
  }

  if (maxPrice) {
    conditions.push(lte(products.price, maxPrice.toString()));
  }

  if (inStock === 'true' || inStock === true) {
    conditions.push(sql`${products.stock} > 0`);
  }

  if (search) {
    conditions.push(
      or(
        like(products.name, `%${search}%`),
        like(products.description, `%${search}%`)
      )
    );
  }

  const whereClause = and(...conditions);

  // Sorting
  let orderBy = desc(products.createdAt); // default: newest first
  if (sortBy === 'price_asc' || sortBy === 'price') {
    orderBy = asc(products.price);
  } else if (sortBy === 'price_desc') {
    orderBy = desc(products.price);
  } else if (sortBy === 'oldest') {
    orderBy = asc(products.createdAt);
  } else if (sortBy === 'newest') {
    orderBy = desc(products.createdAt);
  }

  // Execute queries
  const items = await db.select({
    id: products.id,
    vendorId: products.vendorId,
    categoryId: products.categoryId,
    name: products.name,
    slug: products.slug,
    description: products.description,
    price: products.price,
    compareAtPrice: products.compareAtPrice,
    stock: products.stock,
    sku: products.sku,
    isActive: products.isActive,
    returnWindowDays: products.returnWindowDays,
    createdAt: products.createdAt,
    updatedAt: products.updatedAt
  })
  .from(products)
  .where(whereClause)
  .orderBy(orderBy)
  .limit(parsedLimit)
  .offset(offset);

  // Fetch images & ratings for each product to prevent N+1 query overhead in client
  const productsWithDetails = await Promise.all(
    items.map(async (prod) => {
      // Media
      const media = await db.select().from(productMedia).where(eq(productMedia.productId, prod.id)).orderBy(asc(productMedia.position));
      
      // Aggregates
      const [ratingStat] = await db.select({
        avgRating: sql`COALESCE(AVG(${reviews.rating}), 0)::float`,
        reviewCount: sql`COUNT(${reviews.id})::int`
      }).from(reviews).where(eq(reviews.productId, prod.id));

      return {
        ...prod,
        media,
        avgRating: ratingStat?.avgRating || 0,
        reviewCount: ratingStat?.reviewCount || 0
      };
    })
  );

  // Total count for pagination
  const [countResult] = await db.select({ count: sql`count(*)::int` }).from(products).where(whereClause);
  const total = countResult?.count || 0;

  const result = {
    products: productsWithDetails,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    }
  };
  await cache.set(cacheKey, result, 120);
  return result;
};

// Get single product with details
export const getProductById = async (id) => {
  const cacheKey = `products:detail:${id}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.isDeleted, false))).limit(1);
  if (!product) throw new Error('Product not found');

  const media = await db.select().from(productMedia).where(eq(productMedia.productId, id)).orderBy(asc(productMedia.position));
  
  const [ratingStat] = await db.select({
    avgRating: sql`COALESCE(AVG(${reviews.rating}), 0)::float`,
    reviewCount: sql`COUNT(${reviews.id})::int`
  }).from(reviews).where(eq(reviews.productId, id));

  // Fetch rating distribution (1 to 5 stars)
  const ratingDistribution = [];
  for (let rating = 5; rating >= 1; rating--) {
    const [countResult] = await db.select({ count: sql`COUNT(${reviews.id})::int` })
      .from(reviews)
      .where(and(eq(reviews.productId, id), eq(reviews.rating, rating)));
    ratingDistribution.push({ rating, count: countResult?.count || 0 });
  }

  // Get Vendor Info
  const [vendor] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatar: users.avatar
  }).from(users).where(eq(users.id, product.vendorId)).limit(1);

  // Get Category Info
  let categoryInfo = null;
  if (product.categoryId) {
    [categoryInfo] = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
  }

  const result = {
    ...product,
    media,
    avgRating: ratingStat?.avgRating || 0,
    reviewCount: ratingStat?.reviewCount || 0,
    ratingDistribution,
    vendor,
    category: categoryInfo
  };
  await cache.set(cacheKey, result, 300);
  return result;
};

// Create product
export const createProduct = async (vendorId, productData) => {
  // Generate unique slug
  let baseSlug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let uniqueSlug = baseSlug;
  let suffix = 1;
  while (true) {
    const [existing] = await db.select().from(products).where(eq(products.slug, uniqueSlug)).limit(1);
    if (!existing) break;
    uniqueSlug = `${baseSlug}-${suffix++}`;
  }

  const [product] = await db.insert(products).values({
    ...productData,
    vendorId,
    slug: uniqueSlug,
    isDeleted: false
  }).returning();

  // Invalidate product listings cache
  await cache.delPattern('products:list:*');

  return product;
};

// Update product
export const updateProduct = async (productId, userId, role, productData) => {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || product.isDeleted) throw new Error('Product not found');

  // Verify ownership (unless admin)
  if (role !== 'ADMIN' && product.vendorId !== userId) {
    throw new Error('Not authorized to update this product');
  }

  const updateFields = { ...productData, updatedAt: new Date() };
  
  // If product name changes, regenerate slug
  if (productData.name && productData.name !== product.name) {
    let baseSlug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let uniqueSlug = baseSlug;
    let suffix = 1;
    while (true) {
      const [existing] = await db.select().from(products).where(eq(products.slug, uniqueSlug)).limit(1);
      if (!existing || existing.id === productId) break;
      uniqueSlug = `${baseSlug}-${suffix++}`;
    }
    updateFields.slug = uniqueSlug;
  }

  const [updatedProduct] = await db.update(products).set(updateFields).where(eq(products.id, productId)).returning();

  // Invalidate cache
  await cache.del(`products:detail:${productId}`);
  await cache.delPattern('products:list:*');

  return updatedProduct;
};

// Soft delete product
export const deleteProduct = async (productId, userId, role) => {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || product.isDeleted) throw new Error('Product not found');

  if (role !== 'ADMIN' && product.vendorId !== userId) {
    throw new Error('Not authorized to delete this product');
  }

  await db.update(products).set({ isDeleted: true, updatedAt: new Date() }).where(eq(products.id, productId));

  // Invalidate cache
  await cache.del(`products:detail:${productId}`);
  await cache.delPattern('products:list:*');

  return { success: true };
};

// Upload media
export const addProductMedia = async (productId, userId, role, files, videoFile) => {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || product.isDeleted) throw new Error('Product not found');

  if (role !== 'ADMIN' && product.vendorId !== userId) {
    throw new Error('Not authorized to manage media for this product');
  }

  // Count existing media
  const existingMedia = await db.select().from(productMedia).where(eq(productMedia.productId, productId));
  const currentImages = existingMedia.filter(m => m.type === 'IMAGE');
  const currentVideos = existingMedia.filter(m => m.type === 'VIDEO');

  const insertValues = [];

  // Enforce Max 8 Images
  if (files && files.length > 0) {
    if (currentImages.length + files.length > 8) {
      throw new Error(`Upload exceeds maximum limit of 8 images. Product already has ${currentImages.length} images.`);
    }
    
    files.forEach((file, index) => {
      // Cloudinary path is secure_url, fallback path is relative url
      const fileUrl = file.path || `/uploads/${file.filename}`;
      const publicId = file.filename || file.path; // use path/filename as identifier
      
      insertValues.push({
        productId,
        type: 'IMAGE',
        url: fileUrl,
        publicId: publicId,
        position: currentImages.length + index
      });
    });
  }

  // Enforce Max 1 Video
  if (videoFile) {
    if (currentVideos.length >= 1) {
      throw new Error('Product already has a video upload. Limit is 1 video.');
    }
    
    const fileUrl = videoFile.path || `/uploads/${videoFile.filename}`;
    const publicId = videoFile.filename || videoFile.path;

    insertValues.push({
      productId,
      type: 'VIDEO',
      url: fileUrl,
      publicId: publicId,
      position: 0
    });
  }

  if (insertValues.length === 0) {
    throw new Error('No files provided');
  }

  const uploadedMedia = await db.insert(productMedia).values(insertValues).returning();
  return uploadedMedia;
};

// Delete media
export const deleteProductMedia = async (productId, mediaId, userId, role) => {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || product.isDeleted) throw new Error('Product not found');

  if (role !== 'ADMIN' && product.vendorId !== userId) {
    throw new Error('Not authorized to delete media for this product');
  }

  const [media] = await db.select().from(productMedia).where(and(eq(productMedia.id, mediaId), eq(productMedia.productId, productId))).limit(1);
  if (!media) throw new Error('Media item not found');

  // If Cloudinary is configured (publicId looks like cloudinary path), clean it up from Cloudinary
  if (process.env.CLOUDINARY_CLOUD_NAME && media.publicId && !media.publicId.startsWith('video-') && !media.publicId.startsWith('images-')) {
    try {
      const resourceType = media.type === 'VIDEO' ? 'video' : 'image';
      await cloudinary.uploader.destroy(media.publicId, { resource_type: resourceType });
    } catch (cloudinaryError) {
      console.error("Cloudinary media deletion failed:", cloudinaryError.message);
    }
  } else {
    // If it's a local file fallback, we can delete the file from disk if we want, or leave it
    const filePath = `./uploads/${media.publicId}`;
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Local file deletion failed:", err.message);
      }
    }
  }

  await db.delete(productMedia).where(eq(productMedia.id, mediaId));
  return { success: true };
};

// Get product reviews
export const getProductReviews = async (productId, page = 1, limit = 5) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 5;
  const offset = (parsedPage - 1) * parsedLimit;

  const list = await db.select({
    id: reviews.id,
    productId: reviews.productId,
    userId: reviews.userId,
    rating: reviews.rating,
    title: reviews.title,
    body: reviews.body,
    images: reviews.images,
    isVerifiedPurchase: reviews.isVerifiedPurchase,
    createdAt: reviews.createdAt,
    user: {
      name: users.name,
      avatar: users.avatar
    }
  })
  .from(reviews)
  .leftJoin(users, eq(reviews.userId, users.id))
  .where(eq(reviews.productId, productId))
  .orderBy(desc(reviews.createdAt))
  .limit(parsedLimit)
  .offset(offset);

  const [countResult] = await db.select({ count: sql`count(*)::int` }).from(reviews).where(eq(reviews.productId, productId));
  const total = countResult?.count || 0;

  return {
    reviews: list,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

// Get all categories (with 5-minute cache)
export const getCategories = async () => {
  const cacheKey = 'categories:all';
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      parentId: categories.parentId
    })
    .from(categories)
    .orderBy(asc(categories.name));

  await cache.set(cacheKey, result, 300);
  return result;
};
