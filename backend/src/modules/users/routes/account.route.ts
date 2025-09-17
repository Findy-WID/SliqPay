import { Router } from 'express';
import { createAccount, getAccountsByUser, getAccountById, updateAccountBalance } from '../controllers/account.controller.js';

const router = Router();

router.post('/', createAccount);
router.get('/user/:userId', getAccountsByUser);
router.get('/:id', getAccountById);
router.patch('/:id/balance', updateAccountBalance);

export default router;
