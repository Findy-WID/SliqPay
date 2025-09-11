import { Router } from 'express';
import health from '../modules/health/routes/health.route.js';
import auth from '../modules/auth/routes/auth.route.js';

const router = Router();
router.use('/health', health);
router.use('/auth', auth);
export default router;
