# QR Code System - Anleitung

## Wie es funktioniert

### 1. QR Code generieren (Admin)

1. Gehe zum Admin-Bereich: http://localhost:3000/admin
2. Klicke auf den Tab "Kundin anlegen"
3. In der Liste der bestehenden Kundinnen, klicke auf "QR Code generieren"
4. Eine HTML-Datei wird heruntergeladen (kann als PNG ausgedruckt werden)

### 2. QR Code verteilen

- Drucke den QR Code aus oder sende ihn per WhatsApp/Email
- Die Datei enthält bereits das "SVEAAESTHETIC" Branding

### 3. Kundin bucht Termin

1. Kundin scannt QR Code
2. Kommt zur Buchungsseite mit ihrem Namen
3. Wählt Datum, Uhrzeit aus
4. Fügt Beschreibung hinzu (optional)
5. Lädt Inspo-Bild hoch (optional)
6. Bucht den Termin

### 4. Admin sieht Buchung

1. Gehe zur Admin-Übersicht
2. Der neue Termin erscheint in der Liste
3. Mit Kalender-Tab alle Termine auf einen Blick

## Technische Details

- **QR Code URL Format**: `https://your-domain.com/book/[Kundenname]`
- **Buchungsseite**: `/book/[name]` 
- **API**: Buchungen werden in Firestore Collection `appointments` gespeichert
- **Bilder**: Werden als Base64 in Firestore gespeichert (kein Storage Upgrade nötig)

## Änderungen für Produktion

1. **BASE_URL setzen**: In `.env.local` oder Produktions-Umgebung
2. **HTTPS**: Verwende immer HTTPS in Produktion
3. **QR Code Druck**: A4 oder Visitenkarten-Format möglich

## Features

✅ QR Code mit SVEAAESTHETIC Branding
✅ Personalisierte Buchungsseite mit Kundennamen
✅ Datum & Uhrzeit Auswahl
✅ Notizfeld für Wünsche
✅ Bild-Upload für Inspo
✅ Termine erscheinen in Admin-Übersicht
✅ Kalenderansicht verfügbar

