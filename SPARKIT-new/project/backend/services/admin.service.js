import { eq, and, sql, desc, not } from 'drizzle-orm';
import { db } from '../config/db.js';
import { users, vendorProfiles, orders, products, complaints } from '../models/schema.js';
import bcrypt from 'bcryptjs';
import * as notificationService from './notification.service.js';

export const getAdminDashboard = async () => {
  // 1. Total Users Count
  const [usersCountResult] = await db.select({ count: sql`COUNT(${users.id})::int` }).from(users);
  const totalUsers = usersCountResult?.count || 0;

  // 2. Total Vendors (verified & unverified)
  const [vendorsCountResult] = await db.select({ count: sql`COUNT(${vendorProfiles.id})::int` }).from(vendorProfiles);
  const totalVendors = vendorsCountResult?.count || 0;

  // 3. Total Orders
  const [ordersCountResult] = await db.select({ count: sql`COUNT(${orders.id})::int` }).from(orders);
  const totalOrders = ordersCountResult?.count || 0;

  // 4. GMV (Gross Merchandise Value - SUM of totalAmount of all PAID or DELIVERED orders)
  const [gmvResult] = await db.select({
    gmv: sql`COALESCE(SUM(${orders.totalAmount}), 0)::float`
  })
  .from(orders)
  .where(eq(orders.paymentStatus, 'PAID'));
  
  const gmv = gmvResult?.gmv || 0;

  // 5. Vendor verification queue
  const unverifiedVendors = await db.select({
    id: vendorProfiles.id,
    userId: vendorProfiles.userId,
    businessName: vendorProfiles.businessName,
    gstNumber: vendorProfiles.gstNumber,
    isVerified: vendorProfiles.isVerified,
    createdAt: vendorProfiles.createdAt,
    user: {
      name: users.name,
      email: users.email
    }
  })
  .from(vendorProfiles)
  .leftJoin(users, eq(vendorProfiles.userId, users.id))
  .where(eq(vendorProfiles.isVerified, false))
  .orderBy(desc(vendorProfiles.createdAt));

  // 6. Recent complaints
  const recentComplaints = await db.select().from(complaints).orderBy(desc(complaints.createdAt)).limit(5);

  // 7. Platform order status breakdown for Recharts donut chart
  const statusBreakdown = await db.select({
    status: orders.status,
    count: sql`COUNT(${orders.id})::int`
  })
  .from(orders)
  .groupBy(orders.status);

  // 8. Platform growth charts (revenue by month)
  const revenueByMonth = await db.select({
    month: sql`TO_CHAR(${orders.createdAt}, 'Mon YYYY')`,
    revenue: sql`SUM(${orders.totalAmount})::float`
  })
  .from(orders)
  .where(eq(orders.paymentStatus, 'PAID'))
  .groupBy(sql`TO_CHAR(${orders.createdAt}, 'Mon YYYY')`, sql`DATE_TRUNC('month', ${orders.createdAt})`)
  .orderBy(sql`DATE_TRUNC('month', ${orders.createdAt})`)
  .limit(6);

  return {
    stats: {
      totalUsers,
      totalVendors,
      totalOrders,
      gmv: gmv.toFixed(2)
    },
    unverifiedVendors,
    recentComplaints,
    statusBreakdown,
    revenueByMonth
  };
};

export const getUsers = async () => {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt
  })
  .from(users)
  .orderBy(desc(users.createdAt));
};

export const getUserById = async (userId) => {
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    avatar: users.avatar,
    createdAt: users.createdAt
  }).from(users).where(eq(users.id, userId)).limit(1);

  if (!user) throw new Error('User not found');

  let profile = null;
  if (user.role === 'VENDOR') {
    [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId)).limit(1);
  }

  const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));

  return { user, profile, orders: userOrders };
};

export const createUser = async ({ name, email, password, role }) => {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error('Email is already registered');

  const hashedPassword = await bcrypt.hash(password, 12);
  
  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    role: role || 'USER',
    isActive: true
  }).returning();

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const updateUser = async (userId, updateData) => {
  const fields = { ...updateData, updatedAt: new Date() };
  if (updateData.password) {
    fields.password = await bcrypt.hash(updateData.password, 12);
  }

  const [updated] = await db.update(users).set(fields).where(eq(users.id, userId)).returning();
  const { password: _, ...userWithoutPassword } = updated;
  return userWithoutPassword;
};

