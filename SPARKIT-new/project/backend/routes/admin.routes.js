import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as orderController from '../controllers/order.controller.js';
import * as complaintController from '../controllers/complaint.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { userUpdateSchema, registerSchema } from '../utils/validators.js';

const router = Router();

// Apply global check for ADMIN
router.use(verifyToken, requireRole('ADMIN'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/analytics', adminController.getAdminAnalytics);

// User Management
router.get('/users', adminController.getAdminUsers);
router.get('/users/:id', adminController.getAdminUserById);
router.post('/users', validate(registerSchema), adminController.createAdminUser);
router.put('/users/:id', validate(userUpdateSchema.partial()), adminController.updateAdminUser);
router.delete('/users/:id', adminController.deactivateAdminUser);

// Vendor Management
router.get('/vendors', adminController.getAdminVendors);
router.post('/vendors', adminController.createAdminVendor);
router.put('/vendors/:id/verify', adminController.verifyVendor);
router.put('/vendors/:id/suspend', adminController.suspendVendor);

// Product Management
router.get('/products', adminController.getAdminProducts);
router.delete('/products/:id', adminController.forceDeleteProduct);

// Re-route orders & complaints admin actions
router.get('/orders', orderController.getAdminOrders);
router.get('/complaints', complaintController.getAdminComplaints);

export default router;
