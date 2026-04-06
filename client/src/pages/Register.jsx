import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/register.css"; 

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!")
    return
  }

  if (formData.password.length < 6) {
    alert("Password must be at least 6 characters")
    return
  }

  try {
    setLoading(true)

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

    alert("Account created successfully!")
    navigate("/login")

  } catch (error) {
    console.error(error)
    alert("Server error")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-header">
          <h2>Create Account</h2>
          <p>Join our community of craft lovers</p>
        </div>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="password-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-register">Sign Up</button>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  );
}