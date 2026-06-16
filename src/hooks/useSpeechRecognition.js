import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for Web Speech API (speech-to-text).
 * Works in Chrome/Edge. Falls back gracefully in unsupported browsers.
 */
export default function useSpeechRecognition() {
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const restartTimerRef = useRef(null);

    const SpeechRecognition =
        typeof window !== "undefined"
            ? window.SpeechRecognition || window.webkitSpeechRecognition
            : null;

    const isSupported = !!SpeechRecognition;

    useEffect(() => {
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            let final = "";
            let interim = "";
            // Start from event.resultIndex to avoid re-processing already-finalized results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript + " ";
                } else {
                    interim += result[0].transcript;
                }
            }
            if (final) setTranscript((prev) => prev + final);
            setInterimTranscript(interim);
        };

        recognition.onerror = (event) => {
            if (event.error === "no-speech") {
                // Transient — browser fires this when silence is detected.
                // Don't log, don't stop. onend will auto-restart.
                return;
            }
            console.warn("Speech recognition error:", event.error);
            if (event.error === "not-allowed") {
                setError("Microphone permission denied. Please allow microphone access in your browser settings.");
                if (recognitionRef.current) recognitionRef.current._shouldListen = false;
                setIsListening(false);
            } else if (event.error === "audio-capture") {
                setError("No microphone found. Please connect a microphone.");
                if (recognitionRef.current) recognitionRef.current._shouldListen = false;
                setIsListening(false);
            } else if (event.error === "network") {
                setError("Network error during speech recognition.");
                if (recognitionRef.current) recognitionRef.current._shouldListen = false;
                setIsListening(false);
            } else if (event.error === "aborted") {
                // Aborted intentionally (e.g., by calling stop/abort) — ignore
                return;
            } else {
                setError(`Speech recognition error: ${event.error}`);
                if (recognitionRef.current) recognitionRef.current._shouldListen = false;
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            // Restart if still supposed to be listening (browser auto-stops after no-speech or timeout)
            if (recognitionRef.current?._shouldListen) {
                // Small delay to avoid "already started" race condition in Chrome
                clearTimeout(restartTimerRef.current);
                restartTimerRef.current = setTimeout(() => {
                    if (recognitionRef.current?._shouldListen) {
                        try { recognition.start(); } catch { /* ignore */ }
                    }
                }, 100);
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            clearTimeout(restartTimerRef.current);
            recognition.abort();
        };
    }, [SpeechRecognition]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;

        if (recognitionRef.current._shouldListen) return;

        try {
            recognitionRef.current._shouldListen = true;
            recognitionRef.current.start();
            setInterimTranscript("");
            setError(null);
        } catch (err) {
            console.warn("Failed to start speech recognition:", err);
            setError("Failed to start speech recognition. Please try again.");
            recognitionRef.current._shouldListen = false;
            setIsListening(false);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current._shouldListen = false;
        try {
            recognitionRef.current.stop();
        } catch {
            // ignore InvalidStateError when recognition has already stopped
        }
        setIsListening(false);
        setInterimTranscript("");
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript("");
        setInterimTranscript("");
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        transcript,
        interimTranscript,
        isListening,
        isSupported,
        error,
        startListening,
        stopListening,
        resetTranscript,
        clearError,
        fullTranscript: transcript + interimTranscript,
    };
}
