"""Müzik + ses efektleri üretir, seslendirmeyle karıştırır (tümü sentez; telif sorunu yok).

Kullanım:
  python -I audio.py <seslendirme.wav> <çıktı.wav>
Gerekli: numpy, scipy, ffmpeg
"""
import sys, subprocess, wave, tempfile, os
import numpy as np
from scipy.signal import butter, sosfilt

SR, TOTAL = 44100, 31.0
N = int(SR * TOTAL)
rng = np.random.default_rng(7)
TAU = 2 * np.pi

def buf(): return np.zeros(N)
def put(b, t, x, g=1.0):
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(x)); b[i:j] += g * x[:j - i]
def T(dur): return np.arange(int(dur * SR)) / SR
def filt(x, kind, f):
    sos = butter(2, f, btype=kind, fs=SR, output='sos'); return sosfilt(sos, x)
def fade(x, a=.004, r=.01):
    na, nr = int(a * SR), int(r * SR); x = x.copy()
    x[:na] *= np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x

def tone(f0, f1, dur, decay, kind='sin'):
    t = T(dur); f = np.linspace(f0, f1, len(t)); ph = TAU * np.cumsum(f) / SR
    x = np.sin(ph) if kind == 'sin' else 2 * (np.mod(ph / TAU, 1)) - 1
    return fade(x * np.exp(-t / decay))
