import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/db.js';
import { complaints, users, products, orders } from '../models/schema.js';
import * as notificationService from './notification.service.js';

export const createComplaint = async (userId, complaintData) => {
  const [complaint] = await db.insert(complaints).values({
    ...complaintData,
    userId,
    status: 'OPEN'
  }).returning();

  return complaint;
};

export const getUserComplaints = async (userId) => {
  return db.select()
    .from(complaints)
    .where(eq(complaints.userId, userId))
    .orderBy(desc(complaints.createdAt));
};

export const getComplaintById = async (complaintId, userId, role) => {
  const [complaint] = await db.select().from(complaints).where(eq(complaints.id, complaintId)).limit(1);
  if (!complaint) {
    throw new Error('Complaint not found');
  }

  // Authorization checks
  if (role !== 'ADMIN' && complaint.userId !== userId) {
    // If vendor, check if they are the subject of complaint
    if (role === 'VENDOR' && complaint.vendorId === userId) {
      // Authorized
    } else {
      throw new Error('Not authorized to view this complaint');
    }
  }

  // Fetch linked entities if present
  let customerName = '';
  const [cust] = await db.select({ name: users.name }).from(users).where(eq(users.id, complaint.userId)).limit(1);
  if (cust) customerName = cust.name;

  let productName = '';
  if (complaint.productId) {
    const [prod] = await db.select({ name: products.name }).from(products).where(eq(products.id, complaint.productId)).limit(1);
    if (prod) productName = prod.name;
  }

  return {
    ...complaint,
    customerName,
    productName
  };
};

export const respondToComplaint = async (complaintId, userId, role, resolution) => {
  const [complaint] = await db.select().from(complaints).where(eq(complaints.id, complaintId)).limit(1);
  if (!complaint) {
    throw new Error('Complaint not found');
  }

  if (role !== 'ADMIN' && complaint.vendorId !== userId) {
    throw new Error('Not authorized to respond to this complaint');
  }

  const [updated] = await db.update(complaints)
    .set({
      resolution,
      status: 'RESOLVED',
      updatedAt: new Date()
    })
    .where(eq(complaints.id, complaintId))
    .returning();

  // Send real-time notification to the user who filed the complaint
  await notificationService.create(
    complaint.userId,
    'COMPLAINT_RESOLVED',
    'Complaint resolved',
    `Your complaint regarding "${complaint.subject}" has been resolved`,
    { complaintId }
  );

  return updated;
};

export const updateComplaintStatus = async (complaintId, status) => {
  const [updated] = await db.update(complaints)
    .set({
      status,
      updatedAt: new Date()
    })
    .where(eq(complaints.id, complaintId))
    .returning();

  return updated;
};

export const getAdminComplaints = async () => {
  return db.select()
    .from(complaints)
    .orderBy(desc(complaints.createdAt));
};

export const getVendorComplaints = async (vendorId) => {
  return db.select()
    .from(complaints)
    .where(eq(complaints.vendorId, vendorId))
    .orderBy(desc(complaints.createdAt));
};
