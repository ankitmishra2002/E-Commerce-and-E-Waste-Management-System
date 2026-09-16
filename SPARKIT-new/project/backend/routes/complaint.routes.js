import { Router } from 'express';
import * as complaintController from '../controllers/complaint.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadComplaintImages } from '../middleware/upload.middleware.js';
import { 
  complaintSchema, 
  complaintResolutionSchema, 
  complaintStatusSchema 
} from '../utils/validators.js';

const router = Router();

// User routes
router.post('/', verifyToken, uploadComplaintImages, validate(complaintSchema), complaintController.createComplaint);
router.get('/', verifyToken, complaintController.getUserComplaints);

// Role specific overview lists (must be registered above standard parameter routes)
router.get('/admin', verifyToken, requireRole('ADMIN'), complaintController.getAdminComplaints);
router.get('/vendor', verifyToken, requireRole('VENDOR'), complaintController.getVendorComplaints);

// Detail and modification routes
router.get('/:id', verifyToken, complaintController.getComplaintById);
router.put('/:id/respond', verifyToken, requireRole('VENDOR', 'ADMIN'), validate(complaintResolutionSchema), complaintController.respondToComplaint);
router.put('/:id/status', verifyToken, requireRole('ADMIN'), validate(complaintStatusSchema), complaintController.updateComplaintStatus);

export default router;
