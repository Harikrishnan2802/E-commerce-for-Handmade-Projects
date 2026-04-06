import { useEffect, useState, useRef } from "react"
import { API } from "../utils/api"
import ProductCard from "../components/ProductCard"
import "../styles/shop.css"
import Navbar from "../components/Navbar" 

const CATEGORIES = ["All", "Bracelets", "Chains", "Earrings", "Hairbands"]

const SORT_OPTIONS = [
  { label: "Newest",        value: "newest" },
  { label: "Price: Low–High", value: "price_asc" },
  { label: "Price: High–Low", value: "price_desc" },
  { label: "A–Z",           value: "az" },
]

function sortProducts(products, sort) {
  const arr = [...products]
  switch (sort) {
    case "price_asc":  return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    case "price_desc": return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    case "az":         return arr.sort((a, b) => a.name.localeCompare(b.name))
    default:           return arr
  }
}

export default function Shop() {
  const [products, setProducts]       = useState([])
  const [search, setSearch]           = useState("")
  const [activeCategory, setCategory] = useState("All")
  const [sort, setSort]               = useState("newest")
  const [viewMode, setViewMode]       = useState("grid")   // "grid" | "list"
  const [loading, setLoading]         = useState(true)
  const [mounted, setMounted]         = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 80)
    API.get("/products")
      .then(res => {
  const data = Array.isArray(res.data) ? res.data : res.data.products || []
  setProducts(data)
})
      .finally(() => setLoading(false))
  }, [])

  // Derived filtered + sorted list
  const filtered = sortProducts(
  products.filter(p => {
    const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase())
    const matchCat    = activeCategory === "All" || p.category === activeCategory

    // 🔥 REMOVE BAD PRODUCTS
    const validProduct = p.image && p.price

    return matchSearch && matchCat && validProduct
  }),
  sort
)

  const clearSearch = () => {
    setSearch("")
    inputRef.current?.focus()
  }

  return (
    <div className={`shop ${mounted ? "shop--in" : ""}`}>

      {/* ── Page Header ── */}
      <header className="shop-header">
        <div className="shop-header__inner">
          <span className="shop-header__label">The Collection</span>
          <h1 className="shop-header__title">Our Handmade Shop</h1>
          <p className="shop-header__sub">
            Every piece shaped by hand — no two are ever quite the same.
          </p>
        </div>
        <div className="shop-header__deco" aria-hidden="true">
          {["◈", "✦", "❋", "⟁"].map((s, i) => (
            <span key={i} style={{ "--d": `${i * 0.18}s` }}>{s}</span>
          ))}
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="shop-toolbar">

        {/* Search */}
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={clearSearch} aria-label="Clear">✕</button>
          )}
        </div>

        <div className="toolbar-right">
          {/* Sort */}
          <div className="sort-wrap">
            <label className="sort-label" htmlFor="sort-select">Sort</label>
            <select
              id="sort-select"
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "view-btn--active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "view-btn--active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Pills ── */}
      <div className="categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? "cat-btn--active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
            {cat !== "All" && (
              <span className="cat-btn__count">
                {products.filter(p => p.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Results bar ── */}
      <div className="results-bar">
        {!loading && (
          <>
            <span className="results-bar__count">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"} found
            </span>
            {(search || activeCategory !== "All") && (
              <button
                className="results-bar__reset"
                onClick={() => { setSearch(""); setCategory("All") }}
              >
                Clear filters ✕
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Products ── */}
      <main className="shop-main">
        {loading ? (
          <div className={`product-grid product-grid--${viewMode}`}>
            {[...Array(8)].map((_, i) => (
              <div className="skel" key={i} style={{ "--i": i }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className={`product-grid product-grid--${viewMode}`}>
            {filtered.map((p, i) => (
              <div
                className="product-grid__item"
                key={p._id}
                style={{ "--i": i }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <span className="empty__icon">✦</span>
            <h3 className="empty__heading">Nothing here yet</h3>
            <p className="empty__sub">
              Try a different search term or browse another category.
            </p>
            <button
              className="btn-reset"
              onClick={() => { setSearch(""); setCategory("All") }}
            >
              Reset filters
            </button>
          </div>
        )}
      </main>

    </div>
  )
}