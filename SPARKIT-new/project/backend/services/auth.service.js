import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { users, vendorProfiles, carts } from '../models/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_must_be_overridden_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret';

// JWT Generation Helpers
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async ({ name, email, password }) => {
  // Check if email already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert user & create cart in a transaction to guarantee data integrity
  let newUser;
  
  if (db.transaction) {
    newUser = await db.transaction(async (tx) => {
      const [insertedUser] = await tx.insert(users).values({
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      }).returning();

      // Create a cart for the user
      await tx.insert(carts).values({
        userId: insertedUser.id
      });

      return insertedUser;
    });
  } else {
    // Fallback if transaction isn't supported (local testing / mocks)
    const [insertedUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'USER'
    }).returning();

    await db.insert(carts).values({
      userId: insertedUser.id
    });
    
    newUser = insertedUser;
  }

  const { password: _, ...userWithoutPassword } = newUser;
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const login = async (email, password) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user || !user.isActive) {
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...userWithoutPassword } = user;
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const vendorRegister = async ({ name, email, password, businessName, businessDescription, gstNumber, bankAccountInfo }) => {
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error('Email already registered');
  }

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
        bankAccountInfo,
        isVerified: false // Admin must verify vendor later
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
      bankAccountInfo,
      isVerified: false
    });

    newVendor = insertedUser;
  }

  const { password: _, ...userWithoutPassword } = newVendor;
  const accessToken = generateAccessToken(newVendor);
  const refreshToken = generateRefreshToken(newVendor);

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const vendorLogin = async (email, password) => {
  const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.role, 'VENDOR'))).limit(1);
  
  if (!user || !user.isActive) {
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  // Get vendor profile to see if they are verified
  const [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, user.id)).limit(1);
  
  const { password: _, ...userWithoutPassword } = user;
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { 
    user: { ...userWithoutPassword, businessName: profile?.businessName, isVerified: profile?.isVerified }, 
    accessToken, 
    refreshToken 
  };
};

export const handleRefreshToken = async (refreshToken) => {
  if (!refreshToken) throw new Error('Refresh token is required');
  
  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
  
  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const getMe = async (userId) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error('User not found');
  
  const { password: _, ...userWithoutPassword } = user;
  
  if (user.role === 'VENDOR') {
    const [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId)).limit(1);
    return { ...userWithoutPassword, profile };
  }
  
  return userWithoutPassword;
};

export const updateMe = async (userId, { name, email }) => {
  const updateData = {};
  if (name) updateData.name = name;
  if (email) {
    // Check if email already exists
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing && existing.id !== userId) {
      throw new Error('Email is already taken');
    }
    updateData.email = email;
  }

  const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const updatePassword = async (userId, oldPassword, newPassword) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error('User not found');

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatch) throw new Error('Incorrect old password');

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ password: hashedNewPassword }).where(eq(users.id, userId));
  return { success: true };
};

export const updateAvatar = async (userId, avatarUrl) => {
  const [updatedUser] = await db.update(users).set({ avatar: avatarUrl }).where(eq(users.id, userId)).returning();
  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};
