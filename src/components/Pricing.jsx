import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSubscription, simulateUpgrade } from "../services/api";

const cardAnim = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } }),
};

export default function Pricing() {
    const navigate = useNavigate();
    const { user, isSignedIn } = useUser();
    const [billingPeriod, setBillingPeriod] = useState("monthly"); // "monthly" or "quarterly"
    const [subStatus, setSubStatus] = useState(null);
    const [loadingSub, setLoadingSub] = useState(false);
    const [simulateMsg, setSimulateMsg] = useState("");

    // Fetch subscription on mount or auth change
    useEffect(() => {
        if (isSignedIn && user?.id) {
            fetchSubscription();
        }
    }, [isSignedIn, user?.id]);

    async function fetchSubscription() {
        try {
            const data = await getSubscription(user.id);
            setSubStatus(data);
        } catch (err) {
            console.error("Failed to load subscription status:", err);
        }
    }

    async function handleSimulate(plan, period) {
        if (!user?.id) return;
        setLoadingSub(true);
        setSimulateMsg("");
        try {
            const res = await simulateUpgrade(plan, period, user.id);
            setSubStatus(res);
            setSimulateMsg(`Success! Subscription plan set to ${plan.toUpperCase()}`);
            setTimeout(() => setSimulateMsg(""), 3000);
        } catch (err) {
            console.error("Simulation failed:", err);
            setSimulateMsg("Upgrade simulation failed.");
        } finally {
            setLoadingSub(false);
        }
    }

    const PLANS = [
        {
            name: "Free Plan",
            price: "₹0",
            period: "forever",
            desc: "Kickstart your technical coding and behavioral interview prep.",
            features: [
                "Up to 10 full mock interviews",
                "Groq-powered instant evaluation",
                "Detailed dashboard reports",
                "Multiple tech stack choices",
                "Standard difficulty scaling"
            ],
            cta: "Start Free",
            highlighted: false,
            action: () => navigate(isSignedIn ? "/setup" : "/login")
        },
        {
            name: "Pro Plan",
            price: billingPeriod === "monthly" ? "₹499" : "₹1,000",
            period: billingPeriod === "monthly" ? "/month" : "/quarter",
            desc: "Comprehensive resources for serious job seekers and developers.",
            badge: "Most Popular",
            features: [
                "Unlimited mock interviews",
                "Everything in Free Plan",
                "Upload resumes for personalized Q&A",
                "Advanced role-specific simulation",
                "Session history persistence",
                "Exportable PDF report cards"
            ],
            cta: "Subscribe Pro",
            highlighted: true,
            action: () => {
                if (!isSignedIn) {
                    navigate("/login");
                    return;
                }
                const checkoutUrl = billingPeriod === "monthly"
                    ? `https://buy.stripe.com/test_3cI6oJbA897I7Hg0pQ1VK00?client_reference_id=${user.id}`
                    : `https://buy.stripe.com/test_cNi6oJ47GabMgdM3C21VK01?client_reference_id=${user.id}`;
                window.location.href = checkoutUrl;
            }
        },
        {
            name: "Pro Max Plan",
            price: billingPeriod === "monthly" ? "₹899" : "₹2,200",
            period: billingPeriod === "monthly" ? "/month" : "/quarter",
            desc: "Advanced AI features to simulate elite FAANG loops.",
            features: [
                "Everything in Pro Plan",
                "AI Behavioral Coaching Mode",
                "Voice interviews with speech feedback",
                "Practice sessions flow metrics",
                "Custom mock interviewer panels",
                "Priority support response"
            ],
            cta: "Subscribe Pro Max",
            highlighted: false,
            action: () => {
                if (!isSignedIn) {
                    navigate("/login");
                    return;
                }
                const checkoutUrl = billingPeriod === "monthly"
                    ? `https://buy.stripe.com/test_fZu6oJ33Ces22mWfkK1VK02?client_reference_id=${user.id}`
                    : `https://buy.stripe.com/test_cNi3cx9s0fw61iSb4u1VK03?client_reference_id=${user.id}`;
                window.location.href = checkoutUrl;
            }
        }
    ];

    return (
        <section id="pricing" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-subtle)", position: "relative" }}>
            <div className="py-12 md:py-20 px-4 sm:px-6" style={{ maxWidth: 1060, margin: "0 auto" }}>
                {/* Header */}
                <motion.div
                    style={{ textAlign: "center", marginBottom: 30 }}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45 }}
                >
                    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 10 }}>
                        Flexible Pricing
                    </span>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 12 }}>
                        Pricing Plans Tailored in <span className="gradient-text-static">INR (₹)</span>
                    </h2>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 460, margin: "0 auto 20px" }}>
                        Choose the right tier to fit your preparation goals. Save up to 33% by selecting a quarterly cycle.
                    </p>

                    {/* Toggle Switch */}
                    <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bg)", padding: 4, borderRadius: 50, border: "1px solid var(--border-subtle)" }}>
                        <button
                            type="button"
                            onClick={() => setBillingPeriod("monthly")}
                            style={{
                                border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                padding: "8px 20px", borderRadius: 50,
                                background: billingPeriod === "monthly" ? "#7c3aed" : "transparent",
                                color: billingPeriod === "monthly" ? "white" : "var(--text-muted)",
                                transition: "all 0.2s ease"
                            }}
                        >
                            Billed Monthly
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingPeriod("quarterly")}
                            style={{
                                border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                padding: "8px 20px", borderRadius: 50,
                                background: billingPeriod === "quarterly" ? "#7c3aed" : "transparent",
                                color: billingPeriod === "quarterly" ? "white" : "var(--text-muted)",
                                transition: "all 0.2s ease",
                                display: "flex", alignItems: "center", gap: 6
                            }}
                        >
                            Billed Quarterly
                            <span style={{ fontSize: 9, background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "1px 6px", borderRadius: 4 }}>Save 33%</span>
                        </button>
                    </div>
                </motion.div>

                {/* Cards Container */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(265px, 100%), 1fr))", gap: 20, maxWidth: 960, margin: "0 auto 40px" }}>
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            style={{
                                position: "relative",
                                borderRadius: 18,
                                padding: 30,
                                border: plan.highlighted ? "2px solid #7c3aed" : "1px solid var(--border-subtle)",
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
                                y: -4,
                                boxShadow: plan.highlighted ? "0 8px 32px rgba(124,58,237,0.12)" : "0 4px 20px rgba(0,0,0,0.06)",
                            }}
                            transition={{ duration: 0.25 }}
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

                            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 750, color: "var(--text)", marginBottom: 6 }}>
                                {plan.name}
                            </h3>
                            
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                                <span style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>{plan.price}</span>
                                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{plan.period}</span>
                            </div>
                            
                            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 20, minHeight: 40 }}>{plan.desc}</p>

                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, borderTop: "1px solid var(--border-subtle)", paddingTop: 18 }}>
                                {plan.features.map((f) => (
                                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={plan.action}
                                className={plan.highlighted ? "btn-primary" : "btn-secondary"}
                                style={{
                                    width: "100%",
                                    fontSize: 13,
                                    padding: "10px 0",
                                    cursor: "pointer",
                                    borderRadius: 10
                                }}
                            >
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Developer Sandbox Panel */}
                <AnimatePresence>
                    {isSignedIn && subStatus && (
                        <motion.div
                            style={{
                                maxWidth: 680, margin: "20px auto 0",
                                padding: 24, borderRadius: 16,
                                background: "rgba(124, 58, 237, 0.05)",
                                border: "1px dashed rgba(124, 58, 237, 0.25)"
                            }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "var(--text)", marginBottom: 8 }}>
                                🛠️ Developer Sandbox Billing Center
                            </h3>
                            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 16 }}>
                                You are signed in. This sandbox panel allows you to bypass the Stripe checkout process for testing. Set your user subscription state directly in the Neon database:
                            </p>

                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: "var(--text)", background: "var(--bg)", border: "1px solid var(--border-subtle)", padding: "6px 14px", borderRadius: 8 }}>
                                    Current Plan: <strong style={{ color: "#a78bfa" }}>{subStatus.plan?.toUpperCase()}</strong> ({subStatus.interviewCount} / {subStatus.limit === Infinity ? "∞" : subStatus.limit} sessions practiced)
                                </div>
                                <button
                                    onClick={() => handleSimulate("pro", "monthly")}
                                    disabled={loadingSub}
                                    className="btn-primary"
                                    style={{ fontSize: 11.5, padding: "6px 14px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
                                >
                                    Simulate Pro Upgrade
                                </button>
                                <button
                                    onClick={() => handleSimulate("promax", "monthly")}
                                    disabled={loadingSub}
                                    className="btn-primary"
                                    style={{ fontSize: 11.5, padding: "6px 14px", borderRadius: 8, background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}
                                >
                                    Simulate Pro Max Upgrade
                                </button>
                                <button
                                    onClick={() => handleSimulate("free", null)}
                                    disabled={loadingSub}
                                    className="btn-secondary"
                                    style={{ fontSize: 11.5, padding: "6px 14px", borderRadius: 8 }}
                                >
                                    Reset to Free
                                </button>
                            </div>

                            {simulateMsg && (
                                <motion.p
                                    style={{ fontSize: 11, fontWeight: 600, color: simulateMsg.includes("Success") ? "#34d399" : "#f87171" }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {simulateMsg}
                                </motion.p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
