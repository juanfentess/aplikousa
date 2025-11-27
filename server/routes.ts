import express, { Express, Request, Response } from "express";
import session from "express-session";
import { createServer as createHTTPServer, Server as HTTPServer } from "http";
import ConnectPgSimple from "connect-pg-simple";
import { db } from "./db";
import { storage } from "./storage";
import { sendTemplateEmail, sendVerificationEmail, sendPasswordResetEmail } from "./email";
import {
  generateApplicationConfirmationHTML,
} from "./documents";
import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";
import { sql } from "drizzle-orm";

let stripe: Stripe | null = null;
let stripeSync: StripeSync | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY not set");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20",
    });
  }
  return stripe;
}

function getStripeSync(): StripeSync {
  if (!stripeSync) {
    stripeSync = new StripeSync({
      database: db as any,
      stripe: getStripe(),
      webhookEndpoint: async (app: Express, path: string, handler) => {
        app.post(path, handler);
      },
    });
  }
  return stripeSync;
}

interface StripeCustomerData {
  id: string;
  email: string;
  metadata?: {
    userId?: string;
    name?: string;
  };
}

interface StripeCheckoutSession {
  url: string | null;
  id: string;
}

interface StripeProduct {
  id: string;
  name: string;
  prices: Array<{
    id: string;
    unit_amount: number;
  }>;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
}

interface StripeService {
  createCustomer(email: string, userId: string): Promise<StripeCustomerData>;
  createCheckoutSessionWithAmount(
    customerId: string,
    amount: number,
    name: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeCheckoutSession>;
  createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeCheckoutSession>;
  getCustomer(customerId: string): Promise<StripeCustomerData>;
  getSubscription(subscriptionId: string): Promise<StripeSubscription>;
  getProduct(productId: string): Promise<StripeProduct>;
}

const stripeService: StripeService = {
  async createCustomer(email: string, userId: string) {
    const customer = await getStripe().customers.create({
      email,
      metadata: { userId, name: email.split("@")[0] },
    });
    return customer;
  },

  async createCheckoutSessionWithAmount(
    customerId: string,
    amount: number,
    name: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: name,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  },

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  },

  async getCustomer(customerId: string) {
    return await getStripe().customers.retrieve(customerId);
  },

  async getSubscription(subscriptionId: string) {
    return await getStripe().subscriptions.retrieve(subscriptionId);
  },

  async getProduct(productId: string) {
    return await getStripe().products.retrieve(productId);
  },
};

async function getStripePublishableKey(): Promise<string> {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    throw new Error("STRIPE_PUBLISHABLE_KEY not set");
  }
  return process.env.STRIPE_PUBLISHABLE_KEY;
}

