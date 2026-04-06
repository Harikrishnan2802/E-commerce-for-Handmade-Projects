import Navbar from "./components/Navbar"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/Authcontext"
import Admin from "./pages/Admin"
import Home from "./pages/Home"
import Shop from "./pages/Shop"
import About from "./pages/About"
import Contact from "./pages/Contact"
import LoginPage from "./pages/Login"
import ProfilePage from "./pages/ProfilePage"
import Register from "./pages/Register"
import Cart from "./pages/Cart"

// FIX: AdminRoute defined outside App (was incorrectly nested inside)
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role !== "admin") return <Navigate to="/" />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to={user.role === "admin" ? "/admin" : "/"} />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/cart"
          element={user ? <Cart /> : <Navigate to="/login" />}
        />

        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  )
}