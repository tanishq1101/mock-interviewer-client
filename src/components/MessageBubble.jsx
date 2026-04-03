import React from "react";

function MessageBubble({ message, getScoreColor, getScoreBg, onRetry }) {
    const { type, content, score, retryData } = message;

    if (type === "ai") {
        return (
            <div className="animate-fade-in" style={{ display: "flex", alignItems: "start", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, background: "rgba(124,58,237,0.15)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "12px 12px 12px 4px", maxWidth: "80%", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                    <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text)" }}>{content}</p>
                </div>
            </div>
        );
    }

    if (type === "user") {
        return (
            <div className="animate-fade-in" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <div style={{ padding: "12px 16px", borderRadius: "12px 12px 4px 12px", maxWidth: "80%", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text)" }}>{content}</p>
                </div>
            </div>
        );
    }

    if (type === "evaluation") {
        return (
            <div className="animate-fade-in" style={{ display: "flex", alignItems: "start", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, background: "rgba(167,139,250,0.15)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "12px 12px 12px 4px", maxWidth: "80%", background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.15)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a78bfa" }}>Evaluation</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: getScoreBg(score), color: getScoreColor(score) }}>
                            {score}/10
                        </span>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>{content}</p>
                </div>
            </div>
        );
    }

    if (type === "error") {
        return (
            <div className="animate-fade-in" style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div style={{
                    padding: "10px 16px", borderRadius: 10, maxWidth: "80%",
                    background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                    textAlign: "center",
                }}>
                    <p style={{ fontSize: 12.5, color: "#ef4444", marginBottom: retryData ? 8 : 0 }}>{content}</p>
                    {retryData && (
                        <button
                            onClick={() => onRetry(retryData)}
                            style={{
                                fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                                border: "1px solid rgba(239,68,68,0.3)", background: "transparent",
                                color: "#ef4444", fontWeight: 600, transition: "all 0.2s",
                            }}
                        >
                            ↻ Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
}

export default React.memo(MessageBubble);
