import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

const FAQS = [
    {
        category: "General Platform Questions",
        tag: "BASICS",
        items: [
            {
                q: "What is InterviewAI?",
                a: "InterviewAI is an AI-powered mock interview platform that simulates authentic technical and behavioral interview environments. Our AI agent adapts its follow-up questions dynamically to your selected tech stack, experience level, and responses, providing granular scoring and verbal improvement tips at the end of each session.",
            },
            {
                q: "Is it free to use?",
                a: "Yes! Our Free Plan allows you to conduct up to 10 full mock interviews with real-time AI scoring and session review. To perform unlimited practice sessions, upload custom resumes for AI review, access live speech flows, or activate custom industry panels, you can upgrade to our Pro or Pro Max plans starting at ₹499.",
            },
            {
                q: "What AI model powers the mock interviews?",
                a: "We use Groq-hosted LLaMA 3.3 70B models for prompt evaluations, question synthesis, and performance scoring. Groq's high-speed LPU inference engine allows our interviewer agent to respond in under 1.5 seconds, mimicking real-world face-to-face conversations.",
            },
            {
                q: "What types of interviews are supported?",
                a: "We currently support Technical interviews (covering DSA, coding tasks, and architectural system designs), Behavioral interviews (covering leadership, engineering conflicts, and career growth), and Mixed interviews combining both models.",
            },
        ],
    },
    {
        category: "Features & Stripe Billing",
        tag: "SUBSCRIPTIONS",
        items: [
            {
                q: "How does the speech-to-text microphone feature work?",
                a: "During an active interview, you can toggle the microphone icon. Your device's microphone captures audio, which is converted to text dynamically in your browser using the HTML5 Web Speech API. You can review and edit this transcript before submitting it to the AI interviewer.",
            },
            {
                q: "Is my webcam video feed recorded or saved?",
                a: "Absolutely not. The webcam toggle is completely local and runs directly in your browser using the HTML5 getUserMedia API. We use it solely to let you practice eye contact and body language. No video data is ever recorded, stored, or transmitted to any servers.",
            },
            {
                q: "How does Stripe billing handle monthly vs quarterly cycles?",
                a: "Paid plans are managed securely via Stripe Checkout. You can select Monthly or Quarterly intervals. For example, Pro is ₹499 billed monthly or ₹1,000 billed quarterly (saving you up to 33%). You can cancel renewal anytime directly from your dashboard billing portal.",
            },
            {
                q: "How is my answer graded?",
                a: "Each answer receives an individual score out of 10 based on criteria including: technical accuracy, code optimization, clarity of communication, and relevance to constraints. At the end, these are aggregated into a final score report with structural suggestions.",
            },
        ],
    },
    {
        category: "Data Privacy & Database Configs",
        tag: "INFRASTRUCTURE",
        items: [
            {
                q: "Do I need to host my own database to save histories?",
                a: "No! By default, the platform works in-memory. However, if you want full session histories, dashboard analytics, and persistent scores, you can add a database connection. In paid tiers, we host a secure serverless Neon database instance for you automatically.",
            },
            {
                q: "Is my personal data safe?",
                a: "Yes. All data transmitted between the client, backend server, and database use secure SSL/TLS protocols. Personal authentication credentials are isolated and managed by Clerk Auth, which complies with SOC2 and GDPR requirements.",
            },
        ],
    },
];

export default function FAQPage() {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState("");

    function toggleFaq(key) {
        setOpenIndex(prev => (prev === key ? "" : key));
    }

    return (
        <div className="page-bg min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-4xl w-full mx-auto px-6 pt-28 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-8 font-mono tracking-wider">
                    <button onClick={() => navigate("/")} className="hover:text-[var(--text)] transition-colors">HOME</button>
                    <span>/</span>
                    <span className="text-[var(--color-accent)]">FAQ</span>
                </div>

                {/* Header */}
                <motion.div className="text-center mb-16" {...fadeUp(0.05)}>
                    <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase bg-[rgba(124,58,237,0.1)] px-4 py-2 rounded-full border border-[rgba(124,58,237,0.2)]">
                        FAQ
                    </span>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)] mt-4 mb-6 tracking-tight">
                        Frequently Asked <span className="gradient-text-static">Questions</span>
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        Find answers to common questions about our AI models, subscription billing, data privacy, and speech recognition tech.
                    </p>
                </motion.div>

                {/* FAQ categories */}
                <div className="space-y-12 mb-12">
                    {FAQS.map((category, catIdx) => (
                        <motion.div key={category.category} className="space-y-4" {...fadeUp(0.1 + catIdx * 0.05)}>
                            {/* Category Title */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[9px] font-bold font-mono text-[var(--color-accent)] tracking-widest block bg-[rgba(124,58,237,0.06)] px-2 py-0.5 rounded">
                                    {category.tag}
                                </span>
                                <h2 className="font-heading text-lg font-bold text-[var(--text)]">
                                    {category.category}
                                </h2>
                            </div>
                            
                            <div className="space-y-3">
                                {category.items.map((item, itemIdx) => {
                                    const faqKey = `${catIdx}-${itemIdx}`;
                                    const isOpen = openIndex === faqKey;
                                    
                                    return (
                                        <div 
                                            key={item.q} 
                                            className="glass-card overflow-hidden hover:border-[rgba(124,58,237,0.25)] transition-all duration-300 relative group"
                                        >
                                            {/* Glow strip on left side when open */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-30"}`} />
                                            
                                            <button 
                                                onClick={() => toggleFaq(faqKey)}
                                                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[var(--text)] hover:bg-[rgba(255,255,255,0.01)] transition-colors border-none cursor-pointer"
                                                style={{ background: "none" }}
                                            >
                                                <span className={`${isOpen ? "text-[var(--color-accent)]" : "text-[var(--text)]"} transition-colors`}>{item.q}</span>
                                                <svg 
                                                    className={`w-5 h-5 text-[var(--text-muted)] transform transition-transform duration-300 ${isOpen ? "rotate-180 text-[var(--color-primary)]" : ""}`} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            
                                            <AnimatePresence initial={false}>
                                                {isOpen && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                                    >
                                                        <div className="px-6 pb-5 pt-1 border-t border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                                                            {item.a}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Action Buttons */}
                <motion.div className="text-center mt-8" {...fadeUp(0.2)}>
                    <button 
                        onClick={() => navigate("/")}
                        className="btn-secondary text-sm px-8 py-3 rounded-xl transition-all"
                    >
                        ← Back to Home
                    </button>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
