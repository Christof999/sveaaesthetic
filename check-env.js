#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local Datei existiert nicht!');
  console.log('Bitte erstelle die Datei und trage deine Firebase-Werte ein.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('🔍 Prüfe .env.local Datei...\n');

let allSet = true;
requiredVars.forEach(varName => {
  const line = lines.find(l => l.startsWith(varName + '='));
  if (!line) {
    console.log(`❌ ${varName} fehlt`);
    allSet = false;
  } else {
    const value = line.split('=')[1]?.trim();
    if (!value || value === '') {
      console.log(`❌ ${varName} ist leer`);
      allSet = false;
    } else if (value.length < 5) {
      console.log(`⚠️  ${varName} scheint zu kurz zu sein: "${value}"`);
      allSet = false;
    } else {
      console.log(`✅ ${varName} ist gesetzt`);
    }
  }
});

console.log('');

if (allSet) {
  console.log('✅ Alle Umgebungsvariablen sind gesetzt!');
  console.log('\n⚠️  WICHTIG: Starte den Development-Server neu, damit die Änderungen wirksam werden!');
  console.log('   Stoppe den Server (Ctrl+C) und starte ihn neu mit: npm run dev');
} else {
  console.log('❌ Einige Umgebungsvariablen fehlen oder sind leer.');
  console.log('\n📝 So bekommst du die Werte:');
  console.log('   1. Gehe zu https://console.firebase.google.com');
  console.log('   2. Wähle dein Projekt aus');
  console.log('   3. Gehe zu Project Settings (Zahnrad-Symbol)');
  console.log('   4. Scrolle zu "Your apps" und wähle deine Web-App');
  console.log('   5. Kopiere die Werte aus dem Config-Objekt');
  console.log('\n📄 Beispiel .env.local Format:');
  console.log('   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...');
  console.log('   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com');
  console.log('   NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id');
  console.log('   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com');
  console.log('   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012');
  console.log('   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef');
  process.exit(1);
}

