import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

export default function PrivacyPolicyPage() {
    const navigate = useNavigate();

    return (
        <div className="page-bg min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-5xl w-full mx-auto px-6 pt-28 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-8 font-mono">
                    <button onClick={() => navigate("/")} className="hover:text-[var(--text)] transition-colors">HOME</button>
                    <span>/</span>
                    <span className="text-[var(--color-accent)]">PRIVACY POLICY</span>
                </div>

                {/* Header */}
                <motion.div className="text-center mb-12" {...fadeUp(0.05)}>
                    <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase bg-[rgba(124,58,237,0.1)] px-4 py-2 rounded-full border border-[rgba(124,58,237,0.2)]">
                        Legal
                    </span>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)] mt-4 mb-4 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] font-mono">
                        Last Updated: June 2026
                    </p>
                </motion.div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                    {/* Left Column: Outline Sidebar */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-28">
                        <div className="glass-card p-5 space-y-4">
                            <h3 className="font-heading text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Outline</h3>
                            <nav className="flex flex-col gap-3 text-xs font-semibold font-mono">
                                {[
                                    { label: "1. Intro", href: "#intro" },
                                    { label: "2. Collect", href: "#collect" },
                                    { label: "3. Use Cases", href: "#use" },
                                    { label: "4. Storage", href: "#security" },
                                    { label: "5. Subprocessors", href: "#subprocessors" },
                                    { label: "6. User Rights", href: "#rights" },
                                ].map(item => (
                                    <a 
                                        key={item.href} 
                                        href={item.href} 
                                        className="text-[var(--text-muted)] hover:text-[var(--color-accent)] transition-colors border-l border-[rgba(148,163,184,0.1)] pl-3 hover:border-[var(--color-primary)]"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Right Column: Content Card */}
                    <motion.div 
                        className="glass-card p-8 sm:p-10 space-y-10 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed lg:col-span-9" 
                        {...fadeUp(0.1)}
                    >
                        {/* Introduction */}
                        <div id="intro" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">1. Introduction</h2>
                            <p>
                                InterviewAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, store, and share information when you use our mock interview platform, website, and related API services. By accessing or using the Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this policy.
                            </p>
                        </div>

                        {/* Information We Collect */}
                        <div id="collect" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">2. Information We Collect</h2>
                            <div className="space-y-4">
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">A. Account Information:</strong> Registration and authentication are managed securely by <strong className="text-[var(--text)]">Clerk</strong>. When you create an account, Clerk shares your name, email address, profile image, and metadata with us. We do not collect or store passwords on our own infrastructure.
                                </p>
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">B. Mock Sessions:</strong> We collect and process the text transcripts of your mock interviews. This includes the questions generated by our AI agent, the text inputs or voice transcripts of your answers, scores, verdicts, and final summary reports.
                                </p>
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">C. Audio Data:</strong> Our speech-to-text recording uses the browser's native **Web Speech API** (available in Chrome, Edge, etc.). The raw microphone audio is processed locally on your device or streamed directly to the browser's speech-recognition handler. We do not store, record, or upload raw audio files to our servers.
                                </p>
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">D. Billing Data:</strong> Payment processing is handled entirely by <strong className="text-[var(--text)]">Stripe</strong>. Stripe collects your billing address, payment details, card number, and transaction history. We only receive basic metadata (such as the subscription status, selected plan, and Stripe transaction references) to activate premium features.
                                </p>
                            </div>
                        </div>

                        {/* How We Use Your Information */}
                        <div id="use" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-5 space-y-2.5">
                                <li>To provide, operate, and maintain the interactive AI mock interview platform.</li>
                                <li>To process text answers through Groq AI models to generate score reports and feedback tips.</li>
                                <li>To store your history and show performance trends on your user dashboard (via Neon cloud PostgreSQL).</li>
                                <li>To process subscription payments and handle upgrades via Stripe.</li>
                                <li>To send service updates, security alerts, support messages, and transaction notifications.</li>
                            </ul>
                        </div>

                        {/* Data Storage and Security */}
                        <div id="security" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">4. Data Storage, Retention, and Security</h2>
                            <p>
                                All database persistence is hosted on <strong className="text-[var(--text)]">Neon cloud PostgreSQL</strong> and managed with Drizzle ORM. Connections are encrypted using TLS 1.3/SSL. We retain personal data as long as your account is active. You can delete individual interviews or your entire account directly from your dashboard at any time, which triggers immediate cascading deletion of related database rows.
                            </p>
                        </div>

                        {/* Subprocessors */}
                        <div id="subprocessors" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-4 border-l-2 border-[var(--color-primary)] pl-3">5. Subprocessors</h2>
                            <p className="mb-4">
                                We share data with trusted third-party subprocessors only to execute core features:
                            </p>
                            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.005)]">
                                <table className="w-full border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr className="bg-[rgba(124,58,237,0.04)] border-b border-[var(--border-subtle)]">
                                            <th className="p-3 text-left font-mono text-xs uppercase tracking-wider font-bold text-[var(--text)]">Subprocessor</th>
                                            <th className="p-3 text-left font-mono text-xs uppercase tracking-wider font-bold text-[var(--text)]">Purpose</th>
                                            <th className="p-3 text-left font-mono text-xs uppercase tracking-wider font-bold text-[var(--text)]">Data Transmitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(124,58,237,0.01)] transition-colors">
                                            <td className="p-4 font-semibold text-[var(--text)]">Clerk Inc.</td>
                                            <td className="p-4 text-[var(--text-secondary)]">User Authentication & Profile</td>
                                            <td className="p-4">
                                                <span className="font-mono text-xs text-[var(--color-accent)] bg-[rgba(124,58,237,0.04)] px-2.5 py-1 rounded border border-[rgba(124,58,237,0.1)] inline-block">Name, Email, Metadata</span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(124,58,237,0.01)] transition-colors">
                                            <td className="p-4 font-semibold text-[var(--text)]">Stripe Inc.</td>
                                            <td className="p-4 text-[var(--text-secondary)]">Subscription Billing Operations</td>
                                            <td className="p-4">
                                                <span className="font-mono text-xs text-[var(--color-accent)] bg-[rgba(124,58,237,0.04)] px-2.5 py-1 rounded border border-[rgba(124,58,237,0.1)] inline-block">Card detail, Address, Email</span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(124,58,237,0.01)] transition-colors">
                                            <td className="p-4 font-semibold text-[var(--text)]">Groq Inc.</td>
                                            <td className="p-4 text-[var(--text-secondary)]">AI Evaluation and Report Models</td>
                                            <td className="p-4">
                                                <span className="font-mono text-xs text-[var(--color-accent)] bg-[rgba(124,58,237,0.04)] px-2.5 py-1 rounded border border-[rgba(124,58,237,0.1)] inline-block">Role, Context, Answers</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-[rgba(124,58,237,0.01)] transition-colors">
                                            <td className="p-4 font-semibold text-[var(--text)]">Neon database</td>
                                            <td className="p-4 text-[var(--text-secondary)]">PostgreSQL Serverless Storage</td>
                                            <td className="p-4">
                                                <span className="font-mono text-xs text-[var(--color-accent)] bg-[rgba(124,58,237,0.04)] px-2.5 py-1 rounded border border-[rgba(124,58,237,0.1)] inline-block">Transcripts, Scores, History</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Your Rights */}
                        <div id="rights" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">6. GDPR & CCPA Rights</h2>
                            <p>
                                Depending on your region, you have rights to access, download, correct, or delete your personal data. You have the "Right to be Forgotten" (complete account and data erasure), which is fully supported. Reach out to <strong className="font-mono text-[var(--color-accent)] text-xs bg-[rgba(124,58,237,0.06)] px-2 py-0.5 rounded border border-[rgba(124,58,237,0.15)]">support@interviewai.dev</strong> to initiate any GDPR data export or compliance query.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div className="text-center mt-6" {...fadeUp(0.2)}>
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
