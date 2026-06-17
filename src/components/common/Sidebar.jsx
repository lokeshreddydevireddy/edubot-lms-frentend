import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ── Navigation config ─────────────────────────────────────────
const NAV_ITEMS = {
  common: [
    { to: '/dashboard',             icon: 'bi-house-door',       label: 'Dashboard'          },
    { to: '/dashboard/apply',       icon: 'bi-calendar-plus',    label: 'Apply Leave'        },
    { to: '/dashboard/my-leaves',   icon: 'bi-calendar2-check',  label: 'My Leaves'          },
    { to: '/dashboard/balance',     icon: 'bi-pie-chart',        label: 'Leave Balance'      },
  ],
  manager: [
    { to: '/dashboard/pending',     icon: 'bi-hourglass-split',  label: 'Pending Requests' },
    { to: '/dashboard/approved',    icon: 'bi-check-circle',     label: 'Approved Requests'  },
    { to: '/dashboard/rejected',    icon: 'bi-x-circle',         label: 'Rejected Requests'  },
    { to: '/dashboard/team',        icon: 'bi-people',           label: 'Team Calendar'      },
  ],
  admin: [
    { to: '/dashboard/users',       icon: 'bi-person-gear',      label: 'Employees'          },
    { to: '/dashboard/departments', icon: 'bi-building',         label: 'Departments'        },
    { to: '/dashboard/leave-types', icon: 'bi-tags',             label: 'Leave Types'        },
    { to: '/dashboard/reports',     icon: 'bi-bar-chart-line',   label: 'Reports'            },
    { to: '/dashboard/audit',       icon: 'bi-shield-check',     label: 'Audit Logs'         },
  ],
}

