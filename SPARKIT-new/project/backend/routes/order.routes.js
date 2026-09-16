import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { 
  orderCreateSchema, 
  orderStatusUpdateSchema, 
  returnRequestSchema 
} from '../utils/validators.js';

const router = Router();

// User Order Management
router.post('/', verifyToken, validate(orderCreateSchema), orderController.createOrder);
router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);
router.post('/:id/return', verifyToken, validate(returnRequestSchema), orderController.requestReturn);

// Vendor Order Management
router.get('/vendor/orders', verifyToken, requireRole('VENDOR'), orderController.getVendorOrders);
router.put('/vendor/orders/:id/status', verifyToken, requireRole('VENDOR'), validate(orderStatusUpdateSchema), orderController.updateVendorOrderStatus);

// Admin Order Management
router.get('/admin/orders', verifyToken, requireRole('ADMIN'), orderController.getAdminOrders);
router.put('/admin/orders/:id/status', verifyToken, requireRole('ADMIN'), validate(orderStatusUpdateSchema), orderController.updateAdminOrderStatus);

export default router;
