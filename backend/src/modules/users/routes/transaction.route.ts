import { Router } from 'express';
import { createTransaction, getTransactionsByAccount, getTransactionById } from '../controllers/transaction.controller.js';

const router = Router();

router.post('/', createTransaction);
router.get('/account/:accountId', getTransactionsByAccount);
router.get('/:id', getTransactionById);

export default router;
