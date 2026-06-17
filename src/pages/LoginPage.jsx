import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        /* ── Login page layout ─────────────────────────────── */
        .login-root {
          min-height: 100vh;
          display: flex;
          background: var(--eb-slate-bg);
        }

        /* ── Left panel — brand ────────────────────────────── */
        .login-brand {
          width: 40%;
          background: var(--eb-navy);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
          position: relative;
          overflow: hidden;
        }
        .login-brand::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,.35) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-brand::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-logo-wrap {
          display: flex;
          align-items: center;
          margin-bottom: 40px;
        }
        .brand-logo-bg {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,.25);
        }
        .brand-logo-img {
          width: 260px;
          height: auto;
          display: block;
        }

        .brand-headline {
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          letter-spacing: -.02em;
          margin-bottom: 16px;
        }

        /* ── Right panel — form ────────────────────────────── */
        .login-form-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
        }

        .login-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--eb-text-main);
          letter-spacing: -.03em;
          margin-bottom: 8px;
        }
        .login-subtitle {
          font-size: 14px;
          color: var(--eb-text-muted);
          margin-bottom: 40px;
        }

        /* ── Form controls ─────────────────────────────────── */
        .eb-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--eb-text-main);
          margin-bottom: 6px;
          display: block;
        }
        .eb-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--eb-border);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          color: var(--eb-text-main);
          background: #fff;
          transition: var(--eb-transition);
          outline: none;
        }
        .eb-input:focus {
          border-color: var(--eb-accent);
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
        .eb-input.is-invalid { border-color: var(--eb-danger); }

        .pwd-wrap { position: relative; }
        .pwd-toggle {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; padding: 0;
          color: var(--eb-text-muted); cursor: pointer;
          font-size: 16px;
          transition: var(--eb-transition);
        }
        .pwd-toggle:hover { color: var(--eb-accent); }

        .eb-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--eb-danger);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .btn-login {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          background: var(--eb-accent);
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          font-family: inherit;
          border: none;
          cursor: pointer;
          transition: var(--eb-transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-login:hover:not(:disabled) {
          background: #1D4ED8;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(37,99,235,.35);
        }
        .btn-login:disabled { opacity: .7; cursor: not-allowed; }

        .login-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: var(--eb-text-muted);
        }

        /* ── Spinner ───────────────────────────────────────── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        /* ── Responsive ────────────────────────────────────── */
        @media (max-width: 768px) {
          .login-root { flex-direction: column; }
          .login-brand { width: 100%; padding: 36px 28px 32px; }
          .brand-headline { font-size: 24px; }
          .login-form-wrap { padding: 32px 20px; }
        }
      `}</style>

      <div className="login-root">

        {/* ── Left: Brand panel ─────────────────────────── */}
        <div className="login-brand">
          <div className="brand-logo-wrap">
            <div className="brand-logo-bg">
              <img
                src="https://lms.edubottechnologies.com/edubot_logo.svg"
                alt="Edubot Logo"
                className="brand-logo-img"
              />
            </div>
          </div>

          <h1 className="brand-headline">
            Employee Portal
          </h1>
        </div>

        {/* ── Right: Form panel ─────────────────────────── */}
        <div className="login-form-wrap">
          <div className="login-card">

            <h2 className="login-title">Sign In</h2>
            <p className="login-subtitle">Access your Edubot account securely.</p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Error */}
              {error && (
                <div className="eb-error">
                  <i className="bi bi-exclamation-circle-fill" />
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="eb-label" htmlFor="email">Work Email</label>
                <input
                  id="email"
                  type="email"
                  className={`eb-input${error ? ' is-invalid' : ''}`}
                  placeholder="name@edubot.in"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <label className="eb-label" style={{ margin:0 }} htmlFor="password">Password</label>
                </div>
                <div className="pwd-wrap">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    className={`eb-input${error ? ' is-invalid' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    autoComplete="current-password"
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    className="pwd-toggle"
                    onClick={() => setShowPwd(s => !s)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi bi-eye${showPwd ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-login" disabled={loading}>
                {loading
                  ? <><div className="spinner" />Authenticating…</>
                  : <><i className="bi bi-box-arrow-in-right" />Sign In</>
                }
              </button>
            </form>

            <div className="login-footer">
              © {new Date().getFullYear()} Edubot Software &amp; Services Pvt. Ltd.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
