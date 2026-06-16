import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

export default function InterviewTipsPage() {
    const navigate = useNavigate();

    return (
        <div className="page-bg min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-4xl w-full mx-auto px-6 pt-28 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-8 font-mono tracking-wider">
                    <button onClick={() => navigate("/")} className="hover:text-[var(--text)] transition-colors">HOME</button>
                    <span>/</span>
                    <span className="text-[var(--color-accent)]">INTERVIEW TIPS</span>
                </div>

                {/* Header */}
                <motion.div className="text-center mb-16" {...fadeUp(0.05)}>
                    <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase bg-[rgba(124,58,237,0.1)] px-4 py-2 rounded-full border border-[rgba(124,58,237,0.2)]">
                        Resources
                    </span>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)] mt-4 mb-6 tracking-tight">
                        Technical <span className="gradient-text-static">Interview</span> Tips
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        A collection of proven strategies compiled from analyzing thousands of mock interviews. Master your communication, coding workflow, and behavioral skills.
                    </p>
                </motion.div>

                {/* Section 1: Before */}
                <motion.div className="mb-16" {...fadeUp(0.1)}>
                    <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4 mb-6">
                        <span className="text-[10px] font-bold font-mono text-[var(--color-accent)] tracking-widest block bg-[rgba(124,58,237,0.06)] px-2.5 py-1 rounded">STAGE 01</span>
                        <h2 className="font-heading text-2xl font-bold text-[var(--text)]">
                            Before the Interview (Prep Phase)
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Research the Company & Role",
                                desc: "Understand their main products, engineering culture, and tech stack. Check their engineering blogs, recent releases, and public GitHub repos. Aligning your experience with their current technical challenges shows high motivation.",
                            },
                            {
                                title: "Brush Up on Core DSA & Systems",
                                desc: "Review foundational data structures (arrays, trees, graphs, hash maps) and common algorithms. For system design, review database sharding, load balancing, caching strategies, and horizontal scaling patterns.",
                            },
                            {
                                title: "Practice Coding Under Time Pressure",
                                desc: "Most coding screens are 30–45 minutes. Practice writing clean, compiling code with a timer. Use InterviewAI to configure mock sessions tailored to your exact stack to replicate real-time pressure.",
                            },
                            {
                                title: "Sanitize Your Workspace & Tech Setup",
                                desc: "Test your camera, microphone, and internet connection 24 hours prior. Find a quiet, well-lit space. Close all unnecessary browser tabs and keep a charged phone hotspot ready as a backup.",
                            },
                        ].map((tip) => (
                            <div 
                                key={tip.title} 
                                className="glass-card p-6 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] opacity-40 group-hover:opacity-100 transition-opacity" />
                                <h3 className="font-bold text-[var(--text)] text-base mb-2">{tip.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Section 2: During */}
                <motion.div className="mb-16" {...fadeUp(0.2)}>
                    <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4 mb-6">
                        <span className="text-[10px] font-bold font-mono text-[var(--color-accent)] tracking-widest block bg-[rgba(124,58,237,0.06)] px-2.5 py-1 rounded">STAGE 02</span>
                        <h2 className="font-heading text-2xl font-bold text-[var(--text)]">
                            During the Interview (Execution Phase)
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                title: "Think Aloud & Talk Through Trade-offs",
                                desc: "Speak while you code. Say: 'I am using a hash map here because lookup is O(1), though it adds O(N) space complexity.' This showcases analytical capabilities and lets the interviewer understand your path.",
                            },
                            {
                                title: "Clarify Requirements & Edge Cases",
                                desc: "Do not immediately start coding. Spend the first 2–3 minutes asking clarifying questions: 'Can the input contain duplicate values?' 'How should I handle negative numbers or empty arrays?' This shows depth.",
                            },
                            {
                                title: "Start with Brute Force, Then Optimize",
                                desc: "Getting a brute force O(N^2) solution working is better than having an incomplete O(N log N) solution. Code the naive approach first, explain its limitations, and then outline step-by-step optimizations.",
                            },
                            {
                                title: "Use the STAR Method for Behavioral Questions",
                                desc: "Structure behavioral stories (e.g., conflict, failure, leadership) using: **S**ituation (context), **T**ask (what was required), **A**ction (what YOU did specifically), and **R**esult (quantifiable outcome). Keep responses under 2 minutes.",
                            },
                            {
                                title: "Handle Glitches with Composure",
                                desc: "If your code fails test cases or you hit a bug, remain calm. Acknowledge the issue openly: 'I see a failing test case here; it looks like a off-by-one index issue. Let me step through my dry-run tracing to solve it.'",
                            },
                        ].map((tip, idx) => (
                            <div 
                                key={tip.title} 
                                className="glass-card p-6 flex gap-5 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[var(--color-accent)] font-heading font-extrabold text-2xl sm:text-3xl opacity-40 group-hover:opacity-100 transition-opacity select-none">
                                    0{idx + 1}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-[var(--text)] text-base">{tip.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tip.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Section 3: After */}
                <motion.div className="mb-12" {...fadeUp(0.3)}>
                    <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4 mb-6">
                        <span className="text-[10px] font-bold font-mono text-[var(--color-accent)] tracking-widest block bg-[rgba(124,58,237,0.06)] px-2.5 py-1 rounded">STAGE 03</span>
                        <h2 className="font-heading text-2xl font-bold text-[var(--text)]">
                            After the Interview (Feedback Phase)
                        </h2>
                    </div>

                    <div className="glass-card p-8 sm:p-10 space-y-6 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)]" />
                        <div className="space-y-2">
                            <h3 className="font-bold text-[var(--text)] text-base">Write Down the Session Highlights</h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                As soon as the call ends, document the coding questions, behavioral prompts, and specific topics you struggled with. These become your direct study priorities for subsequent sessions.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-[var(--text)] text-base">Send a Thank-You Email</h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                Within 24 hours, send a brief, professional thank-you note to the recruiter or interviewers. Mention a specific technical point discussed during the call to make it personalized.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-[var(--text)] text-base">Practice Iteratively</h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                Interviewing is a muscle. Consistency matters more than cramming. Conduct 2–3 mock interviews on InterviewAI every week to build muscle memory, reduce speech anxiety, and polish technical syntax.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div className="text-center mt-8" {...fadeUp(0.35)}>
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
