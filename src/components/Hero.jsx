import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const TYPING_STRINGS = [
    "Tell me about your experience with React hooks...",
    "How would you design a microservices architecture?",
    "Explain the difference between SQL and NoSQL...",
    "What is your approach to writing clean code?",
    "Describe a challenging bug you've solved recently...",
];

export default function Hero() {
    const navigate = useNavigate();
    const { isSignedIn } = useUser();
    const [typedText, setTypedText] = useState("");
    const stringIndexRef = useRef(0);
    const charIndexRef = useRef(0);
    const isDeletingRef = useRef(false);

    useEffect(() => {
        let timeout;
        function tick() {
            const current = TYPING_STRINGS[stringIndexRef.current];
            if (!isDeletingRef.current && charIndexRef.current < current.length) {
                charIndexRef.current += 1;
                setTypedText(current.substring(0, charIndexRef.current));
                timeout = setTimeout(tick, 38);
            } else if (!isDeletingRef.current && charIndexRef.current === current.length) {
                timeout = setTimeout(() => { isDeletingRef.current = true; tick(); }, 2200);
            } else if (isDeletingRef.current && charIndexRef.current > 0) {
                charIndexRef.current -= 1;
                setTypedText(current.substring(0, charIndexRef.current));
                timeout = setTimeout(tick, 22);
            } else if (isDeletingRef.current && charIndexRef.current === 0) {
                isDeletingRef.current = false;
                stringIndexRef.current = (stringIndexRef.current + 1) % TYPING_STRINGS.length;
                timeout = setTimeout(tick, 100);
            }
        }
        tick();
        return () => clearTimeout(timeout);
    }, []);

    const container = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
    };
    const fadeUp = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
    };

    return (
        <section style={{ position: "relative", overflow: "hidden", paddingTop: 140, paddingBottom: 80, background: "var(--bg)" }}>
            {/* Background blobs */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                <motion.div
                    style={{ position: "absolute", top: -20, left: -100, width: 400, height: 400, borderRadius: "50%", filter: "blur(120px)", background: "rgba(124,58,237,0.05)" }}
                    animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    style={{ position: "absolute", top: 150, right: -100, width: 350, height: 350, borderRadius: "50%", filter: "blur(120px)", background: "rgba(124,58,237,0.03)" }}
                    animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <motion.div
                style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 720, margin: "0 auto", padding: "0 32px" }}
                variants={container}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        borderRadius: 50,
                        padding: "6px 16px",
                        fontSize: 12,
                        fontWeight: 500,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.5)" }} />
                        AI-Powered Interview Platform
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={fadeUp}
                    style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "clamp(34px, 5vw, 52px)",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                        color: "var(--text)",
                        marginBottom: 16,
                    }}
                >
                    Ace Your Next{" "}
                    <span className="gradient-text">Tech Interview</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={fadeUp}
                    style={{
                        fontSize: 17,
                        lineHeight: 1.7,
                        color: "var(--text-secondary)",
                        maxWidth: 540,
                        margin: "0 auto 32px",
                    }}
                >
                    Practice with an AI interviewer that adapts to your skill level.
                    Get real-time scoring, detailed evaluations, and actionable insights.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
                    <button
                        onClick={() => navigate(isSignedIn ? "/setup" : "/login")}
                        className="btn-primary animate-pulse-glow"
                        style={{ fontSize: 15, padding: "13px 30px" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Start Free Interview
                    </button>
                    <button
                        className="btn-secondary"
                        style={{ fontSize: 15, padding: "13px 30px" }}
                        onClick={() => {
                            const el = document.querySelector("#how-it-works");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10 8 16 12 10 16 10 8" />
                        </svg>
                        See How It Works
                    </button>
                </motion.div>

                {/* AI Typing Preview */}
                <motion.div variants={fadeUp} style={{ maxWidth: 560, margin: "0 auto" }}>
                    <div className="glass-card" style={{ textAlign: "left", padding: "18px 24px", borderRadius: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(124,58,237,0.1)",
                            }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                </svg>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary-light)", fontFamily: "var(--font-heading)" }}>
                                AI Interviewer
                            </span>
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text)", minHeight: "1.3em" }}>
                            {typedText}
                            <span className="typing-cursor" style={{ display: "inline-block", verticalAlign: "text-bottom", width: 2, height: 14, marginLeft: 2, background: "var(--color-primary)" }} />
                        </p>
                    </div>
                </motion.div>

                {/* Score badges */}
                <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
                    {[
                        { label: "Technical", score: "8.5", color: "#10b981" },
                        { label: "Communication", score: "9.0", color: "#7c3aed" },
                        { label: "Depth", score: "7.5", color: "#f59e0b" },
                        { label: "Confidence", score: "8.0", color: "#3b82f6" },
                    ].map((b) => (
                        <div
                            key={b.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                borderRadius: 8,
                                padding: "6px 14px",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-subtle)",
                            }}
                        >
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: b.color }} />
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.score}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
