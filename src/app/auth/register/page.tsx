import React, { Suspense } from 'react';
import AuthPortal from '@/components/AuthPortal';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Kayıt ekranı yükleniyor...</div>}>
      <AuthPortal defaultMode="register" />
    </Suspense>
  );
}
