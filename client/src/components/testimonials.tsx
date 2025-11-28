import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Arben K.",
    location: "Prishtinë",
    text: "Shërbim fantastik! Nuk doja të rrezikoja me gabime teknike, dhe AplikoUSA e bëri procesin shumë të lehtë. Tani jam në pritje të rezultateve!",
    rating: 5
  },
  {
    name: "Teuta M.",
    location: "Tiranë",
    text: "Isha shumë e paqartë rreth kërkesave për foto, por stafi më ndihmoi të rregulloja gjithçka. Profesionistë të vërtetë.",
    rating: 5
  },
  {
    name: "Besnik & Valbona",
    location: "Prizren",
    text: "Aplikuam si çift dhe kursyem para. Është shumë e rëndësishme të kesh dikë që e njeh procesin në detaje. Faleminderit!",
    rating: 5
  },
  {
    name: "Genti S.",
    location: "Ferizaj",
    text: "Vitin e kaluar u skualifikova për shkak të fotos. Këtë vit zgjodha AplikoUSA dhe gjithçka shkoi për mrekulli. Rekomandim maksimal.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4 font-heading">
            Çfarë thonë klientët tanë?
          </h2>
          <p className="text-gray-600 dark:text-slate-300 text-lg">
            Kënaqësia e klientëve është prioriteti ynë. Ja disa nga përvojat e tyre.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-slate-800">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="mb-4 text-secondary">
                          <Quote className="w-8 h-8 opacity-20 dark:opacity-10" />
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 italic mb-6 flex-grow">
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center justify-between mt-auto border-t pt-4 border-gray-100 dark:border-slate-700">
                          <div>
                            <p className="font-bold text-primary dark:text-white">{testimonial.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{testimonial.location}</p>
                          </div>
                          <div className="flex">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 border-primary text-primary hover:bg-primary hover:text-white" />
            <CarouselNext className="hidden md:flex -right-12 border-primary text-primary hover:bg-primary hover:text-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
