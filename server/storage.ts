import { db } from "./db";
import {
  users,
  verificationCodes,
  passwordResetTokens,
  emailTemplates,
  admins,
  applications,
  transactions,
  activityLogs,
  emailLogs,
} from "@shared/schema";
import {
  type User,
  type InsertUser,
  type VerificationCode,
  type InsertVerificationCode,
  type EmailTemplate,
  type InsertEmailTemplate,
  type Admin,
  type InsertAdmin,
  type Application,
  type InsertApplication,
  type Transaction,
  type InsertTransaction,
  type ActivityLog,
  type InsertActivityLog,
  type EmailLog,
  type InsertEmailLog,
} from "@shared/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserVerification(userId: string): Promise<void>;
  updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string; paymentStatus?: string }): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  deleteUser(userId: string): Promise<void>;

  // Verification codes
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(userId: string, code: string): Promise<VerificationCode | undefined>;
  deleteVerificationCode(id: string): Promise<void>;

  // Password reset
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<any>;
  getPasswordResetToken(token: string): Promise<any | undefined>;
  deletePasswordResetToken(id: string): Promise<void>;

  // Email templates
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplate(name: string): Promise<EmailTemplate | undefined>;
  getEmailTemplateById(id: string): Promise<EmailTemplate | undefined>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: string): Promise<void>;

  // Admins
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  verifyAdminPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;

  // Applications
  createApplication(app: InsertApplication): Promise<Application>;
  getApplication(userId: string): Promise<Application | undefined>;
  getApplications(): Promise<Application[]>;
  updateApplicationStatus(id: string, status: string): Promise<Application>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction>;

  // Stripe
  getProduct(productId: string): Promise<any>;
  getSubscription(subscriptionId: string): Promise<any>;

  // Activity logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;

  // Email logs
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(limit?: number): Promise<EmailLog[]>;

  // Analytics
  getAnalytics(): Promise<any>;
  getAllTransactions(): Promise<Transaction[]>;
}

export class Storage implements IStorage {
  // Users
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async updateUserVerification(userId: string): Promise<void> {
    await db.update(users).set({ isVerified: true }).where(eq(users.id, userId));
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string; paymentStatus?: string }): Promise<User> {
    const result = await db.update(users).set(stripeInfo).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  // Verification codes
  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    const result = await db.insert(verificationCodes).values(code).returning();
    return result[0];
  }

  async getVerificationCode(userId: string, code: string): Promise<VerificationCode | undefined> {
    const result = await db
      .select()
      .from(verificationCodes)
      .where(and(eq(verificationCodes.userId, userId), eq(verificationCodes.code, code)));
    return result[0];
  }

  async deleteVerificationCode(id: string): Promise<void> {
    await db.delete(verificationCodes).where(eq(verificationCodes.id, id));
  }

  // Password reset tokens
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<any> {
    // Delete any existing tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    // Create new token
    const result = await db.insert(passwordResetTokens).values({ userId, token, expiresAt }).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<any | undefined> {
    const result = await db.select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      ));
    return result[0];
  }

  async deletePasswordResetToken(id: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, id));
  }

  // Email templates
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const result = await db.insert(emailTemplates).values(template).returning();
    return result[0];
  }

  async getEmailTemplate(name: string): Promise<EmailTemplate | undefined> {
    const result = await db.select().from(emailTemplates).where(eq(emailTemplates.name, name));
    return result[0];
  }

  async getEmailTemplateById(id: string): Promise<EmailTemplate | undefined> {
    const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return result[0];
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).where(eq(emailTemplates.isActive, true));
  }

  async updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const result = await db
      .update(emailTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // Admins
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const result = await db.insert(admins).values({
      ...admin,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.email, email));
    return result[0];
  }

  async verifyAdminPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Applications
  async createApplication(app: InsertApplication): Promise<Application> {
    const result = await db.insert(applications).values(app).returning();
    return result[0];
  }

  async getApplication(userId: string): Promise<Application | undefined> {
    const result = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));
    return result[0];
  }

  async getApplications(): Promise<Application[]> {
    return await db.select().from(applications);
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const result = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return result[0];
  }

  async updateApplicationSteps(id: string, steps: {
    registrationStatus?: string;
    paymentStatus?: string;
    formStatus?: string;
    photoStatus?: string;
    submissionStatus?: string;
  }): Promise<Application> {
    const result = await db
      .update(applications)
      .set({ ...steps, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return result[0];
  }

  // Transactions
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction> {
    const result = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return result[0];
  }

  // Stripe operations - query from stripe schema
  async getProduct(productId: string): Promise<any> {
    try {
      const result = await db.execute(`SELECT * FROM stripe.products WHERE id = '${productId}' LIMIT 1`);
      return (result as any).rows?.[0] || null;
    } catch {
      return null;
    }
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const result = await db.execute(`SELECT * FROM stripe.subscriptions WHERE id = '${subscriptionId}' LIMIT 1`);
      return (result as any).rows?.[0] || null;
    } catch {
      return null;
    }
  }

  // Activity logs
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs).values(log).returning();
    return result[0];
  }

  async getActivityLogs(limit = 100): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  // Email logs
  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const result = await db.insert(emailLogs).values(log).returning();
    return result[0];
  }

  async getEmailLogs(limit = 100): Promise<EmailLog[]> {
    return await db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(limit);
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    const totalUsers = await db.select().from(users);
    const paidUsers = totalUsers.filter(u => u.paymentStatus === "completed");
    const allTransactions = await db.select().from(transactions).where(eq(transactions.status, "completed"));
    
    const revenueByPackage = {
      individual: allTransactions.filter(t => t.packageType === "individual").reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
      couple: allTransactions.filter(t => t.packageType === "couple").reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
      family: allTransactions.filter(t => t.packageType === "family").reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
    };

    const appList = await db.select().from(applications);
    const applicationsByStatus = {
      pending: appList.filter(a => a.submissionStatus === "pending").length,
      inProgress: appList.filter(a => a.submissionStatus === "in_progress").length,
      completed: appList.filter(a => a.submissionStatus === "completed").length,
    };

    return {
      totalClients: totalUsers.length,
      paidClients: paidUsers.length,
      pendingClients: totalUsers.filter(u => u.paymentStatus === "pending").length,
      conversionRate: totalUsers.length > 0 ? ((paidUsers.length / totalUsers.length) * 100).toFixed(2) : "0",
      totalRevenue: Object.values(revenueByPackage).reduce((a, b) => a + b, 0),
      revenueByPackage,
      applicationsByStatus,
      transactionCount: allTransactions.length,
    };
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }
}

export const storage = new Storage();
