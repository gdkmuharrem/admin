"""Taslak seslendirme üretici.

Kullanım:
  python -I voiceover.py gtts <çıktı.wav>        (Google Translate sesi, TASLAK)
  python -I voiceover.py <model.onnx> <çıktı.wav> (Piper; model CC BY-NC-SA, ticari kullanıma KAPALI)

Yayın için lisanslı bir ses (ör. ElevenLabs ücretli plan) ya da kendi kaydınız kullanılmalı.

Her satır, sahnenin başlangıç saniyesine hizalanır. Süre sahneyi aşarsa hata verir.
"""
import sys, wave, subprocess, tempfile, os

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
tmp = tempfile.mkdtemp()
if model == "gtts":
    from gtts import gTTS
    def synth(text, w):
        mp3 = os.path.join(tmp, "g.mp3")
        gTTS(text, lang="tr", tld="com.tr").save(mp3)
        wav = os.path.join(tmp, "g.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=1.18", "-ar", str(SR), "-ac", "1", wav], check=True)
        with wave.open(wav, "rb") as r:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(r.readframes(r.getnframes()))
else:
    from piper import PiperVoice
    voice = PiperVoice.load(model)
    def synth(text, w):
        voice.synthesize_wav(text, w)
inputs, filters = [], []
for i, (start, end, text) in enumerate(LINES):
    p = os.path.join(tmp, f"l{i}.wav")
    with wave.open(p, "wb") as w:
        synth(text, w)
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
