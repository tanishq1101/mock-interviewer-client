import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: "easeOut" },
});

export default function TermsOfServicePage() {
    const navigate = useNavigate();

    return (
        <div className="page-bg min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-5xl w-full mx-auto px-6 pt-28 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-8 font-mono">
                    <button onClick={() => navigate("/")} className="hover:text-[var(--text)] transition-colors">HOME</button>
                    <span>/</span>
                    <span className="text-[var(--color-accent)]">TERMS OF SERVICE</span>
                </div>

                {/* Header */}
                <motion.div className="text-center mb-12" {...fadeUp(0.05)}>
                    <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase bg-[rgba(124,58,237,0.1)] px-4 py-2 rounded-full border border-[rgba(124,58,237,0.2)]">
                        Legal
                    </span>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)] mt-4 mb-4 tracking-tight">
                        Terms of Service
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
                                    { label: "1. Agreement", href: "#agreement" },
                                    { label: "2. Eligibility", href: "#eligibility" },
                                    { label: "3. Usage Rules", href: "#license" },
                                    { label: "4. Billing", href: "#billing" },
                                    { label: "5. Disclaimers", href: "#grading" },
                                    { label: "6. Liability", href: "#liability" },
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
                        {/* Agreement */}
                        <div id="agreement" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">1. Agreement to Terms</h2>
                            <p>
                                By utilizing the mock interview services, dashboards, APIs, or website offered at InterviewAI ("Service"), you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions set forth herein, you are strictly prohibited from utilizing the Service.
                            </p>
                        </div>

                        {/* Eligibility & Accounts */}
                        <div id="eligibility" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">2. User Accounts & Eligibility</h2>
                            <p>
                                To use the Service, you must be at least sixteen (16) years of age. You agree to provide accurate and complete registration information handled via Clerk Auth. You are solely responsible for maintaining the confidentiality of your session keys, auth state, and account settings. You must immediately notify support in the event of any unauthorized account activity.
                            </p>
                        </div>

                        {/* License & Rules */}
                        <div id="license" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">3. License Grant & Acceptable Use</h2>
                            <p className="mb-4">
                                We grant you a limited, non-transferable, non-exclusive, revocable license to access and practice coding/behavioral interviews on the Service for personal, non-commercial purposes.
                            </p>
                            
                            <div className="border border-red-500/20 bg-[rgba(239,68,68,0.03)] rounded-xl p-5 mb-3 text-red-200/90 text-sm">
                                <div className="flex items-center gap-2 mb-2.5 text-red-400 font-bold font-mono tracking-wider text-xs">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    PROHIBITED BEHAVIORS
                                </div>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Use our AI generator, chat bubbles, or question feeds in real-time to solve answers or cheat during an actual live job interview.</li>
                                    <li>Attempt to scrape, harvest, or automate queries to bypass interview session constraints or download LLM prompts.</li>
                                    <li>Reverse engineer the scoring mechanism, verdict evaluations, or API patterns.</li>
                                    <li>Share your Clerk login profile or Stripe payment subscriptions with external parties.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Stripe Subscriptions */}
                        <div id="billing" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">4. Subscriptions, Payments & Stripe Billing</h2>
                            <div className="space-y-4">
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">A. Subscription Plans:</strong> Free tier users are limited to ten (10) mock interviews. Pro features (₹499/mo or ₹1,000/quarter) and Pro Max features (₹899/mo or ₹2,200/quarter) require paid subscriptions processed via Stripe Checkout.
                                </p>
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">B. Auto-Renewal:</strong> Subscriptions automatically renew at the end of each billing cycle (monthly or quarterly) unless cancelled before the renewal date.
                                </p>
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">C. Cancellations:</strong> You can cancel your subscription plan at any time. When cancelled, your premium access will remain active until the end of the current paid billing interval.
                                </p>
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">D. Refunds:</strong> We offer a 7-day refund window for initial monthly subscription orders. Refund requests for quarterly plans are evaluated on a case-by-case basis. To request a refund, contact billing@interviewai.dev.
                                </p>
                            </div>
                        </div>

                        {/* Disclaimers */}
                        <div id="grading" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">5. Disclaimers & Grading Accuracy</h2>
                            <div className="space-y-4">
                                <div className="border border-amber-500/20 bg-[rgba(245,158,11,0.03)] rounded-xl p-5 text-amber-200/90 text-sm">
                                    <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold font-mono tracking-wider text-xs">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        IMPORTANT TECHNICAL DISCLAIMERS
                                    </div>
                                    <div className="space-y-3">
                                        <p>
                                            <strong className="text-amber-300 font-semibold">No Job Guarantee:</strong> InterviewAI is a preparatory tool. We offer absolutely no guarantee that practice sessions, scores, or overall verdicts will translate into job offers, technical passes, or successful recruitment rounds at any tech company.
                                        </p>
                                        <p>
                                            <strong className="text-amber-300 font-semibold">AI Score Subjectivity:</strong> Scoring and reports are generated by Groq-hosted LLaMA 3.3 models. AI evaluations are subjective, directional feedback guides, and should not be treated as absolute academic grading or industry certifications.
                                        </p>
                                    </div>
                                </div>
                                <p>
                                    <strong className="text-[var(--text)] font-semibold">AS IS Service:</strong> The Service is provided "AS IS" and "AS AVAILABLE" without any warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
                                </p>
                            </div>
                        </div>

                        {/* Liability */}
                        <div id="liability" className="scroll-mt-28">
                            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-3 border-l-2 border-[var(--color-primary)] pl-3">6. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by applicable law, InterviewAI and its subprocessors shall not be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to your use of, or inability to use, the Service.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div className="text-center mt-6" {...fadeUp(0.15)}>
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
