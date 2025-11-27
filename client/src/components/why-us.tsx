import { motion } from "framer-motion";
import { Check } from "lucide-react";

const benefits = [
  "Kontroll i fotos sipas rregullave strikte të DV Lottery",
  "Formular i plotësuar pa gabime teknike",
  "Mbështetje e plotë në gjuhën shqipe",
  "Çmim i qartë: vetëm 20€ pa tarifa të fshehura",
  "Konfirmim zyrtar i aplikimit në email",
  "Këshilla për hapat e mëtejshëm nëse përzgjidheni",
];

export function WhyUs() {
  return (
    <section id="why-us" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1565514020176-db2e03865743?q=80&w=2574&auto=format&fit=crop" 
                  alt="Happy family looking at results" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                  <p className="text-white font-medium italic">"Falë AplikoUSA, ëndrra jonë u bë realitet pa asnjë gabim në aplikim."</p>
                  <p className="text-white/80 text-sm mt-2">- Familja Berisha</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 font-heading">
                Pse të zgjedhësh <span className="text-secondary">AplikoUSA</span>?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Aplikimi për Green Card ka rregulla strikte. Një gabim i vogël në foto ose në të dhëna mund t'ju skualifikojë automatikisht. Ne sigurohemi që kjo të mos ndodhë.
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
