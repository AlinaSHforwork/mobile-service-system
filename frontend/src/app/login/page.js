'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.role === 'master' ? '/master' : '/client');
    }
  }, [user, authLoading, router]);

  const validate = () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Username is required';
    else if (username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (!password) errors.password = 'Password is required';
    else if (mode === 'register' && password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (mode === 'register' && password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login(username.trim(), password);
      } else {
        result = await register(username.trim(), password);
      }

      if (result.success) {
        router.replace(result.data.user.role === 'master' ? '/master' : '/client');
      } else {
        // Handle structured errors from express-validator
        if (result.errors && Array.isArray(result.errors)) {
          const fe = {};
          result.errors.forEach(e => { fe[e.path] = e.msg; });
          setFieldErrors(fe);
        } else {
          setError(result.message || 'Something went wrong');
        }
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="animate-fade-in" style={{
        background: 'white',
        borderRadius: '1.25rem',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 8px 40px rgba(79,70,229,0.12)',
      }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <circle cx="12" cy="18" r="1" fill="white" stroke="none" />
            </svg>
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          {mode === 'login' ? 'Sign in to access your account' : 'Register as a new client'}
        </p>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: 'var(--error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <UserIcon />
              </span>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setFieldErrors(p => ({ ...p, username: '' })); }}
                placeholder="Enter your username"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                  border: `1px solid ${fieldErrors.username ? 'var(--error)' : 'var(--border)'}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.925rem',
                  outline: 'none',
                  color: 'var(--text)',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = fieldErrors.username ? 'var(--error)' : 'var(--border)'}
              />
            </div>
            {fieldErrors.username && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.username}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: mode === 'register' ? '1rem' : '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <LockIcon />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                placeholder="Enter your password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{
                  width: '100%',
                  padding: '0.625rem 2.75rem 0.625rem 2.5rem',
                  border: `1px solid ${fieldErrors.password ? 'var(--error)' : 'var(--border)'}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.925rem',
                  outline: 'none',
                  color: 'var(--text)',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = fieldErrors.password ? 'var(--error)' : 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.password && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.password}</p>}
          </div>

          {/* Confirm password (register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                    border: `1px solid ${fieldErrors.confirmPassword ? 'var(--error)' : 'var(--border)'}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.925rem',
                    outline: 'none',
                    color: 'var(--text)',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = fieldErrors.confirmPassword ? 'var(--error)' : 'var(--border)'}
                />
              </div>
              {fieldErrors.confirmPassword && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.confirmPassword}</p>}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? 'var(--primary-light)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = 'var(--primary-dark)'; }}
            onMouseLeave={e => { if (!loading) e.target.style.background = 'var(--primary)'; }}
          >
            {loading ? (
              <>
                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (mode === 'login' ? 'Log In' : 'Create Account')}
          </button>
        </form>

        {/* Demo credentials */}
        {mode === 'login' && (
          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#f8f7ff', borderRadius: '0.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>Demo credentials:</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--primary)', margin: '0.125rem 0' }}>Master access: Master / 12345678</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--primary)', margin: '0.125rem 0' }}>Client access: any username / any password</p>
          </div>
        )}

        {/* Toggle mode */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setFieldErrors({}); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', padding: 0 }}
          >
            {mode === 'login' ? 'Register' : 'Log In'}
          </button>
        </div>

        {/* Back to home */}
        <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>← Back to home</Link>
        </div>
      </div>

      <button style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        width: '40px', height: '40px', borderRadius: '50%',
        background: '#1e1b4b', color: 'white', border: 'none',
        fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>?</button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}