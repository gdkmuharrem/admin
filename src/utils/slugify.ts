export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')       // özel karakterleri kaldır
    .replace(/[\s_-]+/g, '-')       // boşlukları ve alt çizgileri tireye çevir
    .replace(/^-+|-+$/g, '');       // baştaki ve sondaki tireleri kaldır
}
