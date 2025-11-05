import mongoose from 'mongoose';

const autoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    listingType: {
      type: String,
      enum: ['rent', 'sale'],
      required: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    location: {
      type: String,
      enum: ['Orange County', 'Los Angeles'],
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mileage: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true,
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual'],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['gasoline', 'electric', 'hybrid', 'diesel'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    availableFrom: {
      type: Date,
      required: function () {
        return this.listingType === 'rent';
      },
    },
    availableUntil: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Auto = mongoose.model('Auto', autoSchema);

export default Auto;

