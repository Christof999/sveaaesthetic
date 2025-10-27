# Firebase Setup Anleitung

## 1. Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com)
2. Klicke auf "Add project" oder "Projekt hinzufügen"
3. Gib deinem Projekt einen Namen (z.B. "sveaaesthetic")
4. Optional: Google Analytics aktivieren/deaktivieren
5. Klicke auf "Create project"

## 2. Web-App registrieren

1. Im Firebase Dashboard klicke auf das Web-Symbol (`</>`)
2. Registriere eine neue App mit einem Nickname
3. **WICHTIG**: Kopiere die Firebase Config (das sieht aus wie ein Objekt)
4. Sie enthält:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## 3. Firestore Database einrichten

1. Im Firebase Dashboard → "Firestore Database"
2. Klicke auf "Create database"
3. Wähle "Start in test mode" (für Entwicklung)
4. Wähle einen Standort (z.B. `europe-west` für Deutschland)
5. Klicke auf "Enable"

## 4. Firebase Storage (Optional)

**Hinweis**: Storage benötigt oft ein Upgrade. Die App funktioniert auch ohne!

Ohne Storage:
- Bilder werden als Base64 direkt in Firestore gespeichert
- Funktioniert sofort ohne Upgrade

Mit Storage (optional):
1. Im Firebase Dashboard → "Storage"
2. Klicke auf "Get started"
3. Wähle "Start in test mode"
4. Wähle einen Standort (gleicher wie Firestore)
5. Klicke auf "Done"

## 5. Environment Variables setzen

Erstelle eine `.env.local` Datei im Projektverzeichnis:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...deine_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sveaaesthetic.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sveaaesthetic
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sveaaesthetic.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef
```

**WICHTIG**: Füge `.env.local` zu `.gitignore` hinzu (wurde bereits hinzugefügt)

## 6. Firestore Sicherheitsregeln (Optional für Produktion)

Später solltest du die Sicherheitsregeln anpassen. Für Entwicklung reicht "test mode":

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /customers/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /appointments/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 7. Storage Sicherheitsregeln (Optional für Produktion)

Für Entwicklung reicht "test mode":

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /inspo-images/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 8. Collections werden automatisch erstellt

Die App erstellt automatisch:
- `customers` - Kundendaten (id, name)
- `appointments` - Termine (id, customerId, customerName, date, time, comment, imageUrl)

## 9. Testen

1. Starte den Development Server: `npm run dev`
2. Gehe zu http://localhost:3000
3. Login mit `admin` / `admin`
4. Lege eine Test-Kundin an
5. Im Firebase Dashboard siehst du die neue Collection
