import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Si funksionon", id: "how-it-works" },
    { name: "Pse ne", id: "why-us" },
    { name: "Çfarë përfshihet", id: "pricing" },
    { name: "FAQ", id: "faq" },
    { name: "Kontakt", id: "contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative w-8 h-8 flex items-center justify-center bg-primary rounded-full text-white overflow-hidden group-hover:scale-105 transition-transform">
            <Flag className="w-4 h-4 fill-current" />
          </div>
          <span className={cn("text-xl font-bold font-heading", scrolled ? "text-primary" : "text-white")}>
            Apliko<span className="text-secondary">USA</span>
          </span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.id)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-secondary",
                scrolled ? "text-foreground" : "text-white/90"
              )}
            >
              {link.name}
            </button>
          ))}
          <Button 
            onClick={() => scrollToSection("apply")}
            className="bg-secondary hover:bg-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Apliko Tani
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className={scrolled ? "text-foreground" : "text-white"} /> : <Menu className={scrolled ? "text-foreground" : "text-white"} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-lg border-t md:hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left text-foreground font-medium py-2 border-b border-gray-100 last:border-0"
                >
                  {link.name}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection("apply")}
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
              >
                Apliko Tani
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
