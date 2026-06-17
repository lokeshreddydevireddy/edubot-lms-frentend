import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 16,
      background: 'var(--eb-slate-bg)', textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: 72 }}>🗂️</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--eb-text-muted)', maxWidth: 320 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        className="btn btn-primary px-4"
        onClick={() => navigate('/dashboard')}
      >
        <i className="bi bi-house-door me-2" />
        Back to Dashboard
      </button>
    </div>
  )
}
