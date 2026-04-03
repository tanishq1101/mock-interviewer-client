import { motion } from "framer-motion";

const STEPS = [
    {
        number: "01",
        title: "Set Up Your Profile",
        desc: "Choose your target role, experience level, and preferred tech stack.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        ),
    },
    {
        number: "02",
        title: "Interview with AI",
        desc: "Answer questions in a chat interface with instant evaluation and follow-ups.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        number: "03",
        title: "Get Your Report",
        desc: "Receive a comprehensive report with scores and improvement tips.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
    },
];

const stepAnim = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] } }),
};

export default function HowItWorks() {
    return (
        <section id="how-it-works" style={{ background: "var(--bg-card)" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto", padding: "80px 24px" }}>
                {/* Header */}
                <motion.div
                    style={{ textAlign: "center", marginBottom: 52 }}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45 }}
                >
                    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 10 }}>
                        How It Works
                    </span>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 10 }}>
                        Three Simple <span className="gradient-text-static">Steps</span>
                    </h2>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 340, margin: "0 auto" }}>
                        From setup to results in minutes. No complicated onboarding.
                    </p>
                </motion.div>

                {/* Steps grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, position: "relative" }}>
                    {/* Connecting line */}
                    <motion.div
                        className="hidden md:block"
                        style={{
                            position: "absolute",
                            height: 2,
                            top: 36,
                            left: "20%",
                            right: "20%",
                            background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.12), transparent)",
                        }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    />

                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.number}
                            style={{ position: "relative", textAlign: "center" }}
                            custom={i}
                            variants={stepAnim}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }}
                        >
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                                <motion.div
                                    style={{
                                        position: "relative",
                                        width: 72,
                                        height: 72,
                                        borderRadius: 16,
                                        background: "rgba(124,58,237,0.06)",
                                        border: "1px solid rgba(124,58,237,0.1)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                                    whileHover={{ scale: 1.05, borderColor: "rgba(124,58,237,0.25)" }}
                                >
                                    {step.icon}
                                    <span style={{
                                        position: "absolute",
                                        top: -8,
                                        right: -8,
                                        width: 22,
                                        height: 22,
                                        borderRadius: "50%",
                                        background: "#7c3aed",
                                        color: "white",
                                        fontSize: 9,
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontFamily: "var(--font-heading)",
                                    }}>
                                        {step.number}
                                    </span>
                                </motion.div>
                            </div>
                            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                                {step.title}
                            </h3>
                            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 220, margin: "0 auto" }}>
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
