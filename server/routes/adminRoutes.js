const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const adminOnly = require("../middleware/admin")   // FIX: was "adminOnly", file is "admin.js"

const User    = require("../models/User")
const Product = require("../models/Product")
const Order   = require("../models/Order")

// All admin routes require auth + admin role
router.use(auth, adminOnly)

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalProducts, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.find()
    ])
    const totalOrders  = orders.length
    const totalRevenue = orders
      .filter(o => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    res.json({ totalUsers, totalProducts, totalOrders, totalRevenue })
  } catch (err) {
    console.log("STATS ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// ─── ORDERS ────────────────────────────────────────────────────────────────
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name fullName email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    console.log("ORDERS ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/orders/:id", async (req, res) => {
  try {
    const { status, statusStep } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, statusStep },
      { new: true }
    ).populate("user", "name fullName email")

    if (!order) return res.status(404).json({ message: "Order not found" })
    res.json(order)
  } catch (err) {
    console.log("UPDATE ORDER ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// ─── USERS ─────────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    console.log("USERS ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password")

    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (err) {
    console.log("ROLE UPDATE ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/users/:id/orders", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    console.log("USER ORDERS ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router