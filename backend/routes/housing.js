import express from 'express';
import {
  getAllHousing,
  getHousingById,
  createHousing,
  updateHousing,
  deleteHousing,
  getMyHousing,
} from '../controllers/housingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET routes are public (no auth needed)
router.get('/', getAllHousing);
router.get('/my-listings', protect, getMyHousing);
router.get('/:id', getHousingById);

// POST/PUT/DELETE routes require authentication
router.post('/', protect, createHousing);
router.put('/:id', protect, updateHousing);
router.delete('/:id', protect, deleteHousing);

export default router;

