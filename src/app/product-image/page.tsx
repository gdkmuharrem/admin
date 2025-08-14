'use client';

import React, { useEffect, useState } from 'react';
import {
  getImagesByProduct,
  uploadImage,
  deleteImage,
} from '@/services/productImageService';
import { Product } from '@/types/product';
import { ProductImage } from '@/types/productImage';
import * as productService from '@/services/productService';
import styles from '@/components/ProductImagePage.module.css';
import Image from 'next/image';

export default function ProductImagePage() {
  const [searchName, setSearchName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [imagesMap, setImagesMap] = useState<Record<string, ProductImage[]>>({});
  const [loading, setLoading] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const allProducts = await productService.fetchProducts();
        setProducts(allProducts);

        const imagesObj: Record<string, ProductImage[]> = {};
        await Promise.all(
          allProducts.map(async (p) => {
            const imgs = await getImagesByProduct(p.id);
            imagesObj[p.id] = Array.isArray(imgs) ? imgs : [];
          })
        );

        setImagesMap(imagesObj);
        setError('');
      } catch {
        setError('Veriler yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name_tr.toLowerCase().includes(searchName.toLowerCase()) ||
    p.name_en.toLowerCase().includes(searchName.toLowerCase())
  );

  async function handleUpload(productId: string, file: File) {
    try {
      setUploadingProductId(productId);
      const newImage = await uploadImage(productId, file);
      setImagesMap((prev) => ({
        ...prev,
        [productId]: [newImage, ...(Array.isArray(prev[productId]) ? prev[productId] : [])],
      }));
    } catch (err) {
      console.error(err);
      alert('Resim yükleme başarısız');
    } finally {
      setUploadingProductId(null);
    }
  }

  async function handleDelete(productId: string, imageId: string) {
    if (!confirm('Resmi silmek istediğinize emin misiniz?')) return;
    try {
      await deleteImage(imageId);
      setImagesMap((prev) => ({
        ...prev,
        [productId]: (Array.isArray(prev[productId]) ? prev[productId] : []).filter((img) => img.id !== imageId),
      }));
    } catch {
      alert('Silme işlemi başarısız');
    }
  }

  return (
    <div className={styles.container}>
      <h1>Ürün Resimleri Yönetimi</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Ürün adına göre ara"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p>Ürün bulunamadı.</p>
      ) : (
        filteredProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <h2>{product.name_tr} / {product.name_en}</h2>

            <div className={styles.imagesContainer}>
              {(Array.isArray(imagesMap[product.id]) ? imagesMap[product.id] : []).map((img) => (
                <div key={img.id} className={styles.imageBox}>
                  <Image
                    src={`http://localhost:4000/${img.filePath.replace(/\\/g, '/')}`}
                    alt={img.originalName}
                    width={150}       // uygun genişlik (kendine göre ayarla)
                    height={150}      // uygun yükseklik (kendine göre ayarla)
                    className={styles.imageThumb}
                  />

                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(product.id, img.id)}
                    type="button"
                  >
                    Sil
                  </button>
                </div>
              ))}

              <div className={styles.uploadBox}>
                <label className={styles.uploadLabel}>
                  {uploadingProductId === product.id ? 'Yükleniyor...' : '+ Resim Ekle'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpload(product.id, e.target.files[0]);
                        e.target.value = ''; // input temizle
                      }
                    }}
                    disabled={uploadingProductId === product.id}
                    hidden
                  />
                </label>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
