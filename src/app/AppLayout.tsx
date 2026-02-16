import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="app-shell">
      <header>
        <h1>DLS Weekly Check-in</h1>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
