import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const formSchema = z.object({
  firstName: z.string().min(2, "Emri duhet të ketë të paktën 2 karaktere"),
  lastName: z.string().min(2, "Mbiemri duhet të ketë të paktën 2 karaktere"),
  email: z.string().email("Ju lutem shkruani një email të vlefshëm"),
  phone: z.string().min(6, "Numri i telefonit nuk është i vlefshëm"),
  birthCountry: z.string().min(1, "Ju lutem zgjidhni shtetin e lindjes"),
  city: z.string().min(2, "Ju lutem shkruani qytetin"),
  birthDate: z.object({
    day: z.string().min(1),
    month: z.string().min(1),
    year: z.string().min(4),
  }),
  gender: z.enum(["male", "female"], {
    required_error: "Ju lutem zgjidhni gjininë",
  }),
  maritalStatus: z.string().min(1, "Ju lutem zgjidhni statusin martesor"),
  childrenCount: z.string().min(1, "Zgjidhni numrin e fëmijëve"),
  message: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "Duhet të pranoni kushtet dhe saktësinë e të dhënave",
  }),
  // File handling would need a refine check in a real app, here we mock it
});

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthCountry: "",
      city: "",
      birthDate: { day: "", month: "", year: "" },
      message: "",
      terms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!fileName) {
      form.setError("terms", { message: "Ju lutem ngarkoni fotografinë tuaj" });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    form.reset();
    setFileName(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <section id="apply" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary mb-3 font-heading">
              Apliko Tani për Green Card
            </h2>
            <p className="text-gray-500">
              Plotësoni formularin e mëposhtëm me kujdes. Ne do të rishikojmë gjithçka para dërgimit.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emri</FormLabel>
                      <FormControl>
                        <Input placeholder="Emri juaj" {...field} className="h-11 bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mbiemri</FormLabel>
                      <FormControl>
                        <Input placeholder="Mbiemri juaj" {...field} className="h-11 bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Adresa</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@shembull.com" {...field} className="h-11 bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numri i Telefonit</FormLabel>
                      <FormControl>
                        <Input placeholder="+383 4X XXX XXX" {...field} className="h-11 bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="birthCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shteti i Lindjes</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-gray-50">
                            <SelectValue placeholder="Zgjidhni shtetin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kosovo">Kosovë</SelectItem>
                          <SelectItem value="albania">Shqipëri</SelectItem>
                          <SelectItem value="macedonia">Maqedoni e Veriut</SelectItem>
                          <SelectItem value="montenegro">Mali i Zi</SelectItem>
                          <SelectItem value="other">Tjetër</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qyteti i Banimit</FormLabel>
                      <FormControl>
                        <Input placeholder="p.sh. Prishtinë" {...field} className="h-11 bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Data e Lindjes</Label>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate.day"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Dita" type="number" min="1" max="31" {...field} className="h-11 bg-gray-50" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate.month"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="h-11 bg-gray-50">
                              <SelectValue placeholder="Muaji" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={`${i + 1}`}>
                                  {new Date(0, i).toLocaleString('sq-AL', { month: 'long' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate.year"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Viti" type="number" min="1900" max="2025" {...field} className="h-11 bg-gray-50" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="min-h-[20px]">
                  {(form.formState.errors.birthDate?.day?.message || 
                    form.formState.errors.birthDate?.month?.message || 
                    form.formState.errors.birthDate?.year?.message) && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {form.formState.errors.birthDate?.day?.message || 
                       form.formState.errors.birthDate?.month?.message || 
                       form.formState.errors.birthDate?.year?.message}
                    </p>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Gjinia</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-6"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal">Mashkull</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">Femër</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statusi Martesor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-gray-50">
                            <SelectValue placeholder="Zgjidhni statusin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Beqar/e</SelectItem>
                          <SelectItem value="married">I/E Martuar</SelectItem>
                          <SelectItem value="divorced">I/E Divorcuar</SelectItem>
                          <SelectItem value="widowed">I/E Ve</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="childrenCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numri i fëmijëve (nën 21 vjeç)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-gray-50">
                            <SelectValue placeholder="Zgjidhni numrin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4+">4 ose më shumë</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Ngarkoni fotografinë tuaj</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors bg-gray-50 cursor-pointer relative">
                   <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      {fileName ? (
                        <>
                          <Check className="w-8 h-8 text-green-500" />
                          <span className="font-medium text-primary">{fileName}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-medium">Klikoni për të ngarkuar foto</span>
                          <span className="text-xs">JPG, JPEG, PNG (Max 5MB)</span>
                        </>
                      )}
                   </div>
                </div>
                {!fileName && form.formState.errors.terms && (
                  <p className="text-xs text-destructive mt-1">Foto është e detyrueshme</p>
                )}
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mesazh ose komente shtesë (Opsionale)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Keni ndonjë pyetje ose paqartësi?" 
                        className="resize-none bg-gray-50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50/50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Deklaroj se të dhënat e vendosura janë të sakta
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Ju jeni përgjegjës për vërtetësinë e informacionit të dhënë.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Duke dërguar...
                  </>
                ) : (
                  "Dërgo Aplikimin"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">Aplikimi u dërgua me sukses!</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Faleminderit që zgjodhët AplikoUSA. Ne kemi pranuar të dhënat tuaja dhe do t'ju kontaktojmë së shpejti për konfirmim.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={() => setShowSuccess(false)} className="w-full sm:w-auto">
              Mbyll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
