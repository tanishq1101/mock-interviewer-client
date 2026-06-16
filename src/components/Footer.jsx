import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const FOOTER_LINKS = {
    Product: [
        { label: "Features", href: "#features", desc: "What InterviewAI offers" },
        { label: "How It Works", href: "#how-it-works", desc: "Step-by-step process" },
        { label: "Pricing", href: "#pricing", desc: "Plans & free tier" },
        { label: "Testimonials", href: "#testimonials", desc: "What users say" },
    ],
    Resources: [
        { label: "Interview Tips", href: "/interview-tips", desc: "Proven strategies to ace interviews" },
        { label: "Tech Stack Guide", href: "/tech-stack-guide", desc: "Technologies & what to study" },
        { label: "Blog", href: "/blog", desc: "Insights on AI & careers" },
        { label: "FAQ", href: "/faq", desc: "Common questions answered" },
    ],
    Company: [
        { label: "About", href: "/about", desc: "Our mission & story" },
        { label: "Contact", href: "/contact", desc: "Get in touch with us" },
        { label: "Privacy Policy", href: "/privacy-policy", desc: "How we handle your data" },
        { label: "Terms of Service", href: "/terms-of-service", desc: "Usage rules & legal" },
    ],
};

const SOCIALS = [
    {
        label: "Twitter / X",
        href: "#",
        path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
    },
    {
        label: "GitHub",
        href: "#",
        path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
    },
    {
        label: "LinkedIn",
        href: "#",
        path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
    },
];

const STATS = [
    { value: "10K+", label: "Interviews Conducted" },
    { value: "94%", label: "User Satisfaction" },
    { value: "Free", label: "Forever Tier" },
];

export default function Footer() {
    const navigate = useNavigate();

    function handleClick(href) {
        if (href.startsWith("/")) {
            navigate(href);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (href.startsWith("#") && href.length > 1) {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    }

    return (
        <footer className="footer">
            {/* Subtle top gradient line */}
            <div className="footer-top-line" />

            <div className="footer-container">
                {/* Stats bar */}
                <div className="footer-stats">
                    {STATS.map((s) => (
                        <div key={s.label} className="footer-stat-item">
                            <span className="footer-stat-value">{s.value}</span>
                            <span className="footer-stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="footer-grid">
                    {/* ── Brand Column ── */}
                    <div className="footer-brand-col">
                        <button
                            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/"); }}
                            className="footer-brand-btn"
                            aria-label="Go to homepage"
                        >
                            <div className="footer-logo-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="footer-brand-name">InterviewAI</span>
                        </button>

                        <p className="footer-brand-desc">
                            AI-powered mock interview platform to help you{" "}
                            <strong>prepare</strong>, <strong>practice</strong>, and{" "}
                            <strong>perform better</strong> — completely free.
                        </p>

                        <div className="footer-badge-row">
                            <span className="footer-badge">🤖 Powered by Groq AI</span>
                            <span className="footer-badge">⚡ LLaMA 3.3 70B</span>
                        </div>

                        {/* Socials */}
                        <div className="footer-socials">
                            {SOCIALS.map((s) => (
                                <motion.a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="social-icon"
                                    title={s.label}
                                    whileHover={{ y: -3, scale: 1.08 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={s.path} />
                                    </svg>
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* ── Link Columns ── */}
                    {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                        <div key={title} className="footer-link-col">
                            <h4 className="footer-col-heading">{title}</h4>
                            <ul className="footer-link-list">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            onClick={() => handleClick(link.href)}
                                            className="footer-link-btn"
                                            title={link.desc}
                                        >
                                            <span className="footer-link-arrow">›</span>
                                            <span className="footer-link-text">
                                                {link.label}
                                                <span className="footer-link-desc">{link.desc}</span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* ── Bottom Bar ── */}
                <div className="footer-bottom">
                    <div className="footer-bottom-left">
                        <p className="footer-copyright">© 2026 InterviewAI. All rights reserved.</p>
                        <p className="footer-built-with">
                            Built with{" "}
                            <span className="footer-heart" aria-label="love">♥</span>{" "}
                            using <strong>React</strong>, <strong>Groq AI</strong> &amp; <strong>Tailwind CSS</strong>
                        </p>
                    </div>
                    <div className="footer-bottom-links">
                        <button onClick={() => handleClick("/privacy-policy")} className="footer-bottom-link">Privacy</button>
                        <span className="footer-bottom-sep">·</span>
                        <button onClick={() => handleClick("/terms-of-service")} className="footer-bottom-link">Terms</button>
                        <span className="footer-bottom-sep">·</span>
                        <button onClick={() => handleClick("/contact")} className="footer-bottom-link">Contact</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
