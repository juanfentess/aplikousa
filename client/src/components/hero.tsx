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
          {/* Outer Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-60"></div>
          
          <div className="relative z-10">
            {/* Main Card with Premium Border */}
            <div className="relative bg-gradient-to-br from-slate-800/40 via-blue-900/30 to-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
              
              {/* Animated Background Gradients */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div 
                  animate={{ 
                    x: [0, 100, 0],
                    y: [0, 50, 0]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent rounded-full blur-3xl"
                />
                <motion.div 
                  animate={{ 
                    x: [0, -50, 0],
                    y: [0, -100, 0]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 via-transparent to-transparent rounded-full blur-3xl"
                />
              </div>

              {/* Content Container */}
              <div className="relative aspect-[4/3] flex flex-col items-center justify-center p-8">
                
                {/* Top Right Premium Badge */}
                <motion.div 
                  animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-6 right-6 z-30"
                >
                  <div className="bg-gradient-to-br from-secondary to-red-600 text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-[0_10px_25px_rgba(230,57,70,0.4)] border border-white/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">100%</span>
                      <span className="text-xs font-medium">Pa Gabime</span>
                    </div>
                  </div>
                </motion.div>

                {/* Center Content Area */}
                <div className="flex flex-col items-center justify-center gap-8">
                  
                  {/* Premium Icon - Target with animated elements */}
                  <div className="relative w-20 h-20">
                    {/* Outer rotating circle */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-transparent border-t-secondary border-r-secondary rounded-full opacity-70"
                    />
                    
                    {/* Middle pulsing circle */}
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-2 border border-secondary rounded-full opacity-60"
                    />
                    
                    {/* Center target */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-secondary to-red-600 rounded-full shadow-lg shadow-secondary/50"></div>
                    </div>
                    
                    {/* Arrow animation */}
                    <motion.div 
                      animate={{ x: [0, 4, 0], y: [0, -4, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-1 -right-1 text-secondary text-2xl font-bold opacity-80"
                    >
                      →
                    </motion.div>
                  </div>

                  {/* Text Content */}
                  <div className="text-center space-y-4">
                    <h3 className="text-3xl font-bold text-white font-heading tracking-tight drop-shadow-lg">
                      Green Card Lottery
                    </h3>
                    <p className="text-white/90 text-sm font-medium drop-shadow">
                      Përfundoji në 3 hapa të thjeshtë
                    </p>
                  </div>

                  {/* Steps Progress Indicator */}
                  <div className="flex items-center gap-3">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg shadow-emerald-400/50"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 shadow-lg shadow-blue-400/50"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg shadow-purple-400/50"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Premium Section */}
              <div className="relative bg-gradient-to-r from-white/98 to-white/95 backdrop-blur-sm px-8 py-5 border-t border-white/30">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-green-600">✓</span>
                    <p className="text-sm font-bold text-primary">Zyrtar & 100% Sigur</p>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Aplikimi direkt në USCIS - Nuk janë mashtrues
                  </p>
                </motion.div>
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
