import { useEffect, useState } from "react"

const API = "http://localhost:5000/api"
const token = () => localStorage.getItem("token")

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/stats`, { headers: { Authorization: "Bearer " + token() } }).then(r => r.json()).catch(() => null),
      fetch(`${API}/admin/orders`, { headers: { Authorization: "Bearer " + token() } }).then(r => r.json()).catch(() => [])
    ]).then(([s, orders]) => {
      setStats(s)
      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="adm-loading">Loading overview…</div>

  const statusColor = {
    Pending: "adm-badge--pending",
    Processing: "adm-badge--processing",
    Shipped: "adm-badge--shipped",
    Delivered: "adm-badge--delivered",
    Cancelled: "adm-badge--cancelled",
  }

  return (
    <div>
      <div className="adm-section-head">
        <div>
          <h2>Overview</h2>
          <p>Real-time snapshot of your store</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="adm-stat-grid">
        <div className="adm-stat-card adm-stat-card--accent">
          <p className="adm-stat-label">Total Revenue</p>
          <p className="adm-stat-value">₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}</p>
          <p className="adm-stat-sub">All time</p>
        </div>
        <div className="adm-stat-card adm-stat-card--green">
          <p className="adm-stat-label">Total Orders</p>
          <p className="adm-stat-value">{stats?.totalOrders ?? recentOrders.length}</p>
          <p className="adm-stat-sub">All time</p>
        </div>
        <div className="adm-stat-card adm-stat-card--blue">
          <p className="adm-stat-label">Total Users</p>
          <p className="adm-stat-value">{stats?.totalUsers ?? "—"}</p>
          <p className="adm-stat-sub">Registered</p>
        </div>
        <div className="adm-stat-card adm-stat-card--warn">
          <p className="adm-stat-label">Products</p>
          <p className="adm-stat-value">{stats?.totalProducts ?? "—"}</p>
          <p className="adm-stat-sub">Listed</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="adm-section-head" style={{ marginBottom: 14 }}>
        <div>
          <h2>Recent Orders</h2>
          <p>Last 5 orders placed</p>
        </div>
      </div>

      <div className="adm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={5}><div className="adm-empty">No orders yet</div></td></tr>
            ) : recentOrders.map(order => (
              <tr key={order._id}>
                <td>
                  <span style={{ fontFamily: "var(--adm-font-mono)", fontSize: 12, color: "var(--adm-text-muted)" }}>
                    #{order._id?.slice(-6).toUpperCase()}
                  </span>
                </td>
                <td>{order.user?.name || order.user?.email || "Guest"}</td>
                <td style={{ fontFamily: "var(--adm-font-mono)", fontWeight: 500 }}>
                  ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                </td>
                <td>
                  <span className={`adm-badge ${statusColor[order.status] || "adm-badge--pending"}`}>
                    {order.status || "Pending"}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}