import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./Authcontext"

const CartContext = createContext()

export function CartProvider({ children }) {

  const { user } = useAuth() // 🔥 connect user
  const [cart, setCart] = useState([])

  // 🔥 LOAD CART WHEN USER CHANGES
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`cart_${user.email}`)
      setCart(saved ? JSON.parse(saved) : [])
    } else {
      setCart([]) // logout → clear cart
    }
  }, [user])

  // 🔥 SAVE CART PER USER
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart))
    }
  }, [cart, user])

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item._id === product._id)
      if (exists) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id))
  }

  const clearCart = () => setCart([])

  const updateQty = (id, change) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item._id === id) {
            const newQty = item.qty + change
            if (newQty <= 0) return null
            return { ...item, qty: newQty }
          }
          return item
        })
        .filter(Boolean)
    )
  }

  return (
    <CartContext.Provider 
      value={{ cart, addToCart, removeFromCart, clearCart, updateQty }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)