import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Flag, User, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    } else {
      // If not on home page, navigate to home then scroll
      window.location.href = `/#${id}`;
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
          ? "dark:bg-slate-900/80 bg-white/80 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 flex items-center justify-center bg-primary dark:bg-secondary rounded-full text-white overflow-hidden group-hover:scale-105 transition-transform">
            <Flag className="w-4 h-4 fill-current" />
          </div>
          <span className={cn("text-xl font-bold font-heading", scrolled ? "text-primary dark:text-white" : "text-white")}>
            Apliko<span className="text-secondary dark:text-orange-400">USA</span>
          </span>
        </Link>

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
          
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                scrolled 
                  ? "hover:bg-gray-100 dark:hover:bg-slate-800" 
                  : "hover:bg-white/10"
              )}
              data-testid="button-toggle-theme"
            >
              {theme === "dark" ? (
                <Sun className={scrolled ? "text-foreground" : "text-white"} size={20} />
              ) : (
                <Moon className={scrolled ? "text-foreground" : "text-white"} size={20} />
              )}
            </button>
          )}

          <Link href="/login">
            <Button 
              variant="ghost" 
              className={cn(
                "gap-2 hover:bg-white/10", 
                scrolled ? "text-foreground hover:text-primary hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800" : "text-white hover:text-white"
              )}
            >
              <User className="w-4 h-4" />
              Hyr
            </Button>
          </Link>

          <Button 
            onClick={() => scrollToSection("apply")}
            className="bg-secondary hover:bg-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Apliko Tani
          </Button>
        </div>

        {/* Mobile Buttons */}
        <div className="md:hidden flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2"
              data-testid="button-toggle-theme-mobile"
            >
              {theme === "dark" ? (
                <Sun className={scrolled ? "text-foreground" : "text-white"} size={20} />
              ) : (
                <Moon className={scrolled ? "text-foreground" : "text-white"} size={20} />
              )}
            </button>
          )}
          <button
            className="md:hidden text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className={scrolled ? "text-foreground" : "text-white"} /> : <Menu className={scrolled ? "text-foreground" : "text-white"} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 shadow-lg border-t dark:border-slate-700 md:hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left text-foreground dark:text-slate-100 font-medium py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
                >
                  {link.name}
                </button>
              ))}
              <Link href="/login">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  Hyr në llogari
                </Button>
              </Link>
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