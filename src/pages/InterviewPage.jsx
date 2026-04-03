import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import MessageBubble from "../components/MessageBubble";
import { submitAnswer, endInterview } from "../services/api";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useWebcam from "../hooks/useWebcam";
import useAudioRecorder from "../hooks/useAudioRecorder";

export default function InterviewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, level, techStack, firstQuestion, interviewId: initId } = location.state || {};

    const [interviewId, _setInterviewId] = useState(initId || null);

    const [messages, setMessages] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [ending, setEnding] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [history, setHistory] = useState([]);
    const [typing, setTyping] = useState(false);
    const [voiceMode, setVoiceMode] = useState("typing");
    const [recordingMethod, setRecordingMethod] = useState("text");
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // ── Speech Recognition ─────────────────────────────
    const speech = useSpeechRecognition();
    const audioRecorder = useAudioRecorder();

    // ── Webcam ─────────────────────────────────────────
    // Destructure so ESLint can distinguish refs from state
    const {
        videoRef: webcamVideoRef,
        isActive: webcamActive,
        isSupported: webcamSupported,
        error: webcamError,
        toggleWebcam,
    } = useWebcam();

    // Sync speech transcript into the textarea
    // This is syncing external system state (Web Speech API) into React — the intended use of effects
    useEffect(() => {
        if (speech.fullTranscript) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAnswer(speech.fullTranscript);
            setRecordingMethod("mic");
        }
    }, [speech.fullTranscript]);

    useEffect(() => {
        if (!firstQuestion) { navigate("/setup"); return; }
        const id = requestAnimationFrame(() => setTyping(true));
        const timer = setTimeout(() => {
            setTyping(false);
            setCurrentQuestion(firstQuestion);
            setMessages([{ type: "ai", content: firstQuestion }]);
            setQuestionCount(1);
        }, 1200);
        return () => { clearTimeout(timer); cancelAnimationFrame(id); };
    }, [firstQuestion, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    // ── Scoring Stats ─────────────────────────────────
    const stats = useMemo(() => {
        if (history.length === 0) return { avg: 0, scores: [], trend: "neutral" };
        const scores = history.map(h => h.score);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const last2 = scores.slice(-2);
        const trend = last2.length >= 2 ? (last2[1] > last2[0] ? "up" : last2[1] < last2[0] ? "down" : "neutral") : "neutral";
        return { avg: Math.round(avg * 10) / 10, scores, trend };
    }, [history]);

    function handleTextareaChange(e) {
        setAnswer(e.target.value);
        if (!speech.fullTranscript && !audioRecorder.audioUrl) {
            setRecordingMethod("text");
        }
        const ta = textareaRef.current;
        if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 200) + "px"; }
    }

    const handleVoiceModeChange = useCallback((mode) => {
        setVoiceMode(mode);

        if (mode === "typing") {
            if (audioRecorder.isRecording) {
                audioRecorder.stopRecording();
            }
            audioRecorder.resetRecording();
            audioRecorder.clearError();
            setRecordingMethod("text");
            return;
        }

        if (speech.isListening) {
            speech.stopListening();
        }
        speech.resetTranscript();
        speech.clearError();
        setRecordingMethod("text");
    }, [audioRecorder, speech]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!answer.trim() || loading) return;
        const userAnswer = answer.trim();
        const methodUsed = recordingMethod;

        if (speech.isListening) {
            speech.stopListening();
        }
        if (audioRecorder.isRecording) {
            audioRecorder.stopRecording();
        }

        setAnswer("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setLoading(true);
        setMessages(prev => [...prev, { type: "user", content: userAnswer }]);
        setTyping(true);

        try {
            const result = await submitAnswer({ role, level, techStack, question: currentQuestion, answer: userAnswer, history, interviewId, recordingMethod: methodUsed });
            const newEntry = { question: currentQuestion, answer: userAnswer, evaluation: result.evaluation, score: result.score };
            setHistory(prev => [...prev, newEntry]);
            await new Promise(r => setTimeout(r, 600));
            setTyping(false);
            setMessages(prev => [
                ...prev,
                { type: "evaluation", content: result.evaluation, score: result.score },
                { type: "ai", content: result.nextQuestion },
            ]);
            setCurrentQuestion(result.nextQuestion);
            setQuestionCount(c => c + 1);
        } catch (err) {
            setTyping(false);
            const msg = err.response?.data?.error || err.message || "Network error";
            setMessages(prev => [...prev, {
                type: "error",
                content: `Failed: ${msg}`,
                retryData: { question: currentQuestion, answer: userAnswer, recordingMethod: methodUsed },
            }]);
        }
        speech.resetTranscript();
        audioRecorder.resetRecording();
        setRecordingMethod("text");
        setLoading(false);
    }

    const handleRetry = useCallback(async (retryData) => {
        if (!retryData) return;
        setLoading(true);
        setTyping(true);
        // Remove the error message
        setMessages((prev) => prev.filter((m) => m.retryData !== retryData));

        try {
            const result = await submitAnswer({
                role,
                level,
                techStack,
                question: retryData.question,
                answer: retryData.answer,
                history,
                interviewId,
                recordingMethod: retryData.recordingMethod || "text",
            });
            const newEntry = { question: retryData.question, answer: retryData.answer, evaluation: result.evaluation, score: result.score };
            setHistory((prev) => [...prev, newEntry]);
            await new Promise((r) => setTimeout(r, 600));
            setTyping(false);
            setMessages((prev) => [
                ...prev,
                { type: "evaluation", content: result.evaluation, score: result.score },
                { type: "ai", content: result.nextQuestion },
            ]);
            setCurrentQuestion(result.nextQuestion);
            setQuestionCount((c) => c + 1);
        } catch {
            setTyping(false);
            setMessages((prev) => [...prev, { type: "error", content: "Retry failed. Check your backend connection.", retryData }]);
        }
        setRecordingMethod("text");
        setLoading(false);
    }, [role, level, techStack, history, interviewId]);

    async function handleEnd() {
        if (history.length === 0) return;
        setEnding(true);
        try {
            const data = await endInterview({ role, level, techStack, history, interviewId });
            navigate("/report", { state: { report: data.report, role, level, techStack, totalQuestions: questionCount } });
        } catch (err) {
            setEnding(false);
            const msg = err.response?.data?.error || err.message || "Network error";
            setMessages(prev => [...prev, { type: "error", content: `Failed to generate report: ${msg}` }]);
        }
    }

    function getScoreColor(score) {
        if (score >= 8) return "#10b981";
        if (score >= 5) return "#f59e0b";
        return "#ef4444";
    }

    function getScoreBg(score) {
        if (score >= 8) return "rgba(16,185,129,0.1)";
        if (score >= 5) return "rgba(245,158,11,0.1)";
        return "rgba(239,68,68,0.1)";
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    // Combined device error message
    const voiceError = voiceMode === "typing" ? speech.error : audioRecorder.error;
    const deviceError = webcamError || voiceError;

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
            {/* Header */}
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", flexShrink: 0, borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.12)" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)" }}>InterviewAI</span>
                    </button>
                    <div style={{ width: 1, height: 18, background: "var(--border-subtle)", margin: "0 4px" }} />
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>{role}</span>
                        <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>•</span>
                        <span>{level}</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Live Score */}
                    {history.length > 0 && (
                        <div
                            className="animate-fade-in"
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "5px 12px", borderRadius: 8,
                                background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                            }}
                        >
                            <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Avg</span>
                            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-heading)", color: getScoreColor(stats.avg) }}>
                                {stats.avg}
                            </span>
                            <span style={{ fontSize: 12 }}>
                                {stats.trend === "up" ? "↗" : stats.trend === "down" ? "↘" : "→"}
                            </span>
                        </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Q</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{questionCount}</span>
                    </div>

                    <button
                        onClick={handleEnd}
                        disabled={history.length === 0 || ending}
                        style={{
                            fontSize: 12, padding: "7px 14px", borderRadius: 8, fontWeight: 600,
                            cursor: (history.length === 0 || ending) ? "not-allowed" : "pointer",
                            border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
                            background: "transparent", transition: "all 0.2s",
                            opacity: (history.length === 0 || ending) ? 0.4 : 1,
                        }}
                        onMouseEnter={e => { if (!e.target.disabled) e.target.style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { e.target.style.background = "transparent"; }}
                    >
                        {ending ? "Generating..." : "End Interview"}
                    </button>

                    {/* Webcam toggle — uses derived state variables, not refs */}
                    {webcamSupported && (
                        <button
                            onClick={toggleWebcam}
                            title={webcamActive ? "Turn off webcam" : "Turn on webcam"}
                            style={{
                                position: "relative", width: 32, height: 32, borderRadius: "50%",
                                border: `1px solid ${webcamActive ? "rgba(16,185,129,0.4)" : "var(--border-subtle)"}`,
                                background: webcamActive ? "rgba(16,185,129,0.08)" : "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", transition: "all 0.2s",
                            }}
                        >
                            {/* Always render video element so ref is attached; hide when inactive */}
                            <video
                                ref={webcamVideoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                    width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%",
                                    display: webcamActive ? "block" : "none",
                                }}
                            />
                            {!webcamActive && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                            )}
                        </button>
                    )}

                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* Device error banner */}
            {deviceError && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 20px",
                    background: "rgba(239,68,68,0.06)", borderBottom: "1px solid rgba(239,68,68,0.15)",
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span style={{ fontSize: 12.5, color: "#ef4444", flex: 1 }}>{deviceError}</span>
                    <button
                        onClick={() => {
                            if (webcamError) toggleWebcam();
                            if (voiceMode === "typing" && speech.error) speech.clearError();
                            if (voiceMode === "recording" && audioRecorder.error) audioRecorder.clearError();
                        }}
                        style={{
                            fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                            border: "1px solid rgba(239,68,68,0.3)", background: "transparent",
                            color: "#ef4444", fontWeight: 600,
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Score trend bar */}
            {history.length > 1 && (
                <div style={{ display: "flex", gap: 2, padding: "0 20px", height: 3 }}>
                    {stats.scores.map((s, i) => (
                        <div
                            key={i}
                            className="animate-fade-in"
                            style={{ flex: 1, background: getScoreColor(s), borderRadius: 2, opacity: 0.6 }}
                        />
                    ))}
                </div>
            )}

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
                <div style={{ maxWidth: 760, margin: "0 auto" }}>
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} message={msg} getScoreColor={getScoreColor} getScoreBg={getScoreBg} index={i} onRetry={handleRetry} />
                        ))}
                    </AnimatePresence>

                    {typing && (
                        <div className="animate-fade-in" style={{ display: "flex", alignItems: "start", gap: 10, marginTop: 12 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, background: "rgba(124,58,237,0.15)" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 16px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                                <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
                                <span className="typing-dot delay-200" style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
                                <span className="typing-dot delay-400" style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div style={{ padding: "12px 16px", flexShrink: 0, borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ maxWidth: 760, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", padding: 3, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                        <button
                            type="button"
                            onClick={() => handleVoiceModeChange("typing")}
                            disabled={loading || ending}
                            style={{
                                fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: 7,
                                border: "none", cursor: (loading || ending) ? "not-allowed" : "pointer",
                                background: voiceMode === "typing" ? "rgba(124,58,237,0.12)" : "transparent",
                                color: voiceMode === "typing" ? "#7c3aed" : "var(--text-muted)",
                            }}
                        >
                            Voice Typing
                        </button>
                        <button
                            type="button"
                            onClick={() => handleVoiceModeChange("recording")}
                            disabled={loading || ending}
                            style={{
                                fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: 7,
                                border: "none", cursor: (loading || ending) ? "not-allowed" : "pointer",
                                background: voiceMode === "recording" ? "rgba(16,185,129,0.12)" : "transparent",
                                color: voiceMode === "recording" ? "#059669" : "var(--text-muted)",
                            }}
                        >
                            Record Audio
                        </button>
                    </div>

                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {voiceMode === "typing"
                            ? "Speak to auto-fill your answer in real time."
                            : "Record your spoken answer and add notes/transcript before submit."}
                    </span>
                </div>

                <form onSubmit={handleSubmit} style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10, alignItems: "end" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <textarea
                            ref={textareaRef}
                            value={answer}
                            onChange={handleTextareaChange}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                            placeholder={voiceMode === "typing"
                                ? "Type your answer... (Shift+Enter for new line)"
                                : "Add a transcript/summary for your recorded answer..."}
                            className="input-field"
                            rows={1}
                            disabled={loading || ending}
                            style={{ resize: "none", paddingRight: 50 }}
                        />
                        <span style={{ position: "absolute", right: 12, bottom: 10, fontSize: 10, color: "var(--text-muted)" }}>{answer.length}</span>
                    </div>
                    <button
                        type="submit"
                        disabled={!answer.trim() || loading || ending}
                        className="btn-primary"
                        style={{
                            padding: "10px 16px", flexShrink: 0,
                            opacity: (!answer.trim() || loading || ending) ? 0.4 : 1,
                            cursor: (!answer.trim() || loading || ending) ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? (
                            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24">
                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </button>

                    {/* Voice typing button */}
                    {voiceMode === "typing" && speech.isSupported && (
                        <button
                            type="button"
                            onClick={() => {
                                if (speech.isListening) {
                                    speech.stopListening();
                                } else {
                                    if (audioRecorder.isRecording) {
                                        audioRecorder.stopRecording();
                                    }
                                    audioRecorder.clearError();
                                    speech.resetTranscript();
                                    setAnswer("");
                                    setRecordingMethod("mic");
                                    speech.startListening();
                                }
                            }}
                            disabled={loading || ending}
                            title={speech.isListening ? "Stop recording" : "Record with microphone"}
                            style={{
                                padding: "10px 12px", flexShrink: 0, borderRadius: 10,
                                border: `1px solid ${speech.isListening ? "rgba(239,68,68,0.4)" : "var(--border-subtle)"}`,
                                background: speech.isListening ? "rgba(239,68,68,0.08)" : "var(--bg-card)",
                                cursor: (loading || ending) ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s", position: "relative",
                                opacity: (loading || ending) ? 0.4 : 1,
                            }}
                        >
                            {speech.isListening && (
                                <span style={{
                                    position: "absolute", top: -2, right: -2, width: 8, height: 8,
                                    borderRadius: "50%", background: "#ef4444",
                                    animation: "pulse 1.5s ease-in-out infinite",
                                }} />
                            )}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke={speech.isListening ? "#ef4444" : "var(--text-muted)"}
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        </button>
                    )}

                    {/* Audio recording button */}
                    {voiceMode === "recording" && audioRecorder.isSupported && (
                        <button
                            type="button"
                            onClick={() => {
                                if (audioRecorder.isRecording) {
                                    audioRecorder.stopRecording();
                                } else {
                                    if (speech.isListening) {
                                        speech.stopListening();
                                    }
                                    speech.clearError();
                                    setRecordingMethod("audio");
                                    audioRecorder.startRecording();
                                }
                            }}
                            disabled={loading || ending}
                            title={audioRecorder.isRecording ? "Stop audio recording" : "Start audio recording"}
                            style={{
                                padding: "10px 12px", flexShrink: 0, borderRadius: 10,
                                border: `1px solid ${audioRecorder.isRecording ? "rgba(16,185,129,0.45)" : "var(--border-subtle)"}`,
                                background: audioRecorder.isRecording ? "rgba(16,185,129,0.1)" : "var(--bg-card)",
                                cursor: (loading || ending) ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s", position: "relative",
                                opacity: (loading || ending) ? 0.4 : 1,
                            }}
                        >
                            {audioRecorder.isRecording && (
                                <span style={{
                                    position: "absolute", top: -2, right: -2, width: 8, height: 8,
                                    borderRadius: "50%", background: "#059669",
                                    animation: "pulse 1.5s ease-in-out infinite",
                                }} />
                            )}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={audioRecorder.isRecording ? "#059669" : "none"}
                                stroke={audioRecorder.isRecording ? "#059669" : "var(--text-muted)"}
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="7" />
                            </svg>
                        </button>
                    )}
                </form>

                {!speech.isSupported && voiceMode === "typing" && (
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            Voice typing is unavailable in this browser. Use Chrome/Edge or type manually.
                        </span>
                    </div>
                )}

                {!audioRecorder.isSupported && voiceMode === "recording" && (
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            Audio recording is unavailable in this browser.
                        </span>
                    </div>
                )}

                {/* Voice typing indicator */}
                {voiceMode === "typing" && speech.isListening && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s ease-in-out infinite" }} />
                        <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 500 }}>Recording... speak your answer</span>
                    </div>
                )}

                {/* Audio recording indicator */}
                {voiceMode === "recording" && audioRecorder.isRecording && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", animation: "pulse 1.5s ease-in-out infinite" }} />
                        <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>
                            Recording audio... {formatDuration(audioRecorder.durationSec)}
                        </span>
                    </div>
                )}

                {voiceMode === "recording" && audioRecorder.audioUrl && (
                    <div style={{ maxWidth: 760, margin: "10px auto 0", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
                        <audio controls src={audioRecorder.audioUrl} style={{ width: "100%" }} />
                        <span style={{ fontSize: 10.5, color: "var(--text-muted)", display: "block", marginTop: 6 }}>
                            Audio is kept in this browser session for playback only.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// MessageBubble is provided by src/components/MessageBubble.jsx
