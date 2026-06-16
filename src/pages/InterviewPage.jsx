import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import MessageBubble from "../components/MessageBubble";
import { submitAnswer, endInterview, transcribeAudio, getInterview } from "../services/api";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useWebcam from "../hooks/useWebcam";
import useAudioRecorder from "../hooks/useAudioRecorder";
import Editor from "@monaco-editor/react";

// IndexedDB Helper to store session video replay locally
function saveVideoToIndexedDB(interviewId, blob) {
    const request = indexedDB.open("InterviewVideoDB", 1);
    request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("videos")) {
            db.createObjectStore("videos", { keyPath: "interviewId" });
        }
    };
    request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction("videos", "readwrite");
        const store = tx.objectStore("videos");
        store.put({ interviewId: parseInt(interviewId), blob, timestamp: Date.now() });
    };
}

export default function InterviewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { role: stateRole, level: stateLevel, techStack: stateTechStack, firstQuestion, interviewId: initId, timedMode: initTimedMode, interviewer: initInterviewer, interviewType: stateInterviewType } = location.state || {};

    const [role, setRole] = useState(stateRole || "");
    const [level, setLevel] = useState(stateLevel || "");
    const [techStack, setTechStack] = useState(stateTechStack || "");
    const [interviewType, setInterviewType] = useState(stateInterviewType || "technical");

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const queryId = queryParams.get("id");
    const [interviewId, setInterviewId] = useState(initId || (queryId ? parseInt(queryId) : null));
    const [restoring, setRestoring] = useState(false);
    const [transcribing, setTranscribing] = useState(false);

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
    
    // Tier 1: Delivery Presence Alerts
    const [coachAlerts, setCoachAlerts] = useState([]);
    const lastFrameDataRef = useRef(null);
    const outOfFrameCountRef = useRef(0);
    const eyeContactAwayCountRef = useRef(0);

    // Tier 2: Monaco coding editor whiteboard
    const [code, setCode] = useState("// Write your solution or code here\n");
    const [codeLanguage, setCodeLanguage] = useState("javascript");

    // Tier 2: Text-to-Speech (TTS)
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [ttsVoice, setTtsVoice] = useState(null);
    const [voices, setVoices] = useState([]);

    // Tier 2: Countdown Timer
    const [timedMode, setTimedMode] = useState(initTimedMode || false);
    const [timeLeft, setTimeLeft] = useState(120);

    // Tier 3: Panel Mode Active Interviewer
    const [activeInterviewer, setActiveInterviewer] = useState(initInterviewer || { name: "David", role: "Technical Lead", avatar: "david", badge: "Tech Lead" });

    // Local Video recording refs
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // ── Speech Recognition ─────────────────────────────
    const speech = useSpeechRecognition();
    const audioRecorder = useAudioRecorder();

    // ── Webcam ─────────────────────────────────────────
    // Destructure so ESLint can distinguish refs from state
    const {
        videoRef: webcamVideoRef,
        streamRef: webcamStreamRef,
        isActive: webcamActive,
        isSupported: webcamSupported,
        error: webcamError,
        toggleWebcam,
    } = useWebcam();

    // Sync speech transcript into the textarea
    // This is syncing external system state (Web Speech API) into React — the intended use of effects
    useEffect(() => {
        if (speech.fullTranscript) {
            setAnswer(speech.fullTranscript);
            setRecordingMethod("mic");
        }
    }, [speech.fullTranscript]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryId = queryParams.get("id");
        if (!firstQuestion && !queryId) {
            navigate("/setup");
            return;
        }

        if (firstQuestion) {
            const id = requestAnimationFrame(() => setTyping(true));
            const timer = setTimeout(() => {
                setTyping(false);
                setCurrentQuestion(firstQuestion);
                setMessages([{ type: "ai", content: firstQuestion }]);
                setQuestionCount(1);
            }, 1200);
            return () => { clearTimeout(timer); cancelAnimationFrame(id); };
        }
    }, [firstQuestion, navigate, location.search]);

    // Sync interviewId from URL query param if present
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryId = queryParams.get("id");
        if (queryId && !interviewId) {
            setInterviewId(parseInt(queryId));
        }
    }, [location.search, interviewId]);

    // Restore session on page refresh or direct navigation with id
    useEffect(() => {
        if (!interviewId || role) return;

        async function restoreSession() {
            setRestoring(true);
            setLoading(true);
            try {
                const data = await getInterview(interviewId, null);
                if (data.interview) {
                    setRole(data.interview.role);
                    setLevel(data.interview.level);
                    setTechStack(data.interview.techStack);
                    setInterviewType(data.interview.interviewType || "technical");
                    
                    if (data.interview.status === "completed") {
                        navigate(`/report?id=${interviewId}`, { replace: true });
                        return;
                    }

                    const dbQuestions = data.questions || [];
                    const answered = dbQuestions.filter(q => q.userAnswer);
                    
                    const reconstructedHistory = answered.map(q => ({
                        question: q.question,
                        answer: q.userAnswer,
                        evaluation: q.evaluation,
                        score: q.score
                    }));
                    setHistory(reconstructedHistory);

                    const msgs = [];
                    dbQuestions.forEach((q) => {
                        msgs.push({ type: "ai", content: q.question });
                        if (q.userAnswer) {
                            msgs.push({ type: "user", content: q.userAnswer });
                            if (q.evaluation) {
                                msgs.push({ type: "evaluation", content: q.evaluation, score: q.score });
                            }
                        }
                    });
                    setMessages(msgs);

                    const currentQ = dbQuestions.find(q => !q.userAnswer);
                    if (currentQ) {
                        setCurrentQuestion(currentQ.question);
                        setQuestionCount(answered.length + 1);
                    } else {
                        const lastQuestionText = dbQuestions[dbQuestions.length - 1]?.question || "";
                        setCurrentQuestion(lastQuestionText);
                        setQuestionCount(dbQuestions.length);
                    }
                } else {
                    navigate("/setup");
                }
            } catch (err) {
                console.error("Failed to restore session:", err);
                navigate("/setup");
            } finally {
                setRestoring(false);
                setLoading(false);
            }
        }

        restoreSession();
    }, [interviewId, role, navigate]);

    // Automatically upload and transcribe recorded audio blob
    useEffect(() => {
        if (audioRecorder.audioBlob) {
            handleAudioUpload(audioRecorder.audioBlob);
        }
    }, [audioRecorder.audioBlob]);

    async function handleAudioUpload(blob) {
        setTranscribing(true);
        setAnswer("");
        try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64Data = reader.result.split(",")[1];
                try {
                    const data = await transcribeAudio(base64Data, blob.type);
                    if (data && data.text) {
                        setAnswer(data.text);
                        setRecordingMethod("audio");
                    }
                } catch (err) {
                    console.error("Transcription API call failed:", err);
                    setAnswer("Error: Transcription failed. Please type your answer or try recording again.");
                } finally {
                    setTranscribing(false);
                }
            };
        } catch (err) {
            console.error("Failed to read audio blob:", err);
            setTranscribing(false);
        }
    }

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

    // Frontend cycle helper for panel interviewer restoration
    const FRONTEND_PERSONAS = useMemo(() => [
        { name: "David", role: "Technical Lead", avatar: "david", badge: "Tech Lead" },
        { name: "Elena", role: "Product Manager", avatar: "elena", badge: "PM" },
        { name: "Sarah", role: "Hiring Manager", avatar: "sarah", badge: "HM" }
    ], []);

    const getInterviewerForStepFrontend = useCallback((stepIndex, type) => {
        if (type === "technical") {
            const techPersonas = [FRONTEND_PERSONAS[0], FRONTEND_PERSONAS[0], FRONTEND_PERSONAS[1], FRONTEND_PERSONAS[0], FRONTEND_PERSONAS[2]];
            return techPersonas[stepIndex % techPersonas.length];
        } else if (type === "behavioral") {
            const behavioralPersonas = [FRONTEND_PERSONAS[2], FRONTEND_PERSONAS[1], FRONTEND_PERSONAS[2], FRONTEND_PERSONAS[1]];
            return behavioralPersonas[stepIndex % behavioralPersonas.length];
        } else {
            return FRONTEND_PERSONAS[stepIndex % FRONTEND_PERSONAS.length];
        }
    }, [FRONTEND_PERSONAS]);

    // Speech synthesis helper
    const speakQuestion = useCallback((text) => {
        if (!ttsEnabled) return;
        window.speechSynthesis.cancel();
        // Remove code blocks from reading
        const cleanText = text.replace(/```[\s\S]*?```/g, "").replace(/\[Whiteboard Code[\s\S]*?\]/g, "").trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        if (ttsVoice) {
            utterance.voice = ttsVoice;
        }
        window.speechSynthesis.speak(utterance);
    }, [ttsEnabled, ttsVoice]);

    // TTS Voices Loading
    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            setVoices(allVoices);
            const englishVoice = allVoices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))) || allVoices[0];
            setTtsVoice(englishVoice);
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // Speak new questions
    useEffect(() => {
        if (currentQuestion && ttsEnabled) {
            const timer = setTimeout(() => {
                speakQuestion(currentQuestion);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, speakQuestion, ttsEnabled]);

    // Active interviewer state sync on session restore
    useEffect(() => {
        if (history.length > 0 && role) {
            const nextInterviewer = getInterviewerForStepFrontend(history.length, interviewType);
            setActiveInterviewer(nextInterviewer);
        }
    }, [history.length, role, interviewType, getInterviewerForStepFrontend]);

    // Local Video recording trigger
    useEffect(() => {
        if (webcamActive && webcamStreamRef.current) {
            recordedChunksRef.current = [];
            try {
                const options = { mimeType: "video/webm;codecs=vp9,opus" };
                let recorder;
                try {
                    recorder = new MediaRecorder(webcamStreamRef.current, options);
                } catch {
                    recorder = new MediaRecorder(webcamStreamRef.current);
                }
                mediaRecorderRef.current = recorder;
                recorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        recordedChunksRef.current.push(e.data);
                    }
                };
                recorder.start(1000);
                console.log("[RECORDER] Started recording webcam session locally");
            } catch (err) {
                console.warn("[RECORDER] Failed to start media recorder:", err);
            }
        }
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current = null;
            }
        };
    }, [webcamActive, webcamStreamRef]);

    // Toast Alert Generator for Delivery Coach
    const addCoachAlert = useCallback((message) => {
        const id = Date.now();
        setCoachAlerts(prev => {
            const filtered = prev.filter(a => a.message !== message);
            return [...filtered, { id, message }].slice(-3);
        });
        setTimeout(() => {
            setCoachAlerts(prev => prev.filter(a => a.id !== id));
        }, 4000);
    }, []);

    // Presence & Posture Checker loop
    useEffect(() => {
        if (!webcamActive || !webcamVideoRef.current) {
            lastFrameDataRef.current = null;
            return;
        }

        const videoElement = webcamVideoRef.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 80;
        canvas.height = 60;

        const interval = setInterval(() => {
            if (videoElement.readyState < 2) return;
            
            try {
                ctx.drawImage(videoElement, 0, 0, 80, 60);
                const imgData = ctx.getImageData(0, 0, 80, 60);
                const pixels = imgData.data;

                // 1. Luminosity Check
                let totalBrightness = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i+1];
                    const b = pixels[i+2];
                    totalBrightness += (0.299*r + 0.587*g + 0.114*b);
                }
                const avgBrightness = totalBrightness / (80 * 60);
                if (avgBrightness < 45) {
                    addCoachAlert("Lighting is too dim — brighten your environment");
                }

                // 2. Fidgeting, Centering & Eye Contact Checks
                if (lastFrameDataRef.current) {
                    const prevPixels = lastFrameDataRef.current;
                    let totalDiff = 0;
                    let leftWeight = 0;
                    let rightWeight = 0;
                    let activeDiffPixels = 0;

                    for (let i = 0; i < pixels.length; i += 4) {
                        const diff = Math.abs(pixels[i] - prevPixels[i]) +
                                     Math.abs(pixels[i+1] - prevPixels[i+1]) +
                                     Math.abs(pixels[i+2] - prevPixels[i+2]);
                        totalDiff += diff;

                        const x = (i / 4) % 80;
                        if (diff > 45) {
                            activeDiffPixels++;
                            if (x < 27) leftWeight++;
                            else if (x > 53) rightWeight++;
                        }
                    }

                    // Fidgeting index (motion fraction)
                    const changeFraction = activeDiffPixels / (80 * 60);
                    if (changeFraction > 0.18) {
                        addCoachAlert("Steady posture shows confidence — avoid fidgeting");
                    }

                    // Centering check
                    const ratio = Math.abs(leftWeight - rightWeight) / Math.max(leftWeight + rightWeight, 1);
                    if (ratio > 0.52 && (leftWeight + rightWeight) > 120) {
                        outOfFrameCountRef.current += 1;
                        if (outOfFrameCountRef.current >= 4) {
                            addCoachAlert("Center yourself in the camera frame");
                            outOfFrameCountRef.current = 0;
                        }
                    } else {
                        outOfFrameCountRef.current = 0;
                    }

                    // Eye contact check (proxy via off-axis posture shifts)
                    if (ratio > 0.45 && changeFraction > 0.05) {
                        eyeContactAwayCountRef.current += 1;
                        if (eyeContactAwayCountRef.current >= 4) {
                            addCoachAlert("Look directly at the camera for eye contact");
                            eyeContactAwayCountRef.current = 0;
                        }
                    } else {
                        eyeContactAwayCountRef.current = 0;
                    }
                }

                lastFrameDataRef.current = pixels;
            } catch (err) {
                console.warn("Presence checker loop error:", err);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [webcamActive, addCoachAlert, webcamVideoRef]);

    const submitAnswerWrapper = useCallback(async (answerText) => {
        if (!answerText.trim() || loading) return;
        const targetAns = answerText.trim();
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
        setMessages(prev => [...prev, { type: "user", content: targetAns }]);
        setTyping(true);

        const isCodingMode = interviewType === "technical" || interviewType === "mixed";
        const codeToSend = isCodingMode ? code : "";
        const langToSend = isCodingMode ? codeLanguage : "";

        try {
            const result = await submitAnswer({
                role,
                level,
                techStack,
                question: currentQuestion,
                answer: targetAns,
                history,
                interviewId,
                recordingMethod: methodUsed,
                code: codeToSend,
                codeLanguage: langToSend,
                interviewType
            });

            const newEntry = {
                question: currentQuestion,
                answer: targetAns,
                evaluation: result.evaluation,
                score: result.score
            };
            setHistory(prev => [...prev, newEntry]);

            if (result.interviewer) {
                setActiveInterviewer(result.interviewer);
            }

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
                retryData: { question: currentQuestion, answer: targetAns, recordingMethod: methodUsed },
            }]);
        }
        speech.resetTranscript();
        audioRecorder.resetRecording();
        setRecordingMethod("text");
        setLoading(false);
    }, [role, level, techStack, currentQuestion, history, interviewId, recordingMethod, code, codeLanguage, interviewType, speech, audioRecorder]);

    // Timed mode auto-submit loop
    useEffect(() => {
        if (!timedMode || loading || ending || transcribing) return;

        setTimeLeft(120);
        const timerInterval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerInterval);
                    const finalAns = answer.trim() || "(Time expired — candidate did not submit an answer in time)";
                    submitAnswerWrapper(finalAns);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [currentQuestion, timedMode, loading, ending, transcribing, answer, submitAnswerWrapper]);

    async function handleSubmit(e) {
        e?.preventDefault();
        await submitAnswerWrapper(answer);
    }

    const handleRetry = useCallback(async (retryData) => {
        if (!retryData) return;
        setLoading(true);
        setTyping(true);
        setMessages((prev) => prev.filter((m) => m.retryData !== retryData));

        const isCodingMode = interviewType === "technical" || interviewType === "mixed";
        const codeToSend = isCodingMode ? code : "";
        const langToSend = isCodingMode ? codeLanguage : "";

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
                code: codeToSend,
                codeLanguage: langToSend,
                interviewType
            });
            const newEntry = { question: retryData.question, answer: retryData.answer, evaluation: result.evaluation, score: result.score };
            setHistory((prev) => [...prev, newEntry]);

            if (result.interviewer) {
                setActiveInterviewer(result.interviewer);
            }

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
    }, [role, level, techStack, history, interviewId, code, codeLanguage, interviewType]);

    async function handleEnd() {
        if (history.length === 0) return;
        setEnding(true);

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            // Wait briefly for the last chunk to push
            await new Promise(r => setTimeout(r, 400));
            const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
            if (blob.size > 0 && interviewId) {
                saveVideoToIndexedDB(interviewId, blob);
            }
        }

        try {
            const data = await endInterview({ role, level, techStack, history, interviewId });
            navigate(`/report?id=${interviewId}`, { state: { report: data.report, role, level, techStack, totalQuestions: questionCount } });
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

    if (restoring) {
        return (
            <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", alignItems: "center", justifyContent: "center" }}>
                <div style={{ padding: 32, textAlign: "center", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                    <div className="spinner" style={{ width: 32, height: 32, border: "2px solid rgba(124,58,237,0.2)", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Restoring interview session...</p>
                </div>
            </div>
        );
    }

    const voiceError = voiceMode === "typing" ? speech.error : audioRecorder.error;
    const deviceError = webcamError || voiceError;
    const isCodingMode = interviewType === "technical" || interviewType === "mixed";

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
            {/* Header */}
            <header className="px-3 sm:px-5 py-2.5" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: "1px solid var(--border-subtle)", zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.12)" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)" }}>InterviewAI</span>
                    </button>
                    <div style={{ width: 1, height: 18, background: "var(--border-subtle)", margin: "0 4px" }} />
                    <div className="hidden sm:inline-flex" style={{ fontSize: 12.5, color: "var(--text-secondary)", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>{role}</span>
                        <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>•</span>
                        <span>{level}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Countdown Clock */}
                    {timedMode && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "5px 12px", borderRadius: 8,
                            background: timeLeft < 20 ? "rgba(239,68,68,0.12)" : "rgba(124,58,237,0.08)",
                            border: `1px solid ${timeLeft < 20 ? "#ef4444" : "var(--border-subtle)"}`,
                        }}>
                            <svg className={timeLeft < 20 ? "animate-pulse" : ""} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={timeLeft < 20 ? "#ef4444" : "#a78bfa"} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style={{ fontSize: 13, fontWeight: 700, color: timeLeft < 20 ? "#ef4444" : "var(--text)" }}>
                                {timeLeft}s
                            </span>
                        </div>
                    )}

                    {/* Interviewer Voice Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                        <button
                            type="button"
                            onClick={() => setTtsEnabled(!ttsEnabled)}
                            title={ttsEnabled ? "Disable TTS Voice" : "Enable TTS Voice"}
                            style={{ background: "none", border: "none", cursor: "pointer", color: ttsEnabled ? "#7c3aed" : "var(--text-muted)", display: "flex", alignItems: "center", padding: 4 }}
                        >
                            {ttsEnabled ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                            ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                            )}
                        </button>
                        {ttsEnabled && voices.length > 0 && (
                            <select
                                value={voices.indexOf(ttsVoice)}
                                onChange={(e) => setTtsVoice(voices[e.target.value])}
                                style={{ background: "transparent", border: "none", fontSize: 11, color: "var(--text)", outline: "none", maxWidth: 90, cursor: "pointer" }}
                            >
                                {voices.filter(v => v.lang.startsWith("en")).map((v, idx) => (
                                    <option key={idx} value={voices.indexOf(v)}>
                                        {v.name.replace("Microsoft", "").replace("Google", "").replace("Natural", "").trim()}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

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
                            <span className="hidden sm:inline" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Avg</span>
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
                        className="px-2.5 py-1.5 sm:px-3.5 sm:py-2"
                        style={{
                            fontSize: 12, borderRadius: 8, fontWeight: 600,
                            cursor: (history.length === 0 || ending) ? "not-allowed" : "pointer",
                            border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
                            background: "transparent", transition: "all 0.2s",
                            opacity: (history.length === 0 || ending) ? 0.4 : 1,
                        }}
                        onMouseEnter={e => { if (!e.target.disabled) e.target.style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { e.target.style.background = "transparent"; }}
                    >
                        {ending ? "Generating..." : (
                            <>
                                <span className="hidden sm:inline">End Interview</span>
                                <span className="sm:hidden">End</span>
                            </>
                        )}
                    </button>

                    {/* Webcam toggle */}
                    {webcamSupported && (
                        <button
                            onClick={toggleWebcam}
                            title={webcamActive ? "Turn off webcam" : "Turn on webcam"}
                            style={{
                                width: 32, height: 32, borderRadius: "50%",
                                border: `1px solid ${webcamActive ? "rgba(16,185,129,0.4)" : "var(--border-subtle)"}`,
                                background: webcamActive ? "rgba(16,185,129,0.08)" : "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s",
                            }}
                        >
                            {!webcamActive ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                            ) : (
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                            )}
                        </button>
                    )}

                    <ThemeToggle />
                    <UserButton />
                </div>
            </header>

            {/* Device error banner */}
            {deviceError && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 20px",
                    background: "rgba(239,68,68,0.06)", borderBottom: "1px solid rgba(239,68,68,0.15)", flexShrink: 0
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
                <div style={{ display: "flex", gap: 2, padding: "0 20px", height: 3, flexShrink: 0 }}>
                    {stats.scores.map((s, i) => (
                        <div
                            key={i}
                            className="animate-fade-in"
                            style={{ flex: 1, background: getScoreColor(s), borderRadius: 2, opacity: 0.6 }}
                        />
                    ))}
                </div>
            )}

            {/* Workspace Area */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
                
                {/* Live Coach Floating Alerts */}
                <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 100, display: "flex", flexDirection: "column", gap: 6, pointerEvents: "none" }}>
                    <AnimatePresence>
                        {coachAlerts.map(alert => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                style={{
                                    padding: "8px 16px", borderRadius: 8, background: "rgba(124, 58, 237, 0.9)",
                                    color: "#fff", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.15)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)", backdropFilter: "blur(4px)",
                                    textAlign: "center"
                                }}
                            >
                                🔔 {alert.message}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Sidebar Webcam Pane (Only when camera active AND not in coding split screen) */}
                {webcamActive && !isCodingMode && (
                    <div style={{ width: 260, borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", background: "var(--bg-card)", flexShrink: 0 }}>
                        <div style={{ padding: "16px" }}>
                            {/* Draggable/resizable style webcam box */}
                            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-subtle)", background: "#000", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
                                <video
                                    ref={webcamVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                                />
                                <div style={{ position: "absolute", bottom: 8, left: 8, padding: "2px 8px", background: "rgba(16,185,129,0.75)", color: "white", fontSize: 9, fontWeight: 700, borderRadius: 4 }}>
                                    LIVE COACH ACTIVE
                                </div>
                            </div>

                            {/* Active Panel Interviewer Info Card */}
                            {activeInterviewer && (
                                <div className="animate-fade-in" style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border-subtle)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: "50%",
                                            background: activeInterviewer.avatar === "david" ? "#2563eb" : activeInterviewer.avatar === "elena" ? "#db2777" : "#7c3aed",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 14, fontWeight: 700, color: "white"
                                        }}>
                                            {activeInterviewer.name[0]}
                                        </div>
                                        <div>
                                            <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{activeInterviewer.name}</span>
                                            <span style={{ fontSize: 10.5, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                                                <span style={{ padding: "1px 5px", borderRadius: 3, background: "rgba(124,58,237,0.12)", color: "#a78bfa", fontWeight: 700, fontSize: 8 }}>
                                                    {activeInterviewer.badge}
                                                </span>
                                                {activeInterviewer.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Left Side: Chat Column */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 320 }}>
                    
                    {/* Embedded Webcam Row (Only when camera active AND in coding split screen) */}
                    {webcamActive && isCodingMode && (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card)", flexShrink: 0 }}>
                            <div style={{ width: 64, height: 48, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border-subtle)", background: "#000", flexShrink: 0 }}>
                                <video
                                    ref={webcamVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                                />
                            </div>
                            <div>
                                <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--text)" }}>Delivery Coach Active</span>
                                <span style={{ fontSize: 9.5, color: "var(--text-muted)", display: "block" }}>Centering & presence scanner active</span>
                            </div>
                            {activeInterviewer && (
                                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Speaking:</span>
                                    <span style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(124,58,237,0.12)", color: "#a78bfa", fontWeight: 700, fontSize: 10 }}>
                                        {activeInterviewer.name} ({activeInterviewer.badge})
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Standard Speaker badge if camera is disabled */}
                    {!webcamActive && activeInterviewer && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card)", flexShrink: 0 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: activeInterviewer.avatar === "david" ? "#2563eb" : activeInterviewer.avatar === "elena" ? "#db2777" : "#7c3aed",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 700, color: "white"
                            }}>
                                {activeInterviewer.name[0]}
                            </div>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{activeInterviewer.name} is speaking</span>
                            <span style={{ padding: "1px 5px", borderRadius: 3, background: "rgba(124,58,237,0.12)", color: "#a78bfa", fontWeight: 700, fontSize: 9 }}>
                                {activeInterviewer.badge}
                            </span>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
                        <div style={{ maxWidth: 720, margin: "0 auto" }}>
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
                        <div style={{ maxWidth: 720, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
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

                            <span className="hidden sm:inline" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {voiceMode === "typing"
                                    ? "Speak to auto-fill your answer in real time."
                                    : "Record your spoken answer and add notes/transcript before submit."}
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "end" }}>
                            <div style={{ flex: 1, position: "relative" }}>
                                <textarea
                                    ref={textareaRef}
                                    value={answer}
                                    onChange={handleTextareaChange}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                                    placeholder={transcribing
                                        ? "Transcribing audio answer..."
                                        : (voiceMode === "typing"
                                            ? "Type your answer... (Shift+Enter for new line)"
                                            : "Record audio or type a transcript/summary...")}
                                    className="input-field"
                                    rows={1}
                                    disabled={loading || ending || transcribing}
                                    style={{ resize: "none", paddingRight: 50 }}
                                />
                                <span style={{ position: "absolute", right: 12, bottom: 10, fontSize: 10, color: "var(--text-muted)" }}>{answer.length}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={!answer.trim() || loading || ending || transcribing}
                                className="btn-primary"
                                style={{
                                    padding: "10px 16px", flexShrink: 0,
                                    opacity: (!answer.trim() || loading || ending || transcribing) ? 0.4 : 1,
                                    cursor: (!answer.trim() || loading || ending || transcribing) ? "not-allowed" : "pointer",
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
                            <div style={{ maxWidth: 720, margin: "10px auto 0", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
                                <audio controls src={audioRecorder.audioUrl} style={{ width: "100%" }} />
                                <span style={{ fontSize: 10.5, color: "var(--text-muted)", display: "block", marginTop: 6 }}>
                                    {transcribing ? "Transcribing audio via Groq Whisper..." : "Audio is transcribed automatically. You can edit the transcription in the input box."}
                                </span>
                            </div>
                        )}

                        {transcribing && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 8 }}>
                                <div className="spinner" style={{ width: 14, height: 14, border: "2.5px solid rgba(124,58,237,0.2)", borderTop: "2.5px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Transcribing audio answer...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Monaco Code Editor Whiteboard (visible if Coding Mode) */}
                {isCodingMode && (
                    <div style={{ width: "52%", display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border-subtle)", background: "#1e1e1e", overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid #2d2d2d", background: "#181818" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0" }}>Coding Whiteboard</span>
                            </div>
                            <div>
                                <select 
                                    value={codeLanguage} 
                                    onChange={(e) => setCodeLanguage(e.target.value)}
                                    style={{ background: "#2d2d2d", border: "1px solid #444", color: "#fff", fontSize: 12, padding: "4px 8px", borderRadius: 6, outline: "none", cursor: "pointer" }}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language={codeLanguage}
                                value={code}
                                onChange={(val) => setCode(val || "")}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    lineNumbers: "on",
                                    wordWrap: "on",
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// MessageBubble is provided by src/components/MessageBubble.jsx
