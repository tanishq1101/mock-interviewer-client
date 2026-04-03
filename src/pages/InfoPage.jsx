import { useParams, useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import ThemeToggle from "../components/ThemeToggle";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: "easeOut" },
});

// ── All page content ──────────────────────────────────
const PAGES = {
    "interview-tips": {
        title: "Interview Tips",
        subtitle: "Master your next tech interview with these proven strategies",
        icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
        sections: [
            {
                heading: "Before the Interview",
                items: [
                    { title: "Research the Company Thoroughly", desc: "Understand the company's products, tech stack, recent news, and engineering culture. Check their engineering blog, GitHub repos, and Glassdoor reviews. Knowing their challenges helps you frame your answers around their specific needs." },
                    { title: "Review Core Fundamentals", desc: "Brush up on data structures (arrays, trees, graphs, hash maps), algorithms (sorting, searching, dynamic programming), and system design basics. For frontend roles, ensure you're solid on DOM manipulation, event loops, and rendering pipelines." },
                    { title: "Practice with a Timer", desc: "Most coding interviews give 30–45 minutes per problem. Practice solving problems under time pressure. Use InterviewAI to simulate real conditions with AI-generated questions tailored to your level." },
                    { title: "Prepare Your Setup", desc: "Test your microphone, webcam, and internet connection the night before. Have a quiet, well-lit space. For remote interviews, keep a backup device charged and a phone hotspot ready." },
                ]
            },
            {
                heading: "During the Interview",
                items: [
                    { title: "Think Aloud", desc: "Interviewers want to see your thought process. Narrate your approach before writing code. Say things like 'I'm considering a hash map here because lookup is O(1)...' This shows analytical thinking even if you don't reach the optimal solution." },
                    { title: "Ask Clarifying Questions", desc: "Don't jump straight into coding. Clarify edge cases, input constraints, and expected output format. Questions like 'Can the input contain duplicates?' or 'Should I handle negative numbers?' demonstrate thoroughness." },
                    { title: "Start with Brute Force", desc: "It's perfectly fine to start with a brute-force solution and optimize. Mention the time/space complexity, then propose improvements. This shows progression in your thinking." },
                    { title: "Use the STAR Method for Behavioral Questions", desc: "Situation → Task → Action → Result. Structure your answers around a specific scenario, what you did, and the measurable outcome. Keep each answer under 2 minutes." },
                    { title: "Handle Mistakes Gracefully", desc: "Everyone makes mistakes in interviews. If you realize an error, acknowledge it calmly: 'I see the issue — let me fix this.' Resilience under pressure is itself a positive signal." },
                ]
            },
            {
                heading: "After the Interview",
                items: [
                    { title: "Send a Thank-You Note", desc: "A brief email within 24 hours thanking the interviewer shows professionalism. Reference a specific part of the conversation to make it personal." },
                    { title: "Reflect on What Went Well", desc: "Write down the questions you were asked and how you answered. Note areas where you struggled — these become your study priorities for next time." },
                    { title: "Keep Practicing", desc: "Interviewing is a skill that improves with repetition. Use InterviewAI to practice regularly, track your scores, and see trends in your performance over time." },
                ]
            }
        ]
    },
    "tech-stack-guide": {
        title: "Tech Stack Guide",
        subtitle: "A comprehensive overview of popular technologies and what to know for interviews",
        icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        sections: [
            {
                heading: "Frontend Technologies",
                items: [
                    { title: "React", desc: "The most popular UI library. Key concepts to know: JSX, component lifecycle, hooks (useState, useEffect, useMemo, useCallback), context API, reconciliation (virtual DOM diffing), code splitting with React.lazy, and state management patterns (Redux, Zustand, Jotai)." },
                    { title: "Next.js", desc: "Full-stack React framework. Understand server-side rendering (SSR) vs static site generation (SSG) vs incremental static regeneration (ISR). Know the App Router (React Server Components), API routes, middleware, and image optimization." },
                    { title: "TypeScript", desc: "Type-safe JavaScript. Master interfaces vs types, generics, union/intersection types, utility types (Partial, Pick, Omit, Record), type guards, and declaration files. Know how to type React components (FC, forwardRef)." },
                    { title: "CSS & Styling", desc: "Know CSS Grid, Flexbox, media queries, CSS custom properties, and the cascade. Popular frameworks: Tailwind CSS (utility-first), CSS Modules (scoped), styled-components/Emotion (CSS-in-JS). Understand specificity and the box model deeply." },
                ]
            },
            {
                heading: "Backend Technologies",
                items: [
                    { title: "Node.js & Express", desc: "Event-driven, non-blocking I/O. Know the event loop, middleware pattern, error handling, streaming, and clustering. Understand CommonJS vs ES Modules, environment variables, and process management (PM2)." },
                    { title: "Python & FastAPI/Django", desc: "Python is dominant in ML/AI backends. FastAPI: async, Pydantic validation, dependency injection. Django: ORM, admin panel, middleware, signals. Know decorators, generators, and async/await in Python." },
                    { title: "Databases", desc: "PostgreSQL (ACID, joins, indexes, CTEs, window functions), MongoDB (document model, aggregation pipeline), Redis (caching, pub/sub, rate limiting). Understand CAP theorem, normalization, and query optimization." },
                    { title: "ORMs & Query Builders", desc: "Drizzle ORM (type-safe, lightweight), Prisma (schema-first, migrations), Sequelize, SQLAlchemy. Know when to use raw SQL vs ORM, N+1 query problems, and lazy vs eager loading." },
                ]
            },
            {
                heading: "DevOps & Infrastructure",
                items: [
                    { title: "Docker & Kubernetes", desc: "Containerization fundamentals: Dockerfiles, multi-stage builds, docker-compose. Kubernetes: pods, services, deployments, ConfigMaps, and horizontal pod autoscaling. Understand container networking and volume mounts." },
                    { title: "CI/CD", desc: "GitHub Actions, GitLab CI, Jenkins. Know how to set up automated testing, linting, building, and deployment pipelines. Understand blue-green deployments, canary releases, and rollback strategies." },
                    { title: "Cloud Services", desc: "AWS (EC2, S3, Lambda, RDS, CloudFront), GCP (Cloud Run, Cloud Functions, BigQuery), Vercel/Netlify (JAMstack). Know serverless patterns, CDN caching, and cost optimization strategies." },
                ]
            },
            {
                heading: "System Design",
                items: [
                    { title: "Scalability Patterns", desc: "Load balancing (round-robin, least connections), horizontal vs vertical scaling, database sharding, read replicas, connection pooling. Understand when each pattern is appropriate." },
                    { title: "Caching Strategies", desc: "Cache-aside, write-through, write-behind. CDN caching (edge locations), application-level caching (Redis/Memcached), browser caching (ETags, Cache-Control). Know cache invalidation strategies." },
                    { title: "API Design", desc: "REST (resource-oriented, HTTP verbs, status codes), GraphQL (schema, resolvers, fragments), gRPC (protobuf, streaming). Understand pagination, rate limiting, versioning, and authentication (JWT, OAuth2)." },
                ]
            }
        ]
    },
    "blog": {
        title: "Blog",
        subtitle: "Latest insights on AI, interviews, and career development",
        icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2",
        sections: [
            {
                heading: "Latest Posts",
                items: [
                    { title: "How AI Is Transforming Technical Interviews in 2026", desc: "The recruitment landscape is evolving rapidly. AI-powered interview platforms like InterviewAI are enabling candidates to practice with adaptive difficulty, receive instant feedback, and track improvement over time. Companies are also using AI to create more standardized, bias-reduced interview processes. We explore how these changes affect both candidates and hiring managers, and what to expect in the coming years.", date: "Feb 20, 2026" },
                    { title: "The Complete Guide to System Design Interviews", desc: "System design interviews test your ability to architect scalable systems. This comprehensive guide covers the framework: requirements clarification, capacity estimation, high-level design, detailed component design, and bottleneck identification. We walk through real examples including designing a URL shortener, a chat application, and a news feed system.", date: "Feb 15, 2026" },
                    { title: "5 Mistakes That Cost Candidates Their Dream Job", desc: "After analyzing thousands of mock interviews on our platform, we've identified the top 5 patterns that correlate with lower scores: not asking clarifying questions, jumping to code without planning, ignoring edge cases, poor time management, and failing to communicate trade-offs. Learn how to avoid each one with practical strategies.", date: "Feb 10, 2026" },
                    { title: "From Junior to Senior: The Skills Gap Nobody Talks About", desc: "The jump from junior to senior isn't just about writing better code. It's about ownership, mentoring, architectural thinking, and cross-team influence. We break down the specific competencies that distinguish each level and provide a self-assessment checklist to identify your growth areas.", date: "Feb 5, 2026" },
                    { title: "Speech-to-Text in Interviews: Why We Added Mic Support", desc: "Typing answers during a mock interview doesn't replicate real interview conditions. That's why we built speech-to-text recording into InterviewAI. Using the Web Speech API, candidates can now speak their answers naturally, just like in a real interview. Here's the technical story of how we built it and what we learned about browser compatibility.", date: "Jan 28, 2026" },
                ]
            }
        ]
    },
    "faq": {
        title: "Frequently Asked Questions",
        subtitle: "Everything you need to know about InterviewAI",
        icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        sections: [
            {
                heading: "General",
                items: [
                    { title: "What is InterviewAI?", desc: "InterviewAI is an AI-powered mock interview platform that simulates real technical interviews. Our AI adapts questions to your role, experience level, and tech stack, providing real-time scoring and detailed feedback on every answer." },
                    { title: "Is it free to use?", desc: "Yes! InterviewAI offers a free tier that includes unlimited mock interviews with AI-powered feedback. Premium features like interview history persistence (with PostgreSQL), advanced analytics, and priority support are available on paid plans." },
                    { title: "What AI model powers the interviews?", desc: "We use Groq-hosted LLaMA 3.3 70B for question generation, answer evaluation, and report generation. The model adapts its difficulty and follow-up questions based on your responses, creating a dynamic interview experience." },
                    { title: "What types of interviews are supported?", desc: "We support Technical interviews (DSA, system design, coding), Behavioral interviews (leadership, teamwork, conflict resolution), and Mixed interviews that combine both. You can also customize the tech stack focus." },
                ]
            },
            {
                heading: "Features",
                items: [
                    { title: "How does the speech-to-text feature work?", desc: "Click the microphone button during your interview to start recording. Your speech is converted to text in real-time using the browser's Web Speech API (best in Chrome/Edge). The transcript automatically fills your answer box. You can edit it before submitting." },
                    { title: "Is my webcam video recorded?", desc: "No. The webcam feature is purely for practice immersion — it shows you a live preview so you can practice your body language and eye contact. No video is recorded, stored, or transmitted anywhere." },
                    { title: "Can I review past interviews?", desc: "Yes! When you connect a PostgreSQL database, all your interviews are saved automatically. Visit the Dashboard page to see your interview history, scores, and detailed Q&A breakdowns." },
                    { title: "How is my answer scored?", desc: "Each answer receives a score from 1–10 based on technical accuracy, completeness, communication clarity, and relevance to the question. The AI also provides written feedback explaining what was strong and what could be improved." },
                ]
            },
            {
                heading: "Technical",
                items: [
                    { title: "What browsers are supported?", desc: "InterviewAI works in all modern browsers. For the best experience with speech-to-text, we recommend Google Chrome or Microsoft Edge. The webcam preview works in all browsers that support getUserMedia." },
                    { title: "Do I need to set up a database?", desc: "No. The app works fully without a database — interviews are conducted in-memory. If you want to save interview history, connect a PostgreSQL database (we recommend Neon for a free cloud option) by adding a DATABASE_URL to your backend .env file." },
                    { title: "Is my data secure?", desc: "Your interview data stays on your own infrastructure. We don't store any data on our servers. When using Neon PostgreSQL, your data is encrypted at rest and in transit. Clerk handles authentication securely." },
                ]
            }
        ]
    },
    "about": {
        title: "About InterviewAI",
        subtitle: "Our mission is to democratize interview preparation",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
        sections: [
            {
                heading: "Our Mission",
                items: [
                    { title: "Making Interview Prep Accessible to Everyone", desc: "Technical interviews shouldn't be a barrier based on your network or resources. InterviewAI provides enterprise-grade interview practice — powered by Groq AI (LLaMA 3.3) — completely free. Whether you're a self-taught developer, a bootcamp graduate, or a CS student, you deserve the same quality preparation as someone with a coach at a top tech company." },
                ]
            },
            {
                heading: "What Makes Us Different",
                items: [
                    { title: "Adaptive AI Interviewer", desc: "Unlike static question banks, our AI generates unique questions based on your specific role, level, and tech stack. Follow-up questions adapt based on your answers, creating a realistic interview flow that challenges you appropriately." },
                    { title: "Real-time Scoring & Feedback", desc: "Every answer is evaluated instantly on technical accuracy, communication, and depth. You get actionable feedback — not just a pass/fail — so you know exactly what to improve." },
                    { title: "Speech-to-Text Recording", desc: "Practice speaking your answers, not just typing them. Our microphone integration uses the Web Speech API for real-time transcription, replicating actual interview conditions." },
                    { title: "Full Interview History", desc: "With PostgreSQL + Drizzle ORM integration, every interview is saved. Track your progress, identify patterns, and see your improvement over time through the Dashboard." },
                ]
            },
            {
                heading: "Technology",
                items: [
                    { title: "Built with Modern Tech", desc: "React 18 + Vite for a blazing-fast frontend. Express.js backend with Drizzle ORM and PostgreSQL for data persistence. Groq AI (LLaMA 3.3 70B) for intelligent question generation and evaluation. Clerk for secure authentication. Framer Motion for smooth animations. Deployed on Vercel." },
                ]
            }
        ]
    },
    "contact": {
        title: "Contact Us",
        subtitle: "We'd love to hear from you",
        icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        sections: [
            {
                heading: "Get In Touch",
                items: [
                    { title: "📧 Email", desc: "For general inquiries, bug reports, or feedback: support@interviewai.dev" },
                    { title: "🐛 Report a Bug", desc: "Found an issue? Open a GitHub issue with steps to reproduce, expected behavior, and your browser/OS info. Screenshots and console logs are incredibly helpful." },
                    { title: "💡 Feature Requests", desc: "Have an idea for a new feature? We'd love to hear it. Email us or create a GitHub discussion. We prioritize features that the community is most excited about." },
                    { title: "🤝 Partnerships", desc: "Interested in integrating InterviewAI into your bootcamp, university, or hiring process? Reach out to partnerships@interviewai.dev and we'll explore how we can work together." },
                ]
            },
            {
                heading: "Community",
                items: [
                    { title: "GitHub", desc: "Star our repo, contribute code, or browse the source. InterviewAI is open-source and we welcome contributions of all sizes — from typo fixes to major features." },
                    { title: "Twitter / X", desc: "Follow @InterviewAI_dev for product updates, interview tips, and engineering content. We share insights from thousands of mock interviews." },
                    { title: "Discord", desc: "Join our Discord community to connect with other job seekers, share interview experiences, and get tips from developers who've successfully landed roles at top companies." },
                ]
            }
        ]
    },
    "privacy-policy": {
        title: "Privacy Policy",
        subtitle: "Last updated: February 2026",
        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
        sections: [
            {
                heading: "Information We Collect",
                items: [
                    { title: "Account Information", desc: "When you sign up via Clerk, we receive your name, email address, and profile image. We do not store passwords — authentication is handled entirely by Clerk's secure infrastructure." },
                    { title: "Interview Data", desc: "When you conduct interviews, we store your questions, answers, evaluations, and scores in your PostgreSQL database. This data is stored only in the database you configure — we do not maintain any centralized data store." },
                    { title: "Usage Analytics", desc: "We may collect anonymized usage data (page views, feature usage) to improve the product. No personally identifiable information is included in analytics data." },
                ]
            },
            {
                heading: "How We Use Your Data",
                items: [
                    { title: "Service Delivery", desc: "Your interview data is used to generate AI evaluations, reports, and to populate your dashboard. This is the core functionality of the platform." },
                    { title: "Product Improvement", desc: "Anonymized, aggregated data may be used to improve our AI models, user interface, and overall service quality. We never use individual interviews for model training without explicit consent." },
                    { title: "Communication", desc: "We may use your email to send important service updates, security notices, or product announcements. You can opt out of non-essential emails at any time." },
                ]
            },
            {
                heading: "Data Security & Retention",
                items: [
                    { title: "Security Measures", desc: "All data is encrypted in transit (TLS 1.3) and at rest. Authentication is handled by Clerk with industry-standard security practices including MFA support. Database connections use SSL." },
                    { title: "Data Retention", desc: "Your interview data is retained as long as your account is active. You can delete individual interviews from the Dashboard at any time. Account deletion removes all associated data." },
                    { title: "Third-Party Services", desc: "We use Clerk (authentication), Groq AI (interview AI), and Neon (database hosting as configured by you). Each service has its own privacy policy and data handling practices." },
                ]
            },
            {
                heading: "Your Rights",
                items: [
                    { title: "Access & Portability", desc: "You can access all your interview data through the Dashboard. We support data export upon request." },
                    { title: "Deletion", desc: "You can delete individual interviews from the Dashboard. For complete account deletion, contact support@interviewai.dev." },
                    { title: "Consent", desc: "By using InterviewAI, you consent to this privacy policy. We will notify you of any material changes via email or in-app notification." },
                ]
            }
        ]
    },
    "terms-of-service": {
        title: "Terms of Service",
        subtitle: "Last updated: February 2026",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        sections: [
            {
                heading: "Acceptance of Terms",
                items: [
                    { title: "Agreement", desc: "By accessing or using InterviewAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform." },
                    { title: "Eligibility", desc: "You must be at least 16 years old to use InterviewAI. By using the platform, you represent that you meet this age requirement." },
                ]
            },
            {
                heading: "Use of Service",
                items: [
                    { title: "Permitted Use", desc: "InterviewAI is designed for personal interview preparation and practice. You may use the platform to practice mock interviews, review your performance, and improve your skills." },
                    { title: "Prohibited Use", desc: "You may not: (a) use the platform to generate answers for actual job interviews in real-time, (b) scrape or copy interview questions for commercial purposes, (c) attempt to reverse-engineer the AI evaluation system, (d) share your account credentials, or (e) use the platform for any illegal purpose." },
                    { title: "API Usage", desc: "The backend API is intended for use with the InterviewAI frontend only. Automated access, scraping, or excessive API calls may result in account suspension." },
                ]
            },
            {
                heading: "Intellectual Property",
                items: [
                    { title: "Platform Content", desc: "The InterviewAI platform, including its code, design, and AI models, is the intellectual property of InterviewAI. You may not copy, modify, or distribute the platform without permission." },
                    { title: "Your Content", desc: "You retain ownership of your interview answers and any content you create on the platform. By using the service, you grant us a limited license to process your content for the purpose of providing AI evaluations." },
                ]
            },
            {
                heading: "Disclaimers & Limitations",
                items: [
                    { title: "No Guarantee of Employment", desc: "InterviewAI is a practice tool. We do not guarantee that using our platform will result in job offers. Interview success depends on many factors beyond practice." },
                    { title: "AI Accuracy", desc: "Our AI evaluations are designed to be helpful and directional, but they are not infallible. Scores and feedback should be used as one input among many in your preparation." },
                    { title: "Service Availability", desc: "We strive for high availability but do not guarantee uninterrupted access. The platform may be temporarily unavailable for maintenance, updates, or reasons beyond our control." },
                    { title: "Limitation of Liability", desc: "InterviewAI is provided 'as is' without warranties of any kind. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform." },
                ]
            },
            {
                heading: "General",
                items: [
                    { title: "Modifications", desc: "We reserve the right to modify these terms at any time. Material changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance." },
                    { title: "Governing Law", desc: "These terms are governed by the laws of the jurisdiction in which InterviewAI operates. Any disputes shall be resolved through binding arbitration." },
                    { title: "Contact", desc: "Questions about these terms? Contact us at legal@interviewai.dev." },
                ]
            }
        ]
    },
};

