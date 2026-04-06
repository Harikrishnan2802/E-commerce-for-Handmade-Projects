const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      name:  String,
      qty:   Number,
      price: Number
    }
  ],
  total:   Number,
  address: String,

  // Payment
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },

  // Status
  status: {
    type:    String,
    enum:    ["pending", "paid", "failed", "Processing", "Shipped", "Delivered"],
    default: "pending"
  },
  statusStep: {
    type:    Number,
    default: 1
  },
  tracking: String,

}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema)