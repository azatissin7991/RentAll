import mongoose from 'mongoose';
import Parcels from '../models/Parcels.js';

// GET all parcels (always show all active listings - public view)
export const getAllParcels = async (req, res) => {
  try {
    const parcels = await Parcels.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET user's own parcel listings
export const getMyParcels = async (req, res) => {
  try {
    const parcels = await Parcels.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET single parcel by ID (public - anyone can view)
export const getParcelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid parcel ID format' });
    }
    
    const parcel = await Parcels.findById(id);
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel listing not found' });
    }
    
    // Public access - anyone can view any listing
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create new parcel
export const createParcel = async (req, res) => {
  try {
    const parcel = new Parcels({
      ...req.body,
      user: req.user._id,
    });
    const savedParcel = await parcel.save();
    res.status(201).json(savedParcel);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// PUT update parcel
export const updateParcel = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid parcel ID format' });
    }
    
    const parcel = await Parcels.findById(id);
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel listing not found' });
    }
    
    // Check if user owns this listing
    if (parcel.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }
    
    const updatedParcel = await Parcels.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json(updatedParcel);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// DELETE parcel
export const deleteParcel = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid parcel ID format' });
    }
    
    const parcel = await Parcels.findById(id);
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel listing not found' });
    }
    
    // Check if user owns this listing
    if (parcel.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    await Parcels.findByIdAndDelete(id);
    
    res.json({ message: 'Parcel listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

