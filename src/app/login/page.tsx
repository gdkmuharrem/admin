'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import { login } from '@/services/authService';
import { LoginData } from '@/types/auth';
import { AxiosError } from 'axios';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  async function handleLogin(data: LoginData) {
    console.log("🚀 handleLogin çalıştı, gelen data:", data);

    setError(null);
    setLoading(true);

    try {
      console.log("📡 Backend'e login isteği atılıyor...");
      const res = await login(data);
      console.log("✅ Backend login başarılı, gelen cevap:", res);

      console.log("🍪 Cookie tarayıcıda mevcut mu kontrol et (Application sekmesinden bak)");
      console.log("➡️ Dashboard'a yönlendiriliyor...");
      window.location.href = '/';
      console.log("📍 router.push çağrıldı");
    } catch (err: unknown) {
      console.error("❌ Login hatası:", err);

      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as AxiosError<{ message: string }>;
        setError(axiosError.response?.data?.message || 'Giriş başarısız');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Giriş başarısız');
      }
    } finally {
      console.log("⏳ Loading false yapılıyor");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#e0e7ff' }}
    >
      <div>
        <LoginForm
          onSubmit={handleLogin}
          errorMessage={error ?? undefined}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
