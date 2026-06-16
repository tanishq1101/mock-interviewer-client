import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { UserButton, useUser } from "@clerk/clerk-react";
import ThemeToggle from "../components/ThemeToggle";

// ── Animation helpers ──────────────────────────────────
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

// Section color accents per heading index
const SECTION_ACCENTS = [
    "rgba(124,58,237,0.12)",
    "rgba(16,185,129,0.10)",
    "rgba(245,158,11,0.10)",
    "rgba(239,68,68,0.10)",
    "rgba(59,130,246,0.10)",
];
const SECTION_BORDERS = [
    "rgba(124,58,237,0.35)",
    "rgba(16,185,129,0.35)",
    "rgba(245,158,11,0.35)",
    "rgba(239,68,68,0.35)",
    "rgba(59,130,246,0.35)",
];
const SECTION_ICON_COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

// ── All page content ──────────────────────────────────
const PAGES = {
    "interview-tips": {
        title: "Interview Tips",
        subtitle: "Master your next tech interview with these proven, battle-tested strategies.",
        icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
        tag: "Career Guide",
        readTime: "8 min read",
        sections: [
            {
                heading: "Before the Interview",
                emoji: "📋",
                desc: "Preparation is 80% of the battle. These steps set you up for success days before you open your laptop.",
                items: [
                    {
                        title: "Research the Company Thoroughly",
                        desc: "Understand the company's products, tech stack, recent news, and engineering culture. Check their engineering blog, GitHub repos, and Glassdoor reviews. Knowing their challenges helps you frame your answers around their specific needs.",
                        tag: "Essential",
                        tagColor: "#ef4444",
                    },
                    {
                        title: "Review Core Fundamentals",
                        desc: "Brush up on data structures (arrays, trees, graphs, hash maps), algorithms (sorting, searching, dynamic programming), and system design basics. For frontend roles, ensure you're solid on DOM manipulation, event loops, and rendering pipelines.",
                        tag: "Technical",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Practice with a Timer",
                        desc: "Most coding interviews give 30–45 minutes per problem. Practice solving problems under time pressure. Use InterviewAI to simulate real conditions with AI-generated questions tailored to your level.",
                        tag: "Pro Tip",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Prepare Your Setup",
                        desc: "Test your microphone, webcam, and internet connection the night before. Have a quiet, well-lit space. For remote interviews, keep a backup device charged and a phone hotspot ready.",
                        tag: "Logistics",
                        tagColor: "#f59e0b",
                    },
                ],
            },
            {
                heading: "During the Interview",
                emoji: "💡",
                desc: "Real-time performance matters. These habits separate candidates who impress from those who are just adequate.",
                items: [
                    {
                        title: "Think Aloud",
                        desc: "Interviewers want to see your thought process. Narrate your approach before writing code. Say things like 'I'm considering a hash map here because lookup is O(1)...' This shows analytical thinking even if you don't reach the optimal solution.",
                        tag: "Critical",
                        tagColor: "#ef4444",
                    },
                    {
                        title: "Ask Clarifying Questions",
                        desc: "Don't jump straight into coding. Clarify edge cases, input constraints, and expected output format. Questions like 'Can the input contain duplicates?' or 'Should I handle negative numbers?' demonstrate thoroughness.",
                        tag: "Essential",
                        tagColor: "#ef4444",
                    },
                    {
                        title: "Start with Brute Force",
                        desc: "It's perfectly fine to start with a brute-force solution and optimize. Mention the time/space complexity, then propose improvements. This shows progression in your thinking.",
                        tag: "Strategy",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Use the STAR Method for Behavioral Questions",
                        desc: "Situation → Task → Action → Result. Structure your answers around a specific scenario, what you did, and the measurable outcome. Keep each answer under 2 minutes.",
                        tag: "Behavioral",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Handle Mistakes Gracefully",
                        desc: "Everyone makes mistakes in interviews. If you realize an error, acknowledge it calmly: 'I see the issue — let me fix this.' Resilience under pressure is itself a positive signal.",
                        tag: "Mindset",
                        tagColor: "#10b981",
                    },
                ],
            },
            {
                heading: "After the Interview",
                emoji: "✅",
                desc: "What you do after the interview can still influence the outcome — and definitely shapes your next attempt.",
                items: [
                    {
                        title: "Send a Thank-You Note",
                        desc: "A brief email within 24 hours thanking the interviewer shows professionalism. Reference a specific part of the conversation to make it personal.",
                        tag: "Soft Skills",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Reflect on What Went Well",
                        desc: "Write down the questions you were asked and how you answered. Note areas where you struggled — these become your study priorities for next time.",
                        tag: "Growth",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Keep Practicing",
                        desc: "Interviewing is a skill that improves with repetition. Use InterviewAI to practice regularly, track your scores, and see trends in your performance over time.",
                        tag: "Ongoing",
                        tagColor: "#f59e0b",
                    },
                ],
            },
        ],
    },

    "tech-stack-guide": {
        title: "Tech Stack Guide",
        subtitle: "A comprehensive overview of popular technologies and exactly what to know for each interview domain.",
        icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        tag: "Study Reference",
        readTime: "12 min read",
        sections: [
            {
                heading: "Frontend Technologies",
                emoji: "🎨",
                desc: "The UI layer — master these to ace any frontend or full-stack interview.",
                items: [
                    {
                        title: "React",
                        desc: "The most popular UI library. Key concepts: JSX, component lifecycle, hooks (useState, useEffect, useMemo, useCallback), context API, reconciliation (virtual DOM diffing), code splitting with React.lazy, and state management patterns (Redux, Zustand, Jotai).",
                        tag: "Must Know",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Next.js",
                        desc: "Full-stack React framework. Understand SSR vs SSG vs ISR. Know the App Router (React Server Components), API routes, middleware, and image optimization.",
                        tag: "Full-Stack",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "TypeScript",
                        desc: "Type-safe JavaScript. Master interfaces vs types, generics, union/intersection types, utility types (Partial, Pick, Omit, Record), type guards, and declaration files. Know how to type React components (FC, forwardRef).",
                        tag: "Industry Standard",
                        tagColor: "#10b981",
                    },
                    {
                        title: "CSS & Styling",
                        desc: "Know CSS Grid, Flexbox, media queries, CSS custom properties, and the cascade. Popular frameworks: Tailwind CSS (utility-first), CSS Modules (scoped), styled-components/Emotion (CSS-in-JS). Understand specificity and the box model deeply.",
                        tag: "Foundational",
                        tagColor: "#f59e0b",
                    },
                ],
            },
            {
                heading: "Backend Technologies",
                emoji: "⚙️",
                desc: "Server-side fundamentals that every senior engineer needs to command.",
                items: [
                    {
                        title: "Node.js & Express",
                        desc: "Event-driven, non-blocking I/O. Know the event loop, middleware pattern, error handling, streaming, and clustering. Understand CommonJS vs ES Modules, environment variables, and process management (PM2).",
                        tag: "Core",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Python & FastAPI / Django",
                        desc: "Python dominates ML/AI backends. FastAPI: async, Pydantic validation, dependency injection. Django: ORM, admin panel, middleware, signals. Know decorators, generators, and async/await.",
                        tag: "AI/ML",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Databases",
                        desc: "PostgreSQL (ACID, joins, indexes, CTEs, window functions), MongoDB (document model, aggregation pipeline), Redis (caching, pub/sub, rate limiting). Understand CAP theorem, normalization, and query optimization.",
                        tag: "Data Layer",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "ORMs & Query Builders",
                        desc: "Drizzle ORM (type-safe, lightweight), Prisma (schema-first, migrations), Sequelize, SQLAlchemy. Know when to use raw SQL vs ORM, N+1 query problems, and lazy vs eager loading.",
                        tag: "Productivity",
                        tagColor: "#f59e0b",
                    },
                ],
            },
            {
                heading: "DevOps & Infrastructure",
                emoji: "🚀",
                desc: "Modern engineers are expected to own their deployment pipeline end-to-end.",
                items: [
                    {
                        title: "Docker & Kubernetes",
                        desc: "Containerization fundamentals: Dockerfiles, multi-stage builds, docker-compose. Kubernetes: pods, services, deployments, ConfigMaps, and horizontal pod autoscaling. Understand container networking and volume mounts.",
                        tag: "Containers",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "CI/CD",
                        desc: "GitHub Actions, GitLab CI, Jenkins. Know how to set up automated testing, linting, building, and deployment pipelines. Understand blue-green deployments, canary releases, and rollback strategies.",
                        tag: "Automation",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Cloud Services",
                        desc: "AWS (EC2, S3, Lambda, RDS, CloudFront), GCP (Cloud Run, Cloud Functions, BigQuery), Vercel/Netlify (JAMstack). Know serverless patterns, CDN caching, and cost optimization strategies.",
                        tag: "Cloud",
                        tagColor: "#7c3aed",
                    },
                ],
            },
            {
                heading: "System Design",
                emoji: "🏗️",
                desc: "The most impactful skill for senior roles — shows architectural maturity and long-term thinking.",
                items: [
                    {
                        title: "Scalability Patterns",
                        desc: "Load balancing (round-robin, least connections), horizontal vs vertical scaling, database sharding, read replicas, connection pooling. Understand when each pattern is appropriate.",
                        tag: "Architecture",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Caching Strategies",
                        desc: "Cache-aside, write-through, write-behind. CDN caching (edge locations), application-level caching (Redis/Memcached), browser caching (ETags, Cache-Control). Know cache invalidation strategies.",
                        tag: "Performance",
                        tagColor: "#f59e0b",
                    },
                    {
                        title: "API Design",
                        desc: "REST (resource-oriented, HTTP verbs, status codes), GraphQL (schema, resolvers, fragments), gRPC (protobuf, streaming). Understand pagination, rate limiting, versioning, and authentication (JWT, OAuth2).",
                        tag: "API",
                        tagColor: "#10b981",
                    },
                ],
            },
        ],
    },

    blog: {
        title: "Blog",
        subtitle: "Latest insights on AI, technical interviews, and accelerating your engineering career.",
        icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2",
        tag: "Blog",
        readTime: "5 articles",
        sections: [
            {
                heading: "Latest Articles",
                emoji: "📰",
                desc: "Hand-picked insights from our team — covering AI trends, interview strategy, and engineering growth.",
                items: [
                    {
                        title: "How AI Is Transforming Technical Interviews in 2026",
                        desc: "The recruitment landscape is evolving rapidly. AI-powered interview platforms like InterviewAI are enabling candidates to practice with adaptive difficulty, receive instant feedback, and track improvement over time. Companies are also using AI to create more standardized, bias-reduced interview processes. We explore how these changes affect both candidates and hiring managers, and what to expect in the coming years.",
                        tag: "AI & Hiring",
                        tagColor: "#7c3aed",
                        date: "Feb 20, 2026",
                    },
                    {
                        title: "The Complete Guide to System Design Interviews",
                        desc: "System design interviews test your ability to architect scalable systems. This comprehensive guide covers the framework: requirements clarification, capacity estimation, high-level design, detailed component design, and bottleneck identification. We walk through real examples including designing a URL shortener, a chat application, and a news feed system.",
                        tag: "System Design",
                        tagColor: "#3b82f6",
                        date: "Feb 15, 2026",
                    },
                    {
                        title: "5 Mistakes That Cost Candidates Their Dream Job",
                        desc: "After analyzing thousands of mock interviews on our platform, we've identified the top 5 patterns that correlate with lower scores: not asking clarifying questions, jumping to code without planning, ignoring edge cases, poor time management, and failing to communicate trade-offs. Learn how to avoid each one with practical strategies.",
                        tag: "Top Mistakes",
                        tagColor: "#ef4444",
                        date: "Feb 10, 2026",
                    },
                    {
                        title: "From Junior to Senior: The Skills Gap Nobody Talks About",
                        desc: "The jump from junior to senior isn't just about writing better code. It's about ownership, mentoring, architectural thinking, and cross-team influence. We break down the specific competencies that distinguish each level and provide a self-assessment checklist to identify your growth areas.",
                        tag: "Career",
                        tagColor: "#10b981",
                        date: "Feb 5, 2026",
                    },
                    {
                        title: "Speech-to-Text in Interviews: Why We Added Mic Support",
                        desc: "Typing answers during a mock interview doesn't replicate real interview conditions. That's why we built speech-to-text recording into InterviewAI. Using the Web Speech API, candidates can now speak their answers naturally, just like in a real interview. Here's the technical story of how we built it and what we learned about browser compatibility.",
                        tag: "Behind the Build",
                        tagColor: "#f59e0b",
                        date: "Jan 28, 2026",
                    },
                ],
            },
        ],
    },

    faq: {
        title: "Frequently Asked Questions",
        subtitle: "Everything you need to know about InterviewAI, answered clearly and completely.",
        icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        tag: "Help Center",
        readTime: "3 min read",
        sections: [
            {
                heading: "General",
                emoji: "🔍",
                desc: "The basics — what InterviewAI is and how to get started.",
                items: [
                    {
                        title: "What is InterviewAI?",
                        desc: "InterviewAI is an AI-powered mock interview platform that simulates real technical interviews. Our AI adapts questions to your role, experience level, and tech stack, providing real-time scoring and detailed feedback on every answer.",
                        tag: "Overview",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Is it free to use?",
                        desc: "Yes! InterviewAI offers a free tier that includes unlimited mock interviews with AI-powered feedback. Premium features like interview history persistence (with PostgreSQL), advanced analytics, and priority support are available on paid plans.",
                        tag: "Pricing",
                        tagColor: "#10b981",
                    },
                    {
                        title: "What AI model powers the interviews?",
                        desc: "We use Groq-hosted LLaMA 3.3 70B for question generation, answer evaluation, and report generation. The model adapts its difficulty and follow-up questions based on your responses, creating a dynamic interview experience.",
                        tag: "Technology",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "What types of interviews are supported?",
                        desc: "We support Technical interviews (DSA, system design, coding), Behavioral interviews (leadership, teamwork, conflict resolution), and Mixed interviews that combine both. You can also customize the tech stack focus.",
                        tag: "Features",
                        tagColor: "#f59e0b",
                    },
                ],
            },
            {
                heading: "Features",
                emoji: "⚡",
                desc: "How specific features work under the hood.",
                items: [
                    {
                        title: "How does the speech-to-text feature work?",
                        desc: "Click the microphone button during your interview to start recording. Your speech is converted to text in real-time using the browser's Web Speech API (best in Chrome/Edge). The transcript automatically fills your answer box. You can edit it before submitting.",
                        tag: "Speech AI",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Is my webcam video recorded?",
                        desc: "No. The webcam feature is purely for practice immersion — it shows you a live preview so you can practice your body language and eye contact. No video is recorded, stored, or transmitted anywhere.",
                        tag: "Privacy",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Can I review past interviews?",
                        desc: "Yes! When you connect a PostgreSQL database, all your interviews are saved automatically. Visit the Dashboard page to see your interview history, scores, and detailed Q&A breakdowns.",
                        tag: "Dashboard",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "How is my answer scored?",
                        desc: "Each answer receives a score from 1–10 based on technical accuracy, completeness, communication clarity, and relevance to the question. The AI also provides written feedback explaining what was strong and what could be improved.",
                        tag: "Scoring",
                        tagColor: "#f59e0b",
                    },
                ],
            },
            {
                heading: "Technical",
                emoji: "🛠️",
                desc: "Under-the-hood details for developers self-hosting or customizing the platform.",
                items: [
                    {
                        title: "What browsers are supported?",
                        desc: "InterviewAI works in all modern browsers. For the best experience with speech-to-text, we recommend Google Chrome or Microsoft Edge. The webcam preview works in all browsers that support getUserMedia.",
                        tag: "Compatibility",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Do I need to set up a database?",
                        desc: "No. The app works fully without a database — interviews are conducted in-memory. If you want to save interview history, connect a PostgreSQL database (we recommend Neon for a free cloud option) by adding a DATABASE_URL to your backend .env file.",
                        tag: "Self-Hosting",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Is my data secure?",
                        desc: "Your interview data stays on your own infrastructure. We don't store any data on our servers. When using Neon PostgreSQL, your data is encrypted at rest and in transit. Clerk handles authentication securely.",
                        tag: "Security",
                        tagColor: "#10b981",
                    },
                ],
            },
        ],
    },

    about: {
        title: "About InterviewAI",
        subtitle: "Our mission is to democratize interview preparation — making enterprise-quality practice accessible to every developer, everywhere.",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
        tag: "Our Story",
        readTime: "4 min read",
        sections: [
            {
                heading: "Our Mission",
                emoji: "🎯",
                desc: "Why we built InterviewAI and who it's designed to serve.",
                items: [
                    {
                        title: "Making Interview Prep Accessible to Everyone",
                        desc: "Technical interviews shouldn't be a barrier based on your network or resources. InterviewAI provides enterprise-grade interview practice — powered by Groq AI (LLaMA 3.3) — completely free. Whether you're a self-taught developer, a bootcamp graduate, or a CS student, you deserve the same quality preparation as someone with a coach at a top tech company.",
                        tag: "Mission",
                        tagColor: "#7c3aed",
                    },
                ],
            },
            {
                heading: "What Makes Us Different",
                emoji: "✨",
                desc: "The specific design decisions that set InterviewAI apart from static practice tools.",
                items: [
                    {
                        title: "Adaptive AI Interviewer",
                        desc: "Unlike static question banks, our AI generates unique questions based on your specific role, level, and tech stack. Follow-up questions adapt based on your answers, creating a realistic interview flow that challenges you appropriately.",
                        tag: "AI-Powered",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Real-time Scoring & Feedback",
                        desc: "Every answer is evaluated instantly on technical accuracy, communication, and depth. You get actionable feedback — not just a pass/fail — so you know exactly what to improve.",
                        tag: "Instant Feedback",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Speech-to-Text Recording",
                        desc: "Practice speaking your answers, not just typing them. Our microphone integration uses the Web Speech API for real-time transcription, replicating actual interview conditions.",
                        tag: "Immersive",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Full Interview History",
                        desc: "With PostgreSQL + Drizzle ORM integration, every interview is saved. Track your progress, identify patterns, and see your improvement over time through the Dashboard.",
                        tag: "Progress Tracking",
                        tagColor: "#f59e0b",
                    },
                ],
            },
            {
                heading: "Technology",
                emoji: "🔧",
                desc: "The modern stack powering every interview session.",
                items: [
                    {
                        title: "Built with Modern Tech",
                        desc: "React 18 + Vite for a blazing-fast frontend. Express.js backend with Drizzle ORM and PostgreSQL for data persistence. Groq AI (LLaMA 3.3 70B) for intelligent question generation and evaluation. Clerk for secure authentication. Framer Motion for smooth animations. Deployed on Vercel.",
                        tag: "Open Stack",
                        tagColor: "#7c3aed",
                    },
                ],
            },
        ],
    },

    contact: {
        title: "Contact Us",
        subtitle: "We'd love to hear from you — whether it's feedback, a bug report, or a partnership inquiry.",
        icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        tag: "Get In Touch",
        readTime: "1 min read",
        sections: [
            {
                heading: "Reach Out Directly",
                emoji: "📬",
                desc: "We're a small, responsive team. Expect a reply within 1–2 business days.",
                items: [
                    {
                        title: "📧 General & Support",
                        desc: "For general inquiries, account issues, or product feedback, email us at support@interviewai.dev — we read every message.",
                        tag: "Email",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "🐛 Bug Reports",
                        desc: "Found an issue? Open a GitHub issue with steps to reproduce, expected behavior, and your browser/OS info. Screenshots and console logs are incredibly helpful for faster resolution.",
                        tag: "GitHub",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "💡 Feature Requests",
                        desc: "Have an idea for a new feature? Email us or create a GitHub discussion. We prioritize features that the community is most excited about — your voice shapes the roadmap.",
                        tag: "Product",
                        tagColor: "#f59e0b",
                    },
                    {
                        title: "🤝 Partnerships & Enterprise",
                        desc: "Interested in integrating InterviewAI into your bootcamp, university, or hiring process? Reach out to partnerships@interviewai.dev and we'll explore how we can work together.",
                        tag: "Business",
                        tagColor: "#10b981",
                    },
                ],
            },
            {
                heading: "Community & Social",
                emoji: "🌐",
                desc: "Connect with thousands of developers preparing for their next role.",
                items: [
                    {
                        title: "GitHub",
                        desc: "Star our repo, contribute code, or browse the source. InterviewAI is open-source and we welcome contributions of all sizes — from typo fixes to major features. Every PR is reviewed personally.",
                        tag: "Open Source",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Twitter / X",
                        desc: "Follow @InterviewAI_dev for product updates, interview tips, and engineering content. We share insights from thousands of mock interviews every week.",
                        tag: "Social",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Discord",
                        desc: "Join our Discord community to connect with other job seekers, share interview experiences, and get tips from developers who've successfully landed roles at FAANG and top startups.",
                        tag: "Community",
                        tagColor: "#f59e0b",
                    },
                ],
            },
        ],
    },

    "privacy-policy": {
        title: "Privacy Policy",
        subtitle: "We take your privacy seriously. Here's exactly what data we collect, why, and how you can control it.",
        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
        tag: "Legal",
        readTime: "Last updated: February 2026",
        sections: [
            {
                heading: "Information We Collect",
                emoji: "📊",
                desc: "We collect the minimum data necessary to provide the service. Here's a precise breakdown.",
                items: [
                    {
                        title: "Account Information",
                        desc: "When you sign up via Clerk, we receive your name, email address, and profile image. We do not store passwords — authentication is handled entirely by Clerk's secure infrastructure using industry-standard OAuth flows.",
                        tag: "Account",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Interview Data",
                        desc: "When you conduct interviews, we store your questions, answers, evaluations, and scores in your PostgreSQL database. This data is stored only in the database you configure — we do not maintain any centralized data store.",
                        tag: "Your Data",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Usage Analytics",
                        desc: "We may collect anonymized usage data (page views, feature usage) to improve the product. No personally identifiable information is included in analytics data. This data is aggregated and never sold.",
                        tag: "Analytics",
                        tagColor: "#f59e0b",
                    },
                ],
            },
            {
                heading: "How We Use Your Data",
                emoji: "🔐",
                desc: "Data is used only for delivering and improving the service — never sold to third parties.",
                items: [
                    {
                        title: "Service Delivery",
                        desc: "Your interview data is used to generate AI evaluations, reports, and to populate your dashboard. This is the core functionality of the platform and cannot be disabled.",
                        tag: "Core",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Product Improvement",
                        desc: "Anonymized, aggregated data may be used to improve our AI models, user interface, and overall service quality. We never use individual interviews for model training without explicit consent.",
                        tag: "Improvement",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Communication",
                        desc: "We may use your email to send important service updates, security notices, or product announcements. You can opt out of non-essential emails at any time via the unsubscribe link.",
                        tag: "Email",
                        tagColor: "#3b82f6",
                    },
                ],
            },
            {
                heading: "Data Security & Retention",
                emoji: "🛡️",
                desc: "We apply security best practices at every layer of the stack.",
                items: [
                    {
                        title: "Security Measures",
                        desc: "All data is encrypted in transit (TLS 1.3) and at rest. Authentication is handled by Clerk with industry-standard security practices including MFA support. Database connections use SSL.",
                        tag: "Encryption",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Data Retention",
                        desc: "Your interview data is retained as long as your account is active. You can delete individual interviews from the Dashboard at any time. Account deletion removes all associated data within 30 days.",
                        tag: "Retention",
                        tagColor: "#f59e0b",
                    },
                    {
                        title: "Third-Party Services",
                        desc: "We use Clerk (authentication), Groq AI (interview AI), and Neon (database hosting as configured by you). Each service has its own privacy policy and data handling practices — links available on request.",
                        tag: "Third-Parties",
                        tagColor: "#3b82f6",
                    },
                ],
            },
            {
                heading: "Your Rights",
                emoji: "⚖️",
                desc: "You are in full control of your data at all times.",
                items: [
                    {
                        title: "Access & Portability",
                        desc: "You can access all your interview data through the Dashboard at any time. We support full data export in JSON format upon written request to support@interviewai.dev.",
                        tag: "Access",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Deletion",
                        desc: "You can delete individual interviews from the Dashboard instantly. For complete account deletion and data purge, contact support@interviewai.dev — we'll process it within 5 business days.",
                        tag: "Deletion",
                        tagColor: "#ef4444",
                    },
                    {
                        title: "Consent & Changes",
                        desc: "By using InterviewAI, you consent to this privacy policy. We will notify you of any material changes via email at least 14 days before they take effect, and via in-app notification.",
                        tag: "Consent",
                        tagColor: "#10b981",
                    },
                ],
            },
        ],
    },

    "terms-of-service": {
        title: "Terms of Service",
        subtitle: "Please read these terms carefully before using InterviewAI. They govern your use of the platform.",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        tag: "Legal",
        readTime: "Last updated: February 2026",
        sections: [
            {
                heading: "Acceptance of Terms",
                emoji: "✍️",
                desc: "By accessing InterviewAI, you enter a binding agreement with these terms.",
                items: [
                    {
                        title: "Agreement",
                        desc: "By accessing or using InterviewAI, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the platform.",
                        tag: "Binding",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Eligibility",
                        desc: "You must be at least 16 years old to use InterviewAI. By using the platform, you represent and warrant that you meet this age requirement and have legal capacity to enter this agreement.",
                        tag: "Age",
                        tagColor: "#3b82f6",
                    },
                ],
            },
            {
                heading: "Use of Service",
                emoji: "📋",
                desc: "What you can and cannot do on the platform.",
                items: [
                    {
                        title: "Permitted Use",
                        desc: "InterviewAI is designed for personal interview preparation and practice. You may use the platform to practice mock interviews, review your performance, and improve your skills for legitimate job applications.",
                        tag: "Allowed",
                        tagColor: "#10b981",
                    },
                    {
                        title: "Prohibited Use",
                        desc: "You may not: (a) use the platform to generate answers for actual job interviews in real-time, (b) scrape or copy interview questions for commercial purposes, (c) attempt to reverse-engineer the AI evaluation system, (d) share your account credentials, or (e) use the platform for any illegal purpose.",
                        tag: "Prohibited",
                        tagColor: "#ef4444",
                    },
                    {
                        title: "API Usage",
                        desc: "The backend API is intended for use with the InterviewAI frontend only. Automated access, scraping, or excessive API calls may result in rate limiting or account suspension without notice.",
                        tag: "API",
                        tagColor: "#f59e0b",
                    },
                ],
            },
            {
                heading: "Intellectual Property",
                emoji: "©️",
                desc: "Rights, ownership, and license grants.",
                items: [
                    {
                        title: "Platform Content",
                        desc: "The InterviewAI platform, including its code, design, and AI-generated content frameworks, is the intellectual property of InterviewAI. You may not copy, modify, or distribute the platform without explicit written permission.",
                        tag: "Our IP",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Your Content",
                        desc: "You retain ownership of your interview answers and any content you create on the platform. By using the service, you grant us a limited, non-exclusive license to process your content solely for the purpose of providing AI evaluations.",
                        tag: "Your IP",
                        tagColor: "#10b981",
                    },
                ],
            },
            {
                heading: "Disclaimers & Limitations",
                emoji: "⚠️",
                desc: "Important limitations of liability you should be aware of.",
                items: [
                    {
                        title: "No Guarantee of Employment",
                        desc: "InterviewAI is a practice tool. We do not guarantee that using our platform will result in job offers, interview invitations, or career advancement. Interview success depends on many factors beyond practice.",
                        tag: "Disclaimer",
                        tagColor: "#f59e0b",
                    },
                    {
                        title: "AI Accuracy",
                        desc: "Our AI evaluations are designed to be helpful and directional, but they are not infallible. Scores and feedback should be used as one input among many in your preparation — not as a definitive measure of your ability.",
                        tag: "AI Limits",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Service Availability",
                        desc: "We strive for high availability but do not guarantee uninterrupted access. The platform may be temporarily unavailable for maintenance, updates, or reasons beyond our control. We target 99.5% uptime.",
                        tag: "Availability",
                        tagColor: "#f59e0b",
                    },
                    {
                        title: "Limitation of Liability",
                        desc: "InterviewAI is provided 'as is' without warranties of any kind. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.",
                        tag: "Liability",
                        tagColor: "#ef4444",
                    },
                ],
            },
            {
                heading: "General Provisions",
                emoji: "📜",
                desc: "Miscellaneous legal terms governing this agreement.",
                items: [
                    {
                        title: "Modifications to Terms",
                        desc: "We reserve the right to modify these terms at any time. Material changes will be communicated via email or in-app notification at least 14 days in advance. Continued use after changes constitutes acceptance of the updated terms.",
                        tag: "Updates",
                        tagColor: "#7c3aed",
                    },
                    {
                        title: "Governing Law",
                        desc: "These terms are governed by the laws of the jurisdiction in which InterviewAI operates. Any disputes that cannot be resolved informally shall be settled through binding arbitration under mutually agreed rules.",
                        tag: "Legal",
                        tagColor: "#3b82f6",
                    },
                    {
                        title: "Contact for Legal Matters",
                        desc: "Questions about these terms, copyright claims, or formal legal notices should be directed to legal@interviewai.dev. We aim to respond to all legal inquiries within 5 business days.",
                        tag: "Contact",
                        tagColor: "#10b981",
                    },
                ],
            },
        ],
    },
};

