# 🚀 Deployment Guide - AplikoUSA në Render.com

## Hapi 1: Përgatitja (5 minuta)

1. **Krijo Render account**: https://render.com (sign up me GitHub është më i shpejt)
2. **Krijo repozitoum në GitHub** (opsional por recommended):
   - Kliko "Code" → "GitHub" dhe kliko butoni
   - Ose push kodin manual me:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/aplikousa.git
   git push -u origin main
   ```

---

## Hapi 2: Në Render Dashboard (10 minuta)

### 2A. Krijo Web Service

1. Hyr në https://dashboard.render.com
2. Kliko **"New +"** → **"Web Service"**
3. Zgjidh "GitHub" dhe autentifikohu me GitHub (ose paste repo URL)
4. Zgjidh repository **"aplikousa"**
5. Emri i shërbimit: `aplikousa-web`
6. Runtime: **Node**
7. Build Command: `npm run build && npm run db:push`
8. Start Command: `npm run start`
9. Plan: Zgjidh **"Free"** (tashmë selected)
10. Kliko **"Create Web Service"**

### 2B. Krijo Database (PostgreSQL)

1. Në Render Dashboard, kliko **"New +"** → **"PostgreSQL"**
2. Database Name: `aplikousa`
3. User: `aplikousa_user`
4. Plan: **Free**
5. Region: Zgjidh më i afër (psh "Frankfurt" për Evropën)
6. Kliko **"Create Database"**

---

## Hapi 3: Konfigurimi i Environment Variables (5 minuta)

Pasi jep krijohet Web Service:

1. Hyr në **"Settings"** të Web Service
2. Shkuo në **"Environment"**
3. Shto këto variables (merri vlerat nga Replit):

```
DATABASE_URL = [PostgreSQL Connection String nga Render Database]
NODE_ENV = production
STRIPE_SECRET_KEY = [Nga Replit]
STRIPE_PUBLISHABLE_KEY = [Nga Replit]
REPLIT_CONNECTORS_HOSTNAME = [Nga Replit]
REPL_IDENTITY = [Nga Replit]
WEB_REPL_RENEWAL = [Nga Replit]
REPLIT_DOMAINS = [Nga Render Domain]
REPLIT_DEPLOYMENT = true
```

### Ku të marësh DATABASE_URL:

1. Hyr në Render Dashboard
2. Kliko **PostgreSQL Database** (aplikousa)
3. Kopjo **"Internal Database URL"** 
4. Paste në `DATABASE_URL`

### Ku të marësh variablat e Replit:

Në Replit, hyr në **"Tools"** → **"Secrets"** → kopjo vlerat

---

## Hapi 4: Deploy (2 minuta)

1. Pasi ke shto variables, Render do të deployojë automatikisht
2. Shko në **"Deployments"** tab
3. Pret derisa status bëhet **"Live"** (zakonisht 3-5 minuta)
4. Vizito **aplikousa.onrender.com** - Gata! 🎉

---

## Hapi 5: Verifikimi

✅ Kontrollo:
- [ ] Homepage shfaqet
- [ ] Login/Register punon
- [ ] Dashboard i shfaq users
- [ ] Admin dashboard accessible

---

## 🔧 Troubleshooting

### Build error?
```
Check logs: Deployments → Latest → View Logs
```

### Database connection error?
```
Verifiko DATABASE_URL në Environment variables
```

### App crashes after deploy?
```
Kliko "Settings" → "Clear Build Cache" → "Deploy again"
```

---

## 📞 Support

Nëse ke probleme:
- Render Status: https://status.render.com
- Dokumentacioni: https://render.com/docs
- Chat support në Render Dashboard

---

## 💰 Kostot

**Render Free Plan:**
- ✅ Web Service: FALAS (0€)
- ✅ PostgreSQL Database: FALAS 1GB (0€)
- ✅ Bandwidth: FALAS 100 GB/muaj
- **TOTAL: 0€/muaj**

**Kur të rritet aplikimi:**
- Pro Plan Web Service: $7/muaj
- Managed Database: $7/muaj
- Custom Domain: Free

---

**Sukses! AplikoUSA tani është live në cloud! 🚀**
