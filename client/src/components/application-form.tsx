import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle, User, Users, Crown, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
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
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  package: z.enum(["individual", "couple", "family"]),
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
  
  // Spouse info (optional unless couple/family)
  spouseFirstName: z.string().optional(),
  spouseLastName: z.string().optional(),
  spouseBirthDate: z.object({
    day: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
  }).optional(),
  
  childrenCount: z.string().min(1, "Zgjidhni numrin e fëmijëve"),
  message: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "Duhet të pranoni kushtet dhe saktësinë e të dhënave",
  }),
});

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [spouseFileName, setSpouseFileName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      package: "individual",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthCountry: "",
      city: "",
      birthDate: { day: "", month: "", year: "" },
      gender: "male",
      maritalStatus: "single",
      childrenCount: "0",
      spouseFirstName: "",
      spouseLastName: "",
      spouseBirthDate: { day: "", month: "", year: "" },
      message: "",
      terms: false,
    },
  });

  const selectedPackage = form.watch("package");
  const maritalStatus = form.watch("maritalStatus");

  // Auto-update marital status based on package
  useEffect(() => {
    if (selectedPackage === "couple" || selectedPackage === "family") {
      form.setValue("maritalStatus", "married");
    }
  }, [selectedPackage, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!fileName) {
      form.setError("terms", { message: "Ju lutem ngarkoni fotografinë tuaj" });
      return;
    }

    if ((selectedPackage === "couple" || selectedPackage === "family") && !spouseFileName) {
       form.setError("terms", { message: "Ju lutem ngarkoni fotografinë e bashkëshortit/es" });
       return;
    }

    setIsSubmitting(true);
    
    try {
      // Register user with backend
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password,
          phone: values.phone,
          birthCountry: values.birthCountry,
          city: values.city,
          package: values.package,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        form.setError("terms", { message: error.error || "Registration failed" });
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      
      // Close dialog and redirect to verification
      setShowPasswordDialog(false);
      form.reset();
      setFileName(null);
      setSpouseFileName(null);
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to verify email page with userId
      setLocation(`/verify-email?userId=${data.userId}`);
    } catch (err) {
      form.setError("terms", { message: "Gabim gjatë regjistrimit" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("Fjalëkalimi duhet të ketë të paktën 6 karaktere");
      return;
    }
    if (password !== confirmPassword) {
      alert("Fjalëkalimet nuk përputhen");
      return;
    }

    // Trigger the form submission which will call onSubmit
    form.handleSubmit(onSubmit)();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isSpouse = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isSpouse) {
        setSpouseFileName(file.name);
      } else {
        setFileName(file.name);
      }
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
              
              {/* Package Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-primary">Zgjidhni Paketën</Label>
                <FormField
                  control={form.control}
                  name="package"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="individual" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                              <User className="mb-3 h-6 w-6 text-primary" />
                              <span className="font-bold">Individual (20€)</span>
                            </FormLabel>
                          </FormItem>
                          
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="couple" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 [&:has([data-state=checked])]:border-secondary cursor-pointer transition-all">
                              <Users className="mb-3 h-6 w-6 text-secondary" />
                              <span className="font-bold text-secondary">Çifti (35€)</span>
                            </FormLabel>
                          </FormItem>
                          
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="family" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                              <Crown className="mb-3 h-6 w-6 text-yellow-500" />
                              <span className="font-bold">Familjare (50€)</span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-px bg-gray-200 my-6" />
              
              <h3 className="text-lg font-semibold text-primary">Të dhënat e Aplikantit Kryesor</h3>

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

              <div className="space-y-2">
                <Label className="text-sm font-medium">Foto e Aplikantit Kryesor</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors bg-gray-50 cursor-pointer relative">
                   <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png" 
                    onChange={(e) => handleFileChange(e, false)}
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

              {/* Spouse Section - Only if Couple or Family */}
              <AnimatePresence>
                {(selectedPackage === "couple" || selectedPackage === "family") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 overflow-hidden border-t pt-6 border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-secondary">Të dhënat e Bashkëshortit/es</h3>
                    <div className="bg-secondary/5 p-6 rounded-xl space-y-6 border border-secondary/10">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="spouseFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emri</FormLabel>
                              <FormControl>
                                <Input placeholder="Emri i bashkëshortit/es" {...field} className="h-11 bg-white" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="spouseLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mbiemri</FormLabel>
                              <FormControl>
                                <Input placeholder="Mbiemri i bashkëshortit/es" {...field} className="h-11 bg-white" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Data e Lindjes</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="spouseBirthDate.day"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Dita" type="number" min="1" max="31" {...field} className="h-11 bg-white" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="spouseBirthDate.month"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="h-11 bg-white">
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
                            name="spouseBirthDate.year"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Viti" type="number" min="1900" max="2025" {...field} className="h-11 bg-white" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Foto e Bashkëshortit/es</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-secondary transition-colors bg-white cursor-pointer relative">
                          <input 
                            type="file" 
                            accept=".jpg,.jpeg,.png" 
                            onChange={(e) => handleFileChange(e, true)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                              {spouseFileName ? (
                                <>
                                  <Check className="w-8 h-8 text-green-500" />
                                  <span className="font-medium text-secondary">{spouseFileName}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm font-medium">Klikoni për të ngarkuar foto</span>
                                  <span className="text-xs">JPG, JPEG, PNG (Max 5MB)</span>
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statusi Martesor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={selectedPackage !== "individual"}>
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

              {/* Children Note - If Family Selected */}
              <AnimatePresence>
                {selectedPackage === "family" && form.watch("childrenCount") !== "0" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-800">
                      Për fëmijët, ne do t'ju kontaktojmë më vonë për të marrë detajet e tyre (emrat, datëlindjet dhe fotot), për të mos e rënduar këtë formular tani.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

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
                  `Dërgo Aplikimin (${
                    selectedPackage === "family" ? "50€" : selectedPackage === "couple" ? "35€" : "20€"
                  })`
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Krijoni Llogarinë Tuaj</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Për të ndjekur statusin e aplikimit tuaj, ju lutem vendosni një fjalëkalim për të krijuar llogarinë.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateAccount} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Fjalëkalimi i Ri</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Të paktën 6 karaktere"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmo Fjalëkalimin</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Përsërit fjalëkalimin"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={creatingAccount}
            >
              {creatingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Duke krijuar llogarinë...
                </>
              ) : (
                "Krijo Llogari & Vazhdo"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
