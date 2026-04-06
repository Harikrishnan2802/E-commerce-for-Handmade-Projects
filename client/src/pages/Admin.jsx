import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/Authcontext"
import AdminDashboard from "./admin/AdminDashboard"
import AdminProducts  from "./admin/AdminProducts"
import AdminUsers     from "./admin/AdminUsers"
import AdminOrders    from "./admin/AdminOrders"
import "./admin/admin.css"

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "products",  label: "Products",  icon: "◈" },
  { id: "orders",    label: "Orders",    icon: "◎" },
  { id: "users",     label: "Users",     icon: "◉" },
]

export default function Admin() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]               = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    // 🔥 Wait until auth check is done before deciding to redirect
    if (loading) return
    if (!user) { navigate("/login", { replace: true }); return }
    if (user.role !== "admin") navigate("/", { replace: true })
  }, [user, loading, navigate])

  // Show nothing while auth is still resolving
  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"monospace", color:"#7a7268", fontSize:13 }}>
        Checking authentication…
      </div>
    )
  }

  if (!user || user.role !== "admin") return null

  const handleLogout = () => { logout(); navigate("/") }

  return (
    <div className="adm-shell">
      <aside className={`adm-sidebar ${sidebarOpen ? "" : "adm-sidebar--collapsed"}`}>
        <div className="adm-sidebar__head">
          <span className="adm-sidebar__logo">✦ Handmade</span>
          <button className="adm-sidebar__toggle" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>
        <nav className="adm-sidebar__nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`adm-nav-item ${tab === n.id ? "adm-nav-item--active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              <span className="adm-nav-item__icon">{n.icon}</span>
              {sidebarOpen && <span className="adm-nav-item__label">{n.label}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar__footer">
          {sidebarOpen && (
            <div className="adm-sidebar__user">
              <div className="adm-sidebar__avatar">{user?.name?.[0]?.toUpperCase() || "A"}</div>
              <div>
                <p className="adm-sidebar__uname">{user?.name || "Admin"}</p>
                <p className="adm-sidebar__urole">Administrator</p>
              </div>
            </div>
          )}
          <button className="adm-sidebar__logout" onClick={handleLogout} title="Logout">
            <span>⎋</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar__title">{NAV.find(n => n.id === tab)?.label}</div>
          <div className="adm-topbar__meta">
            <span className="adm-badge adm-badge--live">● Live</span>
            <span className="adm-topbar__time">{new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
          </div>
        </header>
        <div className="adm-content">
          {tab === "dashboard" && <AdminDashboard />}
          {tab === "products"  && <AdminProducts />}
          {tab === "orders"    && <AdminOrders />}
          {tab === "users"     && <AdminUsers />}
        </div>
      </main>
    </div>
  )
}