# DLS Weekly Check-in – Technische Dokumentation

> **Pflegehinweis:** Diese Datei ist Teil der Projekt-Dokumentation und muss bei **jeder funktionalen oder strukturellen Anpassung** der Anwendung aktualisiert werden (Architektur, Datenmodell, Routen, Build/Deploy, Abhängigkeiten).

## 1) Ziel der Anwendung

Die App ist eine lokale, browserbasierte React-PWA zur wöchentlichen Erfassung von Gesundheits-/Befindlichkeitswerten. Nutzer:innen können Wochenprotokolle anlegen, sechs Hauptkategorien bewerten, Einträge als Entwurf oder „abgeschickt“ führen, die Historie visualisieren und Daten als JSON importieren/exportieren.

## 2) Technologie-Stack

- **Frontend:** React 18 + TypeScript
- **Routing:** React Router (`HashRouter`) (GitHub-Pages-freundlich ohne Server-Rewrite)
- **Build Tool:** Vite 5
- **PWA:** `vite-plugin-pwa` inkl. Service Worker Registrierung
- **Persistenz:** Browser-**IndexedDB** (lokal, clientseitig)
- **Tests:** Vitest (jsdom)

## 3) Projektstruktur (konkret)

```text
/
├─ index.html                         # Vite-Einstieg (mount point #root)
├─ package.json                       # Scripts + Abhängigkeiten
├─ vite.config.ts                     # Vite + PWA-Konfiguration
├─ vitest.config.ts                   # Testumgebung (jsdom)
├─ tsconfig.json / tsconfig.app.json  # TS-Projektkonfiguration
├─ public/
│  ├─ favicon.svg
│  ├─ icon-192.svg
│  └─ icon-512.svg                    # PWA-Assets
└─ src/
   ├─ main.tsx                        # App-Bootstrap + SW-Registrierung
   ├─ styles.css                      # Globale Styles
   ├─ app/
   │  ├─ App.tsx                      # Zentrales Routing
   │  ├─ AppLayout.tsx                # Shell + Bottom Navigation
   │  └─ toast.tsx                    # Toast Context/Provider
   ├─ config/
   │  ├─ health-dimensions.json       # Fachkonfiguration (Dimensionen/Subkategorien)
   │  ├─ healthConfig.ts              # Typisierte Config-Einbindung
   │  ├─ main-categories.ts           # 6 Hauptkategorien + Defaults
   │  └─ types.ts                     # Config-Typen
   ├─ domain/
   │  ├─ models.ts                    # Kern-Datentypen (WeeklyEntry etc.)
   │  ├─ isoWeek.ts                   # ISO-KW-Berechnung
   │  ├─ analytics.ts                 # Aggregationen/Statistik
   │  └─ importExport.ts              # JSON Export/Import-Validierung/Konflikte
   ├─ storage/
   │  └─ db.ts                        # IndexedDB-Store Zugriffsschicht
   ├─ features/
   │  ├─ home/
   │  │  ├─ HomeScreen.tsx            # Startseite + Wochenauswahl
   │  │  └─ RadarHealthChart.tsx      # Radar-Visualisierung
   │  ├─ checkin/
   │  │  ├─ CreateProtocolScreen.tsx  # Wochenauswahl zum Anlegen
   │  │  ├─ WeeklyFormScreen.tsx      # Formular/Autosave/Submit
   │  │  ├─ ThisWeekScreen.tsx        # Schnellzugriff aktuelle KW
   │  │  ├─ useWeeklyEntry.ts         # Laden/Initialisieren Wochen-Eintrag
   │  │  └─ useDebounced.ts           # Debounce-Hook fürs Autosave
   │  ├─ entries/
   │  │  └─ EntriesScreen.tsx         # Eintragsliste + Bearbeiten/Löschen
   │  ├─ analytics/
   │  │  └─ AnalyticsScreen.tsx       # Linienchart + Legenden-Toggle
   │  └─ settings/
   │     └─ SettingsScreen.tsx        # Export/Import/Clear
   └─ test/
      └─ acceptance.test.ts           # Fachliche Akzeptanztests
```

## 4) Laufzeit-Architektur

### 4.1 Bootstrap & App-Shell

1. `src/main.tsx` initialisiert React, Router und Toast-Provider.
2. `registerSW({ immediate: true })` registriert den PWA-Service-Worker sofort.
3. `src/app/App.tsx` definiert alle Routen.
4. `src/app/AppLayout.tsx` rendert Shell + fixe Bottom-Navigation.

### 4.2 Navigation/Routing

Definierte Routen:

- `/` → Home
- `/protokoll` → Protokoll anlegen (Wochenauswahl)
- `/protokoll-anlegen` → Legacy-Route, Redirect auf `/protokoll`
- `/checkin/:isoWeekKey` → Wochenformular
- `/entries` → Liste aller Protokolle
- `/analytics` und `/erweiterte-auswertung` → Auswertung
- `/this-week` → Aktuelle Woche
- `/settings` → Einstellungen
- `*` → Fallback auf `/`

## 5) Datenmodell

Zentrales Objekt ist `WeeklyEntry` (`src/domain/models.ts`):

