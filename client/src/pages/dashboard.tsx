import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  ChevronRight,
  Eye,
  EyeOff,
  Save,
  X,
  CreditCard,
  Wallet,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [showReviewDataDialog, setShowReviewDataDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [userPaymentStatus, setUserPaymentStatus] = useState("pending");
  const { theme, setTheme } = useTheme();

  // State for profile form
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthCountry: "",
    city: "",
  });

  // State for password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [purchasedPackage, setPurchasedPackage] = useState<string | null>(null);
  const [userApplication, setUserApplication] = useState<any>(null);

  // Load user data on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      // Check if returning from payment success or failure
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        const packageType = localStorage.getItem("selectedPackage") || "individual";
        // Call API to mark payment as complete
        fetch("/api/payment-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, packageType }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setUserPaymentStatus("completed");
              localStorage.setItem("paymentStatus", "completed");
              localStorage.removeItem("selectedPackage");
              setShowPaymentSuccessDialog(true);
              
              // Reload application data after payment
              fetch(`/api/applications/${userId}`)
                .then(res => res.json())
                .then(appData => {
                  if (appData) {
                    setUserApplication(appData);
                  }
                })
                .catch(err => console.error("Error reloading application:", err));
              
              // Clean URL
              window.history.replaceState({}, document.title, "/dashboard");
            }
          })
          .catch(err => console.error("Error updating payment:", err));
      } else if (params.get("payment") === "cancelled") {
        // Show error message for declined/cancelled payment - delay to ensure DOM is ready
        setTimeout(() => {
          toast.error("Pagesa u anulua ose u refuzua. Ju lutem provoni përsëri.", {
            duration: 5000,
          });
        }, 500);
        localStorage.removeItem("selectedPackage");
        // Clean URL
        window.history.replaceState({}, document.title, "/dashboard");
      }

      // Fetch user data from API
      fetch(`/api/auth/user/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.firstName) {
            setProfileData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              birthCountry: data.birthCountry || "",
              city: data.city || "",
            });
            setUserData(data);
            setUserPaymentStatus(data.paymentStatus || "pending");
          }
        })
        .catch(err => console.error("Error loading user data:", err));

      // Fetch transactions with a slight delay to ensure payment is recorded
      setTimeout(() => {
        fetch(`/api/transactions/${userId}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setTransactions(data);
            }
          })
          .catch(err => console.error("Error loading transactions:", err));
      }, 500);

      // Fetch application data
      fetch(`/api/applications/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setUserApplication(data);
          }
        })
        .catch(err => console.error("Error loading application:", err));
    }
  }, []);

  const handlePayment = async (packageType: "individual" | "couple" | "family") => {
    setCheckoutLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      console.log("Payment clicked for:", packageType, "userId:", userId);
      
      if (!userId) {
        toast.error("Përdoruesi nuk u gjet. Ju lutem regjistrohuni përsëri.");
        setCheckoutLoading(false);
        return;
      }

      // Store selected package for later use in payment-success
      localStorage.setItem("selectedPackage", packageType);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          packageType,
        }),
      });

      console.log("Checkout response status:", response.status);
      const data = await response.json();
      console.log("Checkout response data:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "API error");
      }
      
      if (data.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Gabim në hapjen e pagesës");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error?.message || "Gabim gjatë procesit të pagesës");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const userEmail = profileData.email || "user@example.com";
  const user = {
    name: profileData.firstName && profileData.lastName ? `${profileData.firstName} ${profileData.lastName}` : "Përdoruesi",
    email: userEmail,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}&scale=80&backgroundColor=b6e3f5,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    status: "pending_review"
  };

  const getApplicationSteps = () => {
    const mapStatus = (status: string) => {
      if (status === "completed") return "completed";
      if (status === "in_progress") return "in_progress";
      return "pending";
    };

    return [
      { 
        id: 1, 
        title: "Regjistrimi", 
        status: mapStatus(userApplication?.registrationStatus || "completed"),
        date: userApplication?.registrationStatus === "completed" ? new Date(userApplication?.createdAt).toLocaleDateString("sq-AL") : ""
      },
      { 
        id: 2, 
        title: "Pagesa", 
        status: mapStatus(userApplication?.paymentStatus || "pending"),
        date: userApplication?.paymentStatus === "completed" ? new Date().toLocaleDateString("sq-AL") : ""
      },
      { 
        id: 3, 
        title: "Plotësimi i Formularit", 
        status: mapStatus(userApplication?.formStatus || "pending"),
        date: ""
      },
      { 
        id: 4, 
        title: "Kontrolli i Fotos", 
        status: mapStatus(userApplication?.photoStatus || "pending"),
        date: ""
      },
      { 
        id: 5, 
        title: "Dorëzimi Zyrtar", 
        status: mapStatus(userApplication?.submissionStatus || "pending"),
        date: ""
      },
    ];
  };

  const applicationSteps = getApplicationSteps();
  const completedSteps = applicationSteps.filter(step => step.status === "completed").length;
  const progress = (completedSteps / applicationSteps.length) * 100;

  const getApplicationStatus = () => {
    if (applicationSteps.every(step => step.status === "completed")) return "I Përfunduar";
    if (applicationSteps.some(step => step.status === "in_progress")) return "Në Përpunim";
    return "Në Pritje";
  };

  const userId = localStorage.getItem("userId");
  const documents = [
    { 
      id: 1, 
      name: "Konfirmimi i Aplikimit", 
      type: "PDF", 
      icon: "red",
      url: `/api/documents/${userId}/confirmation`
    },
    { 
      id: 3, 
      name: "Deklarata e Saktësisë", 
      type: "PDF", 
      icon: "purple",
      url: `/api/documents/${userId}/declaration`
    },
  ];

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const refreshInterval = setInterval(() => {
      fetch(`/api/applications/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setUserApplication(data);
          }
        })
        .catch(err => console.error("Error refreshing application:", err));
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, []);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("paymentStatus");
    localStorage.removeItem("selectedPackage");
    await new Promise(resolve => setTimeout(resolve, 300));
    setLocation("/");
  };

  const handleSaveProfile = async () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast.error("Ju lutem plotësoni të gjitha fushat e detyrueshme");
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEditingProfile(false);
    toast.success("Profili u përditësua me sukses!");
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Ju lutem plotësoni të gjitha fushat");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Fjalëkalimet e reja nuk përputhen");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Fjalëkalimi duhet të ketë të paktën 6 karaktere");
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowPasswordDialog(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success("Fjalëkalimi u ndryshua me sukses!");
  };

  const handleReviewData = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowReviewDataDialog(true);
  };

  const handleConfirmData = async () => {
    toast.success("Të dhënat u konfirmuan me sukses!");
    setShowReviewDataDialog(false);
    setSelectedTransaction(null);
  };

  const downloadDocument = (docUrl: string, docName: string) => {
    try {
      window.open(docUrl, '_blank');
      toast.success(`${docName} po hapet...`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gabim gjatë hapjes të dokumentit");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] font-sans transition-colors duration-300">
      {/* Header with Theme Toggle */}
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-blue-900/30 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">AplikoUSA Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-blue-900/30"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 pb-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-900/30 bg-gradient-to-b from-primary/5 to-transparent dark:from-blue-950/60 dark:to-blue-950/20 dark:border dark:border-blue-900/30 sticky top-32">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="w-24 h-24 mb-4 border-3 border-primary/20 dark:border-blue-500/40 shadow-lg">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-blue-900/40 dark:to-cyan-900/40 text-primary dark:text-blue-400 text-xl font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <h3 className="font-bold text-lg dark:text-blue-100">{user.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-blue-300/60 truncate">{user.email}</p>
                    <Badge className="mt-3 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-900/60">
                      Duke u shqyrtuar
                    </Badge>
                  </div>
                  
                  <Separator className="my-6 dark:bg-blue-900/40" />
                  
                  <nav className="space-y-2">
                    {[
                      { id: "overview", label: "Pasqyra", icon: LayoutDashboard },
                      { id: "application", label: "Aplikimi Im", icon: FileText },
                      { id: "profile", label: "Profili", icon: User },
                      { id: "settings", label: "Cilësimet", icon: Settings },
                      { id: "transactions", label: "Transaksionet", icon: Wallet },
                    ].map(({ id, label, icon: Icon }) => (
                      <motion.div key={id} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Button 
                          variant={activeTab === id ? "default" : "ghost"} 
                          className={`w-full justify-start rounded-lg transition-all ${
                            activeTab === id 
                              ? "bg-gradient-to-r from-primary to-secondary dark:from-blue-600 dark:to-cyan-600 text-white shadow-lg dark:shadow-blue-900/50" 
                              : "dark:text-blue-200 dark:hover:bg-blue-900/30"
                          }`}
                          onClick={() => setActiveTab(id)}
                          data-testid={`tab-${id}`}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {label}
                        </Button>
                      </motion.div>
                    ))}
                  </nav>
                  
                  <Separator className="my-6 dark:bg-blue-900/40" />
                  
                  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      onClick={handleLogout}
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Dilni
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            
            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Welcome Banner */}
                  {userPaymentStatus === "pending" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-red-900/30 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 dark:border dark:border-red-900/40 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100/20 dark:bg-red-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                        <CardContent className="p-8 relative z-10">
                          <div className="flex items-start gap-4">
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                            <div>
                              <h2 className="text-2xl font-bold mb-2 text-red-900 dark:text-red-300">Pagesa e Kërkuar 💳</h2>
                              <p className="text-red-800 dark:text-red-200/80 max-w-xl font-medium">
                                Për të vazhduar me aplikimin tuaj, ju duhet të përfundoni pagesën. Zgjidhni paketën tuaj më poshtë.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <Card className="border-0 shadow-2xl dark:shadow-3xl dark:shadow-blue-900/50 bg-gradient-to-br from-primary via-primary/80 to-secondary dark:from-blue-700 dark:via-blue-600 dark:to-cyan-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 dark:bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                        <CardContent className="p-10 relative z-10">
                          <h2 className="text-3xl font-bold mb-3">Mirësevini në panelin tuaj, {user.name.split(' ')[0]}! 👋</h2>
                          <p className="text-white/90 dark:text-blue-100/80 max-w-2xl text-lg">
                            Aplikimi juaj është duke u përpunuar nga ekipi ynë. Ne po kontrollojmë çdo detaj për të siguruar që gjithçka është në rregull.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Status Cards Grid */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                          <Card className="border-0 shadow-lg dark:shadow-xl dark:shadow-green-900/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 dark:border dark:border-green-900/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/20 dark:bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
                            <CardHeader className="pb-3 relative z-10">
                              <CardTitle className="text-sm font-medium text-gray-600 dark:text-green-300/70">Statusi i Aplikimit</CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                              <div className="flex items-center gap-3">
                                {getApplicationStatus() === "I Përfunduar" ? (
                                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                ) : getApplicationStatus() === "Në Përpunim" ? (
                                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                ) : (
                                  <AlertCircle className="h-6 w-6 text-gray-600 dark:text-slate-400" />
                                )}
                                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary dark:from-green-600 dark:to-emerald-500 bg-clip-text text-transparent">{getApplicationStatus()}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                          <Card className="border-0 shadow-lg dark:shadow-xl dark:shadow-blue-900/30 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 dark:border dark:border-blue-900/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/20 dark:bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
                            <CardHeader className="pb-3 relative z-10">
                              <CardTitle className="text-sm font-medium text-gray-600 dark:text-blue-300/70">Kompletimi</CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary dark:from-blue-600 dark:to-cyan-500 bg-clip-text text-transparent">{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                          <Card className="border-0 shadow-lg dark:shadow-xl dark:shadow-purple-900/30 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 dark:border dark:border-purple-900/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/20 dark:bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
                            <CardHeader className="pb-3 relative z-10">
                              <CardTitle className="text-sm font-medium text-gray-600 dark:text-purple-300/70">Dokumentet</CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                <span className="text-lg font-bold text-gray-900 dark:text-blue-100">Të Ngarkuara</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-blue-300/60 mt-2">Fotoja është verifikuar</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>

                      {/* Timeline */}
                      <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-900/40 dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-slate-950">
                        <CardHeader>
                          <CardTitle className="text-xl dark:text-blue-100">Ecuria e Aplikimit</CardTitle>
                          <CardDescription className="dark:text-blue-300/60">Ndiqni hapat e procesit tuaj në kohë reale</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6 relative pl-4 border-l-2 border-gradient-to-b from-primary to-secondary dark:from-blue-500 dark:to-cyan-500 ml-2">
                            {applicationSteps.map((step, idx) => (
                              <motion.div 
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative pl-6 pb-1"
                              >
                                <div className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full border-4 border-white dark:border-[#0f172a] flex items-center justify-center transition-all
                                  ${step.status === 'completed' ? 'bg-green-500 shadow-lg dark:shadow-green-900/50' : 
                                    step.status === 'in_progress' ? 'bg-yellow-500 shadow-lg dark:shadow-yellow-900/50' : 'bg-gray-300 dark:bg-blue-800/60'}
                                `}>
                                  {step.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                                  {step.status === 'in_progress' && <Clock className="w-3 h-3 text-white" />}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                  <h4 className={`font-semibold text-lg transition-colors ${step.status === 'pending' ? 'text-gray-400 dark:text-blue-400/40' : 'text-gray-900 dark:text-blue-100'}`}>
                                    {step.title}
                                  </h4>
                                  <span className="text-sm text-gray-500 dark:text-blue-300/60">{step.date}</span>
                                </div>
                                
                                {step.status === 'in_progress' && (
                                  <p className="text-sm text-yellow-700 dark:text-yellow-300/90 mt-2 bg-yellow-50 dark:bg-yellow-900/30 dark:border dark:border-yellow-800/50 p-3 rounded-lg inline-block">
                                    Ekipi ynë po kontrollon foton tuaj për të siguruar që përputhet me standardet e DV Lottery.
                                  </p>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Payment Section */}
                  {userPaymentStatus === "pending" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-900/40 dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-slate-950">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-blue-900/30 dark:to-cyan-900/30 dark:border-b dark:border-blue-900/40 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 dark:bg-blue-600/30 rounded-lg">
                              <CreditCard className="h-5 w-5 text-primary dark:text-blue-400" />
                            </div>
                            <CardTitle className="dark:text-blue-100">Zgjidhni Paketën tuaj</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-8">
                          <div className="grid md:grid-cols-3 gap-6">
                            {[
                              { name: "Individual", desc: "Për një person", price: "20€", type: "individual" },
                              { name: "Çifti (Partnerë)", desc: "Për dy persona", price: "35€", type: "couple", popular: true },
                              { name: "Familjare", desc: "Për prindërit dhe fëmijët", price: "50€", type: "family" },
                            ].map((pkg) => (
                              <motion.div
                                key={pkg.type}
                                whileHover={{ y: -8 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card className={`border-2 rounded-xl transition-all relative overflow-hidden
                                  ${pkg.popular 
                                    ? 'border-primary dark:border-cyan-500 shadow-2xl dark:shadow-lg dark:shadow-cyan-900/40 scale-105 md:scale-100 dark:bg-gradient-to-br dark:from-cyan-950/40 dark:to-blue-950/40' 
                                    : 'border-gray-200 dark:border-blue-900/40 hover:border-primary dark:hover:border-blue-500 dark:bg-gradient-to-br dark:from-blue-950/20 dark:to-slate-950'
                                  }`}
                                >
                                  {pkg.popular && (
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary dark:from-cyan-600 dark:to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg dark:shadow-cyan-900/50">
                                      MË I KËRKUAR
                                    </div>
                                  )}
                                  <CardContent className="p-8 text-center">
                                    <h3 className="font-bold text-xl mb-2 dark:text-blue-100">{pkg.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-blue-300/70 mb-6">{pkg.desc}</p>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-8">{pkg.price}</div>
                                    <Button 
                                      className="w-full bg-gradient-to-r from-primary to-secondary dark:from-blue-600 dark:to-cyan-600 hover:shadow-lg dark:hover:shadow-blue-900/50 text-white rounded-lg h-12 text-base font-semibold"
                                      onClick={() => handlePayment(pkg.type as "individual" | "couple" | "family")}
                                      disabled={checkoutLoading}
                                      data-testid={`button-pay-${pkg.type}`}
                                    >
                                      {checkoutLoading ? "Duke u përpunuar..." : "Paguaj Tani"}
                                    </Button>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* APPLICATION TAB */}
              {activeTab === "application" && (
                <motion.div
                  key="application"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-900/40 dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-slate-950">
                    <CardHeader>
                      <CardTitle className="dark:text-blue-100">Përmbledhja e Aplikimit</CardTitle>
                      <CardDescription className="dark:text-blue-300/60">Detajet e plota të aplikimit tuaj</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-8">
                        {[
                          { label: "EMRI PLOTË", value: `${profileData.firstName} ${profileData.lastName}` },
                          { label: "EMAIL", value: profileData.email },
                          { label: "TELEFONI", value: profileData.phone },
                          { label: "SHTETI I LINDJES", value: profileData.birthCountry },
                          { label: "QYTETI", value: profileData.city },
                          { label: "PAKETA", value: "Individuale (20€)" },
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-blue-900/20 dark:border dark:border-blue-900/40">
                              <p className="text-xs text-gray-500 dark:text-blue-400/70 font-bold mb-1">{item.label}</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-blue-100">{item.value}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-900/40 dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-slate-950">
                    <CardHeader>
                      <CardTitle className="dark:text-blue-100">Dokumentet Tuaja</CardTitle>
                      <CardDescription className="dark:text-blue-300/60">Shkarkoni kopjet e dokumenteve të aplikimit</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <motion.div
                            key={doc.id}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-blue-900/40 rounded-lg hover:bg-gray-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center
                                ${doc.icon === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                                  doc.icon === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 
                                  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}
                              `}>
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-blue-100">{doc.name}</p>
                                <p className="text-xs text-gray-500 dark:text-blue-300/60">{doc.type}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => downloadDocument(doc.url, doc.name)}
                              className="hover:bg-gray-100 dark:hover:bg-blue-900/30 rounded-lg"
                              data-testid={`button-download-${doc.id}`}
                            >
                              <Download className="w-5 h-5 text-primary dark:text-blue-400" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-900/40 dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-slate-950">
                    <CardHeader className="flex flex-row items-center justify-between pb-6 dark:border-b dark:border-blue-900/40">
                      <div>
                        <CardTitle className="dark:text-blue-100">Profili Juaj</CardTitle>
                        <CardDescription className="dark:text-blue-300/60">Menaxhoni të dhënat e llogarisë tuaj</CardDescription>
                      </div>
                      <Button 
                        onClick={() => setEditingProfile(!editingProfile)}
                        className={`rounded-lg transition-all ${editingProfile ? 'bg-gray-200 dark:bg-blue-900/40 dark:border dark:border-blue-900/60 text-gray-900 dark:text-blue-100' : 'bg-gradient-to-r from-primary to-secondary dark:from-blue-600 dark:to-cyan-600 text-white'}`}
                        data-testid="button-edit-profile"
                      >
                        {editingProfile ? "Anulo" : "Redakto"}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {editingProfile ? (
                          <>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="firstName" className="dark:text-blue-200">Emri</Label>
                                <Input
                                  id="firstName"
                                  value={profileData.firstName}
                                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                  className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
                                  data-testid="input-first-name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName" className="dark:text-blue-200">Mbiemri</Label>
                                <Input
                                  id="lastName"
                                  value={profileData.lastName}
                                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                  className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
                                  data-testid="input-last-name"
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="email" className="dark:text-blue-200">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={profileData.email}
                                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                  className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
                                  data-testid="input-email"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone" className="dark:text-blue-200">Telefoni</Label>
                                <Input
                                  id="phone"
                                  value={profileData.phone}
                                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                  className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
                                  data-testid="input-phone"
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="birthCountry" className="dark:text-blue-200">Shteti i Lindjes</Label>
                                <Input
                                  id="birthCountry"
                                  value={profileData.birthCountry}
                                  onChange={(e) => setProfileData({...profileData, birthCountry: e.target.value})}
                                  className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
                                  data-testid="input-birth-country"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="city" className="dark:text-blue-200">Qyteti</Label>
                                <Input
                                  id="city"
                                  value={profileData.city}
                                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                                  className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
                                  data-testid="input-city"
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <Button 
                                onClick={handleSaveProfile}
                                className="bg-gradient-to-r from-primary to-secondary dark:from-blue-600 dark:to-cyan-600 hover:shadow-lg dark:hover:shadow-blue-900/50 text-white rounded-lg"
                                data-testid="button-save-profile"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Ruaj Ndryshimet
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setEditingProfile(false)}
                                className="rounded-lg dark:border-blue-900/60 dark:text-blue-200 dark:hover:bg-blue-900/20"
                              >
                                Anulo
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-6">
                            {[
                              { label: "EMRI", value: profileData.firstName },
                              { label: "MBIEMRI", value: profileData.lastName },
                              { label: "EMAIL", value: profileData.email },
                              { label: "TELEFONI", value: profileData.phone },
                              { label: "SHTETI I LINDJES", value: profileData.birthCountry },
                              { label: "QYTETI", value: profileData.city },
                            ].map((item, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-4 rounded-lg bg-gray-50 dark:bg-blue-900/20 dark:border dark:border-blue-900/40"
                              >
                                <p className="text-xs text-gray-500 dark:text-blue-400/70 font-bold mb-1">{item.label}</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-blue-100">{item.value}</p>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-900/40 dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-slate-950">
                    <CardHeader>
                      <CardTitle className="dark:text-blue-100">Siguria & Fjalëkalimi</CardTitle>
                      <CardDescription className="dark:text-blue-300/60">Ndryshoni fjalëkalimin tuaj rregullisht për siguri maksimale</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowPasswordDialog(true)}
                        className="bg-gradient-to-r from-primary to-secondary dark:from-blue-600 dark:to-cyan-600 hover:shadow-lg dark:hover:shadow-blue-900/50 text-white rounded-lg"
                        data-testid="button-change-password"
                      >
                        Ndrysho Fjalëkalimin
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* TRANSACTIONS TAB */}
              {activeTab === "transactions" && (
                <motion.div
                  key="transactions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-900/40 dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-slate-950">
                    <CardHeader>
                      <CardTitle className="dark:text-blue-100">Historiku i Transaksioneve</CardTitle>
                      <CardDescription className="dark:text-blue-300/60">Shikoni të gjitha pagesën tuaja</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {transactions.length > 0 ? (
                        <div className="space-y-3">
                          {transactions.map((trans) => (
                            <motion.div
                              key={trans.id}
                              whileHover={{ x: 4 }}
                              className="flex items-center justify-between p-4 border border-gray-200 dark:border-blue-900/40 rounded-lg hover:bg-gray-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-blue-100">{trans.description}</p>
                                <p className="text-sm text-gray-500 dark:text-blue-300/60">{new Date(trans.createdAt).toLocaleDateString('sq-AL')}</p>
                              </div>
                              <p className="font-bold text-lg bg-gradient-to-r from-primary to-secondary dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">{trans.amount}€</p>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 dark:text-blue-300/60 py-8">Nuk ka transaksione për të shfaqur</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="dark:bg-blue-950 dark:border-blue-900/40">
          <DialogHeader>
            <DialogTitle className="dark:text-blue-100">Jeni i sigurt?</DialogTitle>
            <DialogDescription className="dark:text-blue-300/60">
              A dëshironi të dilni nga llogaria juaj?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)} className="dark:border-blue-900/60 dark:text-blue-200 dark:hover:bg-blue-900/20">Anulo</Button>
            <Button onClick={confirmLogout} className="bg-red-500 hover:bg-red-600 text-white">Dil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="dark:bg-blue-950 dark:border-blue-900/40">
          <DialogHeader>
            <DialogTitle className="dark:text-blue-100">Ndrysho Fjalëkalimin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="dark:text-blue-200">Fjalëkalimi Aktual</Label>
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="dark:text-blue-200">Fjalëkalimi i Ri</Label>
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="dark:text-blue-200">Konfirmo Fjalëkalimin</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="dark:bg-blue-900/30 dark:border-blue-900/60 dark:text-blue-100 rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="dark:border-blue-900/60 dark:text-blue-200 dark:hover:bg-blue-900/20">Anulo</Button>
            <Button onClick={handleChangePassword} className="bg-gradient-to-r from-primary to-secondary dark:from-blue-600 dark:to-cyan-600 text-white">Ruaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
