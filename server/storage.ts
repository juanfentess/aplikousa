import { db } from "./db";
import {
  users,
  verificationCodes,
  emailTemplates,
  admins,
  applications,
  transactions,
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
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  updateUserVerification(userId: string): Promise<void>;
  updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string; paymentStatus?: string }): Promise<User>;

  // Verification codes
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(userId: string, code: string): Promise<VerificationCode | undefined>;
  deleteVerificationCode(id: string): Promise<void>;

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
    const result = await db.insert(admins).values(admin).returning();
    return result[0];
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.email, email));
    return result[0];
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
}

export const storage = new Storage();
