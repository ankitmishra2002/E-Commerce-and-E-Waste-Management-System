import { Router } from 'express';
import * as trackingController from '../controllers/tracking.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/:orderId', verifyToken, requireRole('USER', 'VENDOR', 'ADMIN'), trackingController.getTimeline);
router.post('/:orderId/events', verifyToken, requireRole('VENDOR', 'ADMIN'), trackingController.addEvent);

export default router;
