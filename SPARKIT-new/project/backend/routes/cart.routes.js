import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { cartItemSchema } from '../utils/validators.js'; // Zod schemas
import { z } from 'zod';

const router = Router();

const quantitySchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be at least 1')
});

router.get('/', verifyToken, cartController.getCart);
router.post('/items', verifyToken, validate(cartItemSchema), cartController.addItem);
router.put('/items/:itemId', verifyToken, validate(quantitySchema), cartController.updateItem);
router.delete('/items/:itemId', verifyToken, cartController.removeItem);
router.delete('/', verifyToken, cartController.clearCart);

export default router;
