import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Ju lutem shkruani emailin tuaj");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast.success("Kontrolloni emailin tuaj për lidhjen e resetimit!");
      } else {
        toast.error(data.error || "Gabim në dërgimin e emailit");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Gabim në lidhjen me serverin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-gray-100 shadow-xl">
            {!submitted ? (
              <>
                <CardHeader className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-primary">Rivendos Fjalëkalimin</CardTitle>
                  <CardDescription>
                    Shkruani emailin tuaj dhe ne do të dërgojmë një lidhje për ta rivendosur fjalëkalimin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="emri@shembull.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-50"
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Duke dërguar...
                        </>
                      ) : (
                        <>
                          Dërgo Lidhjen
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm text-gray-500">
                  <Link href="/login" className="hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Kthehu në hyrje
                  </Link>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-600">Emaili i Dërguar!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <p className="text-gray-600">
                    Ne kemi dërguar një lidhje për rivendosjen e fjalëkalimit në adresën email <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Kontrolloni dosjen tuaj të spam-it nëse nuk e shihni emailin brenda disa minutash.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm">
                  <Link href="/login" className="hover:text-primary transition-colors flex items-center justify-center gap-2 text-primary font-semibold">
                    <ArrowLeft className="h-4 w-4" />
                    Kthehu në hyrje
                  </Link>
                </CardFooter>
              </>
            )}
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
