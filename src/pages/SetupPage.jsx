import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { startInterview, healthCheck } from "../services/api";

// ── Constants ─────────────────────────────────────────
const ROLES = [
    { id: "frontend", label: "Frontend", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" },
    { id: "backend", label: "Backend", icon: "M5 12h14M12 5v14" },
    { id: "fullstack", label: "Full Stack", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
    { id: "devops", label: "DevOps", icon: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" },
    { id: "mobile", label: "Mobile", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
    { id: "data", label: "Data / ML", icon: "M21 12a9 9 0 11-6.219-8.56" },
];

const LEVELS = [
    { value: "Junior (0-2 years)", label: "Junior", sub: "0-2 yrs" },
    { value: "Mid-Level (2-5 years)", label: "Mid", sub: "2-5 yrs" },
    { value: "Senior (5-8 years)", label: "Senior", sub: "5-8 yrs" },
    { value: "Lead/Staff (8+ years)", label: "Lead", sub: "8+ yrs" },
];

const INTERVIEW_TYPES = [
    { id: "technical", label: "Technical", desc: "DSA, system design, coding", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
    { id: "behavioral", label: "Behavioral", desc: "Leadership, teamwork, conflict", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0" },
    { id: "mixed", label: "Mixed", desc: "Both technical & behavioral", icon: "M4 6h16M4 12h16M4 18h16" },
];

const POPULAR_STACKS = [
    { label: "React", category: "frontend" },
    { label: "TypeScript", category: "frontend" },
    { label: "Node.js", category: "backend" },
    { label: "Python", category: "backend" },
    { label: "Java", category: "backend" },
    { label: "Go", category: "backend" },
    { label: "AWS", category: "devops" },
    { label: "Docker", category: "devops" },
    { label: "PostgreSQL", category: "backend" },
    { label: "MongoDB", category: "backend" },
    { label: "Redis", category: "backend" },
    { label: "GraphQL", category: "frontend" },
    { label: "Next.js", category: "frontend" },
    { label: "Spring Boot", category: "backend" },
    { label: "Kubernetes", category: "devops" },
    { label: "Swift", category: "mobile" },
    { label: "Kotlin", category: "mobile" },
    { label: "TensorFlow", category: "data" },
    { label: "Django", category: "backend" },
    { label: "Vue.js", category: "frontend" },
];

function estimateTime(type) {
    if (type === "technical") return "~15 min";
    if (type === "behavioral") return "~10 min";
    return "~20 min";
}

// ── Animation variants ────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const chipAnim = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

export default function SetupPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [role, setRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [level, setLevel] = useState("");
    const [selectedStacks, setSelectedStacks] = useState([]);
    const [customStack, setCustomStack] = useState("");
    const [interviewType, setInterviewType] = useState("technical");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [backendUp, setBackendUp] = useState(null);

    // Check backend health on mount
    useEffect(() => {
        healthCheck()
            .then(() => setBackendUp(true))
            .catch(() => setBackendUp(false));
    }, []);

    const effectiveRole = role === "custom" ? customRole.trim() : ROLES.find(r => r.id === role)?.label || "";
    const techStackStr = selectedStacks.join(", ");
    const isValid = effectiveRole && level && selectedStacks.length > 0;

    function toggleStack(label) {
        setSelectedStacks(prev =>
            prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
        );
    }

    function addCustomStack() {
        const val = customStack.trim();
        if (val && !selectedStacks.includes(val)) {
            setSelectedStacks(prev => [...prev, val]);
            setCustomStack("");
        }
    }

    async function handleStart(e) {
        e.preventDefault();
        if (!isValid) return;

        setLoading(true);
        setError("");

        try {
            const data = await startInterview(effectiveRole, level, techStackStr, interviewType, user?.id || null);
            navigate("/interview", {
                state: {
                    role: effectiveRole,
                    level,
                    techStack: techStackStr,
                    interviewType,
                    firstQuestion: data.question,
                    interviewId: data.interviewId || null,
                },
            });
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Unknown error";
            setError(`Failed to start interview: ${msg}`);
            setLoading(false);
        }
    }

    const PROGRESS_STEPS = ["Setup", "Interview", "Report"];

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
            {/* Background blobs */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <div className="animate-float" style={{ position: "absolute", top: 60, right: 60, width: 280, height: 280, borderRadius: "50%", filter: "blur(120px)", background: "rgba(124,58,237,0.07)" }} />
                <div className="animate-float" style={{ position: "absolute", bottom: 60, left: 60, width: 320, height: 320, borderRadius: "50%", filter: "blur(120px)", background: "rgba(167,139,250,0.05)", animationDelay: "2s" }} />
            </div>

            {/* Nav */}
            <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", maxWidth: 1100, margin: "0 auto" }}>
                <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.12)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)" }}>InterviewAI</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </nav>

            {/* Main */}
            <main style={{ position: "relative", zIndex: 10, maxWidth: 620, margin: "0 auto", padding: "0 24px 60px" }}>
                {/* Progress Steps */}
                <motion.div
                    style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {PROGRESS_STEPS.map((step, i) => (
                        <div key={step} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "6px 14px", borderRadius: 50,
                                background: i === 0 ? "rgba(124,58,237,0.12)" : "transparent",
                                border: `1px solid ${i === 0 ? "rgba(124,58,237,0.3)" : "var(--border-subtle)"}`,
                            }}>
                                <span style={{
                                    width: 18, height: 18, borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, fontWeight: 700,
                                    background: i === 0 ? "#7c3aed" : "var(--border-subtle)",
                                    color: i === 0 ? "white" : "var(--text-muted)",
                                }}>{i + 1}</span>
                                <span style={{ fontSize: 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "var(--text)" : "var(--text-muted)" }}>{step}</span>
                            </div>
                            {i < 2 && <div style={{ width: 24, height: 1, background: "var(--border-subtle)" }} />}
                        </div>
                    ))}
                </motion.div>

                {/* Header */}
                <motion.div
                    style={{ textAlign: "center", marginBottom: 32 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                        Set Up Your <span className="gradient-text-static">Interview</span>
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        {user?.firstName ? `Welcome, ${user.firstName}! ` : ""}Configure your practice session below.
                    </p>
                </motion.div>

                {/* Backend status */}
                {backendUp === false && (
                    <motion.div
                        style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                            borderRadius: 10, background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)", marginBottom: 20,
                        }}
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                        <span style={{ fontSize: 12.5, color: "#ef4444" }}>
                            Backend not reachable. Start it with <code style={{ background: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>node server.js</code>
                        </span>
                    </motion.div>
                )}

                <form onSubmit={handleStart}>
                    {/* ── Section 1: Role ──────────────────── */}
                    <motion.div
                        style={{ marginBottom: 28 }}
                        initial="hidden" animate="visible"
                        variants={fadeUp}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Target Role
                        </label>
                        <motion.div
                            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
                            variants={stagger}
                            initial="hidden" animate="visible"
                        >
                            {ROLES.map((r) => (
                                <motion.button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id)}
                                    variants={chipAnim}
                                    style={{
                                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                                        padding: "14px 8px", borderRadius: 12, cursor: "pointer",
                                        background: role === r.id ? "rgba(124,58,237,0.1)" : "var(--bg-card)",
                                        border: `1.5px solid ${role === r.id ? "#7c3aed" : "var(--border-subtle)"}`,
                                        transition: "all 0.2s ease",
                                    }}
                                    whileHover={{ y: -2, borderColor: "rgba(124,58,237,0.3)" }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={role === r.id ? "#7c3aed" : "var(--text-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={r.icon} />
                                    </svg>
                                    <span style={{ fontSize: 12, fontWeight: role === r.id ? 600 : 500, color: role === r.id ? "var(--text)" : "var(--text-muted)" }}>
                                        {r.label}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* Custom role input */}
                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                            <button
                                type="button"
                                onClick={() => setRole("custom")}
                                style={{
                                    fontSize: 11, padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                                    background: role === "custom" ? "rgba(124,58,237,0.1)" : "transparent",
                                    border: `1px solid ${role === "custom" ? "#7c3aed" : "var(--border-subtle)"}`,
                                    color: role === "custom" ? "#7c3aed" : "var(--text-muted)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                + Custom
                            </button>
                            <AnimatePresence>
                                {role === "custom" && (
                                    <motion.input
                                        type="text"
                                        value={customRole}
                                        onChange={(e) => setCustomRole(e.target.value)}
                                        placeholder="e.g. Security Engineer"
                                        className="input-field"
                                        style={{ flex: 1, padding: "6px 12px", fontSize: 13 }}
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        autoFocus
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* ── Section 2: Experience Level ──────── */}
                    <motion.div
                        style={{ marginBottom: 28 }}
                        initial="hidden" animate="visible" variants={fadeUp}
                        transition={{ delay: 0.25, duration: 0.4 }}
                    >
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Experience Level
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, background: "var(--bg-card)", borderRadius: 10, padding: 4, border: "1px solid var(--border-subtle)" }}>
                            {LEVELS.map((l) => (
                                <motion.button
                                    key={l.value}
                                    type="button"
                                    onClick={() => setLevel(l.value)}
                                    style={{
                                        padding: "10px 4px", borderRadius: 8, cursor: "pointer",
                                        border: "none", textAlign: "center",
                                        background: level === l.value ? "#7c3aed" : "transparent",
                                        transition: "all 0.2s ease",
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: level === l.value ? "white" : "var(--text)" }}>
                                        {l.label}
                                    </span>
                                    <span style={{ display: "block", fontSize: 10, marginTop: 2, color: level === l.value ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>
                                        {l.sub}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Section 3: Tech Stack Chips ─────── */}
                    <motion.div
                        style={{ marginBottom: 28 }}
                        initial="hidden" animate="visible" variants={fadeUp}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Tech Stack <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>({selectedStacks.length} selected)</span>
                        </label>
                        <motion.div
                            style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                            variants={stagger}
                            initial="hidden" animate="visible"
                        >
                            {POPULAR_STACKS.map((s) => (
                                <motion.button
                                    key={s.label}
                                    type="button"
                                    onClick={() => toggleStack(s.label)}
                                    variants={chipAnim}
                                    style={{
                                        fontSize: 12, padding: "6px 14px", borderRadius: 50, cursor: "pointer",
                                        border: `1px solid ${selectedStacks.includes(s.label) ? "#7c3aed" : "var(--border-subtle)"}`,
                                        background: selectedStacks.includes(s.label) ? "rgba(124,58,237,0.12)" : "transparent",
                                        color: selectedStacks.includes(s.label) ? "#a78bfa" : "var(--text-muted)",
                                        fontWeight: selectedStacks.includes(s.label) ? 600 : 400,
                                        transition: "all 0.2s ease",
                                    }}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {selectedStacks.includes(s.label) && "✓ "}{s.label}
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* Custom stack input */}
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <input
                                type="text"
                                value={customStack}
                                onChange={(e) => setCustomStack(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomStack(); } }}
                                placeholder="Add custom tech..."
                                className="input-field"
                                style={{ flex: 1, padding: "6px 12px", fontSize: 12 }}
                            />
                            <button
                                type="button"
                                onClick={addCustomStack}
                                disabled={!customStack.trim()}
                                style={{
                                    fontSize: 12, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                                    border: "1px solid var(--border-subtle)", background: "var(--bg-card)",
                                    color: "var(--text-muted)", transition: "all 0.2s", opacity: customStack.trim() ? 1 : 0.4,
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </motion.div>

                    {/* ── Section 4: Interview Type ────────── */}
                    <motion.div
                        style={{ marginBottom: 28 }}
                        initial="hidden" animate="visible" variants={fadeUp}
                        transition={{ delay: 0.35, duration: 0.4 }}
                    >
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Interview Type
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                            {INTERVIEW_TYPES.map((t) => (
                                <motion.button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setInterviewType(t.id)}
                                    style={{
                                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                                        padding: "14px 8px", borderRadius: 12, cursor: "pointer",
                                        background: interviewType === t.id ? "rgba(124,58,237,0.1)" : "var(--bg-card)",
                                        border: `1.5px solid ${interviewType === t.id ? "#7c3aed" : "var(--border-subtle)"}`,
                                        transition: "all 0.2s ease",
                                    }}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={interviewType === t.id ? "#7c3aed" : "var(--text-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={t.icon} />
                                    </svg>
                                    <span style={{ fontSize: 12.5, fontWeight: interviewType === t.id ? 600 : 500, color: interviewType === t.id ? "var(--text)" : "var(--text-muted)" }}>
                                        {t.label}
                                    </span>
                                    <span style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3, textAlign: "center" }}>
                                        {t.desc}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Estimated Time ───────────────────── */}
                    <motion.div
                        style={{ marginBottom: 28 }}
                        initial="hidden" animate="visible" variants={fadeUp}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 24,
                            padding: "14px 20px", borderRadius: 12,
                            background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                        }}>
                            <div style={{ textAlign: "center" }}>
                                <span style={{ display: "block", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Est. Duration</span>
                                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                                    {estimateTime(interviewType)}
                                </span>
                            </div>
                            <div style={{ width: 1, height: 28, background: "var(--border-subtle)" }} />
                            <div style={{ textAlign: "center" }}>
                                <span style={{ display: "block", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Questions</span>
                                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                                    {interviewType === "technical" ? "5-8" : interviewType === "behavioral" ? "4-6" : "6-10"}
                                </span>
                            </div>
                            <div style={{ width: 1, height: 28, background: "var(--border-subtle)" }} />
                            <div style={{ textAlign: "center" }}>
                                <span style={{ display: "block", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Type</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#7c3aed" }}>
                                    {INTERVIEW_TYPES.find(t => t.id === interviewType)?.label}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Error ────────────────────────────── */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                style={{
                                    marginBottom: 20, borderRadius: 12, padding: "12px 16px",
                                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                                }}
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            >
                                <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 8 }}>{error}</p>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={handleStart}
                                        style={{
                                            fontSize: 12, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                                            border: "1px solid rgba(239,68,68,0.3)", background: "transparent",
                                            color: "#ef4444", fontWeight: 600,
                                        }}
                                    >
                                        ↻ Retry
                                    </button>
                                    <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                                        💡 Make sure the backend is running on port 5001
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Submit ───────────────────────────── */}
                    <motion.div
                        initial="hidden" animate="visible" variants={fadeUp}
                        transition={{ delay: 0.45, duration: 0.4 }}
                    >
                        <motion.button
                            type="submit"
                            disabled={!isValid || loading || backendUp === false}
                            className="btn-primary"
                            style={{
                                width: "100%", padding: "14px 0", fontSize: 15, fontWeight: 600,
                                opacity: (!isValid || loading || backendUp === false) ? 0.5 : 1,
                                cursor: (!isValid || loading || backendUp === false) ? "not-allowed" : "pointer",
                            }}
                            whileHover={isValid && !loading ? { scale: 1.01, boxShadow: "0 6px 24px rgba(124,58,237,0.25)" } : {}}
                            whileTap={isValid && !loading ? { scale: 0.99 } : {}}
                        >
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24">
                                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Generating First Question...
                                </span>
                            ) : (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    Begin Interview
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            )}
                        </motion.button>

                        {/* Validation hint */}
                        {!isValid && !loading && (
                            <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
                                Select a role, experience level, and at least one tech to continue
                            </p>
                        )}
                    </motion.div>
                </form>

                {/* ── Resume Coming Soon ───────────────── */}
                <motion.div
                    style={{ textAlign: "center", marginTop: 32 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "8px 16px", borderRadius: 10,
                        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            <strong style={{ color: "var(--text)" }}>Resume Upload</strong> — AI-tailored questions
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(124,58,237,0.1)", color: "#a78bfa" }}>COMING SOON</span>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
