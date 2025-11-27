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
    fromEmail: credentials.settings.from_email,
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0B1B3B 0%, #E63946 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AplikoUSA</h1>
        </div>
        <div style="background: #f8f9fa; padding: 40px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0B1B3B; margin-top: 0;">Përshëndetje ${userName}! 👋</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Për të përfunduar regjistrimin tuaj në AplikoUSA, ju duhet të verifikoni adresën tuaj të email-it.
          </p>
          <div style="background: white; border: 2px solid #E63946; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; margin: 0 0 15px 0;">Kodi i verifikimit tuaj</p>
            <div style="font-size: 48px; font-weight: bold; color: #E63946; letter-spacing: 10px; margin: 0;">
              ${code.split("").join(" ")}
            </div>
            <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">Ky kod skadohet në 15 minuta</p>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            Nëse nuk kërkuat këtë kod, mund ta injorohe këtë email.
          </p>
        </div>
      </div>
    `;

    console.log(`[EMAIL] Attempting to send verification email to ${toEmail} from ${fromEmail}`);

    const response = await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Verifikoni adresën tuaj në AplikoUSA",
      html: htmlContent,
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
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    return !!response.data?.id;
  } catch (error) {
    console.error("Error sending template email:", error);
    return false;
  }
}
