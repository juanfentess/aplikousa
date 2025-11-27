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
  const [loading, setLoading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlContent: "",
  });
  const [sendEmailData, setSendEmailData] = useState({
    recipientEmail: "",
    templateId: "",
  });

  useEffect(() => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      setLocation("/admin/login");
      return;
    }
    loadTemplates();
    loadApplications();
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
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: sendEmailData.recipientEmail,
          templateId: sendEmailData.templateId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Email dërguar me sukses!");
        setShowSendEmailDialog(false);
        setSendEmailData({ recipientEmail: "", templateId: "" });
      } else {
        toast.error(data.error || "Gabim në dërgim");
      }
    } catch (err) {
      toast.error("Gabim gjatë dërgimit të emailit");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    setLocation("/admin/login");
  };

  const stats = [
    { label: "Gjithsej Aplikime", value: applications.length, icon: Users, color: "bg-blue-100" },
    { label: "Në Pritje", value: applications.filter(a => a.status === "pending").length, icon: Clock, color: "bg-yellow-100" },
    { label: "Aprovuar", value: applications.filter(a => a.status === "approved").length, icon: CheckCircle, color: "bg-green-100" },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "applications", label: "Aplikime", icon: Users },
    { id: "templates", label: "Email Templates", icon: Mail },
    { id: "send-email", label: "Dërgo Email", icon: Send },
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
    </div>
  );
}
