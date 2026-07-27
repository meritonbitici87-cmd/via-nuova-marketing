# Pizzeria KI-Marketing — Setup

Dieses Grundgerüst deckt Phase 1 (MVP) aus der Spec ab: Instagram-Content-Generierung
per Claude API + Dashboard zur Freigabe. Alles andere (Facebook, Blog, Reviews,
n8n-Automatisierung) baust du iterativ oben drauf — siehe `pizzeria-ai-marketing-spec.md`.

## Was du selbst tun musst (kann ich nicht für dich erledigen)

### 1. Supabase-Projekt anlegen
1. Auf https://supabase.com registrieren, neues Projekt anlegen
2. **Region: EU** wählen (DSGVO)
3. Unter *Project Settings → Database → Connection string → URI* die Verbindung kopieren
4. In `.env.local` (aus `.env.example` kopieren) als `DATABASE_URL` einfügen

### 2. Anthropic API-Key
1. Auf https://console.anthropic.com registrieren/einloggen
2. Unter *API Keys* einen neuen Key erstellen
3. In `.env.local` als `ANTHROPIC_API_KEY` einfügen

## Lokale Einrichtung

```bash
npm install
cp .env.example .env.local
# .env.local jetzt mit deinen echten Werten füllen (siehe oben)

npx prisma migrate dev --name init
npx tsx prisma/seed.ts   # legt dein Business-Profil an (vorher Name/Adresse in seed.ts anpassen!)

npm run dev
```

Danach läuft die App auf http://localhost:3000

## Ersten Content generieren

Solange es noch keine UI dafür gibt, per curl testen:

```bash
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{"businessId": "DEINE_BUSINESS_ID", "weekday": "Freitag", "occasion": "Wochenend-Special"}'
```

Die `businessId` bekommst du aus der Konsolen-Ausgabe von `npx tsx prisma/seed.ts`.

Danach unter http://localhost:3000/dashboard ansehen, freigeben, als gepostet markieren.

## Nächste Schritte (mit Claude Code)

Öffne Claude Code in diesem Ordner und lass es weiterbauen, z.B.:

> "Baue nach dem gleichen Muster wie /api/generate-content einen zweiten Content-Typ:
> Facebook-Posts. Erstelle dafür lib/prompts/facebook.ts nach Vorbild von instagram.ts."

Ein Typ nach dem anderen — nicht alles parallel, wie in der Spec (Abschnitt 9) beschrieben.
