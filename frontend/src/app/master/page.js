'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function MasterPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if (user.role === 'client') router.replace('/client');
    }
  }, [user, loading, router]);

  if (loading || !user) return <LoadingScreen />;

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: '#1e1b4b', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>Repair Service — Master Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', margin: 0 }}>{user.username}</p>
            <p style={{ fontSize: '0.75rem', color: '#a5b4fc', margin: 0 }}>Master Technician</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="animate-fade-in" style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Master Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Welcome, <strong>{user.username}</strong>! Order management and status updates will appear here. This section is coming soon.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '2rem', color: '#1d4ed8', fontSize: '0.875rem', fontWeight: 600 }}>
            <span>✓</span> Master authentication successful
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}