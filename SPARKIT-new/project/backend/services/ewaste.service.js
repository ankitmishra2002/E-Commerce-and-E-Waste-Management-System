import { eq, and, desc, isNull, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { ewasteRequests, users, addresses } from '../models/schema.js';
import * as notificationService from './notification.service.js';

export const createRequest = async (userId, data) => {
  const [request] = await db.insert(ewasteRequests).values({
    ...data,
    userId,
    status: 'PENDING',
    adminApprovalStatus: 'PENDING',
    paymentStatus: 'UNPAID'
  }).returning();

  return request;
};

export const getUserRequests = async (userId) => {
  return db.select({
    id: ewasteRequests.id,
    category: ewasteRequests.category,
    brand: ewasteRequests.brand,
    condition: ewasteRequests.condition,
    age: ewasteRequests.age,
    accessories: ewasteRequests.accessories,
    images: ewasteRequests.images,
    status: ewasteRequests.status,
    vendorId: ewasteRequests.vendorId,
    verifiedCondition: ewasteRequests.verifiedCondition,
    quotedPrice: ewasteRequests.quotedPrice,
    inspectionNotes: ewasteRequests.inspectionNotes,
    adminApprovalStatus: ewasteRequests.adminApprovalStatus,
    paymentStatus: ewasteRequests.paymentStatus,
    paymentMethod: ewasteRequests.paymentMethod,
    rating: ewasteRequests.rating,
    review: ewasteRequests.review,
    createdAt: ewasteRequests.createdAt,
    updatedAt: ewasteRequests.updatedAt,
    address: addresses
  })
  .from(ewasteRequests)
  .leftJoin(addresses, eq(ewasteRequests.addressId, addresses.id))
  .where(eq(ewasteRequests.userId, userId))
  .orderBy(desc(ewasteRequests.createdAt));
};

export const getRequestById = async (id, userId, role) => {
  const [request] = await db.select({
    id: ewasteRequests.id,
    userId: ewasteRequests.userId,
    addressId: ewasteRequests.addressId,
    category: ewasteRequests.category,
    brand: ewasteRequests.brand,
    condition: ewasteRequests.condition,
    age: ewasteRequests.age,
    accessories: ewasteRequests.accessories,
    images: ewasteRequests.images,
    status: ewasteRequests.status,
    vendorId: ewasteRequests.vendorId,
    verifiedCondition: ewasteRequests.verifiedCondition,
    quotedPrice: ewasteRequests.quotedPrice,
    inspectionNotes: ewasteRequests.inspectionNotes,
    adminApprovalStatus: ewasteRequests.adminApprovalStatus,
    paymentStatus: ewasteRequests.paymentStatus,
    paymentMethod: ewasteRequests.paymentMethod,
    rating: ewasteRequests.rating,
    review: ewasteRequests.review,
    createdAt: ewasteRequests.createdAt,
    updatedAt: ewasteRequests.updatedAt,
    address: addresses,
    user: {
      name: users.name,
      email: users.email
    }
  })
  .from(ewasteRequests)
  .leftJoin(addresses, eq(ewasteRequests.addressId, addresses.id))
  .leftJoin(users, eq(ewasteRequests.userId, users.id))
  .where(eq(ewasteRequests.id, id))
  .limit(1);

  if (!request) {
    throw new Error('E-Waste request not found');
  }

  // Authorization checks
  if (role !== 'ADMIN') {
    if (role === 'USER' && request.userId !== userId) {
      throw new Error('Not authorized to view this request');
    }
    if (role === 'VENDOR' && request.vendorId && request.vendorId !== userId) {
      throw new Error('Not authorized to view this request');
    }
  }

  // If vendor is assigned, attach vendor info
  let vendorInfo = null;
  if (request.vendorId) {
    const [vendor] = await db.select({
      name: users.name,
      email: users.email
    })
    .from(users)
    .where(eq(users.id, request.vendorId))
    .limit(1);
    if (vendor) vendorInfo = vendor;
  }

  return {
    ...request,
    vendor: vendorInfo,
    customer: request.user
  };
};

export const getVendorAvailableRequests = async () => {
  return db.select({
    id: ewasteRequests.id,
    category: ewasteRequests.category,
    brand: ewasteRequests.brand,
    condition: ewasteRequests.condition,
    age: ewasteRequests.age,
    accessories: ewasteRequests.accessories,
    images: ewasteRequests.images,
    status: ewasteRequests.status,
    createdAt: ewasteRequests.createdAt,
    address: addresses,
    customer: {
      name: users.name
    }
  })
  .from(ewasteRequests)
  .leftJoin(addresses, eq(ewasteRequests.addressId, addresses.id))
  .leftJoin(users, eq(ewasteRequests.userId, users.id))
  .where(eq(ewasteRequests.status, 'PENDING'))
  .orderBy(desc(ewasteRequests.createdAt));
};

export const getVendorAssignedRequests = async (vendorId) => {
  return db.select({
    id: ewasteRequests.id,
    category: ewasteRequests.category,
    brand: ewasteRequests.brand,
    condition: ewasteRequests.condition,
    age: ewasteRequests.age,
    accessories: ewasteRequests.accessories,
    images: ewasteRequests.images,
    status: ewasteRequests.status,
    verifiedCondition: ewasteRequests.verifiedCondition,
    quotedPrice: ewasteRequests.quotedPrice,
    inspectionNotes: ewasteRequests.inspectionNotes,
    adminApprovalStatus: ewasteRequests.adminApprovalStatus,
    paymentStatus: ewasteRequests.paymentStatus,
    paymentMethod: ewasteRequests.paymentMethod,
    createdAt: ewasteRequests.createdAt,
    address: addresses,
    customer: {
      name: users.name,
      email: users.email
    }
  })
  .from(ewasteRequests)
  .leftJoin(addresses, eq(ewasteRequests.addressId, addresses.id))
  .leftJoin(users, eq(ewasteRequests.userId, users.id))
  .where(eq(ewasteRequests.vendorId, vendorId))
  .orderBy(desc(ewasteRequests.createdAt));
};

export const acceptRequest = async (requestId, vendorId) => {
  const [request] = await db.select().from(ewasteRequests).where(eq(ewasteRequests.id, requestId)).limit(1);
  if (!request) {
    throw new Error('E-Waste request not found');
  }
  if (request.status !== 'PENDING') {
    throw new Error('Request has already been accepted or handled');
  }

  const [updated] = await db.update(ewasteRequests)
    .set({
      vendorId,
      status: 'ACCEPTED',
      updatedAt: new Date()
    })
    .where(eq(ewasteRequests.id, requestId))
    .returning();

  // Notify user
  await notificationService.create(
    request.userId,
    'EWAS_ACCEPTED',
    'E-Waste Request Accepted',
    `A vendor has accepted your pickup request for the ${request.category}.`,
    { requestId }
  );

  return updated;
};

export const inspectRequest = async (requestId, vendorId, data) => {
  const [request] = await db.select().from(ewasteRequests).where(eq(ewasteRequests.id, requestId)).limit(1);
  if (!request) {
    throw new Error('E-Waste request not found');
  }
  if (request.vendorId !== vendorId) {
    throw new Error('You are not the assigned vendor for this request');
  }
  if (request.status !== 'ACCEPTED') {
    throw new Error('Request must be in ACCEPTED status to inspect');
  }

  const [updated] = await db.update(ewasteRequests)
    .set({
      verifiedCondition: data.verifiedCondition,
      quotedPrice: sql`${data.quotedPrice}::numeric`,
      inspectionNotes: data.inspectionNotes || null,
      status: 'QUOTE_PROVIDED',
      updatedAt: new Date()
    })
    .where(eq(ewasteRequests.id, requestId))
    .returning();

  // Notify user
  await notificationService.create(
    request.userId,
    'EWAS_QUOTE',
    'New Price Quotation',
    `The vendor has inspected your ${request.category} and quoted a price of ₹${data.quotedPrice}.`,
    { requestId }
  );

  return updated;
};

export const respondToQuote = async (requestId, userId, action) => {
  const [request] = await db.select().from(ewasteRequests).where(eq(ewasteRequests.id, requestId)).limit(1);
  if (!request) {
    throw new Error('E-Waste request not found');
  }
  if (request.userId !== userId) {
    throw new Error('Not authorized to respond to this quote');
  }
  if (request.status !== 'QUOTE_PROVIDED') {
    throw new Error('No active quote provided for this request');
  }

  const newStatus = action === 'ACCEPT' ? 'QUOTE_ACCEPTED' : 'QUOTE_REJECTED';

  const [updated] = await db.update(ewasteRequests)
    .set({
      status: newStatus,
      adminApprovalStatus: action === 'ACCEPT' ? 'PENDING' : 'REJECTED',
      updatedAt: new Date()
    })
    .where(eq(ewasteRequests.id, requestId))
    .returning();

  // Notify vendor if assigned
  if (request.vendorId) {
    await notificationService.create(
      request.vendorId,
      'EWAS_QUOTE_RESPOND',
      'Quote Status Updated',
      `The user has ${action === 'ACCEPT' ? 'accepted' : 'rejected'} your price quote for request #${requestId.slice(0, 8)}.`,
      { requestId }
    );
  }

  return updated;
};

export const completePaymentAndPickup = async (requestId, vendorId, paymentMethod) => {
  const [request] = await db.select().from(ewasteRequests).where(eq(ewasteRequests.id, requestId)).limit(1);
  if (!request) {
    throw new Error('E-Waste request not found');
  }
  if (request.vendorId !== vendorId) {
    throw new Error('You are not the assigned vendor for this request');
  }
  if (request.status !== 'QUOTE_ACCEPTED') {
    throw new Error('Quotation must be accepted before completing pickup');
  }
  if (request.adminApprovalStatus !== 'APPROVED') {
    throw new Error('Transaction requires Admin approval before completing');
  }

  const [updated] = await db.update(ewasteRequests)
    .set({
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod,
      updatedAt: new Date()
    })
    .where(eq(ewasteRequests.id, requestId))
    .returning();

  // Notify user
  await notificationService.create(
    request.userId,
    'EWAS_COMPLETED',
    'E-Waste Collection Completed',
    `Your e-waste pickup for the ${request.category} has been completed and payment has been processed.`,
    { requestId }
  );

  return updated;
};

export const submitRating = async (requestId, userId, rating, review) => {
  const [request] = await db.select().from(ewasteRequests).where(eq(ewasteRequests.id, requestId)).limit(1);
  if (!request) {
    throw new Error('E-Waste request not found');
  }
  if (request.userId !== userId) {
    throw new Error('Not authorized to rate this request');
  }
  if (request.status !== 'COMPLETED') {
    throw new Error('You can only rate completed transactions');
  }

  const [updated] = await db.update(ewasteRequests)
    .set({
      rating,
      review: review || null,
      updatedAt: new Date()
    })
    .where(eq(ewasteRequests.id, requestId))
    .returning();

  return updated;
};

export const getAdminRequests = async () => {
  return db.select({
    id: ewasteRequests.id,
    category: ewasteRequests.category,
    brand: ewasteRequests.brand,
    condition: ewasteRequests.condition,
    age: ewasteRequests.age,
    accessories: ewasteRequests.accessories,
    images: ewasteRequests.images,
    status: ewasteRequests.status,
    vendorId: ewasteRequests.vendorId,
    verifiedCondition: ewasteRequests.verifiedCondition,
    quotedPrice: ewasteRequests.quotedPrice,
    inspectionNotes: ewasteRequests.inspectionNotes,
    adminApprovalStatus: ewasteRequests.adminApprovalStatus,
    paymentStatus: ewasteRequests.paymentStatus,
    paymentMethod: ewasteRequests.paymentMethod,
    rating: ewasteRequests.rating,
    review: ewasteRequests.review,
    createdAt: ewasteRequests.createdAt,
    updatedAt: ewasteRequests.updatedAt,
    address: addresses,
    customer: {
      name: users.name,
      email: users.email
    }
  })
  .from(ewasteRequests)
  .leftJoin(addresses, eq(ewasteRequests.addressId, addresses.id))
  .leftJoin(users, eq(ewasteRequests.userId, users.id))
  .orderBy(desc(ewasteRequests.createdAt));
};

export const adminApproveTransaction = async (requestId, approvalStatus) => {
  const [request] = await db.select().from(ewasteRequests).where(eq(ewasteRequests.id, requestId)).limit(1);
  if (!request) {
    throw new Error('E-Waste request not found');
  }
  if (request.status !== 'QUOTE_ACCEPTED') {
    throw new Error('Request must be in QUOTE_ACCEPTED status to approve or reject');
  }

  const newStatus = approvalStatus === 'APPROVED' ? 'QUOTE_ACCEPTED' : 'CANCELLED';

  const [updated] = await db.update(ewasteRequests)
    .set({
      adminApprovalStatus: approvalStatus,
      status: newStatus,
      updatedAt: new Date()
    })
    .where(eq(ewasteRequests.id, requestId))
    .returning();

  // Notify user & vendor
  const message = approvalStatus === 'APPROVED' 
    ? 'E-Waste transaction approved by admin' 
    : 'E-Waste transaction rejected by admin';

  await notificationService.create(
    request.userId,
    'EWAS_ADMIN_APPROVE',
    'E-Waste Transaction Status',
    `Your transaction of ₹${request.quotedPrice} has been ${approvalStatus.toLowerCase()} by Admin.`,
    { requestId }
  );

  if (request.vendorId) {
    await notificationService.create(
      request.vendorId,
      'EWAS_ADMIN_APPROVE',
      'E-Waste Transaction Status',
      `Transaction for request #${requestId.slice(0, 8)} has been ${approvalStatus.toLowerCase()} by Admin.`,
      { requestId }
    );
  }

  return updated;
};

export const getAdminVendorRatings = async () => {
  const completedPickups = await db.select({
    vendorId: ewasteRequests.vendorId,
    rating: ewasteRequests.rating,
    quotedPrice: ewasteRequests.quotedPrice
  })
  .from(ewasteRequests)
  .where(and(eq(ewasteRequests.status, 'COMPLETED'), sql`${ewasteRequests.vendorId} IS NOT NULL`));

  const allVendors = await db.select({
    id: users.id,
    name: users.name,
    email: users.email
  })
  .from(users)
  .where(eq(users.role, 'VENDOR'));

  return allVendors.map(vendor => {
    const vendorPickups = completedPickups.filter(p => p.vendorId === vendor.id);
    const completedCount = vendorPickups.length;
    const ratedPickups = vendorPickups.filter(p => p.rating !== null);
    const averageRating = ratedPickups.length > 0 
      ? parseFloat((ratedPickups.reduce((acc, curr) => acc + curr.rating, 0) / ratedPickups.length).toFixed(2))
      : 0;

    return {
      vendorId: vendor.id,
      name: vendor.name,
      email: vendor.email,
      completedCount,
      averageRating
    };
  });
};
