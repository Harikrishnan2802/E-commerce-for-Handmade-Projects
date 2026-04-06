const router = require("express").Router()
const Order = require("../models/Order")
const auth = require("../middleware/auth")

// ✅ GET USER ORDERS
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ✅ CREATE ORDER
router.post("/", auth, async (req, res) => {
  try {
    const { items, total, address } = req.body

    const order = new Order({
      user: req.user.id,
      items,
      total,
      address,
      tracking: "TRK" + Date.now()
    })

    await order.save()

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router