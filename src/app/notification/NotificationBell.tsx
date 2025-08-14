'use client';

import { useEffect, useRef, useState } from 'react';
import { adminNotificationService } from '@/services/notificationService';
import { Notification } from '@/types/notification';
import styles from '@/components/Navbar.module.css';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
  email?: string | null;
}

export default function NotificationBell({ email }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Bildirimleri getir
  const fetchNotifications = async () => {
    try {
      const data = await adminNotificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
    }
  };

  // İlk yükleme + popup açıkken fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (showPopup) fetchNotifications();
  }, [showPopup]);

  // Polling: her 10 saniyede bir bildirimleri güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Dış tıklama ile kapatma
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Bildirime tıklama
  const handleNotificationClick = async (notification: Notification) => {
  if (!notification.isRead && (notification.type !== 'message' && notification.type !== 'review') ){
    try {
      await adminNotificationService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenemedi:', error);
    }
  }

  if (notification.relatedId) {
    if (notification.type === 'message') {
      router.push(`/contact?messageId=${notification.relatedId}`);
      setShowPopup(false);
    } else if (notification.type === 'review') {
      router.push(`/review?reviewId=${notification.relatedId}`);
      setShowPopup(false);
    }
  }
};


  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span className={styles.email} title={email ?? ''} style={{ userSelect: 'text', cursor: 'default' }}>
        {email}
      </span>

      {/* 🔔 Bildirim simgesi, sadece buraya tıklanınca popup açılır */}
      <span
        className={styles.notificationIcon}
        onClick={() => setShowPopup(!showPopup)}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={showPopup}
        style={{ cursor: 'pointer', marginLeft: '0.5rem' }}
        title="Bildirimler"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowPopup(!showPopup);
            e.preventDefault();
          }
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span className={styles.notificationBadge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </span>

      {showPopup && (
        <div className={styles.notificationPopup} role="dialog" aria-label="Yeni Bildirimler">
          {notifications.length === 0 ? (
            <p>Yeni bildiriminiz yok.</p>
          ) : (
            <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
              {notifications.map(n => (
                <li
                  key={n.id}
                  style={{
                    fontWeight: n.isRead ? 'normal' : '700',
                    cursor: 'pointer',
                    padding: '8px',
                    borderBottom: '1px solid #ccc',
                    backgroundColor: n.isRead ? 'transparent' : '#dbeafe',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    handleNotificationClick(n);
                  }}
                  title={`${n.title}${n.body ? '\n' + n.body : ''}`}
                >
                  <strong>{n.type.toUpperCase()}</strong> - {n.title}
                  <br />
                  <small style={{ fontSize: '0.8rem', color: '#555' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
