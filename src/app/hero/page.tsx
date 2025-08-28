'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Hero } from '@/types/hero';
import { HeroService } from '@/services/heroService';
import * as heroImageService from '@/services/heroImageService';
import * as heroModelService from '@/services/heroModelService';
import { HeroImage } from '@/types/heroImage';
import { HeroModel } from '@/types/heroModel';
import styles from '@/components/HeroPage.module.css';
import { AxiosError } from 'axios';

type NotificationType = 'success' | 'error';
type MediaTab = 'images' | 'models';

const heroService = new HeroService();

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message;
  }
  return String(error);
}

export default function HeroPage() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [form, setForm] = useState<Partial<Hero>>({ isActive: true });
  const [images, setImages] = useState<HeroImage[]>([]);
  const [models, setModels] = useState<HeroModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MediaTab>('images');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const heroes = await heroService.getAllHeroes();
        if (heroes.length > 0) {
          setHero(heroes[0]);
          setForm(heroes[0]);
          
          // Load images and models
          const [heroImages, heroModels] = await Promise.all([
            heroImageService.getImagesByHero(heroes[0].id),
            heroModelService.getModelsByHero(heroes[0].id)
          ]);
          
          setImages(heroImages);
          setModels(heroModels);
        } else {
          setHero(null);
          setForm({ isActive: true });
          setImages([]);
          setModels([]);
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

  const handleSave = async () => {
    try {
      setLoading(true);
      if (hero) {
        const updated = await heroService.updateHero(hero.id, form);
        setHero(updated);
        setForm(updated);
        showNotification('Hero başarıyla güncellendi.', 'success');
      } else {
        const created = await heroService.createHero(form as { isActive: boolean });
        setHero(created);
        setForm(created);
        showNotification('Hero başarıyla oluşturuldu.', 'success');
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
    if (!hero) return;
    if (!confirm('Hero içeriğini ve ona bağlı tüm medyaları silmek istediğinize emin misiniz?')) return;

    try {
      setLoading(true);
      // Delete all images and models
      await Promise.all([
        ...images.map((img) => heroImageService.deleteImage(img.id)),
        ...models.map((model) => heroModelService.deleteModel(model.id))
      ]);
      
      await heroService.deleteHero(hero.id);

      setHero(null);
      setForm({ isActive: true });
      setImages([]);
      setModels([]);
      setError('');
      showNotification('Hero ve tüm medyalar başarıyla silindi.', 'success');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!hero) return;
    try {
      setUploadingImage(true);
      const newImage = await heroImageService.uploadImage(hero.id, file);
      setImages((prev) => [newImage, ...prev]);
      showNotification('Resim başarıyla yüklendi.', 'success');
    } catch {
      showNotification('Resim yükleme başarısız oldu.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleModelUpload = async (file: File) => {
    if (!hero) return;
    try {
      setUploadingModel(true);
      const newModel = await heroModelService.uploadModel(hero.id, file);
      setModels((prev) => [newModel, ...prev]);
      showNotification('3D model başarıyla yüklendi.', 'success');
    } catch {
      showNotification('3D model yükleme başarısız oldu.', 'error');
    } finally {
      setUploadingModel(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!hero) return;
    if (!confirm('Resmi silmek istediğinize emin misiniz?')) return;
    try {
      await heroImageService.deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showNotification('Resim başarıyla silindi.', 'success');
    } catch {
      showNotification('Silme işlemi başarısız oldu.', 'error');
    }
  };

  const handleModelDelete = async (modelId: string) => {
    if (!hero) return;
    if (!confirm('3D modeli silmek istediğinize emin misiniz?')) return;
    try {
      await heroModelService.deleteModel(modelId);
      setModels((prev) => prev.filter((model) => model.id !== modelId));
      showNotification('3D model başarıyla silindi.', 'success');
    } catch {
      showNotification('Silme işlemi başarısız oldu.', 'error');
    }
  };

  const handlePreview = (imgPath: string) => {
    setPreviewImage(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${imgPath.replace(/\\/g, '/')}`);
  };

  const closePreview = () => setPreviewImage(null);

  return (
    <div className={styles.heroContainer}>
      <h1 className={styles.h1}>Hero Yönetimi</h1>
      {loading && <p className={styles.infoText}>Yükleniyor...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.formGroup}>
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive || false}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className={styles.checkbox}
          />
          <label htmlFor="isActive">Aktif</label>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            {loading ? 'Kaydediliyor...' : hero ? 'Güncelle' : 'Kaydet'}
          </button>
          {hero && (
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

      {hero && (
        <div className={styles.mediaSection}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'images' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('images')}
            >
              Resimler
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'models' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('models')}
            >
              3D Modeller
            </button>
          </div>

          {activeTab === 'images' && (
            <div className={styles.tabContentActive}>
              <h3>Resimler</h3>
              <div className={styles.mediaList}>
                {images.map((img) => (
                  <div key={img.id} className={styles.mediaItem}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${img.filePath.replace(/\\/g, '/')}`}
                      alt={img.originalName}
                      width={150}
                      height={100}
                      style={{ width: 'auto', height: 'auto', cursor: 'pointer' }}
                      priority
                      className={styles.imageThumb}
                      onClick={() => handlePreview(img.filePath)}
                    />
                    <button
                      onClick={() => handleImageDelete(img.id)}
                      className={styles.deleteBtn}
                      type="button"
                      aria-label="Resmi sil"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className={styles.uploadLabel} aria-label="Resim yükle">
                  {uploadingImage ? 'Yükleniyor...' : (
                    <>
                      +
                      <span className={styles.uploadLabelSmall}>Resim Ekle</span>
                    </>
                  )}
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
                    disabled={uploadingImage}
                    aria-hidden="true"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className={styles.tabContentActive}>
              <h3>3D Modeller</h3>
              <div className={styles.mediaList}>
                {models.map((model) => (
                  <div key={model.id} className={styles.mediaItem}>
                    <div className={styles.modelThumb}>
                      {model.originalName}
                    </div>
                    <button
                      onClick={() => handleModelDelete(model.id)}
                      className={styles.deleteBtn}
                      type="button"
                      aria-label="Modeli sil"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className={styles.uploadLabel} aria-label="Model yükle">
                  {uploadingModel ? 'Yükleniyor...' : (
                    <>
                      +
                      <span className={styles.uploadLabelSmall}>Model Ekle</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".obj,.gltf,.glb,.stl,.fbx"
                    className={styles.fileInput}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleModelUpload(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                    disabled={uploadingModel}
                    aria-hidden="true"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {previewImage && (
        <div className={styles.modalOverlay} onClick={closePreview}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={closePreview}>
              ×
            </button>
            <Image
              src={previewImage}
              alt="Preview"
              width={800}
              height={600}
              style={{ width: 'auto', height: 'auto', objectFit: 'contain' }}
              priority
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