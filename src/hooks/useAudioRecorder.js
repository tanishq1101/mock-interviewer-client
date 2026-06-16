import { useState, useRef, useEffect, useCallback } from "react";

function getSupportedMimeType() {
    if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
        return "";
    }

    const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
    ];

    const supported = candidates.find((type) => MediaRecorder.isTypeSupported(type));
    return supported || "";
}

export default function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState("");
    const [durationSec, setDurationSec] = useState(0);
    const [error, setError] = useState(null);

    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const startTsRef = useRef(0);
    const discardOnStopRef = useRef(false);

    const isSupported =
        typeof window !== "undefined" &&
        typeof window.MediaRecorder !== "undefined" &&
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia;

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const revokePreviousUrl = useCallback((prevUrl) => {
        if (prevUrl && typeof URL !== "undefined") {
            URL.revokeObjectURL(prevUrl);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const stopRecording = useCallback(() => {
        const recorder = recorderRef.current;
        if (!recorder) return;

        if (recorder.state !== "inactive") {
            recorder.stop();
        }
    }, []);

    const resetRecording = useCallback(() => {
        discardOnStopRef.current = true;
        chunksRef.current = [];
        clearTimer();
        stopStream();
        setIsRecording(false);
        setDurationSec(0);
        setAudioBlob(null);
        setAudioUrl((prev) => {
            revokePreviousUrl(prev);
            return "";
        });
        setError(null);

        const recorder = recorderRef.current;
        if (recorder && recorder.state !== "inactive") {
            recorder.stop();
        }
    }, [clearTimer, revokePreviousUrl, stopStream]);

    const startRecording = useCallback(async () => {
        if (!isSupported) {
            setError("Audio recording is not supported in this browser.");
            return;
        }

        try {
            discardOnStopRef.current = false;
            setError(null);
            setAudioBlob(null);
            setDurationSec(0);
            setAudioUrl((prev) => {
                revokePreviousUrl(prev);
                return "";
            });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            chunksRef.current = [];

            const mimeType = getSupportedMimeType();
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onerror = (event) => {
                const msg = event.error?.message || "Recording failed.";
                setError(msg);
            };

            recorder.onstop = () => {
                clearTimer();
                stopStream();
                setIsRecording(false);

                if (discardOnStopRef.current) {
                    discardOnStopRef.current = false;
                    chunksRef.current = [];
                    return;
                }

                if (chunksRef.current.length === 0) {
                    setError("No audio was captured. Please try again.");
                    return;
                }

                const blob = new Blob(chunksRef.current, {
                    type: recorder.mimeType || "audio/webm",
                });
                chunksRef.current = [];
                setAudioBlob(blob);
                setAudioUrl((prev) => {
                    revokePreviousUrl(prev);
                    return URL.createObjectURL(blob);
                });
            };

            recorderRef.current = recorder;
            recorder.start(250);
            startTsRef.current = Date.now();
            setIsRecording(true);

            clearTimer();
            timerRef.current = setInterval(() => {
                const elapsed = Math.max(0, Math.floor((Date.now() - startTsRef.current) / 1000));
                setDurationSec(elapsed);
            }, 250);
        } catch (err) {
            clearTimer();
            stopStream();
            setIsRecording(false);

            const msg =
                err.name === "NotAllowedError"
                    ? "Microphone permission denied. Please allow microphone access in browser settings."
                    : err.name === "NotFoundError"
                        ? "No microphone found. Please connect one and try again."
                        : err.name === "NotReadableError"
                            ? "Microphone is in use by another application."
                            : err.message || "Failed to start audio recording.";
            setError(msg);
        }
    }, [clearTimer, isSupported, revokePreviousUrl, stopStream]);

    useEffect(() => {
        return () => {
            clearTimer();
            stopStream();
            const recorder = recorderRef.current;
            if (recorder && recorder.state !== "inactive") {
                recorder.stop();
            }
            if (audioUrl && typeof URL !== "undefined") {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl, clearTimer, stopStream]);

    return {
        isSupported,
        isRecording,
        audioBlob,
        audioUrl,
        durationSec,
        error,
        startRecording,
        stopRecording,
        resetRecording,
        clearError,
    };
}