const ROLE_LABELS = { admin: 'Administrator', manager: 'Team Manager', employee: 'Employee' }
const ROLE_COLORS = { admin: '#DC2626', manager: '#D97706', employee: '#2563EB' }

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const role = user?.role || 'employee'

  // Build nav sections
  const sections = [
    { title: 'Main',          items: NAV_ITEMS.common },
    ...(role === 'manager' || role === 'admin'
        ? [{ title: 'Team', items: NAV_ITEMS.manager }] : []),
    ...(role === 'admin'
        ? [{ title: 'Admin',  items: NAV_ITEMS.admin  }] : []),
  ]

  return (
    <>
      <style>{`
        /* ── Sidebar shell ──────────────────────────────── */
        .eb-sidebar {
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          width: var(--eb-sidebar-w);
          background: var(--eb-navy);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: width .22s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
        }
        .eb-sidebar.collapsed { width: 68px; }

        /* ── Logo area ──────────────────────────────────── */
        .sb-logo {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 14px;
          height: var(--eb-navbar-h);
          border-bottom: 1px solid rgba(255,255,255,.07);
          flex-shrink: 0;
          text-decoration: none;
          overflow: hidden;
        }
        .sb-logo-bg {
          background: #ffffff;
          border-radius: 8px;
          padding: 6px 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: padding .22s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 1px 6px rgba(0,0,0,.15);
          overflow: hidden;
          flex-shrink: 0;
        }
        .collapsed .sb-logo-bg {
          padding: 6px 6px;
        }
        .sb-logo-img {
          width: 180px;
          height: auto;
          display: block;
          transition: width .22s cubic-bezier(.4,0,.2,1);
          flex-shrink: 0;
        }
        .collapsed .sb-logo-img {
          width: 36px;
        }

        /* ── Toggle button ──────────────────────────────── */
        .sb-toggle {
          position: absolute;
          top: 16px; right: -12px;
          width: 24px; height: 24px;
          background: var(--eb-navy-light);
          border: 1.5px solid rgba(255,255,255,.12);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #94A3B8;
          font-size: 11px;
          transition: var(--eb-transition);
          z-index: 10;
        }
        .sb-toggle:hover { background: var(--eb-accent); color: #fff; border-color: var(--eb-accent); }

        /* ── Nav scroll area ────────────────────────────── */
        .sb-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px 0 8px;
        }
        .sb-nav::-webkit-scrollbar { width: 0; }

        /* ── Section header ─────────────────────────────── */
        .sb-section-title {
          padding: 0 18px;
          margin: 18px 0 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          color: #475569;
          text-transform: uppercase;
          white-space: nowrap;
          transition: opacity .15s;
        }
        .collapsed .sb-section-title { opacity: 0; }

        /* ── Nav item ───────────────────────────────────── */
        .sb-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 18px;
          margin: 2px 10px;
          border-radius: 8px;
          text-decoration: none;
          color: #94A3B8;
          font-size: 13.5px;
          font-weight: 500;
          transition: var(--eb-transition);
          position: relative;
          white-space: nowrap;
          cursor: pointer;
        }
        .sb-nav-item:hover {
          background: rgba(255,255,255,.06);
          color: #fff;
        }
        .sb-nav-item.active {
          background: rgba(37,99,235,.2);
          color: #fff;
          font-weight: 600;
        }
        .sb-nav-item.active::before {
          content: '';
          position: absolute;
          left: -10px; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 20px;
          background: var(--eb-accent);
          border-radius: 0 2px 2px 0;
        }

        .sb-nav-icon {
          font-size: 17px;
          flex-shrink: 0;
          width: 20px;
          text-align: center;
        }
        .sb-nav-label {
          opacity: 1;
          transition: opacity .15s;
        }
        .collapsed .sb-nav-label { opacity: 0; width: 0; overflow: hidden; }

        /* ── Badge ──────────────────────────────────────── */
        .sb-badge {
          margin-left: auto;
          background: var(--eb-accent);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 99px;
          min-width: 18px;
          text-align: center;
          line-height: 16px;
          flex-shrink: 0;
          transition: opacity .15s;
        }
        .collapsed .sb-badge { opacity: 0; }

        /* ── Tooltip (collapsed state) ──────────────────── */
        .sb-nav-item[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: #1E293B;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
          box-shadow: var(--eb-shadow-md);
        }

        /* ── User profile area ──────────────────────────── */
        .sb-profile {
          padding: 14px 12px;
          border-top: 1px solid rgba(255,255,255,.07);
          flex-shrink: 0;
        }
        .sb-profile-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 6px;
          border-radius: 8px;
          transition: var(--eb-transition);
          cursor: default;
        }
        .sb-profile-inner:hover { background: rgba(255,255,255,.05); }
        .sb-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: var(--eb-accent);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sb-profile-info {
          flex: 1;
          min-width: 0;
          opacity: 1;
          transition: opacity .15s;
        }
        .collapsed .sb-profile-info { opacity: 0; width: 0; overflow: hidden; }
        .sb-profile-name {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-profile-role {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .sb-logout-btn {
          background: none;
          border: none;
          padding: 0;
          color: #475569;
          font-size: 15px;
          cursor: pointer;
          transition: var(--eb-transition);
          flex-shrink: 0;
        }
        .sb-logout-btn:hover { color: var(--eb-danger); }
        .collapsed .sb-logout-btn { display: none; }

        /* ── Logout modal (simple) ──────────────────────── */
        .logout-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.45);
          z-index: 2000;
          display: flex; align-items: center; justify-content: center;
        }
        .logout-modal {
          background: #fff;
          border-radius: 12px;
          padding: 28px 32px;
          max-width: 340px;
          width: 90%;
          box-shadow: var(--eb-shadow-lg);
          text-align: center;
        }
        .logout-modal h5 { font-weight: 700; margin-bottom: 8px; }
        .logout-modal p { font-size: 14px; color: var(--eb-text-muted); margin-bottom: 24px; }
      `}</style>

      <aside className={`eb-sidebar${collapsed ? ' collapsed' : ''}`}>

        <a className="sb-logo" href="/dashboard">
          <div className="sb-logo-bg">
            <img
              src="https://lms.edubottechnologies.com/edubot_logo.svg"
              alt="Edubot Logo"
              className="sb-logo-img"
            />
          </div>
        </a>

        {/* Collapse toggle */}
        <button className="sb-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`} />
        </button>

        {/* Navigation */}
        <nav className="sb-nav">
          {sections.map(section => (
            <div key={section.title}>
              <div className="sb-section-title">{section.title}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `sb-nav-item${isActive ? ' active' : ''}`}
                  data-tooltip={collapsed ? item.label : undefined}
                >
                  <i className={`bi ${item.icon} sb-nav-icon`} />
                  <span className="sb-nav-label">{item.label}</span>
                  {item.badge && <span className="sb-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="sb-profile">
          <div className="sb-profile-inner">
            <div className="sb-avatar">{user?.avatar || '??'}</div>
            <div className="sb-profile-info">
              <div className="sb-profile-name">{user?.name}</div>
              <div className="sb-profile-role" style={{ color: ROLE_COLORS[role] }}>
                {ROLE_LABELS[role]}
              </div>
            </div>
            <button
              className="sb-logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
              title="Sign out"
            >
              <i className="bi bi-box-arrow-right" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="logout-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <h5>Sign out?</h5>
            <p>You'll need to sign in again to access your account.</p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-light fw-600"
                style={{ fontWeight:600, minWidth:100 }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger fw-600"
                style={{ fontWeight:600, minWidth:100 }}
                onClick={logout}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
