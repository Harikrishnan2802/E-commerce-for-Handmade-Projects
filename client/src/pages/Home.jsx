import { useEffect, useState } from "react"
import { API } from "../utils/api"
import ProductCard from "../components/ProductCard"
import "../styles/home.css"
import Navbar from "../components/Navbar" 

const CATEGORIES = ["All", "Ceramics", "Textiles", "Jewelry", "Candles", "Art"]

const FEATURES = [
  {
    icon: "✦",
    title: "Handcrafted",
    desc: "Every piece made by hand, with care and intention.",
  },
  {
    icon: "◈",
    title: "Sustainable",
    desc: "Ethically sourced materials, minimal waste processes.",
  },
  {
    icon: "❋",
    title: "One of a Kind",
    desc: "No two pieces are identical — that's the beauty of it.",
  },
  {
    icon: "⟁",
    title: "Maker Stories",
    desc: "Each product carries the story of the hands that made it.",
  },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [heroVisible, setHeroVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    API.get("/products")
      .then((res) => {
const data = Array.isArray(res.data) ? res.data : res.data.products || []

// 🔥 Remove invalid products
const cleanData = data.filter(p => p.image && p.price)

setProducts(cleanData)
setFiltered(cleanData)
      })
      .finally(() => setLoading(false))
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleCategory = (cat) => {
    setActiveCategory(cat)
    setFiltered(
      cat === "All"
        ? products
        : products.filter((p) => p.category === cat)
    )
  }

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className={`hero ${heroVisible ? "hero--visible" : ""}`}>
        <div className="hero__grain" />
        <div className="hero__content">
          <span className="hero__eyebrow">Est. 2019 · Small Batch · Handmade</span>
          <h1 className="hero__title">
            Handmade<br />
            <em>with Love</em>
          </h1>
          <p className="hero__sub">
            Slow-crafted goods made by independent artisans who pour
            passion into every stitch, glaze, and pour.
          </p>
          <div className="hero__actions">
            <a href="#products" className="btn btn--primary">Shop the Collection</a>
            <a href="#story" className="btn btn--ghost">Our Story ↓</a>
          </div>
        </div>
        <div className="hero__badge">
          <span>100%</span>
          <span>Artisan</span>
          <span>Made</span>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="features">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <span className="feature__icon">{f.icon}</span>
            <h3 className="feature__title">{f.title}</h3>
            <p className="feature__desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── Story ── */}
      <section className="story" id="story">
        <div className="story__img-block">
          <div className="story__img-placeholder">
            <span>✦</span>
          </div>
          <div className="story__img-tag">Est. 2019</div>
        </div>
        <div className="story__text">
          <span className="section-label">Our Story</span>
          <h2 className="story__heading">
            Made slow.<br />Made right.
          </h2>
          <p>
            We started with a simple belief: that the things filling your home
            should carry meaning. Every maker in our collective works in small
            batches — never scaled, never rushed.
          </p>
          <p>
            From clay studios in Vermont to weaving workshops in New Mexico,
            each item on this site was shaped by human hands and guided
            by decades of craft tradition.
          </p>
          <a href="/about" className="btn btn--outline">Meet the Makers →</a>
        </div>
      </section>

      {/* ── Products ── */}
      <section className="products-section" id="products">
        <div className="products-section__header">
          <span className="section-label">The Collection</span>
          <h2 className="products-section__title">Shop by Craft</h2>
        </div>

        {/* Category Filter */}
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? "category-btn--active" : ""}`}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div className="skeleton-card" key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span>✦</span>
            <p>No pieces in this category yet — check back soon.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Banner CTA ── */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <span className="section-label">Join the Community</span>
          <h2>Crafted for the curious.<br />Built for those who care.</h2>
          <p>Sign up for maker stories, new arrivals, and early access.</p>
          <form className="cta-banner__form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="cta-banner__input"
            />
            <button type="submit" className="btn btn--primary">Subscribe</button>
          </form>
        </div>
      </section>

      {/* ── Footer Note ── */}
      <footer className="home-footer">
        <p>© 2025 Handmade with Love · Made by makers, for people who notice.</p>
      </footer>

    </div>
  )
}