import express from 'express';
import { resetData, backupData, restoreData } from '../controllers/dataController';
import NumberingConfig from '../models/numbering';
import type { Request, Response } from 'express';

const router = express.Router();

// @desc    Reset all application data
// @route   POST /api/data/reset
router.post('/reset', resetData);

// @desc    Backup all application data
// @route   GET /api/data/backup
router.get('/backup', backupData);

// @desc    Restore application data from a backup
// @route   POST /api/data/restore
router.post('/restore', restoreData);

// Numbering config endpoints
router.get('/numbering', async (req: Request, res: Response) => {
  const items = await NumberingConfig.find({});
  res.json(items);
});

router.post('/numbering', async (req: Request, res: Response) => {
  const { key, start, end, allowOutsideRange } = req.body as any;
  if (!key || typeof start !== 'number' || typeof end !== 'number' || start > end) {
    return res.status(400).json({ message: 'Invalid numbering configuration payload' });
  }
  const existing = await NumberingConfig.findById(key);
  if (existing) {
    existing.start = start;
    existing.end = end;
    // If current next is outside new range, reset to start
    existing.next = Math.max(start, Math.min(existing.next, end + 1));
    existing.allowOutsideRange = !!allowOutsideRange;
    await existing.save();
    return res.json(existing);
  }
  const created = await NumberingConfig.create({ _id: key, start, end, next: start, allowOutsideRange: !!allowOutsideRange });
  res.status(201).json(created);
});

export default router;
