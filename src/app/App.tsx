import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ThisWeekScreen } from '../features/checkin/ThisWeekScreen';
import { WeeklyFormScreen } from '../features/checkin/WeeklyFormScreen';
import { EntriesScreen } from '../features/entries/EntriesScreen';
import { AnalyticsScreen } from '../features/analytics/AnalyticsScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { CreateProtocolScreen } from '../features/checkin/CreateProtocolScreen';

function LegacyCreateProtocolRoute() {
  return <Navigate to="/protokoll" replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/protokoll" element={<CreateProtocolScreen />} />
        <Route path="/protokoll-anlegen" element={<LegacyCreateProtocolRoute />} />
        <Route path="/checkin/:isoWeekKey" element={<WeeklyFormScreen />} />
        <Route path="/entries" element={<EntriesScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/erweiterte-auswertung" element={<AnalyticsScreen />} />
        <Route path="/this-week" element={<ThisWeekScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
