import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadProductMediaCombined } from '../middleware/upload.middleware.js';
import { productCreateSchema, productUpdateSchema } from '../utils/validators.js';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);
router.get('/:id/reviews', productController.getProductReviews);

// Protected routes (requires VENDOR or ADMIN)
router.post('/', verifyToken, requireRole('VENDOR', 'ADMIN'), validate(productCreateSchema), productController.createProduct);
router.put('/:id', verifyToken, requireRole('VENDOR', 'ADMIN'), validate(productUpdateSchema), productController.updateProduct);
router.delete('/:id', verifyToken, requireRole('VENDOR', 'ADMIN'), productController.deleteProduct);

// Media management (requires VENDOR or ADMIN)
router.post('/:id/media', verifyToken, requireRole('VENDOR', 'ADMIN'), uploadProductMediaCombined, productController.uploadProductMedia);
router.delete('/:id/media/:mediaId', verifyToken, requireRole('VENDOR', 'ADMIN'), productController.deleteProductMedia);

export default router;
