import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        /* ── Reset & Root ──────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lms-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #F8FAFC;
        }

        /* ════════════════════════════════════════════════════
           LEFT PANEL — Brand
        ════════════════════════════════════════════════════ */
        .lms-brand {
          width: 50%;
          min-height: 100vh;
          background: linear-gradient(145deg, #0F172A 0%, #1E3A8A 45%, #1D4ED8 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 56px;
          position: relative;
          overflow: hidden;
        }

        /* Floating background shapes */
        .lms-shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .lms-shape-1 {
          width: 420px; height: 420px;
          top: -140px; right: -120px;
          background: radial-gradient(circle, rgba(37,99,235,0.30) 0%, transparent 70%);
        }
        .lms-shape-2 {
          width: 300px; height: 300px;
          bottom: -80px; left: -100px;
          background: radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%);
        }
        .lms-shape-3 {
          width: 180px; height: 180px;
          top: 50%; left: 5%;
          background: radial-gradient(circle, rgba(147,197,253,0.12) 0%, transparent 70%);
        }
        .lms-shape-4 {
          width: 80px; height: 80px;
          bottom: 22%; right: 8%;
          background: rgba(255,255,255,0.04);
          border-radius: 18px;
          transform: rotate(20deg);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .lms-shape-5 {
          width: 50px; height: 50px;
          top: 20%; left: 12%;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          transform: rotate(-15deg);
          border: 1px solid rgba(255,255,255,0.06);
        }

        /* Glassmorphism card inside brand panel */
        .lms-glass {
          position: relative;
          z-index: 2;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 24px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 40px 44px 44px;
          text-align: center;
          max-width: 440px;
          width: 100%;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.10);
        }

        /* Logo */
        .lms-logo-wrap {
          background: #ffffff;
          border-radius: 16px;
          padding: 18px 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.22);
        }
        .lms-logo {
          width: 220px;
          height: auto;
          display: block;
        }

        /* Brand text */
        .lms-brand-title {
          font-size: 22px;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }
        .lms-brand-sub {
          font-size: 14px;
          font-weight: 400;
          color: rgba(186,214,255,0.82);
          line-height: 1.65;
        }

        /* Feature pill badges */
        .lms-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 28px;
        }
        .lms-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 5px 14px 5px 10px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
        }
        .lms-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #60A5FA;
          flex-shrink: 0;
        }

        /* ════════════════════════════════════════════════════
           RIGHT PANEL — Form
        ════════════════════════════════════════════════════ */
        .lms-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: #F8FAFC;
        }

        .lms-card {
          width: 100%;
          max-width: 420px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow:
            0 1px 3px rgba(15,23,42,0.06),
            0 8px 32px rgba(15,23,42,0.08),
            0 24px 64px rgba(15,23,42,0.04);
          padding: 40px 40px 36px;
        }

        /* Card header */
        .lms-card-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 100px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          color: #2563EB;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 18px;
        }
        .lms-card-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #2563EB;
        }

        .lms-card-title {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .lms-card-desc {
          font-size: 14px;
          color: #64748B;
          margin-bottom: 32px;
          line-height: 1.55;
        }

        /* ── Form fields ───────────────────────────────────── */
        .lms-field { margin-bottom: 20px; }

        .lms-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 7px;
        }

        .lms-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lms-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px; height: 16px;
          color: #94A3B8;
          pointer-events: none;
          flex-shrink: 0;
        }
        .lms-input {
          width: 100%;
          padding: 11px 42px 11px 40px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          color: #0F172A;
          background: #FFFFFF;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .lms-input::placeholder { color: #CBD5E1; }
        .lms-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }
        .lms-input.is-invalid {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.10);
        }
        .lms-pwd-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: color 0.15s;
        }
        .lms-pwd-toggle:hover { color: #2563EB; }

        /* ── Remember / Forgot row ─────────────────────────── */
        .lms-row-aux {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          margin-top: -4px;
        }
        .lms-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .lms-remember input[type="checkbox"] {
          width: 16px; height: 16px;
          border: 1.5px solid #CBD5E1;
          border-radius: 4px;
          accent-color: #2563EB;
          cursor: pointer;
        }
        .lms-remember-label {
          font-size: 13px;
          color: #475569;
          font-weight: 500;
        }
        .lms-forgot {
          font-size: 13px;
          font-weight: 600;
          color: #2563EB;
          text-decoration: none;
          transition: color 0.15s;
        }
        .lms-forgot:hover { color: #1D4ED8; text-decoration: underline; }

        /* ── Error alert ───────────────────────────────────── */
        .lms-alert-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
          border-left: 3px solid #EF4444;
        }
        .lms-alert-icon { color: #EF4444; flex-shrink: 0; margin-top: 1px; }
        .lms-alert-msg {
          font-size: 13px;
          color: #B91C1C;
          font-weight: 500;
          line-height: 1.5;
        }

        /* ── Submit button ─────────────────────────────────── */
        .lms-btn-submit {
          width: 100%;
          padding: 13px 24px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.32);
          letter-spacing: 0.01em;
        }
        .lms-btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.42);
        }
        .lms-btn-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(37,99,235,0.28);
        }
        .lms-btn-submit:disabled {
          opacity: 0.75;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Divider ───────────────────────────────────────── */
        .lms-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .lms-divider-line {
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }
        .lms-divider-text {
          font-size: 12px;
          color: #94A3B8;
          font-weight: 500;
          white-space: nowrap;
        }

        /* ── Footer ────────────────────────────────────────── */
        .lms-card-footer {
          text-align: center;
          font-size: 11.5px;
          color: #94A3B8;
          line-height: 1.6;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #F1F5F9;
        }

        /* ── Spinner ───────────────────────────────────────── */
        @keyframes lms-spin { to { transform: rotate(360deg); } }
        .lms-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lms-spin 0.7s linear infinite;
        }

        /* ── Responsive ────────────────────────────────────── */
        @media (max-width: 900px) {
          .lms-brand { width: 45%; padding: 48px 36px; }
          .lms-glass { padding: 32px 30px 36px; }
          .lms-brand-title { font-size: 19px; }
        }
        @media (max-width: 720px) {
          .lms-root { flex-direction: column; }
          .lms-brand {
            width: 100%;
            min-height: auto;
            padding: 40px 24px 44px;
          }
          .lms-glass { padding: 28px 24px 32px; }
          .lms-logo { width: 180px; }
          .lms-brand-title { font-size: 18px; }
          .lms-brand-sub { font-size: 13px; }
          .lms-form-panel { padding: 36px 20px 48px; }
          .lms-card { padding: 32px 24px 28px; border-radius: 16px; }
          .lms-card-title { font-size: 22px; }
        }
        @media (max-width: 400px) {
          .lms-card { padding: 28px 18px 24px; }
          .lms-input { font-size: 15px; }
          .lms-badge { font-size: 11px; }
        }
      `}</style>

      <div className="lms-root">

        {/* ════════════════════════════════════════════════════
            LEFT — Brand Panel
        ════════════════════════════════════════════════════ */}
        <div className="lms-brand">
          {/* Decorative floating shapes */}
          <div className="lms-shape lms-shape-1" />
          <div className="lms-shape lms-shape-2" />
          <div className="lms-shape lms-shape-3" />
          <div className="lms-shape lms-shape-4" />
          <div className="lms-shape lms-shape-5" />

          {/* Glassmorphism content card */}
          <div className="lms-glass">
            {/* Logo */}
            <div className="lms-logo-wrap">
              <img
                src="https://lms.edubottechnologies.com/edubot_logo.svg"
                alt="Edubot"
                className="lms-logo"
              />
            </div>

            {/* Title + subtitle */}
            <h1 className="lms-brand-title">
              Edubot Leave Management System
            </h1>
            <p className="lms-brand-sub">
              Manage employee leave requests, approvals and attendance efficiently.
            </p>

            {/* Feature badge pills */}
            <div className="lms-badges">
              <span className="lms-badge">
                <span className="lms-badge-dot" />
                Leave Requests
              </span>
              <span className="lms-badge">
                <span className="lms-badge-dot" />
                Approvals
              </span>
              <span className="lms-badge">
                <span className="lms-badge-dot" />
                Attendance
              </span>
              <span className="lms-badge">
                <span className="lms-badge-dot" />
                HR Reports
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            RIGHT — Form Panel
        ════════════════════════════════════════════════════ */}
        <div className="lms-form-panel">
          <div className="lms-card">

            {/* Eyebrow chip */}
            <div className="lms-card-eyebrow">
              <span className="lms-card-eyebrow-dot" />
              Employee Portal
            </div>

            {/* Heading */}
            <h2 className="lms-card-title">Welcome back</h2>
            <p className="lms-card-desc">Sign in to your account to continue.</p>

            {/* Error alert */}
            {error && (
              <div className="lms-alert-error">
                <svg className="lms-alert-icon" width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="lms-alert-msg">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="lms-field">
                <label className="lms-label" htmlFor="lms-email">Work Email</label>
                <div className="lms-input-wrap">
                  <svg className="lms-input-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <input
                    id="lms-email"
                    type="email"
                    className={`lms-input${error ? ' is-invalid' : ''}`}
                    placeholder="name@edubot.in"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lms-field">
                <label className="lms-label" htmlFor="lms-password">Password</label>
                <div className="lms-input-wrap">
                  <svg className="lms-input-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <input
                    id="lms-password"
                    type={showPwd ? 'text' : 'password'}
                    className={`lms-input${error ? ' is-invalid' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="lms-pwd-toggle"
                    onClick={() => setShowPwd(s => !s)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPwd ? (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="lms-row-aux">
                <label className="lms-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span className="lms-remember-label">Remember me</span>
                </label>
                <a href="#forgot" className="lms-forgot" onClick={e => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button type="submit" className="lms-btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="lms-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="lms-card-footer">
              © {new Date().getFullYear()} Edubot Software &amp; Services Pvt. Ltd.<br />
              All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}