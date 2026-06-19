import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ── Navigation Configuration ──────────────────────────────────
const NAV_ITEMS = {
  employee: [
    { to: '/dashboard/apply', icon: 'bi-calendar-plus', label: 'Apply Leave' },
    { to: '/dashboard/my-leaves', icon: 'bi-calendar2-check', label: 'My Leaves' },
  ],
  manager: [
    { to: '/dashboard/pending', icon: 'bi-hourglass-split', label: 'Pending Requests' },
    { to: '/dashboard/approved', icon: 'bi-check-circle', label: 'Approved Requests' },
    { to: '/dashboard/rejected', icon: 'bi-x-circle', label: 'Rejected Requests' },
    { to: '/dashboard/team', icon: 'bi-people', label: 'Team Calendar' },
  ],
  admin: [
    { to: '/dashboard/users', icon: 'bi-person-gear', label: 'Employees' },
    { to: '/dashboard/departments', icon: 'bi-building', label: 'Departments' },
    { to: '/dashboard/reports', icon: 'bi-bar-chart-line', label: 'Reports' },
  ],
}

const ROLE_LABELS = { admin: 'System Admin', manager: 'Team Manager', employee: 'Associate' }
const ROLE_COLORS = { admin: '#ef4444', manager: '#f59e0b', employee: '#3b82f6' }

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Modal Overlays State Engine
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedLeaveId, setSelectedLeaveId] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const role = user?.role || 'employee'

  const sections = [
    { title: 'Overview', items: [{ to: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' }] },
    ...(role === 'employee' ? [{ title: 'Workspace', items: NAV_ITEMS.employee }] : []),
    ...(role === 'manager' ? [{ title: 'Management', items: NAV_ITEMS.manager }] : []),
    ...(role === 'admin' ? [{ title: 'Administration', items: NAV_ITEMS.admin }] : []),
  ]

  // Hook triggered externally by components to execute a safe cancellation sequence
  const handleInitiateCancellation = (leaveId) => {
    setSelectedLeaveId(leaveId)
    setShowCancelModal(true)
  }

  const handleConfirmCancellation = async () => {
    if (!selectedLeaveId) return
    setIsCancelling(true)
    try {
      // Backend production API engine bridge template:
      // await api.patch(`/leaves/${selectedLeaveId}/cancel`);

      setShowCancelModal(false)
      setSelectedLeaveId(null)
    } catch (error) {
      console.error("Leave cancellation system error:", error)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <>
      <style>{`
        :root {
          --sb-gradient-start: #0b0f19; --sb-gradient-end: #1e2640;
          --sb-active-blue: #3b82f6; --sb-text-primary: #f8fafc; --sb-text-muted: #94a3b8;
          --sb-glass-hover: rgba(255, 255, 255, 0.05); --sb-glass-active: rgba(59, 130, 246, 0.14);
          --sb-border-glow: rgba(59, 130, 246, 0.3);
        }
        .eb-sidebar {
          position: fixed; top: 0; left: 0; height: 100vh; width: 260px;
          background: linear-gradient(160deg, var(--sb-gradient-start) 0%, var(--sb-gradient-end) 100%);
          display: flex; flex-direction: column; z-index: 1040;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-right: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow: 6px 0 32px rgba(4, 7, 13, 0.4);
        }
        .eb-sidebar.collapsed { width: 78px; }
        .sb-logo { display: flex; align-items: center; padding: 0 24px; height: 80px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-decoration: none; gap: 14px; }
        .sb-logo-bg { background: rgba(255, 255, 255, 0.96); border-radius: 12px; padding: 7px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); flex-shrink: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .collapsed .sb-logo-bg { padding: 9px; border-radius: 10px; }
        .sb-logo-img { width: 132px; height: auto; display: block; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .collapsed .sb-logo-img { width: 22px; height: 22px; object-fit: contain; }
        .sb-toggle { position: absolute; top: 26px; right: -12px; width: 24px; height: 24px; background: #1e2640; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--sb-text-muted); font-size: 11px; z-index: 1050; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .sb-toggle:hover { background: var(--sb-active-blue); color: #fff; border-color: var(--sb-active-blue); transform: scale(1.1); box-shadow: 0 0 12px var(--sb-border-glow); }
        .sb-nav { flex: 1; overflow-y: auto; padding: 24px 0; scrollbar-width: none; }
        .sb-nav::-webkit-scrollbar { display: none; }
        .sb-section-title { padding: 0 24px; margin: 20px 0 8px; font-size: 11px; font-weight: 700; letter-spacing: .09em; color: #4b5563; text-transform: uppercase; white-space: nowrap; transition: opacity 0.2s ease; }
        .collapsed .sb-section-title { opacity: 0; pointer-events: none; }
        .sb-nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 18px; margin: 4px 14px; border-radius: 10px; text-decoration: none; color: var(--sb-text-muted); font-size: 14px; font-weight: 500; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; white-space: nowrap; }
        .sb-nav-item:hover { background: var(--sb-glass-hover); color: var(--sb-text-primary); padding-left: 22px; }
        .collapsed .sb-nav-item:hover { padding-left: 18px; }
        .sb-nav-item.active { background: var(--sb-glass-active); color: var(--sb-text-primary); font-weight: 600; }
        .sb-nav-item.active::before { content: ''; position: absolute; left: -14px; top: 15%; height: 70%; width: 4px; background: var(--sb-active-blue); border-radius: 0 6px 6px 0; box-shadow: 0 0 14px var(--sb-active-blue); }
        .sb-nav-icon { font-size: 18px; flex-shrink: 0; width: 22px; text-align: center; opacity: 0.85; transition: transform 0.2s; }
        .sb-nav-item:hover .sb-nav-icon { transform: scale(1.05); opacity: 1; }
        .sb-nav-item.active .sb-nav-icon { color: var(--sb-active-blue); opacity: 1; }
        .sb-nav-label { opacity: 1; transition: opacity 0.2s ease, width 0.2s ease; }
        .collapsed .sb-nav-label { opacity: 0; width: 0; overflow: hidden; pointer-events: none; }
        .sb-profile { padding: 18px; border-top: 1px solid rgba(255, 255, 255, 0.05); background: rgba(11, 15, 25, 0.5); backdrop-filter: blur(10px); }
        .sb-profile-inner { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.03); transition: background 0.2s ease; }
        .sb-profile-inner:hover { background: var(--sb-glass-hover); }
        .sb-avatar { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .sb-profile-info { flex: 1; min-width: 0; transition: opacity 0.2s ease; }
        .collapsed .sb-profile-info { opacity: 0; width: 0; overflow: hidden; pointer-events: none; }
        .sb-profile-name { font-size: 14px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sb-profile-role { font-size: 11px; font-weight: 600; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.03em; }
        .sb-logout-btn { background: none; border: none; padding: 6px; color: #64748b; font-size: 19px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s ease; flex-shrink: 0; }
        .sb-logout-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .collapsed .sb-logout-btn { display: none; }
        .sb-nav-item[data-tooltip]:hover::after { content: attr(data-tooltip); position: absolute; left: 88px; top: 50%; transform: translateY(-50%); background: #0f172a; color: #fff; font-size: 12px; font-weight: 600; padding: 7px 14px; border-radius: 8px; white-space: nowrap; z-index: 1060; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.08); pointer-events: none; }
        .mobile-nav-toggle { display: none; position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; background: #0b0f19; color: #fff; border: 1px solid rgba(255,255,255,0.08); border-radius: 50%; box-shadow: 0 12px 32px rgba(0,0,0,0.4); z-index: 1100; font-size: 24px; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .mobile-nav-toggle:active { transform: scale(0.92); }
        @media (max-width: 768px) {
          .mobile-nav-toggle { display: flex; } .sb-toggle { display: none; }
          .eb-sidebar { width: 280px !important; transform: translateX(-100%); box-shadow: none; }
          .eb-sidebar.mobile-open { transform: translateX(0); box-shadow: 10px 0 40px rgba(0,0,0,0.5); }
          .sb-nav-label, .sb-section-title, .sb-profile-info { opacity: 1 !important; width: auto !important; pointer-events: auto !important; }
          .sb-logout-btn { display: flex !important; }
          .sidebar-mobile-backdrop { position: fixed; inset: 0; background: rgba(11, 15, 25, 0.6); backdrop-filter: blur(5px); z-index: 1030; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
          .sidebar-mobile-backdrop.show { opacity: 1; pointer-events: auto; }
        }
        .portal-overlay { position: fixed; inset: 0; background: rgba(11, 15, 25, 0.7); backdrop-filter: blur(6px); z-index: 2050; display: flex; align-items: center; justify-content: center; padding: 16px; animation: fadeInOverlay 0.2s ease-out forwards; }
        .portal-modal { background: #ffffff; border-radius: 20px; padding: 32px; max-width: 400px; width: 100%; box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3); text-align: center; border: 1px solid #f1f5f9; transform: scale(0.95); opacity: 0; animation: scaleInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .portal-modal h5 { font-weight: 700; color: #0f172a; margin-bottom: 10px; font-size: 20px; letter-spacing: -0.02em; }
        .portal-modal p { font-size: 14px; color: #64748b; margin-bottom: 28px; line-height: 1.6; }
        @keyframes fadeInOverlay { to { opacity: 1; } }
        @keyframes scaleInModal { to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Mobile Back-overlay Backdrop */}
      <div className={`sidebar-mobile-backdrop${mobileOpen ? ' show' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* Floating Action Mobile Nav Bar Menu Button Toggle */}
      <button className="mobile-nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle Menu">
        <i className={`bi bi-${mobileOpen ? 'x-lg' : 'list'}`} />
      </button>

      <aside className={`eb-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <a className="sb-logo" href="/dashboard">
          <div className="sb-logo-bg">
            <img src="https://lms.edubottechnologies.com/edubot_logo.svg" alt="Logo" className="sb-logo-img" />
          </div>
        </a>

        <button className="sb-toggle" onClick={onToggle} aria-label="Toggle Sidebar"><i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`} /></button>

        <nav className="sb-nav">
          {sections.map(section => (
            <div key={section.title}>
              <div className="sb-section-title">{section.title}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `sb-nav-item${isActive ? ' active' : ''}`}
                  data-tooltip={collapsed ? item.label : undefined}
                >
                  <i className={`bi ${item.icon} sb-nav-icon`} />
                  <span className="sb-nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Workspace Identity Summary Block */}
        <div className="sb-profile">
          <div className="sb-profile-inner">
            <div className="sb-avatar">{user?.avatar || user?.name?.slice(0, 2).toUpperCase() || '??'}</div>
            <div className="sb-profile-info">
              <div className="sb-profile-name">{user?.name}</div>
              <div className="sb-profile-role" style={{ color: ROLE_COLORS[role] }}>{ROLE_LABELS[role]}</div>
            </div>
            <button className="sb-logout-btn" onClick={() => setShowLogoutConfirm(true)} title="Terminate Session"><i className="bi bi-box-arrow-right" /></button>
          </div>
        </div>
      </aside>

      {/* Session Sign-out System confirmation Modal Context */}
      {showLogoutConfirm && (
        <div className="portal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="portal-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 42, marginBottom: 16 }}>🔒</div>
            <h5>Confirm Sign Out</h5>
            <p>Are you sure you want to log out? You will need your security credentials to access your dashboard metrics again.</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-light" style={{ fontWeight: 600, minWidth: 120, borderRadius: '10px', fontSize: '14px', border: '1px solid #e2e8f0' }} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ fontWeight: 600, minWidth: 120, borderRadius: '10px', fontSize: '14px', background: '#ef4444', border: 'none' }} onClick={logout}>Sign out</button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Workspace Leave Cancellation Confirmation Modal Overlay Context */}
      {showCancelModal && (
        <div className="portal-overlay" onClick={() => !isCancelling && setShowCancelModal(false)}>
          <div className="portal-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 42, marginBottom: 16 }}>⚠️</div>
            <h5>Cancel Leave Request</h5>
            <p>Are you sure you want to cancel this leave request? This action cannot be undone, and your pending leave balance will be restored automatically.</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-light" style={{ fontWeight: 600, minWidth: 120, borderRadius: '10px', fontSize: '14px', border: '1px solid #e2e8f0' }} onClick={() => setShowCancelModal(false)} disabled={isCancelling}>Go Back</button>
              <button className="btn btn-danger" style={{ fontWeight: 600, minWidth: 120, borderRadius: '10px', fontSize: '14px', background: '#ef4444', border: 'none' }} onClick={handleConfirmCancellation} disabled={isCancelling}>
                {isCancelling ? 'Processing...' : 'Yes, Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}