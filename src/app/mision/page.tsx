'use client';

import React, { useEffect, useState } from 'react';
import { Mision } from '@/types/mision';
import * as misionService from '@/services/misionService';
import * as misionImageService from '@/services/misionImageService';
import { MisionImage } from '@/types/misionImage';
import styles from '@/components/MisionPage.module.css';
import Image from 'next/image';

type NotificationType = 'success' | 'error';

export default function MisionPage() {
  const [mision, setMision] = useState<Mision | null>(null);
  const [form, setForm] = useState<Partial<Mision>>({});
  const [images, setImages] = useState<MisionImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const misions = await misionService.fetchMisions();
        if (misions.length > 0) {
          setMision(misions[0]);
          setForm(misions[0]);
          const imgs = await misionImageService.getImagesByMision(misions[0].id);
          setImages(imgs);
        } else {
          setMision(null);
          setForm({});
          setImages([]);
        }
      } catch {
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Bildirim göster ve 3 sn sonra kapat
  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.title_tr || !form.title_en) {
      setError('Başlıklar zorunludur');
      return;
    }
    try {
      setLoading(true);
      if (mision) {
        const updated = await misionService.updateMision(mision.id, form);
        setMision(updated);
        setForm(updated);
        showNotification('Misyon başarıyla güncellendi.', 'success');
      } else {
        const created = await misionService.createMision(form);
        setMision(created);
        setForm(created);
        showNotification('Misyon başarıyla oluşturuldu.', 'success');
      }
      setError('');
    } catch {
      setError('Kaydetme başarısız');
      showNotification('Kaydetme işlemi başarısız oldu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!mision) return;
    if (!confirm('Misyon yazısını ve ona bağlı tüm resimleri silmek istediğinize emin misiniz?')) return;

    try {
      setLoading(true);

      // 1. Tüm resimleri paralel sil
      await Promise.all(images.map((img) => misionImageService.deleteImage(img.id)));

      // 2. Sonra Misyon kaydını sil
      await misionService.deleteMision(mision.id);

      setMision(null);
      setForm({});
      setImages([]);
      setError('');
      showNotification('Misyon ve tüm resimler başarıyla silindi.', 'success');
    } catch (error: unknown) {
      if (error instanceof Error) {
        const msg = error.message;
        setError(msg);
        showNotification(msg, 'error');
      } else {
        setError('Silme işlemi başarısız oldu.');
        showNotification('Silme işlemi başarısız oldu.', 'error');
      }
    }
    finally {
      setLoading(false);
    }
  };


  const handleImageUpload = async (file: File) => {
    if (!mision) return;
    try {
      setUploading(true);
      const newImage = await misionImageService.uploadImage(mision.id, file);
      setImages((prev) => [newImage, ...prev]);
      showNotification('Resim başarıyla yüklendi.', 'success');
    } catch {
      alert('Resim yükleme başarısız');
      showNotification('Resim yükleme başarısız oldu.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!mision) return;
    if (!confirm('Resmi silmek istediğinize emin misiniz?')) return;
    try {
      await misionImageService.deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showNotification('Resim başarıyla silindi.', 'success');
    } catch {
      alert('Silme işlemi başarısız');
      showNotification('Silme işlemi başarısız oldu.', 'error');
    }
  };

  return (
    <div className={styles.misionContainer}>
      <h1>Misyon</h1>
      {loading && <p className={styles.infoText}>Yükleniyor...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.formGroup}>
        <label>Başlık TR</label>
        <input
          name="title_tr"
          value={form.title_tr || ''}
          onChange={handleChange}
          className={styles.inputText}
          placeholder="Türkçe başlık"
        />

        <label>Başlık EN</label>
        <input
          name="title_en"
          value={form.title_en || ''}
          onChange={handleChange}
          className={styles.inputText}
          placeholder="İngilizce başlık"
        />

        <label>İçerik TR</label>
        <textarea
          name="content_tr"
          value={form.content_tr || ''}
          onChange={handleChange}
          rows={5}
          className={styles.inputTextarea}
          placeholder="Türkçe içerik"
        />

        <label>İçerik EN</label>
        <textarea
          name="content_en"
          value={form.content_en || ''}
          onChange={handleChange}
          rows={5}
          className={styles.inputTextarea}
          placeholder="İngilizce içerik"
        />

        <div className={styles.buttonGroup}>
          <button onClick={handleSave} disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
            {loading ? 'Kaydediliyor...' : mision ? 'Güncelle' : 'Kaydet'}
          </button>

          {mision && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className={`${styles.btn} ${styles.btnDanger}`}
              type="button"
            >
              Sil
            </button>
          )}
        </div>
      </div>

      {mision && (
        <div className={styles.imagesSection}>
          <h3>Resimler</h3>
          <div className={styles.imagesList}>
            {images.map((img) => (
              <div key={img.id} className={styles.imageItem}>
                <Image
                  src={`http://localhost:4000/${img.filePath.replace(/\\/g, '/')}`}
                  alt={img.originalName}
                  width={150}    // uygun genişlik
                  height={100}   // uygun yükseklik
                  className={styles.imageThumb}
                />

                <button
                  onClick={() => handleImageDelete(img.id)}
                  className={`${styles.btn} ${styles.btnDanger} ${styles.deleteBtn}`}
                  type="button"
                  aria-label="Resmi sil"
                >
                  ×
                </button>
              </div>
            ))}

            <label className={styles.uploadLabel} aria-label="Resim yükle">
              {uploading ? 'Yükleniyor...' : '+ Resim Ekle'}
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                disabled={uploading}
                aria-hidden="true"
              />
            </label>
          </div>
        </div>
      )}

      {notification && (
        <div
          className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError
            }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
