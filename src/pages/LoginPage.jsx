import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen page-bg flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full blur-[120px] animate-float" style={{ background: "rgba(124,58,237,0.1)" }} />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[120px] animate-float delay-200" style={{ background: "rgba(167,139,250,0.08)" }} />
            </div>

            <div className="relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>AI Mock Interviewer</h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sign in to start practicing</p>
                </div>
                <SignIn
                    routing="hash"
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-2xl",
                            formButtonPrimary: "bg-[#7c3aed] hover:bg-[#6d28d9]",
                        },
                    }}
                />
            </div>
        </div>
    );
}
