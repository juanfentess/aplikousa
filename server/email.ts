// Resend integration for sending emails
// Based on Replit's Resend connector blueprint

import { Resend } from "resend";

let connectionSettings: any;
let resendClient: Resend | null = null;

async function getResendCredentials() {
  if (connectionSettings) {
    return connectionSettings;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    throw new Error("Resend credentials not available");
  }

  const response = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  );

  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }

  return connectionSettings;
}

async function getResendClient() {
  const credentials = await getResendCredentials();
  // Create a new client each time to ensure fresh tokens
  return {
    client: new Resend(credentials.settings.api_key),
    fromEmail: "noreply@aplikousa.com", // Using verified domain
  };
}

export async function sendVerificationEmail(
  toEmail: string,
  code: string,
  userName: string
): Promise<{ success: boolean; code: string }> {
  try {
    const { client, fromEmail } = await getResendClient();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0B1B3B 0%, #E63946 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">AplikoUSA</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 20px;">
                    <h2 style="color: #0B1B3B; font-size: 20px; margin: 0 0 20px 0; font-weight: bold;">Përshëndetje ${userName}!</h2>
                    
                    <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Për të përfunduar regjistrimin tuaj në AplikoUSA, ju duhet të verifikoni adresën tuaj të email-it.
                    </p>
                    
                    <!-- Code Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border: 2px solid #E63946; border-radius: 8px; margin: 30px 0;">
                      <tr>
                        <td style="padding: 30px; text-align: center;">
                          <p style="color: #999; font-size: 12px; margin: 0 0 15px 0; font-weight: bold;">KODI I VERIFIKIMIT TUAJ</p>
                          <div style="font-size: 48px; font-weight: bold; color: #E63946; letter-spacing: 8px; margin: 0; font-family: monospace;">
                            ${code.split("").join(" ")}
                          </div>
                          <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">Ky kod skadohet në 15 minuta</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Instructions -->
                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 20px 0; text-align: center;">
                      Shënohet kodin më sipër në faqen e verifikimit të AplikoUSA.
                    </p>
                    
                    <!-- Disclaimer -->
                    <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                      Nëse nuk kërkuat këtë kod, ju lutem injorohe këtë email. Pas 15 minutash, kodi do të zhduket.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      © 2025 AplikoUSA. Të gjitha të drejtat e rezervuara.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    console.log(`[EMAIL] Attempting to send verification email to ${toEmail} from ${fromEmail}`);

    const response = await client.emails.send({
      from: `AplikoUSA <${fromEmail}>`,
      to: toEmail,
      subject: "Verifikoni adresën tuaj në AplikoUSA",
      html: htmlContent,
      replyTo: "info@aplikousa.com",
    });

    console.log(`[EMAIL] Send response:`, response);

    const success = !!response.data?.id;
    console.log(`[EMAIL] Success: ${success}, Returning code for testing: ${code}`);
    
    // Return code for development/testing purposes
    return { success, code };
  } catch (error) {
    console.error("[EMAIL] Error sending verification email:", error);
    // For development: still return the code so user can verify
    return { success: false, code };
  }
}

