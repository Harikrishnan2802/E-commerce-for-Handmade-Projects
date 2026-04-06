const Product = require("../models/Product")

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body)
    const saved = await newProduct.save()
    res.json(saved)
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}