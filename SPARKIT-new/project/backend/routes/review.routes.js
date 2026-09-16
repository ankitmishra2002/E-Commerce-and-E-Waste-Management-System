import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { reviewSchema } from '../utils/validators.js';

const router = Router();

router.post('/products/:productId', verifyToken, validate(reviewSchema), reviewController.createReview);
router.put('/:id', verifyToken, validate(reviewSchema.partial()), reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);
router.get('/vendor/products/:productId', verifyToken, requireRole('VENDOR'), reviewController.getVendorProductReviews);

export default router;
