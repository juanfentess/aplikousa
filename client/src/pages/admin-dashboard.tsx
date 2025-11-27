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
  });
  const [customEmailData, setCustomEmailData] = useState({
    recipientEmail: "",
    subject: "",
    htmlContent: "",
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
    if (!sendEmailData.recipientEmail || !sendEmailData.templateId) {
      toast.error("Zgjedhni templatein dhe futni email");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending email:", sendEmailData);
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: sendEmailData.recipientEmail,
          templateId: sendEmailData.templateId,
          recipientName: "Klient",
        }),
      });

      const data = await response.json();
      console.log("Email response:", data, response.status);
      
      if (response.ok) {
        toast.success("✅ Email dërguar me sukses!", { duration: 3000 });
        setSendEmailData({ recipientEmail: "", templateId: "" });
        setTimeout(() => setActiveTab("dashboard"), 1500);
      } else {
        toast.error("❌ " + (data.error || "Gabim në dërgim"), { duration: 3000 });
      }
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
    if (!customEmailData.recipientEmail || !customEmailData.subject || !customEmailData.htmlContent) {
      toast.error("Plotësoni të gjitha fushat");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending custom email:", customEmailData);
      const response = await fetch("/api/admin/send-custom-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: customEmailData.recipientEmail,
          subject: customEmailData.subject,
          htmlContent: customEmailData.htmlContent,
        }),
      });

      const data = await response.json();
      console.log("Custom email response:", data, response.status);
      
      if (response.ok) {
        toast.success("✅ Email Custom dërguar me sukses!", { duration: 3000 });
        setCustomEmailData({ recipientEmail: "", subject: "", htmlContent: "" });
        setTimeout(() => setActiveTab("dashboard"), 1500);
      } else {
        toast.error("❌ " + (data.error || "Gabim në dërgim"), { duration: 3000 });
      }
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

  const stats = [
    { label: "Gjithsej Klientë", value: clients.length, icon: Users, color: "bg-blue-100" },
    { label: "Pagesa të Përfunduara", value: clients.filter(c => c.paymentStatus === "completed").length, icon: CheckCircle, color: "bg-green-100" },
    { label: "Në Pritje Pagese", value: clients.filter(c => c.paymentStatus === "pending").length, icon: Clock, color: "bg-yellow-100" },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "clients", label: "Klientët", icon: Users },
    { id: "applications", label: "Aplikime", icon: FileText },
    { id: "templates", label: "Email Templates", icon: Mail },
    { id: "send-email", label: "Dërgo Email", icon: Send },
    { id: "custom-email", label: "Email Custom", icon: PenTool },
  ];

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

              <Card>
                <CardHeader>
                  <CardTitle>Lista e Klientëve ({clients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Emër</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Paketa</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Pagesa</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Veprime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.length > 0 ? (
                          clients.map((client) => (
                            <tr key={client.id} className="border-b hover:bg-gray-50 transition">
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
                      <Label htmlFor="email">Email i Klientit</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="client@example.com"
                        value={sendEmailData.recipientEmail}
                        onChange={(e) => setSendEmailData({ ...sendEmailData, recipientEmail: e.target.value })}
                        data-testid="input-recipient-email"
                      />
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
                      <Label htmlFor="custom-email">Email i Klientit</Label>
                      <Input
                        id="custom-email"
                        type="email"
                        placeholder="client@example.com"
                        value={customEmailData.recipientEmail}
                        onChange={(e) => setCustomEmailData({ ...customEmailData, recipientEmail: e.target.value })}
                        data-testid="input-custom-recipient-email"
                      />
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
