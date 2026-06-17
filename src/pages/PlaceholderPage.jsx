import React from 'react'

export default function PlaceholderPage({ title, description, icon = 'bi-clock', accentColor = 'var(--eb-accent)' }) {
  return (
    <>
      <style>{`
        .ph-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - var(--eb-navbar-h) - 80px);
          padding: 40px 20px;
        }

        .ph-card {
          background: #fff;
          border: 1px solid var(--eb-border);
          border-radius: 16px;
          box-shadow: var(--eb-shadow-md);
          padding: 48px 56px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .ph-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--eb-accent), var(--eb-accent-glow));
        }

        .ph-icon-wrap {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 24px;
          background: #EFF6FF;
          color: var(--eb-accent);
        }

        .ph-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--eb-text-main);
          letter-spacing: -.03em;
          margin-bottom: 10px;
        }

        .ph-desc {
          font-size: 14px;
          color: var(--eb-text-muted);
          line-height: 1.65;
          margin-bottom: 32px;
        }

        .ph-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 99px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 700;
          color: #92400E;
          letter-spacing: .02em;
        }

        .ph-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 32px;
        }

        .ph-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--eb-border);
          animation: ph-pulse 1.4s ease-in-out infinite;
        }
        .ph-dot:nth-child(2) { animation-delay: .2s; }
        .ph-dot:nth-child(3) { animation-delay: .4s; }

        @keyframes ph-pulse {
          0%, 100% { background: var(--eb-border); transform: scale(1); }
          50% { background: var(--eb-accent); transform: scale(1.3); }
        }
      `}</style>

      <div className="ph-wrapper page-enter">
        <div className="ph-card">
          <div className="ph-icon-wrap">
            <i className={`bi ${icon}`} style={{ color: accentColor }} />
          </div>
          <div className="ph-title">{title}</div>
          <div className="ph-desc">
            {description || `The ${title} feature is currently under development. Check back soon for updates.`}
          </div>
          <div className="ph-badge">
            <i className="bi bi-hourglass-split" />
            Coming Soon
          </div>
          <div className="ph-dots">
            <div className="ph-dot" />
            <div className="ph-dot" />
            <div className="ph-dot" />
          </div>
        </div>
      </div>
    </>
  )
}