// ── Main Component ─────────────────────────────────────
export default function InfoPage() {
    const { slug: paramSlug } = useParams();
    const location = useLocation();
    // Support both /info/:slug and direct routes like /interview-tips
    const slug = paramSlug || location.pathname.replace(/^\//, "");
    const navigate = useNavigate();
    const { isSignedIn } = useUser();
    const page = PAGES[slug];

    if (!page) {
        return (
            <div className="infopage-notfound">
                <div className="infopage-notfound-inner">
                    <div className="infopage-notfound-icon">404</div>
                    <h2 className="infopage-notfound-title">Page Not Found</h2>
                    <p className="infopage-notfound-desc">The page you're looking for doesn't exist or may have moved.</p>
                    <button onClick={() => navigate("/")} className="btn-primary">← Back to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="infopage-root">
            {/* Background decorations */}
            <div className="infopage-bg-blobs" aria-hidden="true">
                <div className="infopage-blob infopage-blob-1" />
                <div className="infopage-blob infopage-blob-2" />
            </div>

            {/* ── Navigation ── */}
            <nav className="infopage-nav">
                <button onClick={() => navigate("/")} className="infopage-nav-logo" aria-label="Go to homepage">
                    <div className="infopage-logo-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="infopage-logo-text">InterviewAI</span>
                </button>
                <div className="infopage-nav-actions">
                    <ThemeToggle />
                    {isSignedIn ? (
                        <UserButton />
                    ) : (
                        <button onClick={() => navigate("/login")} className="btn-primary" style={{ fontSize: 13, padding: "8px 20px" }}>
                            Get Started
                        </button>
                    )}
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className="infopage-main">

                {/* ── Page Header ── */}
                <motion.header className="infopage-header" {...fadeUp(0.05)}>
                    <div className="infopage-header-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d={page.icon} />
                        </svg>
                    </div>
                    <div className="infopage-header-meta">
                        <span className="infopage-tag">{page.tag}</span>
                        <span className="infopage-read-time">{page.readTime}</span>
                    </div>
                    <h1 className="infopage-title">{page.title}</h1>
                    <p className="infopage-subtitle">{page.subtitle}</p>
                </motion.header>

                {/* ── Table of Contents ── */}
                {page.sections.length > 2 && (
                    <motion.div className="infopage-toc" {...fadeUp(0.1)}>
                        <span className="infopage-toc-label">In this page:</span>
                        <div className="infopage-toc-pills">
                            {page.sections.map((s, i) => (
                                <span key={i} className="infopage-toc-pill">
                                    {s.emoji} {s.heading}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Sections ── */}
                {page.sections.map((section, si) => (
                    <motion.section
                        key={si}
                        className="infopage-section"
                        {...fadeUp(0.12 + si * 0.06)}
                    >
                        {/* Section Header */}
                        <div className="infopage-section-header">
                            <div
                                className="infopage-section-number"
                                style={{ background: SECTION_ACCENTS[si % SECTION_ACCENTS.length], color: SECTION_ICON_COLORS[si % SECTION_ICON_COLORS.length], borderColor: SECTION_BORDERS[si % SECTION_BORDERS.length] }}
                            >
                                {section.emoji}
                            </div>
                            <div className="infopage-section-title-group">
                                <h2 className="infopage-section-title">{section.heading}</h2>
                                {section.desc && <p className="infopage-section-desc">{section.desc}</p>}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="infopage-items">
                            {section.items.map((item, ii) => (
                                <div key={ii} className="infopage-item">
                                    <div className="infopage-item-header">
                                        <div className="infopage-item-num">{ii + 1}</div>
                                        <h3 className="infopage-item-title">{item.title}</h3>
                                        <div className="infopage-item-tags">
                                            {item.tag && (
                                                <span
                                                    className="infopage-item-tag"
                                                    style={{ color: item.tagColor, background: `${item.tagColor}15`, borderColor: `${item.tagColor}30` }}
                                                >
                                                    {item.tag}
                                                </span>
                                            )}
                                            {item.date && (
                                                <span className="infopage-item-date">{item.date}</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="infopage-item-desc">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                ))}

                {/* ── Back Button ── */}
                <motion.div className="infopage-back" {...fadeUp(0.35)}>
                    <button
                        onClick={() => navigate("/")}
                        className="infopage-back-btn"
                    >
                        ← Back to Home
                    </button>
                    <span className="infopage-back-sep">·</span>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="infopage-back-btn"
                    >
                        ↑ Back to top
                    </button>
                </motion.div>

            </main>
        </div>
    );
}
