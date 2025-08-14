'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/components/Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const menuItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Kategoriler', href: '/category' },
  { label: 'İletişim Mesajları', href: '/contact' },
  { label: 'Ürünler', href: '/product' },
  { label: 'Ürün-Resimleri', href: '/product-image' },
  { label: 'Yorumlar', href: '/review' },
  { label: 'Hakkımızda', href: '/about' },
  { label: 'Vizyon', href: '/vision' },
  { label: 'Misyon', href: '/mision' },
  { label: 'Logs', href: '/logs' },
];

export default function Sidebar({ isOpen, onClose, className = '' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      ></div>

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${className}`}>
        <nav className={styles.nav}>
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={pathname === item.href ? styles.active : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
