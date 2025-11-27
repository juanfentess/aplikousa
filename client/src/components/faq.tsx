import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "A jeni pjesë e Ambasadës së SHBA?",
    answer: "Jo. AplikoUSA është një shërbim privat, ndihmës për plotësimin e saktë të formularit. Ne nuk kemi asnjë lidhje me qeverinë amerikane apo ambasadën.",
  },
  {
    question: "A garantoni që do fitoj Green Card?",
    answer: "Jo. Përzgjedhja e fituesve bëhet në mënyrë të rastësishme nga kompjuterat e Departamentit të Shtetit Amerikan (lotari). Ne garantojmë vetëm që aplikimi juaj do të jetë i saktë dhe nuk do të skualifikohet për gabime teknike.",
  },
  {
    question: "A mund të aplikoj nëse jam i martuar?",
    answer: "Po, absolutisht. Nëse jeni të martuar, ju mund të bëni dy aplikime: një ku aplikoni ju (dhe përfshini bashkëshorten/in), dhe një ku aplikon bashkëshorti/ja (dhe ju përfshin juve). Kjo dyfishon shanset për familjen tuaj.",
  },
  {
    question: "A ruani të dhënat e mia?",
    answer: "Ne i ruajmë të dhënat tuaja vetëm përkohësisht derisa të kryejmë aplikimin. Pas konfirmimit të aplikimit, të dhënat e ndjeshme fshihen nga sistemi ynë për të mbrojtur privatësinë tuaj.",
  },
  {
    question: "Kur shpallen rezultatet?",
    answer: "Rezultatet zakonisht shpallen në fillim të muajit Maj të vitit pasardhës. Ne do t'ju njoftojmë dhe do t'ju ndihmojmë të kontrolloni statusin tuaj.",
  },
  {
    question: "Çfarë ndodh nëse nuk kam pasaportë të vlefshme?",
    answer: "Rregullat kanë ndryshuar shpesh vitet e fundit. Aktualisht, pasaporta nuk është e detyrueshme në momentin e aplikimit, por duhet ta keni nëse përzgjidheni fitues.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-heading">
            Pyetje të Shpeshta
          </h2>
          <p className="text-gray-600">
            Gjeni përgjigjet për pyetjet më të zakonshme rreth procesit të Lotarisë Amerikane.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 px-4 hover:bg-gray-50 transition-colors rounded-lg mb-2">
              <AccordionTrigger className="text-left text-gray-900 font-medium py-4 hover:no-underline [&[data-state=open]]:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