export const deactivateUser = async (userId) => {
  await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, userId));
  return { success: true };
};

export const getVendors = async () => {
  return db.select({
    id: vendorProfiles.id,
    userId: vendorProfiles.userId,
    businessName: vendorProfiles.businessName,
    gstNumber: vendorProfiles.gstNumber,
    isVerified: vendorProfiles.isVerified,
    createdAt: vendorProfiles.createdAt,
    user: {
      name: users.name,
      email: users.email,
      isActive: users.isActive
    }
  })
  .from(vendorProfiles)
  .leftJoin(users, eq(vendorProfiles.userId, users.id))
  .orderBy(desc(vendorProfiles.createdAt));
};

export const createVendor = async ({ name, email, password, businessName, businessDescription, gstNumber }) => {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 12);

  let newVendor;

  if (db.transaction) {
    newVendor = await db.transaction(async (tx) => {
      const [insertedUser] = await tx.insert(users).values({
        name,
        email,
        password: hashedPassword,
        role: 'VENDOR'
      }).returning();

      await tx.insert(vendorProfiles).values({
        userId: insertedUser.id,
        businessName,
        businessDescription,
        gstNumber,
        isVerified: true // Admin-created vendors can be auto-verified
      });

      return insertedUser;
    });
  } else {
    const [insertedUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'VENDOR'
    }).returning();
    await db.insert(vendorProfiles).values({
      userId: insertedUser.id,
      businessName,
      businessDescription,
      gstNumber,
      isVerified: true
    });
    newVendor = insertedUser;
  }

  const { password: _, ...userWithoutPassword } = newVendor;
  return userWithoutPassword;
};

export const verifyVendor = async (profileId) => {
  const [updatedProfile] = await db.update(vendorProfiles).set({ isVerified: true, updatedAt: new Date() }).where(eq(vendorProfiles.id, profileId)).returning();
  if (!updatedProfile) throw new Error('Vendor profile not found');

  // Send real-time notification to vendor
  await notificationService.create(
    updatedProfile.userId,
    'VENDOR_VERIFIED',
    'Account verified',
    'Your vendor account is verified',
    { profileId }
  );

  return updatedProfile;
};

export const suspendVendor = async (profileId) => {
  // Set isVerified to false and deactivate the corresponding user
  const [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.id, profileId)).limit(1);
  if (!profile) throw new Error('Vendor profile not found');

  if (db.transaction) {
    await db.transaction(async (tx) => {
      await tx.update(vendorProfiles).set({ isVerified: false, updatedAt: new Date() }).where(eq(vendorProfiles.id, profileId));
      await tx.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, profile.userId));
    });
  } else {
    await db.update(vendorProfiles).set({ isVerified: false }).where(eq(vendorProfiles.id, profileId));
    await db.update(users).set({ isActive: false }).where(eq(users.id, profile.userId));
  }

  return { success: true };
};

export const getProducts = async () => {
  // Returns all products (including soft deleted ones, categorized clearly)
  return db.select({
    id: products.id,
    name: products.name,
    price: products.price,
    stock: products.stock,
    isActive: products.isActive,
    isDeleted: products.isDeleted,
    createdAt: products.createdAt,
    vendorName: users.name
  })
  .from(products)
  .leftJoin(users, eq(products.vendorId, users.id))
  .orderBy(desc(products.createdAt));
};

export const forceDeleteProduct = async (productId) => {
  // Hard delete
  await db.delete(products).where(eq(products.id, productId));
  return { success: true };
};

export const getAdminAnalytics = async () => {
  // Gross sales over months
  const monthlyRevenue = await db.select({
    month: sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
    gmv: sql`SUM(${orders.totalAmount})::float`,
    count: sql`COUNT(${orders.id})::int`
  })
  .from(orders)
  .where(eq(orders.paymentStatus, 'PAID'))
  .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`, sql`DATE_TRUNC('month', ${orders.createdAt})`)
  .orderBy(sql`DATE_TRUNC('month', ${orders.createdAt})`);

  // User growth (signups per month)
  const userGrowth = await db.select({
    month: sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`,
    count: sql`COUNT(${users.id})::int`
  })
  .from(users)
  .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`, sql`DATE_TRUNC('month', ${users.createdAt})`)
  .orderBy(sql`DATE_TRUNC('month', ${users.createdAt})`);

  return { monthlyRevenue, userGrowth };
};
