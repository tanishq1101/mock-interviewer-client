import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
    { name: "Priya Sharma", role: "Frontend Dev, Google", quote: "The AI feedback identified gaps I didn't know I had. Incredibly detailed.", initials: "PS", color: "#7c3aed" },
    { name: "Rahul Mehta", role: "Full Stack, Microsoft", quote: "Felt like a real senior interviewer. Got an offer within two weeks!", initials: "RM", color: "#10b981" },
    { name: "Ananya Gupta", role: "SDE, Amazon", quote: "Scoring breakdown for communication and depth was incredibly helpful.", initials: "AG", color: "#f59e0b" },
    { name: "Vikram Singh", role: "Backend Eng, Stripe", quote: "Practiced for three days and nailed my system design round.", initials: "VS", color: "#3b82f6" },
    { name: "Neha Patel", role: "DevOps Eng, Netflix", quote: "Best mock interview tool I've used. Reports are genuinely actionable.", initials: "NP", color: "#ec4899" },
    { name: "Arjun Das", role: "ML Engineer, Meta", quote: "Questions adapted perfectly to my ML specialization. Highly recommended.", initials: "AD", color: "#06b6d4" },
];

export default function Testimonials() {
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);

    const advance = useCallback(() => {
        setIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, []);

    // Auto-rotate continuously every 3.5s
    useEffect(() => {
        if (paused) return;
        const timer = setInterval(advance, 3500);
        return () => clearInterval(timer);
    }, [paused, advance]);

    const visible = [0, 1, 2].map((offset) => ({
        ...TESTIMONIALS[(idx + offset) % TESTIMONIALS.length],
        key: `${idx}-${offset}`,
    }));

    return (
        <section id="testimonials" style={{ background: "var(--bg)" }}>
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
                        Testimonials
                    </span>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 10 }}>
                        Loved by <span className="gradient-text-static">Developers</span>
                    </h2>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 340, margin: "0 auto" }}>
                        See what engineers using our platform have to say.
                    </p>
                </motion.div>

                {/* Carousel */}
                <div
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, overflow: "hidden" }}>
                        <AnimatePresence mode="popLayout">
                            {visible.map((t) => (
                                <motion.div
                                    key={t.key}
                                    className="glass-card"
                                    style={{ padding: 20, display: "flex", flexDirection: "column" }}
                                    initial={{ opacity: 0, x: 50, scale: 0.96 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -50, scale: 0.96 }}
                                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                                    whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(124,58,237,0.05)" }}
                                >
                                    {/* Stars */}
                                    <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                                        {[...Array(5)].map((_, j) => (
                                            <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-secondary)", flex: 1, marginBottom: 14 }}>
                                        &ldquo;{t.quote}&rdquo;
                                    </p>

                                    {/* Author */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: "white",
                                            background: t.color,
                                            flexShrink: 0,
                                        }}>
                                            {t.initials}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{t.name}</p>
                                            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.3 }}>{t.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Dots */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 28 }}>
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                style={{
                                    border: "none",
                                    cursor: "pointer",
                                    borderRadius: 50,
                                    transition: "all 0.3s ease",
                                    width: i === idx ? 18 : 6,
                                    height: 6,
                                    background: i === idx ? "var(--color-primary)" : "var(--border)",
                                    padding: 0,
                                }}
                                aria-label={`Testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
