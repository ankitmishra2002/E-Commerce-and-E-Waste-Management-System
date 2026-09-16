import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const vendorRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(150),
  businessDescription: z.string().optional(),
  gstNumber: z.string().optional(),
  bankAccountInfo: z.record(z.any()).optional()
});

export const productCreateSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').nullable().optional(),
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  compareAtPrice: z.coerce.number().positive('Compare at price must be greater than 0').nullable().optional(),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative').default(0),
  sku: z.string().optional().nullable(),
  returnWindowDays: z.coerce.number().int().nonnegative('Return window cannot be negative').default(7),
  isActive: z.boolean().default(true).optional()
});

export const productUpdateSchema = productCreateSchema.partial();

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  line1: z.string().min(5, 'Line 1 must be at least 5 characters'),
  line2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().min(4, 'Pincode is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  isDefault: z.boolean().default(false).optional()
});

export const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1')
});

export const orderCreateSchema = z.object({
  addressId: z.string().uuid('Invalid address ID'),
  paymentMethod: z.string().min(1, 'Payment method is required').default('COD')
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  title: z.string().max(150, 'Title cannot exceed 150 characters').optional().nullable(),
  body: z.string().optional().nullable(),
  images: z.array(z.string().url('Invalid image URL')).max(4, 'Max 4 review images allowed').optional().nullable()
});

export const complaintSchema = z.object({
  vendorId: z.string().uuid('Invalid vendor ID').optional().nullable(),
  productId: z.string().uuid('Invalid product ID').optional().nullable(),
  orderId: z.string().uuid('Invalid order ID').optional().nullable(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  images: z.array(z.string().url('Invalid image URL')).max(3, 'Max 3 complaint images allowed').optional().nullable()
});

export const complaintResolutionSchema = z.object({
  resolution: z.string().min(5, 'Resolution must be at least 5 characters')
});

export const complaintStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'])
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  role: z.enum(['USER', 'ADMIN', 'VENDOR']).optional()
});

export const passwordUpdateSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'])
});

export const returnRequestSchema = z.object({
  orderItemId: z.string().uuid('Invalid order item ID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters')
});

export const returnStatusUpdateSchema = z.object({
  status: z.enum(['REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'])
});

export const ewasteRequestCreateSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  condition: z.string().min(5, 'Please provide more details about the item condition (min 5 chars)'),
  age: z.coerce.number().int().nonnegative('Age cannot be negative'),
  accessories: z.string().optional().nullable(),
  addressId: z.string().uuid('Invalid address ID')
});

export const ewasteInspectSchema = z.object({
  verifiedCondition: z.string().min(5, 'Verified condition must be at least 5 characters'),
  quotedPrice: z.coerce.number().positive('Quoted price must be greater than 0'),
  inspectionNotes: z.string().optional().nullable()
});

export const ewasteUserQuoteActionSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT'])
});

export const ewasteCompletePaymentSchema = z.object({
  paymentMethod: z.string().min(1, 'Payment method is required').refine(val => val === 'COD', {
    message: 'Only Cash on Delivery (COD) payment is supported for e-waste'
  })
});

export const ewasteRatingSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  review: z.string().optional().nullable()
});

