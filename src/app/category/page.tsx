'use client';

import React, { useEffect, useState } from 'react';
import { adminCategoryService } from '@/services/categoryService';
import styles from '@/components/CategoryPage.module.css';
import { slugify } from '@/utils/slugify';

interface Category {
    id: string;
    name_tr: string;
    name_en: string;
    slug_tr: string;
    slug_en: string;
    parentId?: string | null;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
    parent?: Category | null;
    children?: Category[];
}

const initialFormState = {
    id: '',
    name_tr: '',
    name_en: '',
    slug_tr: '',
    slug_en: '',
    parentId: '',
    isActive: true,
    order: 0,
};

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(initialFormState);

    const [searchName, setSearchName] = useState('');
    const [searchIsActive, setSearchIsActive] = useState<'all' | 'active' | 'inactive'>('all');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await adminCategoryService.getAllCategories();
            setCategories(data);
            setError('');
        } catch {
            setError('Kategoriler yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const clearFilters = () => {
        setSearchName('');
        setSearchIsActive('all');
    };

    const filteredCategories = categories.filter((cat) => {
        const nameMatch =
            cat.name_tr.toLowerCase().includes(searchName.toLowerCase()) ||
            cat.name_en.toLowerCase().includes(searchName.toLowerCase());

        const isActiveMatch =
            searchIsActive === 'all'
                ? true
                : searchIsActive === 'active'
                    ? cat.isActive
                    : !cat.isActive;

        return nameMatch && isActiveMatch;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        let val: string | boolean | number;

        if (type === 'checkbox') {
            val = checked;
        } else if (type === 'number') {
            val = Number(value); // string'i number'a çeviriyoruz
        } else {
            val = value;
        }

        const updatedForm = {
            ...form,
            [name]: val,
        };

        if (name === 'name_tr' && typeof val === 'string') {
            updatedForm.slug_tr = slugify(val);
        }

        if (name === 'name_en' && typeof val === 'string') {
            updatedForm.slug_en = slugify(val);
        }

        setForm(updatedForm);
    };


    const validateForm = () => {
        if (!form.name_tr.trim()) {
            setFormError('Türkçe isim zorunludur.');
            return false;
        }
        if (!form.name_en.trim()) {
            setFormError('İngilizce isim zorunludur.');
            return false;
        }
        if (!form.slug_tr.trim()) {
            setFormError('Slug (TR) boş olamaz.');
            return false;
        }
        if (!form.slug_en.trim()) {
            setFormError('Slug (EN) boş olamaz.');
            return false;
        }
        if (form.order < 0) {
            setFormError('Sıra negatif olamaz.');
            return false;
        }
        setFormError('');
        return true;
    };

    const resetForm = () => {
        setForm(initialFormState);
        setFormError('');
        setFormVisible(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            const payload = {
                name_tr: form.name_tr,
                name_en: form.name_en,
                slug_tr: form.slug_tr,
                slug_en: form.slug_en,
                parentId: form.parentId || null,
                isActive: form.isActive,
                order: form.order,
            };

            if (form.id) {
                const updated = await adminCategoryService.updateCategory(form.id, payload);
                setCategories((prev) => prev.map((cat) => (cat.id === updated.id ? updated : cat)));
            } else {
                const created = await adminCategoryService.createCategory(payload);
                setCategories((prev) => [created, ...prev]);
            }

            resetForm();
        } catch {
            setFormError('Kaydetme işlemi başarısız.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

        try {
            await adminCategoryService.deleteCategory(id);
            setCategories((prev) => prev.filter((cat) => cat.id !== id));
            if (form.id === id) resetForm();
        } catch {
            alert('Silme başarısız.');
        }
    };

    const handleEdit = (category: Category) => {
        setForm({
            id: category.id,
            name_tr: category.name_tr,
            name_en: category.name_en,
            slug_tr: category.slug_tr,
            slug_en: category.slug_en,
            parentId: category.parentId ?? '',
            isActive: category.isActive,
            order: category.order,
        });
        setFormVisible(true);
        setFormError('');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.h1}>Kategoriler</h1>
            {error && <p className={styles.error}>{error}</p>}
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <button
                    className={styles.addNewButton}
                    onClick={() => {
                        setForm(initialFormState);
                        setFormVisible(true);
                    }}
                >
                    + Yeni Kategori Ekle
                </button>
            </div>

            {formVisible && (
                <div className={styles.formOverlay} onClick={resetForm}>
                    <form
                        className={styles.formBox}
                        onSubmit={(e) => {
                            e.stopPropagation(); // Overlay tıklamasını engelle
                            handleSubmit(e);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>{form.id ? 'Kategori Düzenle' : 'Yeni Kategori'}</h3>

                        <div>
                            <label>
                                Türkçe İsim:
                                <input type="text" name="name_tr" value={form.name_tr} onChange={handleChange} />
                            </label>
                        </div>

                        <div>
                            <label>
                                İngilizce İsim:
                                <input type="text" name="name_en" value={form.name_en} onChange={handleChange} />
                            </label>
                        </div>

                        <div>
                            <label>
                                Slug (TR):
                                <input type="text" name="slug_tr" value={form.slug_tr} onChange={handleChange} />
                            </label>
                        </div>

                        <div>
                            <label>
                                Slug (EN):
                                <input type="text" name="slug_en" value={form.slug_en} onChange={handleChange} />
                            </label>
                        </div>

                        <div>
                            <label>
                                Üst Kategori:
                                <select name="parentId" value={form.parentId} onChange={handleChange}>
                                    <option value="">-- Yok --</option>
                                    {categories
                                        .filter((c) => c.id !== form.id)
                                        .map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name_tr} / {c.name_en}
                                            </option>
                                        ))}
                                </select>
                            </label>
                        </div>

                        <div>
                            <label>
                                Aktif:
                                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                            </label>
                        </div>

                        <div>
                            <label>
                                Sıra:
                                <input type="number" name="order" value={form.order} onChange={handleChange} />
                            </label>
                        </div>

                        {formError && <p className={styles.error}>{formError}</p>}

                        <div className={styles.formButtons}>
                            <button type="submit" disabled={saving}>
                                {saving ? 'Kaydediliyor...' : form.id ? 'Güncelle' : 'Kaydet'}
                            </button>
                            <button type="button" onClick={resetForm} disabled={saving}>
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Kategori Adı Ara"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />
                <select
                    value={searchIsActive}
                    onChange={(e) => setSearchIsActive(e.target.value as 'all' | 'active' | 'inactive')}
                >
                    <option value="all">Tümü</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                </select>
                <button className={styles.clearFiltersButton} onClick={clearFilters}>
                    Filtreleri Temizle
                </button>
            </div>

            {loading ? (
                <p>Yükleniyor...</p>
            ) : filteredCategories.length === 0 ? (
                <p>Kategori bulunamadı.</p>
            ) : (
                <ul className={styles.categoryList}>
                    {filteredCategories.map((cat) => (
                        <li key={cat.id} className={styles.categoryItem}>
                            <div className={styles.categoryInfo}>
                                <strong>
                                    {cat.name_tr} / {cat.name_en}
                                </strong>
                                <br />
                                {cat.parent && <small>Üst Kategori: {cat.parent.name_tr}</small>}
                                <br />
                                <small>Durum: {cat.isActive ? 'Aktif' : 'Pasif'}</small>
                                <br />
                                <small>Sıra: {cat.order}</small>
                                <br />
                                <small>
                                    Slug: {cat.slug_tr} / {cat.slug_en}
                                </small>
                            </div>
                            <div className={styles.buttonGroup}>
                                <button className={styles.editButton} onClick={() => handleEdit(cat)}>
                                    Düzenle
                                </button>
                                <button className={styles.deleteButton} onClick={() => handleDelete(cat.id)}>
                                    Sil
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
