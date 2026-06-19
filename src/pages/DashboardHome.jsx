import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const STATUS_STYLES = {
  approved: { bg: '#DCFCE7', color: '#166534', label: 'Approved' },
  rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  cancelled: { bg: '#F1F5F9', color: '#475569', label: 'Cancelled' },
}

export default function DashboardHome() {
  const { user } = useAuth()
  const role = user?.role || 'employee'

  const [loading, setLoading] = useState(true)
  const [empData, setEmpData] = useState({ recent: [] })
  const [mgrData, setMgrData] = useState({ pending: [] })
  const [admData, setAdmData] = useState({ summary: null, depts: [], activities: [], pendingLeaves: [] })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        if (role === 'admin') {
          const [sRes, dRes, actRes, pRes] = await Promise.all([
            api.get('/admin/reports/summary'),
            api.get('/admin/reports/by-department'),
            api.get('/admin/activity-logs'),
            api.get('/admin/leaves/pending')
          ])
          setAdmData({
            summary: sRes.data?.data,
            depts: dRes.data?.data || [],
            activities: actRes.data?.data || [],
            pendingLeaves: pRes.data?.data || []
          })
        }
        if (role === 'manager') {
          const pRes = await api.get('/manager/pending')
          setMgrData({ pending: pRes.data?.data?.slice(0, 5) || [] })
        }
        if (role !== 'admin') {
          const lRes = await api.get('/employee/leaves')
          setEmpData({ recent: lRes.data?.data?.slice(0, 4) || [] })
        }
      } catch (err) {
        console.error('Dashboard synchronization fault:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [role])

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  const fmtTime = d => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  let ADMIN_STATS = []
  if (admData.summary) {
    const s = admData.summary
    ADMIN_STATS = [
      { label: 'Total Employees', value: s.employees?.total || 0, icon: 'bi-people-fill', color: '#2563EB', bg: '#EFF6FF' },
      { label: 'Total Departments', value: admData.depts.length || 0, icon: 'bi-building', color: '#7C3AED', bg: '#F5F3FF' },
      { label: 'Pending Leaves', value: s.leaves?.pending || 0, icon: 'bi-hourglass-split', color: '#D97706', bg: '#FFFBEB' },
      { label: 'Approved Leaves', value: s.leaves?.approved || 0, icon: 'bi-check-circle-fill', color: '#16A34A', bg: '#F0FDF4' },
      { label: 'Rejected Leaves', value: s.leaves?.rejected || 0, icon: 'bi-x-circle-fill', color: '#DC2626', bg: '#FEF2F2' },
    ]
  }

  const handleAdminApprove = async (id) => {
    try { 
      await api.patch(`/admin/leaves/${id}/approve`); 
      setAdmData(p => ({ ...p, pendingLeaves: p.pendingLeaves.filter(x => x._id !== id) }));
    }
    catch (err) { alert('Approval failed') }
  }

  const handleAdminReject = async (id) => {
    try { 
      await api.patch(`/admin/leaves/${id}/reject`); 
      setAdmData(p => ({ ...p, pendingLeaves: p.pendingLeaves.filter(x => x._id !== id) }));
    }
    catch (err) { alert('Rejection failed') }
  }
  
  const handleManagerApprove = async (id) => {
    try { await api.patch(`/manager/leaves/${id}/approve`); setMgrData(p => ({ pending: p.pending.filter(x => x._id !== id) })) }
    catch (err) { alert('Approval failed') }
  }

  const handleManagerReject = async (id) => {
    try { await api.patch(`/manager/leaves/${id}/reject`); setMgrData(p => ({ pending: p.pending.filter(x => x._id !== id) })) }
    catch (err) { alert('Rejection failed') }
  }

  return (
    <>
      <style>{`
        .dash-header { margin-bottom: 28px; }
        .dash-greeting { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -.03em; margin-bottom: 4px; }
        .dash-date { font-size: 13px; color: #64748b; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .stat-card-admin { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .stat-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .stat-card-admin .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -.04em; line-height: 1; }
        .stat-card-admin .stat-label { font-size: 12px; color: #64748b; font-weight: 500; margin-top: 3px; }
        .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .section-hd h5 { font-size: 16px; font-weight: 700; margin: 0; color: #0f172a; }
        .table-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 24px; overflow-x: auto; }
        .table-card table { margin: 0; font-size: 13px; width: 100%; border-collapse: collapse; min-width: 600px; }
        .table-card thead th { background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #64748b; padding: 12px 16px; text-align: left; }
        .table-card tbody td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
        .action-btn { border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .action-btn.approve { background: #DCFCE7; color: #166534; }
        .action-btn.reject { background: #FEE2E2; color: #991B1B; }
        .two-col { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .activity-list { padding: 0; margin: 0; list-style: none; }
        .activity-item { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: flex-start; gap: 12px; }
        .activity-item:last-child { border-bottom: none; }
        .activity-icon { width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 14px; flex-shrink: 0; }
        .activity-content { flex: 1; font-size: 13px; }
        .activity-time { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        @media (max-width: 1024px) { .two-col { grid-template-columns: 1fr; } }
      `}</style>

      <div className="dash-header">
        <div className="dash-greeting">Administrative Operations Panel 👋</div>
        <div className="dash-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {loading ? <div style={{ padding: '40px 0', color: '#64748b' }}>Querying system database...</div> : (
        <>
          {/* ───────────────────────────────────────────────────────── */}
          {/* ADMIN VIEW */}
          {/* ───────────────────────────────────────────────────────── */}
          {role === 'admin' && (
            <>
              <div className="stats-grid">
                {ADMIN_STATS.map(s => (
                  <div key={s.label} className="stat-card-admin">
                    <div className="stat-icon-box" style={{ background: s.bg }}><i className={`bi ${s.icon}`} style={{ color: s.color }} /></div>
                    <div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="two-col">
                <div className="main-col">
                  {/* PENDING APPROVALS */}
                  <div className="section-hd">
                    <h5>Pending Leave Approvals</h5>
                  </div>
                  <div className="table-card">
                    <table>
                      <thead>
                        <tr><th>Employee Name</th><th>Department</th><th>Leave Type</th><th>Dates</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {admData.pendingLeaves.length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No pending leave requests</td></tr>
                        ) : admData.pendingLeaves.map(r => (
                          <tr key={r._id}>
                            <td style={{ fontWeight: 600 }}>{r.employeeId?.name}</td>
                            <td>{r.employeeId?.department?.name || 'Unassigned'}</td>
                            <td className="text-capitalize">{r.leaveType}</td>
                            <td>{fmt(r.startDate)} - {fmt(r.endDate)}</td>
                            <td><span className="status-badge" style={{ background: '#FEF3C7', color: '#92400E' }}>Pending</span></td>
                            <td>
                              <div className="d-flex gap-2">
                                <button className="action-btn approve" onClick={() => handleAdminApprove(r._id)}>Approve</button>
                                <button className="action-btn reject" onClick={() => handleAdminReject(r._id)}>Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* DEPARTMENT OVERVIEW */}
                  <div className="section-hd">
                    <h5>Department Overview</h5>
                  </div>
                  <div className="table-card">
                    <table>
                      <thead>
                        <tr><th>Department Name</th><th>Employee Count</th><th>Pending Leaves</th><th>Approved Leaves</th></tr>
                      </thead>
                      <tbody>
                        {admData.depts.length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No departments found</td></tr>
                        ) : admData.depts.map(d => (
                          <tr key={d.code}>
                            <td style={{ fontWeight: 600 }}>{d.department}</td>
                            <td>{d.total}</td>
                            <td><span className="status-badge" style={{ background: '#FEF3C7', color: '#92400E' }}>{d.pending}</span></td>
                            <td><span className="status-badge" style={{ background: '#DCFCE7', color: '#166534' }}>{d.approved}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="side-col">
                  {/* RECENT EMPLOYEE ACTIVITY */}
                  <div className="section-hd">
                    <h5>Recent Employee Activity</h5>
                  </div>
                  <div className="table-card" style={{ padding: 0 }}>
                    <ul className="activity-list">
                      {admData.activities.length === 0 ? (
                        <li className="activity-item" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No recent activity</li>
                      ) : admData.activities.map(act => (
                        <li key={act._id} className="activity-item">
                          <div className="activity-icon">
                            {act.action.includes('Created') ? <i className="bi bi-plus-circle text-success" /> :
                             act.action.includes('Deleted') ? <i className="bi bi-trash text-danger" /> :
                             act.action.includes('Approved') ? <i className="bi bi-check-circle text-success" /> :
                             <i className="bi bi-x-circle text-danger" />}
                          </div>
                          <div className="activity-content">
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{act.action}</div>
                            <div style={{ color: '#475569', marginTop: 2 }}>{act.details}</div>
                            <div className="activity-time">{fmt(act.createdAt)} {fmtTime(act.createdAt)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* MANAGER/EMPLOYEE VIEW (Untouched as requested) */}
          {/* ───────────────────────────────────────────────────────── */}
          {role !== 'admin' && (
            <>
              {role === 'manager' && (
                <div className="mb-4">
                  <div className="section-hd"><h5>Pending Team Approvals</h5></div>
                  <div className="table-card">
                    <table>
                      <thead><tr><th>Employee</th><th>Type</th><th>Duration</th><th>Action</th></tr></thead>
                      <tbody>
                        {mgrData.pending.length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No actions awaiting verification</td></tr>
                        ) : mgrData.pending.map(r => (
                          <tr key={r._id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{r.employeeId?.name}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{fmt(r.startDate)} - {fmt(r.endDate)}</div>
                            </td>
                            <td className="text-capitalize">{r.leaveType}</td>
                            <td><strong>{r.numberOfDays}d</strong></td>
                            <td>
                              <div className="d-flex gap-1">
                                <button className="action-btn approve" onClick={() => handleManagerApprove(r._id)}>✓</button>
                                <button className="action-btn reject" onClick={() => handleManagerReject(r._id)}>✕</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="qa-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[{ icon: 'bi-calendar-plus', label: 'Apply Leave', color: '#2563EB', to: '/dashboard/apply' },
                { icon: 'bi-calendar2-check', label: 'My History', color: '#7C3AED', to: '/dashboard/my-leaves' }].map(q => (
                  <Link key={q.label} className="qa-btn" to={q.to} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none', display: 'block', color: '#0f172a' }}>
                    <div className="qa-icon"><i className={`bi ${q.icon}`} style={{ color: q.color }} /></div>
                    <div className="qa-label">{q.label}</div>
                  </Link>
                ))}
              </div>
              <div className="recent-leaves-container">
                <div className="section-hd"><h5>Recent Adjusted Schedules</h5></div>
                <div className="table-card">
                  <table>
                    <thead><tr><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
                    <tbody>
                      {empData.recent.length === 0 ? (
                        <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No recent leaves found</td></tr>
                      ) : empData.recent.map(l => (
                        <tr key={l._id}>
                          <td style={{ fontWeight: 600 }} className="text-capitalize">{l.leaveType}</td>
                          <td style={{ fontSize: 12 }}>{fmt(l.startDate)} - {fmt(l.endDate)}</td>
                          <td><span className="status-badge" style={{ background: STATUS_STYLES[l.status]?.bg, color: STATUS_STYLES[l.status]?.color }}>{l.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}