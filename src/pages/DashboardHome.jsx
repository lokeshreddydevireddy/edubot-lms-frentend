import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const STATUS_STYLES = {
  approved:  { bg:'#DCFCE7', color:'#166534', label:'Approved'  },
  rejected:  { bg:'#FEE2E2', color:'#991B1B', label:'Rejected'  },
  pending:   { bg:'#FEF3C7', color:'#92400E', label:'Pending'   },
  cancelled: { bg:'#F1F5F9', color:'#475569', label:'Cancelled' },
}

export default function DashboardHome() {
  const { user } = useAuth()
  const role = user?.role || 'employee'

  const [loading, setLoading] = useState(true)
  const [empData, setEmpData] = useState({ balances: null, recent: [] })
  const [mgrData, setMgrData] = useState({ pending: [] })
  const [admData, setAdmData] = useState({ summary: null, depts: [] })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        if (role === 'admin') {
          const [sRes, dRes] = await Promise.all([
            api.get('/admin/reports/summary'),
            api.get('/admin/reports/by-department')
          ])
          setAdmData({
            summary: sRes.data?.data,
            depts: dRes.data?.data?.slice(0, 4) || []
          })
        }
        if (role === 'manager' || role === 'admin') {
          const pRes = await api.get('/manager/pending')
          setMgrData({ pending: pRes.data?.data?.slice(0, 5) || [] })
        }
        
        // Everyone is an employee
        const [bRes, lRes] = await Promise.all([
          api.get('/employee/balance'),
          api.get('/employee/leaves')
        ])
        setEmpData({
          balances: bRes.data?.data || null,
          recent: lRes.data?.data?.slice(0, 4) || []
        })
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [role])

  // Formatting helpers
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })

  // Prepare UI data
  let ADMIN_STATS = []
  if (admData.summary) {
    const s = admData.summary
    ADMIN_STATS = [
      { label: 'Total Employees', value: s.employees?.active || 0,  icon: 'bi-people-fill',       color: '#2563EB', bg:'#EFF6FF' },
      { label: 'Pending Requests',value: s.leaves?.pending || 0,    icon: 'bi-hourglass-split',   color: '#D97706', bg:'#FFFBEB' },
      { label: 'On Leave Today',  value: s.employees?.onLeave || 0, icon: 'bi-calendar-x',        color: '#DC2626', bg:'#FEF2F2' },
      { label: 'Approved Leaves', value: s.leaves?.approved || 0,   icon: 'bi-check-circle-fill', color: '#16A34A', bg:'#F0FDF4' },
    ]
  }

  let EMPLOYEE_STATS = []
  if (empData.balances) {
    const b = empData.balances
    EMPLOYEE_STATS = [
      { label: 'Casual Leave',    used: b.casual.used, total: b.casual.total, color: '#2563EB', icon: 'bi-sun' },
      { label: 'Sick Leave',      used: b.sick.used,   total: b.sick.total,   color: '#16A34A', icon: 'bi-heart-pulse' },
      { label: 'Earned Leave',    used: b.earned.used, total: b.earned.total, color: '#7C3AED', icon: 'bi-briefcase' },
    ]
  }

  const handleApprove = async (id) => {
    try { await api.patch(`/manager/leaves/${id}/approve`); setMgrData(p => ({ pending: p.pending.filter(x => x._id !== id) })) } 
    catch (err) { alert('Approval failed') }
  }

  const handleReject = async (id) => {
    try { await api.patch(`/manager/leaves/${id}/reject`); setMgrData(p => ({ pending: p.pending.filter(x => x._id !== id) })) } 
    catch (err) { alert('Rejection failed') }
  }

  return (
    <>
      <style>{`
        /* ── Page header ────────────────────────────────── */
        .dash-header { margin-bottom: 28px; }
        .dash-greeting { font-size: 24px; font-weight: 800; color: var(--eb-text-main); letter-spacing: -.03em; margin-bottom: 4px; }
        .dash-date { font-size: 13px; color: var(--eb-text-muted); }

        /* ── Stat grid ──────────────────────────────────── */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }

        /* ── Stat card (admin) ──────────────────────────── */
        .stat-card-admin { background: #fff; border: 1px solid var(--eb-border); border-radius: var(--eb-radius); padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: var(--eb-shadow-sm); transition: var(--eb-transition); }
        .stat-card-admin:hover { box-shadow: var(--eb-shadow-md); transform: translateY(-1px); }
        .stat-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .stat-card-admin .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -.04em; line-height: 1; }
        .stat-card-admin .stat-label { font-size: 12px; color: var(--eb-text-muted); font-weight: 500; margin-top: 3px; }

        /* ── Leave balance card (employee) ──────────────── */
        .balance-card { background: #fff; border: 1px solid var(--eb-border); border-radius: var(--eb-radius); padding: 20px; box-shadow: var(--eb-shadow-sm); transition: var(--eb-transition); }
        .balance-card:hover { box-shadow: var(--eb-shadow-md); transform: translateY(-1px); }
        .balance-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .balance-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .balance-title { font-size: 14px; font-weight: 700; color: var(--eb-text-main); }
        .balance-numbers { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
        .balance-remaining { font-size: 22px; font-weight: 800; letter-spacing: -.04em; }
        .balance-total { font-size: 12px; color: var(--eb-text-muted); }
        .balance-bar { height: 6px; background: #F1F5F9; border-radius: 99px; overflow: hidden; }
        .balance-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }

        /* ── Section header ─────────────────────────────── */
        .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .section-hd h5 { font-size: 16px; font-weight: 700; margin: 0; letter-spacing: -.02em; }
        .section-hd a { font-size: 13px; color: var(--eb-accent); text-decoration: none; font-weight: 600; }
        .section-hd a:hover { text-decoration: underline; }

        /* ── Table card ─────────────────────────────────── */
        .table-card { background: #fff; border: 1px solid var(--eb-border); border-radius: var(--eb-radius); box-shadow: var(--eb-shadow-sm); overflow: hidden; }
        .table-card table { margin: 0; font-size: 13px; }
        .table-card thead th { background: var(--eb-slate-bg); border-bottom: 1px solid var(--eb-border); font-weight: 700; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--eb-text-muted); padding: 10px 16px; }
        .table-card tbody td { padding: 12px 16px; vertical-align: middle; border-color: var(--eb-border); color: var(--eb-text-main); }
        .table-card tbody tr:hover { background: var(--eb-slate-bg); }
        .table-card tbody tr:last-child td { border-bottom: none; }

        /* ── Status badge ───────────────────────────────── */
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: .03em; }

        /* ── Quick actions ──────────────────────────────── */
        .qa-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 28px; }
        .qa-btn { background: #fff; border: 1.5px solid var(--eb-border); border-radius: var(--eb-radius); padding: 16px; text-align: center; cursor: pointer; transition: var(--eb-transition); text-decoration: none; display: block; color: var(--eb-text-main); }
        .qa-btn:hover { border-color: var(--eb-accent); box-shadow: 0 0 0 3px rgba(37,99,235,.08); color: var(--eb-accent); transform: translateY(-2px); }
        .qa-icon { font-size: 22px; margin-bottom: 8px; }
        .qa-label { font-size: 13px; font-weight: 600; }

        /* ── Approve/Reject buttons ─────────────────────── */
        .action-btn { border: none; border-radius: 6px; padding: 4px 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--eb-transition); }
        .action-btn.approve { background: #DCFCE7; color: #166534; }
        .action-btn.approve:hover { background: #16A34A; color: #fff; }
        .action-btn.reject { background: #FEE2E2; color: #991B1B; }
        .action-btn.reject:hover { background: #DC2626; color: #fff; }

        /* ── Two column layout ──────────────────────────── */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
      `}</style>

      {/* ── Greeting ───────────────────────────────────────── */}
      <div className="dash-header">
        <div className="dash-greeting">
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </div>
        <div className="dash-date">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          &nbsp;·&nbsp;
          <span style={{ color: '#16A34A', fontWeight: 600 }}>
            <i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }} />
            {user?.department?.name || 'HQ'}
          </span>
        </div>
      </div>

      {loading ? <div style={{padding:'40px 0',color:'var(--eb-text-muted)'}}>Loading dashboard...</div> : (
        <>
          {/* ── ADMIN VIEW ─────────────────────────────────────── */}
          {role === 'admin' && (
            <>
              <div className="stats-grid">
                {ADMIN_STATS.map(s => (
                  <div key={s.label} className="stat-card-admin">
                    <div className="stat-icon-box" style={{ background: s.bg }}>
                      <i className={`bi ${s.icon}`} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="two-col">
                <div>
                  <div className="section-hd">
                    <h5>Pending Approvals</h5>
                    <Link to="/dashboard/pending">View all →</Link>
                  </div>
                  <div className="table-card">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr><th>Employee</th><th>Type</th><th>Days</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {mgrData.pending.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-4 text-muted">No data available</td></tr>
                        ) : mgrData.pending.map(r => (
                          <tr key={r._id}>
                            <td>
                              <div style={{ fontWeight:600 }}>{r.employeeId?.name}</div>
                              <div style={{ fontSize:11, color:'var(--eb-text-muted)' }}>{fmt(r.startDate)} - {fmt(r.endDate)}</div>
                            </td>
                            <td className="text-capitalize">{r.leaveType}</td>
                            <td><strong>{r.numberOfDays}d</strong></td>
                            <td>
                              <div className="d-flex gap-1">
                                <button className="action-btn approve" onClick={() => handleApprove(r._id)}>✓</button>
                                <button className="action-btn reject" onClick={() => handleReject(r._id)}>✕</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="section-hd">
                    <h5>Department Overview</h5>
                    <Link to="/dashboard/reports">Full report →</Link>
                  </div>
                  <div className="table-card">
                    <table className="table mb-0">
                      <thead>
                        <tr><th>Department</th><th>Approved</th><th>Pending</th><th>Total Leaves</th></tr>
                      </thead>
                      <tbody>
                        {admData.depts.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-4 text-muted">No data available</td></tr>
                        ) : admData.depts.map(d => (
                          <tr key={d.code}>
                            <td style={{ fontWeight:600 }}>{d.department}</td>
                            <td><span className="status-badge" style={{ background:'#DCFCE7', color:'#166534' }}>{d.approved}</span></td>
                            <td><span className="status-badge" style={{ background:'#FEF3C7', color:'#92400E' }}>{d.pending}</span></td>
                            <td style={{ color:'var(--eb-text-muted)' }}>{d.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── MANAGER VIEW ───────────────────────────────────── */}
          {role === 'manager' && (
            <>
              <div className="section-hd mt-4">
                <h5>Pending Team Requests</h5>
                <Link to="/dashboard/pending">View all pending →</Link>
              </div>
              <div className="table-card mb-4">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr><th>Ref ID</th><th>Employee</th><th>Leave Type</th><th>Dates</th><th>Days</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {mgrData.pending.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-4 text-muted">No data available</td></tr>
                    ) : mgrData.pending.map(r => (
                      <tr key={r._id}>
                        <td style={{ color:'var(--eb-text-muted)', fontFamily:'monospace' }}>{r.refId}</td>
                        <td style={{ fontWeight:600 }}>{r.employeeId?.name}</td>
                        <td className="text-capitalize">{r.leaveType}</td>
                        <td>{fmt(r.startDate)} - {fmt(r.endDate)}</td>
                        <td><strong>{r.numberOfDays}d</strong></td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="action-btn approve" onClick={() => handleApprove(r._id)}>Approve</button>
                            <button className="action-btn reject" onClick={() => handleReject(r._id)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── EMPLOYEE VIEW (Shown to all roles) ─────────────── */}
          
          {/* Quick actions */}
          <div className="qa-grid mt-4 mb-4">
            {[
              { icon:'bi-calendar-plus',   label:'Apply Leave',    color:'#2563EB', to:'/dashboard/apply'    },
              { icon:'bi-calendar2-check', label:'My History',     color:'#7C3AED', to:'/dashboard/my-leaves' },
              { icon:'bi-pie-chart',       label:'Leave Balance',  color:'#16A34A', to:'/dashboard/balance'  },
            ].map(q => (
              <Link key={q.label} className="qa-btn" to={q.to}>
                <div className="qa-icon">
                  <i className={`bi ${q.icon}`} style={{ color: q.color }} />
                </div>
                <div className="qa-label">{q.label}</div>
              </Link>
            ))}
          </div>

          <div className="two-col">
            <div>
              {/* Leave balances */}
              <div className="section-hd">
                <h5>My Leave Balances</h5>
                <Link to="/dashboard/balance">View full breakdown →</Link>
              </div>
              <div className="stats-grid mb-4" style={{ gridTemplateColumns: '1fr' }}>
                {EMPLOYEE_STATS.length === 0 ? (
                  <div className="text-muted">No data available</div>
                ) : EMPLOYEE_STATS.map(s => {
                  const remaining = s.total - s.used
                  const pct = s.total ? Math.round((remaining / s.total) * 100) : 0
                  return (
                    <div key={s.label} className="balance-card">
                      <div className="balance-header">
                        <div className="balance-icon" style={{ background: s.color + '15' }}>
                          <i className={`bi ${s.icon}`} style={{ color: s.color }} />
                        </div>
                        <div className="balance-title">{s.label}</div>
                        <div className="balance-numbers" style={{ marginLeft: 'auto' }}>
                          <div className="balance-remaining" style={{ color: s.color }}>
                            {remaining} <span style={{fontSize: 12, fontWeight: 500, color: 'var(--eb-text-muted)'}}>left</span>
                          </div>
                        </div>
                      </div>
                      <div className="balance-bar">
                        <div
                          className="balance-fill"
                          style={{ width: `${pct}%`, background: s.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              {/* Recent leaves */}
              <div className="section-hd">
                <h5>Recent Leave Requests</h5>
                <Link to="/dashboard/my-leaves">See all my leaves →</Link>
              </div>
              <div className="table-card">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empData.recent.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-4 text-muted">No data available</td></tr>
                    ) : empData.recent.map(l => {
                      const s = STATUS_STYLES[l.status] || STATUS_STYLES.pending
                      return (
                        <tr key={l._id}>
                          <td style={{ fontWeight:600 }} className="text-capitalize">{l.leaveType}</td>
                          <td style={{ fontSize: 12, color: 'var(--eb-text-muted)'}}>{fmt(l.startDate)} - {fmt(l.endDate)}</td>
                          <td>
                            <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Helper ────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
