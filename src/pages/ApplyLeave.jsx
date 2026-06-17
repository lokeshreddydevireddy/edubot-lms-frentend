import React, { useState, useEffect } from 'react'
import api from '../services/api'

const LEAVE_TYPES_UI = [
  { value: 'casual',       label: 'Casual Leave',       icon: 'bi-sun',                  color: '#2563EB' },
  { value: 'sick',         label: 'Sick Leave',          icon: 'bi-heart-pulse',           color: '#16A34A' },
  { value: 'earned',       label: 'Earned Leave',        icon: 'bi-briefcase',             color: '#7C3AED' },
  { value: 'emergency',    label: 'Emergency Leave',     icon: 'bi-exclamation-triangle',  color: '#DC2626' },
  { value: 'maternity',    label: 'Maternity Leave',     icon: 'bi-person-heart',          color: '#DB2777' },
  { value: 'paternity',    label: 'Paternity Leave',     icon: 'bi-people',                color: '#0891B2' },
  { value: 'compensatory', label: 'Compensatory Off',    icon: 'bi-arrow-repeat',          color: '#D97706' },
]

function calcWorkingDays(start, end) {
  if (!start || !end) return 0
  const s = new Date(start), e = new Date(end)
  if (e < s) return 0
  let count = 0
  const d = new Date(s)
  while (d <= e) { if (d.getDay() !== 0 && d.getDay() !== 6) count++; d.setDate(d.getDate() + 1) }
  return count
}

