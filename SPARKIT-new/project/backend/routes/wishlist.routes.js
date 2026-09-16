import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', verifyToken, wishlistController.getWishlist);
router.post('/', verifyToken, wishlistController.addItem);
router.delete('/:productId', verifyToken, wishlistController.removeItem);
router.post('/:productId/move-to-cart', verifyToken, wishlistController.moveToCart);

export default router;
