"""Seslendirme üretici (Piper TTS, Türkçe).

Kullanım:
  python -I voiceover.py <model.onnx> <çıktı.wav>

Her satır, sahnenin başlangıç saniyesine hizalanır. Süre sahneyi aşarsa hata verir.
"""
import sys, wave, subprocess, tempfile, os
from piper import PiperVoice

# (başlangıç sn, sahne bitişi sn, okunacak metin) – metin, telaffuz için yazıldığı gibi
LINES = [
    (0.3, 3.0, "Aklındaki işi yazılıma dökelim."),
    (3.4, 8.0, "Web sitesi ve e-ticaret."),
    (8.4, 13.0, "ay o es ve Androyd uygulama."),
    (13.4, 18.0, "Masaüstü ve endüstriyel yazılım."),
    (18.4, 23.0, "en ef ce, sensör, mikrodenetleyici."),
    (23.4, 27.0, "Fuar ve etkinlikler için hazır çözümler."),
    (27.3, 31.0, "Siz hayal edin, biz gerçekleştirelim."),
]
TOTAL = 31.0
SR = 22050

model, out = sys.argv[1], sys.argv[2]
voice = PiperVoice.load(model)
tmp = tempfile.mkdtemp()
inputs, filters = [], []
for i, (start, end, text) in enumerate(LINES):
    p = os.path.join(tmp, f"l{i}.wav")
    with wave.open(p, "wb") as w:
        voice.synthesize_wav(text, w)
    with wave.open(p, "rb") as w:
        dur = w.getnframes() / w.getframerate()
    print(f"{start:5.1f}s  {dur:4.2f}s  (sahne payı {end-start:.1f}s)  {text}")
    if start + dur > end - 0.1:
        sys.exit(f"HATA: satır {i} sahneye sığmıyor ({start+dur:.2f} > {end-0.1:.2f})")
    inputs += ["-i", p]
    filters.append(f"[{i}:a]adelay={int(start*1000)}|{int(start*1000)},aresample={SR}[a{i}]")
mix = "".join(f"[a{i}]" for i in range(len(LINES))) + f"amix=inputs={len(LINES)}:normalize=0,apad=whole_dur={TOTAL},atrim=0:{TOTAL}[m]"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters + [mix]), "-map", "[m]", "-ar", str(SR), out], check=True)
print("yazıldı:", out)
