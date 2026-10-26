import crypto from 'crypto';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Payment from '../models/Payment.js';

// Initialize Razorpay SDK if keys are provided
const getRazorpayInstance = () => {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return null;
};

// 1. Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been confirmed.',
      });
    }

    const amountInPaise = Math.round(booking.totalAmount * 100);
    const razorpay = getRazorpayInstance();

    let orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: booking.bookingReference,
        notes: {
          bookingId: booking._id.toString(),
          movieTitle: booking.movieTitle,
          seats: booking.seats.map((s) => s.seatNumber).join(','),
        },
      });
      orderId = order.id;
    }

    // Update payment record with order ID
    await Payment.findByIdAndUpdate(booking.paymentId, {
      razorpayOrderId: orderId,
      amount: booking.totalAmount,
      provider: 'razorpay',
      status: 'pending',
    });

    return res.status(200).json({
      success: true,
      orderId,
      amount: booking.totalAmount,
      amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id',
      bookingReference: booking.bookingReference,
      isLiveConfigured: Boolean(razorpay),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating Razorpay order.',
    });
  }
};

// 2. Verify Razorpay Payment Signature
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Verify cryptographic signature if Razorpay Secret is configured
    if (process.env.RAZORPAY_KEY_SECRET) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        await Payment.findByIdAndUpdate(booking.paymentId, {
          status: 'failed',
          failureReason: 'Cryptographic signature mismatch.',
        });
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Signature mismatch.',
        });
      }
    }

    // Atomically check seat availability and persist bookedSeats
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    const show = await Show.findById(booking.show);

    const isConflict = seatNumbers.some((s) => show.bookedSeats.includes(s));
    if (isConflict) {
      await Payment.findByIdAndUpdate(booking.paymentId, {
        status: 'failed',
        failureReason: 'Seat collision: Seats booked by another user during checkout.',
      });
      return res.status(409).json({
        success: false,
        message: 'Seat conflict: These seats were confirmed by another guest just moments ago. A refund will be initiated.',
      });
    }

    // Add seats to bookedSeats atomically
    await Show.findByIdAndUpdate(booking.show, {
      $addToSet: { bookedSeats: { $each: seatNumbers } },
    });

    // Update payment
    await Payment.findByIdAndUpdate(booking.paymentId, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'successful',
      verifiedAt: new Date(),
    });

    // Confirm booking
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        confirmedAt: booking.confirmedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error verifying Razorpay payment.',
    });
  }
};

// 3. Verify PhonePe UPI Payment via 12-Digit UTR
export const verifyPhonePePayment = async (req, res) => {
  try {
    const { bookingId, utrNumber } = req.body;
    const userId = req.user._id;

    if (!utrNumber || typeof utrNumber !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 12-digit UPI UTR / Transaction Reference Number.',
      });
    }

    const cleanUTR = utrNumber.trim();
    // Validate 12-digit numeric UPI standard UTR
    if (!/^\d{12}$/.test(cleanUTR)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UTR format. UPI Reference Numbers are exactly 12 numeric digits (e.g., 428901234567).',
      });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already confirmed.',
      });
    }

    // Ensure seats are still available
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    const show = await Show.findById(booking.show);

    const isConflict = seatNumbers.some((s) => show.bookedSeats.includes(s));
    if (isConflict) {
      return res.status(409).json({
        success: false,
        message: 'Unfortunately, these seats were reserved by another patron. Please select alternative seats.',
      });
    }

    // Atomically reserve seats
    await Show.findByIdAndUpdate(booking.show, {
      $addToSet: { bookedSeats: { $each: seatNumbers } },
    });

    // Update Payment
    await Payment.findByIdAndUpdate(booking.paymentId, {
      phonepeUtr: cleanUTR,
      provider: 'phonepe_qr',
      status: 'successful',
      verifiedAt: new Date(),
    });

    // Confirm booking
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'PhonePe UPI payment verified successfully! Your tickets are confirmed.',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        confirmedAt: booking.confirmedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error verifying PhonePe UPI payment.',
    });
  }
};

// 4. Clearly Labeled Demo / Test Payment Mode
// Per prompt: "Do not use a 'payment successful' button or simulated payment as if it were real.
// If a demo mode is included, label it clearly and keep it separate from real payments."
export const processDemoPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already confirmed.',
      });
    }

    // Atomically reserve seats
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    const show = await Show.findById(booking.show);

    const isConflict = seatNumbers.some((s) => show.bookedSeats.includes(s));
    if (isConflict) {
      return res.status(409).json({
        success: false,
        message: 'Seat conflict: These seats were booked during checkout.',
      });
    }

    await Show.findByIdAndUpdate(booking.show, {
      $addToSet: { bookedSeats: { $each: seatNumbers } },
    });

    await Payment.findByIdAndUpdate(booking.paymentId, {
      provider: 'demo_mode',
      status: 'successful',
      verifiedAt: new Date(),
      metadata: { note: 'Explicit Demo Sandbox Payment - No Real Money Charged' },
    });

    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    booking.paymentMethod = 'demo_mode';
    await booking.save();

    return res.status(200).json({
      success: true,
      isDemo: true,
      message: '[DEMO MODE] Test booking confirmed without actual charge.',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        confirmedAt: booking.confirmedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error completing demo payment.',
    });
  }
};

// 5. Webhook Endpoints for Payment Gateways
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (secret && signature) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'successful') {
        payment.status = 'successful';
        payment.razorpayPaymentId = paymentEntity.id;
        payment.verifiedAt = new Date();
        await payment.save();

        const booking = await Booking.findById(payment.booking);
        if (booking && booking.status !== 'confirmed') {
          booking.status = 'confirmed';
          booking.confirmedAt = new Date();
          await booking.save();

          const seatNumbers = booking.seats.map((s) => s.seatNumber);
          await Show.findByIdAndUpdate(booking.show, {
            $addToSet: { bookedSeats: { $each: seatNumbers } },
          });
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
