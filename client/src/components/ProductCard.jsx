import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/Authcontext"   // ← FIX: exact filename casing
import LoginPromptModal from "./Loginpromptmodal"   // ← FIX: exact filename casing
import "../styles/ProductCard.css"

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen]     = useState(false)
  const [modalAction, setModalAction] = useState("cart")
  const [added, setAdded]             = useState(false)

  // FIX: gate every action behind auth check
  const requireAuth = (action, fn) => {
    if (user) {
      fn()
    } else {
      setModalAction(action)
      setModalOpen(true)
    }
  }

  const handleAddToCart = () => {
    requireAuth("cart", () => {
      addToCart(product)
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    })
  }

  // FIX: Order Now also checks auth — no longer skips to cart for guests
  const handleOrderNow = (e) => {
    e.stopPropagation()   // prevent overlay click-through
    requireAuth("order", () => {
      addToCart(product)
      navigate("/cart")
    })
  }

  const price = product.price
    ? `₹${product.price.toLocaleString("en-IN")}`
    : "Price on request"

  const originalPrice = product.originalPrice
    ? `₹${product.originalPrice.toLocaleString("en-IN")}`
    : null

  return (
    <>
      <div className="product-card">
        {/* Image */}
        <div className="product-card__img-wrap">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-card__img"
              loading="lazy"
            />
          ) : (
            <div className="product-card__img-placeholder">✦</div>
          )}

          {product.badge && (
            <span className="product-card__badge">{product.badge}</span>
          )}

          {/* Order Now — hover overlay */}
          <div className="product-card__overlay">
            <button
              className="product-card__quick-order"
              onClick={handleOrderNow}
              type="button"
            >
              Order Now
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="product-card__body">
          {product.category && (
            <span className="product-card__category">{product.category}</span>
          )}

          <h3 className="product-card__name">{product.name}</h3>

          {product.description && (
            <p className="product-card__desc">{product.description}</p>
          )}

          <div className="product-card__footer">
            <div className="product-card__pricing">
              <span className="product-card__price">{price}</span>
              {originalPrice && (
                <span className="product-card__original">{originalPrice}</span>
              )}
            </div>

            <button
              type="button"
              className={`product-card__cart-btn ${added ? "product-card__cart-btn--added" : ""}`}
              onClick={handleAddToCart}
              aria-label={added ? "Added to cart" : "Add to cart"}
            >
              {added ? "✓ Added" : "+ Cart"}
            </button>
          </div>
        </div>
      </div>

      <LoginPromptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
      />
    </>
  )
}