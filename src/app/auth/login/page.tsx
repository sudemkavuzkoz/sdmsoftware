import React, { Suspense } from 'react';
import AuthPortal from '@/components/AuthPortal';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Giriş ekranı yükleniyor...</div>}>
      <AuthPortal defaultMode="login" />
    </Suspense>
  );
}
