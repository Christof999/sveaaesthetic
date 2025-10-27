# Sveaaesthetic - Nagel Design Studio Terminverwaltung

Eine minimalistische Terminverwaltungsanwendung für das Nagel Design Studio Sveaaesthetic.

## Features

### ✅ Admin Bereich
- Admin Login mit einfacher Authentifizierung
- Übersicht der nächsten Termine (Name, Datum, Uhrzeit, Kommentar)
- Kalenderansicht aller gebuchten Termine
- Navigation zwischen Übersicht und Kalender

### 🚧 Geplant
- Kundenbereich zum Buchen von Terminen
- Kunden anlegen und verwalten
- Erweiterte Authentifizierung

## Technologie-Stack

- **Framework**: Next.js 16 mit App Router
- **Sprache**: TypeScript
- **Datenbank**: Firebase Firestore
- **Bilder**: Base64 in Firestore (kein Storage Upgrade nötig)
- **Styling**: Tailwind CSS
- **Design**: Minimalistisch (weiß, grau)

## Entwicklung

### Installation

```bash
npm install
```

### Firebase Setup

1. Erstelle ein Firebase-Projekt auf [console.firebase.google.com](https://console.firebase.google.com)
2. Gehe zu Projekt-Einstellungen → Allgemein → Deine Apps → Web-App hinzufügen
3. Kopiere die Firebase Config
4. Erstelle eine `.env.local` Datei im Projektverzeichnis:
   ```bash
   cp .env.local.example .env.local
   ```
5. Füge deine Firebase Credentials in `.env.local` ein

### Firebase Datenbank einrichten

1. Gehe zu Firebase Console → Firestore Database
2. Erstelle die Database im Testmodus (später Sicherheitsregeln anpassen)
3. Die Collections werden automatisch erstellt:
   - `customers` - Speichert Kundendaten
   - `appointments` - Speichert Termine mit Inspo-Bildern

### Firebase Storage (Optional)

Falls du **Firebase Storage** nutzen möchtest (für große Bilder):
1. Gehe zu Firebase Console → Storage
2. Erstelle einen Storage Bucket (benötigt oft ein Upgrade)
3. Der Ordner `inspo-images/` wird automatisch für Bilder verwendet

**Alternativ** (ohne Upgrade): Die App speichert Bilder als Base64 direkt in Firestore.

### Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

### Login

**Admin-Zugangsdaten:**
- Benutzername: `admin`
- Passwort: `admin`

## Projektstruktur

```
/
├── app/
│   ├── admin/          # Admin-Bereich
│   │   ├── login/      # Login-Seite
│   │   └── page.tsx    # Admin-Hauptseite
│   ├── api/            # API Routes
│   │   ├── appointments/
│   │   └── customers/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx        # Startseite
├── components/         # React Components
│   ├── AdminOverview.tsx
│   └── CalendarView.tsx
├── lib/
│   └── storage.ts      # Datenbank-Service
└── types/
    └── index.ts        # TypeScript Interfaces
```

## Nächste Schritte

- [ ] Erweiterte Authentifizierung implementieren
- [ ] Persistente Datenbank integrieren
- [ ] Kundenbereich entwickeln
- [ ] "Kunde anlegen" Feature implementieren
- [ ] Responsives Design optimieren