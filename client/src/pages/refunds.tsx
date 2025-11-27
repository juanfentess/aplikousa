import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function Refunds() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 font-heading">Politika e Rimbursimit</h1>
          
          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p>Ne duam që ju të jeni të kënaqur me shërbimin tonë. Më poshtë gjeni politikën tonë për kthimin e parave.</p>

            <h3 className="text-xl font-semibold text-primary mt-6">1. Rimbursimi i plotë</h3>
            <p>
              Ju keni të drejtë për rimbursim të plotë (100%) në rastet e mëposhtme:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Nëse ne dështojmë të dorëzojmë aplikimin tuaj brenda afatit zyrtar.</li>
              <li>Nëse vendosni të anuloni shërbimin brenda 24 orëve nga pagesa, dhe ne nuk kemi filluar ende procesimin e aplikimit tuaj.</li>
              <li>Nëse ndodh një gabim teknik nga ana jonë që pamundëson aplikimin.</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary mt-6">2. Kur nuk ofrohet rimbursim</h3>
            <p>
              Rimbursimi nuk ofrohet në rastet kur:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Aplikimi juaj është dorëzuar me sukses dhe keni marrë numrin e konfirmimit.</li>
              <li>Ju keni dhënë të dhëna të pasakta që kanë çuar në skualifikim, pavarësisht udhëzimeve tona.</li>
              <li>Ju nuk jeni përzgjedhur si fitues (pasi kjo është lotari dhe nuk varet nga ne).</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary mt-6">3. Procesi i kërkesës</h3>
            <p>
              Për të kërkuar një rimbursim, ju lutem na kontaktoni në <strong>info@aplikousa.com</strong> ose përmes WhatsApp, duke përfshirë emrin tuaj të plotë dhe arsyen e kërkesës.
              Kërkesat shqyrtohen brenda 48 orëve.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
