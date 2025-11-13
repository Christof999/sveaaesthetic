# Vercel Umgebungsvariablen Checkliste

Diese Datei enthält alle Umgebungsvariablen, die du in Vercel setzen musst.

## 📋 Schritt-für-Schritt Anleitung

1. Gehe zu deinem Vercel-Projekt
2. Klicke auf **Settings** → **Environment Variables**
3. Füge jede Variable einzeln hinzu (Name und Wert)
4. Wähle für alle Variablen: **Production**, **Preview** und **Development**

---

## 🔵 Firebase Client SDK (MIT `NEXT_PUBLIC_`)

Diese Variablen werden im Browser-Code eingebettet. Du findest sie in der Firebase Console unter Project Settings → Your apps → Web App.

| Variable Name | Beispiel-Wert | Wo findest du es? |
|--------------|---------------|-------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyC...` | Firebase Console → Project Settings → Web App Config → `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `dein-projekt.firebaseapp.com` | Firebase Console → Project Settings → Web App Config → `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `dein-projekt-id` | Firebase Console → Project Settings → Web App Config → `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `dein-projekt.appspot.com` | Firebase Console → Project Settings → Web App Config → `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` | Firebase Console → Project Settings → Web App Config → `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789012:web:abcdef123456` | Firebase Console → Project Settings → Web App Config → `appId` |

---

## 🔴 Firebase Admin SDK (OHNE `NEXT_PUBLIC_` - GEHEIM!)

Diese Variablen sind **NUR** serverseitig verfügbar und dürfen **NIEMALS** mit `NEXT_PUBLIC_` beginnen!

### So bekommst du die Firebase Admin Credentials:

1. Gehe zu Firebase Console → Project Settings
2. Klicke auf den Tab **Service Accounts**
3. Klicke auf **Generate New Private Key**
4. Eine JSON-Datei wird heruntergeladen

Aus dieser JSON-Datei nimmst du:

| Variable Name | Wo findest du es? | Wichtig! |
|--------------|-------------------|-----------|
| `FIREBASE_ADMIN_PRIVATE_KEY` | Aus der JSON-Datei: `private_key` Feld | **WICHTIG:** Der Wert beginnt mit `"-----BEGIN PRIVATE KEY-----\n"` und endet mit `"\n-----END PRIVATE KEY-----\n"`. Kopiere den **gesamten** Wert inklusive der Anführungszeichen. In Vercel kannst du die Zeilenumbrüche (`\n`) so lassen oder als `\n` eingeben. |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Aus der JSON-Datei: `client_email` Feld | Beispiel: `firebase-adminsdk-xxxxx@dein-projekt.iam.gserviceaccount.com` |

**⚠️ WICHTIG:** 
- Diese Variablen **NIEMALS** mit `NEXT_PUBLIC_` beginnen!
- Sie sind geheim und dürfen nicht im Browser-Code landen!

---

## 🟡 Admin E-Mails (Optional, MIT `NEXT_PUBLIC_`)

| Variable Name | Beispiel-Wert | Beschreibung |
|--------------|---------------|--------------|
| `NEXT_PUBLIC_ADMIN_EMAILS` | `christof.didi@googlemail.com,admin@sveaaesthetic.de` | Komma-getrennte Liste der Admin-E-Mail-Adressen. Diese können sich einloggen. |

---

## 🟢 E-Mail Service (Optional, OHNE `NEXT_PUBLIC_`)

| Variable Name | Beispiel-Wert | Beschreibung |
|--------------|---------------|--------------|
| `RESEND_API_KEY` | `re_...` | API Key von Resend.com (falls du E-Mail-Benachrichtigungen aktivieren möchtest) |
| `FROM_EMAIL` | `noreply@sveaaesthetic.com` | Absender-E-Mail-Adresse für E-Mails (optional, Standard: `noreply@sveaaesthetic.com`) |

---

## ✅ Vollständige Liste zum Kopieren

### In Vercel hinzufügen (Production, Preview, Development):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PRIVATE_KEY
FIREBASE_ADMIN_CLIENT_EMAIL
NEXT_PUBLIC_ADMIN_EMAILS
RESEND_API_KEY (optional)
FROM_EMAIL (optional)
```

---

## 🔍 Prüfen ob alles funktioniert

Nach dem Deployment kannst du prüfen:
- `/api/debug` - Zeigt Firebase-Verbindungsstatus
- Admin-Login sollte funktionieren

---

## ⚠️ Häufige Fehler

1. **Falsch:** `NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY` ❌
   **Richtig:** `FIREBASE_ADMIN_PRIVATE_KEY` ✅

2. **Falsch:** `FIREBASE_ADMIN_PRIVATE_KEY` ohne Zeilenumbrüche ❌
   **Richtig:** `FIREBASE_ADMIN_PRIVATE_KEY` mit `\n` oder als mehrzeiliger Wert ✅

3. **Falsch:** Variablen nur für Production gesetzt ❌
   **Richtig:** Für Production, Preview UND Development setzen ✅

