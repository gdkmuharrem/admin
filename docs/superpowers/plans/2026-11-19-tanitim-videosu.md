# GEDSTACK Tanıtım Videosu #1 Implementation Plan

> **For agentic workers:** Native execution (tek oturumda, sahibi onayıyla) — adımlar `- [ ]` ile izlenir.

**Goal:** 1080x1920, 30 fps, ~31 sn, sessiz, altyazılı GEDSTACK ekran animasyonu MP4'ü üretmek.

**Architecture:** Tek `index.html` içinde zamana bağlı deterministik `window.renderAt(t)` fonksiyonu (CSS animasyonu yok). `render.cjs` Playwright ile her kareyi çekip ffmpeg'e akıtır; ayrıca belirli saniyelerden PNG önizleme üretir.

**Tech Stack:** HTML/CSS/JS, Playwright (Chromium), ffmpeg, Inter yazı tipi.

**Spec:** `docs/superpowers/specs/2026-11-19-tanitim-videosu-design.md`

## Global Constraints

- Boyut 1080x1920, 30 fps, 31 sn; H.264, yuv420p.
- Renkler: #0b0e14, #0f172a, #e1e2ea, #f6f8fc; vurgu açık mavi.
- Videoda sayı/fuar adedi/"şu kadar yerde kullanıldı" iddiası yok.
- Videoda telefon/e-posta yok; yalnızca `gedstack.com`.
- Altyazı ve kritik içerik üst 200 px ve alt 380 px güvenli alan dışında.
- Arayüzlerdeki içerik uydurma örnek veridir.

## Review Focus

- Türkçe karakterler (ı, İ, ş, ğ, ü, ö, ç) doğru görünmeli.
- Altyazı sahneler arası çakışmamalı, taşmamalı.
- İlk ve son kare boş/yarım kalmamalı.

---

### Task 1: Sahneler ve zaman çizelgesi
**Files:** Create `video/getstack-tanitim-1/index.html`
**Produces:** `window.renderAt(t: number): void`, `window.TOTAL = 31`
- [ ] 7 sahneyi (kanca, web, mobil, masaüstü, donanım, hazır çözümler, kapanış) yaz
- [ ] Önizleme karelerini çıkarıp her sahneyi gözle kontrol et

### Task 2: Render
**Files:** Create `video/getstack-tanitim-1/render.cjs`
**Consumes:** `window.renderAt`
- [ ] `node render.cjs stills <sn...>` PNG önizleme
- [ ] `node render.cjs` → `out/getstack-tanitim-1.mp4`
- [ ] `ffprobe` ile 1080x1920, 30 fps, ~31 sn doğrula
