import { useEffect, useState } from "react"

const API = "http://localhost:5000/api"
const token = () => localStorage.getItem("token")

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

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [toasts, setToasts] = useState([])
  const [updating, setUpdating] = useState(null)
  const [selected, setSelected] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const toast = (msg, type = "success") => {
    const id = Date.now()
    setToasts(ts => [...ts, { id, msg, type }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000)
  }

  const load = () => {
    setLoading(true)
    fetch(`${API}/admin/users`, { headers: { Authorization: "Bearer " + token() } })
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin"
    setUpdating(user._id)
    try {
      const res = await fetch(`${API}/admin/users/${user._id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() },
        body: JSON.stringify({ role: newRole })
      })
      if (!res.ok) throw new Error()
      toast(`${user.fullName || user.email} is now ${newRole}`)
      load()
    } catch {
      toast("Role update failed", "error")
    }
    setUpdating(null)
  }

  const viewUser = async (user) => {
    setSelected(user)
    setOrdersLoading(true)
    try {
      const res = await fetch(`${API}/admin/users/${user._id}/orders`, {
        headers: { Authorization: "Bearer " + token() }
      })
      const data = await res.json()
      setUserOrders(Array.isArray(data) ? data : [])
    } catch {
      setUserOrders([])
    }
    setOrdersLoading(false)
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (name, email) => {
    if (name) return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    return email?.[0]?.toUpperCase() || "U"
  }

  return (
    <div>
      <div className="adm-section-head">
        <div>
          <h2>Users</h2>
          <p>{users.length} registered users</p>
        </div>
      </div>

      <div className="adm-search" style={{ marginBottom: 20 }}>
        <input
          className="adm-search__input"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <div className="adm-loading">Loading users…</div> : (
        <div className="adm-table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 48 }}></th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="adm-empty">No users found</div></td></tr>
              ) : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: u.role === "admin" ? "var(--adm-accent)" : "#e2ddd6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 600,
                      color: u.role === "admin" ? "#fff" : "var(--adm-text-muted)"
                    }}>
                      {initials(u.fullName, u.email)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{u.fullName || "—"}</div>
                  </td>
                  <td style={{ fontFamily: "var(--adm-font-mono)", fontSize: 13, color: "var(--adm-text-muted)" }}>
                    {u.email}
                  </td>
                  <td>
                    <span className={`adm-badge ${u.role === "admin" ? "adm-badge--admin" : "adm-badge--user"}`}>
                      {u.role || "user"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="adm-btn adm-btn--sm" onClick={() => viewUser(u)}>
                        View Orders
                      </button>
                      <button
                        className="adm-btn adm-btn--sm"
                        style={u.role === "admin" ? { borderColor: "var(--adm-warning)", color: "var(--adm-warning)" } : {}}
                        onClick={() => toggleRole(u)}
                        disabled={updating === u._id}
                      >
                        {updating === u._id ? "…" : u.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User orders modal */}
      {selected && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="adm-modal" style={{ maxWidth: 600 }}>
            <div className="adm-modal__head">
              <div>
                <h3 className="adm-modal__title">{selected.fullName || "User"}</h3>
                <p style={{ fontSize: 12, color: "var(--adm-text-muted)", marginTop: 2, fontFamily: "var(--adm-font-mono)" }}>{selected.email}</p>
              </div>
              <button className="adm-modal__close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div style={{ background: "var(--adm-bg)", borderRadius: "var(--adm-radius)", padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "var(--adm-text-muted)", fontFamily: "var(--adm-font-mono)", letterSpacing: "0.04em" }}>ORDERS</p>
                <p style={{ fontSize: 22, fontFamily: "var(--adm-font-display)", fontWeight: 600 }}>{userOrders.length}</p>
              </div>
              <div style={{ background: "var(--adm-bg)", borderRadius: "var(--adm-radius)", padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "var(--adm-text-muted)", fontFamily: "var(--adm-font-mono)", letterSpacing: "0.04em" }}>SPENT</p>
                <p style={{ fontSize: 22, fontFamily: "var(--adm-font-display)", fontWeight: 600 }}>
                  ₹{userOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div style={{ background: "var(--adm-bg)", borderRadius: "var(--adm-radius)", padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "var(--adm-text-muted)", fontFamily: "var(--adm-font-mono)", letterSpacing: "0.04em" }}>ROLE</p>
                <p style={{ fontSize: 22, fontFamily: "var(--adm-font-display)", fontWeight: 600 }}>{selected.role || "user"}</p>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-muted)", marginBottom: 10, fontFamily: "var(--adm-font-mono)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Order History</p>
              {ordersLoading ? (
                <div className="adm-loading" style={{ padding: 24 }}>Loading…</div>
              ) : userOrders.length === 0 ? (
                <div className="adm-empty" style={{ padding: 24 }}>No orders placed yet</div>
              ) : (
                <div className="adm-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map(o => (
                        <tr key={o._id}>
                          <td><span style={{ fontFamily: "var(--adm-font-mono)", fontSize: 12, color: "var(--adm-text-muted)" }}>#{o._id?.slice(-6).toUpperCase()}</span></td>
                          <td style={{ fontFamily: "var(--adm-font-mono)", fontWeight: 500 }}>₹{(o.totalAmount || 0).toLocaleString("en-IN")}</td>
                          <td><span className={`adm-badge ${
                            { Pending: "adm-badge--pending", Processing: "adm-badge--processing", Shipped: "adm-badge--shipped", Delivered: "adm-badge--delivered", Cancelled: "adm-badge--cancelled" }[o.status] || "adm-badge--pending"
                          }`}>{o.status || "Pending"}</span></td>
                          <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="adm-modal__footer">
              <button className="adm-btn" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  )
}