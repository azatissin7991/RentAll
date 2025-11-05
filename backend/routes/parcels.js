import express from 'express';
import {
  getAllParcels,
  getParcelById,
  createParcel,
  updateParcel,
  deleteParcel,
  getMyParcels,
} from '../controllers/parcelsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET routes are public (no auth needed)
router.get('/', getAllParcels);
router.get('/my-listings', protect, getMyParcels);
router.get('/:id', getParcelById);

// POST/PUT/DELETE routes require authentication
router.post('/', protect, createParcel);
router.put('/:id', protect, updateParcel);
router.delete('/:id', protect, deleteParcel);

export default router;

