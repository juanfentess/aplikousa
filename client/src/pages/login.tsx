import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await response.json();
      if (response.ok && data.userId) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("paymentStatus", data.paymentStatus || "pending");
        toast.success("Hyrje e suksesshme!");
        setLocation("/dashboard");
      } else {
        const errorMsg = data.error || "Hyrje e dështuar. Kontrolloni kredencialët tuaj.";
        toast.error(errorMsg);
        console.error("Login failed:", errorMsg);
      }
    } catch (error) {
      console.error("Login error:", error);
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
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-primary">Mirësevini</CardTitle>
              <CardDescription>
                Shkruani të dhënat tuaja për të hyrë në llogari
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="emri@shembull.com" required className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Fjalëkalimi</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      required 
                      className="bg-gray-50 pr-10" 
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
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Duke u kyçur...
                    </>
                  ) : (
                    <>
                      Hyr në llogari
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 text-center text-sm text-gray-500">
              <Link href="/register" className="hover:text-primary transition-colors">
                Nuk keni llogari? <span className="font-semibold text-primary">Regjistrohu këtu</span>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
