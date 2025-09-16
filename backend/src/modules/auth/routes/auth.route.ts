import { Router } from 'express';
import { handleLogin, handleSignup, handleLogout, handleMe, handleForgot, handleReset, handleResetRequest, handleResetPassword } from '../controllers/auth.controller.js';
import { validate } from '../../../common/middleware/validate.js';
import { signupSchema, loginSchema, forgotSchema, resetSchema, resetPasswordSchema } from '../schemas/auth.schema.js';
import { authGuard } from '../../../common/middleware/auth.js';
import { rateLimit } from '../../../common/middleware/rateLimit.js';

const router = Router();
router.post('/signup', rateLimit({ bucket: 'auth:signup', windowSeconds: 600, limit: 3 }), validate(signupSchema), handleSignup);
router.post('/login', rateLimit({ bucket: 'auth:login', windowSeconds: 60, limit: 5 }), validate(loginSchema), handleLogin);
router.post('/forgot', rateLimit({ bucket: 'auth:forgot', windowSeconds: 300, limit: 5 }), validate(forgotSchema), handleForgot);
router.post('/reset', rateLimit({ bucket: 'auth:reset', windowSeconds: 300, limit: 5 }), validate(resetSchema), handleReset);
router.post('/forgotpassword', rateLimit({ bucket: 'auth:forgot', windowSeconds: 300, limit: 5 }), validate(forgotSchema), handleResetRequest);
router.post('/resetpassword', rateLimit({ bucket: 'auth:reset', windowSeconds: 300, limit: 5 }), validate(resetPasswordSchema), handleResetPassword);
router.post('/logout', handleLogout);
router.get('/me', authGuard, handleMe);
export default router;
