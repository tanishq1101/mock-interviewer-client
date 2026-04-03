import { motion } from "framer-motion";

const FEATURES = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        title: "Personalized Questions",
        desc: "AI adapts questions to your role, level, and tech stack for a realistic interview.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        title: "Real-time Feedback",
        desc: "Get instant evaluation and scoring on every answer you provide.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        title: "Detailed Reports",
        desc: "Comprehensive breakdown with scores, strengths, and actionable improvement tips.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
        title: "Adaptive Difficulty",
        desc: "Follow-up questions adjust based on your performance in real time.",
    },
];

const cardAnim = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] } }),
};

export default function Features() {
    return (
        <section id="features" style={{ background: "var(--bg)" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto", padding: "80px 24px" }}>
                {/* Section Header */}
                <motion.div
                    style={{ textAlign: "center", marginBottom: 48 }}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45 }}
                >
                    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 10 }}>
                        Features
                    </span>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 10 }}>
                        Everything You Need to <span className="gradient-text-static">Succeed</span>
                    </h2>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto" }}>
                        Our AI platform provides a complete technical interview preparation experience.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            className="glass-card"
                            style={{ padding: 22, cursor: "default" }}
                            custom={i}
                            variants={cardAnim}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }}
                            whileHover={{ y: -3, borderColor: "rgba(124,58,237,0.2)", boxShadow: "0 4px 20px rgba(124,58,237,0.05)" }}
                            transition={{ duration: 0.2 }}
                        >
                            <div style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: "rgba(124,58,237,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 14,
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-secondary)" }}>
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
