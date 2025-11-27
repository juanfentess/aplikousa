import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 font-heading">Politika e Privatësisë</h1>
          
          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p>Në AplikoUSA, privatësia juaj është prioriteti ynë kryesor. Ky dokument shpjegon se si ne mbledhim, përdorim dhe mbrojmë të dhënat tuaja personale.</p>

            <h3 className="text-xl font-semibold text-primary mt-6">1. Të dhënat që ne mbledhim</h3>
            <p>
              Për të procesuar aplikimin tuaj, ne mbledhim informacionet e mëposhtme:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Emrin, mbiemrin, datëlindjen, vendlindjen.</li>
              <li>Të dhënat e kontaktit (email, numër telefoni).</li>
              <li>Statusin martesor dhe të dhënat e familjarëve (nëse ka).</li>
              <li>Fotografitë personale për aplikim.</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary mt-6">2. Përdorimi i të dhënave</h3>
            <p>
              Të dhënat tuaja përdoren <strong>VETËM</strong> për qëllimin e plotësimit dhe dërgimit të aplikimit tuaj në Lotarinë Amerikane (DV Lottery). 
              Ne nuk i shesim, nuk i shkëmbejmë dhe nuk i transferojmë të dhënat tuaja te palët e treta për qëllime marketing.
            </p>

            <h3 className="text-xl font-semibold text-primary mt-6">3. Ruajtja dhe Siguria</h3>
            <p>
              Të dhënat tuaja ruhen në servera të sigurt për kohëzgjatjen e nevojshme për të kryer shërbimin. 
              Pas përfundimit të periudhës së aplikimit dhe konfirmimit të dërgimit, të dhënat tuaja personale të ndjeshme fshihen nga sistemet tona aktive.
            </p>

            <h3 className="text-xl font-semibold text-primary mt-6">4. Të drejtat tuaja</h3>
            <p>
              Ju keni të drejtë të kërkoni qasje në të dhënat që kemi për ju, të kërkoni korrigjimin e tyre ose fshirjen e tyre në çdo kohë para se aplikimi të jetë dërguar.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
