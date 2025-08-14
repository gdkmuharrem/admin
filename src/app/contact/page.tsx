'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminContactService } from '@/services/contactService';
import styles from '@/components/ContactPage.module.css';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function ContactPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const messageId = searchParams.get('messageId');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchIsRead, setSearchIsRead] = useState<'all' | 'read' | 'unread'>('all');

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await adminContactService.getAllMessages();
      setMessages(data);
      setError('');
    } catch {
      setError('Mesajlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Mesaj ID varsa ve mesajlar yüklendiyse filtreleri otomatik doldur
  useEffect(() => {
    if (!messages.length || !messageId) return;

    const found = messages.find((m) => m.id === messageId);
    if (found) {
      setSearchName(found.name);
      setSearchEmail(found.email);
      setSearchPhone(found.phone ?? '');
      setSearchDate(new Date(found.createdAt).toISOString().slice(0, 10));
      setSearchIsRead(found.isRead ? 'read' : 'unread');
    }
  }, [messages, messageId]);

  // Filtreleri temizleme fonksiyonu
  const clearFilters = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchPhone('');
    setSearchDate('');
    setSearchIsRead('all');

    // URL'den messageId'yi temizle
    const params = new URLSearchParams(window.location.search);
    if (params.has('messageId')) {
      params.delete('messageId');
      const queryString = params.toString();
      router.replace(`/contact${queryString ? '?' + queryString : ''}`, { scroll: false });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    setDeletingId(id);
    try {
      await adminContactService.deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));

      // Silme başarılıysa URL'den messageId temizle
      const params = new URLSearchParams(window.location.search);
      if (params.get('messageId') === id) {
        params.delete('messageId');
        const queryString = params.toString();
        router.replace(`/contact${queryString ? '?' + queryString : ''}`, { scroll: false });
      }
    } catch {
      alert('Silme işlemi başarısız oldu.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setMarkingReadId(id);
    try {
      const updated = await adminContactService.markAsRead(id);
      setMessages((prev) => prev.map((msg) => (msg.id === id ? updated : msg)));
    } catch {
      alert('Okundu olarak işaretleme başarısız oldu.');
    } finally {
      setMarkingReadId(null);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const nameMatch = msg.name.toLowerCase().includes(searchName.toLowerCase());
    const emailMatch = msg.email.toLowerCase().includes(searchEmail.toLowerCase());
    const phoneMatch = searchPhone ? (msg.phone ?? '').includes(searchPhone) : true;
    const dateMatch = searchDate
      ? new Date(msg.createdAt).toISOString().slice(0, 10) === searchDate
      : true;
    const isReadMatch =
      searchIsRead === 'all' ? true : searchIsRead === 'read' ? msg.isRead : !msg.isRead;

    return nameMatch && emailMatch && phoneMatch && dateMatch && isReadMatch;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>İletişim Mesajları</h1>

      {/* Filtreleme alanı */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Ad"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Telefon"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <select
          value={searchIsRead}
          onChange={(e) => setSearchIsRead(e.target.value as 'all' | 'read' | 'unread')}
          className={styles.readFilter}
          aria-label="Okunma Durumu"
        >
          <option value="all">Tümü</option>
          <option value="read">Okundu</option>
          <option value="unread">Okunmadı</option>
        </select>
        <button
          type="button"
          className={styles.clearFiltersButton}
          onClick={clearFilters}
        >
          Filtreleri Temizle
        </button>
      </div>

      {/* Durum mesajları */}
      {loading && <p>Yükleniyor...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && filteredMessages.length === 0 && <p>Hiç mesaj bulunamadı.</p>}

      {/* Mesaj listesi */}
      <ul className={styles.messageList}>
        {filteredMessages.map((msg) => (
          <li
            key={msg.id}
            className={styles.messageItem}
            style={{
              backgroundColor: msg.isRead ? '#f9f9f9' : '#f8d7da',
              borderLeftColor: msg.isRead ? '#0f4c81' : '#dc3545',
              opacity: 1,
            }}
          >
            <div><strong>Ad:</strong> {msg.name}</div>
            <div><strong>Email:</strong> {msg.email}</div>
            {msg.phone && <div><strong>Telefon:</strong> {msg.phone}</div>}
            <div><strong>Mesaj:</strong> {msg.message}</div>
            <div className={styles.date}>
              Gönderilme Tarihi: {new Date(msg.createdAt).toLocaleString()}
            </div>

            {!msg.isRead && (
              <button
                onClick={() => handleMarkAsRead(msg.id)}
                disabled={markingReadId === msg.id}
                className={styles.readButton}
              >
                {markingReadId === msg.id ? 'Okundu olarak işaretleniyor...' : 'Okundu olarak işaretle'}
              </button>
            )}

            <button
              onClick={() => handleDelete(msg.id)}
              disabled={deletingId === msg.id}
              className={styles.deleteButton}
            >
              {deletingId === msg.id ? 'Siliniyor...' : 'Sil'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
