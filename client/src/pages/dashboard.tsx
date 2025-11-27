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
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
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
  const [userPaymentStatus, setUserPaymentStatus] = useState("pending");

  // State for profile form
  const [profileData, setProfileData] = useState({
    firstName: "Arben",
    lastName: "Berisha",
    email: "arben.berisha@example.com",
    phone: "+383 44 123 456",
    birthCountry: "Kosovë",
    city: "Prishtinë",
  });

  // State for password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user payment status on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      // In a real app, you'd fetch from API
      // For now, just check localStorage
      const savedStatus = localStorage.getItem("paymentStatus") || "pending";
      setUserPaymentStatus(savedStatus);
    }
  }, []);

  // Mock data
  const user = {
    name: `${profileData.firstName} ${profileData.lastName}`,
    email: profileData.email,
    avatar: "",
    status: "pending_review"
  };

  const applicationSteps = [
    { id: 1, title: "Regjistrimi", status: "completed", date: "27 Nëntor 2025" },
    { id: 2, title: "Pagesa", status: userPaymentStatus === "completed" ? "completed" : "pending", date: userPaymentStatus === "completed" ? "27 Nëntor 2025" : "Pritet" },
    { id: 3, title: "Plotësimi i Formularit", status: userPaymentStatus === "completed" ? "completed" : "pending", date: userPaymentStatus === "completed" ? "27 Nëntor 2025" : "Pritet" },
    { id: 4, title: "Kontrolli i Fotos", status: "pending", date: "Pritet" },
    { id: 5, title: "Dorëzimi Zyrtar", status: "pending", date: "Pritet" },
  ];

  const documents = [
    { id: 1, name: "Konfirmimi i Aplikimit", type: "PDF", size: "1.2 MB", icon: "red" },
    { id: 2, name: "Fotoja e Aplikimit", type: "JPG", size: "2.4 MB", icon: "blue" },
    { id: 3, name: "Deklarata e Saktësisë", type: "PDF", size: "0.8 MB", icon: "purple" },
  ];

  const progress = 60;

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLocation("/");
  };

  const handleSaveProfile = async () => {
    // Validate form
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast.error("Ju lutem plotësoni të gjitha fushat e detyrueshme");
      return;
    }
    
    // Simulate API call
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowPasswordDialog(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success("Fjalëkalimi u ndryshua me sukses!");
  };

  const downloadDocument = (docName: string) => {
    try {
      // Create a simple document content
      const content = `${docName}\n\nAplikoUSA - Shërbimi i Aplikimit për Green Card DV Lottery\n\nData: ${new Date().toLocaleDateString('sq-AL')}\nOra: ${new Date().toLocaleTimeString('sq-AL')}\n\nKy dokumenti është një kopje e sigurt e aplikimit tuaj.\n\nMë shumë informacion: www.aplikousa.com`;
      
      // Create blob
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${docName.toLowerCase().replace(/\s+/g, "-")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success(`${docName} u shkarkua me sukses!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gabim gjatë shkarkimit të dokumentit");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-28 pb-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Card className="border-gray-100 shadow-md sticky top-28">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-20 h-20 mb-4 border-2 border-primary/10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <Badge className="mt-3 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                    Duke u shqyrtuar
                  </Badge>
                </div>
                
                <Separator className="my-4" />
                
                <nav className="space-y-2">
                  <Button 
                    variant={activeTab === "overview" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("overview")}
                    data-testid="tab-overview"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Pasqyra
                  </Button>
                  <Button 
                    variant={activeTab === "application" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("application")}
                    data-testid="tab-application"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Aplikimi Im
                  </Button>
                  <Button 
                    variant={activeTab === "profile" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                    data-testid="tab-profile"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profili
                  </Button>
                  <Button 
                    variant={activeTab === "settings" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                    data-testid="tab-settings"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Cilësimet
                  </Button>
                </nav>
                
                <Separator className="my-4" />
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Dilni
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            
            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Welcome Banner or Payment Required */}
                  {userPaymentStatus === "pending" ? (
                    <Card className="bg-red-50 border-red-200 shadow-lg overflow-hidden relative">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                          <div>
                            <h2 className="text-2xl font-bold mb-2 text-red-900">Pagesa e Kërkuar 💳</h2>
                            <p className="text-red-700 max-w-xl">
                              Për të vazhduar me aplikimin tuaj, ju duhet të përfundoni pagesën. Zgjidhni paketën tuaj më poshtë.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-primary text-white border-none shadow-lg overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                      <CardContent className="p-8 relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Mirësevini në panelin tuaj, {user.name.split(' ')[0]}! 👋</h2>
                        <p className="text-white/80 max-w-xl">
                          Aplikimi juaj është duke u përpunuar nga ekipi ynë. Ne po kontrollojmë çdo detaj për të siguruar që gjithçka është në rregull.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Section - Show if payment pending */}
                  {userPaymentStatus === "pending" && (
                    <Card className="border-2 border-primary/20 shadow-md">
                      <CardHeader className="bg-primary/5 pb-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <CardTitle>Zgjidhni Paketën tuaj</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-4">
                          {/* Individual Package */}
                          <Card className="border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer">
                            <CardContent className="p-6 text-center">
                              <h3 className="font-bold text-lg mb-2">Individual</h3>
                              <p className="text-sm text-gray-600 mb-4">Për një person</p>
                              <div className="text-3xl font-bold text-primary mb-4">$150</div>
                              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-pay-individual">
                                Paguaj Tani
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Couple Package */}
                          <Card className="border-2 border-primary relative">
                            <div className="absolute -top-2 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">POPULAR</div>
                            <CardContent className="p-6 text-center">
                              <h3 className="font-bold text-lg mb-2">Couple</h3>
                              <p className="text-sm text-gray-600 mb-4">Për dy persona</p>
                              <div className="text-3xl font-bold text-primary mb-4">$250</div>
                              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-pay-couple">
                                Paguaj Tani
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Family Package */}
                          <Card className="border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer">
                            <CardContent className="p-6 text-center">
                              <h3 className="font-bold text-lg mb-2">Family</h3>
                              <p className="text-sm text-gray-600 mb-4">Për familje</p>
                              <div className="text-3xl font-bold text-primary mb-4">$350</div>
                              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-pay-family">
                                Paguaj Tani
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Status Cards */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Statusi i Aplikimit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-yellow-500" />
                          <span className="text-2xl font-bold text-gray-900">Në Pritje</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Përditësuar: Sot, 09:41</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Kompletimi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Dokumentet</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-2xl font-bold text-gray-900">Të Ngarkuara</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Fotoja është verifikuar</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ecuria e Aplikimit</CardTitle>
                      <CardDescription>Ndiqni hapat e procesit tuaj në kohë reale</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-2">
                        {applicationSteps.map((step) => (
                          <div key={step.id} className="relative pl-6 pb-1">
                            <div className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center
                              ${step.status === 'completed' ? 'bg-green-500' : 
                                step.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-200'}
                            `}>
                              {step.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                              {step.status === 'in_progress' && <Clock className="w-3 h-3 text-white" />}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <h4 className={`font-semibold ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                                {step.title}
                              </h4>
                              <span className="text-sm text-gray-500">{step.date}</span>
                            </div>
                            
                            {step.status === 'in_progress' && (
                              <p className="text-sm text-yellow-600 mt-1 bg-yellow-50 p-2 rounded-md inline-block">
                                Ekipi ynë po kontrollon foton tuaj për të siguruar që përputhet me standardet e DV Lottery.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* APPLICATION TAB */}
              {activeTab === "application" && (
                <motion.div
                  key="application"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Application Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Përmbledhja e Aplikimit</CardTitle>
                      <CardDescription>Detajet e plota të aplikimit tuaj</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">EMRI PLOTË</p>
                            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">EMAIL</p>
                            <p className="text-lg font-semibold text-gray-900">{profileData.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">TELEFONI</p>
                            <p className="text-lg font-semibold text-gray-900">{profileData.phone}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">SHTETI I LINDJES</p>
                            <p className="text-lg font-semibold text-gray-900">{profileData.birthCountry}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">QYTETI</p>
                            <p className="text-lg font-semibold text-gray-900">{profileData.city}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">PAKETA</p>
                            <p className="text-lg font-semibold text-gray-900">Individuale (20€)</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dokumentet Tuaja</CardTitle>
                      <CardDescription>Shkarkoni kopjet e dokumenteve të aplikimit</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center
                                ${doc.icon === 'red' ? 'bg-red-100 text-red-600' : 
                                  doc.icon === 'blue' ? 'bg-blue-100 text-blue-600' : 
                                  'bg-purple-100 text-purple-600'}
                              `}>
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => downloadDocument(doc.name)}
                              data-testid={`button-download-${doc.id}`}
                            >
                              <Download className="w-5 h-5" />
                            </Button>
                          </div>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Profili Juaj</CardTitle>
                        <CardDescription>Menaxhoni të dhënat e llogarisë tuaj</CardDescription>
                      </div>
                      <Button 
                        onClick={() => setEditingProfile(!editingProfile)}
                        variant={editingProfile ? "outline" : "default"}
                        size="sm"
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
                                <Label htmlFor="firstName">Emri</Label>
                                <Input
                                  id="firstName"
                                  value={profileData.firstName}
                                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                  data-testid="input-first-name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Mbiemri</Label>
                                <Input
                                  id="lastName"
                                  value={profileData.lastName}
                                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                  data-testid="input-last-name"
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={profileData.email}
                                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                  data-testid="input-email"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">Telefoni</Label>
                                <Input
                                  id="phone"
                                  value={profileData.phone}
                                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                  data-testid="input-phone"
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="birthCountry">Shteti i Lindjes</Label>
                                <Input
                                  id="birthCountry"
                                  value={profileData.birthCountry}
                                  onChange={(e) => setProfileData({...profileData, birthCountry: e.target.value})}
                                  data-testid="input-birth-country"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="city">Qyteti</Label>
                                <Input
                                  id="city"
                                  value={profileData.city}
                                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                                  data-testid="input-city"
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <Button 
                                onClick={handleSaveProfile}
                                className="bg-primary hover:bg-primary/90 text-white"
                                data-testid="button-save-profile"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Ruaj Ndryshimet
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setEditingProfile(false)}
                              >
                                Anulo
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">EMRI</p>
                                <p className="text-lg font-semibold text-gray-900">{profileData.firstName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">MBIEMRI</p>
                                <p className="text-lg font-semibold text-gray-900">{profileData.lastName}</p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">EMAIL</p>
                                <p className="text-lg font-semibold text-gray-900">{profileData.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">TELEFONI</p>
                                <p className="text-lg font-semibold text-gray-900">{profileData.phone}</p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">SHTETI I LINDJES</p>
                                <p className="text-lg font-semibold text-gray-900">{profileData.birthCountry}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">QYTETI</p>
                                <p className="text-lg font-semibold text-gray-900">{profileData.city}</p>
                              </div>
                            </div>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Siguria & Fjalëkalimi</CardTitle>
                      <CardDescription>Menaxhoni cilësimet e sigurisë të llogarisë tuaj</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">Fjalëkalimi i Llogarisë</p>
                            <p className="text-sm text-gray-500">Ndryshoni fjalëkalimin tuaj për të mbrojtur llogarinë tuaj</p>
                          </div>
                          <Button 
                            onClick={() => setShowPasswordDialog(true)}
                            variant="outline"
                            data-testid="button-change-password"
                          >
                            Ndryshoni
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">Verifikimi me Dy Faktorë</p>
                            <p className="text-sm text-gray-500">Shtoni një shtresë shtesë sigurie</p>
                          </div>
                          <Button variant="outline" disabled>
                            Shpejt
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">Seansat e Aktive</p>
                            <p className="text-sm text-gray-500">Menaxhoni të gjitha seansat tuaja në pajisje</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Preferencat</CardTitle>
                      <CardDescription>Cilësimet e e-mailit dhe njoftimeve</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">Email përditësimet e statusit</p>
                            <p className="text-sm text-gray-500">Merrni email kur statusi i aplikimit ndryshon</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">Newsletter</p>
                            <p className="text-sm text-gray-500">Merrni përditësime rreth DV Lottery</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ndryshoni Fjalëkalimin</DialogTitle>
            <DialogDescription>
              Për sigurinë e llogarisë tuaj, ju duhet të futni fjalëkalimin aktual dhe atë të ri.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Fjalëkalimi Aktual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Futni fjalëkalimin aktual"
                  data-testid="input-current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Fjalëkalimi i Ri</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Futni fjalëkalimin e ri"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmo Fjalëkalimin</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Përsërit fjalëkalimin e ri"
                data-testid="input-confirm-password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Anulo
            </Button>
            <Button 
              onClick={handleChangePassword}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-confirm-password"
            >
              Ndryshoni Fjalëkalimin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Dilni nga Llogaria?</DialogTitle>
            <DialogDescription>
              A jeni i sigurt se dëshironi të dilni? Duhet t'i futni kredencialet tuaja për të hyrë përsëri.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Anulo
            </Button>
            <Button 
              onClick={confirmLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
              data-testid="button-confirm-logout"
            >
              Po, Dil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
