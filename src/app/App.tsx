import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ThisWeekScreen } from '../features/checkin/ThisWeekScreen';
import { WeeklyFormScreen } from '../features/checkin/WeeklyFormScreen';
import { EntriesScreen } from '../features/entries/EntriesScreen';
import { AnalyticsScreen } from '../features/analytics/AnalyticsScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<ThisWeekScreen />} />
        <Route path="/checkin/:isoWeekKey" element={<WeeklyFormScreen />} />
        <Route path="/entries" element={<EntriesScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
