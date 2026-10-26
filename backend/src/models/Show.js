import mongoose from 'mongoose';

const tierPriceSchema = new mongoose.Schema({
  tierName: {
    type: String,
    enum: ['Recliner', 'Prime', 'Classic'],
    required: true,
  },
  rows: [{ type: String }], // e.g. ['A', 'B']
  price: { type: Number, required: true },
});

const seatLockSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedAt: { type: Date, default: Date.now, expires: 600 }, // Auto-expire locks after 10 mins
});

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true,
    },
    screenNumber: {
      type: Number,
      default: 1,
    },
    format: {
      type: String,
      default: 'Dolby Atmos 2D',
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g. '07:30 PM'
      required: true,
    },
    tiers: [tierPriceSchema],
    bookedSeats: [
      {
        type: String, // e.g. 'A1', 'C4'
      },
    ],
    lockedSeats: [seatLockSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of show per screen at same time
showSchema.index({ cinema: 1, screenNumber: 1, date: 1, startTime: 1 }, { unique: true });

export default mongoose.model('Show', showSchema);
