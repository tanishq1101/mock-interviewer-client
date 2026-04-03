import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor ───────────────────────────────
api.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (err) => Promise.reject(err)
);

// ── Response interceptor ──────────────────────────────
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (import.meta.env.DEV) {
            const status = err.response?.status || "NETWORK_ERROR";
            const msg = err.response?.data?.error || err.message;
            console.error(`[API] Error ${status}: ${msg}`);
        }
        return Promise.reject(err);
    }
);

// ── Retry wrapper ─────────────────────────────────────
async function withRetry(fn, retries = 1) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === retries) throw err;
            // Only retry on network/timeout errors, not 4xx
            if (err.response?.status >= 400 && err.response?.status < 500) throw err;
            await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        }
    }
}

// ── API methods ───────────────────────────────────────
export async function startInterview(role, level, techStack, interviewType = "technical", userId = null) {
    return withRetry(async () => {
        const response = await api.post("/start", { role, level, techStack, interviewType, userId });
        return response.data;
    });
}

export async function submitAnswer({ role, level, techStack, question, answer, history, interviewId, recordingMethod }) {
    return withRetry(async () => {
        const response = await api.post("/answer", { role, level, techStack, question, answer, history, interviewId, recordingMethod });
        return response.data;
    });
}

export async function endInterview({ role, level, techStack, history, interviewId }) {
    return withRetry(async () => {
        const response = await api.post("/end", { role, level, techStack, history, interviewId });
        return response.data;
    });
}

export async function healthCheck() {
    const response = await api.get("/health");
    return response.data;
}

// ── Dashboard API methods ─────────────────────────────
export async function getInterviews(userId) {
    const response = await api.get("/dashboard", { params: { userId } });
    return response.data;
}

export async function getInterview(id, userId) {
    const response = await api.get(`/dashboard/${id}`, { params: { userId } });
    return response.data;
}

export async function deleteInterview(id, userId) {
    const response = await api.delete(`/dashboard/${id}`, { params: { userId } });
    return response.data;
}

export default api;
