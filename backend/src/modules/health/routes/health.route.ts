import { Router } from 'express';
import { health, kvDemo } from '../controllers/health.controller.js';
const router = Router();
router.get('/', health);
router.get('/kv', kvDemo);
export default router;