// ── Main Component ─────────────────────────────────────
export default function InfoPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isSignedIn } = useUser();
    const page = PAGES[slug];

    if (!page) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-heading)", marginBottom: 8 }}>Page Not Found</h2>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>The page you're looking for doesn't exist.</p>
                    <button onClick={() => navigate("/")} className="btn-primary" style={{ padding: "10px 24px" }}>Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            {/* Background blobs */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: 40, right: 80, width: 300, height: 300, borderRadius: "50%", filter: "blur(120px)", background: "rgba(124,58,237,0.05)" }} />
                <div style={{ position: "absolute", bottom: 80, left: 60, width: 250, height: 250, borderRadius: "50%", filter: "blur(120px)", background: "rgba(16,185,129,0.03)" }} />
            </div>

            {/* Nav */}
            <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", maxWidth: 960, margin: "0 auto" }}>
                <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.12)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text)" }}>InterviewAI</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ThemeToggle />
                    {isSignedIn ? (
                        <UserButton afterSignOutUrl="/" />
                    ) : (
                        <button onClick={() => navigate("/login")} className="btn-primary" style={{ fontSize: 13, padding: "8px 20px" }}>Get Started</button>
                    )}
                </div>
            </nav>

            {/* Header */}
            <main style={{ position: "relative", zIndex: 10, maxWidth: 780, margin: "0 auto", padding: "0 32px 60px" }}>
                <motion.div style={{ textAlign: "center", marginBottom: 40, paddingTop: 20 }} {...fadeUp(0.05)}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.1)", margin: "0 auto 16px" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d={page.icon} />
                        </svg>
                    </div>
                    <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                        {page.title}
                    </h1>
                    <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto" }}>
                        {page.subtitle}
                    </p>
                </motion.div>

                {/* Sections */}
                {page.sections.map((section, si) => (
                    <motion.div key={si} style={{ marginBottom: 32 }} {...fadeUp(0.1 + si * 0.05)}>
                        <h2 style={{
                            fontSize: 17, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-heading)",
                            marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)",
                        }}>
                            {section.heading}
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {section.items.map((item, ii) => (
                                <div key={ii} style={{
                                    padding: "16px 20px", borderRadius: 12,
                                    background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                                            {item.title}
                                        </h3>
                                        {item.date && (
                                            <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, fontWeight: 500 }}>{item.date}</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Back button */}
                <motion.div style={{ textAlign: "center", marginTop: 20 }} {...fadeUp(0.3)}>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            padding: "10px 24px", fontSize: 13, fontWeight: 500, borderRadius: 10,
                            border: "1px solid var(--border-subtle)", background: "transparent",
                            color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = "rgba(124,58,237,0.3)"; e.target.style.color = "var(--text)"; }}
                        onMouseLeave={e => { e.target.style.borderColor = "var(--border-subtle)"; e.target.style.color = "var(--text-secondary)"; }}
                    >
                        ← Back to Home
                    </button>
                </motion.div>
            </main>
        </div>
    );
}
