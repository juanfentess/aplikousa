import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@assets/generated_images/abstract_us_flag_background.png";

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-primary">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="USA Flag Abstract Background" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-background" />
      </div>

      {/* Animated Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -20, 0], 
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            x: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-white space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium text-white/90">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Aplikimet janë hapur
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight font-heading">
            Apliko për <span className="text-secondary">Green Card</span> (DV Lottery) nga shtëpia
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-lg">
            Ne plotësojmë formularin për ju, kontrollojmë foton dhe ju kursejmë gabimet – gjithçka profesionale dhe e sigurt për vetëm <span className="font-bold text-white">20€</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg"
              onClick={() => scrollToSection("apply")}
              className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 h-14 rounded-full shadow-lg hover:shadow-secondary/50 transition-all hover:-translate-y-1 group"
            >
              Apliko Tani (20€)
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14 rounded-full hover:border-white transition-all"
            >
              <a href="https://wa.me/38300000000" target="_blank" rel="noopener noreferrer">
                Na shkruaj në WhatsApp
              </a>
            </Button>
          </div>
          
          <div className="flex items-center gap-4 pt-8 text-sm text-white/60">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-primary flex items-center justify-center text-xs font-bold text-primary bg-gradient-to-br from-gray-100 to-gray-300">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p>Mbi 500+ aplikime të suksesshme vitin e kaluar</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative hidden md:block"
        >
          <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
             <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-green-400/30 via-blue-400/20 to-purple-400/30 flex flex-col items-center justify-center relative overflow-hidden group border border-white/30">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529101091760-6149d4c8f092?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
                
                {/* Decorative Elements */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-4 right-4 w-16 h-16 border-2 border-green-400/50 rounded-full opacity-40"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-6 left-4 w-12 h-12 border-2 border-blue-400/50 rounded-full opacity-30"
                />
                
                {/* Center Content */}
                <div className="relative z-10 text-center space-y-4">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-5xl font-bold text-white drop-shadow-lg"
                  >
                    🎯
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-white drop-shadow-md">Green Card Lottery</p>
                    <p className="text-sm text-white/80 drop-shadow">Përfundoji në 3 hapa</p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 opacity-80"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 opacity-80"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400 opacity-80"></div>
                  </div>
                </div>
                
                {/* Bottom Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur px-4 py-3 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow">
                  <p className="text-xs font-bold text-primary mb-1">✓ Zyrtar & Sigur</p>
                  <p className="text-[11px] text-gray-600">Aplikimi direkt në USCIS</p>
                </div>
             </div>
          </div>
          
          {/* Floating elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-10 -right-10 bg-secondary text-white p-4 rounded-xl shadow-xl z-20"
          >
            <p className="font-bold text-xl">100%</p>
            <p className="text-xs opacity-90">Pa Gabime</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
