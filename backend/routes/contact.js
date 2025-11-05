import express from 'express';
import { createContact, getAllContacts } from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route - anyone can submit contact form
router.post('/', createContact);

// Protected route - only authenticated users can view all contacts (for admin)
router.get('/', protect, getAllContacts);

export default router;

