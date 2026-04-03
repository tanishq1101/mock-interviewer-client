import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";

export default function LandingPage() {
    return (
        <div className="page-bg min-h-screen">
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <Testimonials />
            <Pricing />
            <CallToAction />
            <Footer />
        </div>
    );
}
