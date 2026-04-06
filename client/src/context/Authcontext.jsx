import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)  // 🔥 NEW: wait for auth check

  // AUTO LOGIN — restore session on page load
  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setLoading(false)
      return
    }

    fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Invalid token")
        return res.json()
      })
      .then(data => {
        // data.user is the Mongoose doc — make sure role is present
        setUser(data.user)
      })
      .catch(() => {
        localStorage.removeItem("token")
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // LOGIN — called after successful /api/auth/login
  const login = (userData) => {
    setUser(userData)   // userData already has { email, name, role } from login response
  }

  // SIGNUP
  const signup = async (name, email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {/* 🔥 Don't render children until auth check completes */}
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)