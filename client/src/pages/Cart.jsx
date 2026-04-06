import { useCart } from "../context/CartContext"
import { Link } from "react-router-dom"
import { useState } from "react"
import "../styles/cart.css"

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateQty } = useCart()

  const [showModal,    setShowModal]   = useState(false)
  const [step,         setStep]        = useState(1)
  const [form,         setForm]        = useState({ name: "", phone: "", address: "", pincode: "" })
  const [errors,       setErrors]      = useState({})
  const [orderSuccess, setOrderSuccess] = useState(false)

  const totalItems   = cart.reduce((sum, item) => sum + (item.qty || 1), 0)
  const subtotal     = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0)
  const packingCost  = 20
  const shippingCost = subtotal > 999 ? 0 : 50
  const finalTotal   = subtotal + packingCost + shippingCost

  /* ── Validation ── */
  const validate = () => {
    const e = {}
    if (!form.name.trim())                 e.name    = "Name is required"
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone   = "Enter a valid 10-digit mobile number"
    if (!form.address.trim())              e.address = "Address is required"
    if (!/^\d{6}$/.test(form.pincode))    e.pincode = "Enter a valid 6-digit pincode"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleProceed = () => {
    if (validate()) setStep(2)
  }

  /* ── Razorpay Payment ── */
  const handlePayment = async () => {
    const token = localStorage.getItem("token")
    if (!token) { alert("Please login first"); return }

    const items = cart.map(item => ({
      name:  item.name,
      qty:   item.qty || 1,
      price: Number(item.price) || 0,
    }))

    try {
      // 1. Create order on backend
      const res = await fetch("/api/orders/create-razorpay", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  "Bearer " + token,
        },
        body: JSON.stringify({
          items,
          total:   finalTotal,
          address: `${form.address}, ${form.pincode}`,
        }),
      })

      const { razorpayOrderId, orderId, amount, currency } = await res.json()

      // 2. Open Razorpay checkout
      const options = {
        key:         process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount,
        currency,
        name:        "Your Jewellery Store",
        description: "Handcrafted Jewellery Order",
        order_id:    razorpayOrderId,

        // 3. On successful payment
        handler: async (response) => {
          const verifyRes = await fetch("/api/orders/verify", {
            method:  "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:  "Bearer " + token,
            },
            body: JSON.stringify({ ...response, orderId }),
          })

          const data = await verifyRes.json()

          if (data.success) {
            clearCart()
            setShowModal(false)
            setStep(1)
            setForm({ name: "", phone: "", address: "", pincode: "" })
            setOrderSuccess(true)
          } else {
            alert("Payment verification failed. Please contact support.")
          }
        },

        prefill: { name: form.name, contact: form.phone },
        theme:   { color: "#c9a84c" },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", () => alert("Payment failed. Please try again."))
      rzp.open()

    } catch (err) {
      console.error(err)
      alert("Could not initiate payment. Try again.")
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setStep(1)
    setErrors({})
  }

  return (
    <div className="cart-page">

      {/* ── Order Success Overlay ── */}
      {orderSuccess && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ textAlign: "center", padding: "2.5rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ marginBottom: "0.5rem" }}>Order Confirmed!</h2>
            <p style={{ color: "var(--muted, #888)", marginBottom: "1.5rem" }}>
              Your payment was received. We'll ship your jewellery within 2–4 working days.
            </p>
            <Link
              to="/orders"
              className="checkout-cta"
              onClick={() => setOrderSuccess(false)}
            >
              Track Your Order →
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div className="cart-hero">
        <div className="hero-eyebrow">✦ Artisan Jewellery</div>
        <h1 className="hero-title">Your <em>Jewellery</em> Box</h1>
        {cart.length > 0 && (
          <div className="hero-count">{totalItems} piece{totalItems !== 1 ? "s" : ""} curated for you</div>
        )}
      </div>

      {/* ── Trust Strip ── */}
      <div className="trust-strip">
        <div className="trust-inner">
          <div className="trust-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure Checkout
          </div>
          <div className="trust-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            Ships within 2–4 days
          </div>
          <div className="trust-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            100% Handcrafted with Love
          </div>
          <div className="trust-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Easy Returns &amp; Exchange
          </div>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="cart-body">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">✦</div>
            <h3 className="empty-title">Your jewellery box is empty</h3>
            <p className="empty-text">Discover our handcrafted pieces and find something you'll treasure forever.</p>
            <Link to="/shop" className="btn-shop">Explore the Collection →</Link>
          </div>
        ) : (
          <div className="cart-layout">

            {/* ── Left: Items + Advantages ── */}
            <div>
              <div className="section-heading">
                <h2>Your Selection</h2>
                <span className="item-count-badge">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
              </div>

              <div className="cart-items">
                {cart.map(item => {
                  const qty   = item.qty || 1
                  const price = Number(item.price) || 0
                  return (
                    <div className="cart-item" key={item._id}>
                      <div className="item-img-wrap">
                        <img src={item.image} alt={item.name} />
                        <span className="handmade-tag">Handmade</span>
                      </div>
                      <div className="item-info">
                        <p className="item-category">{item.category}</p>
                        <h3 className="item-name">{item.name}</h3>
                        <div className="item-price-row">
                          <span className="unit-price">₹{price} × {qty}</span>
                          <span className="line-total">₹{price * qty}</span>
                        </div>
                        <div className="item-badge">
                          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          In Stock · Ready to ship
                        </div>
                      </div>
                      <div className="item-controls">
                        <div className="qty-ctrl">
                          <button onClick={() => updateQty(item._id, -1)} aria-label="Decrease">−</button>
                          <span>{qty}</span>
                          <button onClick={() => updateQty(item._id, 1)} aria-label="Increase">+</button>
                        </div>
                        <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Advantages ── */}
              <div className="advantages-row">
                <div className="advantage-card">
                  <div className="advantage-icon">🌿</div>
                  <div className="advantage-title">Eco-Conscious</div>
                  <div className="advantage-desc">Sustainably sourced materials, packaged in recycled boxes</div>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">✋</div>
                  <div className="advantage-title">Truly Handmade</div>
                  <div className="advantage-desc">Every piece made by skilled artisans — no mass production</div>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🎁</div>
                  <div className="advantage-title">Gift Ready</div>
                  <div className="advantage-desc">Arrives in a beautiful gift box with a personal message option</div>
                </div>
              </div>
            </div>

            {/* ── Right: Summary Sidebar ── */}
            <div className="cart-summary">
              <div className="summary-card">
                <div className="summary-title">Order Summary</div>

                <div className="savings-chip">
                  ✦ &nbsp;Authentic handmade jewellery at direct-from-artisan prices
                </div>

                <div className="summary-line">
                  <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-line">
                  <span>Packing</span>
                  <span>₹{packingCost}</span>
                </div>
                <div className="summary-line">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "shipping-note" : ""}>
                    {shippingCost === 0 ? "Free 🎉" : `₹${shippingCost}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <div className="free-shipping-hint">
                    Add ₹{999 - subtotal} more for free shipping
                  </div>
                )}
                <div className="summary-line total">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>

                <button className="checkout-cta" onClick={() => setShowModal(true)}>
                  Proceed to Checkout
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                <button className="clear-btn" onClick={clearCart}>
                  🗑 Clear all items
                </button>
              </div>

              {/* How it Works */}
              <div className="process-card">
                <div className="process-title">How ordering works</div>
                <div className="process-steps">
                  {[
                    { title: "Fill your address",  desc: "Enter your delivery details in the checkout form." },
                    { title: "Pay via Razorpay",   desc: "Secure UPI / card / netbanking payment in one tap." },
                    { title: "Auto Confirmed",     desc: "Your order is saved instantly after payment." },
                    { title: "Delivered to You",   desc: "Ships via tracked courier within 2–4 working days." },
                  ].map((s, i) => (
                    <div className="process-step" key={i}>
                      <div className="step-line">
                        <div className="step-dot">{i + 1}</div>
                        <div className="step-connector" />
                      </div>
                      <div className="step-text">
                        <h4>{s.title}</h4>
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artisan Promise */}
              <div className="guarantee-card">
                <div className="guarantee-icon">🌟</div>
                <div className="guarantee-title">Our Artisan Promise</div>
                <div className="guarantee-text">
                  Every piece is crafted with care and leaves our workshop only when it meets our quality standard.
                  Not happy? We'll make it right — exchange or full refund within 7 days.
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          CHECKOUT MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-steps">
                <div className={`modal-step-dot ${step >= 1 ? "active" : ""}`}>1</div>
                <div className={`modal-step-line ${step >= 2 ? "active" : ""}`} />
                <div className={`modal-step-dot ${step >= 2 ? "active" : ""}`}>2</div>
              </div>
              <div className="modal-step-labels">
                <span className={step === 1 ? "active-label" : ""}>Delivery Details</span>
                <span className={step === 2 ? "active-label" : ""}>Pay &amp; Confirm</span>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {/* ── STEP 1: Address Form ── */}
            {step === 1 && (
              <div className="modal-body">
                <h3 className="modal-title">Where should we deliver?</h3>
                <p className="modal-sub">Fill in your details before proceeding to payment.</p>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={errors.name ? "input-error" : ""}
                  />
                  {errors.name && <span className="err-msg">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={errors.phone ? "input-error" : ""}
                  />
                  {errors.phone && <span className="err-msg">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Full Address</label>
                  <textarea
                    rows={3}
                    placeholder="House No., Street, Area, City, State"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className={errors.address ? "input-error" : ""}
                  />
                  {errors.address && <span className="err-msg">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    maxLength={6}
                    value={form.pincode}
                    onChange={e => setForm({ ...form, pincode: e.target.value })}
                    className={errors.pincode ? "input-error" : ""}
                  />
                  {errors.pincode && <span className="err-msg">{errors.pincode}</span>}
                </div>

                <button className="modal-primary-btn" onClick={handleProceed}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* ── STEP 2: Pay via Razorpay ── */}
            {step === 2 && (
              <div className="modal-body">
                <h3 className="modal-title">Review &amp; Pay</h3>
                <p className="modal-sub">
                  You'll be charged <strong>₹{finalTotal}</strong> via Razorpay (UPI / Card / Netbanking).
                </p>

                {/* Order breakdown */}
                <div className="delivery-summary" style={{ marginBottom: "1rem" }}>
                  <div className="summary-line"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="summary-line"><span>Packing</span><span>₹{packingCost}</span></div>
                  <div className="summary-line">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free 🎉" : `₹${shippingCost}`}</span>
                  </div>
                  <div className="summary-line total"><span>Total</span><span>₹{finalTotal}</span></div>
                </div>

                {/* Delivery address */}
                <div className="delivery-summary">
                  <div className="ds-title">Delivering to</div>
                  <div className="ds-name">{form.name} · {form.phone}</div>
                  <div className="ds-addr">{form.address}, {form.pincode}</div>
                  <button className="ds-edit" onClick={() => setStep(1)}>Edit</button>
                </div>

                <div className="payment-note">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                  </svg>
                  Clicking below opens a secure Razorpay payment window. Your order is confirmed automatically after payment.
                </div>

                <button className="checkout-cta" onClick={handlePayment}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Pay ₹{finalTotal} Securely
                </button>

                <button className="modal-back-btn" onClick={() => setStep(1)}>
                  ← Back
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}