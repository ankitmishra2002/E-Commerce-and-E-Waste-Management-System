import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { sendError } from './utils/apiResponse.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import orderRoutes from './routes/order.routes.js';
import reviewRoutes from './routes/review.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import addressRoutes from './routes/user.routes.js'; // address operations mapped to user routes
import vendorRoutes from './routes/vendor.routes.js';
import adminRoutes from './routes/admin.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import ewasteRoutes from './routes/ewaste.routes.js';

const app = express();

// Security checklist: apply helmet with appropriate configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Scalability checklist: Response compression for JSON payloads & assets
app.use(compression());

// Cookie & Body Parsers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // protect against payload size floods
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 150, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // 20 requests per IP on auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth requests from this IP. Blocked for 15 minutes.' }
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// Serve static uploaded files (for local disk upload fallback)
app.use('/uploads', express.static('./uploads'));

// Map API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ewaste', ewasteRoutes);

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to SparkIT E-Commerce REST API' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Centralized Error Boundary Middleware
app.use((err, req, res, next) => {
  console.error("GLOBAL SERVER ERROR:", err);

  // 1. Zod Validation Error (Unprocessable Entity 422)
  if (err.name === 'ZodError' || err.errors) {
    return sendError(res, 'Validation failed', 422, err.errors);
  }

  // 2. Drizzle PostgreSQL Constraints Violation
  if (err.code === '23505') {
    // Unique violation (e.g. email already exists)
    return sendError(res, 'Record already exists.', 409);
  }
  if (err.code === '23503') {
    // Foreign key violation
    return sendError(res, 'Operation failed. Referencing entity does not exist.', 400);
  }

  // 3. JWT Verification Failures
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid auth credentials token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Auth credentials token has expired.', 401);
  }

  // 4. Cloudinary Errors
  if (err.http_code) {
    return sendError(res, `Media server upload error: ${err.message}`, err.http_code);
  }

  // 5. Default Generic 500 error
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  return sendError(res, message, err.statusCode || 500);
});

export default app;
