import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function Reports() {
  const [period, setPeriod] = useState('FY 2025-26')
  const [summary, setSummary] = useState(null)
  const [deptData, setDeptData] = useState([])
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const [sumRes, deptRes, monthRes] = await Promise.all([
          api.get('/admin/reports/summary'),
          api.get('/admin/reports/by-department'),
          api.get('/admin/reports/by-month', { params: { year: parseInt(period.slice(3, 7)) || new Date().getFullYear() } })
        ])

        if (sumRes.data.success) setSummary(sumRes.data.data)
        if (deptRes.data.success) setDeptData(deptRes.data.data)
        if (monthRes.data.success) setMonthly(monthRes.data.data)

      } catch (err) {
        console.error('Error fetching reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [period])

  function downloadToast() { alert('Export feature — will generate PDF/Excel report.') }

  const totals = summary ? {
    requests: summary.leaves.total,
    approved: summary.leaves.approved,
    rejected: summary.leaves.rejected,
    pending:  summary.leaves.pending,
    approvalRate: summary.approvalRate
  } : { requests: 0, approved: 0, rejected: 0, pending: 0, approvalRate: '0%' }

  const maxTotal = monthly.length > 0 ? Math.max(...monthly.map(m => m.total), 1) : 1
  const maxDept  = deptData.length > 0 ? Math.max(...deptData.map(d => d.total), 1) : 1

  // Compute leave distribution from monthly aggregate
  let dist = { casual: 0, sick: 0, earned: 0, emergency: 0 }
  monthly.forEach(m => {
    dist.casual += m.casual || 0
    dist.sick += m.sick || 0
    dist.earned += m.earned || 0
    dist.emergency += m.emergency || 0
  })
  const totalDist = dist.casual + dist.sick + dist.earned + dist.emergency || 1

  const LEAVE_DIST = [
    { type:'Casual Leave',    count:dist.casual, pct:Math.round((dist.casual/totalDist)*100), color:'#2563EB' },
    { type:'Sick Leave',      count:dist.sick,  pct:Math.round((dist.sick/totalDist)*100), color:'#16A34A' },
    { type:'Earned Leave',    count:dist.earned,  pct:Math.round((dist.earned/totalDist)*100), color:'#7C3AED' },
    { type:'Emergency Leave', count:dist.emergency,  pct:Math.round((dist.emergency/totalDist)*100),  color:'#DC2626' },
  ]

  return (
    <>
      <style>{`
        .rp-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .rp-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}
        .rp-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:gap;}
        .rp-hdr-right{display:flex;align-items:center;gap:10px;}
        .rp-sel{padding:7px 12px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;cursor:pointer;}
        .rp-dl-btn{padding:7px 14px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:13px;font-weight:600;font-family:inherit;background:#fff;cursor:pointer;transition:var(--eb-transition);display:flex;align-items:center;gap:6px;color:var(--eb-text-main);}
        .rp-dl-btn:hover{background:var(--eb-slate-bg);border-color:var(--eb-accent);color:var(--eb-accent);}

        /* KPI Cards */
        .rp-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
        @media(max-width:800px){.rp-kpi{grid-template-columns:repeat(2,1fr);}}
        .rp-kcard{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);padding:20px;box-shadow:var(--eb-shadow-sm);position:relative;overflow:hidden;}
        .rp-kcard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
        .rp-kn{font-size:32px;font-weight:800;letter-spacing:-.05em;line-height:1;margin-bottom:4px;}
        .rp-kl{font-size:13px;color:var(--eb-text-muted);}
        .rp-kdelta{font-size:12px;font-weight:700;margin-top:8px;}

        /* Grid */
        .rp-grid3{display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px;}
        @media(max-width:900px){.rp-grid3{grid-template-columns:1fr;}}

        .rp-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);padding:22px;}
        .rp-ctitle{font-size:15px;font-weight:700;color:var(--eb-text-main);margin-bottom:4px;}
        .rp-csub{font-size:12px;color:var(--eb-text-muted);margin-bottom:18px;}

        /* Bar chart */
        .rp-barchart{display:flex;align-items:flex-end;gap:10px;height:150px;border-bottom:1px solid var(--eb-border);margin-bottom:8px;}
        .rp-bar-col{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;}
        .rp-bar{width:100%;border-radius:4px 4px 0 0;transition:.4s ease;min-height:4px;cursor:pointer;}
        .rp-bar:hover{opacity:.8;}
        .rp-bar-label{font-size:10px;color:var(--eb-text-muted);font-weight:600;margin-top:6px;}
        .rp-bar-val{font-size:11px;font-weight:700;color:var(--eb-text-main);}

        /* Dept table */
        .rp-dtable{width:100%;border-collapse:collapse;font-size:13px;}
        .rp-dtable thead th{background:var(--eb-slate-bg);border-bottom:1px solid var(--eb-border);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--eb-text-muted);padding:8px 12px;text-align:left;}
        .rp-dtable tbody td{padding:10px 12px;border-bottom:1px solid var(--eb-border);vertical-align:middle;}
        .rp-dtable tbody tr:last-child td{border-bottom:none;}
        .rp-dtable tbody tr:hover{background:#FAFBFC;}
        .rp-prog{height:5px;background:#F1F5F9;border-radius:99px;overflow:hidden;width:80px;}
        .rp-prog-fill{height:100%;border-radius:99px;background:var(--eb-accent);}

        /* Distribution */
        .rp-dist-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .rp-dist-left{display:flex;align-items:center;gap:8px;}
        .rp-dist-dot{width:10px;height:10px;border-radius:50%;}
        .rp-dist-bar-wrap{flex:1;height:6px;background:#F1F5F9;border-radius:99px;overflow:hidden;margin:0 14px;}
        .rp-dist-bar{height:100%;border-radius:99px;}
        .rp-dist-val{font-size:13px;font-weight:700;min-width:30px;text-align:right;}
      `}</style>

      <div className="page-enter">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
          <div>
            <div className="rp-pt">Reports Dashboard</div>
            <div className="rp-ps">Organisation-wide leave analytics and insights</div>
          </div>
          <div className="rp-hdr-right">
            <select className="rp-sel" value={period} onChange={e => setPeriod(e.target.value)}>
              <option>FY 2026-27</option>
              <option>FY 2025-26</option>
            </select>
            <button className="rp-dl-btn" onClick={downloadToast}>
              <i className="bi bi-download"/>Export
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{padding:'60px 0', textAlign:'center', color:'var(--eb-text-muted)'}}>Loading reports data...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="rp-kpi">
              {[
                { label:'Total Requests',  value:totals.requests, color:'#2563EB', delta:'Lifetime', dClr:'#2563EB' },
                { label:'Approved',        value:totals.approved, color:'#16A34A', delta:`${totals.approvalRate} approval rate`, dClr:'#16A34A' },
                { label:'Rejected',        value:totals.rejected, color:'#DC2626', delta:`${totals.requests ? Math.round((totals.rejected/totals.requests)*100) : 0}% rejection rate`, dClr:'#DC2626' },
                { label:'Pending Review',  value:totals.pending,  color:'#D97706', delta:'Action required',    dClr:'#D97706' },
              ].map(k => (
                <div key={k.label} className="rp-kcard" style={{'--kc':k.color}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:k.color,borderRadius:'var(--eb-radius) var(--eb-radius) 0 0'}}/>
                  <div className="rp-kn" style={{color:k.color}}>{k.value}</div>
                  <div className="rp-kl">{k.label}</div>
                  <div className="rp-kdelta" style={{color:k.dClr}}>{k.delta}</div>
                </div>
              ))}
            </div>

            {/* Bar chart + Leave distribution */}
            <div className="rp-grid3 mb-4">
              {/* Monthly leave trend */}
              <div className="rp-card">
                <div className="rp-ctitle">Monthly Leave Trend</div>
                <div className="rp-csub">Total leave requests per month — {period}</div>
                <div className="rp-barchart">
                  {monthly.map(m => (
                    <div key={m.month} className="rp-bar-col">
                      <div className="rp-bar-val">{m.total}</div>
                      <div
                        className="rp-bar"
                        style={{
                          height: `${Math.max(Math.round((m.total / maxTotal) * 100), 2)}%`,
                          background: `linear-gradient(180deg, #2563EB, #60A5FA)`,
                        }}
                        title={`${m.month}: ${m.total} requests`}
                      />
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  {monthly.map(m => <div key={m.month} className="rp-bar-label">{m.month}</div>)}
                </div>
              </div>

              {/* Leave type distribution */}
              <div className="rp-card">
                <div className="rp-ctitle">Leave Type Distribution</div>
                <div className="rp-csub">By leave type requests — {period}</div>
                {LEAVE_DIST.map(d => (
                  <div key={d.type} className="rp-dist-row">
                    <div className="rp-dist-left" style={{minWidth:120}}>
                      <div className="rp-dist-dot" style={{background:d.color}}/>
                      <div style={{fontSize:12,fontWeight:600,color:'var(--eb-text-main)'}}>{d.type.replace(' Leave','').replace(' Off','')}</div>
                    </div>
                    <div className="rp-dist-bar-wrap">
                      <div className="rp-dist-bar" style={{width:`${d.pct}%`,background:d.color}}/>
                    </div>
                    <div className="rp-dist-val" style={{color:d.color}}>{d.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dept breakdown */}
            <div className="rp-card">
              <div className="rp-ctitle">Department-wise Breakdown</div>
              <div className="rp-csub">Leave requests by department</div>
              <div style={{overflowX:'auto'}}>
                <table className="rp-dtable">
                  <thead>
                    <tr><th>Department</th><th>Total Requests</th><th>Approved</th><th>Rejected</th><th>Pending</th><th>Relative Volume</th></tr>
                  </thead>
                  <tbody>
                    {deptData.length === 0 ? (
                      <tr><td colSpan={6} style={{textAlign:'center', padding:'20px'}}>No department data available.</td></tr>
                    ) : deptData.map(d => (
                      <tr key={d.code}>
                        <td style={{fontWeight:600}}>{d.department}</td>
                        <td><strong>{d.total}</strong></td>
                        <td style={{color:'#16A34A',fontWeight:700}}>{d.approved}</td>
                        <td style={{color:'#DC2626',fontWeight:700}}>{d.rejected}</td>
                        <td style={{color:'#D97706',fontWeight:700}}>{d.pending}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div className="rp-prog">
                              <div className="rp-prog-fill" style={{width:`${Math.round((d.total/maxDept)*100)}%`}}/>
                            </div>
                            <span style={{fontSize:11,color:'var(--eb-text-muted)'}}>{Math.round((d.total/maxDept)*100) || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
