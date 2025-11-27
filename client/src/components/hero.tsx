import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@assets/generated_images/abstract_us_flag_background.png";
import heroCard from "@assets/generated_images/green_card_lottery_professional_hero_image.png";

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
          {/* Glow Effect */}
          <div className="absolute -inset-3 bg-gradient-to-r from-secondary/30 via-blue-500/20 to-transparent rounded-3xl blur-3xl opacity-40"></div>
          
          <div className="relative z-10">
            {/* Premium Card Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.4)] border border-white/10">
              
              {/* Main Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={heroCard}
                  alt="Green Card Lottery Professional"
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-transparent to-primary/40"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative aspect-[4/3] flex flex-col justify-between p-10">
                
                {/* Top Section - Badge */}
                <div className="flex justify-between items-start">
                  <div></div>
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="z-20"
                  >
                    <div className="bg-secondary text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-[0_12px_30px_rgba(230,57,70,0.5)] border border-white/20 backdrop-blur-md">
                      <div className="text-center">
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-xs font-medium">Pa Gabime</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Middle Section - Main Content */}
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                  {/* Animated Icon Badge */}
                  <motion.div 
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-xl"
                  >
                    <div className="text-3xl">✓</div>
                  </motion.div>

                  {/* Main Headline */}
                  <div className="space-y-3">
                    <h3 className="text-4xl font-bold text-white font-heading drop-shadow-lg">
                      Green Card Lottery
                    </h3>
                    <p className="text-white/95 text-lg font-medium drop-shadow-md">
                      Përfundoji në 3 hapa të thjeshtë
                    </p>
                  </div>

                  {/* Progress Dots */}
                  <div className="flex items-center gap-4 pt-2">
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.25 }}
                      className="w-3.5 h-3.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/60"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                      className="w-3.5 h-3.5 rounded-full bg-purple-400 shadow-lg shadow-purple-400/60"
                    />
                  </div>
                </div>

                {/* Bottom Section - Info Bar */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-green-600 font-bold">✓</span>
                    <div>
                      <p className="text-sm font-bold text-primary">Zyrtar & 100% Sigur</p>
                      <p className="text-xs text-gray-600">Aplikimi direkt në USCIS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
