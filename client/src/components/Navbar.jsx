import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import "../styles/Navbar.css"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/Authcontext"

const NAV_LINKS = [
  { label: "Home",       href: "/" },
  { label: "Shop",       href: "/shop" },
  { label: "Our Story",  href: "/about" },
  { label: "Contact",    href: "/contact" },
]

export default function Navbar() {
  const { cart } = useCart()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled]  = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const profileRef = useRef(null)

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  // Frosted glass after 40px scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const isActive = (href) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href)

  const isLightPage = location.pathname !== "/"

  return (
    <nav
      className={[
        "navbar",
        scrolled    ? "navbar--scrolled" : "",
        menuOpen    ? "navbar--open"      : "",
        isLightPage ? "navbar--light"     : "",
      ].join(" ")}
      role="navigation"
      aria-label="Main navigation"
    >

      {/* ── Logo ── */}
      <Link to="/" className="navbar__logo">
        <span className="navbar__logo-icon">✦</span>
        <span className="navbar__logo-text">Handmade</span>
      </Link>

      {/* ── Desktop Links ── */}
      <ul className="navbar__links" role="list">
        {NAV_LINKS.map((l) => (
          <li key={l.label}>
            <Link
              to={l.href}
              className={`navbar__link ${isActive(l.href) ? "navbar__link--active" : ""}`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Right Cluster ── */}
      <div className="navbar__right">

        {/* ── Auth: Login or Profile Dropdown ── */}
        {!user ? (
          <Link to="/login" className="navbar__login">Login</Link>
        ) : (
          <div className="navbar__profile-wrap" ref={profileRef}>
            <button
              className="navbar__profile-btn"
              onClick={() => setProfileOpen(o => !o)}
              aria-label="Profile menu"
              aria-expanded={profileOpen}
            >
              <span className="navbar__profile-avatar">{user?.avatar || "U"}</span>
              <span className="navbar__profile-name">
                {user?.name ? user.name.split(" ")[0] : "User"}
              </span>
              <span className={`navbar__profile-caret ${profileOpen ? "navbar__profile-caret--open" : ""}`}>▾</span>
            </button>

            {profileOpen && (
              <div className="navbar__profile-dropdown">
                <div className="navbar__profile-dropdown-header">
                  <span className="navbar__profile-dropdown-avatar">{user?.avatar || "U"}</span>
                  <div>
                    <div className="navbar__profile-dropdown-name">{user?.name || "User"}</div>
                    <div className="navbar__profile-dropdown-email">{user?.email || ""}</div>
                  </div>
                </div>
                <Link to="/profile" className="navbar__profile-dropdown-item">
                  <span>👤</span> My Profile
                </Link>
                <Link to="/profile" className="navbar__profile-dropdown-item">
                  <span>📦</span> My Orders
                </Link>
                <hr className="navbar__profile-dropdown-divider" />
                <button
                  className="navbar__profile-dropdown-item navbar__profile-dropdown-item--logout"
                  onClick={() => { logout(); setProfileOpen(false) }}
                >
                  <span>↩</span> Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cart */}
        <Link to="/cart" className="navbar__cart" aria-label="Cart">
          <svg className="navbar__cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span className="navbar__cart-count">{cart.length}</span>
        </Link>

        {/* Burger */}
        <button
          className="navbar__burger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* ── Mobile Overlay — only rendered when open ── */}
      {menuOpen && (
        <div
          className="navbar__overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer — only rendered when open ── */}
      {menuOpen && (
        <div className="navbar__drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="navbar__drawer-header">
            <span className="navbar__drawer-brand">✦ Handmade</span>
            <button
              className="navbar__drawer-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >✕</button>
          </div>

          {/* Mobile: user info */}
          {user && (
            <div className="navbar__drawer-user">
              <span className="navbar__drawer-user-avatar">{user?.avatar || "U"}</span>
              <div>
                <div className="navbar__drawer-user-name">{user?.name || "User"}</div>
                <div className="navbar__drawer-user-email">{user?.email || ""}</div>
              </div>
            </div>
          )}

          <ul className="navbar__drawer-list" role="list">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.href}
                  className={`navbar__drawer-link ${isActive(l.href) ? "navbar__drawer-link--active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                  <span className="navbar__drawer-arrow">→</span>
                </Link>
              </li>
            ))}
            {user && (
              <>
                <li>
                  <Link
                    to="/profile"
                    className={`navbar__drawer-link ${isActive("/profile") ? "navbar__drawer-link--active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Profile
                    <span className="navbar__drawer-arrow">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    className="navbar__drawer-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                    <span className="navbar__drawer-arrow">→</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {!user ? (
            <Link
              to="/login"
              className="navbar__drawer-login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          ) : (
            <button
              className="navbar__drawer-login navbar__drawer-login--logout"
              onClick={() => { logout(); setMenuOpen(false) }}
            >
              Sign Out
            </button>
          )}

          <Link
            to="/cart"
            className="navbar__drawer-cart"
            onClick={() => setMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18">
              <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            View Cart
            <span className="navbar__drawer-cart-count">{cart.length} items</span>
          </Link>
        </div>
      )}

    </nav>
  )
}