import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/Authcontext"
import "../styles/login.css"

export default function LoginPage() {
  const { login, signup, user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  // Where to go after login — defaults to /profile
  const from = location.state?.from || "/profile"

  // Pre-select mode if navigated with state (e.g. from LoginPromptModal)
  const [mode, setMode] = useState(location.state?.mode === "signup" ? "signup" : "login")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }, [user, from, navigate])

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const submit = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.email || !form.password) {
      return setError("Please fill all fields.")
    }

    setLoading(true)

    try {
      if (mode === "signup") {
        if (!form.name) return setError("Please enter your full name.")
        const ok = await signup(form.name, form.email, form.password)
        if (!ok) {
          setError("Registration failed. Try a different email.")
          setLoading(false)
          return
        }
        // After signup, fall through to login
      }

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Login failed")
        setLoading(false)
        return
      }

      if (!data.token) {
        setError("Token missing from server response")
        setLoading(false)
        return
      }

      localStorage.setItem("token", data.token)
      login(data.user)

      // FIX: Redirect admin users to /admin dashboard
      if (data.user?.role === "admin") {
        navigate("/admin", { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      console.log(err)
      setError("Server error")
    }

    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-page__bg" />

      <div className="login-page__card">
        <Link to="/" className="login-page__brand">
          <span className="login-page__brand-icon">✦</span>
          <span>Handmade</span>
        </Link>

        {from !== "/profile" && (
          <div className="login-page__redirect-hint">
            🔒 Sign in to continue shopping
          </div>
        )}

        <h1 className="login-page__title">
          {mode === "login" ? "Welcome back" : "Join us"}
        </h1>
        <p className="login-page__subtitle">
          {mode === "login"
            ? "Sign in to track your orders & manage your account"
            : "Create an account to start your handcrafted journey"}
        </p>

        <div className="login-page__tabs">
          <button
            className={`login-page__tab ${mode === "login" ? "login-page__tab--active" : ""}`}
            onClick={() => { setMode("login"); setError("") }}
          >Sign In</button>
          <button
            className={`login-page__tab ${mode === "signup" ? "login-page__tab--active" : ""}`}
            onClick={() => { setMode("signup"); setError("") }}
          >Create Account</button>
        </div>

        <form className="login-page__form" onSubmit={submit}>
          {mode === "signup" && (
            <div className="login-page__field">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" placeholder="Priya Sharma"
                value={form.name} onChange={handle} autoComplete="name" />
            </div>
          )}
          <div className="login-page__field">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handle} autoComplete="email" />
          </div>
          <div className="login-page__field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handle}
              autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>

          {error && <p className="login-page__error">⚠ {error}</p>}

          <button
            type="submit"
            className={`login-page__submit ${loading ? "login-page__submit--loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {mode === "login" && (
          <p className="login-page__hint">
            <a href="#" onClick={e => e.preventDefault()}>Forgot your password?</a>
          </p>
        )}

        <p className="login-page__switch">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("") }}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>

        <p className="login-page__demo-hint">
          💡 Demo: enter any email & password (6+ chars) to log in
        </p>
      </div>
    </div>
  )
}