import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

const POSTS = [
    {
        title: "How AI Is Transforming Technical Interviews in 2026",
        date: "Feb 20, 2026",
        author: "Pratyush Sinha",
        readTime: "5 min read",
        excerpt: "The recruitment landscape is evolving rapidly. AI-powered interview platforms like InterviewAI are enabling candidates to practice with adaptive difficulty, receive instant feedback, and track improvement over time. We explore how these changes affect both candidates and hiring managers, and what to expect in the coming years.",
        category: "AI Recruitment",
    },
    {
        title: "The Complete Guide to System Design Interviews",
        date: "Feb 15, 2026",
        author: "Sarah Chen",
        readTime: "8 min read",
        excerpt: "System design interviews test your ability to architect scalable systems. This comprehensive guide covers the framework: requirements clarification, capacity estimation, high-level design, detailed component design, and bottleneck identification. We walk through real examples including designing a URL shortener, a chat application, and a news feed system.",
        category: "System Design",
    },
    {
        title: "5 Mistakes That Cost Candidates Their Dream Job",
        date: "Feb 10, 2026",
        author: "Marcus Aurelius",
        readTime: "4 min read",
        excerpt: "After analyzing thousands of mock interviews on our platform, we've identified the top 5 patterns that correlate with lower scores: not asking clarifying questions, jumping to code without planning, ignoring edge cases, poor time management, and failing to communicate trade-offs. Learn how to avoid each one with practical strategies.",
        category: "Career Growth",
    },
    {
        title: "From Junior to Senior: The Skills Gap Nobody Talks About",
        date: "Feb 5, 2026",
        author: "Diana Prince",
        readTime: "6 min read",
        excerpt: "The jump from junior to senior isn't just about writing better code. It's about ownership, mentoring, architectural thinking, and cross-team influence. We break down the specific competencies that distinguish each level and provide a self-assessment checklist to identify your growth areas.",
        category: "Career Growth",
    },
    {
        title: "Speech-to-Text in Interviews: Why We Added Mic Support",
        date: "Jan 28, 2026",
        author: "Alex Mercer",
        readTime: "7 min read",
        excerpt: "Typing answers during a mock interview doesn't replicate real interview conditions. That's why we built speech-to-text recording into InterviewAI. Using the Web Speech API, candidates can now speak their answers naturally, just like in a real interview. Here's the technical story of how we built it and what we learned about browser compatibility.",
        category: "Tech Stack",
    },
];

export default function BlogPage() {
    const navigate = useNavigate();

    return (
        <div className="page-bg min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-4xl w-full mx-auto px-6 pt-28 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-8 font-mono tracking-wider">
                    <button onClick={() => navigate("/")} className="hover:text-[var(--text)] transition-colors">HOME</button>
                    <span>/</span>
                    <span className="text-[var(--color-accent)]">BLOG</span>
                </div>

                {/* Header */}
                <motion.div className="text-center mb-16" {...fadeUp(0.05)}>
                    <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase bg-[rgba(124,58,237,0.1)] px-4 py-2 rounded-full border border-[rgba(124,58,237,0.2)]">
                        Blog
                    </span>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)] mt-4 mb-6 tracking-tight">
                        Insights & <span className="gradient-text-static">Articles</span>
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        Stay informed with the latest updates on Artificial Intelligence, recruitment trends, system design architectures, and interview tips.
                    </p>
                </motion.div>

                {/* Posts List */}
                <div className="space-y-8 mb-12">
                    {POSTS.map((post, idx) => (
                        <motion.article 
                            key={post.title} 
                            className="glass-card p-6 sm:p-8 hover:border-[rgba(124,58,237,0.3)] hover:shadow-md transition-all duration-300 cursor-pointer relative group overflow-hidden"
                            {...fadeUp(0.1 + idx * 0.05)}
                        >
                            {/* Accent line on left hover */}
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] opacity-40 group-hover:opacity-100 transition-opacity" />

                            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mb-4 font-mono">
                                <span className="text-[var(--color-accent)] font-semibold bg-[rgba(124,58,237,0.06)] px-2.5 py-1 rounded text-[10px] tracking-wider uppercase border border-[rgba(124,58,237,0.15)]">
                                    {post.category}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>{post.date}</span>
                                <span>•</span>
                                <span className="text-[var(--text-secondary)]">By {post.author}</span>
                                <span>•</span>
                                <span className="text-[var(--color-accent)]">{post.readTime}</span>
                            </div>
                            
                            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text)] mb-3 group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                                {post.title}
                            </h2>
                            
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                                {post.excerpt}
                            </p>
                            
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] group-hover:text-[var(--text)] transition-colors">
                                Read Article 
                                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </motion.article>
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
