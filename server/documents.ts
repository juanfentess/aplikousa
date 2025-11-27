// Document generation functions for creating PDFs

export function generateApplicationConfirmationHTML(user: any, application: any): string {
  const today = new Date().toLocaleDateString("sq-AL", { year: "numeric", month: "long", day: "numeric" });
  
  return `
    <!DOCTYPE html>
    <html lang="sq">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmimi i Aplikimit</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: #333; }
        .page { width: 210mm; height: 297mm; margin: 0 auto; padding: 20mm; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30mm; border-bottom: 3px solid #0B1B3B; padding-bottom: 15mm; }
        .logo { font-size: 32px; font-weight: bold; color: #0B1B3B; margin-bottom: 5mm; }
        .logo span { color: #E63946; }
        .subtitle { color: #666; font-size: 12px; margin-top: 5mm; }
        .confirmation-title { text-align: center; font-size: 24px; font-weight: bold; color: #0B1B3B; margin: 20mm 0; }
        .content { margin: 20mm 0; }
        .section { margin-bottom: 15mm; }
        .section-title { font-size: 14px; font-weight: bold; color: #0B1B3B; margin-bottom: 8mm; padding-bottom: 5mm; border-bottom: 2px solid #E63946; }
        .info-row { display: flex; margin-bottom: 6mm; }
        .info-label { font-weight: bold; color: #0B1B3B; width: 40mm; }
        .info-value { flex: 1; color: #555; }
        .confirmation-box { background: #f0f7ff; border-left: 5px solid #0B1B3B; padding: 12mm; margin: 15mm 0; border-radius: 4px; }
        .confirmation-box p { color: #0B1B3B; line-height: 1.6; margin-bottom: 5mm; }
        .footer { margin-top: 30mm; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 10mm; }
        .reference-number { background: #0B1B3B; color: white; padding: 8mm; border-radius: 4px; text-align: center; margin: 15mm 0; font-weight: bold; }
        .date { text-align: right; color: #666; font-size: 11px; margin-bottom: 20mm; }
        table { width: 100%; border-collapse: collapse; margin: 10mm 0; }
        td { padding: 6mm; border-bottom: 1px solid #ddd; }
        td:first-child { font-weight: bold; color: #0B1B3B; width: 50%; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="date">${today}</div>
        
        <div class="header">
          <div class="logo">Apliko<span>USA</span></div>
          <div class="subtitle">Green Card DV Lottery Application Services</div>
        </div>

        <h1 class="confirmation-title">✓ KONFIRMIMI I APLIKIMIT</h1>

        <div class="reference-number">
          Referenca: ${application.id.slice(0, 8).toUpperCase()}
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Të Dhënat e Aplikantit</div>
            <div class="info-row">
              <div class="info-label">Emër i Plotë:</div>
              <div class="info-value">${user.firstName} ${user.lastName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${user.email}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Telefon:</div>
              <div class="info-value">${user.phone || "—"}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Qytet:</div>
              <div class="info-value">${user.city || "—"}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Vendi i Lindjes:</div>
              <div class="info-value">${user.birthCountry || "—"}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Detalet e Aplikimit</div>
            <div class="info-row">
              <div class="info-label">Paketa:</div>
              <div class="info-value">
                ${user.package === "individual" ? "Paket Individuale" : user.package === "couple" ? "Paket për Çifte" : "Paket Familjare"}
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">Data Aplikimit:</div>
              <div class="info-value">${new Date(application.createdAt).toLocaleDateString("sq-AL")}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Statusi:</div>
              <div class="info-value">
                ${application.status === "pending" ? "Në Pritje" : application.status === "approved" ? "Apruvuar" : "Refuzuar"}
              </div>
            </div>
          </div>

          <div class="confirmation-box">
            <p><strong>Konfirmim i Marrimit të Aplikimit</strong></p>
            <p>Kjo është për të konfirmuar që aplikimi juaj për Green Card DV Lottery u mor dhe u regjistrua në sistemin tonë. Ju lutemi të dërgoni fotogjrafinë tuaj sipas specifikimeve të dhëna dhe të plotësoni deklaratën e saktësisë.</p>
            <p><strong>Statusi i Aplikimit:</strong> Aplikimi juaj po përpunohet. Do të marrin njoftim kur të ketë përditësime të reja.</p>
          </div>

          <div class="section">
            <div class="section-title">Hapat e Ardhshëm</div>
            <table>
              <tr>
                <td>1. Dërgimi i Fotografisë</td>
                <td>Dërgoni fotografinë sipas standardeve të dhënave</td>
              </tr>
              <tr>
                <td>2. Plotësimi i Formularit</td>
                <td>Plotësoni të gjithë të dhënat e kërkuara</td>
              </tr>
              <tr>
                <td>3. Kontrolli i Foto-s</td>
                <td>Ne do të verifikojmë fotografinë tuaj</td>
              </tr>
              <tr>
                <td>4. Dorëzimi Zyrtar</td>
                <td>Aplikimi do të dorëzohet zyrarisht</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="footer">
          <p>AplikoUSA - Green Card DV Lottery Application Services</p>
          <p>info@aplikousa.com | +383 44 000 000</p>
          <p>© 2025 AplikoUSA. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateDeclarationHTML(user: any, application: any): string {
  const today = new Date().toLocaleDateString("sq-AL", { year: "numeric", month: "long", day: "numeric" });
  
  return `
    <!DOCTYPE html>
    <html lang="sq">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deklarata e Saktësisë</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: #333; line-height: 1.8; }
        .page { width: 210mm; height: 297mm; margin: 0 auto; padding: 20mm; background: white; }
        .header { text-align: center; margin-bottom: 25mm; }
        .logo { font-size: 28px; font-weight: bold; color: #0B1B3B; margin-bottom: 8mm; }
        .logo span { color: #E63946; }
        .title { font-size: 18px; font-weight: bold; color: #0B1B3B; margin: 20mm 0; text-align: center; text-transform: uppercase; }
        .declaration-content { margin: 20mm 0; text-align: justify; }
        .paragraph { margin-bottom: 12mm; text-align: justify; text-indent: 0; line-height: 1.7; font-size: 11px; }
        .paragraph strong { color: #0B1B3B; }
        .signatory { margin-top: 30mm; }
        .sign-line { margin-top: 20mm; padding-top: 5mm; border-top: 1px solid #333; }
        .sign-label { font-size: 10px; color: #666; margin-top: 3mm; }
        .date-line { margin: 15mm 0; font-size: 11px; }
        .footer { margin-top: 40mm; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10mm; }
        .reference { background: #f5f5f5; padding: 8mm; border-radius: 4px; margin: 15mm 0; font-size: 10px; }
        .certification-box { background: #f0f7ff; border-left: 4px solid #0B1B3B; padding: 12mm; margin: 15mm 0; }
        .certification-box p { font-size: 10px; line-height: 1.6; margin-bottom: 5mm; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="logo">Apliko<span>USA</span></div>
        </div>

        <h1 class="title">Deklarata e Saktësisë</h1>

        <div class="reference">
          <strong>Këndveshtar:</strong> ${user.firstName} ${user.lastName}<br>
          <strong>Email:</strong> ${user.email}<br>
          <strong>Referenca e Aplikimit:</strong> ${application.id.slice(0, 8).toUpperCase()}<br>
          <strong>Data:</strong> ${today}
        </div>

        <div class="declaration-content">
          <p class="paragraph">
            <strong>Unë, ${user.firstName} ${user.lastName}</strong>, i nënshkruaj këtë deklaratë me të mirën time dhe në përputhje me ligjin. Unë deklaroj në përnjimje se:
          </p>

          <p class="paragraph">
            1. Të gjithë të dhënat që kam dhënë në këtë aplikim për Green Card DV Lottery janë të sakta, të plota dhe të vërteta sipas diturisë dhe besimit tim më të mirë.
          </p>

          <p class="paragraph">
            2. Unë nuk kam shtrembëruar, fshehur ose mohuar ndonjë informacion material në këtë aplikim dhe në të gjitha dokumentet përcjellëse të mij.
          </p>

          <p class="paragraph">
            3. Fotografija e bashkëngjitur në këtë aplikim është fotografia ime aktuale dhe përputhet me kërkesat dhe standardet e specifikuara nga programi i Green Card DV Lottery.
          </p>

          <p class="paragraph">
            4. Unë jam ndërgjegjëshem se falsifikimi ose dhënia e informatave të rreme në këtë aplikim mund të rezultojë në penalitete ligjore, përfshirë refuzimin e përjetshëm për të marrë një Green Card dhe dëbimin nga Shtetet e Bashkuara të Amerikës.
          </p>

          <p class="paragraph">
            5. Unë e kuptoj se AplikoUSA është një kompani e palës tretë që ndihmon në përpilimin dhe dorëzimin e aplikimit, dhe se ajo nuk është agjensia qeveritare zyrtare e Departamentit të Shtetit të SHBA.
          </p>

          <p class="paragraph">
            6. Unë përjashtohem përgjegjësinë e AplikoUSA për ndonjë vendim të marrë nga SHBA në lidhje me aplikimin tim dhe unë kuptoj se SHBA mund ta refuzojë aplikimin për cilindo arsye sipas gjykimit të tyre.
          </p>

          <p class="paragraph">
            7. I kuptoj plotësisht të gjithë shpjegimet dhe këshillat e dhënë mua në lidhje me Programin e Hyrjes së Loterisë të Green Card dhe praktikat e sjelljes sipas ligjit.
          </p>

          <div class="certification-box">
            <p><strong>Këtij deklarate i besojmë dhe e nënshkruajmë me përgjegjësi plotë personal.</strong> Unë e di se nuk është e ligjshme dhe se mund të penalizohem sipas ligjeve federale të SHBA për ndonjë shpjegim të rreme.</p>
          </div>
        </div>

        <div class="signatory">
          <div class="date-line">
            <strong>Data:</strong> ${today}
          </div>

          <div style="margin: 30mm 0;">
            <p style="margin-bottom: 20mm;"><strong>Nënshkrimi:</strong></p>
            <div class="sign-line"></div>
            <div class="sign-label">${user.firstName} ${user.lastName}</div>
          </div>
        </div>

        <div class="footer">
          <p>AplikoUSA - Green Card DV Lottery Application Services</p>
          <p>info@aplikousa.com | +383 44 000 000 | www.aplikousa.com</p>
          <p>© 2025 AplikoUSA. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
