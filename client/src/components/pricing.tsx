import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const features = [
  "Kontroll dhe riformatim i fotos",
  "Plotësim profesional i formularit",
  "Ruajtje e sigurt e të dhënave",
  "Konfirmim zyrtar me email",
  "Udhëzues PDF pas aplikimit",
  "Njoftim për rezultatet",
];

export function Pricing() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="py-24 bg-primary text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute -top-[30%] -right-[10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            Çfarë përfshihet në çmim?
          </h2>
          <p className="text-white/70 text-lg">
            Investoni në të ardhmen tuaj me një çmim minimal dhe shërbim maksimal.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
                MOST POPULAR
              </div>
              
              <CardHeader className="text-center pt-10 pb-6 border-b border-white/10">
                <CardTitle className="text-white text-2xl font-medium">Paketa e Plotë</CardTitle>
                <div className="mt-4 flex items-baseline justify-center text-white">
                  <span className="text-5xl font-bold tracking-tight">20€</span>
                  <span className="text-white/60 ml-2 text-lg">/ aplikim</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-8 px-8 pb-8">
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-white/90">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-secondary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="px-8 pb-10">
                <Button 
                  onClick={() => scrollToSection("apply")}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white h-12 text-lg font-semibold shadow-lg"
                >
                  Apliko Tani
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          <div className="mt-8 text-center">
             <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="text-sm text-white/80">Vlerësuar 4.9/5 nga klientët tanë</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
