import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    moviePoster: {
      type: String,
    },
    cinemaName: {
      type: String,
      required: true,
    },
    cinemaCity: {
      type: String,
      required: true,
    },
    screenNumber: {
      type: Number,
      default: 1,
    },
    format: {
      type: String,
      default: 'Dolby Atmos 2D',
    },
    showDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    showTime: {
      type: String, // e.g. '07:30 PM'
      required: true,
    },
    seats: [
      {
        seatNumber: { type: String, required: true },
        tier: { type: String, default: 'Prime' },
        price: { type: Number, required: true },
      },
    ],
    baseAmount: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 30,
    },
    taxAmount: {
      type: Number,
      default: 5.4,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled', 'failed'],
      default: 'pending_payment',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['phonepe_qr', 'razorpay', 'demo_mode'],
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    confirmedAt: {
      type: Date,
    },
    qrCodeData: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to generate PNR
bookingSchema.statics.generateBookingRef = function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IMV-';
  for (let i = 0; i < 7; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

export default mongoose.model('Booking', bookingSchema);
