'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';  // Next.js Image bileşeni
import { About } from '@/types/about';
import * as aboutService from '@/services/aboutService';
import * as aboutImageService from '@/services/aboutImageService';
import { AboutImage } from '@/types/aboutImage';
import styles from '@/components/AboutPage.module.css';

type NotificationType = 'success' | 'error';

// Error tipi için güvenli kontrol fonksiyonu
function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    // @ts-expect-error: response tipini kontrol et
    return error.response?.data?.message ?? String(error);
  }
  return String(error);
}

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [form, setForm] = useState<Partial<About>>({});
  const [images, setImages] = useState<AboutImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const abouts = await aboutService.fetchAbouts();
        if (abouts.length > 0) {
          setAbout(abouts[0]);
          setForm(abouts[0]);
          const imgs = await aboutImageService.getImagesByAbout(abouts[0].id);
          setImages(imgs);
        } else {
          setAbout(null);
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
      if (about) {
        const updated = await aboutService.updateAbout(about.id, form);
        setAbout(updated);
        setForm(updated);
        showNotification('Hakkımızda başarıyla güncellendi.', 'success');
      } else {
        const created = await aboutService.createAbout(form);
        setAbout(created);
        setForm(created);
        showNotification('Hakkımızda başarıyla oluşturuldu.', 'success');
      }
      setError('');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      setError(msg);
      showNotification('Kaydetme işlemi başarısız oldu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!about) return;
    if (!confirm('Hakkımızda yazısını ve ona bağlı tüm resimleri silmek istediğinize emin misiniz?')) return;

    try {
      setLoading(true);

      await Promise.all(images.map((img) => aboutImageService.deleteImage(img.id)));
      await aboutService.deleteAbout(about.id);

      setAbout(null);
      setForm({});
      setImages([]);
      setError('');
      showNotification('Hakkımızda ve tüm resimler başarıyla silindi.', 'success');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!about) return;
    try {
      setUploading(true);
      const newImage = await aboutImageService.uploadImage(about.id, file);
      setImages((prev) => [newImage, ...prev]);
      showNotification('Resim başarıyla yüklendi.', 'success');
    } catch {
      showNotification('Resim yükleme başarısız oldu.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!about) return;
    if (!confirm('Resmi silmek istediğinize emin misiniz?')) return;
    try {
      await aboutImageService.deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showNotification('Resim başarıyla silindi.', 'success');
    } catch {
      showNotification('Silme işlemi başarısız oldu.', 'error');
    }
  };

  return (
    <div className={styles.aboutContainer}>
      <h1>Hakkımızda</h1>
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
            {loading ? 'Kaydediliyor...' : about ? 'Güncelle' : 'Kaydet'}
          </button>

          {about && (
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

      {about && (
        <div className={styles.imagesSection}>
          <h3>Resimler</h3>
          <div className={styles.imagesList}>
            {images.map((img) => (
              <div key={img.id} className={styles.imageItem}>
                <Image
                  src={`https://a06205d12400.ngrok-free.app/${img.filePath.replace(/\\/g, '/')}`}
                  alt={img.originalName}
                  width={150}
                  height={100}
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
          className={`${styles.notification} ${
            notification.type === 'success' ? styles.notificationSuccess : styles.notificationError
          }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
