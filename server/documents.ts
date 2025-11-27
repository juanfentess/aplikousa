// Document generation functions for creating professional PDFs

export function generateApplicationConfirmationHTML(user: any, application: any, photoUrl?: string): string {
  const today = new Date().toLocaleDateString("sq-AL", { year: "numeric", month: "long", day: "numeric" });
  const time = new Date().toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
  
  return `
    <!DOCTYPE html>
    <html lang="sq">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmimi i Aplikimit</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; background: white; color: #222; line-height: 1.4; }
        .page { width: 210mm; height: 297mm; margin: 0 auto; padding: 18mm; background: white; page-break-after: always; }
        .header { text-align: center; margin-bottom: 20mm; border-bottom: 3px solid #0B1B3B; padding-bottom: 12mm; }
        .logo-section { display: flex; align-items: center; justify-content: center; gap: 10mm; margin-bottom: 8mm; }
        .logo { font-size: 36px; font-weight: bold; }
        .logo-text { color: #0B1B3B; }
        .logo-span { color: #E63946; }
        .subtitle { color: #555; font-size: 11px; margin-top: 3mm; font-weight: 500; }
        .confirmation-title { text-align: center; font-size: 22px; font-weight: bold; color: #0B1B3B; margin: 18mm 0 12mm 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .content { margin: 15mm 0; }
        .section { margin-bottom: 12mm; }
        .section-title { font-size: 12px; font-weight: bold; color: white; background: #0B1B3B; margin-bottom: 8mm; padding: 8mm; border-radius: 3px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm 12mm; margin-bottom: 8mm; }
        .info-block { }
        .info-label { font-weight: bold; color: #0B1B3B; font-size: 10px; margin-bottom: 2mm; }
        .info-value { color: #333; font-size: 11px; border-bottom: 1px dotted #ccc; padding-bottom: 2mm; }
        .photo-section { text-align: center; margin: 15mm 0; padding: 10mm; background: #f5f5f5; border: 2px dashed #0B1B3B; }
        .photo-section h4 { font-size: 10px; color: #0B1B3B; margin-bottom: 8mm; font-weight: bold; }
        .photo-image { max-width: 80mm; max-height: 100mm; border: 2px solid #0B1B3B; }
        .confirmation-box { background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-left: 5px solid #E63946; padding: 10mm; margin: 12mm 0; border-radius: 3px; }
        .confirmation-box p { color: #0B1B3B; font-size: 10px; line-height: 1.5; margin-bottom: 4mm; }
        .footer { margin-top: 20mm; text-align: center; font-size: 9px; color: #666; border-top: 2px solid #0B1B3B; padding-top: 8mm; }
        .reference-number { background: #0B1B3B; color: white; padding: 8mm; border-radius: 3px; text-align: center; margin: 12mm 0; font-weight: bold; font-size: 12px; letter-spacing: 1px; }
        .date-time { text-align: right; color: #666; font-size: 9px; margin-bottom: 15mm; border-bottom: 1px solid #ccc; padding-bottom: 5mm; }
        table { width: 100%; border-collapse: collapse; margin: 8mm 0; }
        table tr { border-bottom: 1px solid #ddd; }
        table td { padding: 6mm; font-size: 10px; }
        table td:first-child { font-weight: bold; color: #0B1B3B; width: 40%; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="date-time">
          <div><strong>Data:</strong> ${today}</div>
          <div><strong>Ora:</strong> ${time}</div>
        </div>
        
        <div class="header">
          <div class="logo-section">
            <div class="logo">
              <span class="logo-text">Apliko</span><span class="logo-span">USA</span>
            </div>
          </div>
          <div class="subtitle">Green Card DV Lottery Application Services</div>
          <div class="subtitle">info@aplikousa.com | +383 44 000 000 | www.aplikousa.com</div>
        </div>

        <h1 class="confirmation-title">✓ KONFIRMIMI I APLIKIMIT</h1>

        <div class="reference-number">
          REFERENCA: ${application.id.slice(0, 12).toUpperCase()}
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Të Dhënat e Aplikantit</div>
            <div class="info-grid">
              <div class="info-block">
                <div class="info-label">Emër i Plotë:</div>
                <div class="info-value">${user.firstName} ${user.lastName}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Email:</div>
                <div class="info-value">${user.email}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Telefon:</div>
                <div class="info-value">${user.phone || "—"}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Qytet:</div>
                <div class="info-value">${user.city || "—"}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Vendi i Lindjes:</div>
                <div class="info-value">${user.birthCountry || "—"}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Paketa:</div>
                <div class="info-value">
                  ${user.package === "individual" ? "Paket Individuale" : user.package === "couple" ? "Paket për Çifte" : "Paket Familjare"}
                </div>
              </div>
            </div>
          </div>

          ${photoUrl ? `
          <div class="photo-section">
            <h4>FOTOGRAFIA E APLIKIMIT</h4>
            <img src="${photoUrl}" alt="Fotografia e aplikimit" class="photo-image">
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Detalet e Aplikimit</div>
            <table>
              <tr>
                <td>Data Aplikimit:</td>
                <td>${new Date(application.createdAt).toLocaleDateString("sq-AL")}</td>
              </tr>
              <tr>
                <td>Statusi i Aplikimit:</td>
                <td>
                  ${application.status === "pending" ? "🔄 Në Pritje" : application.status === "approved" ? "✓ Apruvuar" : "❌ Refuzuar"}
                </td>
              </tr>
              <tr>
                <td>Përqindja Përfundimit:</td>
                <td>40%</td>
              </tr>
            </table>
          </div>

          <div class="confirmation-box">
            <p><strong>KONFIRMIM I MARRIMIT TË APLIKIMIT</strong></p>
            <p>Kjo është për të konfirmuar që aplikimi juaj për Green Card DV Lottery u pranua dhe u regjistrua në sistemin tonë të menaxhimit.</p>
            <p><strong>Hapi Përfundues:</strong> Përdorni kodin e referencës më sipër për të ndjekur statusin e aplikimit tuaj në kohë reale.</p>
          </div>

          <div class="section">
            <div class="section-title">Hapat Përfundues</div>
            <table>
              <tr>
                <td>✓ 1. Regjistrimi</td>
                <td>Përfunduar</td>
              </tr>
              <tr>
                <td>🔄 2. Pagesa</td>
                <td>Në Pritje</td>
              </tr>
              <tr>
                <td>⏱ 3. Plotësimi i Formularit</td>
                <td>Në Pritje</td>
              </tr>
              <tr>
                <td>⏱ 4. Dorëzimi Zyrtar</td>
                <td>Në Pritje</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="footer">
          <p><strong>AplikoUSA - Green Card DV Lottery Application Services</strong></p>
          <p>© 2025 AplikoUSA. Të gjitha të drejtat e rezervuara. | Dokumenti juaj është i siguruar me enkriptim.</p>
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
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; background: white; color: #222; line-height: 1.6; }
        .page { width: 210mm; height: 297mm; margin: 0 auto; padding: 18mm; background: white; page-break-after: always; }
        .header { text-align: center; margin-bottom: 20mm; border-bottom: 3px solid #0B1B3B; padding-bottom: 12mm; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 5mm; }
        .logo-text { color: #0B1B3B; }
        .logo-span { color: #E63946; }
        .subtitle { color: #555; font-size: 11px; margin-top: 3mm; }
        .title { font-size: 16px; font-weight: bold; color: #0B1B3B; margin: 18mm 0 15mm 0; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .declaration-content { margin: 15mm 0; }
        .paragraph { margin-bottom: 10mm; text-align: justify; font-size: 11px; line-height: 1.7; text-indent: 0; }
        .section-title { font-size: 12px; font-weight: bold; color: white; background: #0B1B3B; margin: 12mm 0 8mm 0; padding: 8mm; border-radius: 3px; }
        .signatory { margin-top: 25mm; }
        .sign-block { display: inline-block; width: 45%; margin-right: 5%; }
        .sign-line { margin-top: 18mm; padding-top: 4mm; border-top: 1px solid #333; min-height: 25mm; }
        .sign-label { font-size: 10px; color: #333; margin-top: 2mm; font-weight: bold; }
        .date-line { margin: 12mm 0; font-size: 11px; }
        .footer { margin-top: 30mm; text-align: center; font-size: 9px; color: #666; border-top: 2px solid #0B1B3B; padding-top: 8mm; }
        .reference { background: #f5f5f5; padding: 10mm; border-left: 4px solid #E63946; margin: 12mm 0; font-size: 10px; }
        .reference strong { color: #0B1B3B; }
        .certification-box { background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-left: 5px solid #E63946; padding: 10mm; margin: 12mm 0; border-radius: 3px; }
        .certification-box p { font-size: 10px; line-height: 1.6; margin-bottom: 4mm; color: #0B1B3B; }
        ul { margin-left: 15mm; margin-bottom: 10mm; font-size: 11px; }
        li { margin-bottom: 6mm; text-align: justify; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="logo">
            <span class="logo-text">Apliko</span><span class="logo-span">USA</span>
          </div>
          <div class="subtitle">Green Card DV Lottery Application Services</div>
        </div>

        <h1 class="title">Deklarata e Saktësisë</h1>

        <div class="reference">
          <strong>Këndveshtar:</strong> ${user.firstName} ${user.lastName}<br>
          <strong>Email:</strong> ${user.email}<br>
          <strong>Referenca e Aplikimit:</strong> ${application.id.slice(0, 12).toUpperCase()}<br>
          <strong>Data e Deklaratës:</strong> ${today}
        </div>

        <div class="declaration-content">
          <p class="paragraph">
            Unë, <strong>${user.firstName} ${user.lastName}</strong>, nënshkrues këtë deklaratë në përputhje me ndërgjegjën dhe ligjin. Unë deklaroj nën penalitetin e përvitit se:
          </p>

          <div class="section-title">DEKLARATAT LIGJORE</div>

          <ul>
            <li><strong>1. Saktësia e Informacionit:</strong> Të gjitha informacionet që kam dhënë në këtë aplikim për Green Card DV Lottery janë të sakta, të plota dhe të vërteta sipas diturisë dhe besimit tim më të mirë.</li>
            
            <li><strong>2. Transparenca Plotë:</strong> Unë nuk kam shtrembëruar, fshehur ose mohuar ndonjë informacion material në këtë aplikim dhe në të gjitha dokumentet përcjellëse.</li>
            
            <li><strong>3. Autenticiteti i Fotografisë:</strong> Fotografija e bashkëngjitur në këtë aplikim është fotografija ime aktuale dhe përputhet me të gjitha kërkesat dhe standardet e specifikuara nga programi Green Card DV Lottery.</li>
            
            <li><strong>4. Kuptimi i Penaliteteve:</strong> Unë jam i ndërgjegjshëm se falsifikimi ose dhënia e informatave të rreme në këtë aplikim mund të rezultojë në dënime ligjore serioze, përfshirë refuzimin e përjetshëm për të marrë Green Card dhe dëbimin nga Shtetet e Bashkuara të Amerikës.</li>
            
            <li><strong>5. Kuptimi i Rolit të AplikoUSA:</strong> Unë e kuptoj se AplikoUSA është një kompani e palës tretë që ndihmon në përpilimin dhe dorëzimin e aplikimit, dhe se ajo nuk është agjensia zyrtare e Departamentit të Shtetit të SHBA.</li>
            
            <li><strong>6. Zbritja nga Përgjegjësia:</strong> Unë përjashtohem përgjegjësinë e AplikoUSA për ndonjë vendim të marrë nga SHBA në lidhje me aplikimin tim. SHBA mund ta refuzojë aplikimin për cilindo arsye sipas gjykimit të tyre.</li>
            
            <li><strong>7. Njohja Plotë:</strong> Unë e kuptoj plotësisht të gjithë shpjegimet dhe këshillat e dhënë mua në lidhje me Programin e Hyrjes të Loterisë Green Card sipas ligjit federal.</li>
          </ul>

          <div class="certification-box">
            <p><strong>⚠ NJOFTIM I RËNDËSISHËM</strong></p>
            <p>Këtë deklaratë e nënshkruaj me përgjegjësi plotë personal. Unë e di se nuk është e ligjshme dhe se mund të dënohem sipas ligjeve federale të SHBA për ndonjë shpjegim të rreme ose mosplotësim të kërkesave.</p>
          </div>
        </div>

        <div class="signatory">
          <div class="date-line">
            <strong>Data e Nënshkrimit:</strong> _________________________ (${today})
          </div>

          <div style="margin-top: 20mm;">
            <div class="sign-block">
              <div class="sign-line"></div>
              <div class="sign-label">Nënshkrimi i Aplikantit</div>
            </div>
            <div class="sign-block">
              <div class="sign-line"></div>
              <div class="sign-label">${user.firstName} ${user.lastName}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>AplikoUSA - Green Card DV Lottery Application Services</strong></p>
          <p>info@aplikousa.com | +383 44 000 000 | www.aplikousa.com</p>
          <p>© 2025 AplikoUSA. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
