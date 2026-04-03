import { useNavigate, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

export default function ReportPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { report, role, level, totalQuestions } = location.state || {};

    if (!report) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ padding: 32, textAlign: "center", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 8 }}>No Report Available</h2>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>Complete an interview to see your report.</p>
                    <button onClick={() => navigate("/setup")} className="btn-primary" style={{ padding: "10px 24px" }}>Start Interview</button>
                </div>
            </div>
        );
    }

    function getScoreColor(score) {
        if (score >= 8) return "#10b981";
        if (score >= 5) return "#f59e0b";
        return "#ef4444";
    }

    function getVerdictColor(verdict) {
        if (verdict?.includes("Recommended") && !verdict?.includes("Not")) return "#10b981";
        if (verdict?.includes("Not")) return "#ef4444";
        return "#f59e0b";
    }

    const scoreVal = report.overallScore || 0;
    const scorePercent = (scoreVal / 10) * 100;
    const ringColor = getScoreColor(scoreVal);
    const circumference = 2 * Math.PI * 52;
    const dashLen = (scorePercent / 100) * circumference;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
            {/* Background blobs */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: 40, right: 80, width: 300, height: 300, borderRadius: "50%", filter: "blur(120px)", background: "rgba(124,58,237,0.06)" }} />
                <div style={{ position: "absolute", bottom: 80, left: 60, width: 250, height: 250, borderRadius: "50%", filter: "blur(120px)", background: "rgba(16,185,129,0.04)" }} />
            </div>

            {/* Nav */}
            <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", maxWidth: 960, margin: "0 auto" }}>
                <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.12)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)" }}>InterviewAI</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </nav>

            {/* Main */}
            <main style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "0 32px 60px" }}>
                {/* Header */}
                <motion.div style={{ textAlign: "center", marginBottom: 32 }} {...fadeUp(0.05)}>
                    <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                        Interview <span className="gradient-text-static">Report</span>
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, color: "var(--text-secondary)" }}>
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>{role}</span>
                        <span style={{ color: "var(--text-muted)" }}>•</span>
                        <span>{level}</span>
                        <span style={{ color: "var(--text-muted)" }}>•</span>
                        <span>{totalQuestions} Questions</span>
                    </div>
                </motion.div>

                {/* Score + Verdict Row */}
                <motion.div
                    style={{
                        display: "grid", gridTemplateColumns: "220px 1fr", gap: 24,
                        marginBottom: 24,
                    }}
                    {...fadeUp(0.1)}
                >
                    {/* Score Ring */}
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "28px 16px", borderRadius: 16,
                        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                    }}>
                        <div style={{ position: "relative", width: 120, height: 120, marginBottom: 8 }}>
                            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-subtle)" strokeWidth="7" />
                                <circle
                                    cx="60" cy="60" r="52" fill="none"
                                    stroke={ringColor} strokeWidth="7" strokeLinecap="round"
                                    strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                                    style={{ transition: "stroke-dasharray 1.2s ease-out" }}
                                />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-heading)", color: ringColor, lineHeight: 1 }}>
                                    {scoreVal}
                                </span>
                                <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>out of 10</span>
                            </div>
                        </div>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Overall Score</span>
                    </div>

                    {/* Verdict + Summary */}
                    <div style={{
                        display: "flex", flexDirection: "column", justifyContent: "center",
                        padding: "24px 28px", borderRadius: 16,
                        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                    }}>
                        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 6 }}>Verdict</span>
                        <h2 style={{
                            fontSize: 24, fontWeight: 700, fontFamily: "var(--font-heading)",
                            color: getVerdictColor(report.verdict), marginBottom: 12, lineHeight: 1.2,
                        }}>
                            {report.verdict}
                        </h2>
                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
                            {report.summary}
                        </p>
                    </div>
                </motion.div>

                {/* Strengths + Improvements */}
                <motion.div
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}
                    {...fadeUp(0.2)}
                >
                    {/* Strengths */}
                    <div style={{ padding: "20px 24px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,0.12)" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#10b981", fontFamily: "var(--font-heading)" }}>Strengths</h3>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {report.strengths?.map((s, i) => (
                                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                                    <span style={{ color: "#10b981", flexShrink: 0, marginTop: 1 }}>✓</span>
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Improvements */}
                    <div style={{ padding: "20px 24px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,158,11,0.12)" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f59e0b", fontFamily: "var(--font-heading)" }}>Areas to Improve</h3>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {report.improvements?.map((s, i) => (
                                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                                    <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }}>→</span>
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Question Breakdown */}
                <motion.div
                    style={{ padding: "24px 28px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", marginBottom: 24 }}
                    {...fadeUp(0.3)}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.12)" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)" }}>Question Breakdown</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {report.questionBreakdown?.map((q, i) => {
                            const qColor = getScoreColor(q.score);
                            return (
                                <div key={i} style={{
                                    padding: "16px 20px", borderRadius: 12,
                                    background: `${qColor}08`,
                                    border: `1px solid ${qColor}18`,
                                }}>
                                    {/* Question row */}
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 8 }}>
                                        <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--text)", lineHeight: 1.55, flex: 1 }}>
                                            <span style={{ color: "var(--text-muted)", fontWeight: 600, marginRight: 6 }}>Q{i + 1}</span>
                                            {q.question}
                                        </p>
                                        <span style={{
                                            fontSize: 14, fontWeight: 700, flexShrink: 0,
                                            padding: "3px 10px", borderRadius: 6,
                                            background: `${qColor}15`, color: qColor,
                                        }}>
                                            {q.score}/10
                                        </span>
                                    </div>
                                    {/* Feedback */}
                                    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-secondary)", paddingLeft: 28 }}>
                                        {q.feedback}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Recommendations */}
                {report.recommendations && (
                    <motion.div
                        style={{
                            padding: "20px 24px", borderRadius: 16, marginBottom: 32,
                            background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)",
                        }}
                        {...fadeUp(0.35)}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.12)" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)" }}>Recommendations</h3>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>{report.recommendations}</p>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }} {...fadeUp(0.4)}>
                    <motion.button
                        onClick={() => navigate("/setup")}
                        className="btn-primary"
                        style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        New Interview
                    </motion.button>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            padding: "12px 28px", fontSize: 14, fontWeight: 500, borderRadius: 10,
                            border: "1px solid var(--border-subtle)", background: "transparent",
                            color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = "rgba(124,58,237,0.3)"; e.target.style.color = "var(--text)"; }}
                        onMouseLeave={e => { e.target.style.borderColor = "var(--border-subtle)"; e.target.style.color = "var(--text-secondary)"; }}
                    >
                        Back to Home
                    </button>
                </motion.div>
            </main>
        </div>
    );
}
