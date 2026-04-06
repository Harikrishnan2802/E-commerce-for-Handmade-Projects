import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import "../styles/about.css"

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Sourcing Materials",
    subtitle: "Ethically gathered, locally loved",
    body:
      "Every journey starts with the raw material. We travel to trusted suppliers — clay from Tamil Nadu, brass from Moradabad, thread from weavers in Kutch. We touch every fibre before it enters our workshop. If it doesn't feel right, it doesn't come home with us.",
    icon: "◈",
  },
  {
    number: "02",
    title: "Designing by Hand",
    subtitle: "No CAD files. No shortcuts.",
    body:
      "Our makers sketch on paper first — always. Proportions are tested with cardboard and clay before a single bead is threaded or a single mould is fired. The design phase often takes longer than the making itself, and we think that's exactly right.",
    icon: "✏",
  },
  {
    number: "03",
    title: "Crafting in Small Batches",
    subtitle: "Eight pieces, not eight hundred",
    body:
      "We work in batches of six to twelve. A maker holds one piece at a time, giving it their full attention. There is no assembly line. There is no rush. Each piece is shaped, fired or formed, cooled, and then inspected against the original sketch.",
    icon: "⬡",
  },
  {
    number: "04",
    title: "Finishing & Quality",
    subtitle: "The details that cannot be automated",
    body:
      "Edges are filed smooth. Clasps are tested fifty times. Glazes are applied in two coats, dried between each. Any piece that doesn't meet the maker's own standard is broken down and begun again. We'd rather start over than send something we aren't proud of.",
    icon: "◎",
  },
  {
    number: "05",
    title: "Packed with Intention",
    subtitle: "Right down to the tissue paper",
    body:
      "Every order is wrapped in recycled kraft, sealed with a wax stamp, and tucked with a handwritten note from the maker who built it. The packaging is part of the experience — opening it should feel like receiving a gift from a friend.",
    icon: "▣",
  },
]

