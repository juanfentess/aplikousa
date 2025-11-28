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
  const [resending, setResending] = useState(false);

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

  const handleResendCode = async () => {
    const finalUserId = storedUserId || urlUserId;
    if (!finalUserId) {
      setError("Nuk mund të gjendet përdoruesi");
      return;
    }

    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: finalUserId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Dërgim i dështuar");
        return;
      }

      toast.success("Kodi u dërgua në email tuaj!");
      setError("");
    } catch (err) {
      setError("Gabim gjatë dërgimit të kodit");
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md shadow-xl dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="text-center space-y-2 dark:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
              {verified ? (
                <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-primary dark:text-blue-400" />
              )}
            </div>
            <CardTitle className="text-2xl dark:text-white">Verifikoni Email</CardTitle>
            <CardDescription className="dark:text-slate-400">
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
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
                  <p className="text-green-800 dark:text-green-400 font-medium">
                    ✓ Email juaj u verifikua me sukses!
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Duke ju dërguar në dashboard tuaj...
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="dark:text-slate-200">Kodi i Verifikimit</Label>
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
                    className="text-center text-2xl tracking-[0.5em] h-14 font-mono dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    disabled={verifying}
                    data-testid="input-verification-code"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="w-full bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-700 text-white h-11"
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

                <div className="space-y-2 text-xs">
                  <p className="text-center text-gray-500 dark:text-slate-400">
                    A nuk keni marrë kodin? Kontrolloni folder-in Spam
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                    data-testid="button-resend-code"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Duke dërguar...
                      </>
                    ) : (
                      "Ridërgo kodin në email"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
