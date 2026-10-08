"use client";

import {
  ArrowRight,
  ChevronDown,
  Globe,
  Grid3X3,
  Menu,
  Play,
  Search,
} from "lucide-react";
import Link from "next/link";

const productCards = [
  {
    title: "Meetings",
    eyebrow: "Video collaboration",
    description: "Connect face-to-face with reliable video meetings built for teams.",
    className: "landing-product-meetings",
  },
  {
    title: "My Notes",
    eyebrow: "AI note taker",
    description: "Capture the important moments from conversations and meetings.",
    className: "landing-product-notes",
  },
  {
    title: "ZoomMate",
    eyebrow: "AI productivity",
    description: "Turn ideas into documents, slides, plans, and actions with AI.",
    className: "landing-product-ai",
  },
  {
    title: "Phone",
    eyebrow: "Business communication",
    description: "Bring voice communication and collaboration together.",
    className: "landing-product-phone",
  },
  {
    title: "Webinars",
    eyebrow: "Events",
    description: "Host engaging events and connect with your audience.",
    className: "landing-product-webinars",
  },
  {
    title: "Bonsai",
    eyebrow: "Workflows",
    description: "Keep client work and business workflows moving.",
    className: "landing-product-bonsai",
  },
];

const newsCards = [
  {
    title: "Meet My Notes",
    text: "Capture insights from your conversations on Zoom, in person, and across third-party platforms.",
    className: "landing-news-tall",
  },
  {
    title: "Zoom wins Emmy for Engineering, Science & Technology",
    text: "From remote work to broadcast technology, Zoom keeps changing how the world connects.",
    className: "landing-news-large",
  },
  {
    title: "AI tools built for modern work",
    text: "Explore practical ways to bring AI into everyday collaboration.",
    className: "landing-news-small",
  },
  {
    title: "A platform built for connection",
    text: "See what teams can accomplish when communication and collaboration come together.",
    className: "landing-news-small",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-top-strip">
        <span>AI, CX, and beyond, <strong>Zoomtopia 2026</strong> has sessions built for you.</span>
        <button>Register now</button>
        <span className="landing-strip-close">×</span>
      </div>

      <header className="landing-navbar">
        <Link href="/" className="landing-logo">zoom</Link>

        <nav className="landing-nav-left">
          <button>Products <ChevronDown size={15} /></button>
          <button>AI <span className="landing-spark">✦</span> <ChevronDown size={15} /></button>
          <button>Solutions <ChevronDown size={15} /></button>
          <button>Pricing</button>
        </nav>

        <nav className="landing-nav-right">
          <button className="landing-icon-button" aria-label="Search">
            <Search size={22} />
          </button>
          <button className="landing-icon-button" aria-label="Language">
            <Globe size={22} />
          </button>
          <button className="landing-meet-button">Meet <ChevronDown size={15} /></button>
          <Link href="/sign-in" className="landing-signin">Sign In</Link>
          <button className="landing-support">Support</button>
          <Link href="/sign-up" className="landing-contact">Contact Sales</Link>
          <Link href="/sign-up" className="landing-signup">Sign Up Free</Link>
          <button className="landing-grid-button" aria-label="Products">
            <Grid3X3 size={22} />
          </button>
        </nav>

        <button className="landing-mobile-menu" aria-label="Open menu">
          <Menu size={25} />
        </button>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-glow landing-glow-one" />
        <div className="landing-hero-glow landing-glow-two" />

        <div className="landing-hero-content">
          <p className="landing-kicker">ZOOM WORKPLACE</p>
          <h1>
            Find out what&apos;s possible
            <br />
            when work connects
          </h1>
          <p className="landing-hero-copy">
            Bridge the gap between talking and doing with the AI-first work
            platform built for you.
          </p>

          <div className="landing-hero-actions">
            <Link href="/sign-up" className="landing-dark-button">
              Explore products
              <ArrowRight size={17} />
            </Link>
            <Link href="/sign-up" className="landing-light-button">
              Find your plan
            </Link>
          </div>
        </div>

        <div className="landing-hero-orbit orbit-one" />
        <div className="landing-hero-orbit orbit-two" />
      </section>

      <section className="landing-products">
        <div className="landing-products-track">
          {productCards.map((card) => (
            <article className={`landing-product-card ${card.className}`} key={card.title}>
              <div>
                <span className="landing-card-eyebrow">{card.eyebrow}</span>
                <h2>{card.title}</h2>
              </div>
              <div className="landing-card-visual">
                {card.title === "Meetings" && (
                  <>
                    <div className="landing-video-window">
                      <span />
                      <span />
                      <span />
                      <div className="landing-mini-video-grid">
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                  </>
                )}
                {card.title === "My Notes" && (
                  <div className="landing-notes-window">
                    <div className="landing-window-bar" />
                    <div className="landing-notes-lines">
                      <b />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                {card.title === "ZoomMate" && (
                  <div className="landing-ai-window">
                    <div className="landing-ai-stars">✦</div>
                    <strong>ZoomMate is ready to help.</strong>
                    <div className="landing-ai-input">Anything to complete?</div>
                  </div>
                )}
                {card.title === "Phone" && <div className="landing-phone-orb">☎</div>}
                {card.title === "Webinars" && (
                  <div className="landing-webinar-window">
                    <div className="landing-person-shape" />
                    <div className="landing-reactions">♥  ✦  ●</div>
                  </div>
                )}
                {card.title === "Bonsai" && (
                  <div className="landing-bonsai-window">
                    <b>Clients</b>
                    <span>ACME</span>
                    <span>Aperture</span>
                    <span>Black Mesa</span>
                    <span>Con Sec</span>
                  </div>
                )}
              </div>
              <p>{card.description}</p>
            </article>
          ))}
        </div>

        <div className="landing-carousel-controls">
          <button>←</button>
          <div className="landing-dots">
            <span />
            <span />
            <span className="active" />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <button>→</button>
        </div>
      </section>

      <section className="landing-notes-section landing-section">
        <div className="landing-section-copy">
          <span className="landing-blue-label">✦ My Notes</span>
          <h2>Your new AI note taker</h2>
          <p>
            Capture insights from conversations on Zoom, in person, and across
            third-party platforms.
          </p>
          <Link href="/sign-up" className="landing-blue-button">
            Explore My Notes <ArrowRight size={17} />
          </Link>
        </div>

        <div className="landing-notes-art">
          <div className="landing-mountain mountain-back" />
          <div className="landing-mountain mountain-front" />
          <div className="landing-call-window">
            <div className="landing-call-person" />
            <div className="landing-call-person second" />
            <aside>
              <strong>My Notes</strong>
              <small>Take notes from your meeting</small>
              <label><span /> Use meeting transcript</label>
              <label><span /> Auto-start note for future meetings</label>
              <button>Start taking notes</button>
            </aside>
          </div>
        </div>
      </section>

      <section className="landing-platform landing-section">
        <div className="landing-centered-heading">
          <span className="landing-blue-label">ONE PLATFORM</span>
          <h2>One platform. Endless ways to work together.</h2>
        </div>

        <div className="landing-tabs">
          <button className="active">Collaboration</button>
          <button>Customer support</button>
          <button>Marketing</button>
          <button>Sales</button>
          <button>Employee engagement</button>
        </div>

        <div className="landing-platform-grid">
          <div className="landing-platform-copy">
            <ul>
              <li><strong>Support hybrid and remote work:</strong> Keep global teams engaged with reliable video, chat, documents, and more.</li>
              <li><strong>Seamless communication:</strong> Save time and cut costs with Meetings, Phone, Chat, and more.</li>
              <li><strong>Keep workflows moving:</strong> From brainstorms to documents, Zoom helps teams avoid stalls.</li>
              <li><strong>Do more with AI:</strong> Built-in AI helps summarize meetings and automate next steps.</li>
            </ul>
          </div>

          <div className="landing-platform-art">
            <div className="landing-ai-dashboard">
              <div className="landing-ai-dashboard-top">✦ ZoomMate is ready to help.</div>
              <div className="landing-ai-search">＋ Anything to complete?</div>
              <div className="landing-ai-chips">
                <span>Drive meeting</span>
                <span>Build slides</span>
                <span>Draft document</span>
                <span>Create image</span>
              </div>
              <div className="landing-ai-panel">
                <small>Agenda</small>
                <h4>Today&apos;s meetings and next steps</h4>
                <p>Prioritize projects and turn conversations into action.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-trusted">
        <h3>Trusted by millions. Built for you.</h3>
        <div className="landing-logo-row">
          <span>ExxonMobil</span>
          <span>Capital One</span>
          <span>The New York Times</span>
          <span>Walmart</span>
          <span>WARNER<br />ENTERPRISES</span>
        </div>
      </section>

      <section className="landing-business landing-section">
        <div className="landing-centered-heading">
          <span className="landing-blue-label">CUSTOMER STORIES</span>
          <h2>Businesses achieve more with Zoom</h2>
        </div>

        <div className="landing-business-grid">
          <article className="landing-business-main">
            <div className="landing-business-art">
              <div className="landing-baseball" />
            </div>
            <div className="landing-business-overlay">
              <small>Major League Baseball™ and Zoom</small>
              <h3>Expand the employee-fan experience</h3>
              <button>Read more</button>
            </div>
          </article>
          <article className="landing-business-side">
            <div className="landing-side-art side-person" />
            <div className="landing-side-art side-phone" />
            <div className="landing-side-art side-card" />
          </article>
        </div>
      </section>

      <section className="landing-news landing-section">
        <div className="landing-centered-heading">
          <span className="landing-blue-label">WHAT&apos;S NEW</span>
          <h2>Making news, making impact</h2>
        </div>

        <div className="landing-news-grid">
          {newsCards.map((card) => (
            <article className={`landing-news-card ${card.className}`} key={card.title}>
              <div className="landing-news-icon">↗</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-final-cta">
        <div>
          <span>ZOOM WORKPLACE</span>
          <h2>See what Zoom can do for your business</h2>
          <p>Connect your people, ideas, and workflows in one place.</p>
          <Link href="/sign-up" className="landing-dark-button">
            Get started today <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <div className="landing-footer-logo">zoom</div>
          <p>One platform to connect. Endless ways to work together.</p>
          <div className="landing-socials">
            <span>in</span><span>𝕏</span><span>▶</span><span>f</span><span>◎</span>
          </div>
        </div>

        <div className="landing-footer-column">
          <h4>About</h4>
          <a>Zoom Blog</a>
          <a>Customers</a>
          <a>Our Team</a>
          <a>Careers</a>
          <a>Integrations</a>
          <a>Press</a>
        </div>

        <div className="landing-footer-column">
          <h4>Download</h4>
          <a>Zoom Workplace App</a>
          <a>Zoom Rooms App</a>
          <a>Browser Extension</a>
          <a>iPhone/iPad App</a>
          <a>Android App</a>
        </div>

        <div className="landing-footer-column">
          <h4>Sales</h4>
          <a>Plans & Pricing</a>
          <a>Request a Demo</a>
          <a>Webinars and Events</a>
          <a>Zoom Experience Center</a>
          <a>Zoom for Startups</a>
        </div>

        <div className="landing-footer-column">
          <h4>Support</h4>
          <a>Test Zoom</a>
          <a>Account</a>
          <a>Support Center</a>
          <a>Learning Center</a>
          <a>Feedback</a>
          <a>Contact Us</a>
        </div>

        <div className="landing-footer-bottom">
          <span>© 2026 Zoom Clone. Built for the SDE Fullstack Assignment.</span>
          <span>Terms &nbsp; Privacy &nbsp; Security &nbsp; Accessibility</span>
        </div>
      </footer>
    </main>
  );
}