const VALUES = [
  {
    icon: "✦",
    title: "Slow is intentional",
    body: "We are not racing anyone. Good work takes time and we have built our entire business to protect that time.",
  },
  {
    icon: "◈",
    title: "Makers, not manufacturers",
    body: "Each person in our collective is a named artist. You'll find their signature on every piece they create.",
  },
  {
    icon: "⬡",
    title: "Material honesty",
    body: "We never coat, veneer, or disguise what a thing is made from. Brass looks like brass. Clay looks like clay.",
  },
  {
    icon: "◎",
    title: "Repair before replace",
    body: "If a clasp breaks or a glaze chips, send it back. We will fix it. No questions, no charge.",
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`fade-in ${inView ? "fade-in--visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="about">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero__bg" />
        <div className="about-hero__content">
          <span className="about-hero__label">Our Story</span>
          <h1 className="about-hero__title">
            Made by hand.<br />
            <em>Guided by heart.</em>
          </h1>
          <p className="about-hero__sub">
            We started in a single rented room in Pondicherry with four makers,
            a kiln, and a deep belief that the world needed fewer things made
            better. That belief hasn't changed.
          </p>
        </div>
        <div className="about-hero__scroll-hint">
          <span className="about-hero__scroll-line" />
          <span className="about-hero__scroll-text">Scroll</span>
        </div>
      </section>

      {/* ── Origin ───────────────────────────────── */}
      <section className="about-origin">
        <FadeIn className="about-origin__label-wrap">
          <span className="section-label">Where it began</span>
        </FadeIn>
        <div className="about-origin__grid">
          <FadeIn className="about-origin__text" delay={80}>
            <h2 className="about-origin__heading">
              A room, a kiln,<br />and four stubborn makers
            </h2>
            <p>
              In 2019, Priya and three friends pooled together ₹40,000, rented
              a small studio on the edge of the French Quarter, and fired their
              first batch of ceramic jewellery. None of it sold the first week.
              They weren't discouraged — they were editing.
            </p>
            <p>
              By the third month they had a waiting list. Not because of marketing
              or algorithms, but because someone received a piece, wore it, and a
              stranger on the street asked where it came from. Word of mouth is
              still our only real engine.
            </p>
            <p>
              Today the collective has grown to eleven makers across Pondicherry,
              Chennai, and Jaipur. The studio is bigger. The kiln is better. The
              stubbornness is exactly the same.
            </p>
          </FadeIn>
          <FadeIn className="about-origin__visual" delay={160}>
            <div className="about-origin__img">
              <div className="about-origin__img-inner">
                <span className="about-origin__img-icon">✦</span>
                <span className="about-origin__img-caption">Pondicherry Studio, 2019</span>
              </div>
              <div className="about-origin__stat-card about-origin__stat-card--1">
                <span className="about-origin__stat-num">11</span>
                <span className="about-origin__stat-label">Makers</span>
              </div>
              <div className="about-origin__stat-card about-origin__stat-card--2">
                <span className="about-origin__stat-num">2019</span>
                <span className="about-origin__stat-label">Est.</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Process ──────────────────────────────── */}
      <section className="about-process">
        <FadeIn>
          <div className="about-process__header">
            <span className="section-label">How we make</span>
            <h2 className="about-process__title">
              Every piece travels<br />through five careful hands
            </h2>
            <p className="about-process__intro">
              There is no single "production line" at Handmade with Love. There
              is a process — deliberate, unhurried, and unchanged since day one.
            </p>
          </div>
        </FadeIn>

        <div className="about-process__steps">
          {PROCESS_STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 80} className="about-process__step-wrap">
              <div className="about-process__step">
                <div className="about-process__step-left">
                  <span className="about-process__step-num">{step.number}</span>
                  <div className="about-process__step-line" />
                </div>
                <div className="about-process__step-body">
                  <span className="about-process__step-icon">{step.icon}</span>
                  <h3 className="about-process__step-title">{step.title}</h3>
                  <p className="about-process__step-sub">{step.subtitle}</p>
                  <p className="about-process__step-text">{step.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Materials callout ────────────────────── */}
      <section className="about-materials">
        <div className="about-materials__inner">
          <FadeIn>
            <span className="section-label" style={{ color: "rgba(247,243,237,.7)" }}>
              What we use
            </span>
            <h2 className="about-materials__title">
              "We never use a material<br />we can't name the source of."
            </h2>
            <p className="about-materials__sub">— Priya, Founder</p>
          </FadeIn>
          <FadeIn delay={120}>
            <div className="about-materials__tags">
              {[
                "Terracotta clay — Tamil Nadu",
                "Raw brass — Moradabad",
                "Cotton thread — Kutch weavers",
                "Natural stone — Rajasthan",
                "Recycled silver — Chennai refinery",
                "Plant-based dyes — Bangalore",
              ].map((tag) => (
                <span key={tag} className="about-materials__tag">{tag}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Values ───────────────────────────────── */}
      <section className="about-values">
        <FadeIn>
          <span className="section-label">What we stand for</span>
          <h2 className="about-values__title">Four principles.<br />No exceptions.</h2>
        </FadeIn>
        <div className="about-values__grid">
          {VALUES.map((v, i) => (
            <FadeIn key={v.title} delay={i * 70}>
              <div className="about-values__card">
                <span className="about-values__card-icon">{v.icon}</span>
                <h3 className="about-values__card-title">{v.title}</h3>
                <p className="about-values__card-body">{v.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="about-cta">
        <FadeIn>
          <span className="section-label">Ready to explore?</span>
          <h2 className="about-cta__title">See what our makers have crafted this season</h2>
          <div className="about-cta__actions">
            <Link to="/shop" className="btn btn--primary">Browse the Collection</Link>
            <Link to="/contact" className="btn btn--outline">Talk to Us</Link>
          </div>
        </FadeIn>
      </section>

    </main>
  )
}