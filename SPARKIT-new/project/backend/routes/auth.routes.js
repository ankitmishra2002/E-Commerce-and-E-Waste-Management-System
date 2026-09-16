import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';
import { 
  registerSchema, 
  loginSchema, 
  vendorRegisterSchema, 
  userUpdateSchema, 
  passwordUpdateSchema 
} from '../utils/validators.js';

const router = Router();

// Public auth routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/vendor/register', validate(vendorRegisterSchema), authController.vendorRegister);
router.post('/vendor/login', validate(loginSchema), authController.vendorLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes (require valid access token)
router.get('/me', verifyToken, authController.getMe);
router.put('/me', verifyToken, validate(userUpdateSchema), authController.updateMe);
router.put('/me/password', verifyToken, validate(passwordUpdateSchema), authController.updatePassword);
router.post('/me/avatar', verifyToken, uploadAvatar, authController.updateAvatar);

export default router;
