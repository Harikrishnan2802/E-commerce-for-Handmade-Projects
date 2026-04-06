import { useState, useEffect, useRef } from "react"
import "../styles/contact.css"

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "All orders are dispatched within 3–5 working days. Since every piece is made to order or from a very small batch, we ask for this window to ensure your piece is ready. Delivery after dispatch is 2–4 days within India.",
  },
  {
    q: "Can I request a custom piece?",
    a: "Yes — it's actually our favourite thing to do. Send us a message with your idea, the occasion, and any size or material preferences. We'll reply within 48 hours with a quote and timeline.",
  },
  {
    q: "Do you offer repairs?",
    a: "Always. If a clasp breaks, a bead cracks, or a glaze chips — send it back. We'll fix or replace it at no charge. This is our commitment to every piece we make.",
  },
  {
    q: "Are your materials ethically sourced?",
    a: "Yes. We visit our suppliers in person at least once a year. Every material on our site has a named source — you can read about each one on our Story page.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship within India only. International shipping is something we're actively working toward — sign up to our newsletter to be the first to know.",
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

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? "faq-item--open" : ""}`}>
      <button className="faq-item__q" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span className="faq-item__icon">{open ? "−" : "+"}</span>
      </button>
      <div className="faq-item__body">
        <p>{a}</p>
      </div>
    </div>
  )
}

const INITIAL = { name: "", email: "", subject: "", message: "" }

export default function Contact() {
  const [form, setForm] = useState(INITIAL)
  const [status, setStatus] = useState("idle") // idle | sending | sent | error
  const [touched, setTouched] = useState({})

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleBlur = (e) =>
    setTouched(t => ({ ...t, [e.target.name]: true }))

  const errors = {
    name:    !form.name.trim()                         ? "Name is required" : "",
    email:   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Valid email required" : "",
    message: form.message.trim().length < 10           ? "Please write at least 10 characters" : "",
  }

  const isValid = !errors.name && !errors.email && !errors.message

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid) return
    setStatus("sending")
    // Simulate send (replace with real API call)
    setTimeout(() => {
      setStatus("sent")
      setForm(INITIAL)
      setTouched({})
    }, 1400)
  }

  return (
    <main className="contact">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero__bg" />
        <div className="contact-hero__content">
          <span className="contact-hero__label">Get in Touch</span>
          <h1 className="contact-hero__title">
            We read every<br />
            <em>single message.</em>
          </h1>
          <p className="contact-hero__sub">
            Questions about an order, a custom piece, or just want to say hello —
            we reply personally, usually within one working day.
          </p>
        </div>
      </section>

      {/* ── Main grid ────────────────────────────── */}
      <section className="contact-main">

        {/* Form column */}
        <FadeIn className="contact-form-col">
          <span className="section-label">Send a message</span>
          <h2 className="contact-form-col__heading">Tell us what's on your mind</h2>

          {status === "sent" ? (
            <div className="contact-success">
              <span className="contact-success__icon">✦</span>
              <h3>Message received</h3>
              <p>
                Thank you for writing in. One of our team will reply to{" "}
                <strong>{form.email || "your inbox"}</strong> within one working day.
              </p>
              <button
                className="btn btn--outline"
                onClick={() => setStatus("idle")}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>

              <div className="contact-form__row">
                <div className={`contact-form__field ${touched.name && errors.name ? "contact-form__field--error" : ""}`}>
                  <label htmlFor="name">Your name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Priya Sharma"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="name"
                  />
                  {touched.name && errors.name && (
                    <span className="contact-form__error">{errors.name}</span>
                  )}
                </div>

                <div className={`contact-form__field ${touched.email && errors.email ? "contact-form__field--error" : ""}`}>
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                  />
                  {touched.email && errors.email && (
                    <span className="contact-form__error">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="contact-form__field">
                <label htmlFor="subject">Subject <span className="contact-form__optional">(optional)</span></label>
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                >
                  <option value="">Select a topic…</option>
                  <option value="order">About an order</option>
                  <option value="custom">Custom piece enquiry</option>
                  <option value="repair">Repair request</option>
                  <option value="wholesale">Wholesale / collaboration</option>
                  <option value="other">Something else</option>
                </select>
              </div>

              <div className={`contact-form__field ${touched.message && errors.message ? "contact-form__field--error" : ""}`}>
                <label htmlFor="message">Your message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Write your message here — the more detail the better…"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.message && errors.message && (
                  <span className="contact-form__error">{errors.message}</span>
                )}
                <span className="contact-form__count">
                  {form.message.length} characters
                </span>
              </div>

              <button
                type="submit"
                className="btn btn--primary contact-form__submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <>
                    <span className="contact-form__spinner" />
                    Sending…
                  </>
                ) : "Send Message →"}
              </button>

            </form>
          )}
        </FadeIn>

        {/* Info column */}
        <div className="contact-info-col">
          <FadeIn delay={80}>
            <div className="contact-info-card">
              <span className="contact-info-card__icon">◎</span>
              <h3 className="contact-info-card__title">Visit the Studio</h3>
              <address className="contact-info-card__address">
                <br /> Pondicherry<br />
                Tamil Nadu, India
              </address>
              <p className="contact-info-card__hours">
                <strong>Open:</strong> Tue – Sat, 10am – 6pm<br />
                <strong>Closed:</strong> Sunday & Monday
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={140}>
            <div className="contact-info-card">
              <span className="contact-info-card__icon">✉</span>
              <h3 className="contact-info-card__title">Email Us</h3>
              <a className="contact-info-card__link" href="mailto:ashuaswini819@gmail.com">
                
              </a>
              <p className="contact-info-card__note">
                We reply within one working day. For urgent order queries, please include your order number in the subject line.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="contact-info-card">
              <span className="contact-info-card__icon">◈</span>
              <h3 className="contact-info-card__title">Follow our Work</h3>
              <div className="contact-info-card__socials">
                <a href="#" className="contact-social-btn">Instagram</a>
                <a href="#" className="contact-social-btn">Pinterest</a>
              </div>
              <p className="contact-info-card__note">
                Behind-the-scenes from the studio, new pieces before they list, and occasional maker portraits.
              </p>
            </div>
          </FadeIn>
        </div>

      </section>

      {/* ── FAQ ──────────────────────────────────── */}
      <section className="contact-faq">
        <FadeIn>
          <div className="contact-faq__header">
            <span className="section-label">Common questions</span>
            <h2 className="contact-faq__title">Before you write — <em>check here first</em></h2>
          </div>
        </FadeIn>
        <div className="contact-faq__list">
          {FAQS.map((item, i) => (
            <FadeIn key={i} delay={i * 60}>
              <FaqItem {...item} />
            </FadeIn>
          ))}
        </div>
      </section>

    </main>
  )
}