export async function registerRoutes(httpServer: HTTPServer, app: Express): Promise<void> {
  // Enable JSON parsing
  app.use(express.json());

  // Seed default admin user if none exists
  try {
    const existingAdmin = await storage.getAdminByEmail("admin@aplikousa.com");
    if (!existingAdmin) {
      console.log("[Admin] Creating default admin user...");
      const newAdmin = await storage.createAdmin({
        email: "admin@aplikousa.com",
        password: "admin123"
      });
      console.log("[Admin] Default admin created:", newAdmin.email);
    } else {
      console.log("[Admin] Admin already exists:", existingAdmin.email);
    }
  } catch (err: any) {
    console.error("[Admin] Failed to seed admin:", err.message, err);
  }

  // Middleware to log requests
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `${new Date().toLocaleTimeString()} [${req.method}] ${req.path} ${res.statusCode} in ${duration}ms${
          res.locals.data ? " :: " + JSON.stringify(res.locals.data) : ""
        }`
      );
    });
    next();
  });

  app.use((req, res, next) => {
    res.locals.data = null;
    next();
  });

  // Login and signup routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        birthCountry,
        city,
        package: packageType,
      } = req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !phone ||
        !birthCountry ||
        !city ||
        !packageType
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await storage.createUser({
        firstName,
        lastName,
        email,
        password,
        phone,
        birthCountry,
        city,
        package: packageType,
      });

      // Generate verification code
      const code = Math.random().toString().slice(2, 8);
      await storage.createVerificationCode({
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const verificationUrl = `https://${req.get("host")}/verify?userId=${user.id}&code=${code}`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
            h1 { color: #0B1B3B; text-align: center; }
            p { color: #555; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 30px; margin: 20px auto; background-color: #E63946; color: white; text-decoration: none; border-radius: 5px; text-align: center; }
            .code { font-size: 24px; font-weight: bold; color: #0B1B3B; text-align: center; letter-spacing: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>AplikoUSA - Email Verification</h1>
            <p>Përshëndetje ${firstName},</p>
            <p>Faleminderit që regjistroheni në AplikoUSA. Për të verifikuar email-in tuaj, përdorni kodin më poshtë ose klikoni linkun:</p>
            <div class="code">${code}</div>
            <a href="${verificationUrl}" class="button">Verifikoni Email-in</a>
            <p>Ky kod skadohet brenda 24 orësh.</p>
            <p>Nëse nuk keni regjistruar këtë llogari, ju lutem injoroni këtë mesazh.</p>
            <p>Përshëndetje,<br>AplikoUSA Team</p>
          </div>
        </body>
        </html>
      `;

      await sendTemplateEmail(
        email,
        `Verifikoni Email-in - AplikoUSA`,
        htmlContent
      );

      res.json({ success: true, userId: user.id });
    } catch (error: any) {
      console.error("Signup error:", error);
      res
        .status(500)
        .json({ error: error.message || "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isVerified) {
        return res.status(401).json({ error: "Email not verified" });
      }

      res.locals.data = user;
      res.json(user);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        return res.status(400).json({ error: "Missing userId or code" });
      }

      const verificationCode = await storage.getVerificationCode(userId, code);
      if (!verificationCode) {
        return res
          .status(400)
          .json({ error: "Invalid or expired verification code" });
      }

      await storage.updateUserVerification(userId);
      await storage.deleteVerificationCode(verificationCode.id);

      const user = await storage.getUser(userId);
      res.locals.data = user;
      res.json(user);
    } catch (error: any) {
      console.error("Verification error:", error);
      res
        .status(500)
        .json({ error: error.message || "Verification failed" });
    }
  });

  app.post("/api/auth/resend-verification", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ error: "User already verified" });
      }

      const code = Math.random().toString().slice(2, 8);
      await storage.createVerificationCode({
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const verificationUrl = `https://${req.get("host")}/verify?userId=${user.id}&code=${code}`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
            h1 { color: #0B1B3B; text-align: center; }
            p { color: #555; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 30px; margin: 20px auto; background-color: #E63946; color: white; text-decoration: none; border-radius: 5px; text-align: center; }
            .code { font-size: 24px; font-weight: bold; color: #0B1B3B; text-align: center; letter-spacing: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>AplikoUSA - Email Verification</h1>
            <p>Përshëndetje ${user.firstName},</p>
            <p>Përdorni kodin më poshtë për të verifikuar email-in tuaj:</p>
            <div class="code">${code}</div>
            <a href="${verificationUrl}" class="button">Verifikoni Email-in</a>
            <p>Ky kod skadohet brenda 24 orësh.</p>
          </div>
        </body>
        </html>
      `;

      await sendTemplateEmail(
        user.email,
        `Verifikoni Email-in - AplikoUSA`,
        htmlContent
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Resend verification error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to resend verification" });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Missing email" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const token = Math.random().toString(36).substring(2, 15);
      await storage.createPasswordResetToken(
        user.id,
        token,
        new Date(Date.now() + 60 * 60 * 1000)
      );

      const resetUrl = `https://${req.get("host")}/reset-password?token=${token}`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
            h1 { color: #0B1B3B; text-align: center; }
            p { color: #555; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 30px; margin: 20px auto; background-color: #E63946; color: white; text-decoration: none; border-radius: 5px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>AplikoUSA - Password Reset</h1>
            <p>Përshëndetje ${user.firstName},</p>
            <p>Për të rivendosur fjalëkalimin tuaj, klikoni linkun më poshtë:</p>
            <a href="${resetUrl}" class="button">Rivendosni Fjalëkalimin</a>
            <p>Ky link skadohet brenda 1 ore. Nëse nuk keni kërkuar rivendosje, injoroni këtë mesazh.</p>
          </div>
        </body>
        </html>
      `;

      await sendTemplateEmail(
        email,
        `Rivendosni Fjalëkalimin - AplikoUSA`,
        htmlContent
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Missing token or password" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      await storage.updateUser(resetToken.userId, { password: newPassword });
      await storage.deletePasswordResetToken(resetToken.id);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to reset password" });
    }
  });

  app.get("/api/auth/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.locals.data = user;
      res.json(user);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const user = await storage.updateUser(userId, updates);
      res.locals.data = user;
      res.json(user);
    } catch (error: any) {
      console.error("Update user error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to update user" });
    }
  });

  // Application routes
  app.post("/api/applications", async (req: Request, res: Response) => {
    try {
      const { userId, ...applicationData } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const application = await storage.createApplication({
        userId,
        ...applicationData,
        status: "pending",
      });

      res.json(application);
    } catch (error: any) {
      console.error("Create application error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create application" });
    }
  });

  app.get("/api/applications/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      let application = await storage.getApplication(userId);

      if (!application) {
        // Create default application if it doesn't exist
        application = await storage.createApplication({
          userId,
          status: "pending",
          registrationStatus: "completed",
          paymentStatus: "pending",
          formStatus: "pending",
          photoStatus: "pending",
          submissionStatus: "pending",
        });
      }

      res.locals.data = application;
      res.json(application);
    } catch (error: any) {
      console.error("Get application error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch application" });
    }
  });

  app.patch("/api/applications/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      let application = await storage.getApplication(userId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      application = await storage.updateApplicationStatus(
        application.id,
        updates.status
      );

      res.locals.data = application;
      res.json(application);
    } catch (error: any) {
      console.error("Update application error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to update application" });
    }
  });

  // Get all applications for admin
  app.get("/api/admin/applications", async (req: Request, res: Response) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error: any) {
      console.error("Get applications error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch applications" });
    }
  });

  // Update application steps
  app.post(
    "/api/admin/applications/:id/update-steps",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const steps = req.body;

        const application = await storage.updateApplicationSteps(id, steps);
        
        // If submission status is completed, send professional email to client
        if (steps.submissionStatus === "completed") {
          const client = await storage.getUser(application.userId);
          if (client && client.email) {
            const { sendOfficialSubmissionEmail } = await import("./email");
            await sendOfficialSubmissionEmail(client.email, client.firstName, {
              firstName: client.firstName,
              lastName: client.lastName,
              email: client.email,
              package: client.package,
            });
            console.log("[Update Steps] Official submission email sent to:", client.email);
          }
        }

        res.json(application);
      } catch (error: any) {
        console.error("Update steps error:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to update steps" });
      }
    }
  );

  // Transaction routes
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const { userId, ...transactionData } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const transaction = await storage.createTransaction({
        userId,
        ...transactionData,
      });

      res.json(transaction);
    } catch (error: any) {
      console.error("Create transaction error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create transaction" });
    }
  });

  app.get("/api/transactions/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const transactions = await storage.getTransactions(userId);

      res.locals.data = transactions;
      res.json(transactions);
    } catch (error: any) {
      console.error("Get transactions error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch transactions" });
    }
  });

  // Admin routes
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      console.log("[Admin Login] Request received:", { email: req.body.email });
      const { email, password } = req.body;

      if (!email || !password) {
        console.log("[Admin Login] Missing credentials");
        return res.status(400).json({ error: "Missing email or password" });
      }

      console.log("[Admin Login] Looking up admin:", email);
      const admin = await storage.getAdminByEmail(email);
      console.log("[Admin Login] Admin found:", !!admin);
      
      if (!admin) {
        console.log("[Admin Login] Admin not found");
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const passwordMatch = await storage.verifyAdminPassword(password, admin.password);
      console.log("[Admin Login] Password check:", passwordMatch);
      if (!passwordMatch) {
        console.log("[Admin Login] Password mismatch");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("[Admin Login] Login successful for:", admin.email);
      res.json({ adminId: admin.id, id: admin.id, email: admin.email });
    } catch (error: any) {
      console.error("[Admin Login] Error:", error.message, error);
      res
        .status(500)
        .json({ error: error.message || "Login failed" });
    }
  });

  // Email template routes
  app.get("/api/admin/templates", async (req: Request, res: Response) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Get templates error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch templates" });
    }
  });

  app.post("/api/admin/templates", async (req: Request, res: Response) => {
    try {
      const { name, subject, htmlContent } = req.body;

      if (!name || !subject || !htmlContent) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const template = await storage.createEmailTemplate({
        name,
        subject,
        htmlContent,
      });

      res.json(template);
    } catch (error: any) {
      console.error("Create template error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create template" });
    }
  });

  app.patch("/api/admin/templates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const template = await storage.updateEmailTemplate(id, updates);
      res.json(template);
    } catch (error: any) {
      console.error("Update template error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to update template" });
    }
  });

  app.delete("/api/admin/templates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteEmailTemplate(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete template error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to delete template" });
    }
  });

  // Send email using template
  app.post("/api/admin/send-email", async (req: Request, res: Response) => {
    try {
      const { toEmail, templateId, recipientName } = req.body;

      if (!toEmail || !templateId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

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
  app.post("/api/admin/send-custom-email", async (req: Request, res: Response) => {
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

  // Get all clients
  app.get("/api/admin/clients", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getAllUsers();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Get single client
  app.get("/api/admin/clients/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await storage.getUser(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  // Update client
  app.patch("/api/admin/clients/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const client = await storage.updateUser(id, updates);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  // Delete client
  app.delete("/api/admin/clients/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Admin login as client
  app.post("/api/admin/login-as-client", async (req: Request, res: Response) => {
    try {
      const { clientId } = req.body;
      
      if (!clientId) {
        return res.status(400).json({ error: "Missing clientId" });
      }

      const client = await storage.getUser(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      console.log("[Admin] Logging in as client:", clientId);
      res.json({ success: true, userId: clientId, email: client.email });
    } catch (error: any) {
      console.error("Error login as client:", error);
      res.status(500).json({ error: "Failed to login as client" });
    }
  });

  // Admin Analytics
  app.get("/api/admin/analytics", async (req: Request, res: Response) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allApplications = await storage.getApplications();

      const stats = {
        totalClients: allUsers.length,
        completedPayments: allUsers.filter(u => u.paymentStatus === "completed").length,
        pendingPayments: allUsers.filter(u => u.paymentStatus !== "completed").length,
        totalRevenue: allUsers.filter(u => u.paymentStatus === "completed").reduce((acc, u) => {
          const pkg = u.package;
          const amount = pkg === "individual" ? 20 : pkg === "couple" ? 35 : 50;
          return acc + amount;
        }, 0),
        applications: {
          total: allApplications.length,
          completed: allApplications.filter(a => a.paymentStatus === "completed").length,
          pending: allApplications.filter(a => a.paymentStatus === "pending").length,
        },
        byPackage: {
          individual: allUsers.filter(u => u.package === "individual").length,
          couple: allUsers.filter(u => u.package === "couple").length,
          family: allUsers.filter(u => u.package === "family").length,
        }
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get client transactions
  app.get("/api/admin/clients/:id/transactions", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const transactions = await storage.getTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Process refund
  app.post("/api/admin/refund", async (req: Request, res: Response) => {
    try {
      const { transactionId, reason } = req.body;

      if (!transactionId) {
        return res.status(400).json({ error: "Missing transactionId" });
      }

      // Update transaction status to refunded
      const transaction = await storage.updateTransactionStatus(transactionId, "refunded");
      res.json({ success: true, transaction });
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ error: "Failed to process refund" });
    }
  });

  // Reset client password
  app.post("/api/admin/clients/:id/reset-password", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const newPassword = Math.random().toString(36).substring(2, 10);

      const client = await storage.updateUser(id, { password: newPassword });

      // Send email with new password
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
            h1 { color: #0B1B3B; text-align: center; }
            p { color: #555; line-height: 1.6; }
            .password { font-size: 18px; font-weight: bold; color: #0B1B3B; text-align: center; background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>AplikoUSA - Password Reset</h1>
            <p>Përshëndetje ${client.firstName},</p>
            <p>Administratori i AplikoUSA ka rivendosur fjalëkalimin tuaj:</p>
            <div class="password">${newPassword}</div>
            <p>Ju lutem përdorni këtë fjalëkalim për të hyrë në llogari tuaj dhe ndryshojeni atë në diçka të sigurt.</p>
          </div>
        </body>
        </html>
      `;

      await sendTemplateEmail(client.email, "Fjalëkalimi u Rivendos - AplikoUSA", htmlContent);

      res.json({ success: true, newPassword });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Resend verification email
  app.post("/api/admin/clients/:id/resend-verification", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await storage.getUser(id);

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const code = Math.random().toString().slice(2, 8);
      await storage.createVerificationCode({
        userId: id,
        code,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const verificationUrl = `https://${req.get("host")}/verify?userId=${id}&code=${code}`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
            h1 { color: #0B1B3B; text-align: center; }
            p { color: #555; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 30px; margin: 20px auto; background-color: #E63946; color: white; text-decoration: none; border-radius: 5px; text-align: center; }
            .code { font-size: 24px; font-weight: bold; color: #0B1B3B; text-align: center; letter-spacing: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>AplikoUSA - Email Verification</h1>
            <p>Përshëndetje ${client.firstName},</p>
            <p>Administratori i AplikoUSA ka kërkuar ri-dërgimin e linkut të verifikimit:</p>
            <div class="code">${code}</div>
            <a href="${verificationUrl}" class="button">Verifikoni Email-in</a>
            <p>Ky kod skadohet brenda 24 orësh.</p>
          </div>
        </body>
        </html>
      `;

      await sendTemplateEmail(client.email, "Verifikoni Email-in - AplikoUSA", htmlContent);

      res.json({ success: true });
    } catch (error) {
      console.error("Error resending verification:", error);
      res.status(500).json({ error: "Failed to resend verification" });
    }
  });

  // Toggle account disable
  app.post("/api/admin/clients/:id/toggle-account", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await storage.getUser(id);

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // For now, we can use a field to track disabled status
      // You might want to add an `isDisabled` or `isActive` field to the user schema
      const updated = await storage.updateUser(id, {
        isVerified: !client.isVerified // Using this as a proxy for now
      });

      res.json({ success: true, user: updated });
    } catch (error) {
      console.error("Error toggling account:", error);
      res.status(500).json({ error: "Failed to toggle account" });
    }
  });

  // Export clients to CSV
  app.get("/api/admin/export-csv", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getAllUsers();

      let csv = "First Name,Last Name,Email,Phone,City,Birth Country,Package,Payment Status,Created At\n";
      clients.forEach(client => {
        csv += `"${client.firstName}","${client.lastName}","${client.email}","${client.phone}","${client.city}","${client.birthCountry}","${client.package}","${client.paymentStatus}","${client.createdAt}"\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=clients.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // Update user activity (when they log in or access dashboard)
  app.post("/api/users/:id/activity", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.updateUser(id, {
        lastActivityAt: new Date(),
        isOnline: true,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ error: "Failed to update activity" });
    }
  });

  // Set user offline
  app.post("/api/users/:id/offline", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.updateUser(id, { isOnline: false });
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting offline:", error);
      res.status(500).json({ error: "Failed to set offline" });
    }
  });

  // Get application confirmation document (HTML for PDF)
  app.get("/api/documents/:userId/confirmation", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params as { userId: string };

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let application = await storage.getApplication(userId);
      if (!application) {
        // Create default application if it doesn't exist
        application = await storage.createApplication({
          userId,
          status: "pending",
          registrationStatus: "completed",
          paymentStatus: "pending",
          formStatus: "pending",
          photoStatus: "pending",
          submissionStatus: "pending",
        });
      }

      const html = generateApplicationConfirmationHTML(
        user,
        application,
        application?.photoUrl || ""
      );
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error) {
      console.error("Error generating confirmation document:", error);
      res.status(500).json({ error: "Failed to generate document" });
    }
  });


  // Webhook for Stripe events
  app.post("/api/stripe/webhook/:webhookId", async (req: Request, res: Response) => {
    try {
      const sig = req.headers["stripe-signature"] as string;
      const event = getStripe().webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );

      console.log("Stripe webhook event:", event.type);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;

        if (userId) {
          const user = await storage.getUser(userId);
          if (user) {
            // Update user payment status
            await storage.updateUserStripeInfo(userId, {
              paymentStatus: "completed",
            });

            // Update or create application
            let application = await storage.getApplication(userId);
            if (application) {
              await storage.updateApplicationSteps(application.id, {
                paymentStatus: "completed",
                formStatus: "completed",
              });
            } else {
              await storage.createApplication({
                userId,
                status: "reviewing",
                registrationStatus: "completed",
                paymentStatus: "completed",
                formStatus: "completed",
                photoStatus: "pending",
                submissionStatus: "pending",
              });
            }
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send("Webhook Error");
    }
  });

  // Payment success endpoint
  app.post("/api/payment-success", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update payment status on user
      await storage.updateUserStripeInfo(userId, {
        paymentStatus: "completed",
      });

      // Update or create application with payment status completed
      try {
        let application = await storage.getApplication(userId);
        if (application) {
          // Update existing application
          await storage.updateApplicationSteps(application.id, {
            paymentStatus: "completed",
            formStatus: "completed",
          });
        } else {
          // Create new application if doesn't exist
          await storage.createApplication({
            userId,
            status: "reviewing",
            registrationStatus: "completed",
            paymentStatus: "completed",
            formStatus: "completed",
            photoStatus: "pending",
            submissionStatus: "pending",
          });
        }
      } catch (appError) {
        console.error("Error updating application:", appError);
        // Continue with email even if app update fails
      }

      // Send payment success email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
            h1 { color: #0B1B3B; text-align: center; }
            p { color: #555; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 30px; margin: 20px auto; background-color: #E63946; color: white; text-decoration: none; border-radius: 5px; text-align: center; }
            .status { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>AplikoUSA - Pagesa e Pranuar</h1>
            <div class="status">✓ Pagesa Përfunduar me Sukses</div>
            <p>Përshëndetje ${user.firstName},</p>
            <p>Faleminderit! Pagesa juaj për ${user.package} paketë ($${user.package === "individual" ? 20 : user.package === "couple" ? 35 : 50}) u pranua me sukses!</p>
            <p>Tani mund të shikoni statusin e aplikimit tuaj në dashboard dhe të plotësoni formularin e nevojshëm.</p>
            <a href="https://${req.get("host")}/dashboard" class="button">Shko në Dashboard</a>
            <p>Nëse keni pyetje, na kontaktoni në info@aplikousa.com</p>
          </div>
        </body>
        </html>
      `;

      await sendTemplateEmail(
        user.email,
        "Pagesa e Pranuar - AplikoUSA",
        htmlContent
      );

      res.json({ success: true, message: "Payment processed successfully" });
    } catch (error: any) {
      console.error("Payment success error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to process payment" });
    }
  });

  // Create checkout session with amount
  app.post("/api/create-checkout", async (req: Request, res: Response) => {
    try {
      const { userId, packageType } = req.body;

      if (!userId || !packageType) {
        return res.status(400).json({ error: "Missing userId or packageType" });
      }

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
  app.get("/api/stripe/publishable-key", async (req: Request, res: Response) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error getting publishable key:", error);
      res.status(500).json({ error: "Failed to get publishable key" });
    }
  });

  app.post("/api/checkout", async (req: Request, res: Response) => {
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
        await storage.updateUserStripeInfo(user.id, {
          stripeCustomerId: customer.id,
        });
        customerId = customer.id;
      }

      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${process.env.REPLIT_DOMAINS || "localhost:5000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        `${process.env.REPLIT_DOMAINS || "localhost:5000"}/checkout/cancel`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

}
