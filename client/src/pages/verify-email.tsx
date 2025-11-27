import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(window.location.search);
  const urlUserId = searchParams.get("userId");
  const prefilledCode = searchParams.get("code");
  const storedUserId = localStorage.getItem("userId");

  useEffect(() => {
    // Use stored userId from localStorage (most reliable)
    const finalUserId = storedUserId || urlUserId;
    
    if (!finalUserId) {
      setLocation("/");
    }
    // Pre-fill code if provided in URL
    if (prefilledCode) {
      setCode(prefilledCode);
    }
  }, [storedUserId, urlUserId, setLocation, prefilledCode]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("Kodi duhet të ketë 6 shifra");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const finalUserId = storedUserId || urlUserId;
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: finalUserId, code }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Verification failed");
        return;
      }

      const userData = await response.json();
      
      // Store user data in localStorage so dashboard recognizes them as logged in
      localStorage.setItem("userId", userData.id);
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("paymentStatus", userData.paymentStatus || "pending");

      setVerified(true);
      toast.success("Email verifikuar me sukses!");
      setTimeout(() => setLocation("/dashboard"), 2000);
    } catch (err) {
      setError("Gabim gjatë verifikimit");
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {verified ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">Verifikoni Email</CardTitle>
            <CardDescription>
              Nënë kodin 6 shifror që e dërguam në email tuaj
            </CardDescription>
          </CardHeader>

          <CardContent>
            {verified ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    ✓ Email juaj u verifikua me sukses!
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Duke ju dërguar në dashboard tuaj...
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kodi i Verifikimit</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setCode(val);
                      setError("");
                    }}
                    className="text-center text-2xl tracking-[0.5em] h-14 font-mono"
                    disabled={verifying}
                    data-testid="input-verification-code"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-800 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-11"
                  data-testid="button-verify"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Duke verifikuar...
                    </>
                  ) : (
                    "Verifikoni"
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  A nuk keni marrë kodin? Kontrolloni folder-in Spam
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
