import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/features";
import { WhyUs } from "@/components/why-us";
import { Pricing } from "@/components/pricing";
import { ApplicationForm } from "@/components/application-form";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      {/* Custom Cursor */}
      <motion.div
        className="cursor-dot hidden md:block"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyUs />
      <Pricing />
      <ApplicationForm />
      <FAQ />
      <Footer />
    </div>
  );
}
