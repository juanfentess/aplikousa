import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { sendVerificationEmail, sendTemplateEmail } from "./email";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
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
  // Register Stripe webhook BEFORE express.json()
  app.post(
    '/api/stripe/webhook/:uuid',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        const { uuid } = req.params;
        await WebhookHandlers.processWebhook(req.body as Buffer, sig, uuid);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('[Webhook] Error:', error.message);
        res.status(400).json({ error: 'Webhook error' });
      }
    }
  );

  // Now apply JSON middleware for other routes
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false }));

  // Auth Routes

  // Register user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validData = insertUserSchema.parse(req.body);

      // Check if user exists
      const existing = await storage.getUserByEmail(validData.email);
      if (existing) {
        return res.status(400).json({ error: "Ky email është tashmë i regjistruar. Ju lutem përdorni një email të ndryshëm." });
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
      const emailResult = await sendVerificationEmail(user.email, code, user.firstName);

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
      
      // Create application for the user
      const user = await storage.getUser(userId);
      if (user) {
        await storage.createApplication({
          userId,
          status: "pending",
        });
      }

      res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Hash the provided password and compare
      const hashedPassword = await hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Return user ID and payment status
      res.json({ 
        success: true, 
        userId: user.id,
        paymentStatus: user.paymentStatus || "pending"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get user data
  app.get("/api/auth/user/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Missing user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user data without password
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Handle payment success
  app.post("/api/payment-success", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing user ID" });
      }

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update payment status
      await storage.updateUserStripeInfo(userId, { paymentStatus: "completed" });

      // Send payment success email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0B1B3B 0%, #1a3a52 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .success-icon { font-size: 48px; margin-bottom: 15px; }
            .content { padding: 40px 30px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: 600; color: #0B1B3B; margin-bottom: 15px; }
            .info-box { background-color: #f0f7ff; border-left: 4px solid #0B1B3B; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .info-label { font-size: 13px; color: #666; font-weight: 500; }
            .info-value { font-size: 16px; color: #0B1B3B; font-weight: 600; margin-top: 5px; }
            .button { display: inline-block; background-color: #0B1B3B; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .button:hover { background-color: #0a1530; }
            .features { list-style: none; padding: 0; margin: 15px 0; }
            .features li { padding: 10px 0; padding-left: 25px; position: relative; color: #333; font-size: 14px; }
            .features li:before { content: "✓"; position: absolute; left: 0; color: #0B1B3B; font-weight: bold; }
            .footer { background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
            .footer a { color: #0B1B3B; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="success-icon">✓</div>
              <h1>Pagesa u Përfundua me Sukses!</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Faleminderit për besimin tuaj</p>
            </div>

            <!-- Content -->
            <div class="content">
              <!-- Greeting -->
              <div class="section">
                <p style="margin: 0; font-size: 16px; color: #333;">Përshëndetje ${user.firstName},</p>
              </div>

              <!-- Success Message -->
              <div class="section">
                <p style="margin: 0; color: #666; line-height: 1.6;">
                  Jemi të ngazëllyer t'ju informojmë se pagesa juaj për aplikimin e DV Lottery Green Card është marrë dhe përpunuar me sukses. 
                  Ju mund ta filloni aplikimin tuaj tani dhe të ndjekni statusin në çdo kohë përmes panelimit tuaj.
                </p>
              </div>

              <!-- Receipt Section -->
              <div class="section">
                <div class="section-title">Detalet e Pagesës</div>
                <div class="info-box">
                  <div class="info-label">Shuma e Paguar</div>
                  <div class="info-value">Sipas Paketës</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Statusi</div>
                  <div class="info-value" style="color: #10b981;">Përfunduar</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Email Konfirmimi</div>
                  <div class="info-value">${user.email}</div>
                </div>
              </div>

              <!-- What's Next -->
              <div class="section">
                <div class="section-title">Hapat e Ardhshëm</div>
                <ul class="features">
                  <li>Plotësoni formularin e aplikimit me të dhënat tuaja të plota</li>
                  <li>Ngarkoni foton tuaj në përputhje me kërkesat zyrtare</li>
                  <li>Rishikojeni aplikimin tuaj para se ta dorëzoni</li>
                  <li>Monitoroni statusin e aplikimit në panelin tuaj</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="https://aplikousa.com/dashboard" class="button">Shko në Panelin tim</a>
              </div>

              <!-- Support -->
              <div class="section" style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  Nëse keni pyetje ose keni nevojë për ndihmë, kontaktoni <a href="mailto:info@aplikousa.com" style="color: #0B1B3B; text-decoration: none;">info@aplikousa.com</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0;">© 2025 AplikoUSA. Të gjitha të drejtat e rezervuara.</p>
              <p style="margin: 10px 0 0 0; font-size: 11px;">
                <a href="https://aplikousa.com/privacy">Politika e Privatësisë</a> | 
                <a href="https://aplikousa.com/terms">Termat e Shërbimit</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendTemplateEmail(
        user.email,
        htmlContent,
        "Pagesa e Suksesshme - AplikoUSA Green Card DV Lottery",
        user.firstName
      );

      res.json({ success: true, message: "Payment updated and email sent" });
    } catch (error) {
      console.error("Payment success error:", error);
      res.status(500).json({ error: "Failed to process payment success" });
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

      // Get template by ID
      const template = await storage.getEmailTemplateById(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const success = await sendTemplateEmail(
        toEmail,
        template.htmlContent,
        template.subject,
        recipientName || "Klient"
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

  // Send custom email
  app.post("/api/admin/send-custom-email", async (req, res) => {
    try {
      const { toEmail, subject, htmlContent } = req.body;

      if (!toEmail || !subject || !htmlContent) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const success = await sendTemplateEmail(
        toEmail,
        htmlContent,
        subject,
        "Klient"
      );

      if (success) {
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error("Error sending custom email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Stripe Checkout
  app.post("/api/checkout", async (req, res) => {
    try {
      const { userId, packageType } = req.body;

      if (!userId || !packageType) {
        return res.status(400).json({ error: "Missing userId or packageType" });
      }

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get or create Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripeService.createCustomer(user.email, userId);
        stripeCustomerId = customer.id;
        // Update user with Stripe customer ID
        await storage.updateUserStripeInfo(userId, { stripeCustomerId });
      }

      // Package details
      const packages: Record<string, { name: string; amount: number }> = {
        individual: { name: "Individual Package", amount: 20 },
        couple: { name: "Couple Package", amount: 35 },
        family: { name: "Family Package", amount: 50 },
      };

      const pkg = packages[packageType];
      if (!pkg) {
        return res.status(400).json({ error: "Invalid package type" });
      }

      // Create checkout session with amount
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session = await stripeService.createCheckoutSessionWithAmount(
        stripeCustomerId,
        pkg.amount,
        pkg.name,
        `${baseUrl}/dashboard?payment=success`,
        `${baseUrl}/dashboard?payment=cancelled`
      );

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: error.message || "Checkout failed" });
    }
  });

  // Stripe Routes
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error getting publishable key:", error);
      res.status(500).json({ error: "Failed to get publishable key" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { userId, priceId } = req.body;

      if (!userId || !priceId) {
        return res.status(400).json({ error: "Missing userId or priceId" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(user.email, user.id);
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${process.env.REPLIT_DOMAINS || 'localhost:5000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        `${process.env.REPLIT_DOMAINS || 'localhost:5000'}/checkout/cancel`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  return httpServer;
}
