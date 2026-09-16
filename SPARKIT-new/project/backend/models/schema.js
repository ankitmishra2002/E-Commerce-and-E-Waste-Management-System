import { pgTable, uuid, varchar, text, numeric, integer, boolean, timestamp, jsonb, index, unique, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role_enum', ['USER', 'ADMIN', 'VENDOR']);
export const mediaTypeEnum = pgEnum('media_type_enum', ['IMAGE', 'VIDEO']);
export const orderStatusEnum = pgEnum('order_status_enum', [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 
  'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'
]);
export const paymentStatusEnum = pgEnum('payment_status_enum', ['UNPAID', 'PAID', 'REFUNDED']);
export const returnStatusEnum = pgEnum('return_status_enum', ['REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED']);
export const complaintStatusEnum = pgEnum('complaint_status_enum', ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']);
export const ewasteStatusEnum = pgEnum('ewaste_status_enum', [
  'PENDING', 'ACCEPTED', 'QUOTE_PROVIDED', 'QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'COMPLETED', 'CANCELLED'
]);
export const ewasteApprovalEnum = pgEnum('ewaste_approval_enum', ['PENDING', 'APPROVED', 'REJECTED']);

// USERS Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  role: roleEnum('role').default('USER').notNull(),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_role_idx').on(table.role)
]);

// VENDOR PROFILES Table
export const vendorProfiles = pgTable('vendor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  businessName: varchar('business_name', { length: 150 }).notNull(),
  businessDescription: text('business_description'),
  gstNumber: varchar('gst_number', { length: 20 }),
  bankAccountInfo: jsonb('bank_account_info'),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('vendor_profiles_user_idx').on(table.userId)
]);

// CATEGORIES Table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  parentId: uuid('parent_id').references(() => categories.id, { onDelete: 'set null' })
}, (table) => [
  index('categories_slug_idx').on(table.slug)
]);

// PRODUCTS Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 250 }).unique().notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
  stock: integer('stock').default(0).notNull(),
  sku: varchar('sku', { length: 100 }).unique(),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  returnWindowDays: integer('return_window_days').default(7).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('products_vendor_idx').on(table.vendorId),
  index('products_category_idx').on(table.categoryId),
  index('products_slug_idx').on(table.slug),
  index('products_active_deleted_idx').on(table.isActive, table.isDeleted)
]);

// PRODUCT MEDIA Table
export const productMedia = pgTable('product_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  type: mediaTypeEnum('type').notNull(),
  url: text('url').notNull(),
  publicId: text('public_id').notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('product_media_product_idx').on(table.productId)
]);

// CARTS Table
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('carts_user_idx').on(table.userId)
]);

// CART ITEMS Table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull()
}, (table) => [
  index('cart_items_cart_idx').on(table.cartId),
  index('cart_items_product_idx').on(table.productId)
]);

// WISHLISTS Table
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull()
}, (table) => [
  index('wishlists_user_product_idx').on(table.userId, table.productId),
  unique('wishlist_user_product_unique').on(table.userId, table.productId)
]);

// ADDRESSES Table
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  label: varchar('label', { length: 50 }).notNull(), // 'Home', 'Work', etc.
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull()
}, (table) => [
  index('addresses_user_idx').on(table.userId)
]);

// ORDERS Table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  addressId: uuid('address_id').references(() => addresses.id, { onDelete: 'restrict' }).notNull(),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('UNPAID').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  razorpayOrderId: text('razorpay_order_id'), // Phase 2 placeholder
  razorpayPaymentId: text('razorpay_payment_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('orders_user_idx').on(table.userId),
  index('orders_status_idx').on(table.status)
]);

// ORDER ITEMS Table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
  vendorId: uuid('vendor_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: numeric('price_at_purchase', { precision: 10, scale: 2 }).notNull()
}, (table) => [
  index('order_items_order_idx').on(table.orderId),
  index('order_items_product_idx').on(table.productId),
  index('order_items_vendor_idx').on(table.vendorId)
]);

// RETURNS Table
export const returns = pgTable('returns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  orderItemId: uuid('order_item_id').references(() => orderItems.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reason: text('reason').notNull(),
  status: returnStatusEnum('status').default('REQUESTED').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at')
}, (table) => [
  index('returns_order_idx').on(table.orderId),
  index('returns_user_idx').on(table.userId)
]);

// REVIEWS Table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // Constraint 1-5 checked in validation
  title: varchar('title', { length: 150 }),
  body: text('body'),
  images: jsonb('images'), // Array of Cloudinary URLs
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('reviews_product_idx').on(table.productId),
  index('reviews_user_idx').on(table.userId),
  unique('reviews_product_user_unique').on(table.productId, table.userId)
]);

