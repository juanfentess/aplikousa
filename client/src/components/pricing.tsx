import { motion } from "framer-motion";
import { Check, Star, Users, User, Crown } from "lucide-react";
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

const plans = [
  {
    name: "Individual",
    price: "20€",
    description: "Për një person të vetëm",
    icon: User,
    highlight: false,
    features: features
  },
  {
    name: "Çifti (Partnerë)",
    price: "35€",
    description: "Për ju dhe bashkëshortin/en",
    icon: Users,
    highlight: true,
    features: [
      ...features,
      "Dy aplikime të veçanta",
      "Dyfishim i shanseve",
      "Kurseni 5€"
    ]
  },
  {
    name: "Familjare",
    price: "50€",
    description: "Për prindërit dhe fëmijët",
    icon: Crown,
    highlight: false,
    features: [
      ...features,
      "Aplikim për gjithë familjen",
      "Përfshirje e të gjithë fëmijëve",
      "Prioritet në përpunim"
    ]
  }
];

export function Pricing() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="py-24 bg-primary dark:bg-slate-950 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute -top-[30%] -right-[10%] w-[600px] h-[600px] bg-secondary/20 dark:bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            Zgjidhni paketën tuaj
          </h2>
          <p className="text-white/70 dark:text-slate-300 text-lg">
            Investoni në të ardhmen tuaj me çmimet më konkurruese në treg.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700/50 overflow-hidden relative flex flex-col ${plan.highlight ? 'ring-2 ring-secondary scale-105 z-10' : 'hover:bg-white/15 dark:hover:bg-slate-800/70 transition-colors'}`}>
                {plan.highlight && (
                  <div className="absolute top-0 right-0 left-0 bg-secondary text-white text-xs font-bold py-1 text-center shadow-md">
                    MË E KËRKUARA
                  </div>
                )}
                
                <CardHeader className="text-center pt-10 pb-6 border-b border-white/10 dark:border-slate-700/50">
                  <div className="mx-auto w-12 h-12 rounded-full bg-white/10 dark:bg-slate-700/50 flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl font-medium">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline justify-center text-white">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  </div>
                  <p className="text-white/60 dark:text-slate-300 text-sm mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-8 px-6 pb-8 flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/90 text-sm">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-secondary" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="px-6 pb-8">
                  <Button 
                    onClick={() => scrollToSection("apply")}
                    variant={plan.highlight ? "default" : "secondary"}
                    className={`w-full h-12 text-base font-semibold shadow-lg ${plan.highlight ? 'bg-secondary hover:bg-secondary/90 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
                  >
                    Zgjidh Paketën
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
           <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <span className="text-sm text-white/80">Vlerësuar 4.9/5 nga klientët tanë</span>
           </div>
        </div>
      </div>
    </section>
  );
}
