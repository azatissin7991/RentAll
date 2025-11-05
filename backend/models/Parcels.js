import mongoose from 'mongoose';

const parcelsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    direction: {
      type: String,
      enum: ['US_to_Kazakhstan', 'Kazakhstan_to_US'],
      required: true,
    },
    travelDate: {
      type: Date,
      required: true,
    },
    locationFrom: {
      type: String,
      required: true,
      trim: true,
    },
    locationTo: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Parcels = mongoose.model('Parcels', parcelsSchema);

export default Parcels;

