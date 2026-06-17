import React, { useState, useEffect, useMemo } from 'react'
import api from '../services/api'

const STATUS_CONFIG = {
  approved:  { label:'Approved',  bg:'#DCFCE7', color:'#166534', icon:'bi-check-circle-fill'  },
  rejected:  { label:'Rejected',  bg:'#FEE2E2', color:'#991B1B', icon:'bi-x-circle-fill'      },
  pending:   { label:'Pending',   bg:'#FEF3C7', color:'#92400E', icon:'bi-hourglass-split'    },
  cancelled: { label:'Cancelled', bg:'#F1F5F9', color:'#475569', icon:'bi-slash-circle'       },
}

const LEAVE_TYPES = ['All Types','casual','sick','earned','emergency','maternity','paternity','compensatory']
const STATUSES    = ['All Status','pending','approved','rejected','cancelled']

function fmt(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
}

export default function MyLeaves() {
  const [search,  setSearch]  = useState('')
  const [type,    setType]    = useState('All Types')
  const [status,  setStatus]  = useState('All Status')
  const [leaves,  setLeaves]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true)
      try {
        const params = {}
        if (type !== 'All Types') params.leaveType = type
        if (status !== 'All Status') params.status = status
        
        const res = await api.get('/employee/leaves', { params: { limit: 100 } })
        if (res.data.success) {
          setLeaves(res.data.data)
        }
      } catch (err) {
        console.error('Error fetching leaves:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaves()
  }, [type, status])

  // Summary counts
  const counts = useMemo(() => ({
    total:     leaves.length,
    pending:   leaves.filter(l => l.status === 'pending').length,
    approved:  leaves.filter(l => l.status === 'approved').length,
    rejected:  leaves.filter(l => l.status === 'rejected').length,
  }), [leaves])

  const filtered = useMemo(() => leaves.filter(l => {
    const q = search.toLowerCase()
    if (q && !l.leaveType.toLowerCase().includes(q) && !l.refId.toLowerCase().includes(q) && !l.reason.toLowerCase().includes(q)) return false
    return true
  }), [search, leaves])

  return (
    <>
      <style>{`
        .ml-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .ml-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}

        .ml-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
        @media(max-width:720px){.ml-stats{grid-template-columns:repeat(2,1fr);}}
        .ml-stat{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);padding:18px 20px;box-shadow:var(--eb-shadow-sm);display:flex;align-items:center;gap:14px;}
        .ml-stat-ico{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .ml-stat-n{font-size:26px;font-weight:800;letter-spacing:-.04em;line-height:1;}
        .ml-stat-l{font-size:12px;color:var(--eb-text-muted);font-weight:500;margin-top:2px;}

        .ml-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);overflow:hidden;}
        .ml-toolbar{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--eb-border);flex-wrap:wrap;}

        .ml-search{display:flex;align-items:center;gap:8px;background:var(--eb-slate-bg);border:1.5px solid transparent;border-radius:8px;padding:7px 12px;transition:var(--eb-transition);flex:1;min-width:160px;}
        .ml-search:focus-within{border-color:var(--eb-accent);background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .ml-search input{border:none;background:none;outline:none;font-size:13px;font-family:inherit;color:var(--eb-text-main);width:100%;}
        .ml-search input::placeholder{color:#94A3B8;}
        .ml-search i{color:#94A3B8;font-size:14px;flex-shrink:0;}

        .ml-sel{padding:7px 12px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:13px;font-family:inherit;color:var(--eb-text-main);background:#fff;outline:none;cursor:pointer;transition:var(--eb-transition);}
        .ml-sel:focus{border-color:var(--eb-accent);box-shadow:0 0 0 3px rgba(37,99,235,.1);}

        .ml-apply-btn{margin-left:auto;padding:7px 16px;background:var(--eb-accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:var(--eb-transition);display:flex;align-items:center;gap:6px;text-decoration:none;white-space:nowrap;}
        .ml-apply-btn:hover{background:#1D4ED8;transform:translateY(-1px);color:#fff;}

        .ml-table{width:100%;border-collapse:collapse;font-size:13px;}
        .ml-table thead th{background:var(--eb-slate-bg);border-bottom:1px solid var(--eb-border);font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--eb-text-muted);padding:10px 16px;text-align:left;white-space:nowrap;}
        .ml-table tbody td{padding:13px 16px;border-bottom:1px solid var(--eb-border);vertical-align:middle;color:var(--eb-text-main);}
        .ml-table tbody tr:last-child td{border-bottom:none;}
        .ml-table tbody tr:hover{background:#FAFBFC;}

        .ml-id{font-family:monospace;font-size:12px;color:var(--eb-text-muted);}
        .ml-type{font-weight:600;text-transform:capitalize;}
        .ml-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.02em;}
        .ml-reason{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--eb-text-muted);font-size:12px;}

        .ml-empty{padding:48px 20px;text-align:center;}
        .ml-empty i{font-size:36px;opacity:.3;display:block;margin-bottom:12px;}
        .ml-empty p{font-size:14px;color:var(--eb-text-muted);margin:0;}
      `}</style>

      <div className="page-enter">
        <div className="ml-pt">My Leaves</div>
        <div className="ml-ps">View and manage all your leave requests</div>

        {/* Summary stats */}
        <div className="ml-stats">
          {[
            { label:'Total Requests', value:counts.total,    ico:'bi-calendar3',         clr:'#2563EB', bg:'#EFF6FF' },
            { label:'Pending',        value:counts.pending,  ico:'bi-hourglass-split',    clr:'#D97706', bg:'#FFFBEB' },
            { label:'Approved',       value:counts.approved, ico:'bi-check-circle-fill',  clr:'#16A34A', bg:'#F0FDF4' },
            { label:'Rejected',       value:counts.rejected, ico:'bi-x-circle-fill',      clr:'#DC2626', bg:'#FEF2F2' },
          ].map(s => (
            <div key={s.label} className="ml-stat">
              <div className="ml-stat-ico" style={{background:s.bg,color:s.clr}}><i className={`bi ${s.ico}`}/></div>
              <div><div className="ml-stat-n" style={{color:s.clr}}>{s.value}</div><div className="ml-stat-l">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="ml-card">
          <div className="ml-toolbar">
            <div className="ml-search">
              <i className="bi bi-search"/>
              <input placeholder="Search by ID, type, reason…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="ml-sel" value={type} onChange={e => setType(e.target.value)}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t === 'All Types' ? t : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <select className="ml-sel" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s === 'All Status' ? 'All Status' : s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <a href="/dashboard/apply" className="ml-apply-btn">
              <i className="bi bi-plus"/>Apply Leave
            </a>
          </div>

          <div style={{overflowX:'auto', minHeight: '300px'}}>
            <table className="ml-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Approved By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{textAlign:'center', padding: '40px'}}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9}>
                    <div className="ml-empty">
                      <i className="bi bi-calendar-x"/>
                      <p>No leave records found matching your filters.</p>
                    </div>
                  </td></tr>
                ) : filtered.map(l => {
                  const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.pending
                  return (
                    <tr key={l._id}>
                      <td><span className="ml-id">{l.refId}</span></td>
                      <td><span className="ml-type">{l.leaveType}</span></td>
                      <td>{fmt(l.startDate)}</td>
                      <td>{fmt(l.endDate)}</td>
                      <td><strong>{l.numberOfDays}d</strong></td>
                      <td><div className="ml-reason" title={l.reason}>{l.reason}</div></td>
                      <td style={{color:'var(--eb-text-muted)',fontSize:12}}>{fmt(l.appliedOn)}</td>
                      <td style={{fontSize:12}}>{l.reviewedBy ? l.reviewedBy.name : '—'}</td>
                      <td>
                        <span className="ml-badge" style={{background:sc.bg,color:sc.color}}>
                          <i className={`bi ${sc.icon}`} style={{fontSize:10}}/>
                          {sc.label}
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
  )
}
