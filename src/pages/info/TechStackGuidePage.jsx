import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

export default function TechStackGuidePage() {
    const navigate = useNavigate();

    return (
        <div className="page-bg min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-4xl w-full mx-auto px-6 pt-28 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-8 font-mono tracking-wider">
                    <button onClick={() => navigate("/")} className="hover:text-[var(--text)] transition-colors">HOME</button>
                    <span>/</span>
                    <span className="text-[var(--color-accent)]">TECH STACK GUIDE</span>
                </div>

                {/* Header */}
                <motion.div className="text-center mb-16" {...fadeUp(0.05)}>
                    <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase bg-[rgba(124,58,237,0.1)] px-4 py-2 rounded-full border border-[rgba(124,58,237,0.2)]">
                        Guide
                    </span>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)] mt-4 mb-6 tracking-tight">
                        Tech Stack <span className="gradient-text-static">Interview</span> Guide
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        A detailed handbook highlighting key architectural, frontend, and backend paradigms. Know what questions interviewers ask and how to answer them.
                    </p>
                </motion.div>

                {/* Grid categories */}
                <div className="space-y-16 mb-16">
                    {[
                        {
                            category: "Frontend Architecture",
                            tag: "CLIENT SIDE",
                            icon: (
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            ),
                            topics: [
                                {
                                    name: "React & UI Rendering Lifecycle",
                                    details: "Master core topics like React Fiber reconciliation, state batching schedules, virtual DOM diffing, hook execution contexts, and optimizing renders using useMemo/useCallback. Prepare to answer questions on component virtualization, code-splitting with React.lazy, and advanced patterns in client state libraries like Zustand or Redux Toolkit.",
                                },
                                {
                                    name: "Next.js & Fullstack SSR Frameworks",
                                    details: "Understand Server Components vs Client Components, static site generation (SSG), server-side rendering (SSR), incremental static regeneration (ISR), middleware authorization, and edge rendering. Master Next.js App Router conventions and core server optimization metrics.",
                                },
                                {
                                    name: "CSS Layouts & Web Performance (CWV)",
                                    details: "Be ready for deep-dives into CSS Grid, Flexbox, media query strategies, and CSS custom variables. Know Core Web Vitals optimizations, specifically minimizing cumulative layout shift (CLS), rendering largest contentful paint (LCP) faster, and reducing first input delay (FID).",
                                },
                            ],
                        },
                        {
                            category: "Backend & Systems Development",
                            tag: "SERVER SIDE",
                            icon: (
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            ),
                            topics: [
                                {
                                    name: "Node.js & Non-Blocking Event Loop",
                                    details: "Understand event loop execution phases (timers, I/O callbacks, poll, check), thread pool sizing (libuv), streams (readable, writable, transform), non-blocking execution design, process clustering, and diagnosing memory leaks in high-throughput node applications.",
                                },
                                {
                                    name: "Databases, Schema Indexes & ORMs",
                                    details: "Compare Relational (PostgreSQL) vs NoSQL (MongoDB) schemas. Master index types (B-Tree, GIN, Hash), transaction isolation tiers (ACID), Drizzle vs Prisma querying patterns, database connection pooling limits, and optimizing query performance by resolving N+1 loops.",
                                },
                                {
                                    name: "API Design & Protocol Implementations",
                                    details: "Explain RESTful API standards, GraphQL schema design, resolver batching (DataLoader), gRPC Protocol Buffers for fast RPC messaging, rate-limiting models (Token/Leaky Bucket), and securing routes using JWT and OAuth2 validation flows.",
                                },
                            ],
                        },
                        {
                            category: "System Design & Scaling",
                            tag: "INFRASTRUCTURE",
                            icon: (
                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            ),
                            topics: [
                                {
                                    name: "Scalability, Sharding & CAP Theorem",
                                    details: "Master vertical vs horizontal scaling trade-offs, load balancing policies (Least Connections, IP Hash), database sharding key strategies, read-replicas replication lags, and explaining CAP theorem constraints (Consistency vs Availability) in distributed systems.",
                                },
                                {
                                    name: "Caching Architectures & Redis Pools",
                                    details: "Describe caching patterns (Write-Through, Write-Behind, Cache-Aside), cache evictions, Redis structures (Hashes, Sorted Sets), CDN caching rules, and solving issues like cache stamps, cache misses, or thundering herd scenarios.",
                                },
                                {
                                    name: "Distributed Queues & Event Streaming",
                                    details: "Explain Message Queues (Kafka, RabbitMQ) vs real-time synchronization (WebSockets). Learn pub/sub topics, event consistency schemas, transactional outbox flows, and message delivery guarantees (at-least-once, exactly-once).",
                                },
                            ],
                        },
                    ].map((section, si) => (
                        <motion.div key={section.category} className="space-y-6" {...fadeUp(0.1 + si * 0.08)}>
                            {/* Category Header */}
                            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[rgba(124,58,237,0.08)] flex items-center justify-center border border-[rgba(124,58,237,0.1)]">
                                    {section.icon}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold font-mono text-[var(--color-accent)] tracking-widest block mb-0.5">{section.tag}</span>
                                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text)]">
                                        {section.category}
                                    </h2>
                                </div>
                            </div>
                            
                            {/* Topics Grid - changed to 2 columns on tablet/desktop for much better readability */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.topics.map((t, idx) => (
                                    <div 
                                        key={t.name} 
                                        className="glass-card p-6 flex flex-col justify-between hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                                    >
                                        {/* Card accent hover line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] opacity-60 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div>
                                            <span className="text-[9px] font-bold font-mono text-[var(--text-muted)] tracking-wider block mb-2">TOPIC 0{idx + 1}</span>
                                            <h3 className="font-bold text-[var(--text)] text-base mb-3 leading-snug">
                                                {t.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                                                {t.details}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

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
