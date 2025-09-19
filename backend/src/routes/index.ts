import { Router } from 'express';
import health from '../modules/health/routes/health.route.js';
import auth from '../modules/auth/routes/auth.route.js';
import account from '../modules/users/routes/account.route.js';
import transaction from '../modules/users/routes/transaction.route.js';

const router = Router();
router.use('/health', health);
router.use('/auth', auth);
router.use('/account', account);
router.use('/transaction', transaction);
export default router;
