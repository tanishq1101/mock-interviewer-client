import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const PLANS = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        desc: "Perfect for getting started with AI interview practice.",
        features: ["Unlimited mock interviews", "Real-time AI evaluation", "Detailed performance reports", "Multiple tech stacks", "Adaptive difficulty"],
        cta: "Start Free",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$19",
        period: "/month",
        desc: "Advanced features for serious interview preparation.",
        badge: "Most Popular",
        features: ["Everything in Free", "Resume-based questions", "Company-specific modes", "Voice interview mode", "Priority AI processing", "Session history & analytics", "Exportable PDF reports"],
        cta: "Join Waitlist",
        highlighted: true,
    },
];

const cardAnim = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } }),
};

export default function Pricing() {
    const navigate = useNavigate();
    const { isSignedIn } = useUser();

    return (
        <section id="pricing" style={{ background: "var(--bg-card)" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto", padding: "80px 24px" }}>
                {/* Header */}
                <motion.div
                    style={{ textAlign: "center", marginBottom: 40 }}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45 }}
                >
                    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 10 }}>
                        Pricing
                    </span>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 10 }}>
                        Simple, <span className="gradient-text-static">Transparent</span> Pricing
                    </h2>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 340, margin: "0 auto" }}>
                        Start practicing for free. Upgrade when you're ready.
                    </p>
                </motion.div>

                {/* Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 580, margin: "0 auto" }}>
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            style={{
                                position: "relative",
                                borderRadius: 16,
                                padding: 26,
                                border: plan.highlighted ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.05)",
                                background: plan.highlighted
                                    ? "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(124,58,237,0.02))"
                                    : "var(--bg)",
                            }}
                            custom={i}
                            variants={cardAnim}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }}
                            whileHover={{
                                y: -3,
                                boxShadow: plan.highlighted ? "0 8px 32px rgba(124,58,237,0.1)" : "0 4px 20px rgba(0,0,0,0.05)",
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            {plan.badge && (
                                <span style={{
                                    position: "absolute",
                                    top: -10,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    padding: "4px 14px",
                                    borderRadius: 50,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "white",
                                    background: "#7c3aed",
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
                                }}>
                                    {plan.badge}
                                </span>
                            )}

                            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                                {plan.name}
                            </h3>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                                <span style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>{plan.price}</span>
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{plan.period}</span>
                            </div>
                            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 18 }}>{plan.desc}</p>

                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                                {plan.features.map((f) => (
                                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: "var(--text-secondary)" }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => { if (!plan.highlighted) navigate(isSignedIn ? "/setup" : "/login"); }}
                                className={plan.highlighted ? "btn-secondary" : "btn-primary"}
                                style={{
                                    width: "100%",
                                    fontSize: 12.5,
                                    padding: "9px 0",
                                    opacity: plan.highlighted ? 0.7 : 1,
                                    cursor: plan.highlighted ? "default" : "pointer",
                                }}
                            >
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Resume teaser */}
                <motion.div
                    style={{ textAlign: "center", marginTop: 28 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                >
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 16px",
                        borderRadius: 10,
                        background: "var(--bg)",
                        border: "1px solid var(--border-subtle)",
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                            <strong style={{ color: "var(--text)" }}>Resume Upload</strong> — AI questions from your resume
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(124,58,237,0.1)", color: "#a78bfa" }}>COMING SOON</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
