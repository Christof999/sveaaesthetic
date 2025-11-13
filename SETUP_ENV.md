# Firebase Umgebungsvariablen einrichten

## Schritt 1: Firebase Console öffnen
1. Gehe zu: https://console.firebase.google.com
2. Wähle dein Projekt aus

## Schritt 2: Web-App Konfiguration finden
1. Klicke auf das Zahnrad-Symbol (⚙️) oben links → "Project settings"
2. Scrolle nach unten zu "Your apps"
3. Falls keine Web-App existiert:
   - Klicke auf das Web-Symbol (`</>`)
   - Registriere eine neue App
4. Kopiere die Werte aus dem Config-Objekt (sieht so aus):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "dein-projekt.firebaseapp.com",
  projectId: "dein-projekt-id",
  storageBucket: "dein-projekt.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Schritt 3: .env.local Datei bearbeiten
Öffne die Datei `.env.local` im Projektverzeichnis und trage die Werte ein:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC... (der apiKey Wert)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**WICHTIG:**
- Keine Anführungszeichen um die Werte!
- Keine Leerzeichen um das `=` Zeichen
- Jede Variable in einer eigenen Zeile

## Schritt 4: Prüfen
Führe aus: `node check-env.js`

## Schritt 5: Server neu starten
**WICHTIG:** Next.js lädt Umgebungsvariablen nur beim Start!
- Stoppe den Server (Ctrl+C)
- Starte neu: `npm run dev`
