import { ChangeEvent } from 'react';
import { healthConfig } from '../../config/healthConfig';
import { createExport, detectConflicts, validatePayload } from '../../domain/importExport';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';

export function SettingsScreen() {
  async function onExport() {
    const entries = await weeklyEntryStore.getAll();
    const blob = new Blob([JSON.stringify(createExport(healthConfig.configVersion, entries), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const json: unknown = JSON.parse(text);
    if (!validatePayload(json, healthConfig)) {
      alert('Ungültige JSON-Struktur oder configVersion');
      return;
    }

    const existing = await weeklyEntryStore.getAll();
    const conflicts = detectConflicts(existing, json.entries);
    let toImport = json.entries;
    if (conflicts.length) {
      const overwrite = window.confirm(`${conflicts.length} Konflikte gefunden. Überschreiben?`);
      if (!overwrite) {
        const conflictWeeks = new Set(conflicts.map((c) => c.isoWeekKey));
        toImport = json.entries.filter((e) => !conflictWeeks.has(e.isoWeekKey));
      }
    }
    await weeklyEntryStore.bulkUpsert(toImport as WeeklyEntry[]);
    alert('Import abgeschlossen');
    event.target.value = '';
  }

  return (
    <section className="screen-stack">
      <div className="card">
        <h2>Einstellungen</h2>
        <p>Daten werden lokal in deinem Browser gespeichert (IndexedDB).</p>
      </div>

      <div className="card">
        <h3>Datenexport und Import</h3>
        <p className="secondary-text">Sichere deine Einträge lokal als JSON oder importiere bestehende Daten.</p>
        <div className="actions">
          <button onClick={() => void onExport()}>JSON Export</button>
          <label className="button outline">JSON Import<input type="file" accept="application/json" onChange={(e) => void onImport(e)} hidden /></label>
        </div>
      </div>

      <div className="card">
        <h3>Speicherhinweis</h3>
        <p className="secondary-text">Die Daten bleiben auf deinem Gerät gespeichert und werden nicht automatisch übertragen.</p>
      </div>

      <div className="card">
        <h3>Gefahrenbereich</h3>
        <p className="secondary-text">Diese Aktion löscht alle lokalen Daten unwiderruflich.</p>
        <button
          className="danger"
          onClick={async () => {
            if (window.confirm('Alle Daten wirklich löschen?')) {
              await weeklyEntryStore.clear();
              alert('Alle Daten gelöscht');
            }
          }}
        >
          Alle Daten löschen
        </button>
      </div>
    </section>
  );
}