def noise(dur, decay): t = T(dur); return fade(rng.standard_normal(len(t)) * np.exp(-t / decay))
def sweep_noise(dur, f0, f1, shape=1.5):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); zi = None; B = 1024
    for k in range(0, n, B):
        fc = f0 * (f1 / f0) ** (k / n); hi = min(fc * 1.7, SR / 2 - 200)
        sos = butter(2, [fc * .6, hi], btype='band', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        y, zi = sosfilt(sos, x[k:k + B], zi=zi); out[k:k + len(y)] = y
    env = np.sin(np.pi * np.arange(n) / n) ** shape
    return out * env * 3

# ---- efekt kütüphanesi ----
def click():
    a = filt(noise(.03, .006), 'band', [2500, 7000]) * 1.6; b = tone(1900, 1500, .02, .006) * .3
    a[:len(b)] += b; return a
def pop(): return tone(760, 300, .11, .035)
def ding(f): t = T(.9); return fade((np.sin(TAU*f*t) + .3*np.sin(TAU*2*f*t) + .1*np.sin(TAU*3*f*t)) * np.exp(-t / .22), .002, .05)
def thump(): return tone(130, 38, .6, .16) * 1.4
def whoosh(dur, up=True): return sweep_noise(dur, 500, 5000, 1.4) if up else sweep_noise(dur, 5000, 500, 1.4)

# ---- ses efektleri zaman çizelgesi ----
def build_sfx():
    b = buf()
    eio = lambda t: 4*t**3 if t < .5 else 1 - (-2*t + 2)**3 / 2
    # kanca: yazma tıkları (30 karakter, 0.25–2.1 sn)
    last = 0
    for t in np.arange(.25, 2.1, .005):
        n = int(eio((t - .25) / 1.85) * 30 + 1e-4)
        if n > last:
            put(b, t, click(), .5); last = n
    # sahne geçişleri
    for te in (3, 8, 13, 18, 23, 27): put(b, te - .45, whoosh(.7), .22)
    # S2 web
    for t in (3.35, 3.55, 3.85, 4.0, 4.15): put(b, t, pop(), .35)
    put(b, 6.4, click(), .9); put(b, 6.55, ding(1318), .4)
    # S3 mobil
    put(b, 8.0, whoosh(.9), .3)
    for t in (8.85, 8.95, 9.2, 9.45): put(b, t, pop(), .3)
    put(b, 11.2, ding(880), .38); put(b, 11.32, ding(1318), .38); put(b, 12.45, whoosh(.5, False), .15)
    # S4 masaüstü
    for t in (13.05, 13.55, 13.67, 13.79, 13.85, 14.0): put(b, t, pop(), .28)
    for t in (14.4, 14.9, 15.3, 15.9, 16.4, 16.8, 17.3): put(b, t, tone(1500 + 400 * (t % 3), 1500, .06, .02), .12)
    # S5 donanım
    put(b, 18.05, pop(), .3); put(b, 18.5, whoosh(.9), .25)
    put(b, 19.65, tone(2000, 2000, .09, .05), .4); put(b, 19.75, tone(2600, 2600, .09, .05), .4)
    for i, f in enumerate((784, 988, 1319)): put(b, 20.0 + i * .09, ding(f), .38)
    put(b, 20.15, pop(), .3)
    motor = filt(sweep_noise(.8, 200, 450, .8), 'low', 700) + tone(70, 120, .8, 5, 'saw') * .12
    put(b, 20.2, motor, .5); put(b, 20.9, whoosh(.6, False), .18)
    # S6 kartlar
    put(b, 23.1, whoosh(.6), .24); put(b, 23.3, whoosh(.6), .24)
    for t in (23.9, 24.08, 24.26, 24.1, 24.28, 24.46): put(b, t, pop(), .28)
    # S7 kapanış
    put(b, 27.1, thump(), .6); put(b, 27.15, pop(), .3); put(b, 27.5, pop(), .3); put(b, 28.1, pop(), .28)
    put(b, 28.1, whoosh(.55), .22); put(b, 28.65, thump(), .5); put(b, 28.65, ding(1318), .45); put(b, 28.65, ding(1976), .25)
    return b

# ---- müzik ----
def build_music():
    t = np.arange(N) / SR; beat = .5
    ph = np.mod(t, beat); sc = 1 - .55 * np.exp(-ph / .1)  # sidechain pompası
    chords = [([220., 261.63, 329.63], 110.), ([174.61, 220., 261.63], 87.31), ([261.63, 329.63, 392.], 130.81), ([196., 246.94, 293.66], 98.)]
    saw = lambda f, tt: 2 * np.mod(f * tt, 1) - 1
    pad = buf(); bass = buf(); arp = buf(); drums = buf()
    bars = int(np.ceil(TOTAL / (4 * beat)))
    for bar in range(bars):
        t0 = bar * 4 * beat; notes, root = chords[bar % 4]
        n = min(int(4 * beat * SR), N - int(t0 * SR))
        if n <= 0: break
        tt = np.arange(n) / SR
        env = np.minimum(1, tt / .35) * np.minimum(1, (4 * beat - tt) / .25)
        p = sum(saw(f * 1.003, tt) + saw(f * .997, tt) for f in notes) / 6
        pad[int(t0 * SR):int(t0 * SR) + n] += p * env
    pad = filt(pad, 'low', 1500) * .22 * sc
    for k in range(int(TOTAL / (beat / 2))):
        tk = k * beat / 2
        if tk >= 4 and k % 2 == 1:  # bas: ikinci sekizlikler
            root = chords[int(tk / (4 * beat)) % 4][1]
            put(bass, tk, filt(tone(root, root, .22, .12, 'saw'), 'low', 420), .55)
        if tk >= 4:  # arpej
            notes = chords[int(tk / (4 * beat)) % 4][0]
            f = notes[k % 3] * 2
            put(arp, tk, tone(f, f, .22, .09), .5)
    delayed = arp.copy(); d = int(.375 * SR); delayed[d:] += arp[:-d] * .35
    arp = delayed * .16 * sc
    for k in range(int(TOTAL / beat)):
        tk = k * beat; g = min(1, tk / 4) * .5 + .0
        put(drums, tk, tone(150, 45, .3, .09), 1.0 * (.4 + g)); put(drums, tk, click(), .05)
        if tk >= 4:
            put(drums, tk + beat / 2, filt(noise(.06, .02), 'high', 7000), .22)
            if k % 2 == 1: put(drums, tk, filt(noise(.18, .06), 'band', [1200, 3500]), .35)
        if tk >= 12: put(drums, tk + beat / 4, filt(noise(.04, .012), 'high', 8000), .10)
    m = pad + bass * .5 + arp + drums * .55
    fade_in = np.minimum(1, t / .6); fade_out = np.minimum(1, (TOTAL - t) / 1.6)
    return m * fade_in * fade_out

# ---- karıştırma ----
def load_voice(path):
    tmp = os.path.join(tempfile.mkdtemp(), 'v.wav')
    chain = "highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=3,equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=180:t=q:w=1:g=2,aecho=0.8:0.25:55:0.12,loudnorm=I=-16:TP=-2"
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', path, '-af', chain, '-ar', str(SR), '-ac', '1', tmp], check=True)
    with wave.open(tmp) as w: x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    out = buf(); out[:min(N, len(x))] = x[:N]; return out

def main():
    voice = load_voice(sys.argv[1]); sfx = build_sfx(); music = build_music()
    rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
    env = filt(np.abs(voice), 'low', 6); duck = 1 - .5 * np.clip(env / .06, 0, 1)
    music = music / rms(music) * rms(voice) * .32 * duck      # müzik: sesin ~-13 dB altında, konuşurken daha da kısık
    sfx = sfx / (np.max(np.abs(sfx)) + 1e-9) * .30
    mix = np.tanh(voice * 1.0 + music + sfx)
    mix = mix / np.max(np.abs(mix)) * .89
    pcm = (np.stack([mix, mix], 1) * 32767).astype(np.int16)
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('yazıldı:', sys.argv[2], '| rms ses/müzik/efekt:', *(f'{20*np.log10(rms(x)+1e-9):.1f}dB' for x in (voice, music, sfx)))

main()
