import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { getInterviews, getInterview, deleteInterview } from "../services/api";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: "easeOut" },
});

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        loadInterviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    async function loadInterviews() {
        setLoading(true);
        try {
            const data = await getInterviews(user.id);
            setInterviews(data.interviews || []);
        } catch (err) {
            console.error("Failed to load interviews:", err);
        }
        setLoading(false);
    }

    async function handleViewDetail(id) {
        if (!user?.id) return;
        setSelectedId(id);
        setDetailLoading(true);
        try {
            const data = await getInterview(id, user.id);
            setSelectedDetail(data);
        } catch (err) {
            console.error("Failed to load detail:", err);
        }
        setDetailLoading(false);
    }

    async function handleDelete(id) {
        if (!user?.id) return;
        try {
            await deleteInterview(id, user.id);
            setInterviews((prev) => prev.filter((i) => i.id !== id));
            if (selectedId === id) {
                setSelectedId(null);
                setSelectedDetail(null);
            }
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    }

    function getScoreColor(score) {
        if (score >= 8) return "#10b981";
        if (score >= 5) return "#f59e0b";
        return "#ef4444";
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            {/* Background blobs */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: 40, right: 80, width: 300, height: 300, borderRadius: "50%", filter: "blur(120px)", background: "rgba(124,58,237,0.05)" }} />
                <div style={{ position: "absolute", bottom: 80, left: 60, width: 250, height: 250, borderRadius: "50%", filter: "blur(120px)", background: "rgba(16,185,129,0.03)" }} />
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
                <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }} {...fadeUp(0.05)}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                            Your <span className="gradient-text-static">Interviews</span>
                        </h1>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                            {interviews.length} interview{interviews.length !== 1 ? "s" : ""} completed
                        </p>
                    </div>
                    <motion.button
                        onClick={() => navigate("/setup")}
                        className="btn-primary"
                        style={{ padding: "10px 22px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Interview
                    </motion.button>
                </motion.div>

                {/* Loading */}
                {loading && (
                    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                        <div style={{ width: 36, height: 36, border: "3px solid rgba(124,58,237,0.2)", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    </div>
                )}

                {/* Empty state */}
                {!loading && interviews.length === 0 && (
                    <motion.div style={{ textAlign: "center", padding: "60px 20px" }} {...fadeUp(0.1)}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.08)", margin: "0 auto 16px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 8 }}>No interviews yet</h3>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>Start your first AI mock interview to see results here.</p>
                        <button onClick={() => navigate("/setup")} className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>Start Interview</button>
                    </motion.div>
                )}

                {/* Interview List */}
                {!loading && interviews.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <AnimatePresence>
                            {interviews.map((interview, i) => (
                                <motion.div
                                    key={interview.id}
                                    style={{
                                        padding: "18px 22px", borderRadius: 14,
                                        background: "var(--bg-card)", border: `1px solid ${selectedId === interview.id ? "rgba(124,58,237,0.3)" : "var(--border-subtle)"}`,
                                        cursor: "pointer", transition: "all 0.2s",
                                    }}
                                    onClick={() => handleViewDetail(interview.id)}
                                    {...fadeUp(0.05 + i * 0.03)}
                                    whileHover={{ borderColor: "rgba(124,58,237,0.2)" }}
                                    layout
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {interview.role}
                                                </h3>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                                                    background: interview.status === "completed" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                                                    color: interview.status === "completed" ? "#10b981" : "#f59e0b",
                                                    textTransform: "uppercase", letterSpacing: "0.05em",
                                                }}>
                                                    {interview.status}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                                                <span>{interview.level}</span>
                                                <span>•</span>
                                                <span>{interview.interviewType}</span>
                                                <span>•</span>
                                                <span>{formatDate(interview.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                            {interview.overallScore !== null && (
                                                <div style={{
                                                    display: "flex", flexDirection: "column", alignItems: "center",
                                                    padding: "6px 14px", borderRadius: 10,
                                                    background: `${getScoreColor(interview.overallScore)}10`,
                                                }}>
                                                    <span style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(interview.overallScore), fontFamily: "var(--font-heading)", lineHeight: 1 }}>
                                                        {interview.overallScore}
                                                    </span>
                                                    <span style={{ fontSize: 9, color: "var(--text-muted)" }}>/10</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(interview.id); }}
                                                title="Delete interview"
                                                style={{
                                                    width: 30, height: 30, borderRadius: 6, background: "transparent",
                                                    border: "1px solid transparent", cursor: "pointer",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    transition: "all 0.2s", color: "var(--text-muted)",
                                                }}
                                                onMouseEnter={(e) => { e.target.style.borderColor = "rgba(239,68,68,0.3)"; e.target.style.color = "#ef4444"; }}
                                                onMouseLeave={(e) => { e.target.style.borderColor = "transparent"; e.target.style.color = "var(--text-muted)"; }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Verdict row */}
                                    {interview.verdict && (
                                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                                            <span style={{ fontWeight: 600, color: getScoreColor(interview.overallScore || 0) }}>{interview.verdict}</span>
                                        </div>
                                    )}

                                    {/* Expanded detail panel */}
                                    <AnimatePresence>
                                        {selectedId === interview.id && selectedDetail && !detailLoading && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 14, paddingTop: 14 }}>
                                                    {/* Summary */}
                                                    {selectedDetail.interview?.summary && (
                                                        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 14 }}>
                                                            {selectedDetail.interview.summary}
                                                        </p>
                                                    )}

                                                    {/* Questions list */}
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                        {selectedDetail.questions?.filter(q => q.userAnswer).map((q, qi) => (
                                                            <div key={q.id} style={{
                                                                padding: "12px 14px", borderRadius: 10,
                                                                background: "rgba(124,58,237,0.03)", border: "1px solid rgba(124,58,237,0.06)",
                                                            }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                                                                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.5 }}>
                                                                        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginRight: 4 }}>Q{qi + 1}</span>
                                                                        {q.question}
                                                                    </p>
                                                                    {q.score !== null && (
                                                                        <span style={{
                                                                            fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6, flexShrink: 0,
                                                                            background: `${getScoreColor(q.score)}15`, color: getScoreColor(q.score),
                                                                        }}>
                                                                            {q.score}/10
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-muted)", marginBottom: 4 }}>
                                                                    <strong style={{ color: "var(--text-secondary)" }}>Your answer:</strong> {q.userAnswer}
                                                                </p>
                                                                {q.evaluation && (
                                                                    <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)", fontStyle: "italic" }}>
                                                                        {q.evaluation}
                                                                    </p>
                                                                )}
                                                                {q.recordingMethod === "mic" && (
                                                                    <span style={{ fontSize: 10, color: "#7c3aed", display: "inline-flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                                                                        🎙️ Recorded via microphone
                                                                    </span>
                                                                )}
                                                                {q.recordingMethod === "audio" && (
                                                                    <span style={{ fontSize: 10, color: "#059669", display: "inline-flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                                                                        🔴 Audio recording used
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {selectedId === interview.id && detailLoading && (
                                        <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
                                            <div style={{ width: 20, height: 20, border: "2px solid rgba(124,58,237,0.2)", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Delete confirmation modal */}
                <AnimatePresence>
                    {deleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                            onClick={() => setDeleteConfirm(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                style={{ padding: "24px 28px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", maxWidth: 360, textAlign: "center" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 8 }}>Delete Interview?</h3>
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>This action cannot be undone.</p>
                                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        style={{
                                            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                                            background: "transparent", border: "1px solid var(--border-subtle)",
                                            color: "var(--text-secondary)", cursor: "pointer",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirm)}
                                        style={{
                                            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                                            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                                            color: "#ef4444", cursor: "pointer",
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
