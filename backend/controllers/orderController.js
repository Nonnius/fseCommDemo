import orderModel from "../models/orderModel.js";
import userModel from '../models/userModel.js'
import Stripe from 'stripe';
import razorpay from 'razorpay';




// Global Variables
const currency = 'usd'
const shippingCharge = 10;

// Gateway Initialization (lazy)
let _stripe = null;
const getStripe = () => {
    if (_stripe) return _stripe;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        // Don't throw at import time; let handlers return a controlled error.
        // If running in development and you want to use Stripe test mode without
        // setting an env var, you may set STRIPE_SECRET_KEY in a local `.env` file.
        return null;
    }
    _stripe = new Stripe(key);
    return _stripe;
}

const razorpayInstance = new razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET,
})

// Placing orders using COD method
const placeOrder = async (req, res) => {
    try {
    // support either userId or legacy `user` field
    const { items, amount, address } = req.body;
    const userId = req.body.userId || req.body.user;
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now(),
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, {cartData: {}}) //clear cart after order placed
        res.json({success: true, message: "Order Placed Successfully"})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Placing orders using Stripe method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body
        const { origin } = req.headers;
        // Do not pre-save the order before Stripe payment completes.
        // The order will be created in `verifyStripe` after Stripe confirms payment.
        // We still prepare the order payload in metadata so `verifyStripe` can create it.

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Shipping Charges',
                },
                unit_amount: shippingCharge * 100,
            },
            quantity: 1,
        })

        let stripeInstance = getStripe();
        if (!stripeInstance) {
            // Helpful debugging guidance for the client and server logs
            console.error('Missing STRIPE_SECRET_KEY. Set it in backend/.env or environment variables.');
            return res.status(500).json({
                success: false,
                message: 'Stripe is not configured on the server (missing STRIPE_SECRET_KEY). Set the environment variable STRIPE_SECRET_KEY. See backend/.env.example or README.'
            })
        }

        const session = await stripeInstance.checkout.sessions.create({
            // success_url will redirect client to a verification page which should call
            // our `verifyStripe` endpoint. We do NOT include a pre-saved orderId here because
            // the order is not created until Stripe confirms payment.
            // Include the checkout session id so the client can forward it to the server
            // for verification: Stripe replaces {CHECKOUT_SESSION_ID} with the session id.
            success_url: `${origin}/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart`,
            line_items,
            mode: 'payment',
            metadata: {
                userId,
                amount,
                address: JSON.stringify(address),
                items: JSON.stringify(items),
            },

        })
    // return success with the session url for the client to redirect to
    res.json({ success: true, session_url: session.url })

    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
}

// Stripe Payment Verification & Order Confirmation
const verifyStripe = async (req, res) => {
    try {
        // Expecting either: { success, session_id } from client or legacy { success, orderId }
        const { success, session_id } = req.body;

        if (success !== 'true') {
            return res.json({ success: true, message: 'Payment failed' });
        }

        // Ensure Stripe is configured
        const stripeInstance = getStripe();
        if (!stripeInstance) {
            console.error('Missing STRIPE_SECRET_KEY when verifying payment');
            return res.status(500).json({ success: false, message: 'Stripe is not configured on the server.' });
        }

        if (!session_id) {
            return res.status(400).json({ success: false, message: 'Missing session_id for Stripe verification' });
        }

        // Retrieve the checkout session to get metadata and payment status
        const session = await stripeInstance.checkout.sessions.retrieve(session_id, { expand: ['payment_intent'] });

        if (!session || session.payment_status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Stripe session not paid' });
        }

        // Extract metadata (we stored JSON strings for address/items)
        const metadata = session.metadata || {};
        const userId = metadata.userId || metadata.user;
        const amount = metadata.amount ? Number(metadata.amount) : (session.amount_total ? session.amount_total / 100 : undefined);
        let address = {};
        try { address = metadata.address ? JSON.parse(metadata.address) : {}; } catch (e) { address = {} }
        let items = [];
        try { items = metadata.items ? JSON.parse(metadata.items) : []; } catch (e) { items = [] }

        // Create the order with all required schema fields
        const newOrder = await orderModel.create({
            userId,
            items,
            amount,
            address,
            status: 'Order Placed',
            paymentMethod: 'Stripe',
            payment: true,
            date: Date.now(),
        });

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: 'Payment successful & Order placed', orderId: newOrder._id });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Placing orders using Razopayr method
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body
        const {origin} = req.headers

        const orderData = {
            userId,
            items,
            amount,                                                                                                                                                                     
            address,
            paymentMethod: 'Razorpay',
            payment: false,
            date: Date.now(),
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: amount * 100,  // amount in the smallest currency unit
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(),
        }

        // Use promise-based API for clarity. If this throws it will be caught by the outer catch.
        const razorpayOrder = await razorpayInstance.orders.create(options);
        res.json({ success: true, orderId: newOrder._id, razorpayOrder })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Razorpay Payment Verification & Order Confirmation
const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, {payment: true})
            await userModel.findByIdAndUpdate(userId, {cartData: {}}) //clear cart after order placed
            res.json({success: true, message: 'Payment successful & Order placed'})
        } else {
            res.json({success: false, message: 'Payment failed'})
        }   
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
    

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        // For the admin panel we want to show all orders including COD (which may
        // have payment: false until delivered/collected). Return all orders and
        // sort newest-first by `date`.
        const orders = await orderModel.find({}).sort({ date: -1 })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// User Orders data for Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        // Only return orders that have completed payment to avoid showing
        // pre-created/unpaid orders on the user's orders page.
        const orders = await orderModel.find({ userId, payment: true })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update Order Status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const {orderId, status} = req.body
        await orderModel.findByIdAndUpdate(orderId, {status})
        res.json({success: true, message: 'Order status updated successfully'})
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
}

export { verifyRazorpay, verifyStripe, placeOrder, allOrders, userOrders, updateStatus, placeOrderStripe, placeOrderRazorpay };