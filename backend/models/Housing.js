import mongoose from 'mongoose';

const housingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    listingType: {
      type: String,
      enum: ['room', 'apartment', 'spot_in_room'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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
    gender: {
      type: String,
      enum: ['men', 'women', 'any'],
      required: function () {
        return this.listingType === 'spot_in_room';
      },
    },
    amenities: {
      type: [String],
      default: [],
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
      required: true,
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

const Housing = mongoose.model('Housing', housingSchema);

export default Housing;

