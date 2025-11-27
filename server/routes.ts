import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendVerificationEmail, sendTemplateEmail } from "./email";
import { insertUserSchema, insertEmailTemplateSchema, insertAdminSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

async function hashPassword(password: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(password).digest("hex");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Routes

  // Register user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validData = insertUserSchema.parse(req.body);

      // Check if user exists
      const existing = await storage.getUserByEmail(validData.email);
      if (existing) {
        return res.status(400).json({ error: "Email już zarejestrowany" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validData.password);

      // Create user
      const user = await storage.createUser({
        ...validData,
        password: hashedPassword,
      });

      // Generate verification code
      const code = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createVerificationCode({
        userId: user.id,
        code,
        expiresAt,
      });

      // Send verification email
      await sendVerificationEmail(user.email, code, user.firstName);

      res.json({
        success: true,
        userId: user.id,
        message: "Verification code sent to email",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Verify email code
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        return res.status(400).json({ error: "Missing userId or code" });
      }

      // Get verification code
      const verificationRecord = await storage.getVerificationCode(userId, code);

      if (!verificationRecord) {
        return res.status(400).json({ error: "Invalid verification code" });
      }

      // Check expiration
      if (new Date() > verificationRecord.expiresAt) {
        await storage.deleteVerificationCode(verificationRecord.id);
        return res.status(400).json({ error: "Verification code expired" });
      }

      // Update user as verified
      await storage.updateUserVerification(userId);
      await storage.deleteVerificationCode(verificationRecord.id);

      res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Admin Routes

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const hashedPassword = await hashPassword(password);
      if (admin.password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ success: true, adminId: admin.id });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get email templates
  app.get("/api/admin/templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Create email template
  app.post("/api/admin/templates", async (req, res) => {
    try {
      const validData = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(validData);
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  // Update email template
  app.patch("/api/admin/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, subject, htmlContent, isActive } = req.body;

      const template = await storage.updateEmailTemplate(id, {
        name,
        subject,
        htmlContent,
        isActive,
      });

      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  // Delete email template
  app.delete("/api/admin/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmailTemplate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // Get all applications
  app.get("/api/admin/applications", async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Update application status
  app.patch("/api/admin/applications/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Missing status" });
      }

      const application = await storage.updateApplicationStatus(id, status);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // Send email to client
  app.post("/api/admin/send-email", async (req, res) => {
    try {
      const { toEmail, templateId, recipientName } = req.body;

      if (!toEmail || !templateId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get template
      const template = await storage.getEmailTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const success = await sendTemplateEmail(
        toEmail,
        template.htmlContent,
        template.subject,
        recipientName
      );

      if (success) {
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  return httpServer;
}
