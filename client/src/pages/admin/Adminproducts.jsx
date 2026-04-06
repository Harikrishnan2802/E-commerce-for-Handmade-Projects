import { useEffect, useState } from "react"

const API = "http://localhost:5000/api"
const token = () => localStorage.getItem("token")

const EMPTY = { name: "", price: "", description: "", category: "", stock: "", image: "" }

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

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState(null) // null | "add" | "edit"
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const toast = (msg, type = "success") => {
    const id = Date.now()
    setToasts(ts => [...ts, { id, msg, type }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000)
  }

  const load = () => {
    setLoading(true)
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : data.products || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal("add") }
  const openEdit = (p) => {
    setForm({
      name: p.name || "", price: p.price || "", description: p.description || "",
      category: p.category || "", stock: p.stock ?? "", image: p.image || ""
    })
    setEditId(p._id)
    setModal("edit")
  }
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null) }

  const handleField = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const save = async () => {
    if (!form.name || !form.price) return toast("Name and price are required", "error")
    setSaving(true)
    const url    = modal === "add" ? `${API}/products` : `${API}/products/${editId}`
    const method = modal === "add" ? "POST" : "PUT"
    const body   = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 }
    try {
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error()
      toast(modal === "add" ? "Product added!" : "Product updated!")
      closeModal(); load()
    } catch {
      toast("Save failed", "error")
    }
    setSaving(false)
  }

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: "DELETE", headers: { Authorization: "Bearer " + token() }
      })
      if (!res.ok) throw new Error()
      toast("Product deleted")
      setDeleteConfirm(null); load()
    } catch {
      toast("Delete failed", "error")
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="adm-section-head">
        <div>
          <h2>Products</h2>
          <p>{products.length} products listed</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="adm-search" style={{ marginBottom: 20 }}>
        <input
          className="adm-search__input"
          placeholder="Search by name or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <div className="adm-loading">Loading products…</div> : (
        <div className="adm-table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 56 }}>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="adm-empty">No products found</div></td></tr>
              ) : filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    {p.image
                      ? <img src={p.image} alt={p.name} className="adm-img-preview" />
                      : <div className="adm-img-preview" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>◈</div>
                    }
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: "var(--adm-text-muted)", marginTop: 2, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>}
                  </td>
                  <td>
                    {p.category && <span style={{ fontSize: 12, padding: "2px 8px", background: "var(--adm-bg)", border: "1px solid var(--adm-border)", borderRadius: 100, color: "var(--adm-text-muted)" }}>{p.category}</span>}
                  </td>
                  <td style={{ fontFamily: "var(--adm-font-mono)", fontWeight: 500 }}>
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--adm-font-mono)", fontSize: 13, color: p.stock === 0 ? "var(--adm-danger)" : "inherit" }}>
                      {p.stock ?? "—"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="adm-btn adm-btn--sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteConfirm(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="adm-modal">
            <div className="adm-modal__head">
              <h3 className="adm-modal__title">{modal === "add" ? "Add Product" : "Edit Product"}</h3>
              <button className="adm-modal__close" onClick={closeModal}>×</button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-form-grid">
                <div className="adm-field adm-form-span2">
                  <label>Product Name *</label>
                  <input className="adm-input" name="name" value={form.name} onChange={handleField} placeholder="Handwoven Basket" />
                </div>
                <div className="adm-field">
                  <label>Price (₹) *</label>
                  <input className="adm-input" name="price" type="number" value={form.price} onChange={handleField} placeholder="499" />
                </div>
                <div className="adm-field">
                  <label>Stock</label>
                  <input className="adm-input" name="stock" type="number" value={form.stock} onChange={handleField} placeholder="10" />
                </div>
                <div className="adm-field">
                  <label>Category</label>
                  <select className="adm-select" name="category" value={form.category} onChange={handleField}>
                    <option value="">Select category</option>
                    <option>Pottery</option>
                    <option>Textiles</option>
                    <option>Jewellery</option>
                    <option>Woodwork</option>
                    <option>Leather</option>
                    <option>Decor</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="adm-field">
                  <label>Image URL</label>
                  <input className="adm-input" name="image" value={form.image} onChange={handleField} placeholder="https://…" />
                </div>
                <div className="adm-field adm-form-span2">
                  <label>Description</label>
                  <textarea className="adm-textarea" name="description" value={form.description} onChange={handleField} placeholder="A short description of the product…" />
                </div>
              </div>
              {form.image && (
                <div style={{ textAlign: "center" }}>
                  <img src={form.image} alt="Preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: "var(--adm-radius)", border: "1px solid var(--adm-border)" }} onError={e => e.target.style.display = "none"} />
                </div>
              )}
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn" onClick={closeModal}>Cancel</button>
              <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : modal === "add" ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="adm-modal" style={{ maxWidth: 400 }}>
            <div className="adm-modal__head">
              <h3 className="adm-modal__title">Delete Product?</h3>
              <button className="adm-modal__close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <p style={{ fontSize: 14, color: "var(--adm-text-muted)" }}>
              This will permanently delete <strong>{deleteConfirm.name}</strong>. This action cannot be undone.
            </p>
            <div className="adm-modal__footer">
              <button className="adm-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="adm-btn adm-btn--primary" style={{ background: "var(--adm-danger)", borderColor: "var(--adm-danger)" }} onClick={() => deleteProduct(deleteConfirm._id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  )
}