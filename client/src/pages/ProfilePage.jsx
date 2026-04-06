import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/Authcontext"
import "../styles/ProfilePage.css"

const STATUS_STEPS = ["Order Placed", "Confirmed", "Packed", "In Transit", "Delivered"]

const STATUS_COLOR = {
  "Delivered":  { bg: "#e8f5e9", text: "#2e7d32", dot: "#43a047" },
  "In Transit": { bg: "#fff8e1", text: "#f57f17", dot: "#fbc02d" },
  "Processing": { bg: "#e3f2fd", text: "#1565c0", dot: "#1e88e5" },
  "Cancelled":  { bg: "#fce4ec", text: "#b71c1c", dot: "#e53935" },
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const color = STATUS_COLOR[order.status] || STATUS_COLOR["Processing"]

  return (
    <div className={`profile__order-card ${open ? "profile__order-card--open" : ""}`}>
      <button className="profile__order-header" onClick={() => setOpen(o => !o)}>
        <div className="profile__order-meta">
          <span className="profile__order-id">{order.id}</span>
          <span className="profile__order-date">{order.date}</span>
        </div>
        <div className="profile__order-right">
          <span
            className="profile__order-status"
            style={{ background: color.bg, color: color.text }}
          >
            <span className="profile__order-status-dot" style={{ background: color.dot }} />
            {order.status}
          </span>
          <span className="profile__order-total">₹{order.total.toLocaleString()}</span>
          <span className={`profile__order-chevron ${open ? "profile__order-chevron--open" : ""}`}>›</span>
        </div>
      </button>

      {open && (
        <div className="profile__order-body">
          {/* Progress tracker */}
          <div className="profile__tracker">
            <div className="profile__tracker-label">Order Progress</div>
            <div className="profile__tracker-steps">
              {STATUS_STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`profile__tracker-step ${i < order.statusStep ? "profile__tracker-step--done" : ""} ${i === order.statusStep - 1 ? "profile__tracker-step--current" : ""}`}
                >
                  <div className="profile__tracker-dot">
                    {i < order.statusStep ? "✓" : i + 1}
                  </div>
                  <span>{step}</span>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`profile__tracker-line ${i < order.statusStep - 1 ? "profile__tracker-line--done" : ""}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="profile__order-items">
            <div className="profile__order-section-title">Items Ordered</div>
            {order.items.map((item, i) => (
              <div key={i} className="profile__order-item">
                <div className="profile__order-item-icon">✦</div>
                <div className="profile__order-item-info">
                  <span className="profile__order-item-name">{item.name}</span>
                  <span className="profile__order-item-qty">Qty: {item.qty}</span>
                </div>
                <span className="profile__order-item-price">₹{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Delivery info */}
          <div className="profile__order-delivery">
            <div className="profile__order-delivery-row">
              <span>📍 Delivery Address</span>
              <span>{order.address}</span>
            </div>
            <div className="profile__order-delivery-row">
              <span>🔖 Tracking ID</span>
              <span className="profile__order-tracking">{order.tracking}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("orders")
const [orders, setOrders] = useState([])

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      })

      const data = await res.json()
      setOrders(data)

    } catch (err) {
      console.log("Error fetching orders", err)
    }
  }

  if (user) {
    fetchOrders()
  }
}, [user])

  if (!user) {
    return (
      <div className="profile-page profile-page--empty">
        <p>You need to <Link to="/login">sign in</Link> first.</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="profile-page">
      <div className="profile-page__bg" />

      <div className="profile-page__inner">
        {/* Header */}
        <div className="profile__header">
          <div className="profile__avatar">{user.avatar}</div>
          <div className="profile__info">
            <h1 className="profile__name">{user.name}</h1>
            <p className="profile__email">{user.email}</p>
            <p className="profile__since">Member since {user.joinedDate}</p>
          </div>
          <button className="profile__logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="profile__stats">
          <div className="profile__stat">
            <span className="profile__stat-num">{orders.length}</span>
            <span className="profile__stat-label">Total Orders</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-num">
              {orders.filter(o => o.status === "Delivered").length}
            </span>
            <span className="profile__stat-label">Delivered</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-num">
              ₹{orders.reduce((s, o) => s + o.total, 0).toLocaleString()}
            </span>
            <span className="profile__stat-label">Total Spent</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile__tabs">
          {["orders", "details"].map(tab => (
            <button
              key={tab}
              className={`profile__tab ${activeTab === tab ? "profile__tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "orders" ? "My Orders" : "Account Details"}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="profile__orders">
            {orders.length === 0 ? (
              <div className="profile__empty">
                <span>🛍️</span>
                <p>No orders yet. <Link to="/shop">Start shopping!</Link></p>
              </div>
            ) : (
              orders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="profile__details">
            <div className="profile__detail-card">
              <h3>Personal Information</h3>
              <div className="profile__detail-row">
                <label>Full Name</label>
                <span>{user.name}</span>
              </div>
              <div className="profile__detail-row">
                <label>Email Address</label>
                <span>{user.email}</span>
              </div>
              <div className="profile__detail-row">
                <label>Default Address</label>
                <span>{user.address || "Not set"}</span>
              </div>
              <button className="profile__edit-btn">Edit Profile</button>
            </div>

            <div className="profile__detail-card">
              <h3>Preferences</h3>
              <div className="profile__detail-row">
                <label>Email Notifications</label>
                <span className="profile__toggle profile__toggle--on">On</span>
              </div>
              <div className="profile__detail-row">
                <label>Order Updates via SMS</label>
                <span className="profile__toggle">Off</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}