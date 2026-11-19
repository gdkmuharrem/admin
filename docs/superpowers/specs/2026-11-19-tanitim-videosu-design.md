# GEDSTACK Tanıtım Videosu #1 – Ekran Animasyonu

## Amaç
LinkedIn, Instagram Reels ve YouTube Shorts'ta GEDSTACK'in neler yapabildiğini
tek videoda göstermek ve yeni müşteri çekmek. Bu ilk video; sonraki videolar
hikâyeli çizgi film tarzında olacak (Çizgili Anılar örneği).

## Hedef / hedef dışı
- Hedef: izleyen kişi "bu firma yazılım ve donanımı birlikte yapıyor" desin, siteye gelsin.
- Hedef dışı: tek bir ürüne (GEDEXPO/GEDSTAFF) odaklanmak, uzun anlatım, seslendirme.
- Başarısızlık sayılır: sıkıcı ya da kurumsal broşür gibi görünmesi; ilk 3 saniyede kaybetmesi.

## Biçim
- 1080x1920 (9:16), 30 fps, yaklaşık 30 saniye, MP4 (H.264).
- Sessiz üretilir, vurgulu altyazı ile anlaşılır. Müzik/trend ses platformda eklenir.
- Kamera "kukla" hissi: her sahnede yavaş yakınlaşma (push-in), sahne geçişinde geri çekilme.

## Marka (siteden)
- Arka plan #0b0e14 / #0f172a, metin #e1e2ea, açık yüzey #f6f8fc.
- Font: Inter. Vurgu rengi: açık mavi/camgöbeği (benim seçimim; sitede net vurgu rengi bulamadım).
- Slogan: "Siz hayal edin, biz gerçekleştirelim."

## Sahne planı
1. 0-3 sn – Kanca: "Aklındaki işi yazılıma dökelim." Yazı tuşla yazılır gibi çıkar.
2. 3-8 sn – Web: tarayıcı penceresi, bloklar tek tek yerine oturur. Altyazı: "Web sitesi ve e-ticaret".
3. 8-13 sn – Mobil: telefon kayarak girer, uygulama ekranı doluyor. "iOS ve Android uygulama".
4. 13-18 sn – Masaüstü ve endüstriyel: panel, canlı sensör grafiği. "Masaüstü ve endüstriyel yazılım".
5. 18-23 sn – Donanım: NFC kart okutulur, yeşil onay, turnike açılır. "NFC, sensör, mikrodenetleyici".
6. 23-27 sn – Kanıt: sayaç 0'dan 40'a. "40 fuarda kullanıldı" + GEDEXPO / GEDSTAFF etiketleri.
7. 27-31 sn – Çağrı: "Siz hayal edin, biz gerçekleştirelim." + "24 saatte dönüş · gedstack.com".

## Yaklaşımlar
- A) Çizgi film hikâyesi: örnek videoya en yakın, ama üretimi uzun. Sonraki videolara bırakıldı.
- B) Zaman çizelgesiyle ekran animasyonu (HTML/CSS + kare kare kayıt + ffmpeg): seçildi.
- C) Hazır şablon/AI video aracı: bu ortamda mümkün değil.

## Teknik (yapan kişiye bırakılan)
HTML/CSS ile her sahne, zamana bağlı deterministik animasyon; Playwright ile kare
kare ekran kaydı, ffmpeg ile MP4. Çıktı: `video/getstack-tanitim-1/`. Uygulamanın
(Next.js) koduna dokunulmaz.

## Benim kararlarım (değiştirilebilir)
- Vurgu rengi, sahne süreleri, sessiz üretim.
- Sahnelerdeki arayüz içerikleri gerçek müşteri verisi değil, uydurma örnek veridir.
- Videoda telefon/e-posta yok, yalnızca gedstack.com.
