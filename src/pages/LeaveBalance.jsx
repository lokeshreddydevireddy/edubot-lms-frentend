import React, { useState, useEffect } from 'react'
import api from '../services/api'

const LEAVE_META = {
  casual:       { type:'Casual Leave',    icon:'bi-sun',                  color:'#2563EB', bg:'#EFF6FF' },
  sick:         { type:'Sick Leave',      icon:'bi-heart-pulse',           color:'#16A34A', bg:'#F0FDF4' },
  earned:       { type:'Earned Leave',    icon:'bi-briefcase',             color:'#7C3AED', bg:'#F5F3FF' },
  emergency:    { type:'Emergency Leave', icon:'bi-exclamation-triangle',  color:'#DC2626', bg:'#FEF2F2' },
  maternity:    { type:'Maternity Leave', icon:'bi-person-heart',          color:'#DB2777', bg:'#FDF2F8' },
  paternity:    { type:'Paternity Leave', icon:'bi-people',                color:'#0891B2', bg:'#ECFEFF' },
  compensatory: { type:'Compensatory Off',icon:'bi-arrow-repeat',          color:'#D97706', bg:'#FFFBEB' },
}

export default function LeaveBalance() {
  const [year, setYear] = useState('2025-26')
  const [balanceData, setBalanceData] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [balRes, leavesRes] = await Promise.all([
          api.get(`/employee/balance?fy=${year}`),
          api.get('/employee/leaves', { params: { limit: 500 } })
        ])
        
        if (balRes.data.success) {
          setBalanceData(balRes.data.data)
        }
        
        if (leavesRes.data.success) {
          // Compute monthly history
          const monthly = {}
          leavesRes.data.data.forEach(l => {
            if (l.status === 'cancelled' || l.status === 'rejected') return
            const d = new Date(l.startDate)
            const mKey = d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
            if (!monthly[mKey]) monthly[mKey] = { month: mKey, casual:0, sick:0, earned:0, emergency:0, total: 0 }
            
            if (['casual','sick','earned','emergency'].includes(l.leaveType)) {
              monthly[mKey][l.leaveType] += l.numberOfDays
              monthly[mKey].total += l.numberOfDays
            }
          })
          setHistoryData(Object.values(monthly).sort((a,b) => new Date(b.month) - new Date(a.month)))
        }
      } catch (err) {
        console.error('Error fetching balance:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [year])

  // Extract active quotas from backend data
  const data = []
  let totalUsed = 0
  let totalAvail = 0

  if (balanceData) {
    Object.keys(LEAVE_META).forEach(k => {
      const quota = balanceData[k]
      if (quota) {
        const meta = LEAVE_META[k]
        const avail = quota.total - quota.used - quota.pending
        data.push({ ...meta, ...quota, key: k, avail })
        totalUsed += quota.used
        totalAvail += avail
      }
    })
  }

  return (
    <>
      <style>{`
        .lb-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .lb-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}

        .lb-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;}
        .lb-yr{display:flex;align-items:center;gap:8px;}
        .lb-yr-label{font-size:13px;font-weight:600;color:var(--eb-text-muted);}
        .lb-yr-sel{padding:7px 12px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;cursor:pointer;transition:var(--eb-transition);}
        .lb-yr-sel:focus{border-color:var(--eb-accent);}

        .lb-summary{display:flex;gap:16px;margin-bottom:8px;flex-wrap:wrap;}
        .lb-sum-chip{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:99px;font-size:13px;font-weight:700;}

        .lb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin-bottom:28px;}
        .lb-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);padding:22px;box-shadow:var(--eb-shadow-sm);transition:var(--eb-transition);position:relative;overflow:hidden;}
        .lb-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:4px 0 0 4px;}
        .lb-card:hover{box-shadow:var(--eb-shadow-md);transform:translateY(-2px);}

        .lb-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;}
        .lb-card-left{display:flex;align-items:center;gap:12px;}
        .lb-ico{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;}
        .lb-name{font-size:14px;font-weight:700;color:var(--eb-text-main);}
        .lb-sub{font-size:12px;color:var(--eb-text-muted);margin-top:2px;}
        .lb-big{font-size:34px;font-weight:800;letter-spacing:-.05em;line-height:1;}
        .lb-big-sub{font-size:12px;color:var(--eb-text-muted);font-weight:500;margin-top:2px;}

        .lb-bar-wrap{margin:14px 0 10px;}
        .lb-bar-track{height:8px;background:#F1F5F9;border-radius:99px;overflow:hidden;}
        .lb-bar-fill{height:100%;border-radius:99px;transition:width .6s ease;}
        .lb-pend-fill{opacity:.45;}

        .lb-pills{display:flex;gap:8px;flex-wrap:wrap;}
        .lb-pill{font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;}

        .lb-hist-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);padding:22px;}
        .lb-hist-title{font-size:15px;font-weight:700;color:var(--eb-text-main);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--eb-border);}

        .lb-hist-table{width:100%;border-collapse:collapse;font-size:13px;}
        .lb-hist-table thead th{text-align:left;padding:8px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--eb-text-muted);background:var(--eb-slate-bg);border-bottom:1px solid var(--eb-border);}
        .lb-hist-table tbody td{padding:11px 12px;border-bottom:1px solid var(--eb-border);vertical-align:middle;}
        .lb-hist-table tbody tr:last-child td{border-bottom:none;}
        .lb-hist-table tbody tr:hover{background:#FAFBFC;}
        .lb-dot{display:inline-flex;min-width:20px;height:20px;border-radius:10px;align-items:center;justify-content:center;font-size:11px;font-weight:700;padding: 0 6px;}
      `}</style>

      <div className="page-enter">
        <div className="lb-pt">Leave Balance</div>
        <div className="lb-ps">Track your remaining leave days for the current financial year</div>

        <div className="lb-header">
          <div className="lb-summary">
            <div className="lb-sum-chip" style={{background:'#EFF6FF',color:'#2563EB'}}>
              <i className="bi bi-calendar-check"/>{totalAvail} days available
            </div>
            <div className="lb-sum-chip" style={{background:'#FEF3C7',color:'#92400E'}}>
              <i className="bi bi-calendar-x"/>{totalUsed} days used
            </div>
          </div>
          <div className="lb-yr">
            <span className="lb-yr-label">Financial Year</span>
            <select className="lb-yr-sel" value={year} onChange={e => setYear(e.target.value)}>
              <option value="2025-26">FY 2025–26</option>
              <option value="2024-25">FY 2024–25</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding: '60px 0', color: 'var(--eb-text-muted)'}}>Loading leave balances...</div>
        ) : (
          <div className="lb-grid">
            {data.map(d => {
              const usedPct  = Math.round((d.used  / d.total) * 100) || 0
              const pendPct  = Math.round((d.pending / d.total) * 100) || 0
              return (
                <div key={d.key} className="lb-card" style={{'--accent': d.color}}>
                  <div style={{position:'absolute',left:0,top:0,bottom:0,width:4,background:d.color,borderRadius:'4px 0 0 4px'}}/>
                  <div className="lb-card-top">
                    <div className="lb-card-left">
                      <div className="lb-ico" style={{background:d.bg,color:d.color}}><i className={`bi ${d.icon}`}/></div>
                      <div>
                        <div className="lb-name">{d.type}</div>
                        <div className="lb-sub">FY {year} allocation</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div className="lb-big" style={{color:d.color}}>{d.avail}</div>
                      <div className="lb-big-sub">remaining</div>
                    </div>
                  </div>

                  <div className="lb-bar-wrap">
                    <div className="lb-bar-track">
                      {/* used portion */}
                      <div style={{height:'100%',display:'flex',borderRadius:99}}>
                        <div style={{width:`${usedPct}%`,background:d.color,borderRadius:'99px 0 0 99px',transition:'width .6s'}}/>
                        {d.pending > 0 && <div style={{width:`${pendPct}%`,background:d.color,opacity:.4}}/>}
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:5,fontSize:11,color:'var(--eb-text-muted)'}}>
                      <span>0</span><span>{d.total} days total</span>
                    </div>
                  </div>

                  <div className="lb-pills">
                    <span className="lb-pill" style={{background:d.color+'18',color:d.color}}>{d.used} Used</span>
                    {d.pending > 0 && <span className="lb-pill" style={{background:'#FEF3C7',color:'#92400E'}}>{d.pending} Pending</span>}
                    <span className="lb-pill" style={{background:'#F1F5F9',color:'#475569'}}>{d.total} Total</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Monthly usage */}
        <div className="lb-hist-card">
          <div className="lb-hist-title">Monthly Leave Usage</div>
          <div style={{overflowX:'auto'}}>
            <table className="lb-hist-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Casual</th>
                  <th>Sick</th>
                  <th>Earned</th>
                  <th>Emergency</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length === 0 && !loading && (
                  <tr><td colSpan={6} style={{textAlign:'center', color:'var(--eb-text-muted)'}}>No leave history found.</td></tr>
                )}
                {historyData.map(h => {
                  return (
                    <tr key={h.month}>
                      <td style={{fontWeight:600}}>{h.month}</td>
                      <td>{h.casual > 0 ? <span className="lb-dot" style={{background:'#EFF6FF',color:'#2563EB'}}>{h.casual}</span> : <span style={{color:'#CBD5E1'}}>—</span>}</td>
                      <td>{h.sick > 0 ? <span className="lb-dot" style={{background:'#F0FDF4',color:'#16A34A'}}>{h.sick}</span> : <span style={{color:'#CBD5E1'}}>—</span>}</td>
                      <td>{h.earned > 0 ? <span className="lb-dot" style={{background:'#F5F3FF',color:'#7C3AED'}}>{h.earned}</span> : <span style={{color:'#CBD5E1'}}>—</span>}</td>
                      <td>{h.emergency > 0 ? <span className="lb-dot" style={{background:'#FEF2F2',color:'#DC2626'}}>{h.emergency}</span> : <span style={{color:'#CBD5E1'}}>—</span>}</td>
                      <td><strong style={{color: h.total > 0 ? 'var(--eb-text-main)' : 'var(--eb-text-muted)'}}>{h.total > 0 ? `${h.total}d` : '—'}</strong></td>
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
