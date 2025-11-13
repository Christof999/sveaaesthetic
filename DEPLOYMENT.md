# Deployment-Anleitung

Diese Anleitung erklärt, wie du die Sveaaesthetic WebApp veröffentlichen kannst.

## Option 1: Vercel (Empfohlen für Next.js) ⭐

Vercel ist die einfachste und beste Option für Next.js Apps. Es ist kostenlos für kleine Projekte und bietet automatisches Deployment.

### Schritt 1: Vercel Account erstellen
1. Gehe zu [vercel.com](https://vercel.com)
2. Melde dich mit deinem GitHub Account an (empfohlen) oder erstelle einen neuen Account

### Schritt 2: Projekt importieren
1. Klicke auf "Add New Project"
2. Wähle dein GitHub Repository (`sveaaesthetic`) aus
3. Vercel erkennt automatisch, dass es eine Next.js App ist

### Schritt 3: Umgebungsvariablen konfigurieren
**WICHTIG:** Du musst alle Firebase-Umgebungsvariablen hinzufügen!

1. Im Setup-Bildschirm, scrolle zu "Environment Variables"
2. Füge jede Variable einzeln hinzu:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = dein Firebase API Key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = dein Firebase Auth Domain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = dein Firebase Project ID
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = dein Firebase Storage Bucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = dein Messaging Sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = dein Firebase App ID

3. Optional: Falls du E-Mail-Funktionen verwendest, füge auch hinzu:
   - `RESEND_API_KEY` = dein Resend API Key (falls verwendet)

### Schritt 4: Deployment
1. Klicke auf "Deploy"
2. Warte 2-3 Minuten, bis das Deployment fertig ist
3. Deine App ist jetzt live unter einer URL wie: `https://sveaaesthetic.vercel.app`

### Schritt 5: Custom Domain (Optional)
1. Gehe zu Project Settings → Domains
2. Füge deine eigene Domain hinzu (z.B. `sveaaesthetic.de`)
3. Folge den DNS-Anweisungen

### Vorteile von Vercel:
- ✅ Automatisches Deployment bei jedem Git Push
- ✅ Kostenlos für kleine Projekte
- ✅ Optimiert für Next.js
- ✅ SSL-Zertifikat automatisch
- ✅ CDN weltweit
- ✅ Preview-Deployments für Pull Requests

---

## Option 2: Netlify

Netlify ist eine Alternative zu Vercel, ebenfalls sehr einfach.

### Schritt 1: Netlify Account erstellen
1. Gehe zu [netlify.com](https://netlify.com)
2. Melde dich mit GitHub an

### Schritt 2: Projekt importieren
1. Klicke auf "Add new site" → "Import an existing project"
2. Wähle dein GitHub Repository
3. Build-Einstellungen:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

### Schritt 3: Umgebungsvariablen
1. Gehe zu Site Settings → Environment Variables
2. Füge alle Firebase-Umgebungsvariablen hinzu (wie bei Vercel)

### Schritt 4: Deploy
1. Klicke auf "Deploy site"
2. Warte auf das Deployment

---

## Option 3: Eigenes VPS/Server

Falls du einen eigenen Server hast (z.B. DigitalOcean, AWS EC2, etc.):

### Schritt 1: Server vorbereiten
```bash
# Node.js installieren (Version 20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 installieren (für Prozess-Management)
sudo npm install -g pm2
```

### Schritt 2: Code deployen
```bash
# Repository klonen
git clone https://github.com/Christof999/sveaaesthetic.git
cd sveaaesthetic

# Dependencies installieren
npm install

# Build erstellen
npm run build
```

### Schritt 3: Umgebungsvariablen setzen
Erstelle eine `.env.production` Datei:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... alle anderen Variablen
```

### Schritt 4: App starten
```bash
# Mit PM2 starten (läuft im Hintergrund)
pm2 start npm --name "sveaaesthetic" -- start

# PM2 beim Server-Start automatisch starten
pm2 startup
pm2 save
```

### Schritt 5: Nginx als Reverse Proxy (Optional)
```nginx
server {
    listen 80;
    server_name deine-domain.de;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Wichtige Punkte vor dem Deployment

### ✅ Checkliste:

1. **Firebase-Konfiguration prüfen**
   - Stelle sicher, dass alle Umgebungsvariablen korrekt sind
   - Teste die Verbindung zu Firebase

2. **Firebase Security Rules anpassen**
   - Für Produktion solltest du die Security Rules anpassen
   - Aktuell sind sie wahrscheinlich auf "test mode" (jeder kann lesen/schreiben)
   - Siehe `FIREBASE_SETUP.md` für Details

3. **Build testen**
   ```bash
   npm run build
   npm start
   ```
   - Prüfe, ob der Build ohne Fehler durchläuft
   - Teste die App lokal im Production-Modus

4. **Umgebungsvariablen**
   - Alle `NEXT_PUBLIC_*` Variablen müssen im Deployment-System gesetzt sein
   - **NIEMALS** `.env.local` committen (ist bereits in `.gitignore`)

5. **Firebase Storage Rules (falls verwendet)**
   - Stelle sicher, dass die Storage Rules für Produktion angepasst sind

---

## Nach dem Deployment

### 1. App testen
- Öffne die bereitgestellte URL
- Teste alle Funktionen:
  - Admin-Login
  - Termin erstellen
  - Kalender anzeigen
  - QR-Code generieren

### 2. Monitoring einrichten
- Vercel/Netlify bieten automatisches Monitoring
- Prüfe die Logs bei Problemen

### 3. Backup-Strategie
- Firebase speichert Daten automatisch
- Regelmäßige Exports aus Firebase Console empfohlen

---

## Troubleshooting

### Problem: Firebase-Verbindung funktioniert nicht
**Lösung:** 
- Prüfe, ob alle Umgebungsvariablen korrekt gesetzt sind
- Prüfe die Firebase Console auf Fehler
- Teste die Debug-Route: `/api/debug`

### Problem: Build schlägt fehl
**Lösung:**
- Prüfe die Build-Logs im Deployment-System
- Stelle sicher, dass alle Dependencies in `package.json` sind
- Teste lokal: `npm run build`

### Problem: Bilder werden nicht angezeigt
**Lösung:**
- Prüfe Firebase Storage Rules
- Prüfe, ob Storage Bucket korrekt konfiguriert ist

---

## Empfehlung

**Für diese App empfehle ich Vercel**, weil:
- ✅ Einfachste Einrichtung
- ✅ Automatisches Deployment
- ✅ Optimiert für Next.js
- ✅ Kostenlos für kleine Projekte
- ✅ Keine Server-Verwaltung nötig

---

## Nützliche Links

- [Vercel Dokumentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Hosting](https://firebase.google.com/docs/hosting) (Alternative, aber weniger empfohlen für Next.js)

