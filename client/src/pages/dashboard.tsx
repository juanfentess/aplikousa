import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const user = {
    name: "Arben Berisha",
    email: "arben.berisha@example.com",
    avatar: "",
    status: "pending_review" // pending_review, submitted, winner_selected, not_selected
  };

  const applicationSteps = [
    { id: 1, title: "Regjistrimi", status: "completed", date: "27 Nëntor 2025" },
    { id: 2, title: "Pagesa", status: "completed", date: "27 Nëntor 2025" },
    { id: 3, title: "Plotësimi i Formularit", status: "completed", date: "27 Nëntor 2025" },
    { id: 4, title: "Kontrolli i Fotos", status: "in_progress", date: "Në proces" },
    { id: 5, title: "Dorëzimi Zyrtar", status: "pending", date: "Pritet" },
  ];

  const progress = 60;

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
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">AB</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
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
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Pasqyra
                  </Button>
                  <Button 
                    variant={activeTab === "application" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("application")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Aplikimi Im
                  </Button>
                  <Button 
                    variant={activeTab === "profile" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profili
                  </Button>
                  <Button 
                    variant={activeTab === "settings" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Cilësimet
                  </Button>
                </nav>
                
                <Separator className="my-4" />
                
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Dilni
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-primary text-white border-none shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <CardContent className="p-8 relative z-10">
                  <h2 className="text-2xl font-bold mb-2">Mirësevini në panelin tuaj, {user.name.split(' ')[0]}! 👋</h2>
                  <p className="text-white/80 max-w-xl">
                    Aplikimi juaj është duke u përpunuar nga ekipi ynë. Ne po kontrollojmë çdo detaj për të siguruar që gjithçka është në rregull.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

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

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Dokumentet Tuaja</CardTitle>
                <CardDescription>Shkarkoni kopjet e dokumenteve të aplikimit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Konfirmimi i Aplikimit</p>
                        <p className="text-xs text-gray-500">PDF • 1.2 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Fotoja e Aplikimit</p>
                        <p className="text-xs text-gray-500">JPG • 2.4 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
