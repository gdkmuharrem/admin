"use client";

import React, { useEffect, useState } from "react";
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";
import { Product, Category } from "@/types/product";
import styles from "@/components/ProductPage.module.css";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchNameTr, setSearchNameTr] = useState("");
  const [searchNameEn, setSearchNameEn] = useState("");
  const [searchCategoryId, setSearchCategoryId] = useState("");
  const [searchIsActive, setSearchIsActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [form, setForm] = useState<Partial<Product>>({
    id: "",
    name_tr: "",
    name_en: "",
    description_tr: "",
    description_en: "",
    price: 0,
    categoryId: "",
    isActive: true,
  });

  const [formVisible, setFormVisible] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);
        setProducts(productsRes);
        setCategories(categoriesRes);
      } catch {
        alert("Veriler yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const nameTrMatch = p.name_tr
      .toLowerCase()
      .includes(searchNameTr.toLowerCase());
    const nameEnMatch = p.name_en
      .toLowerCase()
      .includes(searchNameEn.toLowerCase());
    const categoryMatch = searchCategoryId
      ? p.categoryId === searchCategoryId
      : true;
    const isActiveMatch =
      searchIsActive === "all"
        ? true
        : searchIsActive === "active"
        ? p.isActive
        : !p.isActive;

    return nameTrMatch && nameEnMatch && categoryMatch && isActiveMatch;
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const { name, type, value } = target;

    let val: string | number | boolean;

    if (type === "checkbox") {
      val = (target as HTMLInputElement).checked; // ✅ TypeScript'i ikna ettik
    } else if (name === "price") {
      val = Number(value);
    } else {
      val = value;
    }

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const validateForm = () => {
    if (!form.name_tr?.trim())
      return setFormError("Türkçe isim zorunludur"), false;
    if (!form.name_en?.trim())
      return setFormError("İngilizce isim zorunludur"), false;
    if (!form.categoryId) return setFormError("Kategori seçmelisiniz"), false;
    if (!form.price || form.price <= 0)
      return setFormError("Fiyat 0’dan büyük olmalı"), false;
    setFormError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (form.id) {
        const updated = await updateProduct(form.id, form);
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const created = await createProduct(form);
        setProducts((prev) => [created, ...prev]);
      }
      setFormVisible(false);
    } catch {
      setFormError("Kaydetme sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Silme işlemi başarısız");
    }
  };

  const clearFilters = () => {
    setSearchNameTr("");
    setSearchNameEn("");
    setSearchCategoryId("");
    setSearchIsActive("all");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Ürünler</h1>

      <button
        className={styles.addNewButton}
        onClick={() => {
          setForm({
            id: "",
            name_tr: "",
            name_en: "",
            description_tr: "",
            description_en: "",
            price: 0,
            categoryId: "",
            isActive: true,
          });
          setFormVisible(true);
          setFormError("");
        }}
      >
        + Yeni Ürün Ekle
      </button>

      {/* Filtreler */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Türkçe İsim"
          value={searchNameTr}
          onChange={(e) => setSearchNameTr(e.target.value)}
        />
        <input
          type="text"
          placeholder="İngilizce İsim"
          value={searchNameEn}
          onChange={(e) => setSearchNameEn(e.target.value)}
        />
        <select
          value={searchCategoryId}
          onChange={(e) => setSearchCategoryId(e.target.value)}
        >
          <option value="">Kategori Seçiniz</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name_tr} / {cat.name_en}
            </option>
          ))}
        </select>
        <select
          value={searchIsActive}
          onChange={(e) =>
            setSearchIsActive(e.target.value as "all" | "active" | "inactive")
          }
        >
          <option value="all">Durum: Tümü</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </select>
        <button
          type="button"
          className={styles.clearFiltersButton}
          onClick={clearFilters}
        >
          Filtreleri Temizle
        </button>
      </div>

      {/* Form */}
      {formVisible && (
        <form
          onSubmit={handleSubmit}
          className={styles.formBox}
          style={{ marginTop: 20 }}
        >
          <h3>{form.id ? "Ürün Düzenle" : "Yeni Ürün"}</h3>

          <label>Türkçe İsim</label>
          <input
            name="name_tr"
            value={form.name_tr || ""}
            onChange={handleChange}
          />

          <label>İngilizce İsim</label>
          <input
            name="name_en"
            value={form.name_en || ""}
            onChange={handleChange}
          />

          <label>Türkçe Açıklama</label>
          <textarea
            name="description_tr"
            value={form.description_tr || ""}
            onChange={handleChange}
          />

          <label>İngilizce Açıklama</label>
          <textarea
            name="description_en"
            value={form.description_en || ""}
            onChange={handleChange}
          />

          <label>Fiyat</label>
          <input
            type="number"
            name="price"
            value={form.price || 0}
            onChange={handleChange}
            step="0.01"
          />

          <label>Kategori</label>
          <select
            name="categoryId"
            value={form.categoryId || ""}
            onChange={handleChange}
          >
            <option value="">Seçiniz</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_tr} / {cat.name_en}
              </option>
            ))}
          </select>

          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive || false}
              onChange={handleChange}
            />
            Aktif
          </label>

          {formError && <p className={styles.error}>{formError}</p>}

          <div className={styles.formButtons}>
            <button type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : form.id ? "Güncelle" : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setFormVisible(false)}
              disabled={saving}
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      <hr style={{ margin: "20px 0" }} />

      {loading ? (
        <p>Yükleniyor...</p>
      ) : filteredProducts.length === 0 ? (
        <p>Ürün bulunamadı.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Türkçe İsim</th>
                <th>İngilizce İsim</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name_tr}</td>
                  <td>{p.name_en}</td>
                  <td>
                    {p.category
                      ? `${p.category.name_tr} / ${p.category.name_en}`
                      : p.categoryId}
                  </td>
                  <td>{p.price.toFixed(2)} ₺</td>
                  <td>{p.isActive ? "Aktif" : "Pasif"}</td>
                  <td className={styles.buttonGroup}>
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        setForm({ ...p });
                        setFormVisible(true);
                        setFormError("");
                      }}
                    >
                      Düzenle
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(p.id)}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
