import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for webcam preview using getUserMedia.
 * Provides a video ref to attach to a <video> element.
 * Webcam is for practice immersion only — nothing is recorded or sent.
 */
export default function useWebcam() {
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Compute support once — no effect/setState needed
    const isSupported =
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia;

    // Whenever isActive changes, attach/detach stream to the <video> element.
    // This runs *after* render, so videoRef.current is guaranteed to exist.
    useEffect(() => {
        if (isActive && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
        if (!isActive && videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [isActive]);

    const startWebcam = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setError("Webcam not supported in this browser.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: "user" },
                audio: false,
            });
            streamRef.current = stream;
            // Trigger the effect above to attach srcObject
            setIsActive(true);
            setError(null);
        } catch (err) {
            const msg =
                err.name === "NotAllowedError"
                    ? "Camera permission denied. Please allow camera access in your browser settings."
                    : err.name === "NotFoundError"
                        ? "No camera found. Please connect a webcam."
                        : err.name === "NotReadableError"
                            ? "Camera is in use by another application."
                            : err.message || "Failed to access webcam.";
            setError(msg);
            console.warn("Webcam error:", err);
        }
    }, []);

    const stopWebcam = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setIsActive(false);
    }, []);

    const toggleWebcam = useCallback(() => {
        if (isActive) {
            stopWebcam();
        } else {
            startWebcam();
        }
    }, [isActive, startWebcam, stopWebcam]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    return {
        videoRef,
        isActive,
        isSupported,
        error,
        startWebcam,
        stopWebcam,
        toggleWebcam,
    };
}