export default function ApplyLeave() {
  const [form, setForm] = useState({ leaveType: '', startDate: '', endDate: '', halfDay: false, halfDaySlot: 'morning', reason: '', contactNum: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [refNo,      setRefNo]      = useState('')
  const [error,      setError]      = useState('')
  const [balanceData, setBalanceData] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get('/employee/balance')
        if (res.data.success) {
          setBalanceData(res.data.data)
        }
      } catch (err) {
        console.error('Error fetching balance:', err)
      } finally {
        setLoadingBalance(false)
      }
    }
    fetchBalance()
  }, [])

  const days = form.halfDay ? 0.5 : calcWorkingDays(form.startDate, form.endDate)
  
  // Calculate remaining dynamically
  let remaining = 0
  if (form.leaveType && balanceData) {
    const quota = balanceData[form.leaveType]
    if (quota) {
      remaining = quota.total - quota.used - quota.pending
    }
  }

  const today = new Date().toISOString().split('T')[0]

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.leaveType)  return setError('Please select a leave type.')
    if (!form.startDate)  return setError('Please select a start date.')
    if (!form.halfDay && !form.endDate)  return setError('Please select an end date.')
    if (!form.halfDay && new Date(form.endDate) < new Date(form.startDate))
      return setError('End date cannot be before start date.')
    if (!form.reason.trim()) return setError('Please provide a reason for your leave.')
    if (days <= 0) return setError('Selected dates include no working days.')

    setSubmitting(true)
    try {
      const res = await api.post('/employee/apply-leave', {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.halfDay ? form.startDate : form.endDate,
        halfDay: form.halfDay,
        halfDaySlot: form.halfDaySlot,
        reason: form.reason,
        emergencyContact: form.contactNum,
      })
      if (res.data.success) {
        setRefNo(res.data.data.refId)
        setSubmitted(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setForm({ leaveType:'', startDate:'', endDate:'', halfDay:false, halfDaySlot:'morning', reason:'', contactNum:'' })
    setSubmitted(false)
    setError('')
  }

  if (submitted) return (
    <>
      <style>{`
        .al-wrap{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - var(--eb-navbar-h) - 80px);}
        .al-scard{background:#fff;border-radius:16px;box-shadow:var(--eb-shadow-md);padding:52px 60px;max-width:460px;width:100%;text-align:center;border:1px solid var(--eb-border);position:relative;overflow:hidden;}
        .al-scard::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#16A34A,#22C55E);}
        .al-sicon{width:72px;height:72px;border-radius:50%;background:#F0FDF4;border:2px solid #86EFAC;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px;color:#16A34A;}
        .al-st{font-size:22px;font-weight:800;color:var(--eb-text-main);margin-bottom:8px;letter-spacing:-.02em;}
        .al-sd{font-size:14px;color:var(--eb-text-muted);line-height:1.65;margin-bottom:24px;}
        .al-ref{display:inline-flex;align-items:center;gap:8px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;color:#166534;margin-bottom:28px;}
      `}</style>
      <div className="al-wrap page-enter">
        <div className="al-scard">
          <div className="al-sicon"><i className="bi bi-check-lg"/></div>
          <div className="al-st">Leave Request Submitted!</div>
          <div className="al-sd">Your application has been sent to your manager for approval. You'll receive a notification once reviewed.</div>
          <div className="al-ref"><i className="bi bi-ticket-perforated"/>{refNo}</div>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-primary" onClick={reset}><i className="bi bi-plus me-2"/>Apply Another</button>
            <a href="/dashboard/my-leaves" className="btn btn-light fw-600" style={{fontWeight:600}}>View My Leaves</a>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        .al-page{max-width:980px;}
        .al-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .al-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}
        .al-grid{display:grid;grid-template-columns:1fr 300px;gap:24px;}
        @media(max-width:820px){.al-grid{grid-template-columns:1fr;}}
        .al-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);padding:28px;}
        .al-ct{font-size:15px;font-weight:700;color:var(--eb-text-main);margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--eb-border);}
        .al-label{font-size:13px;font-weight:600;color:var(--eb-text-main);margin-bottom:6px;display:block;}
        .al-opt{font-size:13px;color:var(--eb-text-muted);font-weight:400;}
        .al-input,.al-sel,.al-ta{width:100%;padding:10px 13px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:14px;font-family:inherit;color:var(--eb-text-main);background:#fff;transition:var(--eb-transition);outline:none;}
        .al-input:focus,.al-sel:focus,.al-ta:focus{border-color:var(--eb-accent);box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .al-input.e,.al-sel.e,.al-ta.e{border-color:var(--eb-danger);box-shadow:0 0 0 3px rgba(220,38,38,.08);}
        .al-sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;}
        .al-ta{min-height:110px;resize:vertical;}
        .al-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:540px){.al-2col{grid-template-columns:1fr;}}
        .al-chk{display:flex;align-items:center;gap:10px;}
        .al-chk input{width:16px;height:16px;cursor:pointer;accent-color:var(--eb-accent);}
        .al-chk label{font-size:13px;color:var(--eb-text-muted);cursor:pointer;}
        .al-pill{display:inline-flex;align-items:center;gap:6px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:700;color:var(--eb-accent);}
        .al-pill.warn{background:#FEF2F2;border-color:#FECACA;color:var(--eb-danger);}
        .al-err{background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:10px 14px;font-size:13px;color:var(--eb-danger);display:flex;align-items:center;gap:8px;margin-bottom:16px;}
        .al-btn{width:100%;padding:11px;border-radius:8px;background:var(--eb-accent);color:#fff;font-weight:700;font-size:15px;font-family:inherit;border:none;cursor:pointer;transition:var(--eb-transition);display:flex;align-items:center;justify-content:center;gap:8px;}
        .al-btn:hover:not(:disabled){background:#1D4ED8;transform:translateY(-1px);box-shadow:0 4px 14px rgba(37,99,235,.3);}
        .al-btn:disabled{opacity:.7;cursor:not-allowed;}
        @keyframes spin3{to{transform:rotate(360deg);}}
        .al-sp{width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin3 .7s linear infinite;}
        .bal-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .bal-left{display:flex;align-items:center;gap:10px;}
        .bal-ico{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;}
        .bal-name{font-size:12px;font-weight:700;color:var(--eb-text-main);}
        .bal-sub{font-size:11px;color:var(--eb-text-muted);}
        .bal-num{font-size:18px;font-weight:800;letter-spacing:-.03em;}
        .bal-bar{height:4px;background:#F1F5F9;border-radius:99px;overflow:hidden;margin-top:3px;margin-bottom:12px;}
        .bal-fill{height:100%;border-radius:99px;}
        .tip-box{background:#FFFBEB;border:1px solid #FDE68A;border-radius:var(--eb-radius);padding:14px;font-size:12.5px;color:#92400E;line-height:1.55;margin-top:0;}
        .tip-box i{color:#D97706;margin-right:5px;}
      `}</style>

      <div className="al-page page-enter">
        <div className="al-pt">Apply for Leave</div>
        <div className="al-ps">Submit a new leave request for manager approval</div>

        <div className="al-grid">

          {/* ── Form ─────────────────────────── */}
          <form onSubmit={handleSubmit} className="al-card" noValidate>
            <div className="al-ct">Leave Application Form</div>
            {error && <div className="al-err"><i className="bi bi-exclamation-circle-fill"/>{error}</div>}

            {/* Leave Type */}
            <div className="mb-4">
              <label className="al-label">Leave Type <span className="al-opt">*</span></label>
              <select className={`al-sel${error && !form.leaveType ? ' e' : ''}`} value={form.leaveType} onChange={e => set('leaveType', e.target.value)}>
                <option value="">— Select leave type —</option>
                {LEAVE_TYPES_UI.map(t => {
                  const quota = balanceData ? balanceData[t.value] : null
                  const rem = quota ? quota.total - quota.used - quota.pending : 0
                  return (
                    <option key={t.value} value={t.value}>{t.label} ({rem} days remaining)</option>
                  )
                })}
              </select>
            </div>

            {/* Half day toggle */}
            <div className="mb-4">
              <div className="al-chk">
                <input type="checkbox" id="hd" checked={form.halfDay} onChange={e => set('halfDay', e.target.checked)}/>
                <label htmlFor="hd">Apply for half day only</label>
              </div>
            </div>

            {/* Dates */}
            {form.halfDay ? (
              <div className="mb-4">
                <label className="al-label">Date *</label>
                <input type="date" className="al-input" value={form.startDate} min={today} onChange={e => set('startDate', e.target.value)}/>
                <div className="d-flex gap-3 mt-3">
                  {['morning', 'afternoon'].map(s => (
                    <label key={s} className="d-flex align-items-center gap-2" style={{cursor:'pointer',fontSize:13}}>
                      <input type="radio" name="slot" checked={form.halfDaySlot === s} onChange={() => set('halfDaySlot', s)} style={{accentColor:'var(--eb-accent)'}}/>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="al-2col mb-4">
                <div>
                  <label className="al-label">Start Date *</label>
                  <input type="date" className={`al-input${error && !form.startDate ? ' e' : ''}`} value={form.startDate} min={today} onChange={e => set('startDate', e.target.value)}/>
                </div>
                <div>
                  <label className="al-label">End Date *</label>
                  <input type="date" className={`al-input${error && !form.endDate ? ' e' : ''}`} value={form.endDate} min={form.startDate || today} onChange={e => set('endDate', e.target.value)}/>
                </div>
              </div>
            )}

            {/* Days pill */}
            {days > 0 && (
              <div className="mb-4">
                <div className={`al-pill${days > remaining ? ' warn' : ''}`}>
                  <i className="bi bi-calendar-week"/>
                  {days} working day{days !== 1 ? 's' : ''} requested
                  {days > remaining && <span style={{marginLeft:8}}>⚠ Exceeds available balance</span>}
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="mb-4">
              <label className="al-label">Reason *</label>
              <textarea
                className={`al-ta${error && !form.reason.trim() ? ' e' : ''}`}
                placeholder="Briefly describe the reason for your leave request…"
                value={form.reason}
                maxLength={500}
                onChange={e => set('reason', e.target.value)}
              />
              <div style={{fontSize:11,color:'var(--eb-text-muted)',textAlign:'right',marginTop:3}}>{form.reason.length}/500</div>
            </div>

            {/* Contact (optional) */}
            <div className="mb-4">
              <label className="al-label">Emergency Contact <span className="al-opt">(optional)</span></label>
              <input type="tel" className="al-input" placeholder="Phone number reachable during leave" value={form.contactNum} onChange={e => set('contactNum', e.target.value)}/>
            </div>

            <button type="submit" className="al-btn" disabled={submitting || loadingBalance}>
              {submitting ? <><div className="al-sp"/>Submitting…</> : <><i className="bi bi-send"/>Submit Leave Request</>}
            </button>
          </form>

          {/* ── Sidebar ──────────────────────── */}
          <div>
            <div className="al-card mb-4">
              <div className="al-ct">Your Leave Balance</div>
              {loadingBalance ? (
                <div style={{textAlign: 'center', padding: '20px 0', color: 'var(--eb-text-muted)'}}>Loading balance...</div>
              ) : (
                LEAVE_TYPES_UI.slice(0, 4).map(t => {
                  const quota = balanceData ? balanceData[t.value] : null
                  if (!quota) return null
                  const rem = quota.total - quota.used - quota.pending
                  const pct = Math.round((rem / quota.total) * 100) || 0
                  return (
                    <div key={t.value}>
                      <div className="bal-row">
                        <div className="bal-left">
                          <div className="bal-ico" style={{background: t.color + '18', color: t.color}}>
                            <i className={`bi ${t.icon}`}/>
                          </div>
                          <div>
                            <div className="bal-name">{t.label}</div>
                            <div className="bal-sub">{quota.used} used of {quota.total}</div>
                          </div>
                        </div>
                        <div className="bal-num" style={{color: t.color}}>{rem}</div>
                      </div>
                      <div className="bal-bar">
                        <div className="bal-fill" style={{width: `${pct}%`, background: t.color}}/>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="tip-box">
              <i className="bi bi-lightbulb-fill"/>
              <strong>Reminder:</strong> Submit casual and earned leave requests at least 2 working days in advance. Same-day applications are accepted for sick and emergency leaves.
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
