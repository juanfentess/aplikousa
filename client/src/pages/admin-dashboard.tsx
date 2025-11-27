import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Mail,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Send,
  Loader2,
  Users,
  FileText,
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
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlContent: "",
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

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 md:px-6 pt-28 pb-20">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Card className="sticky top-28">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <LayoutDashboard className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Admin Panel</h3>
                  <p className="text-sm text-gray-500">AplikoUSA</p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant={activeTab === "templates" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("templates")}
                    data-testid="tab-templates"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email Templates
                  </Button>
                  <Button
                    variant={activeTab === "applications" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("applications")}
                    data-testid="tab-applications"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Aplikime
                  </Button>
                </div>

                <div className="border-t my-4" />

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                  data-testid="button-admin-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Dilni
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
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
                      <h2 className="text-3xl font-bold text-primary">Email Templates</h2>
                      <p className="text-gray-600">Menaxhoni templates për dërgimin e emaileve</p>
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
                    <h2 className="text-3xl font-bold text-primary">Aplikime</h2>
                    <p className="text-gray-600">Menaxhoni të gjitha aplikimet e klientëve</p>
                  </div>

                  <div className="grid gap-4">
                    {applications.map((app) => (
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
                                  Aplikime #{app.id.slice(0, 8)}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  Status: <span className="font-semibold">{app.status}</span>
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
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-white"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Detajet
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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

      <Footer />
    </div>
  );
}
