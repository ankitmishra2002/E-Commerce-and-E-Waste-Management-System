import { Router } from 'express';
import * as vendorController from '../controllers/vendor.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Apply check for role VENDOR (or ADMIN as supervisor)
router.use(verifyToken, requireRole('VENDOR', 'ADMIN'));

router.get('/dashboard', vendorController.getVendorDashboard);
router.get('/products', vendorController.getVendorProducts);
router.get('/analytics/sales', vendorController.getVendorSalesAnalytics);
router.get('/analytics/revenue', vendorController.getVendorRevenueAnalytics);
router.get('/analytics/products/:id', vendorController.getVendorProductAnalytics);

export default router;
