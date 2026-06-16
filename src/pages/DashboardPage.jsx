import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { getInterviews, getInterview, deleteInterview, healthCheck } from "../services/api";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: "easeOut" },
});

// ── SVG Analytics Helpers ──────────────────────────────
function renderScoreTrendSVG(interviews) {
    const scoredInterviews = interviews
        .filter(i => i.status === "completed" && i.overallScore !== null)
        .reverse(); // reverse to get chronological order (since interviews list is sorted descending)
    
    if (scoredInterviews.length === 0) {
        return (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>No completed scores yet</span>
        );
    }

    const width = 260;
    const height = 110;
    const padding = 15;
    
    const maxVal = 10;
    const points = scoredInterviews.map((item, idx) => {
        const x = scoredInterviews.length > 1
            ? padding + (idx * (width - 2 * padding)) / (scoredInterviews.length - 1)
            : width / 2;
        const y = height - padding - (item.overallScore / maxVal) * (height - 2 * padding);
        return { x, y, score: item.overallScore };
    });

    let pathD = "";
    if (points.length > 1) {
        pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    }

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Gridlines */}
            <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />
            
            {/* Area under the line */}
            {points.length > 1 && (
                <path
                    d={`${pathD} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                    fill="url(#trendGrad)"
                />
            )}

            {/* Line */}
            {points.length > 1 ? (
                <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
                <circle cx={points[0].x} cy={points[0].y} r="3" fill="#7c3aed" />
            )}

            {/* Dots */}
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#7c3aed" stroke="var(--bg-card)" strokeWidth="1.5" />
                    <text x={p.x} y={p.y - 8} textAnchor="middle" fill="var(--text)" fontSize="9.5" fontWeight="700">
                        {p.score}
                    </text>
                </g>
            ))}
        </svg>
    );
}

function renderTopicBreakdown(interviews) {
    const scoredInterviews = interviews.filter(i => i.status === "completed" && i.overallScore !== null);
    
    const topics = [
        { id: "technical", label: "Technical", color: "#7c3aed", scores: [] },
        { id: "behavioral", label: "Behavioral", color: "#10b981", scores: [] },
        { id: "mixed", label: "Mixed", color: "#3b82f6", scores: [] }
    ];

    scoredInterviews.forEach(i => {
        const type = i.interviewType || "technical";
        const topic = topics.find(t => t.id === type);
        if (topic) topic.scores.push(i.overallScore);
    });

    return topics.map(topic => {
        const avg = topic.scores.length > 0 
            ? Math.round((topic.scores.reduce((a, b) => a + b, 0) / topic.scores.length) * 10) / 10
            : null;
        
        return (
            <div key={topic.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
                    <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{topic.label}</span>
                    <span style={{ fontWeight: 700, color: avg ? "var(--text)" : "var(--text-muted)" }}>
                        {avg ? `${avg} / 10` : "No data"}
                    </span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                        height: "100%",
                        width: avg ? `${avg * 10}%` : "0%",
                        background: topic.color,
                        borderRadius: 3,
                        transition: "width 0.8s ease-out"
                    }} />
                </div>
            </div>
        );
    });
}

function renderConsistencyGridSVG(interviews) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek - 49); // Sunday of 7 weeks ago
    startDate.setHours(0, 0, 0, 0);

    const dateCounts = {};
    interviews.forEach(i => {
        if (!i.createdAt) return;
        const d = new Date(i.createdAt);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });

    const cells = [];
    const tempDate = new Date(startDate);
    
    for (let w = 0; w < 8; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            const dateStr = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`;
            const count = dateCounts[dateStr] || 0;
            week.push({ count, dateStr });
            tempDate.setDate(tempDate.getDate() + 1);
        }
        cells.push(week);
    }

    const rectSize = 10;
    const rectGap = 3;
    const width = 8 * (rectSize + rectGap) - rectGap;
    const height = 7 * (rectSize + rectGap) - rectGap;

    return (
        <svg width={width} height={height} style={{ overflow: "visible" }}>
            {cells.map((week, wIdx) => 
                week.map((day, dIdx) => {
                    const x = wIdx * (rectSize + rectGap);
                    const y = dIdx * (rectSize + rectGap);
                    let fill = "rgba(255, 255, 255, 0.05)";
                    if (day.count === 1) fill = "rgba(124, 58, 237, 0.4)";
                    else if (day.count > 1) fill = "rgba(124, 58, 237, 0.85)";

                    return (
                        <rect
                            key={`${wIdx}-${dIdx}`}
                            x={x}
                            y={y}
                            width={rectSize}
                            height={rectSize}
                            rx="1.5"
                            ry="1.5"
                            fill={fill}
                            style={{ transition: "fill 0.2s" }}
                        >
                            <title>{`${day.dateStr}: ${day.count} interview${day.count !== 1 ? 's' : ''}`}</title>
                        </rect>
                    );
                })
            )}
        </svg>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [backendStatus, setBackendStatus] = useState("checking");
    const [retryTrigger, setRetryTrigger] = useState(0);

    useEffect(() => {
        if (!user?.id) return;

        let isMounted = true;
        let retries = 0;
        const maxRetries = 15; // 75 seconds total limit

        async function checkAndLoad() {
            try {
                // Use a longer timeout for the initial call, and shorter for subsequent polling
                await healthCheck(retries === 0 ? 30000 : 8000);
                if (!isMounted) return;

                setBackendStatus("connected");

                // Fetch the interviews
                setLoading(true);
                const data = await getInterviews(user.id);
                setInterviews(data.interviews || []);
                setLoading(false);
            } catch (err) {
                console.warn("[DASHBOARD] Connection check failed:", err.message || err);
                if (!isMounted) return;

                if (retries < maxRetries) {
                    retries++;
                    setBackendStatus("waking_up");
                    setTimeout(checkAndLoad, 5000);
                } else {
                    setBackendStatus("error");
                    setLoading(false);
                }
            }
        }

        checkAndLoad();

        return () => {
            isMounted = false;
        };
    }, [user?.id, retryTrigger]);

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
            <nav className="px-4 sm:px-6 py-3.5" style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 960, margin: "0 auto" }}>
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
                    <UserButton />
                </div>
            </nav>

            {/* Main */}
            <main className="px-4 sm:px-6 md:px-8 pb-16" style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto" }}>
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

                  {/* Connection Status & Waking up */}
                {backendStatus === "checking" && (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div className="spinner" style={{ width: 36, height: 36, border: "3px solid rgba(124,58,237,0.2)", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 8 }}>Checking connection...</h3>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Connecting to the InterviewAI servers.</p>
                    </div>
                )}

                {backendStatus === "waking_up" && (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div className="spinner" style={{ width: 36, height: 36, border: "3px solid rgba(245,158,11,0.2)", borderTop: "3px solid #f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f59e0b", fontFamily: "var(--font-heading)", marginBottom: 8 }}>Waking up server...</h3>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.6 }}>
                            The server is hosted on a free tier and takes 30–50 seconds to spin up. Hang tight, this page will load automatically.
                        </p>
                    </div>
                )}

                {backendStatus === "error" && (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.08)", margin: "0 auto 16px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 8 }}>Server is unreachable</h3>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>We couldn't connect to the backend server. Please verify your connection or retry.</p>
                        <button onClick={() => setRetryTrigger(prev => prev + 1)} className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>Retry Connection</button>
                    </div>
                )}

                {/* Loading interviews data after connection is established */}
                {backendStatus === "connected" && loading && (
                    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                        <div className="spinner" style={{ width: 36, height: 36, border: "3px solid rgba(124,58,237,0.2)", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    </div>
                )}

                {/* Empty state */}
                {backendStatus === "connected" && !loading && interviews.length === 0 && (
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

                {/* Performance Overview (only if interviews exist) */}
                {backendStatus === "connected" && !loading && interviews.length > 0 && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        style={{ marginBottom: 32 }}
                        {...fadeUp(0.1)}
                    >
                        {/* 1. Score Trend Line Chart */}
                        <div style={{ padding: "20px 22px", borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 12 }}>Score Trends</h3>
                            <div style={{ flex: 1, height: 110, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {renderScoreTrendSVG(interviews)}
                            </div>
                        </div>

                        {/* 2. Topic Breakdown (horizontal bars) */}
                        <div style={{ padding: "20px 22px", borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 12 }}>Topic Mastery</h3>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                                {renderTopicBreakdown(interviews)}
                            </div>
                        </div>

                        {/* 3. Consistency Calendar Grid */}
                        <div style={{ padding: "20px 22px", borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 4 }}>Consistency</h3>
                            <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 12 }}>Last 8 weeks practice frequency</span>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {renderConsistencyGridSVG(interviews)}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Interview List */}
                {backendStatus === "connected" && !loading && interviews.length > 0 && (
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
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>
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
                                                     {/* Action buttons */}
                                                     <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                                         {selectedDetail.interview?.status === "completed" ? (
                                                             <button
                                                                 onClick={(e) => { e.stopPropagation(); navigate(`/report?id=${selectedDetail.interview.id}`); }}
                                                                 className="btn-primary"
                                                                 style={{ padding: "8px 18px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}
                                                             >
                                                                 📊 View Full Report
                                                             </button>
                                                         ) : (
                                                             <button
                                                                 onClick={(e) => { e.stopPropagation(); navigate(`/interview?id=${selectedDetail.interview.id}`); }}
                                                                 className="btn-primary"
                                                                 style={{ padding: "8px 18px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, background: "#059669", borderColor: "#059669" }}
                                                             >
                                                                 ⚡ Resume Interview
                                                             </button>
                                                         )}
                                                     </div>

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
