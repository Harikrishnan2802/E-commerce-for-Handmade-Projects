import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/Authcontext"

/**
 * useAuthGuard
 * Returns a `guard(fn)` wrapper.
 * If user is logged in  → executes fn() immediately.
 * If user is NOT logged in → navigates to /login with `from` state
 *   so LoginPage can redirect back after login.
 *
 * Usage:
 *   const guard = useAuthGuard()
 *   <button onClick={() => guard(() => addToCart(product))}>Add to Cart</button>
 */
export function useAuthGuard() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  return (fn) => {
    if (user) {
      fn()
    } else {
      // Save current page so we can redirect back after login
      navigate("/login", { state: { from: location.pathname } })
    }
  }
}