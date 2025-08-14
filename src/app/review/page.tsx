'use client';

import React, { useEffect, useState } from 'react';
import { adminReviewService } from '@/services/reviewService';
import * as productService from '@/services/productService';
import styles from '@/components/ReviewPage.module.css';

interface Review {
  id: string;
  name: string;
  email: string;
  content: string;
  productId?: string | null;
  approved: boolean;
  isActive: boolean; // Okundu mu durumu
  createdAt: string;
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchProductId, setSearchProductId] = useState<string | null>(null);

  const [products, setProducts] = useState<{ id: string; name_tr: string }[]>([]);

  // Reviewleri getir
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminReviewService.getAllReviews();
      setReviews(data);
      setError('');
    } catch {
      setError('Yorumlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Ürünleri getir
  const fetchProducts = async () => {
    try {
      const prods = await productService.fetchProducts();
      setProducts(prods);
    } catch {
      // Ürün yüklenemezse sessiz geç
    }
  };

  // Sayfa yüklendiğinde review ve ürünleri getir
  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;
    setDeletingId(id);
    try {
      await adminReviewService.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Silme işlemi başarısız oldu.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleApproveToggle = async (id: string, approved: boolean) => {
    setApprovingId(id);
    try {
      await adminReviewService.updateApproval(id, !approved);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, approved: !approved } : r))
      );
    } catch {
      alert('Onay durumu güncellenemedi.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setMarkingReadId(id);
    try {
      await adminReviewService.markAsRead(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: true } : r))
      );
    } catch {
      alert('Okundu olarak işaretleme başarısız oldu.');
    } finally {
      setMarkingReadId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const nameMatch = r.name.toLowerCase().includes(searchName.toLowerCase());
    const emailMatch = r.email.toLowerCase().includes(searchEmail.toLowerCase());
    const productMatch = searchProductId ? r.productId === searchProductId : true;
    return nameMatch && emailMatch && productMatch;
  });

  const getProductName = (productId?: string | null) => {
    if (!productId) return '-';
    const product = products.find((p) => p.id === productId);
    return product ? product.name_tr : productId;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Yorumlar</h1>

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
        <select
          value={searchProductId || ''}
          onChange={(e) => setSearchProductId(e.target.value || null)}
          className={styles.readFilter}
          aria-label="Ürün"
        >
          <option value="">Tümü</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name_tr}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Yükleniyor...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && filteredReviews.length === 0 && <p>Hiç yorum bulunamadı.</p>}

      <ul className={styles.messageList}>
        {filteredReviews.map((r) => (
          <li
            key={r.id}
            className={styles.messageItem}
            style={{
              backgroundColor: r.isActive ? '#f9f9f9' : '#f8d7da',
              borderLeftColor: r.isActive ? '#0f4c81' : '#dc3545',
              opacity: 1,
            }}
          >
            <div><strong>Ad:</strong> {r.name}</div>
            <div><strong>Email:</strong> {r.email}</div>
            <div><strong>Yorum:</strong> {r.content}</div>
            <div><strong>Ürün:</strong> {getProductName(r.productId)}</div>
            <div className={styles.date}>
              Gönderilme Tarihi: {new Date(r.createdAt).toLocaleString()}
            </div>

            {!r.isActive && (
              <button
                onClick={() => handleMarkAsRead(r.id)}
                disabled={markingReadId === r.id}
                className={styles.readButton}
              >
                {markingReadId === r.id ? 'Okundu olarak işaretleniyor...' : 'Okundu olarak işaretle'}
              </button>
            )}

            <button
              onClick={() => handleApproveToggle(r.id, r.approved)}
              disabled={approvingId === r.id}
              className={styles.toggleApproveButton}
              style={{
                backgroundColor: r.approved ? '#16a34a' : '#dc3545',
              }}
              title={r.approved ? 'Onay Kaldır' : 'Onayla'}
            >
              {approvingId === r.id
                ? 'Güncelleniyor...'
                : r.approved
                  ? 'Onaylı'
                  : 'Onayla'}
            </button>

            <button
              onClick={() => handleDelete(r.id)}
              disabled={deletingId === r.id}
              className={styles.deleteButton}
            >
              {deletingId === r.id ? 'Siliniyor...' : 'Sil'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
