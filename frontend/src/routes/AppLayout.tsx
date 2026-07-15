import { NavLink, Outlet } from 'react-router';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workers', label: 'Workforce' },
  { to: '/incidents', label: 'Incidents' },
];

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <span className="text-lg font-semibold text-brand-700">MineTech</span>
            <nav className="flex gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100',
                      isActive && 'bg-brand-50 text-brand-700',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">
              {user?.fullName} · <span className="uppercase">{user?.role}</span>
            </span>
            <Button size="sm" variant="ghost" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
