import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

export default function CallToAction() {
    const navigate = useNavigate();
    const { isSignedIn } = useUser();

    return (
        <section style={{ background: "var(--bg)" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto", padding: "80px 24px" }}>
                <motion.div
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        textAlign: "center",
                        borderRadius: 18,
                        padding: "56px 32px",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.07), rgba(124,58,237,0.02))",
                    }}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45 }}
                >
                    {/* Animated border */}
                    <div
                        className="animate-gradient"
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 18,
                            pointerEvents: "none",
                            padding: 1,
                            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.08), rgba(124,58,237,0.3))",
                            backgroundSize: "200% 200%",
                            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            maskComposite: "xor",
                            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "xor",
                        }}
                    />

                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 300, height: 150, borderRadius: "50%", filter: "blur(80px)", background: "rgba(124,58,237,0.06)", pointerEvents: "none" }} />

                    <div style={{ position: "relative", zIndex: 10 }}>
                        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px, 2.5vw, 26px)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 10 }}>
                            Ready to Ace Your <span className="gradient-text-static">Interview</span>?
                        </h2>
                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto 24px" }}>
                            Join thousands of developers who've improved their interview skills with AI-powered practice.
                        </p>
                        <motion.button
                            onClick={() => navigate(isSignedIn ? "/setup" : "/login")}
                            className="btn-primary"
                            style={{ fontSize: 14, padding: "11px 28px", boxShadow: "0 4px 20px rgba(124,58,237,0.2)" }}
                            whileHover={{ scale: 1.03, boxShadow: "0 6px 24px rgba(124,58,237,0.3)" }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Start Free Interview →
                        </motion.button>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 10 }}>
                            No credit card required • Free forever
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
