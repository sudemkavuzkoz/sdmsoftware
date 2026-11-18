'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  KeyRound,
  LogIn,
  Mail,
  Phone,
  Terminal,
  User,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthPortal({ defaultMode = 'login' }: { defaultMode?: 'login' | 'register' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : defaultMode;
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const { loginAccount, registerAccount } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const res =
      mode === 'register'
        ? await registerAccount({ name, email, password, company, phone })
        : await loginAccount(email, password);

    setSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'İşlem başarısız.');
      return;
    }

    router.push(redirectTarget.startsWith('/') ? redirectTarget : '/dashboard');
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem 1.85rem' }}>
        <div className="glow-accent" />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.9rem'
            }}
          >
            <Terminal size={22} color="#07090e" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
            {mode === 'login' ? 'SDM Üye & Lisans Girişi' : 'Ücretsiz Hesap Oluştur'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.35rem' }}>
            {mode === 'login'
              ? 'Üyeliğinize, aktif lisanslarınıza ve özel markalı çalışma alanınıza erişin.'
              : 'Kaydınız kalıcı veritabanına işlenir; demoları deneyip dilediğiniz zaman Premium veya özel lisansa geçebilirsiniz.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.45rem',
            background: '#080c15',
            padding: '0.35rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', fontSize: '0.82rem' }}
          >
            <LogIn size={14} /> Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', fontSize: '0.82rem' }}
          >
            <UserPlus size={14} /> Kaydol
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: 'var(--accent-rose)',
              fontSize: '0.8rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mode === 'register' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label className="form-label"><User size={11} style={{ display: 'inline' }} /> Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder="Örn: Sudem Yılmaz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label"><Phone size={11} style={{ display: 'inline' }} /> Telefon</label>
                  <input
                    type="text"
                    placeholder="+90 532 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label"><Building2 size={11} style={{ display: 'inline' }} /> Klinik / Şirket Adı (Kişiselleştirme İçin)</label>
                <input
                  type="text"
                  placeholder="Örn: Yıldız Diş Polikliniği"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="form-input"
                />
              </div>
            </>
          )}

          <div>
            <label className="form-label"><Mail size={11} style={{ display: 'inline' }} /> E-Posta Adresi *</label>
            <input
              type="email"
              required
              placeholder="ornek@sirketiniz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label"><KeyRound size={11} style={{ display: 'inline' }} /> Şifre *</label>
            <input
              type="password"
              required
              minLength={mode === 'register' ? 6 : 4}
              placeholder={mode === 'register' ? 'En az 6 karakter' : 'Şifreniz'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          {mode === 'register' && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '0.6rem 0.75rem',
                fontSize: '0.73rem',
                color: '#6ee7b7',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                <CheckCircle2 size={13} /> Anında Başlangıç Hakları:
              </div>
              <span>• Veritabanına kalıcı üyelik + 5 ücretsiz etkileşimli demo hakkı</span>
              <span>• Kullanım sonrası Premium Pro veya Lisans ile sınırsız özel markalama</span>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '0.35rem' }}>
            {submitting ? 'İşleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kaydı Tamamla ve Başla'}
          </button>
        </form>

        {/* Back to Demos Link */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}
        >
          <Link href="/demos" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Canlı Demoları İncelemeye Dön →
          </Link>
        </div>
      </div>
    </div>
  );
}
