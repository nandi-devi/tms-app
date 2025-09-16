import { Router } from 'express';
import {
  getAllTransporters,
  getTransporterById,
  createTransporter,
  updateTransporter,
  deleteTransporter
} from '../controllers/transporterController';

const router = Router();

router.get('/', getAllTransporters);
router.get('/:id', getTransporterById);
router.post('/', createTransporter);
router.put('/:id', updateTransporter);
router.delete('/:id', deleteTransporter);

export default router;
