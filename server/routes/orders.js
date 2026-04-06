const express  = require("express")
const router   = express.Router()
const Razorpay = require("razorpay")
const crypto   = require("crypto")        // built-in Node module, no install needed
const Order    = require("../models/Order")
const auth     = require("../middleware/auth")

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ── Route 1: Create Razorpay order ──────────────────────────
router.post("/create-razorpay", auth, async (req, res) => {
  const { items, total, address } = req.body

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount:   total * 100,          // Razorpay works in paise
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    })

    // Save a pending order to DB immediately
    const order = await Order.create({
      user:            req.user.id,
      items,
      total,
      address,
      razorpayOrderId: razorpayOrder.id,
      status:          "pending",
    })

    res.json({
      razorpayOrderId: razorpayOrder.id,
      orderId:         order._id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Route 2: Verify payment after Razorpay callback ─────────
router.post("/verify", auth, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body

  // Generate expected signature using HMAC-SHA256
  const generated = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex")

  // If signatures don't match → payment is fake/tampered
  if (generated !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" })
  }

  // Signatures match → mark order as paid
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status:            "paid",
      razorpayPaymentId: razorpay_payment_id,
    },
    { new: true }
  )

  res.json({ success: true, order })
})

module.exports = router