- `isoWeekKey` (z. B. `2026-W05`)
- `year`, `week`, `dateFrom`, `dateTo`
- `status`: `draft` | `submitted`
- `items`: Subkategorie-Werte inkl. Notiz
- `mainCategoryScores`: 6 Hauptkategorien (0–10)
- `protocolNote`: Freitext zum Protokoll
- `updatedAt`: Änderungszeitpunkt

`normalizeWeeklyEntry` sichert Abwärtskompatibilität für ältere Datensätze ohne `mainCategoryScores`/`protocolNote`.

## 6) Persistenzkonzept (IndexedDB)

Die Daten liegen **ausschließlich lokal im Browser**:

- DB-Name: `dls-health`
- Object Store: `weeklyEntries`
- KeyPath: `isoWeekKey`
- Indizes: `isoWeekKey` (unique), `updatedAt`

`src/storage/db.ts` kapselt CRUD (`getByWeek`, `getAll`, `upsert`, `delete`, `clear`, `bulkUpsert`).

## 7) Fachlogik pro Feature

### Home
- Auswahl „x Wochen zurück“
- Laden des Wochen-Eintrags
- Radar-Chart mit Hauptkategorie-Scores

### Check-in
- Erstellen über frei wählbare ISO-Woche
- Autosave (Debounce + onBlur + beforeunload/visibilitychange)
- Manueller Save und „Abschicken“

### Entries
- Übersicht aller Wochen
- Ø-Wert über Hauptkategorien
- Bearbeiten/Löschen einzelner Wochen

### Analytics
- Zeitreihe je Hauptkategorie als Linien
- Zusätzliche gestrichelte Gesamtlinie (Durchschnitt)
- Kategorien einzeln ein-/ausblendbar

### Settings
- JSON-Export (`configVersion` + Einträge)
- JSON-Import mit Strukturprüfung + Konfliktbehandlung
- Komplettes Löschen lokaler Daten

## 8) Konfigurations- und Erweiterungspunkte

- `src/config/health-dimensions.json`
  - steuert Dimensionen, Subkategorien, Labels und Hilfetexte.
- `src/config/main-categories.ts`
  - steuert die 6 Hauptkategorien inkl. Farben/Icons/Reihenfolge im Radar/Analytics.

Bei Änderungen an IDs oder Struktur müssen auch Formular-, Analyse- und Migrations-/Normalisierungslogik geprüft werden.

## 9) Build, Betrieb und Deployment

## 9.1 Voraussetzungen

- Node.js 18+ (empfohlen: LTS)
- npm

## 9.2 Lokale Entwicklung

```bash
npm install
npm run dev
```

Standardmäßig läuft Vite lokal; URL wird im Terminal ausgegeben (typisch `http://localhost:5173`).

## 9.3 Produktionsbuild

```bash
npm run build
```

Erzeugt ein statisches Bundle in `dist/`.

Optional lokal prüfen:

```bash
npm run preview
```

## 9.4 Deployment (statisches Hosting)

Die Anwendung ist ein statisches SPA/PWA-Bundle und kann auf Netlify, Vercel, GitHub Pages, Nginx, Cloudflare Pages etc. betrieben werden.

### GitHub Pages (dieses Repository)

- Workflow-Datei: `.github/workflows/deploy-pages.yml`
- Trigger: Push auf `main` oder manueller `workflow_dispatch`
- Build: `npm ci && npm run build`
- Veröffentlichtes Artefakt: `dist/` über `actions/upload-pages-artifact` + `actions/deploy-pages`
- Wichtiger Basispfad: Vite-Option `base: "/DLS/"` in `vite.config.ts`

### Erforderliche Deploy-Regeln (allgemein)

1. **Build Command:** `npm run build`
2. **Publish Directory:** `dist`
3. **Routing-Konzept beachten:**
   - Die App nutzt `HashRouter`; dadurch sind direkte Refreshes von Unterseiten ohne Server-Rewrite stabil.
   - Bei Umstellung auf `BrowserRouter` muss ein SPA-Fallback auf `index.html` aktiv sein.

Beispiel Nginx (nur für BrowserRouter nötig):

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 9.5 Wichtige Betriebs-Hinweise

- Daten sind pro Browser/Endgerät lokal gespeichert (IndexedDB), nicht serverseitig synchronisiert.
- Bei App-Updates kann der PWA-Service-Worker aktualisierte Assets ausrollen; `registerType: 'autoUpdate'` ist aktiv.
- Für Datenmigration/Backup den JSON-Export aus dem Settings-Screen nutzen.

## 10) Qualitätssicherung

Verfügbare Checks:

```bash
npm run test
```

Der Akzeptanztest deckt u. a. Persistenzverhalten, Statuslogik, Dimensionsmittelwert und Importkonflikte ab.

---

## Dokumentations-DoD (Definition of Done)

Bei jedem PR, der Verhalten/Struktur/Deployment beeinflusst, muss diese Datei aktualisiert sein:

- [ ] Routen/Seiten aktuell
- [ ] Datenmodell aktuell
- [ ] Persistenz/Import-Export aktuell
- [ ] Build- & Deploy-Abschnitt aktuell
- [ ] Relevante neue Konfigurationspunkte dokumentiert
