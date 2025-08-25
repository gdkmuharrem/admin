'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Vision, ContentItem } from '@/types/vision';
import { VisionService } from '@/services/visionService';
import * as visionImageService from '@/services/visionImageService';
import { VisionImage } from '@/types/visionImage';
import styles from '@/components/VisionPage.module.css';
import { AxiosError } from 'axios';

type NotificationType = 'success' | 'error';

const visionService = new VisionService();

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message;
  }
  return String(error);
}

interface CreateVisionDto {
  title_tr: string;
  title_en: string;
  contents: ContentItem[];
}

export default function VisionPage() {
  const [vision, setVision] = useState<Vision | null>(null);
  const [form, setForm] = useState<Partial<Vision>>({});
  const [images, setImages] = useState<VisionImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const visions = await visionService.getAllVisions();
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

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (index: number, field: keyof ContentItem, value: string) => {
    const newContents = [...(form.contents || [])];
    newContents[index] = { ...newContents[index], [field]: value };
    setForm({ ...form, contents: newContents });
  };

  const addContent = () => {
    const newContents = [...(form.contents || []), { content_tr: '', content_en: '' }];
    setForm({ ...form, contents: newContents });
  };

  const removeContent = (index: number) => {
    const newContents = [...(form.contents || [])];
    newContents.splice(index, 1);
    setForm({ ...form, contents: newContents });
  };

  const handleSave = async () => {
    if (!form.title_tr || !form.title_en) {
      setError('Başlıklar zorunludur');
      return;
    }
    if (!form.contents || form.contents.length === 0) {
      setError('En az bir içerik eklemelisiniz');
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
        const dto: CreateVisionDto = {
          title_tr: form.title_tr!,
          title_en: form.title_en!,
          contents: form.contents as ContentItem[],
        };
        const created = await visionService.createVision(dto);
        setVision(created);
        setForm(created);
        showNotification('Vizyon başarıyla oluşturuldu.', 'success');
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
    if (!vision) return;
    if (!confirm('Vizyon yazısını ve ona bağlı tüm resimleri silmek istediğinize emin misiniz?')) return;

    try {
      setLoading(true);
      await Promise.all(images.map((img) => visionImageService.deleteImage(img.id)));
      await visionService.deleteVision(vision.id);

      setVision(null);
      setForm({});
      setImages([]);
      setError('');
      showNotification('Vizyon ve tüm resimler başarıyla silindi.', 'success');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      setError(msg);
      showNotification(msg, 'error');
    } finally {
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
      showNotification('Silme işlemi başarısız oldu.', 'error');
    }
  };

  const handlePreview = (imgPath: string) => {
    setPreviewImage(`http://localhost:4000/${imgPath.replace(/\\/g, '/')}`);
  };

  const closePreview = () => setPreviewImage(null);

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
          onChange={(e) => setForm({ ...form, title_tr: e.target.value })}
          className={styles.inputText}
          placeholder="Türkçe başlık"
        />

        <label>Başlık EN</label>
        <input
          name="title_en"
          value={form.title_en || ''}
          onChange={(e) => setForm({ ...form, title_en: e.target.value })}
          className={styles.inputText}
          placeholder="İngilizce başlık"
        />

        <h3>İçerikler</h3>
        {(form.contents || []).map((content, index) => (
          <div key={index} className={styles.contentCard}>
            <div className={styles.cardSection}>
              <span className={styles.langLabel}>TR</span>
              <textarea
                value={content.content_tr}
                placeholder="Türkçe içerik"
                onChange={(e) => handleChange(index, 'content_tr', e.target.value)}
                className={styles.inputTextarea}
                rows={3}
              />
            </div>
            <div className={styles.cardSection}>
              <span className={styles.langLabel}>EN</span>
              <textarea
                value={content.content_en}
                placeholder="İngilizce içerik"
                onChange={(e) => handleChange(index, 'content_en', e.target.value)}
                className={styles.inputTextarea}
                rows={3}
              />
            </div>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger} ${styles.deleteBtnContent}`}
              onClick={() => removeContent(index)}
            >
              Sil
            </button>
          </div>
        ))}

        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={addContent}>
          + İçerik Ekle
        </button>

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
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${img.filePath.replace(/\\/g, '/')}`}
                  alt={img.originalName}
                  width={150}
                  height={100}
                  className={styles.imageThumb}
                  onClick={() => handlePreview(img.filePath)}
                  style={{ cursor: 'pointer' }}
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

      {previewImage && (
        <div className={styles.modalOverlay} onClick={closePreview}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={closePreview}>×</button>
            <Image
              src={previewImage}
              alt="Preview"
              width={800}
              height={600}
              style={{ objectFit: 'contain' }}
              className={styles.modalImage}
            />
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
