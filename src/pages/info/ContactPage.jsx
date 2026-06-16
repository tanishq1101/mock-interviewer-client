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

export default function ContactPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", topic: "support", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setForm({ name: "", email: "", topic: "support", message: "" });
        }, 1200);
    }

    return (
        <div className="page-bg min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-5xl w-full mx-auto px-6 pt-28 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-8 font-mono">
                    <button onClick={() => navigate("/")} className="hover:text-[var(--text)] transition-colors">HOME</button>
                    <span>/</span>
                    <span className="text-[var(--color-accent)]">CONTACT</span>
                </div>

                {/* Header */}
                <motion.div className="text-center mb-12" {...fadeUp(0.05)}>
                    <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase bg-[rgba(124,58,237,0.1)] px-4 py-2 rounded-full border border-[rgba(124,58,237,0.2)]">
                        Get in Touch
                    </span>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)] mt-4 mb-4 tracking-tight">
                        We'd Love to <span className="gradient-text-static">Hear</span> from You
                    </h1>
                    <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
                        Have a question, feedback, or need help with a paid subscription? Send us a message and our support team will get back to you within 24 hours.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
                    {/* Left Column: Form */}
                    <motion.div className="glass-card p-6 sm:p-8 md:col-span-7" {...fadeUp(0.1)}>
                        <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-6">Send Message</h2>
                        
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div 
                                    className="text-center py-10"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-[var(--text)] mb-2">Message Sent!</h3>
                                    <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
                                        Thank you for contacting InterviewAI. We have received your inquiry and will respond shortly.
                                    </p>
                                    <button 
                                        onClick={() => setSubmitted(false)}
                                        className="btn-secondary text-xs px-4 py-2"
                                    >
                                        Send Another Message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={form.name}
                                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Your name" 
                                            className="input-field"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={form.email}
                                            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="you@example.com" 
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Inquiry Type</label>
                                        <select 
                                            value={form.topic}
                                            onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))}
                                            className="input-field cursor-pointer pr-10 bg-no-repeat bg-[right_14px_center] bg-[length:16px_16px]"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                                appearance: "none",
                                            }}
                                        >
                                            <option value="support" className="bg-[var(--bg-card)]">General / Account Support</option>
                                            <option value="billing" className="bg-[var(--bg-card)]">Stripe Billing & Premium Plan</option>
                                            <option value="bug" className="bg-[var(--bg-card)]">Bug Report / Technical Issue</option>
                                            <option value="feature" className="bg-[var(--bg-card)]">Feature Request</option>
                                            <option value="partnership" className="bg-[var(--bg-card)]">Partnership & Business</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Message</label>
                                        <textarea 
                                            required
                                            rows="5"
                                            value={form.message}
                                            onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                                            placeholder="Describe your issue or feedback in detail..." 
                                            className="input-field resize-none"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="btn-primary w-full py-3 text-sm font-semibold"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : "Send Message"}
                                    </button>
                                </form>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Right Column: Cards */}
                    <div className="md:col-span-5 space-y-6">
                        {[
                            {
                                title: "Email Support",
                                desc: "For dashboard issues, payment queries, or general questions, email us at:",
                                detail: "support@interviewai.dev",
                                icon: (
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Report a Bug",
                                desc: "Found a transcription glitch or LLM issue? Create a formal bug ticket on our tracker:",
                                detail: "github.com/interviewai/issues",
                                icon: (
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Community Discord",
                                desc: "Join our user community to discuss prep hacks, share interview reviews, and network:",
                                detail: "discord.gg/interviewai",
                                icon: (
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                ),
                            },
                        ].map((item, idx) => (
                            <motion.div 
                                key={item.title} 
                                className="glass-card p-6 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 relative group overflow-hidden" 
                                {...fadeUp(0.15 + idx * 0.05)}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-[rgba(124,58,237,0.08)] flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-heading text-base font-bold text-[var(--text)]">{item.title}</h3>
                                </div>
                                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">{item.desc}</p>
                                <span className="font-mono font-semibold text-xs sm:text-sm text-[var(--color-accent)] bg-[rgba(124,58,237,0.06)] px-2.5 py-1 rounded border border-[rgba(124,58,237,0.15)] inline-block">{item.detail}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <motion.div className="text-center mt-6" {...fadeUp(0.3)}>
                    <button 
                        onClick={() => navigate("/")}
                        className="btn-secondary text-sm px-6 py-2.5"
                    >
                        ← Back to Home
                    </button>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
