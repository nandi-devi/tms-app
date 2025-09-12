import express from 'express';
import {
    getTruckHiringNotes,
    getTruckHiringNoteById,
    createTruckHiringNote,
    updateTruckHiringNote,
    getLastTHNForTransporter,
    sendReminder
} from '../controllers/truckHiringNoteController';

const router = express.Router();

router.get('/', getTruckHiringNotes);
router.get('/:id', getTruckHiringNoteById);
router.get('/transporter/:transporterId/last', getLastTHNForTransporter);
router.post('/', createTruckHiringNote);
router.put('/:id', updateTruckHiringNote);
router.post('/:id/reminder', sendReminder);

export default router;
