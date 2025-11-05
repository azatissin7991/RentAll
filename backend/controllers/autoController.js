import mongoose from 'mongoose';
import Auto from '../models/Auto.js';
import { deleteListingImages } from '../utils/cloudinary.js';

// GET all auto (always show all active listings - public view)
export const getAllAuto = async (req, res) => {
  try {
    const auto = await Auto.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(auto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET user's own auto listings
export const getMyAuto = async (req, res) => {
  try {
    const auto = await Auto.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json(auto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET single auto by ID (public - anyone can view)
export const getAutoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid auto ID format' });
    }
    
    const auto = await Auto.findById(id);
    
    if (!auto) {
      return res.status(404).json({ error: 'Auto listing not found' });
    }
    
    // Public access - anyone can view any listing
    res.json(auto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create new auto
export const createAuto = async (req, res) => {
  try {
    const auto = new Auto({
      ...req.body,
      user: req.user._id,
    });
    const savedAuto = await auto.save();
    res.status(201).json(savedAuto);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// PUT update auto
export const updateAuto = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid auto ID format' });
    }
    
    const auto = await Auto.findById(id);
    
    if (!auto) {
      return res.status(404).json({ error: 'Auto listing not found' });
    }
    
    // Check if user owns this listing
    if (auto.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }
    
    const updatedAuto = await Auto.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json(updatedAuto);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// DELETE auto
export const deleteAuto = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid auto ID format' });
    }
    
    const auto = await Auto.findById(id);
    
    if (!auto) {
      return res.status(404).json({ error: 'Auto listing not found' });
    }
    
    // Check if user owns this listing
    if (auto.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    // Delete images from Cloudinary before deleting the listing
    try {
      await deleteListingImages(auto);
    } catch (error) {
      console.error('Error deleting images from Cloudinary:', error);
      // Continue with listing deletion even if image deletion fails
    }
    
    await Auto.findByIdAndDelete(id);
    
    res.json({ message: 'Auto listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

