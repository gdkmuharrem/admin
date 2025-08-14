'use client';

import React, { useEffect, useState } from 'react';
import { Vision } from '@/types/vision';
import * as visionService from '@/services/visionService';
import * as visionImageService from '@/services/visionImageService';
import { VisionImage } from '@/types/visionImage';
import styles from '@/components/VisionPage.module.css';
import Image from 'next/image';

type NotificationType = 'success' | 'error';

export default function VisionPage() {
  const [vision, setVision] = useState<Vision | null>(null);
  const [form, setForm] = useState<Partial<Vision>>({});
  const [images, setImages] = useState<VisionImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const visions = await visionService.fetchVisions();
        if (visions.length > 0) {
          setVision(visions[0]);
          setForm(visions[0]);
          const imgs = await visionImageService.getImagesByVision(visions[0].id);
          setImages(imgs);
        } else {
          setVision(null);
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
      if (vision) {
        const updated = await visionService.updateVision(vision.id, form);
        setVision(updated);
        setForm(updated);
        showNotification('Vizyon başarıyla güncellendi.', 'success');
      } else {
        const created = await visionService.createVision(form);
        setVision(created);
        setForm(created);
        showNotification('Vizyon başarıyla oluşturuldu.', 'success');
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
    if (!vision) return;
    if (!confirm('Vizyon yazısını ve ona bağlı tüm resimleri silmek istediğinize emin misiniz?')) return;

    try {
      setLoading(true);

      // 1. Tüm resimleri paralel sil
      await Promise.all(images.map((img) => visionImageService.deleteImage(img.id)));

      // 2. Sonra Vizyon kaydını sil
      await visionService.deleteVision(vision.id);

      setVision(null);
      setForm({});
      setImages([]);
      setError('');
      showNotification('Vizyon ve tüm resimler başarıyla silindi.', 'success');
    } catch (error) {
      console.error('Silme hatası:', error);
      const msg =
        error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? (error.response.data.message as string)
          : error && typeof error === 'object' && 'message' in error
            ? (error.message as string)
            : 'Silme işlemi başarısız oldu.';
      setError(msg);
      showNotification(msg, 'error');
    }
    finally {
      setLoading(false);
    }
  };


  const handleImageUpload = async (file: File) => {
    if (!vision) return;
    try {
      setUploading(true);
      const newImage = await visionImageService.uploadImage(vision.id, file);
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
    if (!vision) return;
    if (!confirm('Resmi silmek istediğinize emin misiniz?')) return;
    try {
      await visionImageService.deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showNotification('Resim başarıyla silindi.', 'success');
    } catch {
      alert('Silme işlemi başarısız');
      showNotification('Silme işlemi başarısız oldu.', 'error');
    }
  };

  return (
    <div className={styles.visionContainer}>
      <h1>Vizyon</h1>
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
            {loading ? 'Kaydediliyor...' : vision ? 'Güncelle' : 'Kaydet'}
          </button>

          {vision && (
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

      {vision && (
        <div className={styles.imagesSection}>
          <h3>Resimler</h3>
          <div className={styles.imagesList}>
            {images.map((img) => (
              <div key={img.id} className={styles.imageItem}>
                <Image
                  src={`https://a06205d12400.ngrok-free.app/${img.filePath.replace(/\\/g, '/')}`}
                  alt={img.originalName}
                  width={150}        // uygun genişlik
                  height={150}       // uygun yükseklik
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
