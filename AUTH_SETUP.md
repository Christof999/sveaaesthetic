# Firebase Authentication Setup

Diese Anleitung erklärt, wie du Firebase Authentication für die Sveaaesthetic App einrichtest.

## Schritt 1: Firebase Authentication aktivieren

1. Gehe zur [Firebase Console](https://console.firebase.google.com)
2. Wähle dein Projekt aus
3. Gehe zu **Authentication** im linken Menü
4. Klicke auf **Get started**

## Schritt 2: E-Mail/Passwort Authentication aktivieren

1. Im Authentication-Dashboard, gehe zum Tab **Sign-in method**
2. Klicke auf **Email/Password**
3. Aktiviere **Email/Password** (erste Option)
4. Optional: Aktiviere auch **Email link (passwordless sign-in)** falls gewünscht
5. Klicke auf **Save**

## Schritt 3: Google Sign-In aktivieren (Optional)

1. Im gleichen **Sign-in method** Tab
2. Klicke auf **Google**
3. Aktiviere **Google** als Sign-in Provider
4. Wähle eine **Support email** (deine E-Mail)
5. Klicke auf **Save**

**Wichtig:** Für Google Sign-In musst du möglicherweise:
- Eine OAuth-Zustimmungsbildschirm in der Google Cloud Console konfigurieren
- Authorized domains hinzufügen (z.B. `sveaaesthetic.vercel.app`)

## Schritt 4: Admin-E-Mail-Adresse konfigurieren

Die Admin-E-Mail-Adressen werden in `lib/auth.ts` definiert. 

**WICHTIG:** Ändere die Admin-E-Mail-Adresse in `lib/auth.ts`:

```typescript
const ADMIN_EMAILS = [
  'deine-admin-email@example.com', // Ersetze mit deiner echten Admin-E-Mail
];
```

**Oder besser:** Verwende eine Umgebungsvariable (siehe unten).

## Schritt 5: Ersten Admin-Account erstellen

Du hast zwei Optionen:

### Option A: Über Firebase Console
1. Gehe zu **Authentication** → **Users**
2. Klicke auf **Add user**
3. Gib E-Mail und Passwort ein
4. Klicke auf **Add user**

### Option B: Über die App (wenn bereits ein Admin existiert)
1. Logge dich als Admin ein
2. Erstelle einen neuen Account über die App (falls implementiert)

### Option C: Temporär Admin-Check deaktivieren
Für die erste Einrichtung kannst du temporär den Admin-Check in `lib/auth.ts` deaktivieren:

```typescript
export const isAdminEmail = (email: string | null): boolean => {
  if (!email) return false;
  // Temporär: Erlaube alle E-Mails für erste Einrichtung
  return true; // Später wieder auf ADMIN_EMAILS prüfen umstellen
};
```

**WICHTIG:** Stelle dies nach der ersten Einrichtung wieder um!

## Schritt 6: Umgebungsvariablen (Optional, aber empfohlen)

Für eine flexiblere Konfiguration kannst du Admin-E-Mails als Umgebungsvariable setzen:

1. Füge zu `.env.local` hinzu:
```
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

2. Passe `lib/auth.ts` an:
```typescript
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [
  'admin@sveaaesthetic.de', // Fallback
];
```

## Schritt 7: Authorized Domains (für Produktion)

Wenn du die App deployed hast:

1. Gehe zu **Authentication** → **Settings** → **Authorized domains**
2. Füge deine Domain hinzu (z.B. `sveaaesthetic.vercel.app`)
3. Für Google Sign-In: Füge die Domain auch in Google Cloud Console hinzu

## Schritt 8: Passwort-Reset E-Mail Template anpassen (Optional)

1. Gehe zu **Authentication** → **Templates**
2. Wähle **Password reset**
3. Passe das E-Mail-Template an (Logo, Text, etc.)
4. Klicke auf **Save**

## Schritt 9: Testen

1. Starte die App: `npm run dev`
2. Gehe zu `/admin/login`
3. Teste:
   - E-Mail/Passwort Login
   - Google Sign-In (falls aktiviert)
   - Passwort-Reset (`/admin/reset-password`)

## Sicherheitshinweise

### ✅ WICHTIG:

1. **Admin-E-Mails schützen**
   - Liste der Admin-E-Mails sollte nicht öffentlich sein
   - Verwende Umgebungsvariablen für Produktion

2. **Firebase Security Rules**
   - Stelle sicher, dass Firestore Rules nur für authentifizierte Admins zugänglich sind
   - Siehe `FIREBASE_SETUP.md` für Details

3. **Passwort-Richtlinien**
   - Firebase hat Standard-Passwort-Richtlinien
   - Du kannst diese in Firebase Console anpassen

4. **E-Mail-Verifizierung (Optional)**
   - Aktiviere E-Mail-Verifizierung für zusätzliche Sicherheit
   - In `lib/auth.ts` kannst du `sendEmailVerification()` hinzufügen

## Troubleshooting

### Problem: "Diese E-Mail-Adresse hat keinen Admin-Zugang"
**Lösung:** 
- Prüfe, ob die E-Mail in `ADMIN_EMAILS` in `lib/auth.ts` steht
- Prüfe Groß-/Kleinschreibung (wird ignoriert, aber prüfe trotzdem)

### Problem: Google Sign-In funktioniert nicht
**Lösung:**
- Prüfe, ob Google als Sign-in Provider aktiviert ist
- Prüfe Authorized Domains
- Prüfe OAuth Consent Screen in Google Cloud Console

### Problem: Passwort-Reset E-Mail kommt nicht an
**Lösung:**
- Prüfe Spam-Ordner
- Prüfe, ob E-Mail/Passwort Authentication aktiviert ist
- Prüfe Firebase Console → Authentication → Templates

### Problem: "Firebase Auth ist nicht initialisiert"
**Lösung:**
- Prüfe, ob alle Firebase-Umgebungsvariablen gesetzt sind
- Prüfe Browser-Konsole auf Fehler
- Teste `/api/debug` Route

## Nächste Schritte

Nach erfolgreicher Einrichtung:
- [ ] Erstelle Admin-Accounts für alle Administratoren
- [ ] Passe E-Mail-Templates an
- [ ] Konfiguriere Authorized Domains für Produktion
- [ ] Teste alle Authentifizierungs-Flows
- [ ] Dokumentiere Admin-E-Mail-Adressen sicher

