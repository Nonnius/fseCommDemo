import express from 'express';
import {
   placeOrder,
   allOrders,
   userOrders,
   updateStatus,
   placeOrderStripe,
   placeOrderRazorpay,
   verifyStripe,
   verifyRazorpay } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';



const orderRouter = express.Router();

// Admin Features
orderRouter.post('/list',adminAuth, allOrders);
orderRouter.post('/status',adminAuth, updateStatus);

//Payment Features
orderRouter.post('/place',authUser, placeOrder);
orderRouter.post('/stripe',authUser, placeOrderStripe);
orderRouter.post('/razorpay',authUser, placeOrderRazorpay);

// User Features
orderRouter.post('/userorders',authUser, userOrders);

// Payment Verification
// Stripe redirects back to the client with the session id; we retrieve the session
// server-side and use the metadata saved when creating the session to create the order.
// This endpoint does not require the auth middleware because the session metadata
// was set server-side during session creation and is a trusted source.
orderRouter.post('/verifyStripe', verifyStripe);
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay);

export default orderRouter;