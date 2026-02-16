import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  {
    to: '/protokoll',
    label: 'Protokoll',
    icon: (
      <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
        <path d="M6 3h9l3 3v15H6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M15 3v3h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20H4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: '/erweiterte-auswertung',
    label: 'Auswertung',
    icon: (
      <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
        <path d="M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 15.5 10 11l3 2.5L18 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: '/settings',
    label: 'Einstellungen',
    icon: (
      <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
        <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19 12a7.3 7.3 0 0 0-.12-1.3l1.75-1.36-1.8-3.12-2.1.63A7.9 7.9 0 0 0 14.5 5l-.44-2.14h-3.6L10.02 5a7.9 7.9 0 0 0-2.23 1.85l-2.1-.63-1.8 3.12 1.75 1.37A7.3 7.3 0 0 0 5 12c0 .44.04.87.12 1.3l-1.75 1.36 1.8 3.12 2.1-.63A7.9 7.9 0 0 0 9.5 19l.44 2.14h3.6L14.5 19a7.9 7.9 0 0 0 2.23-1.85l2.1.63 1.8-3.12-1.75-1.37c.08-.42.12-.85.12-1.29Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    )
  }
];

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header>
        <h1>DLS Weekly Check-in</h1>
      </header>
      <main key={location.pathname} className="app-main">
        <Outlet />
      </main>
      <footer className="bottom-nav" aria-label="Hauptnavigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </footer>
    </div>
  );
}
