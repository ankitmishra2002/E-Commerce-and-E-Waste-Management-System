import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { addressSchema } from '../utils/validators.js';

const router = Router();

router.get('/', verifyToken, userController.getAddresses);
router.post('/', verifyToken, validate(addressSchema), userController.createAddress);
router.put('/:id', verifyToken, validate(addressSchema.partial()), userController.updateAddress);
router.delete('/:id', verifyToken, userController.deleteAddress);
router.put('/:id/default', verifyToken, userController.setDefaultAddress);

export default router;
