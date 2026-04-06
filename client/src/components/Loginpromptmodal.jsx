import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Loginpromptmodal.css"

/**
 * LoginPromptModal
 * A warm, on-brand overlay that appears when a guest tries to
 * add to cart or order. Offers Sign In or Create Account.
 *
 * Props:
 *   isOpen   {boolean}
 *   onClose  {function}
 *   action   {"cart"|"order"}  — customises the copy
 */
export default function LoginPromptModal({ isOpen, onClose, action = "cart" }) {
  const navigate = useNavigate()

  // Trap body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    if (isOpen) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const copy = {
    cart: {
      icon: "🛍️",
      heading: "Sign in to add to cart",
      sub: "Your handcrafted picks are waiting — log in to save them to your bag.",
    },
    order: {
      icon: "✦",
      heading: "Sign in to place your order",
      sub: "Create an account or sign in to complete your purchase and track your order.",
    },
  }[action] ?? {
    icon: "✦",
    heading: "Sign in to continue",
    sub: "Please log in to proceed.",
  }

  return (
    <div className="lpm__backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="lpm__card"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button className="lpm__close" onClick={onClose} aria-label="Close">✕</button>

        {/* Icon */}
        <div className="lpm__icon">{copy.icon}</div>

        {/* Copy */}
        <h2 className="lpm__heading">{copy.heading}</h2>
        <p className="lpm__sub">{copy.sub}</p>

        {/* Divider with brand mark */}
        <div className="lpm__divider">
          <span>✦</span>
        </div>

        {/* Actions */}
        <div className="lpm__actions">
          <button
            className="lpm__btn lpm__btn--primary"
            onClick={() => { onClose(); navigate("/login", { state: { mode: "login" } }) }}
          >
            Sign In
          </button>
          <button
            className="lpm__btn lpm__btn--secondary"
            onClick={() => { onClose(); navigate("/login", { state: { mode: "signup" } }) }}
          >
            Create Account
          </button>
        </div>

        <p className="lpm__note">
          Free to join · No spam · Cancel anytime
        </p>
      </div>
    </div>
  )
}