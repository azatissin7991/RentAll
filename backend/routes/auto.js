import express from 'express';
import {
  getAllAuto,
  getAutoById,
  createAuto,
  updateAuto,
  deleteAuto,
  getMyAuto,
} from '../controllers/autoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET routes are public (no auth needed)
router.get('/', getAllAuto);
router.get('/my-listings', protect, getMyAuto);
router.get('/:id', getAutoById);

// POST/PUT/DELETE routes require authentication
router.post('/', protect, createAuto);
router.put('/:id', protect, updateAuto);
router.delete('/:id', protect, deleteAuto);

export default router;

