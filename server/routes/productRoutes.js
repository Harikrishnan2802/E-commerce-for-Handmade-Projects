const express = require("express")
const router = express.Router()
const auth      = require("../middleware/auth")
const adminOnly = require("../middleware/admin")   // FIX: was "adminOnly", file is "admin.js"
const Product   = require("../models/Product")

// ─── PUBLIC ────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query
    const query = {}
    if (category) query.category = category
    if (search)   query.name = { $regex: search, $options: "i" }

    let sortOpt = { createdAt: -1 }
    if (sort === "price_asc")  sortOpt = { price: 1 }
    if (sort === "price_desc") sortOpt = { price: -1 }

    const products = await Product.find(query).sort(sortOpt)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: "Product not found" })
    res.json(product)
  } catch {
    res.status(500).json({ message: "Server error" })
  }
})

// ─── ADMIN ONLY ────────────────────────────────────────────────────────────
router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const { name, price, description, category, stock, image } = req.body
    if (!name || !price) return res.status(400).json({ message: "Name and price required" })

    const product = new Product({ name, price, description, category, stock: stock || 0, image })
    await product.save()
    res.json({ message: "Product created", product })
  } catch (err) {
    console.log("CREATE PRODUCT ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { name, price, description, category, stock, image } = req.body
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description, category, stock, image },
      { new: true, runValidators: true }
    )
    if (!product) return res.status(404).json({ message: "Product not found" })
    res.json({ message: "Product updated", product })
  } catch (err) {
    console.log("UPDATE PRODUCT ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: "Product not found" })
    res.json({ message: "Product deleted" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router