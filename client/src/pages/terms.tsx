import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 font-heading">Termat dhe Kushtet</h1>
          
          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p>Mirësevini në AplikoUSA. Duke përdorur shërbimet tona, ju pranoni këto terma dhe kushte.</p>

            <h3 className="text-xl font-semibold text-primary mt-6">1. Shërbimi Ynë</h3>
            <p>
              AplikoUSA është një shërbim privat dhe i pavarur që ofron asistencë në plotësimin dhe dorëzimin e aplikimeve për Programin e Vizave të Diversitetit (DV Lottery). 
              <strong>Ne NUK jemi pjesë e Qeverisë së Shteteve të Bashkuara, Departamentit të Shtetit ose ndonjë ambasade amerikane.</strong>
            </p>

            <h3 className="text-xl font-semibold text-primary mt-6">2. Tarifat</h3>
            <p>
              Shërbimi ynë kushton 20€. Kjo tarifë mbulon kohën dhe ekspertizën tonë për të kontrolluar të dhënat tuaja, për të rregulluar formatin e fotografisë dhe për të dorëzuar aplikimin në emrin tuaj. 
              Aplikimi zyrtar në DV Lottery është falas nëse e bëni vetë përmes faqes zyrtare të qeverisë.
            </p>

            <h3 className="text-xl font-semibold text-primary mt-6">3. Mungesa e Garancisë për Fitim</h3>
            <p>
              Ne garantojmë që aplikimi juaj do të plotësohet saktë dhe do të dorëzohet në kohë. Megjithatë, <strong>ne nuk garantojmë dhe nuk mund të garantojmë që ju do të përzgjidheni si fitues.</strong> 
              Përzgjedhja bëhet rastësisht nga sistemi kompjuterik i Departamentit të Shtetit të SHBA.
            </p>

            <h3 className="text-xl font-semibold text-primary mt-6">4. Përgjegjësia e Përdoruesit</h3>
            <p>
              Ju jeni përgjegjës për saktësinë e të dhënave që na ofroni. Nëse na jepni informacione të rreme ose të pasakta që çojnë në skualifikim, AplikoUSA nuk mban përgjegjësi.
            </p>

            <h3 className="text-xl font-semibold text-primary mt-6">5. Ndryshimet në Shërbim</h3>
            <p>
              Ne rezervojmë të drejtën të refuzojmë shërbimin ndaj çdo klienti për çfarëdo arsye, duke përfshirë dyshimet për mashtrim ose mungesë informacioni të nevojshëm.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
