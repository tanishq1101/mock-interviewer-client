import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const FOOTER_LINKS = {
    Product: [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
        { label: "Testimonials", href: "#testimonials" },
    ],
    Resources: [
        { label: "Interview Tips", href: "/info/interview-tips" },
        { label: "Tech Stack Guide", href: "/info/tech-stack-guide" },
        { label: "Blog", href: "/info/blog" },
        { label: "FAQ", href: "/info/faq" },
    ],
    Company: [
        { label: "About", href: "/info/about" },
        { label: "Contact", href: "/info/contact" },
        { label: "Privacy Policy", href: "/info/privacy-policy" },
        { label: "Terms of Service", href: "/info/terms-of-service" },
    ],
};

const SOCIALS = [
    { label: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
    { label: "GitHub", path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
    { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" },
];

export default function Footer() {
    const navigate = useNavigate();

    function handleClick(href) {
        if (href.startsWith("/")) {
            navigate(href);
            window.scrollTo({ top: 0 });
        } else if (href.startsWith("#") && href.length > 1) {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    }

    return (
        <footer style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto", padding: "48px 24px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32 }}>
                    {/* Brand */}
                    <div>
                        <button
                            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/"); }}
                            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}
                        >
                            <div style={{
                                width: 26,
                                height: 26,
                                borderRadius: 7,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(124,58,237,0.1)",
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)", letterSpacing: "-0.01em" }}>
                                InterviewAI
                            </span>
                        </button>
                        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 230, marginBottom: 16 }}>
                            AI-powered mock interview platform to help you prepare, practice, and perform better.
                        </p>
                        <div style={{ display: "flex", gap: 6 }}>
                            {SOCIALS.map((s) => (
                                <motion.a
                                    key={s.label}
                                    href="#"
                                    aria-label={s.label}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "var(--bg)",
                                        border: "1px solid var(--border-subtle)",
                                    }}
                                    whileHover={{ y: -2, borderColor: "rgba(124,58,237,0.2)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={s.path} />
                                    </svg>
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                        <div key={title}>
                            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text)", marginBottom: 14 }}>
                                {title}
                            </h4>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            onClick={() => handleClick(link.href)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                fontSize: 12,
                                                color: "var(--text-muted)",
                                                cursor: "pointer",
                                                padding: 0,
                                                transition: "color 0.2s ease",
                                            }}
                                            onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
                                            onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{
                    marginTop: 36,
                    paddingTop: 18,
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    flexWrap: "wrap",
                    gap: 8,
                }}>
                    <p>© 2026 InterviewAI. All rights reserved.</p>
                    <p>Built with ♥ using React, Gemini AI & Tailwind CSS</p>
                </div>
            </div>
        </footer>
    );
}
