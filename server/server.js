require("dotenv").config()   // ← MUST be first, before anything else

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use("/api/products", require("./routes/productRoutes"))
app.use("/api/auth",     require("./routes/authRoutes"))
app.use("/api/admin",    require("./routes/adminRoutes"))
app.use("/api/orders",   require("./routes/orders"))   // ← single orders route

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected")
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => console.log("DB connection failed", err))