export async function sendTemplateEmail(
  toEmail: string,
  templateContent: string,
  templateSubject: string,
  recipientName: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();

    // Replace placeholders in template
    const htmlContent = templateContent
      .replace(/\{recipientName\}/g, recipientName)
      .replace(/\{date\}/g, new Date().toLocaleDateString("sq-AL"));

    const subject = templateSubject.replace(/\{recipientName\}/g, recipientName);

    const response = await client.emails.send({
      from: `AplikoUSA <${fromEmail}>`,
      to: toEmail,
      subject,
      html: htmlContent,
      replyTo: "info@aplikousa.com",
    });

    return !!response.data?.id;
  } catch (error) {
    console.error("Error sending template email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetLink: string,
  userName: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();

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
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .warning-box p { margin: 0; color: #856404; font-size: 14px; }
          .reset-box { background-color: #0B1B3B; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
          .reset-link { display: inline-block; background-color: #E63946; color: white; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-weight: 700; margin: 15px 0; }
          .reset-link:hover { background-color: #d12a3a; }
          .info-text { color: #555; font-size: 14px; line-height: 1.6; margin: 20px 0; }
          .footer { background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
          .footer p { margin: 8px 0; }
          .divider { height: 1px; background-color: #eee; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Rivendos Fjalëkalimin</h1>
          </div>
          <div class="content">
            <p style="color: #0B1B3B; font-size: 16px; margin: 0 0 20px 0;">Përshëndetje ${userName},</p>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Keni kërkuar të rivendosni fjalëkalimin tuaj. Nëse nuk e bëtë këtë kërkesë, mund ta injorohet këtë email.
            </p>

            <div class="reset-box">
              <p style="color: white; margin: 0 0 15px 0; font-size: 14px;">Klikoni butonin më poshtë për të rivendosur fjalëkalimin tuaj:</p>
              <a href="${resetLink}" class="reset-link">Rivendos Fjalëkalimin</a>
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 15px 0 0 0;">Kjo lidhje do të skadojë në 1 orë</p>
            </div>

            <div class="warning-box">
              <p>⚠️ Nëse nuk keni kërkuar këtë, ju lutemi injorojeni emailin. Ju duhet ta ndryshoni fjalëkalimin tuaj vetëm nëse dyshimet se ka qenë i kompromentuar.</p>
            </div>

            <div class="divider"></div>

            <p style="color: #666; font-size: 12px; text-align: center; margin: 20px 0;">
              Ose kopjoni këtë lidhje në shfletuesin tuaj:<br>
              <span style="word-break: break-all; color: #0B1B3B;">${resetLink}</span>
            </p>
          </div>
          <div class="footer">
            <p>AplikoUSA - Green Card DV Lottery Application Services</p>
            <p>© 2025 AplikoUSA. Të gjitha të drejtat e rezervuara.</p>
            <p>info@aplikousa.com | +383 49 771 673</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await client.emails.send({
      from: `AplikoUSA <${fromEmail}>`,
      to: toEmail,
      subject: "Rivendos Fjalëkalimin - AplikoUSA",
      html: htmlContent,
      replyTo: "info@aplikousa.com",
    });

    return !!response.data?.id;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

export async function sendOfficialSubmissionEmail(
  toEmail: string,
  userName: string,
  applicationData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    package?: string;
    createdAt?: string;
  }
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();

    const packageName = applicationData.package === "individual" ? "Individuale" : 
                       applicationData.package === "couple" ? "Çifti" : 
                       applicationData.package === "family" ? "Familja" : "Pakete e Zgjedhur";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0B1B3B 0%, #E63946 100%); padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
          .content { padding: 40px 20px; }
          .content h2 { color: #0B1B3B; font-size: 22px; margin: 0 0 20px 0; }
          .status-box { background: linear-gradient(135deg, rgba(11, 27, 59, 0.05) 0%, rgba(230, 57, 70, 0.05) 100%); border-left: 4px solid #0B1B3B; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .status-badge { display: inline-block; background-color: #0B1B3B; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 12px; }
          .details-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .details-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .details-table td:first-child { width: 35%; font-weight: bold; color: #0B1B3B; }
          .checkmark { display: inline-block; width: 24px; height: 24px; background-color: #28a745; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 10px; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          .button { display: inline-block; background-color: #0B1B3B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Dorëzim i Përfunduar</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Aplikimi juaj është dorëzuar zyrtarisht</p>
          </div>

          <div class="content">
            <h2>Përshëndetje ${userName}!</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Këtë email ju dërgojmë për të konfirmuar që aplikimi juaj për Green Card DV Lottery është dorëzuar me sukses zyrtarisht. 
              Jemi të përqendruar të përfundojmë këtë proces me sukses për ju.
            </p>

            <div class="status-box">
              <p style="margin: 0 0 15px 0;">
                <span class="checkmark">✓</span>
                <strong>Statusi i Dorëzimit:</strong>
              </p>
              <div style="margin-left: 34px;">
                <p style="margin: 8px 0; color: #0B1B3B;">
                  <span class="status-badge">DORËZIM I ZYRTARISHT PËRFUNDUAR</span>
                </p>
              </div>
            </div>

            <h3 style="color: #0B1B3B; margin: 30px 0 15px 0; font-size: 16px;">Detajet e Aplikimit</h3>
            <table class="details-table">
              <tr>
                <td>Emri Plotë:</td>
                <td>${applicationData.firstName || ''} ${applicationData.lastName || ''}</td>
              </tr>
              <tr>
                <td>Paketa e Zgjedhur:</td>
                <td>${packageName}</td>
              </tr>
              <tr>
                <td>Email Kontakti:</td>
                <td>${toEmail}</td>
              </tr>
              <tr>
                <td>Data e Dorëzimit:</td>
                <td>${new Date().toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
            </table>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 30px 0;">
              <h4 style="color: #0B1B3B; margin: 0 0 10px 0;">Çfarë ndodh tani?</h4>
              <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
                <li>Ekipi ynë do të rishikojë aplikimin tuaj me kujdes</li>
                <li>Mund të kontaktohemi me pyetje ose për informacione shtesë</li>
                <li>Ju do të informoheni për çdo azhurnim të aplikimit tuaj</li>
                <li>Procesi tipikisht përfundon brenda 30-60 ditësh</li>
              </ul>
            </div>

            <p style="color: #0B1B3B; font-size: 14px; font-weight: bold; text-align: center; margin: 30px 0 0 0;">
              Faleminderit për zgjedhjen e AplikoUSA!
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>AplikoUSA</strong></p>
            <p style="margin: 0 0 10px 0;">Green Card DV Lottery Application Services</p>
            <p style="margin: 0 0 10px 0;">📧 info@aplikousa.com | 📞 +383 49 771 673</p>
            <p style="margin: 10px 0 0 0; color: #999;">© 2025 AplikoUSA. Të gjitha të drejtat e rezervuara.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await client.emails.send({
      from: `AplikoUSA <${fromEmail}>`,
      to: toEmail,
      subject: "✅ Dorëzim i Përfunduar - Aplikimi Juaj është Dorëzuar Zyrtarisht",
      html: htmlContent,
      replyTo: "info@aplikousa.com",
    });

    console.log("[Official Submission Email] Sent to:", toEmail);
    return !!response.data?.id;
  } catch (error) {
    console.error("Error sending official submission email:", error);
    return false;
  }
}
