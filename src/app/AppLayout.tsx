import { NavLink, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="app-shell">
      <header>
        <h1>DLS Weekly Check-in</h1>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="bottom-nav" aria-label="Hauptnavigation">
        <NavLink to="/protokoll-anlegen">Protokoll anlegen</NavLink>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/erweiterte-auswertung">erweiterte Auswertung</NavLink>
      </footer>
    </div>
  );
}
