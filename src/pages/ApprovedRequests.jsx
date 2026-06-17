import React, { useState, useEffect, useMemo } from 'react'
import api from '../services/api'

function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) }

const TYPE_CLR = {
  'casual':       '#2563EB',
  'sick':         '#16A34A',
  'earned':       '#7C3AED',
  'emergency':    '#DC2626',
  'maternity':    '#DB2777',
  'paternity':    '#0891B2',
  'compensatory': '#D97706',
}
const AV_COLORS = ['#2563EB','#7C3AED','#16A34A','#D97706','#DC2626','#0891B2','#DB2777']

export default function ApprovedRequests() {
  const [search, setSearch] = useState('')
  const [type,   setType]   = useState('All Types')
  const [dept,   setDept]   = useState('All Departments')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApproved = async () => {
      setLoading(true)
      try {
        const res = await api.get('/manager/approved')
        if (res.data.success) {
          setRequests(res.data.data)
        }
      } catch (err) {
        console.error('Error fetching approved requests:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchApproved()
  }, [])

  const AVAIL_TYPES = ['All Types', ...new Set(requests.map(r => r.leaveType))]
  const AVAIL_DEPTS = ['All Departments', ...new Set(requests.map(r => r.employeeId?.department?.name).filter(Boolean))]

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase()
    const empName = r.employeeId?.name || ''
    const deptName = r.employeeId?.department?.name || ''
    if (q && !empName.toLowerCase().includes(q) && !r.refId.toLowerCase().includes(q) && !r.leaveType.toLowerCase().includes(q)) return false
    if (type !== 'All Types' && r.leaveType !== type) return false
    if (dept !== 'All Departments' && deptName !== dept) return false
    return true
  }), [search, type, dept, requests])

  const totalDays = filtered.reduce((a, r) => a + r.numberOfDays, 0)

  return (
    <>
      <style>{`
        .ar-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .ar-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}
        .ar-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;}
        .ar-search{display:flex;align-items:center;gap:8px;background:var(--eb-slate-bg);border:1.5px solid transparent;border-radius:8px;padding:7px 12px;transition:var(--eb-transition);flex:1;min-width:180px;}
        .ar-search:focus-within{border-color:var(--eb-accent);background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .ar-search input{border:none;background:none;outline:none;font-size:13px;font-family:inherit;color:var(--eb-text-main);width:100%;}
        .ar-search input::placeholder{color:#94A3B8;}
        .ar-sel{padding:7px 12px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;cursor:pointer;}
        .ar-chip{display:inline-flex;align-items:center;gap:6px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:99px;padding:6px 14px;font-size:13px;font-weight:700;color:#166534;margin-left:auto;}
        .ar-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);overflow:hidden;}
        .ar-table{width:100%;border-collapse:collapse;font-size:13px;}
        .ar-table thead th{background:var(--eb-slate-bg);border-bottom:1px solid var(--eb-border);font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--eb-text-muted);padding:10px 16px;text-align:left;white-space:nowrap;}
        .ar-table tbody td{padding:13px 16px;border-bottom:1px solid var(--eb-border);vertical-align:middle;}
        .ar-table tbody tr:last-child td{border-bottom:none;}
        .ar-table tbody tr:hover{background:#F0FDF4;}
        .ar-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;}
        .ar-emp-name{font-weight:700;font-size:13px;color:var(--eb-text-main);}
        .ar-emp-dept{font-size:11px;color:var(--eb-text-muted);}
        .ar-type-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;text-transform:capitalize;}
        .ar-status-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;background:#DCFCE7;color:#166534;}
        .ar-reason{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--eb-text-muted);}
      `}</style>

      <div className="page-enter">
        <div className="ar-pt">Approved Requests</div>
        <div className="ar-ps">All approved leave requests from your team</div>

        <div className="ar-toolbar">
          <div className="ar-search">
            <i className="bi bi-search" style={{color:'#94A3B8',fontSize:14}}/>
            <input placeholder="Search employee, type…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="ar-sel" value={type} onChange={e => setType(e.target.value)}>
            {AVAIL_TYPES.map(t => <option key={t} value={t}>{t === 'All Types' ? t : t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
          <select className="ar-sel" value={dept} onChange={e => setDept(e.target.value)}>
            {AVAIL_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="ar-chip">
            <i className="bi bi-check-circle-fill"/>{filtered.length} records · {totalDays} days
          </div>
        </div>

        <div className="ar-card">
          <div style={{overflowX:'auto', minHeight: '300px'}}>
            <table className="ar-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Approved By</th>
                  <th>Approved On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10}>
                    <div style={{padding:'40px',textAlign:'center',color:'var(--eb-text-muted)',fontSize:13}}>
                      Loading approved requests...
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10}>
                    <div style={{padding:'40px',textAlign:'center',color:'var(--eb-text-muted)',fontSize:13}}>
                      <i className="bi bi-calendar2-check" style={{fontSize:36,display:'block',marginBottom:12,opacity:.3}}/>
                      No records found.
                    </div>
                  </td></tr>
                ) : filtered.map((r, i) => {
                  const clr = TYPE_CLR[r.leaveType] || '#2563EB'
                  const empName = r.employeeId?.name || 'Unknown'
                  const empDept = r.employeeId?.department?.name || ''
                  const avatar = empName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
                  const reviewedBy = r.reviewedBy?.name || 'Manager'
                  return (
                    <tr key={r._id}>
                      <td style={{fontFamily:'monospace',fontSize:12,color:'var(--eb-text-muted)'}}>{r.refId}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:9}}>
                          <div className="ar-avatar" style={{background: AV_COLORS[i % AV_COLORS.length]}}>{avatar}</div>
                          <div>
                            <div className="ar-emp-name">{empName}</div>
                            <div className="ar-emp-dept">{empDept}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="ar-type-badge" style={{background:clr+'15',color:clr}}>{r.leaveType}</span></td>
                      <td style={{whiteSpace:'nowrap'}}>{fmt(r.startDate)}</td>
                      <td style={{whiteSpace:'nowrap'}}>{fmt(r.endDate)}</td>
                      <td><strong>{r.numberOfDays}d</strong></td>
                      <td><div className="ar-reason" title={r.reason}>{r.reason}</div></td>
                      <td style={{fontSize:12}}>{reviewedBy}</td>
                      <td style={{fontSize:12,color:'var(--eb-text-muted)',whiteSpace:'nowrap'}}>{fmt(r.updatedAt)}</td>
                      <td><span className="ar-status-badge"><i className="bi bi-check-circle-fill" style={{fontSize:10}}/>Approved</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
