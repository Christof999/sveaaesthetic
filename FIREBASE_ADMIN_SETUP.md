# Firebase Admin SDK Setup (Optional, aber empfohlen)

Die Firebase Admin SDK wird für sichere Token-Verifizierung auf dem Server verwendet. Die App funktioniert auch ohne diese Variablen, aber die Authentifizierung ist dann weniger sicher.

## Schritt 1: Service Account erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com)
2. Wähle dein Projekt aus
3. Klicke auf das **Zahnrad-Symbol** (⚙️) oben links → **Project settings**
4. Gehe zum Tab **Service Accounts**
5. Klicke auf **Generate New Private Key**
6. Bestätige mit **Generate Key**
7. Eine JSON-Datei wird heruntergeladen (z.B. `sveaaesthetic-firebase-adminsdk-xxxxx.json`)

## Schritt 2: Werte aus der JSON-Datei kopieren

Öffne die heruntergeladene JSON-Datei. Sie sieht etwa so aus:

```json
{
  "type": "service_account",
  "project_id": "sveaaesthetic",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@sveaaesthetic.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Schritt 3: Variablen in Vercel setzen

Gehe zu Vercel → Settings → Environment Variables und füge hinzu:

### Variable 1: `FIREBASE_ADMIN_PRIVATE_KEY`
- **Name:** `FIREBASE_ADMIN_PRIVATE_KEY` (OHNE `NEXT_PUBLIC_`!)
- **Wert:** Kopiere den Wert aus dem `private_key` Feld der JSON-Datei
  - Beginnt mit `"-----BEGIN PRIVATE KEY-----\n"`
  - Endet mit `"\n-----END PRIVATE KEY-----\n"`
  - Kopiere den **gesamten** Wert inklusive der Anführungszeichen
  - In Vercel kannst du die `\n` so lassen oder als echte Zeilenumbrüche eingeben

**Beispiel:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(viele Zeilen)
...
-----END PRIVATE KEY-----
```

### Variable 2: `FIREBASE_ADMIN_CLIENT_EMAIL`
- **Name:** `FIREBASE_ADMIN_CLIENT_EMAIL` (OHNE `NEXT_PUBLIC_`!)
- **Wert:** Kopiere den Wert aus dem `client_email` Feld der JSON-Datei
  - Beispiel: `firebase-adminsdk-xxxxx@sveaaesthetic.iam.gserviceaccount.com`

## Schritt 4: Lokal testen (Optional)

Falls du lokal testen möchtest, füge diese Variablen auch zu deiner `.env.local` hinzu:

```bash
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@sveaaesthetic.iam.gserviceaccount.com"
```

**WICHTIG:** 
- Verwende Anführungszeichen um den Private Key
- Die `\n` müssen als echte Zeilenumbrüche oder als `\n` geschrieben werden

## Schritt 5: Deployment

Nach dem Setzen der Variablen in Vercel:
1. Gehe zu Deployments
2. Klicke auf das neueste Deployment → **Redeploy**
3. Oder pushe einen neuen Commit, um automatisch neu zu deployen

## Prüfen ob es funktioniert

Nach dem Deployment sollte die `/api/auth/check` Route die Token korrekt verifizieren können.

## Sicherheit

⚠️ **WICHTIG:**
- Diese Variablen **NIEMALS** mit `NEXT_PUBLIC_` beginnen!
- Sie sind geheim und dürfen nicht im Browser-Code landen
- Die JSON-Datei nicht committen oder öffentlich teilen
- Sie sollte nur auf deinem Computer und in Vercel gespeichert sein

