import express from 'express';
import { setup, login, checkSetup } from '../controllers/authController';

const router = express.Router();

router.post('/setup', setup);
router.post('/login', login);
router.get('/check-setup', checkSetup);

export default router;
