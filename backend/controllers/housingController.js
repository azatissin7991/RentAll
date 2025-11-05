import mongoose from 'mongoose';
import Housing from '../models/Housing.js';
import { deleteListingImages } from '../utils/cloudinary.js';

// GET all housing (always show all active listings - public view)
export const getAllHousing = async (req, res) => {
  try {
    const housing = await Housing.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(housing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET user's own housing listings
export const getMyHousing = async (req, res) => {
  try {
    const housing = await Housing.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json(housing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET single housing by ID (public - anyone can view)
export const getHousingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid housing ID format' });
    }
    
    const housing = await Housing.findById(id);
    
    if (!housing) {
      return res.status(404).json({ error: 'Housing listing not found' });
    }
    
    // Public access - anyone can view any listing
    res.json(housing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create new housing
export const createHousing = async (req, res) => {
  try {
    const housing = new Housing({
      ...req.body,
      user: req.user._id,
    });
    const savedHousing = await housing.save();
    res.status(201).json(savedHousing);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// PUT update housing
export const updateHousing = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid housing ID format' });
    }
    
    const housing = await Housing.findById(id);
    
    if (!housing) {
      return res.status(404).json({ error: 'Housing listing not found' });
    }
    
    // Check if user owns this listing
    if (housing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }
    
    const updatedHousing = await Housing.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json(updatedHousing);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// DELETE housing
export const deleteHousing = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid housing ID format' });
    }
    
    const housing = await Housing.findById(id);
    
    if (!housing) {
      return res.status(404).json({ error: 'Housing listing not found' });
    }
    
    // Check if user owns this listing
    if (housing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    // Delete images from Cloudinary before deleting the listing
    try {
      await deleteListingImages(housing);
    } catch (error) {
      console.error('Error deleting images from Cloudinary:', error);
      // Continue with listing deletion even if image deletion fails
    }
    
    await Housing.findByIdAndDelete(id);
    
    res.json({ message: 'Housing listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

