import { useEffect, useState } from "react"

const API = "http://localhost:5000/api"
const token = () => localStorage.getItem("token")

const STEPS = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"]
const STATUSES = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"]

function Toast({ toasts }) {
  return (
    <div className="adm-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`adm-toast adm-toast--${t.type}`}>
          {t.type === "success" ? "✓" : "✕"} {t.msg}
        </div>
      ))}
    </div>
  )
}

const statusColor = {
  Pending:           "adm-badge--pending",
  Processing:        "adm-badge--processing",
  Shipped:           "adm-badge--shipped",
  "Out for Delivery":"adm-badge--processing",
  Delivered:         "adm-badge--delivered",
  Cancelled:         "adm-badge--cancelled",
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [toasts, setToasts] = useState([])
  const [updating, setUpdating] = useState(null)

  const toast = (msg, type = "success") => {
    const id = Date.now()
    setToasts(ts => [...ts, { id, msg, type }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000)
  }

  const load = () => {
    setLoading(true)
    fetch(`${API}/admin/orders`, { headers: { Authorization: "Bearer " + token() } })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status, step) => {
    setUpdating(id)
    try {
      const res = await fetch(`${API}/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() },
        body: JSON.stringify({ status, statusStep: step })
      })
      if (!res.ok) throw new Error()
      toast(`Order updated to "${status}"`)
      load()
    } catch {
      toast("Update failed", "error")
    }
    setUpdating(null)
  }

  const filtered = orders.filter(o => {
    const matchSearch =
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "All" || o.status === filter
    return matchSearch && matchFilter
  })

  const stepIndex = (status) => {
    const map = { "Pending": 0, "Processing": 1, "Shipped": 2, "Out for Delivery": 3, "Delivered": 4, "Cancelled": -1 }
    return map[status] ?? 0
  }

  return (
    <div>
      <div className="adm-section-head">
        <div>
          <h2>Orders</h2>
          <p>{orders.length} total orders</p>
        </div>
      </div>

      <div className="adm-search" style={{ marginBottom: 20 }}>
        <input
          className="adm-search__input"
          placeholder="Search by order ID or customer…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="adm-select" style={{ width: "auto" }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="adm-loading">Loading orders…</div> : (
        <div className="adm-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="adm-empty">No orders found</div></td></tr>
              ) : filtered.map(order => (
                <>
                  <tr key={order._id} style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                    <td>
                      <span style={{ fontFamily: "var(--adm-font-mono)", fontSize: 12, color: "var(--adm-text-muted)" }}>
                        #{order._id?.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.user?.name || "Guest"}</div>
                      <div style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>{order.user?.email}</div>
                    </td>
                    <td style={{ fontFamily: "var(--adm-font-mono)", fontWeight: 500 }}>
                      ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontFamily: "var(--adm-font-mono)", fontSize: 13 }}>
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </td>
                    <td>
                      <span className={`adm-badge ${statusColor[order.status] || "adm-badge--pending"}`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <select
                          className="adm-select"
                          style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}
                          value={order.status || "Pending"}
                          disabled={updating === order._id}
                          onChange={e => {
                            const s = e.target.value
                            const step = STEPS.indexOf(s)
                            updateStatus(order._id, s, step === -1 ? 0 : step)
                          }}
                        >
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded order detail */}
                  {expanded === order._id && (
                    <tr key={order._id + "-detail"}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <div className="adm-order-detail">
                          {/* Tracking steps */}
                          {order.status !== "Cancelled" && (
                            <>
                              <p style={{ fontSize: 11, fontFamily: "var(--adm-font-mono)", letterSpacing: "0.06em", color: "var(--adm-text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Tracking Progress</p>
                              <div className="adm-track-steps">
                                {STEPS.map((step, i) => {
                                  const current = stepIndex(order.status)
                                  const isDone   = i < current
                                  const isActive = i === current
                                  return (
                                    <div key={step} className={`adm-track-step ${isDone ? "adm-track-step--done" : ""} ${isActive ? "adm-track-step--active" : ""}`}>
                                      <div className="adm-track-dot">{isDone ? "✓" : i + 1}</div>
                                      <span className="adm-track-label">{step}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </>
                          )}

                          {/* Shipping address */}
                          {order.shippingAddress && (
                            <div style={{ marginTop: 16, marginBottom: 12 }}>
                              <p style={{ fontSize: 11, fontFamily: "var(--adm-font-mono)", letterSpacing: "0.06em", color: "var(--adm-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Shipping Address</p>
                              <p style={{ fontSize: 13 }}>
                                {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(", ")}
                              </p>
                            </div>
                          )}

                          {/* Order items */}
                          <p style={{ fontSize: 11, fontFamily: "var(--adm-font-mono)", letterSpacing: "0.06em", color: "var(--adm-text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Items</p>
                          <div className="adm-order-items">
                            <table>
                              <thead>
                                <tr>
                                  <td style={{ color: "var(--adm-text-muted)", paddingBottom: 8 }}>Product</td>
                                  <td style={{ color: "var(--adm-text-muted)", paddingBottom: 8 }}>Qty</td>
                                  <td style={{ color: "var(--adm-text-muted)", paddingBottom: 8, textAlign: "right" }}>Price</td>
                                </tr>
                              </thead>
                              <tbody>
                                {(order.items || []).map((item, idx) => (
                                  <tr key={idx}>
                                    <td>{item.product?.name || item.name || "Product"}</td>
                                    <td style={{ fontFamily: "var(--adm-font-mono)" }}>× {item.quantity || 1}</td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--adm-font-mono)" }}>
                                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                                    </td>
                                  </tr>
                                ))}
                                <tr style={{ borderTop: "1px solid var(--adm-border)" }}>
                                  <td colSpan={2} style={{ paddingTop: 8, fontWeight: 500 }}>Total</td>
                                  <td style={{ textAlign: "right", fontFamily: "var(--adm-font-mono)", fontWeight: 500, paddingTop: 8 }}>
                                    ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Toast toasts={toasts} />
    </div>
  )
}