import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="page-bg min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-4xl w-full mx-auto px-6 pt-28 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-8 font-mono">
                    <button onClick={() => navigate("/")} className="hover:text-[var(--text)] transition-colors">HOME</button>
                    <span>/</span>
                    <span className="text-[var(--color-accent)]">ABOUT</span>
                </div>

                {/* Header */}
                <motion.div className="text-center mb-16" {...fadeUp(0.05)}>
                    <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase bg-[rgba(124,58,237,0.1)] px-3 py-1.5 rounded-full">
                        About Us
                    </span>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)] mt-4 mb-6 tracking-tight">
                        Democratizing <span className="gradient-text-static">Interview</span> Prep
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        We believe high-quality technical interview preparation shouldn't be gated behind expensive subscriptions. InterviewAI provides adaptive, enterprise-grade mock practice for everyone.
                    </p>
                </motion.div>

                {/* Core Story */}
                <motion.div className="glass-card p-8 sm:p-10 mb-12" {...fadeUp(0.1)}>
                    <h2 className="font-heading text-2xl font-bold text-[var(--text)] mb-4">Our Story</h2>
                    <div className="space-y-4 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                        <p>
                            InterviewAI was founded in early 2026. In an industry where software engineering interviews have become increasingly rigorous, candidates are often forced to pay hundreds of dollars for mock interviews, premium algorithms, or coaching classes.
                        </p>
                        <p>
                            We set out to build a platform that utilizes state-of-the-art Generative AI to simulate authentic interview scenarios. By leveraging Groq's high-speed inference engine and open-weight models like LLaMA 3.3 70B, we created a tool that listens to your answers, evaluates your technical accuracy, checks your communication skills, and provides instant, constructive feedback.
                        </p>
                        <p>
                            Today, InterviewAI powers thousands of mock sessions daily, helping engineers from self-taught developers and bootcamp graduates to senior architects land their dream roles.
                        </p>
                    </div>
                </motion.div>

                {/* Grid Values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        {
                            title: "Absolute Accessibility",
                            desc: "Everyone deserves a level playing field. Our free tier provides robust practice limits, and our premium plans are priced to be accessible globally in local currencies.",
                            icon: (
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ),
                        },
                        {
                            title: "Empathetic Technology",
                            desc: "Our AI is engineered to be encouraging yet highly precise. It guides you through hints when you're stuck and points out the exact lines where you can optimize.",
                            icon: (
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            ),
                        },
                        {
                            title: "Full Privacy Control",
                            desc: "Your data stays yours. With our custom database connections, all your logs can sit on your own PostgreSQL. We never sell your interview responses.",
                            icon: (
                                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            ),
                        },
                    ].map((val, idx) => (
                        <motion.div 
                            key={val.title} 
                            className="glass-card p-6 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 relative group overflow-hidden" 
                            {...fadeUp(0.15 + idx * 0.05)}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-xl bg-[rgba(124,58,237,0.08)] flex items-center justify-center mb-4">
                                {val.icon}
                            </div>
                            <h3 className="font-heading text-lg font-bold text-[var(--text)] mb-2">{val.title}</h3>
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{val.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tech Stack Details */}
                <motion.div className="mb-16" {...fadeUp(0.3)}>
                    <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4 mb-8">
                        <span className="text-[10px] font-bold font-mono text-[var(--color-accent)] tracking-widest block bg-[rgba(124,58,237,0.06)] px-2.5 py-1 rounded">ARCHITECTURE</span>
                        <h2 className="font-heading text-2xl font-bold text-[var(--text)]">Our Technical Foundation</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Frontend & Interface",
                                desc: "Blazing fast UI compilation and responsive client-side routing. Features smooth micro-animations and micro-interactions.",
                                badges: ["React 19", "Vite", "Tailwind CSS v4", "Framer Motion"],
                                color: "border-purple-500/20 text-purple-400 bg-purple-500/5",
                            },
                            {
                                title: "Backend & AI Inference",
                                desc: "High-performance processing server that handles conversation history, formats prompt templates, and runs low-latency AI mock grading.",
                                badges: ["Node.js", "Express", "Groq LPU", "LLaMA 3.3 (70B)"],
                                color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
                            },
                            {
                                title: "Database & Schema",
                                desc: "Secure serverless data layer storing user profile metadata, mock sessions history, and answers feedback with instant cascading resets.",
                                badges: ["Neon Postgres", "Drizzle ORM", "SQL", "Serverless"],
                                color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5",
                            },
                            {
                                title: "Identity & Transaction",
                                desc: "Federated login validation, MFA session tokens, and secure subscription processing supporting monthly and quarterly intervals.",
                                badges: ["Clerk Auth", "Stripe Billing", "JWT Tokens", "SSL/TLS 1.3"],
                                color: "border-pink-500/20 text-pink-400 bg-pink-500/5",
                            },
                        ].map((stack) => (
                            <div 
                                key={stack.title}
                                className="glass-card p-6 flex flex-col justify-between hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] opacity-45 group-hover:opacity-100 transition-opacity" />
                                
                                <div>
                                    <h3 className="font-bold text-[var(--text)] text-base mb-2">{stack.title}</h3>
                                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{stack.desc}</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {stack.badges.map(badge => (
                                        <span 
                                            key={badge}
                                            className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded border ${stack.color}`}
                                        >
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div className="text-center mt-6" {...fadeUp(0.35)}>
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
