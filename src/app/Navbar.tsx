'use client';

import React from 'react';
import NotificationBell from '@/app/notification/NotificationBell'; // common altına koydum, path'ı sen ayarla
import styles from '@/components/Navbar.module.css';

interface NavbarProps {
  email?: string | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({
  email,
  onLogout,
  onToggleSidebar,
  isSidebarOpen,
}: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <button
          aria-label="Toggle menu"
          className={styles.menuButton}
          onClick={onToggleSidebar}
        >
          <span
            className={`${styles.bar} ${
              isSidebarOpen ? styles.bar1Active : ''
            }`}
          ></span>
          <span
            className={`${styles.bar} ${
              isSidebarOpen ? styles.bar2Active : ''
            }`}
          ></span>
          <span
            className={`${styles.bar} ${
              isSidebarOpen ? styles.bar3Active : ''
            }`}
          ></span>
        </button>

        <div className={styles.brand}>Admin Panel</div>
      </div>

      <div className={styles.right}>
        <NotificationBell email={email} />
        <button onClick={onLogout} className={styles.logoutButton}>
          Çıkış Yap
        </button>
      </div>
    </nav>
  );
}
