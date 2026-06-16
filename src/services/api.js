import axios from "axios";

let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Defensively append /api subpath if it's a full URL and missing the prefix
if (API_BASE_URL && API_BASE_URL.startsWith("http") && !API_BASE_URL.includes("/api")) {
    API_BASE_URL = API_BASE_URL.replace(/\/$/, "") + "/api";
}

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 50000,
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
export async function startInterview(role, level, techStack, interviewType = "technical", userId = null, resumeText = "") {
    return withRetry(async () => {
        const response = await api.post("/start", { role, level, techStack, interviewType, userId, resumeText });
        return response.data;
    });
}

export async function submitAnswer({ role, level, techStack, question, answer, history, interviewId, recordingMethod, code, codeLanguage, interviewType }) {
    return withRetry(async () => {
        const response = await api.post("/answer", { role, level, techStack, question, answer, history, interviewId, recordingMethod, code, codeLanguage, interviewType });
        return response.data;
    });
}

export async function endInterview({ role, level, techStack, history, interviewId }) {
    return withRetry(async () => {
        const response = await api.post("/end", { role, level, techStack, history, interviewId });
        return response.data;
    });
}

export async function healthCheck(customTimeout = 50000) {
    const response = await api.get("/health", { timeout: customTimeout });
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

export async function getSubscription(userId) {
    const response = await api.get("/subscription", { params: { userId } });
    const data = response.data;
    if (data && (data.plan === "pro" || data.plan === "promax")) {
        data.limit = Infinity;
    }
    return data;
}

export async function simulateUpgrade(plan, billingPeriod, userId) {
    const response = await api.post("/subscription/simulate", { plan, billingPeriod, userId });
    const data = response.data;
    if (data && (data.plan === "pro" || data.plan === "promax")) {
        data.limit = Infinity;
    }
    return data;
}

export async function transcribeAudio(audioBase64, mimeType) {
    const response = await api.post("/transcribe", { audio: audioBase64, mimeType });
    return response.data;
}

export default api;
