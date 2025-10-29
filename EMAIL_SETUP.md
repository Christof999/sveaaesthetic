# E-Mail-Benachrichtigungen einrichten

Die Anwendung kann Kundinnen automatisch per E-Mail benachrichtigen, wenn ein Termin bestätigt oder abgelehnt wird.

## Setup mit Resend

Wir verwenden [Resend](https://resend.com) für E-Mail-Versand (kostenloser Plan verfügbar).

### 1. Resend Account erstellen

1. Gehe zu [https://resend.com](https://resend.com)
2. Erstelle einen kostenlosen Account
3. Verifiziere deine E-Mail-Adresse

### 2. API Key erstellen

1. Gehe zu **API Keys** im Resend Dashboard
2. Klicke auf **Create API Key**
3. Gib einen Namen ein (z.B. "SVEAAESTHETIC Production")
4. Kopiere den generierten API Key (nur einmal sichtbar!)

### 3. E-Mail-Domain verifizieren (Optional, aber empfohlen)

**Option A: Eigene Domain verwenden**
- Füge deine Domain in Resend hinzu
- Verifiziere die DNS-Einträge (wird von Resend angezeigt)
- Sobald verifiziert, kannst du E-Mails von `noreply@deinedomain.com` senden

**Option B: Testen mit Resend Test-Domain (für Entwicklung)**
- Für Tests kannst du die Resend Test-Domain verwenden
- Der FROM-E-Mail muss dann `onboarding@resend.dev` sein
- **Wichtig**: Mit der Test-Domain können nur E-Mails an verifizierte E-Mail-Adressen gesendet werden!

### 4. Umgebungsvariablen konfigurieren

Füge folgende Zeilen zu deiner `.env.local` Datei hinzu:

```bash
# Resend API Key (von https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Absender-E-Mail-Adresse
# Für Tests: onboarding@resend.dev (nur an verifizierte E-Mails!)
# Für Production: noreply@deinedomain.com
FROM_EMAIL=noreply@sveaaesthetic.com
```

### 5. Anwendung neu starten

```bash
npm run dev
```

## Funktionsweise

### E-Mail wird automatisch gesendet wenn:

- **Admin bestätigt einen Termin** (`confirmed`)
- **Admin lehnt einen Termin ab** (`rejected`)

### E-Mail wird NICHT gesendet wenn:

- Keine E-Mail-Adresse für die Kundin hinterlegt ist
- `RESEND_API_KEY` nicht konfiguriert ist (gibt nur eine Warnung in den Logs)
- E-Mail-Versand fehlschlägt (Termin-Update wird trotzdem durchgeführt)

## E-Mail-Adressen hinzufügen

### Beim Anlegen einer Kundin (Admin)

1. Gehe zu **Kundin anlegen**
2. Gib Name ein
3. **Optional**: E-Mail-Adresse eintragen
4. Speichern

### Bei der Buchung (Kundin)

1. Beim Buchen eines Termins kann die Kundin ihre E-Mail-Adresse angeben
2. Die E-Mail wird automatisch gespeichert/aktualisiert
3. Bei zukünftigen Buchungen wird diese E-Mail verwendet

## Testen

1. Lege eine Test-Kundin an mit deiner E-Mail-Adresse
2. Erstelle einen Test-Termin
3. Als Admin: Bestätige oder lehne den Termin ab
4. Prüfe dein E-Mail-Postfach (auch Spam!)

## SMS-Benachrichtigungen (Optional, zukünftig)

Für SMS-Benachrichtigungen könnten wir z.B. [Twilio](https://www.twilio.com) integrieren. Das kostet jedoch Geld (ca. €0.05 pro SMS).

## Troubleshooting

### E-Mails werden nicht versendet

1. **Prüfe `.env.local`**: Sind `RESEND_API_KEY` und `FROM_EMAIL` gesetzt?
2. **Prüfe Server-Logs**: Gibt es Fehlermeldungen beim Senden?
3. **Prüfe Resend Dashboard**: Sind E-Mails in der Log-Ansicht?
4. **Test-Domain**: Mit `onboarding@resend.dev` können nur verifizierte E-Mails empfangen!

### "E-Mail-Service nicht konfiguriert"

- Die Anwendung läuft ohne Fehler, aber es werden keine E-Mails gesendet
- Du siehst diese Meldung in den Server-Logs
- **Lösung**: Füge `RESEND_API_KEY` zu `.env.local` hinzu

### "Email sending error" in Resend

- Meistens wegen ungültiger E-Mail-Adresse oder fehlender Domain-Verifizierung
- Prüfe die Resend-Dokumentation für Details

