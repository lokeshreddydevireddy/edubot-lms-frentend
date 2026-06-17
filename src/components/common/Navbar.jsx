import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ── Page title map ────────────────────────────────────────────
const PAGE_TITLES = {
  '/dashboard':              { title: 'Dashboard',             icon: 'bi-house-door'      },
  '/dashboard/apply':        { title: 'Apply Leave',           icon: 'bi-calendar-plus'   },
  '/dashboard/my-leaves':    { title: 'My Leaves',             icon: 'bi-calendar2-check' },
  '/dashboard/balance':      { title: 'Leave Balance',         icon: 'bi-pie-chart'       },
  '/dashboard/pending':      { title: 'Pending Requests',      icon: 'bi-hourglass-split' },
  '/dashboard/approved':     { title: 'Approved Requests',     icon: 'bi-check-circle'    },
  '/dashboard/rejected':     { title: 'Rejected Requests',     icon: 'bi-x-circle'        },
  '/dashboard/team':         { title: 'Team Calendar',         icon: 'bi-people'          },
  '/dashboard/users':        { title: 'Employees Management',  icon: 'bi-person-gear'     },
  '/dashboard/departments':  { title: 'Departments',           icon: 'bi-building'        },
  '/dashboard/leave-types':  { title: 'Leave Types',           icon: 'bi-tags'            },
  '/dashboard/reports':      { title: 'Reports Dashboard',     icon: 'bi-bar-chart-line'  },
  '/dashboard/audit':        { title: 'Audit Logs',            icon: 'bi-shield-check'    },
}

export default function Navbar({ sidebarCollapsed }) {
  const { user } = useAuth()
  const location = useLocation()
  const [showNotif, setShowNotif]   = useState(false)
  const notifRef = useRef(null)

  const page      = PAGE_TITLES[location.pathname] || { title: 'Employee Portal', icon: 'bi-grid' }
  const sidebarW  = sidebarCollapsed ? 68 : 240

  // Close notif dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <style>{`
        .eb-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--eb-navbar-h);
          background: #fff;
          border-bottom: 1px solid var(--eb-border);
          display: flex;
          align-items: center;
          padding: 0 24px;
          z-index: 900;
          gap: 16px;
          transition: padding-left .22s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 1px 0 var(--eb-border);
        }

        .nb-page-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .nb-page-icon {
          width: 32px; height: 32px;
          background: #EFF6FF;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: var(--eb-accent);
          font-size: 15px;
          flex-shrink: 0;
        }
        .nb-page-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--eb-text-main);
          letter-spacing: -.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Right actions ──────────────────────────────── */
        .nb-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .nb-icon-btn {
          width: 36px; height: 36px;
          border-radius: 8px;
          border: none;
          background: none;
          color: var(--eb-text-muted);
          font-size: 17px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: var(--eb-transition);
          position: relative;
        }
        .nb-icon-btn:hover { background: var(--eb-slate-bg); color: var(--eb-text-main); }

        /* ── Notification dropdown ──────────────────────── */
        .nb-notif-wrap { position: relative; }
        .nb-notif-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 340px;
          background: #fff;
          border: 1px solid var(--eb-border);
          border-radius: 12px;
          box-shadow: var(--eb-shadow-lg);
          z-index: 1500;
          overflow: hidden;
        }
        .nb-notif-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid var(--eb-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nb-notif-header h6 { margin: 0; font-weight: 700; font-size: 14px; }

        .nb-notif-list { max-height: 320px; overflow-y: auto; }

        /* ── Divider ────────────────────────────────────── */
        .nb-divider {
          width: 1px;
          height: 24px;
          background: var(--eb-border);
          margin: 0 4px;
        }

        /* ── User chip ──────────────────────────────────── */
        .nb-user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border-radius: 99px;
          border: 1px solid var(--eb-border);
          cursor: pointer;
          transition: var(--eb-transition);
          background: none;
        }
        .nb-user-chip:hover { background: var(--eb-slate-bg); border-color: #CBD5E1; }
        .nb-user-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--eb-accent);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .nb-user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--eb-text-main);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Search bar ─────────────────────────────────── */
        .nb-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--eb-slate-bg);
          border: 1.5px solid transparent;
          border-radius: 8px;
          padding: 6px 12px;
          transition: var(--eb-transition);
        }
        .nb-search:focus-within {
          border-color: var(--eb-accent);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,.1);
        }
        .nb-search input {
          border: none; background: none; outline: none;
          font-size: 13px; font-family: inherit;
          color: var(--eb-text-main);
          width: 180px;
        }
        .nb-search input::placeholder { color: #94A3B8; }
        .nb-search i { color: #94A3B8; font-size: 14px; }

        @media (max-width: 600px) {
          .nb-search { display: none; }
          .nb-user-name { display: none; }
        }
      `}</style>

      <header className="eb-navbar" style={{ paddingLeft: sidebarW + 24 }}>

        {/* Page title */}
        <div className="nb-page-info">
          <div className="nb-page-icon">
            <i className={`bi ${page.icon}`} />
          </div>
          <div>
            <div className="nb-page-title">{page.title}</div>
          </div>
        </div>

        {/* Search */}
        <div className="nb-search">
          <i className="bi bi-search" />
          <input type="text" placeholder="Search..." />
        </div>

        {/* Actions */}
        <div className="nb-actions">

          {/* Help */}
          <button className="nb-icon-btn" title="Help & docs">
            <i className="bi bi-question-circle" />
          </button>

          {/* Notifications */}
          <div className="nb-notif-wrap" ref={notifRef}>
            <button
              className="nb-icon-btn"
              title="Notifications"
              onClick={() => setShowNotif(s => !s)}
            >
              <i className="bi bi-bell" />
            </button>

            {showNotif && (
              <div className="nb-notif-panel">
                <div className="nb-notif-header">
                  <h6>Notifications</h6>
                </div>
                <div className="nb-notif-list">
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--eb-text-muted)' }}>
                    No data available
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="nb-divider" />

          {/* User chip */}
          <button className="nb-user-chip">
            <div className="nb-user-avatar">{user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}</div>
            <span className="nb-user-name">{user?.name?.split(' ')[0]}</span>
            <i className="bi bi-chevron-down" style={{ fontSize:11, color:'var(--eb-text-muted)' }} />
          </button>
        </div>
      </header>
    </>
  )
}
