'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentAdmin, logout } from '@/services/authService';
import { Admin } from '@/types/auth';
import Navbar from '@/app/Navbar';
import Sidebar from '@/app/Sidebar';
import styles from '@/components/Layout.module.css';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar responsive kontrolü
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    setSidebarOpen(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Admin auth kontrolü
  useEffect(() => {
    if (pathname.startsWith('/login')) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const user = await getCurrentAdmin();
        if (!user) {
          await logout();
          router.replace('/login');
          return;
        }
        setAdmin(user);
      } catch {
        await logout();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4"></div>
      </div>
    );
  }

  // Login sayfası layout'u
  if (pathname.startsWith('/login')) {
    return <div className={styles.loginOnly}>{children}</div>;
  }

  // Admin panel layout
  return (
    <div className={styles.layoutContainer}>
      <Navbar
        email={admin?.email}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={sidebarOpen}
      />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className={styles.mainContent} onClick={closeSidebar}>
        {children}
      </main>
    </div>
  );
}
