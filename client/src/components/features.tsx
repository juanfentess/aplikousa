import { motion } from "framer-motion";
import { FileText, Upload, CheckCircle, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: FileText,
    title: "Plotësoni formularin",
    description: "Mbushni të dhënat tuaja personale në formularin tonë të thjeshtuar online.",
  },
  {
    icon: Upload,
    title: "Ngarkoni fotografinë",
    description: "Ngarkoni një foto të thjeshtë, ne e rregullojmë sipas standardeve.",
  },
  {
    icon: CheckCircle,
    title: "Verifikimi dhe dërgimi",
    description: "Ekspertët tanë kontrollojnë çdo detaj dhe dorëzojnë aplikimin zyrtar.",
  },
  {
    icon: Bell,
    title: "Njoftimi i rezultatit",
    description: "Ju dërgojmë konfirmimin dhe ju njoftojmë ditën kur shpallen fituesit.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4 font-heading">
            Si funksionon procesi?
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300">
            Ne e kemi thjeshtuar procesin e aplikimit në 4 hapa të shpejtë, që ju të mos keni asnjë stres.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white dark:bg-slate-800 group">
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
