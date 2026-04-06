import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/Authcontext"
import { CartProvider } from "./context/CartContext"   // ✅ ADD THIS

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
  <CartProvider>   
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </CartProvider>
  </AuthProvider>
)