// COMPLAINTS Table
export const complaints = pgTable('complaints', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  vendorId: uuid('vendor_id').references(() => users.id, { onDelete: 'set null' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  subject: varchar('subject', { length: 200 }).notNull(),
  body: text('body').notNull(),
  images: jsonb('images'), // Array of Cloudinary URLs
  status: complaintStatusEnum('status').default('OPEN').notNull(),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('complaints_user_idx').on(table.userId),
  index('complaints_vendor_idx').on(table.vendorId)
]);

// NOTIFICATIONS Table (Phase 2 schema, defined now)
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('notifications_user_idx').on(table.userId)
]);

// TRACKING EVENTS Table
export const trackingEvents = pgTable('tracking_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  note: text('note'),
  location: varchar('location', { length: 200 }),
  timestamp: timestamp('timestamp').defaultNow().notNull()
}, (table) => [
  index('tracking_events_order_idx').on(table.orderId)
]);

// E-WASTE REQUESTS Table
export const ewasteRequests = pgTable('ewaste_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  addressId: uuid('address_id').references(() => addresses.id, { onDelete: 'cascade' }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  condition: text('condition').notNull(),
  age: integer('age').notNull(), // age in months
  accessories: text('accessories'),
  images: jsonb('images'), // Array of image URLs
  status: ewasteStatusEnum('status').default('PENDING').notNull(),
  vendorId: uuid('vendor_id').references(() => users.id, { onDelete: 'set null' }),
  verifiedCondition: text('verified_condition'),
  quotedPrice: numeric('quoted_price', { precision: 10, scale: 2 }),
  inspectionNotes: text('inspection_notes'),
  adminApprovalStatus: ewasteApprovalEnum('admin_approval_status').default('PENDING').notNull(),
  paymentStatus: varchar('payment_status', { length: 20 }).default('UNPAID').notNull(), // 'UNPAID', 'PAID'
  paymentMethod: varchar('payment_method', { length: 50 }),
  rating: integer('rating'),
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('ewaste_requests_user_idx').on(table.userId),
  index('ewaste_requests_vendor_idx').on(table.vendorId),
  index('ewaste_requests_status_idx').on(table.status)
]);

// Relationships definition for Drizzle queries
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(vendorProfiles, {
    fields: [users.id],
    references: [vendorProfiles.userId]
  }),
  products: many(products),
  carts: one(carts, {
    fields: [users.id],
    references: [carts.userId]
  }),
  orders: many(orders),
  reviews: many(reviews),
  complaints: many(complaints),
  wishlists: many(wishlists),
  addresses: many(addresses),
  ewasteRequests: many(ewasteRequests, { relationName: 'ewaste_user' }),
  ewastePickups: many(ewasteRequests, { relationName: 'ewaste_vendor' })
}));

export const vendorProfilesRelations = relations(vendorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [vendorProfiles.userId],
    references: [users.id]
  })
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'subcategory'
  }),
  subcategories: many(categories, {
    relationName: 'subcategory'
  }),
  products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(users, {
    fields: [products.vendorId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  media: many(productMedia),
  reviews: many(reviews),
  wishlists: many(wishlists),
  cartItems: many(cartItems)
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id]
  })
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id]
  }),
  items: many(cartItems)
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id]
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id]
  })
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id]
  })
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id]
  })
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id]
  }),
  items: many(orderItems),
  returns: many(returns),
  trackingEvents: many(trackingEvents)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  }),
  vendor: one(users, {
    fields: [orderItems.vendorId],
    references: [users.id]
  })
}));

export const returnsRelations = relations(returns, ({ one }) => ({
  order: one(orders, {
    fields: [returns.orderId],
    references: [orders.id]
  }),
  orderItem: one(orderItems, {
    fields: [returns.orderItemId],
    references: [orderItems.id]
  }),
  user: one(users, {
    fields: [returns.userId],
    references: [users.id]
  })
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id]
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  })
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  user: one(users, {
    fields: [complaints.userId],
    references: [users.id]
  }),
  vendor: one(users, {
    fields: [complaints.vendorId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [complaints.productId],
    references: [products.id]
  }),
  order: one(orders, {
    fields: [complaints.orderId],
    references: [orders.id]
  })
}));

export const trackingEventsRelations = relations(trackingEvents, ({ one }) => ({
  order: one(orders, {
    fields: [trackingEvents.orderId],
    references: [orders.id]
  }),
  user: one(users, {
    fields: [trackingEvents.updatedBy],
    references: [users.id]
  })
}));

export const ewasteRequestsRelations = relations(ewasteRequests, ({ one }) => ({
  user: one(users, {
    fields: [ewasteRequests.userId],
    references: [users.id],
    relationName: 'ewaste_user'
  }),
  vendor: one(users, {
    fields: [ewasteRequests.vendorId],
    references: [users.id],
    relationName: 'ewaste_vendor'
  }),
  address: one(addresses, {
    fields: [ewasteRequests.addressId],
    references: [addresses.id]
  })
}));

