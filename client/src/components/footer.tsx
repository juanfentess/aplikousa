import { Link } from "wouter";
import { Facebook, Instagram, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="bg-primary text-white pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <div className="w-4 h-4 bg-secondary rounded-full" />
              </div>
              <Link href="/">
                <span className="text-2xl font-bold font-heading cursor-pointer">
                  Apliko<span className="text-secondary">USA</span>
                </span>
              </Link>
            </div>
            <p className="text-white/60 leading-relaxed">
              Partneri juaj i besueshëm për rrugëtimin drejt ëndrrës amerikane. Aplikim i sigurt, i shpejtë dhe profesional.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-secondary flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-secondary flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 font-heading">Na Kontaktoni</h3>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary" />
                <span>+383 49 771 673</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                <span>info@aplikousa.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-secondary" />
                <span>Hënë - Premte: 09:00 - 18:00</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 font-heading">Linqe të Shpejta</h3>
            <ul className="space-y-3 text-white/70">
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors cursor-pointer">Si funksionon</Link></li>
              <li><Link href="/#why-us" className="hover:text-white transition-colors cursor-pointer">Pse ne</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors cursor-pointer">Çmimet</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors cursor-pointer">Pyetje të shpeshta</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 font-heading">Legal</h3>
            <ul className="space-y-3 text-white/70">
              <li><Link href="/terms" className="hover:text-white transition-colors cursor-pointer">Termat dhe Kushtet</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">Politika e Privatësisë</Link></li>
              <li><Link href="/refunds" className="hover:text-white transition-colors cursor-pointer">Rimbursimet</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} AplikoUSA. Të gjitha të drejtat e rezervuara.
          </p>
          <p className="text-white/30 text-xs max-w-md text-center md:text-right">
            DISCLAIMER: AplikoUSA NUK është pjesë e Qeverisë së SHBA dhe nuk ka asnjë lidhje me Ambasadën e SHBA. Ne ofrojmë vetëm shërbim ndihmës për plotësimin e formularit.
          </p>
        </div>
      </div>
    </footer>
  );
}
