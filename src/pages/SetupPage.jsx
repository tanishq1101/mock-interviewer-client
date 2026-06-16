import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { startInterview, healthCheck } from "../services/api";
import * as pdfjsLib from "pdfjs-dist";

// Set worker Src on the global pdfjsLib object
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "6.0.227"}/pdf.worker.min.mjs`;


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
    const [backendUp, setBackendUp] = useState("checking");

    // Tier 2: Resume parsing & Timed Mode
    const [resumeText, setResumeText] = useState("");
    const [resumeFileName, setResumeFileName] = useState("");
    const [parsingPdf, setParsingPdf] = useState(false);
    const [pdfError, setPdfError] = useState("");
    const [timedMode, setTimedMode] = useState(false);

    // Tier 1: Device Diagnostics
    const [diagnosticsRun, setDiagnosticsRun] = useState(false);
    const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
    const [bypassChecks, setBypassChecks] = useState(false);
    const [diagnostics, setDiagnostics] = useState({
        camera: "pending", // "pending", "success", "error"
        microphone: "pending",
        latency: null,
        volume: 0,
        errorMessage: "",
    });

    const setupVideoRef = useRef(null);
    const activeCamStreamRef = useRef(null);
    const activeMicStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Check backend health on mount with automatic polling/waking-up logic
    useEffect(() => {
        let isMounted = true;
        let retries = 0;
        const maxRetries = 15; // 75 seconds total limit

        async function checkHealth() {
            try {
                // Use a longer timeout for the initial call, and shorter for subsequent polling
                await healthCheck(retries === 0 ? 30000 : 8000);
                if (isMounted) {
                    setBackendUp("connected");
                }
            } catch (err) {
                console.warn("[SETUP] Connection check failed:", err.message || err);
                if (!isMounted) return;
                
                if (retries < maxRetries) {
                    retries++;
                    setBackendUp("waking_up");
                    // Check again in 5 seconds
                    setTimeout(checkHealth, 5000);
                } else {
                    setBackendUp("error");
                }
            }
        }

        checkHealth();

        return () => {
            isMounted = false;
        };
    }, []);

    // Cleanup diagnostics stream on unmount
    useEffect(() => {
        return () => {
            if (activeCamStreamRef.current) {
                activeCamStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (activeMicStreamRef.current) {
                activeMicStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close();
            }
        };
    }, []);

    const effectiveRole = role === "custom" ? customRole.trim() : ROLES.find(r => r.id === role)?.label || "";
    const techStackStr = selectedStacks.join(", ");
    
    // Validate if targeting details are complete, and hardware diagnostics have passed
    const isDiagnosticsPassed = (diagnostics.camera === "success" && diagnostics.microphone === "success" && diagnostics.latency !== null && diagnostics.latency !== "error") || bypassChecks;
    const isValid = effectiveRole && level && selectedStacks.length > 0 && isDiagnosticsPassed;

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

    // Client-side PDF Parser using pdfjsLib
    async function parsePdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            text += pageText + "\n";
        }
        return text;
    }

    async function handleFileChange(file) {
        if (!file) return;
        if (file.type !== "application/pdf") {
            setPdfError("Only PDF files are supported");
            return;
        }
        setParsingPdf(true);
        setPdfError("");
        try {
            const text = await parsePdf(file);
            setResumeText(text);
            setResumeFileName(file.name);
        } catch (err) {
            console.error("PDF parse error:", err);
            setPdfError(`Failed to parse PDF: ${err.message || err}`);
        } finally {
            setParsingPdf(false);
        }
    }

    // Run hardware checks
    async function runDiagnostics() {
        setDiagnosticsRunning(true);
        setDiagnosticsRun(true);
        setDiagnostics({
            camera: "pending",
            microphone: "pending",
            latency: null,
            volume: 0,
            errorMessage: "",
        });

        // 1. Camera check
        try {
            const camStream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
            activeCamStreamRef.current = camStream;
            // Short delay to allow videoRef node to be mounted
            setTimeout(() => {
                if (setupVideoRef.current) {
                    setupVideoRef.current.srcObject = camStream;
                    setupVideoRef.current.play().catch(e => console.warn(e));
                }
            }, 300);
            setDiagnostics(prev => ({ ...prev, camera: "success" }));
        } catch (err) {
            console.warn("Camera check failed:", err);
            setDiagnostics(prev => ({ ...prev, camera: "error", errorMessage: `Camera error: ${err.message}` }));
        }

        // 2. Microphone check
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            activeMicStreamRef.current = micStream;
            setDiagnostics(prev => ({ ...prev, microphone: "success" }));

            // Setup audio analyser
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(micStream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!activeMicStreamRef.current) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setDiagnostics(prev => ({ ...prev, volume: Math.min(average * 2.5, 100) }));
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
        } catch (err) {
            console.warn("Microphone check failed:", err);
            setDiagnostics(prev => ({ ...prev, microphone: "error", errorMessage: prev.errorMessage ? `${prev.errorMessage}; Mic error: ${err.message}` : `Mic error: ${err.message}` }));
        }

        // 3. Network check
        try {
            const start = Date.now();
            await healthCheck(8000);
            const pingValue = Date.now() - start;
            setDiagnostics(prev => ({ ...prev, latency: pingValue }));
        } catch (err) {
            console.warn("Network check failed:", err);
            setDiagnostics(prev => ({ ...prev, latency: "error" }));
        }

        setDiagnosticsRunning(false);
    }

    async function handleStart(e) {
        e.preventDefault();
        if (!isValid) return;

        // Clean up streams before navigating
        if (activeCamStreamRef.current) {
            activeCamStreamRef.current.getTracks().forEach(t => t.stop());
        }
        if (activeMicStreamRef.current) {
            activeMicStreamRef.current.getTracks().forEach(t => t.stop());
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            audioContextRef.current.close();
        }

        setLoading(true);
        setError("");

        try {
            const data = await startInterview(effectiveRole, level, techStackStr, interviewType, user?.id || null, resumeText);
            navigate("/interview", {
                state: {
                    role: effectiveRole,
                    level,
                    techStack: techStackStr,
                    interviewType,
                    firstQuestion: data.question,
                    interviewId: data.interviewId || null,
                    interviewer: data.interviewer || null,
                    timedMode,
                },
            });
        } catch (err) {
            const status = err.response?.status;
            const errorType = err.response?.data?.error;
            if (status === 402 || errorType === "limit_reached") {
                setError("limit_reached");
            } else {
                const msg = err.response?.data?.error || err.message || "Unknown error";
                setError(`Failed to start interview: ${msg}`);
            }
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
            <nav className="px-4 sm:px-6 py-4" style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
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
                    <UserButton />
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
                                <span className="hidden sm:inline" style={{ fontSize: 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "var(--text)" : "var(--text-muted)" }}>{step}</span>
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
                {backendUp === "checking" && (
                    <motion.div
                        style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                            borderRadius: 10, background: "rgba(124,58,237,0.06)",
                            border: "1px solid rgba(124,58,237,0.15)", marginBottom: 20,
                        }}
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="spinner" style={{ width: 14, height: 14, border: "2px solid rgba(124,58,237,0.2)", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                            Checking connection to backend server...
                        </span>
                    </motion.div>
                )}

                {backendUp === "waking_up" && (
                    <motion.div
                        style={{
                            display: "flex", flexDirection: "column", gap: 6, padding: "12px 16px",
                            borderRadius: 10, background: "rgba(245,158,11,0.06)",
                            border: "1px solid rgba(245,158,11,0.2)", marginBottom: 20,
                        }}
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="spinner" style={{ width: 14, height: 14, border: "2px solid rgba(245,158,11,0.2)", borderTop: "2px solid #f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#f59e0b" }}>
                                Backend is waking up...
                            </span>
                        </div>
                        <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginLeft: 24 }}>
                            The server is hosted on a free tier and takes 30–50 seconds to spin up. Please wait, the page will automatically enable once ready.
                        </span>
                    </motion.div>
                )}

                {backendUp === "error" && (
                    <motion.div
                        style={{
                            display: "flex", flexDirection: "column", gap: 6, padding: "12px 16px",
                            borderRadius: 10, background: "rgba(239,68,68,0.06)",
                            border: "1px solid rgba(239,68,68,0.2)", marginBottom: 20,
                        }}
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#ef4444" }}>
                                Backend server not reachable
                            </span>
                        </div>
                        <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginLeft: 18 }}>
                            We were unable to establish a connection. Try starting the server manually or verifying your internet connection.
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
                            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1" style={{ background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                                    <span style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>
                                        {t.desc}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Estimated Time ───────────────────── */}
                    <motion.div
                        style={{ marginBottom: 24 }}
                        initial="hidden" animate="visible" variants={fadeUp}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <div className="flex flex-row items-center justify-around gap-2 sm:gap-6 px-3 py-3.5 sm:px-5 sm:py-4" style={{
                            borderRadius: 12,
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

                    {/* ── Tier 2: Timed Mock Mode & Resume Upload ── */}
                    <motion.div
                        style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}
                        initial="hidden" animate="visible" variants={fadeUp}
                        transition={{ delay: 0.42, duration: 0.4 }}
                    >
                        {/* Timed Mode Toggle */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between",
                            padding: "12px 16px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-subtle)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                <div>
                                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Timed Mode</span>
                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>120s countdown per question with auto-submit</span>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={timedMode}
                                onChange={(e) => setTimedMode(e.target.checked)}
                                style={{ width: 18, height: 18, accentColor: "#7c3aed", cursor: "pointer" }}
                            />
                        </div>

                        {/* Resume PDF Uploader */}
                        <div style={{
                            padding: "16px 20px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                            display: "flex", flexDirection: "column", gap: 12
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <div>
                                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Resume Upload (Optional)</span>
                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Upload PDF to tailor questions to your experience</span>
                                </div>
                            </div>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    handleFileChange(file);
                                }}
                                style={{
                                    border: "2px dashed var(--border-subtle)",
                                    borderRadius: 10,
                                    padding: "20px 10px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    transition: "border-color 0.2s",
                                    background: "rgba(0,0,0,0.05)"
                                }}
                                onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = ".pdf";
                                    input.onchange = (e) => {
                                        const file = e.target.files?.[0];
                                        handleFileChange(file);
                                    };
                                    input.click();
                                }}
                            >
                                {parsingPdf ? (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                        <div className="spinner" style={{ width: 14, height: 14, border: "2px solid rgba(124,58,237,0.2)", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Parsing PDF resume...</span>
                                    </div>
                                ) : resumeFileName ? (
                                    <span style={{ fontSize: 12.5, color: "#10b981", fontWeight: 600 }}>
                                        ✓ Parsed {resumeFileName}
                                    </span>
                                ) : (
                                    <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                                        Drag & drop PDF here, or click to upload
                                    </span>
                                )}
                            </div>
                            {pdfError && <span style={{ fontSize: 11, color: "#ef4444" }}>{pdfError}</span>}
                        </div>
                    </motion.div>

                    {/* ── Tier 1: Pre-interview Device Diagnostics ── */}
                    <motion.div
                        style={{ marginBottom: 24, padding: "16px 20px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
                        initial="hidden" animate="visible" variants={fadeUp}
                        transition={{ delay: 0.44, duration: 0.4 }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>Device & Latency Check</span>
                            </div>
                            {!diagnosticsRun && (
                                <button
                                    type="button"
                                    onClick={runDiagnostics}
                                    disabled={diagnosticsRunning}
                                    className="btn-primary"
                                    style={{ padding: "6px 14px", fontSize: 11.5, marginLeft: "auto", cursor: "pointer" }}
                                >
                                    Run Check
                                </button>
                            )}
                        </div>

                        {diagnosticsRun && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                    {/* Video Preview */}
                                    <div style={{ width: 120, height: 90, borderRadius: 8, background: "rgba(0,0,0,0.2)", overflow: "hidden", position: "relative", border: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                                        <video
                                            ref={setupVideoRef}
                                            muted
                                            playsInline
                                            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                                        />
                                        {diagnostics.camera !== "success" && (
                                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
                                                <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>No Feed</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Checklist Details */}
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                        {/* Camera Check */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                                            <span style={{ color: diagnostics.camera === "success" ? "#10b981" : diagnostics.camera === "pending" ? "#f59e0b" : "#ef4444" }}>
                                                {diagnostics.camera === "success" ? "✓" : "●"}
                                            </span>
                                            <span style={{ color: "var(--text-secondary)" }}>Webcam Preview:</span>
                                            <span style={{ fontWeight: 600, color: "var(--text)" }}>
                                                {diagnostics.camera === "success" ? "Ready" : diagnostics.camera === "pending" ? "Checking..." : "Failed"}
                                            </span>
                                        </div>

                                        {/* Microphone Check */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                                                <span style={{ color: diagnostics.microphone === "success" ? "#10b981" : diagnostics.microphone === "pending" ? "#f59e0b" : "#ef4444" }}>
                                                    {diagnostics.microphone === "success" ? "✓" : "●"}
                                                </span>
                                                <span style={{ color: "var(--text-secondary)" }}>Microphone Volume:</span>
                                                <span style={{ fontWeight: 600, color: "var(--text)" }}>
                                                    {diagnostics.microphone === "success" ? "Active" : diagnostics.microphone === "pending" ? "Checking..." : "Failed"}
                                                </span>
                                            </div>
                                            {diagnostics.microphone === "success" && (
                                                <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                                                    <div style={{ width: `${diagnostics.volume}%`, height: "100%", background: "#10b981", transition: "width 0.1s ease" }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Latency Check */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                                            <span style={{ color: (diagnostics.latency !== null && diagnostics.latency !== "error") ? "#10b981" : "#ef4444" }}>
                                                {(diagnostics.latency !== null && diagnostics.latency !== "error") ? "✓" : "●"}
                                            </span>
                                            <span style={{ color: "var(--text-secondary)" }}>Network Latency:</span>
                                            <span style={{ fontWeight: 600, color: "var(--text)" }}>
                                                {diagnostics.latency === "error" ? "Timeout" : diagnostics.latency !== null ? `${diagnostics.latency}ms` : "Checking..."}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {diagnostics.errorMessage && (
                                    <div style={{ fontSize: 11, color: "#ef4444", padding: "4px 8px", background: "rgba(239,68,68,0.05)", borderRadius: 6 }}>
                                        {diagnostics.errorMessage}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                    <button
                                        type="button"
                                        onClick={runDiagnostics}
                                        disabled={diagnosticsRunning}
                                        style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text)", cursor: "pointer" }}
                                    >
                                        Retest
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBypassChecks(true)}
                                        style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline", marginLeft: "auto" }}
                                    >
                                        Bypass Checks
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* ── Error ────────────────────────────── */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                style={{
                                    marginBottom: 20, borderRadius: 12, padding: "16px 20px",
                                    background: error === "limit_reached" ? "rgba(124,58,237,0.06)" : "rgba(239,68,68,0.08)",
                                    border: error === "limit_reached" ? "1px solid rgba(124,58,237,0.2)" : "1px solid rgba(239,68,68,0.2)",
                                }}
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            >
                                {error === "limit_reached" ? (
                                    <div style={{ textAlign: "center" }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Mock Limits Reached</h3>
                                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
                                            You have reached the limit of 10 free mock interviews. Upgrade to Pro or Pro Max to practice unlimited sessions.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                sessionStorage.setItem("scrollToSection", "#pricing");
                                                navigate("/");
                                            }}
                                            className="btn-primary"
                                            style={{ padding: "8px 20px", fontSize: 12.5 }}
                                        >
                                            Upgrade Now
                                        </button>
                                    </div>
                                ) : (
                                    <>
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
                                    </>
                                )}
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
                            disabled={!isValid || loading || backendUp !== "connected"}
                            className="btn-primary"
                            style={{
                                width: "100%", padding: "14px 0", fontSize: 15, fontWeight: 600,
                                opacity: (!isValid || loading || backendUp !== "connected") ? 0.5 : 1,
                                cursor: (!isValid || loading || backendUp !== "connected") ? "not-allowed" : "pointer",
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
                                {!isDiagnosticsPassed 
                                    ? "Run and pass device check diagnostics before starting" 
                                    : "Select a role, experience level, and at least one tech to continue"}
                            </p>
                        )}
                    </motion.div>
                </form>
            </main>
        </div>
    );
}
