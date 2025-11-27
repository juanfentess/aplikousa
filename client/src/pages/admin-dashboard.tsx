import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Send,
  Loader2,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  PenTool,
  Eye,
  Eye as EyeIcon,
  BarChart3,
  Filter,
  Download,
  History,
  CreditCard,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [templates, setTemplates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showClientDetailsDialog, setShowClientDetailsDialog] = useState(false);
  const [showUpdateStepsDialog, setShowUpdateStepsDialog] = useState(false);
  const [selectedClientDetails, setSelectedClientDetails] = useState<any>(null);
  const [selectedApplicationForSteps, setSelectedApplicationForSteps] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [applicationStepsData, setApplicationStepsData] = useState({
    registrationStatus: "completed",
    paymentStatus: "completed",
    formStatus: "pending",
    photoStatus: "pending",
    submissionStatus: "pending",
  });
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlContent: "",
  });
  const [clientFormData, setClientFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthCountry: "",
    city: "",
    paymentStatus: "",
    package: "",
  });
  const [sendEmailData, setSendEmailData] = useState({
    recipientEmail: "",
    templateId: "",
    emailMode: "select", // "select" or "manual"
    sendToAll: false,
  });
  const [customEmailData, setCustomEmailData] = useState({
    recipientEmail: "",
    subject: "",
    htmlContent: "",
    emailMode: "select", // "select" or "manual"
    sendToAll: false,
  });

  // Analytics, Logs, Transactions
  const [analytics, setAnalytics] = useState<any>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [adminSettings, setAdminSettings] = useState<any>(null);

  // Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [filterPackageType, setFilterPackageType] = useState("all");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [settingsForm, setSettingsForm] = useState({
    stripeBillingName: "",
    stripeProductDescription: "",
    companyName: "",
    companyPhone: "",
    companyEmail: "",
    supportUrl: "",
    privacyPolicyUrl: "",
    customLogoUrl: "",
  });

  useEffect(() => {
    const adminId = localStorage.getItem("adminId") || localStorage.getItem("admin");
    if (!adminId) {
      setLocation("/admin/login");
      return;
    }
    loadTemplates();
    loadApplications();
    loadClients();
    loadAnalytics();
    loadTransactions();
    loadActivityLogs();
    loadEmailLogs();
    loadAdminSettings();
  }, [setLocation]);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/admin/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gabim në ngarkim të templateve");
    }
  };

  const loadApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gabim në ngarkim të aplikimeve");
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch("/api/admin/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gabim në ngarkim të klientëve");
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/admin/transactions");
      if (response.ok) {
        const data = await response.json();
        setAllTransactions(data);
      }
    } catch (err) {
      console.error("Transactions error:", err);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const response = await fetch("/api/admin/logs/activity");
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (err) {
      console.error("Activity logs error:", err);
    }
  };

  const loadEmailLogs = async () => {
    try {
      const response = await fetch("/api/admin/logs/email");
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data);
      }
    } catch (err) {
      console.error("Email logs error:", err);
    }
  };

  const loadAdminSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setAdminSettings(data);
        setSettingsForm({
          stripeBillingName: data.stripeBillingName || "",
          stripeProductDescription: data.stripeProductDescription || "",
          companyName: data.companyName || "",
          companyPhone: data.companyPhone || "",
          companyEmail: data.companyEmail || "",
          supportUrl: data.supportUrl || "",
          privacyPolicyUrl: data.privacyPolicyUrl || "",
          customLogoUrl: data.customLogoUrl || "",
        });
      }
    } catch (err) {
      console.error("Settings error:", err);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (response.ok) {
        toast.success("⚙️ Rregullimet u ruajtën me sukses!");
        loadAdminSettings();
      } else {
        toast.error("❌ Gabim gjatë ruajtjes");
      }
    } catch (err) {
      toast.error("❌ Gabim gjatë ruajtjes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.subject || !formData.htmlContent) {
      toast.error("Plotësoni të gjitha fushat");
      return;
    }

    setLoading(true);
    try {
      const url = editingTemplate
        ? `/api/admin/templates/${editingTemplate.id}`
        : "/api/admin/templates";

      const method = editingTemplate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingTemplate ? "Template përditësuar" : "Template krijuar");
        setShowTemplateDialog(false);
        setFormData({ name: "", subject: "", htmlContent: "" });
        setEditingTemplate(null);
        loadTemplates();
      }
    } catch (err) {
      toast.error("Gabim gjatë ruajtjes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("A jeni i sigurt?")) return;

    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Template fshirë");
        loadTemplates();
      }
    } catch (err) {
      toast.error("Gabim gjatë fshirjes");
      console.error(err);
    }
  };

  const handleSendEmail = async () => {
    if (!sendEmailData.templateId) {
      toast.error("Zgjedhni templatein");
      return;
    }

    if (!sendEmailData.sendToAll && !sendEmailData.recipientEmail) {
      toast.error("Zgjedhni klientin ose zgjidh të gjithë");
      return;
    }

    setLoading(true);
    try {
      let toEmails: string[] = [];
      
      if (sendEmailData.sendToAll) {
        toEmails = clients.map(c => c.email);
      } else {
        toEmails = [sendEmailData.recipientEmail];
      }

      console.log("Sending email to:", toEmails);

      for (const email of toEmails) {
        const response = await fetch("/api/admin/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toEmail: email,
            templateId: sendEmailData.templateId,
            recipientName: "Klient",
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error(`Failed to send email to ${email}:`, data);
        }
      }

      toast.success(`✅ Email dërguar me sukses për ${toEmails.length} klient(ë)!`, { duration: 3000 });
      setSendEmailData({ recipientEmail: "", templateId: "", emailMode: "select", sendToAll: false });
      setTimeout(() => setActiveTab("dashboard"), 1500);
    } catch (err) {
      toast.error("❌ Gabim gjatë dërgimit të emailit", { duration: 3000 });
      console.error("Send email error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplicationSteps = async () => {
    if (!selectedApplicationForSteps) {
      toast.error("Nuk ka aplikim të zgjedhur");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/applications/${selectedApplicationForSteps.id}/update-steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationStepsData),
      });

      if (response.ok) {
        toast.success("✅ Hapat e aplikimit përditësohen me sukses!", { duration: 3000 });
        setShowUpdateStepsDialog(false);
        setSelectedApplicationForSteps(null);
        loadApplications();
      } else {
        const data = await response.json();
        toast.error("❌ " + (data.error || "Gabim në përditësim"), { duration: 3000 });
      }
    } catch (err) {
      toast.error("❌ Gabim gjatë përditësimit", { duration: 3000 });
      console.error("Update steps error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!customEmailData.subject || !customEmailData.htmlContent) {
      toast.error("Plotësoni subjektin dhe përmbajtjen");
      return;
    }

    if (!customEmailData.sendToAll && !customEmailData.recipientEmail) {
      toast.error("Zgjedhni klientin ose zgjidh të gjithë");
      return;
    }

    setLoading(true);
    try {
      let toEmails: string[] = [];
      
      if (customEmailData.sendToAll) {
        toEmails = clients.map(c => c.email);
      } else {
        toEmails = [customEmailData.recipientEmail];
      }

      console.log("Sending custom email to:", toEmails);

      for (const email of toEmails) {
        const response = await fetch("/api/admin/send-custom-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toEmail: email,
            subject: customEmailData.subject,
            htmlContent: customEmailData.htmlContent,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error(`Failed to send custom email to ${email}:`, data);
        }
      }

      toast.success(`✅ Email dërguar me sukses për ${toEmails.length} klient(ë)!`, { duration: 3000 });
      setCustomEmailData({ recipientEmail: "", subject: "", htmlContent: "", emailMode: "select", sendToAll: false });
      setTimeout(() => setActiveTab("dashboard"), 1500);
    } catch (err) {
      toast.error("❌ Gabim gjatë dërgimit të emailit", { duration: 3000 });
      console.error("Send custom email error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/clients/${editingClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientFormData),
      });

      if (response.ok) {
        toast.success("Klienti përditësuar me sukses");
        setShowClientDialog(false);
        loadClients();
      }
    } catch (err) {
      toast.error("Gabim gjatë përditësimit");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("A jeni i sigurt se doni të fshirot këtë klient?")) return;
    try {
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Klienti fshirë me sukses");
        loadClients();
      }
    } catch (err) {
      toast.error("Gabim gjatë fshirjes");
      console.error(err);
    }
  };

  const handleLoginAsClient = async (clientId: string) => {
    try {
      const response = await fetch("/api/admin/login-as-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userId", clientId);
        localStorage.removeItem("adminId");
        toast.success("Kyqe si klient me sukses!");
        setTimeout(() => setLocation("/dashboard"), 500);
      } else {
        toast.error("Gabim gjatë kyqjes si klient");
      }
    } catch (err) {
      toast.error("Gabim gjatë kyqjes si klient");
      console.error(err);
    }
  };

  const handleSendEmailToClient = async (clientEmail: string, clientName: string) => {
    setSendEmailData({ recipientEmail: clientEmail, templateId: "" });
    setActiveTab("send-email");
    toast.info(`Dërgim emaili për ${clientName}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    setLocation("/admin/login");
  };

  // Filtered clients based on search and filters
  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchQuery || 
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPayment = filterPaymentStatus === "all" || client.paymentStatus === filterPaymentStatus;
    const matchesPackage = filterPackageType === "all" || client.package === filterPackageType;
    
    return matchesSearch && matchesPayment && matchesPackage;
  });

  const stats = [
    { label: "Gjithsej Klientë", value: analytics?.totalClients || 0, icon: Users, color: "bg-blue-100" },
    { label: "Pagesa të Përfunduara", value: analytics?.paidClients || 0, icon: CheckCircle, color: "bg-green-100" },
    { label: "Në Pritje Pagese", value: analytics?.pendingClients || 0, icon: Clock, color: "bg-yellow-100" },
    { label: "Conversion Rate", value: (analytics?.conversionRate || "0") + "%", icon: TrendingUp, color: "bg-purple-100" },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "clients", label: "Klientët", icon: Users },
    { id: "applications", label: "Aplikime", icon: FileText },
    { id: "transactions", label: "Transaksionet", icon: CreditCard },
    { id: "logs", label: "Regjistrat", icon: History },
    { id: "templates", label: "Email Templates", icon: Mail },
    { id: "send-email", label: "Dërgo Email", icon: Send },
    { id: "custom-email", label: "Email Custom", icon: PenTool },
    { id: "settings", label: "Rregullimet", icon: Settings },
  ];

  const handleBulkSelect = (clientId: string) => {
    setSelectedClientIds(prev => 
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const handleBulkSelectAll = () => {
    setSelectedClientIds(selectedClientIds.length === filteredClients.length ? [] : filteredClients.map(c => c.id));
  };

  const handleBulkUpdatePayment = async (status: "pending" | "completed") => {
    if (selectedClientIds.length === 0) {
      toast.error("Zgjedhni të paktën një klient");
      return;
    }

    setLoading(true);
    try {
      for (const clientId of selectedClientIds) {
        await fetch(`/api/admin/clients/${clientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: status }),
        });
      }
      toast.success(`✅ Përditësimi i ${selectedClientIds.length} klientit(ëve) me sukses!`);
      setSelectedClientIds([]);
      loadClients();
    } catch (err) {
      toast.error("❌ Gabim gjatë përditësimit");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClientIds.length === 0) {
      toast.error("Zgjedhni të paktën një klient");
      return;
    }

    if (!confirm(`A jeni i sigurt se doni të fshini ${selectedClientIds.length} klient(ë)?`)) return;

    setLoading(true);
    try {
      for (const clientId of selectedClientIds) {
        await fetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
      }
      toast.success(`✅ ${selectedClientIds.length} klient(ë) fshirë me sukses!`);
      setSelectedClientIds([]);
      loadClients();
    } catch (err) {
      toast.error("❌ Gabim gjatë fshirjes");
    } finally {
      setLoading(false);
    }
  };

  const downloadTransactionReport = () => {
    const csv = [
      ["Email", "Lloji i Paketës", "Shuma", "Status", "Data"].join(","),
      ...allTransactions.map(t => [
        t.userId,
        t.packageType,
        t.amount,
        t.status,
        new Date(t.createdAt).toLocaleDateString("sq-AL")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transaksionet.csv";
    a.click();
    toast.success("✅ Raporti u shkarkua!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-8 border-b border-gray-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-1">AplikoUSA</h1>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                data-testid={`tab-${item.id}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
            data-testid="button-admin-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Dilni
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600 mt-2">Mbigledhat e sistemit tuaj</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            <p className="text-3xl font-bold mt-2">{stat.value}</p>
                          </div>
                          <div className={`${stat.color} p-4 rounded-lg`}>
                            <Icon className="w-6 h-6 text-gray-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Aktiviteti i Fundit</CardTitle>
                </CardHeader>
                <CardContent>
                  {applications.slice(0, 5).length > 0 ? (
                    <div className="space-y-4">
                      {applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">Aplikim #{app.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500">{app.createdAt}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nuk ka aktivitet të fundit</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Klientët</h2>
                <p className="text-gray-600 mt-2">Menaxhoni të gjithë klientët tuaj</p>
              </div>

              {selectedClientIds.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-blue-900">Zgjedhur: {selectedClientIds.length} klient(ë)</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleBulkUpdatePayment("completed")} className="bg-green-100 hover:bg-green-200">Markoji të Paguar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkUpdatePayment("pending")} className="bg-yellow-100 hover:bg-yellow-200">Markoji Në Pritje</Button>
                        <Button size="sm" variant="outline" onClick={handleBulkDelete} className="bg-red-100 hover:bg-red-200 text-red-700">Fshij të Zgjedhur</Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedClientIds([])}>Anulo</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Lista e Klientëve ({filteredClients.length}/{clients.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input placeholder="Kërko emër ose email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-clients" />
                    <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Të Gjitha Pageset</SelectItem>
                        <SelectItem value="completed">✓ Paguar</SelectItem>
                        <SelectItem value="pending">⏳ Në Pritje</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterPackageType} onValueChange={setFilterPackageType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Të Gjitha Paketat</SelectItem>
                        <SelectItem value="individual">Individuale</SelectItem>
                        <SelectItem value="couple">Çifte</SelectItem>
                        <SelectItem value="family">Familjare</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleBulkSelectAll} className="bg-primary hover:bg-primary/90">
                      {selectedClientIds.length === filteredClients.length && filteredClients.length > 0 ? "Deselekto Të Gjithë" : "Selekto Të Gjithë"}
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{width: "40px"}}>
                            <input type="checkbox" checked={selectedClientIds.length === filteredClients.length && filteredClients.length > 0} onChange={handleBulkSelectAll} />
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Emër</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Paketa</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Pagesa</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Veprime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client) => (
                            <tr key={client.id} className="border-b hover:bg-gray-50 transition">
                              <td className="py-3 px-4">
                                <input type="checkbox" checked={selectedClientIds.includes(client.id)} onChange={() => handleBulkSelect(client.id)} />
                              </td>
                              <td className="py-3 px-4">{client.firstName} {client.lastName}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{client.email}</td>
                              <td className="py-3 px-4">
                                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {client.package || "—"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-sm px-2 py-1 rounded ${
                                  client.paymentStatus === "completed" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {client.paymentStatus === "completed" ? "✓ Paguar" : "⏳ Në Pritje"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Shiko Detalet"
                                    onClick={() => {
                                      setSelectedClientDetails(client);
                                      setShowClientDetailsDialog(true);
                                    }}
                                    data-testid={`button-view-client-${client.id}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Dërgo Email"
                                    onClick={() => handleSendEmailToClient(client.email, `${client.firstName} ${client.lastName}`)}
                                    data-testid={`button-email-client-${client.id}`}
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Redakto"
                                    onClick={() => {
                                      setEditingClient(client);
                                      setClientFormData({
                                        firstName: client.firstName,
                                        lastName: client.lastName,
                                        email: client.email,
                                        phone: client.phone || "",
                                        birthCountry: client.birthCountry || "",
                                        city: client.city || "",
                                        paymentStatus: client.paymentStatus,
                                        package: client.package || "",
                                      });
                                      setShowClientDialog(true);
                                    }}
                                    data-testid={`button-edit-client-${client.id}`}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-purple-600 hover:text-purple-700"
                                    title="Përditëso Hapat"
                                    onClick={async () => {
                                      // Fetch application for this client
                                      try {
                                        const appResponse = await fetch(`/api/applications/${client.id}`);
                                        const app = await appResponse.json();
                                        if (app && app.id) {
                                          setSelectedApplicationForSteps(app);
                                          setApplicationStepsData({
                                            registrationStatus: app.registrationStatus || "pending",
                                            paymentStatus: app.paymentStatus || "pending",
                                            formStatus: app.formStatus || "pending",
                                            photoStatus: app.photoStatus || "pending",
                                            submissionStatus: app.submissionStatus || "pending",
                                          });
                                          setShowUpdateStepsDialog(true);
                                        }
                                      } catch (err) {
                                        toast.error("Gabim në ngarkim të aplikimit");
                                      }
                                    }}
                                    data-testid={`button-update-steps-client-${client.id}`}
                                  >
                                    <PenTool className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Kyqu si Klient"
                                    onClick={() => handleLoginAsClient(client.id)}
                                    data-testid={`button-login-as-client-${client.id}`}
                                  >
                                    <LogOut className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    title="Fshij"
                                    onClick={() => handleDeleteClient(client.id)}
                                    data-testid={`button-delete-client-${client.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500">
                              Nuk ka klientë
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div><h2 className="text-3xl font-bold text-gray-900">Analytics</h2><p className="text-gray-600 mt-2">Analiza në kohë reale e biznesit tuaj</p></div>
              <div className="grid grid-cols-4 gap-4">
                <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Total Revenue</p><p className="text-3xl font-bold mt-2">€{analytics?.totalRevenue?.toFixed(2) || 0}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Revenue (Individual)</p><p className="text-3xl font-bold mt-2">€{analytics?.revenueByPackage?.individual?.toFixed(2) || 0}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Revenue (Couple)</p><p className="text-3xl font-bold mt-2">€{analytics?.revenueByPackage?.couple?.toFixed(2) || 0}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Revenue (Family)</p><p className="text-3xl font-bold mt-2">€{analytics?.revenueByPackage?.family?.toFixed(2) || 0}</p></CardContent></Card>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Applications Pending</p><p className="text-3xl font-bold mt-2">{analytics?.applicationsByStatus?.pending || 0}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Applications In Progress</p><p className="text-3xl font-bold mt-2">{analytics?.applicationsByStatus?.inProgress || 0}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Applications Completed</p><p className="text-3xl font-bold mt-2">{analytics?.applicationsByStatus?.completed || 0}</p></CardContent></Card>
              </div>
            </motion.div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex justify-between items-center"><div><h2 className="text-3xl font-bold text-gray-900">Transaksionet</h2><p className="text-gray-600 mt-2">Të gjitha transaksionet e pagesës</p></div><Button onClick={downloadTransactionReport} className="bg-green-600 hover:bg-green-700"><Download className="w-4 h-4 mr-2" />Shkarkimi CSV</Button></div>
              <Card><CardContent className="p-4"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 px-3">ID Përdoruesi</th><th className="text-left py-2 px-3">Lloji i Paketës</th><th className="text-left py-2 px-3">Shuma</th><th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Data</th></tr></thead><tbody>{allTransactions.map(t => (<tr key={t.id} className="border-b"><td className="py-2 px-3 font-mono text-xs">{t.userId.slice(0, 8)}</td><td className="py-2 px-3 capitalize">{t.packageType}</td><td className="py-2 px-3">€{t.amount}</td><td className="py-2 px-3"><span className={`px-2 py-1 rounded text-xs ${t.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t.status}</span></td><td className="py-2 px-3 text-xs">{new Date(t.createdAt).toLocaleDateString('sq-AL')}</td></tr>))}</tbody></table></div></CardContent></Card>
            </motion.div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div><h2 className="text-3xl font-bold text-gray-900">Regjistrat</h2><p className="text-gray-600 mt-2">Aktiviteti i administratorit dhe historia e emaileve</p></div>
              <div className="grid grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="text-lg">Activity Logs</CardTitle></CardHeader><CardContent><div className="space-y-2 max-h-96 overflow-y-auto">{activityLogs.length > 0 ? activityLogs.map(log => (<div key={log.id} className="text-sm border-b pb-2"><p className="font-semibold text-gray-800">{log.action}</p><p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString('sq-AL')}</p></div>)) : <p className="text-gray-500">No activity logs</p>}</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-lg">Email Logs</CardTitle></CardHeader><CardContent><div className="space-y-2 max-h-96 overflow-y-auto">{emailLogs.length > 0 ? emailLogs.map(log => (<div key={log.id} className="text-sm border-b pb-2"><p className="font-semibold text-gray-800">{log.recipientEmail}</p><p className="text-xs text-gray-600">{log.subject}</p><p className={`text-xs ${log.status === 'sent' ? 'text-green-600' : 'text-red-600'}`}>{log.status}</p><p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString('sq-AL')}</p></div>)) : <p className="text-gray-500">No email logs</p>}</div></CardContent></Card>
              </div>
            </motion.div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Aplikime</h2>
                <p className="text-gray-600 mt-2">Menaxhoni të gjitha aplikimet e klientëve</p>
              </div>

              <div className="grid gap-4">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900">
                                Aplikim #{app.id.slice(0, 8)}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Statusi: <span className={`font-semibold ${
                                  app.status === 'approved' ? 'text-green-600' :
                                  app.status === 'pending' ? 'text-yellow-600' :
                                  'text-gray-600'
                                }`}>{app.status}</span>
                              </p>
                              <div className="mt-3 text-sm text-gray-700">
                                {app.spouseFirstName && (
                                  <p>Bashkëshort: {app.spouseFirstName} {app.spouseLastName}</p>
                                )}
                                {app.childrenCount && (
                                  <p>Fëmijë: {app.childrenCount}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedApplicationForSteps(app);
                                  setShowUpdateStepsDialog(true);
                                }}
                                data-testid={`button-update-steps-${app.id}`}
                              >
                                <PenTool className="w-4 h-4 mr-2" />
                                Përditëso Hapat
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSendEmailData({ ...sendEmailData, recipientEmail: app.userId })}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      Nuk ka aplikime ende
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Email Templates</h2>
                  <p className="text-gray-600 mt-2">Menaxhoni templates për dërgimin e emaileve</p>
                </div>
                <Button
                  onClick={() => {
                    setEditingTemplate(null);
                    setFormData({ name: "", subject: "", htmlContent: "" });
                    setShowTemplateDialog(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-white"
                  data-testid="button-create-template"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Krijo Template
                </Button>
              </div>

              <div className="grid gap-4">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                            <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 line-clamp-2">
                              {template.htmlContent.substring(0, 100)}...
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                setEditingTemplate(template);
                                setFormData({
                                  name: template.name,
                                  subject: template.subject,
                                  htmlContent: template.htmlContent,
                                });
                                setShowTemplateDialog(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Send Email Tab */}
          {activeTab === "send-email" && (
            <motion.div
              key="send-email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Dërgo Email Personalizuar</h2>
                <p className="text-gray-600 mt-2">Dërgoni emaile të personalizuara për klientët</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Email i Klientit</Label>
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setSendEmailData({ ...sendEmailData, emailMode: "select", recipientEmail: "" })}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                            sendEmailData.emailMode === "select"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Zgjedh nga Klientët
                        </button>
                        <button
                          onClick={() => setSendEmailData({ ...sendEmailData, emailMode: "manual", recipientEmail: "" })}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                            sendEmailData.emailMode === "manual"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Shkruaj Emailin
                        </button>
                      </div>

                      {sendEmailData.emailMode === "select" ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => setSendEmailData({ ...sendEmailData, sendToAll: !sendEmailData.sendToAll, recipientEmail: "" })}
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-all ${
                              sendEmailData.sendToAll
                                ? "bg-purple-100 text-purple-700 border border-purple-300"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                          >
                            ✓ Zgjidh të Gjithë Klientët ({clients.length})
                          </button>
                          {!sendEmailData.sendToAll && (
                            <Select
                              value={sendEmailData.recipientEmail}
                              onValueChange={(value) => setSendEmailData({ ...sendEmailData, recipientEmail: value })}
                            >
                              <SelectTrigger data-testid="select-client-email">
                                <SelectValue placeholder="Zgjedhni klientin" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.email}>
                                    {client.firstName} {client.lastName} ({client.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ) : (
                        <Input
                          type="email"
                          placeholder="client@example.com"
                          value={sendEmailData.recipientEmail}
                          onChange={(e) => setSendEmailData({ ...sendEmailData, recipientEmail: e.target.value })}
                          data-testid="input-recipient-email"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template">Zgjedhni Template</Label>
                      <Select
                        value={sendEmailData.templateId}
                        onValueChange={(value) => setSendEmailData({ ...sendEmailData, templateId: value })}
                      >
                        <SelectTrigger data-testid="select-template">
                          <SelectValue placeholder="Zgjedhni templatein" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSendEmail}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-white w-full"
                      data-testid="button-send-email"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Duke dërguar...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Dërgo Email
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Custom Email Tab */}
          {activeTab === "custom-email" && (
            <motion.div
              key="custom-email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Dërgo Email Custom</h2>
                <p className="text-gray-600 mt-2">Shkruani dhe dërgoni email-e të personalizuara drejtpërdrejt</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Email i Klientit</Label>
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setCustomEmailData({ ...customEmailData, emailMode: "select", recipientEmail: "" })}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                            customEmailData.emailMode === "select"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Zgjedh nga Klientët
                        </button>
                        <button
                          onClick={() => setCustomEmailData({ ...customEmailData, emailMode: "manual", recipientEmail: "" })}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                            customEmailData.emailMode === "manual"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Shkruaj Emailin
                        </button>
                      </div>

                      {customEmailData.emailMode === "select" ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => setCustomEmailData({ ...customEmailData, sendToAll: !customEmailData.sendToAll, recipientEmail: "" })}
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-all ${
                              customEmailData.sendToAll
                                ? "bg-purple-100 text-purple-700 border border-purple-300"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                          >
                            ✓ Zgjidh të Gjithë Klientët ({clients.length})
                          </button>
                          {!customEmailData.sendToAll && (
                            <Select
                              value={customEmailData.recipientEmail}
                              onValueChange={(value) => setCustomEmailData({ ...customEmailData, recipientEmail: value })}
                            >
                              <SelectTrigger data-testid="select-client-custom-email">
                                <SelectValue placeholder="Zgjedhni klientin" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.email}>
                                    {client.firstName} {client.lastName} ({client.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ) : (
                        <Input
                          type="email"
                          placeholder="client@example.com"
                          value={customEmailData.recipientEmail}
                          onChange={(e) => setCustomEmailData({ ...customEmailData, recipientEmail: e.target.value })}
                          data-testid="input-custom-recipient-email"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-subject">Subjekti i Emailit</Label>
                      <Input
                        id="custom-subject"
                        placeholder="Shkruani subjektin..."
                        value={customEmailData.subject}
                        onChange={(e) => setCustomEmailData({ ...customEmailData, subject: e.target.value })}
                        data-testid="input-custom-subject"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-content">Përmbajtja e Emailit (HTML)</Label>
                      <Textarea
                        id="custom-content"
                        placeholder="Shkruani përmbajtjen e emailit këtu... Mund të përdorni HTML për formatim"
                        value={customEmailData.htmlContent}
                        onChange={(e) => setCustomEmailData({ ...customEmailData, htmlContent: e.target.value })}
                        rows={10}
                        data-testid="input-custom-content"
                      />
                    </div>

                    <Button
                      onClick={handleSendCustomEmail}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-white w-full"
                      data-testid="button-send-custom-email"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Duke dërguar...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Dërgo Email Custom
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Redakto Template" : "Krijo Template të Ri"}
            </DialogTitle>
            <DialogDescription>
              Përdorni {"{recipientName}"} për emrin dhe {"{date}"} për datën
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Emri i Template</Label>
              <Input
                id="name"
                placeholder="p.sh. Përshëndetje Klienti"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-template-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subjekti</Label>
              <Input
                id="subject"
                placeholder="p.sh. Përshëndetje {recipientName}"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                data-testid="input-template-subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">HTML Përmbajtja</Label>
              <Textarea
                id="content"
                placeholder="<div>HTML content këtu...</div>"
                value={formData.htmlContent}
                onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                rows={6}
                data-testid="input-template-content"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Anulo
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-save-template"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Duke ruajtur...
                </>
              ) : (
                "Ruaj"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={showClientDetailsDialog} onOpenChange={setShowClientDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalet e Klientit</DialogTitle>
          </DialogHeader>
          {selectedClientDetails && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Emër i Plotë</p>
                <p className="font-semibold">{selectedClientDetails.firstName} {selectedClientDetails.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-blue-600">{selectedClientDetails.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="font-semibold">{selectedClientDetails.phone || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vendi i Lindjes</p>
                  <p className="font-semibold">{selectedClientDetails.birthCountry || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Qytet</p>
                  <p className="font-semibold">{selectedClientDetails.city || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paketa</p>
                <p className="font-semibold">{selectedClientDetails.package || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Statusi Pagese</p>
                  <span className={`text-sm px-2 py-1 rounded inline-block ${
                    selectedClientDetails.paymentStatus === "completed" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {selectedClientDetails.paymentStatus === "completed" ? "✓ Paguar" : "⏳ Në Pritje"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statusi Online</p>
                  <span className={`text-sm px-2 py-1 rounded inline-block ${
                    selectedClientDetails.isOnline
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {selectedClientDetails.isOnline ? "🟢 Online" : "⚫ Offline"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data e Regjistrimit</p>
                <p className="font-semibold">{new Date(selectedClientDetails.createdAt).toLocaleDateString("sq-AL")}</p>
              </div>
              {selectedClientDetails.lastActivityAt && (
                <div>
                  <p className="text-sm text-gray-600">Aktiviteti i Fundit</p>
                  <p className="font-semibold">{new Date(selectedClientDetails.lastActivityAt).toLocaleDateString("sq-AL", { 
                    year: "numeric", 
                    month: "short", 
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowClientDetailsDialog(false)}>Mbyll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Application Steps Dialog */}
      <Dialog open={showUpdateStepsDialog} onOpenChange={setShowUpdateStepsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Përditëso Hapat e Aplikimit</DialogTitle>
            <DialogDescription>
              Zgjedhni statuset për çdo hap të procesit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Regjistrimi</Label>
              <Select value={applicationStepsData.registrationStatus} onValueChange={(value) => setApplicationStepsData({...applicationStepsData, registrationStatus: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">✓ Përfunduar</SelectItem>
                  <SelectItem value="in_progress">⧖ Duke u përpunuar</SelectItem>
                  <SelectItem value="pending">○ Në Pritje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold">Pagesa</Label>
              <Select value={applicationStepsData.paymentStatus} onValueChange={(value) => setApplicationStepsData({...applicationStepsData, paymentStatus: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">✓ Përfunduar</SelectItem>
                  <SelectItem value="in_progress">⧖ Duke u përpunuar</SelectItem>
                  <SelectItem value="pending">○ Në Pritje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold">Plotësimi i Formularit</Label>
              <Select value={applicationStepsData.formStatus} onValueChange={(value) => setApplicationStepsData({...applicationStepsData, formStatus: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">✓ Përfunduar</SelectItem>
                  <SelectItem value="in_progress">⧖ Duke u përpunuar</SelectItem>
                  <SelectItem value="pending">○ Në Pritje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold">Kontrolli i Fotos</Label>
              <Select value={applicationStepsData.photoStatus} onValueChange={(value) => setApplicationStepsData({...applicationStepsData, photoStatus: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">✓ Përfunduar</SelectItem>
                  <SelectItem value="in_progress">⧖ Duke u përpunuar</SelectItem>
                  <SelectItem value="pending">○ Në Pritje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold">Dorëzimi Zyrtar</Label>
              <Select value={applicationStepsData.submissionStatus} onValueChange={(value) => setApplicationStepsData({...applicationStepsData, submissionStatus: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">✓ Përfunduar</SelectItem>
                  <SelectItem value="in_progress">⧖ Duke u përpunuar</SelectItem>
                  <SelectItem value="pending">○ Në Pritje</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUpdateStepsDialog(false);
                setSelectedApplicationForSteps(null);
              }}
            >
              Anulo
            </Button>
            <Button 
              onClick={handleUpdateApplicationSteps}
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={loading}
              data-testid="button-save-steps"
            >
              {loading ? "Duke u ruajtur..." : "Ruaj Hapat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Edit Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redakto Klientin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">Emër</Label>
                <Input
                  id="firstName"
                  value={clientFormData.firstName}
                  onChange={(e) => setClientFormData({...clientFormData, firstName: e.target.value})}
                  placeholder="Emër"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Mbiemër</Label>
                <Input
                  id="lastName"
                  value={clientFormData.lastName}
                  onChange={(e) => setClientFormData({...clientFormData, lastName: e.target.value})}
                  placeholder="Mbiemër"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                placeholder="Email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={clientFormData.phone}
                onChange={(e) => setClientFormData({...clientFormData, phone: e.target.value})}
                placeholder="Telefon"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="birthCountry">Vendi i Lindjes</Label>
                <Input
                  id="birthCountry"
                  value={clientFormData.birthCountry}
                  onChange={(e) => setClientFormData({...clientFormData, birthCountry: e.target.value})}
                  placeholder="Vendi"
                />
              </div>
              <div>
                <Label htmlFor="city">Qytet</Label>
                <Input
                  id="city"
                  value={clientFormData.city}
                  onChange={(e) => setClientFormData({...clientFormData, city: e.target.value})}
                  placeholder="Qytet"
                />
              </div>
            </div>
            <div>
              <Label>Statusi Pagese</Label>
              <Select value={clientFormData.paymentStatus} onValueChange={(value) => setClientFormData({...clientFormData, paymentStatus: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Në Pritje</SelectItem>
                  <SelectItem value="completed">Paguar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Paketa</Label>
              <Select value={clientFormData.package} onValueChange={(value) => setClientFormData({...clientFormData, package: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Paket Individuale</SelectItem>
                  <SelectItem value="couple">Paket për Çifte</SelectItem>
                  <SelectItem value="family">Paket Familjare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleUpdateClient} disabled={loading}>
              {loading ? "Duke u ruajtur..." : "Ruaj Ndryshimet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
