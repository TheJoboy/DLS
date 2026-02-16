import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Diese Woche' },
  { to: '/entries', label: 'Protokolle' },
  { to: '/analytics', label: 'Auswertung' },
  { to: '/settings', label: 'Einstellungen' }
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <header>
        <h1>DLS Weekly Check-in</h1>
      </header>
      <nav aria-label="Hauptnavigation" className="nav-list">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
