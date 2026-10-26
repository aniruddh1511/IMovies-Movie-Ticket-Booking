import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  verifyPhonePePayment,
  processDemoPayment,
  handleRazorpayWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Webhook endpoint (must accept raw/json without user auth header)
router.post('/razorpay/webhook', handleRazorpayWebhook);

// Protected payment endpoints
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/phonepe/verify-utr', protect, verifyPhonePePayment);
router.post('/demo-mode/process', protect, processDemoPayment);

export default router;
