import { Router } from 'express';
import * as ewasteController from '../controllers/ewaste.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadEwasteImages } from '../middleware/upload.middleware.js';
import {
  ewasteRequestCreateSchema,
  ewasteInspectSchema,
  ewasteUserQuoteActionSchema,
  ewasteCompletePaymentSchema,
  ewasteRatingSchema
} from '../utils/validators.js';

const router = Router();

// User endpoints
router.post('/', verifyToken, requireRole('USER'), uploadEwasteImages, validate(ewasteRequestCreateSchema), ewasteController.createRequest);
router.get('/', verifyToken, requireRole('USER'), ewasteController.getUserRequests);
router.get('/:id', verifyToken, ewasteController.getRequestById); // USER, VENDOR, or ADMIN can view if authorized
router.put('/:id/quote', verifyToken, requireRole('USER'), validate(ewasteUserQuoteActionSchema), ewasteController.respondToQuote);
router.post('/:id/rate', verifyToken, requireRole('USER'), validate(ewasteRatingSchema), ewasteController.submitRating);

// Vendor endpoints
router.get('/vendor/available', verifyToken, requireRole('VENDOR'), ewasteController.getVendorAvailableRequests);
router.get('/vendor/assigned', verifyToken, requireRole('VENDOR'), ewasteController.getVendorAssignedRequests);
router.put('/:id/accept', verifyToken, requireRole('VENDOR'), ewasteController.acceptRequest);
router.put('/:id/inspect', verifyToken, requireRole('VENDOR'), validate(ewasteInspectSchema), ewasteController.inspectRequest);
router.put('/:id/complete', verifyToken, requireRole('VENDOR'), validate(ewasteCompletePaymentSchema), ewasteController.completePaymentAndPickup);

// Admin endpoints
router.get('/admin/all', verifyToken, requireRole('ADMIN'), ewasteController.getAdminRequests);
router.put('/:id/admin-approve', verifyToken, requireRole('ADMIN'), ewasteController.adminApproveTransaction);
router.get('/admin/vendors', verifyToken, requireRole('ADMIN'), ewasteController.getAdminVendorRatings);

export default router;
