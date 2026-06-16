import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isSignedIn } = useUser();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    function scrollTo(href) {
        setMobileOpen(false);
        if (pathname !== "/") {
            sessionStorage.setItem("scrollToSection", href);
            navigate("/");
        } else {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    }

    return (
        <motion.nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                transition: "all 0.3s ease",
                backdropFilter: scrolled ? "blur(16px)" : "none",
                WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
                background: scrolled ? "rgba(15,23,42,0.85)" : "transparent",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent",
            }}
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
            <div
                className="px-4 sm:px-8 md:px-12 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]"
                style={{
                    maxWidth: 1280,
                    margin: "0 auto",
                    height: scrolled ? 54 : 60,
                    transition: "height 0.3s ease",
                }}
            >
                {/* Logo */}
                <button
                    onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/"); }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                    }}
                >
                    <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(124,58,237,0.1)",
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)", letterSpacing: "-0.01em" }}>
                        InterviewAI
                    </span>
                </button>

                {/* Desktop Nav Links — centered */}
                <div className="hidden md:flex items-center gap-1.5 justify-center">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => scrollTo(link.href)}
                            style={{
                                background: "none",
                                border: "none",
                                padding: "6px 14px",
                                fontSize: 13,
                                fontWeight: 500,
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                borderRadius: 8,
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => { e.target.style.color = "var(--text)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                            onMouseLeave={(e) => { e.target.style.color = "var(--text-muted)"; e.target.style.background = "none"; }}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2.5 justify-end">
                    <ThemeToggle />

                    {isSignedIn ? (
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="btn-secondary hidden sm:inline-flex"
                                style={{ fontSize: 13, padding: "8px 20px" }}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate("/setup")}
                                className="btn-primary hidden sm:inline-flex"
                                style={{ fontSize: 13, padding: "8px 20px" }}
                            >
                                Start Interview
                            </button>
                            <UserButton />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/login")}
                                className="hidden sm:block"
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    padding: "7px 14px",
                                    borderRadius: 8,
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => { e.target.style.color = "var(--text)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                                onMouseLeave={(e) => { e.target.style.color = "var(--text-muted)"; e.target.style.background = "none"; }}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => navigate("/login")}
                                className="btn-primary"
                                style={{ fontSize: 13, padding: "8px 20px" }}
                            >
                                Get Started
                            </button>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden flex flex-col gap-1 p-1.5 cursor-pointer bg-none border-none"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <span style={{ display: "block", width: 16, height: 2, borderRadius: 2, background: "var(--text)", transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translate(2px, 2px)" : "none" }} />
                        <span style={{ display: "block", width: 16, height: 2, borderRadius: 2, background: "var(--text)", transition: "all 0.3s", opacity: mobileOpen ? 0 : 1 }} />
                        <span style={{ display: "block", width: 16, height: 2, borderRadius: 2, background: "var(--text)", transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translate(2px, -2px)" : "none" }} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <motion.div
                    className="md:hidden"
                    style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                >
                    <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 2 }}>
                        {NAV_LINKS.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => scrollTo(link.href)}
                                style={{ background: "none", border: "none", padding: "8px 0", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}
                            >
                                {link.label}
                            </button>
                        ))}
                        {isSignedIn ? (
                            <>
                                <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 0" }} />
                                <button
                                    onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                                    style={{ background: "none", border: "none", padding: "8px 0", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => { setMobileOpen(false); navigate("/setup"); }}
                                    style={{ background: "none", border: "none", padding: "8px 0", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}
                                >
                                    Start Interview
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 0" }} />
                                <button
                                    onClick={() => { setMobileOpen(false); navigate("/login"); }}
                                    style={{ background: "none", border: "none", padding: "8px 0", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => { setMobileOpen(false); navigate("/login"); }}
                                    style={{ background: "none", border: "none", padding: "8px 0", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}
                                >
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
