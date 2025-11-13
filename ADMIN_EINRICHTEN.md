# Weitere Admin-Konten freischalten

Um weitere Personen als Admin freizuschalten, musst du ihre E-Mail-Adressen zur Admin-Liste hinzufügen.

## Methode 1: Über Vercel (Empfohlen für Produktion) ⭐

Diese Methode ist am einfachsten und erfordert kein Code-Update.

### Schritt 1: Gehe zu Vercel Environment Variables

1. Öffne dein Vercel-Projekt
2. Gehe zu **Settings** → **Environment Variables**
3. Suche nach `NEXT_PUBLIC_ADMIN_EMAILS`

### Schritt 2: Admin-E-Mails hinzufügen

**Falls die Variable noch nicht existiert:**
1. Klicke auf **Add New**
2. Name: `NEXT_PUBLIC_ADMIN_EMAILS`
3. Wert: `christof.didi@googlemail.com,neue-admin@example.com,weitere-admin@example.com`
   - Trenne mehrere E-Mails mit **Komma** (`,`)
   - Keine Leerzeichen um die Kommas (oder nur ein Leerzeichen nach dem Komma)
   - Beispiel: `email1@example.com,email2@example.com,email3@example.com`

**Falls die Variable bereits existiert:**
1. Klicke auf die Variable zum Bearbeiten
2. Füge die neue E-Mail mit Komma hinzu
3. Beispiel: `christof.didi@googlemail.com,neue-admin@example.com`

### Schritt 3: Deployment

1. Gehe zu **Deployments**
2. Klicke auf das neueste Deployment → **Redeploy**
   - Oder pushe einen neuen Commit, um automatisch neu zu deployen

### Schritt 4: Admin-Konto erstellen

Die neue Person kann sich jetzt registrieren:

1. Gehe zu `/admin/register`
2. E-Mail-Adresse eingeben (muss in der Admin-Liste sein!)
3. Passwort wählen
4. Registrieren

**WICHTIG:** Die E-Mail-Adresse muss **genau** so in der Liste stehen, wie sie sich registriert (Groß-/Kleinschreibung wird ignoriert, aber die Domain muss stimmen).

---

## Methode 2: Lokal in .env.local (für Entwicklung)

Falls du lokal entwickelst:

1. Öffne `.env.local`
2. Füge oder bearbeite:
   ```
   NEXT_PUBLIC_ADMIN_EMAILS=christof.didi@googlemail.com,neue-admin@example.com,weitere-admin@example.com
   ```
3. Server neu starten (`npm run dev`)

---

## Beispiel: Mehrere Admins hinzufügen

### In Vercel:
```
NEXT_PUBLIC_ADMIN_EMAILS=christof.didi@googlemail.com,anna@sveaaesthetic.de,max@sveaaesthetic.de
```

### In .env.local:
```bash
NEXT_PUBLIC_ADMIN_EMAILS=christof.didi@googlemail.com,anna@sveaaesthetic.de,max@sveaaesthetic.de
```

---

## Admin entfernen

Um einen Admin zu entfernen:

1. Gehe zu Vercel → Environment Variables
2. Bearbeite `NEXT_PUBLIC_ADMIN_EMAILS`
3. Entferne die E-Mail-Adresse (und das Komma davor/danach)
4. Redeploy

**Beispiel:**
- Vorher: `christof.didi@googlemail.com,anna@sveaaesthetic.de,max@sveaaesthetic.de`
- Nachher: `christof.didi@googlemail.com,max@sveaaesthetic.de` (Anna entfernt)

---

## Aktuelle Admin-Liste prüfen

Die aktuelle Liste wird in den Browser-Konsolen-Logs ausgegeben, wenn sich jemand einloggt. Du kannst auch die Variable in Vercel direkt ansehen.

---

## Wichtige Hinweise

⚠️ **Sicherheit:**
- Die Admin-Liste ist öffentlich sichtbar (wegen `NEXT_PUBLIC_`)
- Das ist in Ordnung, da nur die E-Mail-Adressen sichtbar sind, nicht die Passwörter
- Die eigentliche Authentifizierung erfolgt über Firebase Auth

✅ **Best Practices:**
- Verwende geschäftliche E-Mail-Adressen für Admins
- Entferne ehemalige Mitarbeiter sofort aus der Liste
- Prüfe regelmäßig, wer Admin-Zugang hat

---

## Troubleshooting

### "Diese E-Mail-Adresse hat keinen Admin-Zugang"
- Prüfe, ob die E-Mail **genau** so in `NEXT_PUBLIC_ADMIN_EMAILS` steht
- Prüfe, ob nach dem Deployment die Variable aktualisiert wurde
- Prüfe Browser-Konsole für die aktuelle Admin-Liste

### Admin kann sich nicht registrieren
- Die E-Mail muss **zuerst** in der Admin-Liste sein, bevor sich die Person registriert
- Oder: Du erstellst das Konto manuell in Firebase Console → Authentication → Add User

### Änderungen werden nicht übernommen
- Nach Änderung in Vercel: **Redeploy** erforderlich!
- Browser-Cache leeren oder im Inkognito-Modus testen

