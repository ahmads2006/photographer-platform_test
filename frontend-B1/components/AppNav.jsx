'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useCallback } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', match: 'exact' },
  { href: '/feed', label: 'Feed', match: 'exact' },
  { href: '/challenges', label: 'Challenges', match: 'startsWith' },
  { href: '/gallery', label: 'Gallery', match: 'exact' },
  { href: '/chat', label: 'Chat', match: 'exact' },
  { href: '/profile', label: 'Profile', match: 'exact' },
  {
    href: '/admin/dashboard',
    label: 'Admin',
    match: 'startsWith',
    adminOnly: true,
  },
  {
    href: '/super-admin/dashboard',
    label: 'Super Admin',
    match: 'startsWith',
    superAdminOnly: true,
  },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Don't show nav on public auth pages
  if (['/login', '/register'].includes(pathname)) {
    return null;
  }

  // While auth context is loading, show nothing (or a skeleton)
  if (!user) {
    return (
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">Photonest</span>
          <nav aria-label="Main">Loading…</nav>
        </div>
      </header>
    );
  }

  const isActive = (item) =>
    item.match === 'exact'
      ? pathname === item.href
      : pathname.startsWith(item.href);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/dashboard" className="brand">
          Photonest
        </Link>

        <nav aria-label="Main">
          {navItems
            .filter(
              (item) =>
                !(item.adminOnly && !['admin', 'super_admin'].includes(user.role)) &&
                !(item.superAdminOnly && user.role !== 'super_admin')
            )
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item) ? 'active' : ''}
                aria-current={isActive(item) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="topbar-right">
          <Link href="/profile" className="user-chip">
            {user.name}
          </Link>
          <button className="outline-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}