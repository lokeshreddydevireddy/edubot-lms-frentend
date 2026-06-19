import React, { useState, useEffect } from 'react'
import api from '../services/api'

const TYPE_CLR = {
  'casual':       '#2563EB',
  'sick':         '#16A34A',
  'earned':       '#7C3AED',
  'emergency':    '#DC2626',
  'maternity':    '#DB2777',
  'paternity':    '#0891B2',
  'compensatory': '#D97706',
}

function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) }
function ago(d)  {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}

export default function PendingRequests() {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)   // { _id, empName, type, days, action }
  const [remark,   setRemark]   = useState('')
  const [toast,    setToast]    = useState('')
  const [search,   setSearch]   = useState('')
  const [deptFlt,  setDeptFlt]  = useState('All Departments')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await api.get('/manager/pending')
      if (res.data.success) {
        setRequests(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const depts = ['All Departments', ...new Set(requests.map(r => r.employeeId?.department?.name).filter(Boolean))]

  const filtered = requests.filter(r => {
    const q = search.toLowerCase()
    const empName = r.employeeId?.name || ''
    const deptName = r.employeeId?.department?.name || ''
    if (q && !empName.toLowerCase().includes(q) && !r.leaveType.toLowerCase().includes(q) && !r.refId?.toLowerCase().includes(q)) return false
    if (deptFlt !== 'All Departments' && deptName !== deptFlt) return false
    return true
  })

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function confirm() {
    setActionLoading(true)
    try {
      const res = await api.patch(`/manager/leaves/${modal._id}/${modal.action}`, { remark })
      if (res.data.success) {
        setRequests(prev => prev.filter(r => r._id !== modal._id))
        showToast(modal.action === 'approve' ? `✓ Leave approved for ${modal.empName}` : `✕ Leave rejected for ${modal.empName}`)
        setModal(null)
        setRemark('')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process request.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .pr-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .pr-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}

        .pr-top{display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap;}
        .pr-badge{display:inline-flex;align-items:center;gap:6px;background:#FEF3C7;border:1px solid #FDE68A;border-radius:99px;padding:6px 14px;font-size:13px;font-weight:700;color:#92400E;}
        .pr-search{display:flex;align-items:center;gap:8px;background:var(--eb-slate-bg);border:1.5px solid transparent;border-radius:8px;padding:7px 12px;transition:var(--eb-transition);min-width:200px;}
        .pr-search:focus-within{border-color:var(--eb-accent);background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .pr-search input{border:none;background:none;outline:none;font-size:13px;font-family:inherit;color:var(--eb-text-main);width:100%;}
        .pr-search input::placeholder{color:#94A3B8;}
        .pr-sel{padding:7px 12px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;cursor:pointer;}

        .pr-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);overflow:hidden;}
        .pr-table{width:100%;border-collapse:collapse;font-size:13px;}
        .pr-table thead th{background:var(--eb-slate-bg);border-bottom:1px solid var(--eb-border);font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--eb-text-muted);padding:10px 16px;text-align:left;white-space:nowrap;}
        .pr-table tbody td{padding:14px 16px;border-bottom:1px solid var(--eb-border);vertical-align:middle;}
        .pr-table tbody tr:last-child td{border-bottom:none;}
        .pr-table tbody tr:hover{background:#FAFBFC;}

        .pr-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;}
        .pr-emp-name{font-weight:700;font-size:13px;color:var(--eb-text-main);}
        .pr-emp-dept{font-size:11px;color:var(--eb-text-muted);}
        .pr-type-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;text-transform:capitalize;}
        .pr-days{font-size:14px;font-weight:800;letter-spacing:-.02em;}
        .pr-reason{max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--eb-text-muted);}
        .pr-ago{font-size:12px;color:var(--eb-text-muted);}
        .pr-actions{display:flex;gap:8px;}
        .btn-approve{padding:5px 14px;background:#F0FDF4;border:1.5px solid #86EFAC;color:#166534;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;transition:var(--eb-transition);}
        .btn-approve:hover{background:#16A34A;color:#fff;border-color:#16A34A;}
        .btn-reject{padding:5px 14px;background:#FEF2F2;border:1.5px solid #FECACA;color:#991B1B;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;transition:var(--eb-transition);}
        .btn-reject:hover{background:#DC2626;color:#fff;border-color:#DC2626;}

        .pr-empty{padding:48px;text-align:center;}
        .pr-empty i{font-size:40px;display:block;margin-bottom:12px;opacity:.3;}

        /* Modal */
        .pr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;}
        .pr-modal{background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.18);padding:32px;max-width:440px;width:100%;position:relative;}
        .pr-modal-ico{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px;}
        .pr-modal-t{font-size:18px;font-weight:800;color:var(--eb-text-main);margin-bottom:8px;}
        .pr-modal-d{font-size:14px;color:var(--eb-text-muted);line-height:1.6;margin-bottom:20px;}
        .pr-remark{width:100%;padding:10px 13px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;min-height:80px;resize:vertical;transition:var(--eb-transition);}
        .pr-remark:focus{border-color:var(--eb-accent);box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .pr-modal-actions{display:flex;gap:10px;margin-top:16px;}
        .pr-modal-actions button{flex:1;padding:10px;border-radius:8px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;border:none;transition:var(--eb-transition);}
        .pr-modal-confirm.app{background:#16A34A;color:#fff;}
        .pr-modal-confirm.app:hover:not(:disabled){background:#15803D;}
        .pr-modal-confirm.rej{background:#DC2626;color:#fff;}
        .pr-modal-confirm.rej:hover:not(:disabled){background:#B91C1C;}
        .pr-modal-cancel{background:#F1F5F9;color:var(--eb-text-main);}
        .pr-modal-cancel:hover{background:#E2E8F0;}
        .pr-modal-confirm:disabled{opacity: 0.6; cursor: not-allowed;}

        /* Toast */
        .pr-toast{position:fixed;bottom:24px;right:24px;z-index:1100;background:#1E293B;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:slideUp .25s ease;}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
      `}</style>

      {/* Toast */}
      {toast && <div className="pr-toast">{toast}</div>}

      {/* Modal */}
      {modal && (
        <div className="pr-overlay" onClick={() => !actionLoading && setModal(null)}>
          <div className="pr-modal" onClick={e => e.stopPropagation()}>
            <div className="pr-modal-ico" style={{background: modal.action==='approve'?'#F0FDF4':'#FEF2F2', color: modal.action==='approve'?'#16A34A':'#DC2626'}}>
              <i className={`bi bi-${modal.action==='approve'?'check-circle':'x-circle'}`}/>
            </div>
            <div className="pr-modal-t">{modal.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}</div>
            <div className="pr-modal-d">
              You are about to <strong>{modal.action}</strong> the leave request from <strong>{modal.empName}</strong> ({modal.type}, {modal.days} day{modal.days>1?'s':''}).
            </div>
            <textarea className="pr-remark" disabled={actionLoading} placeholder={`Add a remark${modal.action==='reject'?' (required)':''}…`} value={remark} onChange={e => setRemark(e.target.value)}/>
            <div className="pr-modal-actions">
              <button className="pr-modal-cancel" disabled={actionLoading} onClick={() => { setModal(null); setRemark('') }}>Cancel</button>
              <button className={`pr-modal-confirm ${modal.action==='approve'?'app':'rej'}`} disabled={actionLoading} onClick={confirm}>
                {actionLoading ? 'Processing...' : modal.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-enter">
        <div className="pr-pt">Pending Requests</div>
        <div className="pr-ps">Review and action leave requests from your team</div>

        <div className="pr-top">
          <div className="pr-badge">
            <i className="bi bi-hourglass-split"/>{requests.length} pending
          </div>
          <div className="pr-search">
            <i className="bi bi-search" style={{color:'#94A3B8'}}/>
            <input placeholder="Search employee or leave type…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="pr-sel" value={deptFlt} onChange={e => setDeptFlt(e.target.value)}>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="pr-card">
          {loading ? (
            <div style={{textAlign: 'center', padding: '60px 0', color: 'var(--eb-text-muted)'}}>Loading pending requests...</div>
          ) : filtered.length === 0 ? (
            <div className="pr-empty">
              <i className="bi bi-calendar-check"/>
              <div style={{font:'700 16px/1 var(--eb-font)',color:'var(--eb-text-main)',marginBottom:6}}>All caught up!</div>
              <div style={{fontSize:13,color:'var(--eb-text-muted)'}}>No pending leave requests at the moment.</div>
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const clr = TYPE_CLR[r.leaveType] || '#2563EB'
                    const empName = r.employeeId?.name || 'Unknown'
                    const empDept = r.employeeId?.department?.name || ''
                    const avatar = empName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
                    const avatarColor = ['#2563EB','#7C3AED','#16A34A','#D97706','#DC2626','#0891B2'][r.employeeId?._id.charCodeAt(r.employeeId._id.length-1) % 6 || 0]
                    return (
                      <tr key={r._id}>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div className="pr-avatar" style={{background:avatarColor}}>{avatar}</div>
                            <div>
                              <div className="pr-emp-name">{empName}</div>
                              <div className="pr-emp-dept">{empDept}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="pr-type-badge" style={{background:clr+'15',color:clr}}>{r.leaveType}</span>
                        </td>
                        <td style={{whiteSpace:'nowrap'}}>{fmt(r.startDate)}</td>
                        <td style={{whiteSpace:'nowrap'}}>{fmt(r.endDate)}</td>
                        <td><span className="pr-days">{r.numberOfDays}d</span></td>
                        <td><div className="pr-reason" title={r.reason}>{r.reason}</div></td>
                        <td><span className="pr-ago">{ago(r.appliedOn)}</span></td>
                        <td>
                          <div className="pr-actions">
                            <button className="btn-approve" onClick={() => setModal({...r, empName, type: r.leaveType, days: r.numberOfDays, action:'approve'})}>
                              <i className="bi bi-check-lg me-1"/>Approve
                            </button>
                            <button className="btn-reject" onClick={() => setModal({...r, empName, type: r.leaveType, days: r.numberOfDays, action:'reject'})}>
                              <i className="bi bi-x-lg me-1"/>Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
