import React, { useState } from 'react'
import api from '../services/api'

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
  const [form, setForm] = useState({ startDate: '', endDate: '', halfDay: false, halfDaySlot: 'morning', reason: '', contactNum: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNo, setRefNo] = useState('')
  const [error, setError] = useState('')

  const days = form.halfDay ? 0.5 : calcWorkingDays(form.startDate, form.endDate)
  const today = new Date().toISOString().split('T')[0]

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.startDate) return setError('Please select a start date.')
    if (!form.halfDay && !form.endDate) return setError('Please select an end date.')
    if (!form.halfDay && new Date(form.endDate) < new Date(form.startDate))
      return setError('End date cannot be before start date.')
    if (!form.reason.trim()) return setError('Please provide a reason for your leave.')
    if (days <= 0) return setError('Selected dates include no working days.')

    setSubmitting(true)
    try {
      const res = await api.post('/employee/apply-leave', {
        leaveType: 'casual', // Maintaining backend validation compatibility
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
    setForm({ startDate: '', endDate: '', halfDay: false, halfDaySlot: 'morning', reason: '', contactNum: '' })
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
          <div className="al-sicon"><i className="bi bi-check-lg" /></div>
          <div className="al-st">Leave Request Submitted!</div>
          <div className="al-sd">Your application has been sent to your manager for approval. You'll receive a notification once reviewed.</div>
          <div className="al-ref"><i className="bi bi-ticket-perforated" />{refNo}</div>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-primary" onClick={reset}><i className="bi bi-plus me-2" />Apply Another</button>
            <a href="/dashboard/my-leaves" className="btn btn-light fw-600" style={{ fontWeight: 600 }}>View My Leaves</a>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        .al-page{max-width:680px; margin: 0 auto;}
        .al-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .al-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}
        .al-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);padding:28px;margin-bottom:20px;}
        .al-ct{font-size:15px;font-weight:700;color:var(--eb-text-main);margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--eb-border);}
        .al-label{font-size:13px;font-weight:600;color:var(--eb-text-main);margin-bottom:6px;display:block;}
        .al-input,.al-ta{width:100%;padding:10px 13px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:14px;font-family:inherit;color:var(--eb-text-main);background:#fff;transition:var(--eb-transition);outline:none;}
        .al-input:focus,.al-ta:focus{border-color:var(--eb-accent);box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .al-input.e,.al-ta.e{border-color:var(--eb-danger);box-shadow:0 0 0 3px rgba(220,38,38,.08);}
        .al-ta{min-height:110px;resize:vertical;}
        .al-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:540px){.al-2col{grid-template-columns:1fr;}}
        .al-chk{display:flex;align-items:center;gap:10px;}
        .al-chk input{width:16px;height:16px;cursor:pointer;accent-color:var(--eb-accent);}
        .al-chk label{font-size:13px;color:var(--eb-text-muted);cursor:pointer;}
        .al-pill{display:inline-flex;align-items:center;gap:6px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:700;color:var(--eb-accent);}
        .al-err{background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:10px 14px;font-size:13px;color:var(--eb-danger);display:flex;align-items:center;gap:8px;margin-bottom:16px;}
        .al-btn{width:100%;padding:11px;border-radius:8px;background:var(--eb-accent);color:#fff;font-weight:700;font-size:15px;font-family:inherit;border:none;cursor:pointer;transition:var(--eb-transition);display:flex;align-items:center;justify-content:center;gap:8px;}
        .al-btn:hover:not(:disabled){background:#1D4ED8;transform:translateY(-1px);box-shadow:0 4px 14px rgba(37,99,235,.3);}
        .al-btn:disabled{opacity:.7;cursor:not-allowed;}
        @keyframes spin3{to{transform:rotate(360deg);}}
        .al-sp{width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin3 .7s linear infinite;}
        .tip-box{background:#FFFBEB;border:1px solid #FDE68A;border-radius:var(--eb-radius);padding:14px;font-size:12.5px;color:#92400E;line-height:1.55;}
        .tip-box i{color:#D97706;margin-right:5px;}
      `}</style>

      <div className="al-page page-enter">
        <div className="al-pt">Apply for Leave</div>
        <div className="al-ps">Submit a new leave request for manager approval</div>

        <form onSubmit={handleSubmit} className="al-card" noValidate>
          <div className="al-ct">Leave Application Form</div>
          {error && <div className="al-err"><i className="bi bi-exclamation-circle-fill" />{error}</div>}

          {/* Half day toggle */}
          <div className="mb-4">
            <div className="al-chk">
              <input type="checkbox" id="hd" checked={form.halfDay} onChange={e => set('halfDay', e.target.checked)} />
              <label htmlFor="hd">Apply for half day only</label>
            </div>
          </div>

          {/* Conditional Dates Render */}
          {form.halfDay ? (
            <div className="mb-4">
              <label className="al-label">Date *</label>
              <input type="date" className={`al-input${error && !form.startDate ? ' e' : ''}`} value={form.startDate} min={today} onChange={e => set('startDate', e.target.value)} />
              <div className="d-flex gap-3 mt-3">
                {['morning', 'afternoon'].map(s => (
                  <label key={s} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" name="slot" checked={form.halfDaySlot === s} onChange={() => set('halfDaySlot', s)} style={{ accentColor: 'var(--eb-accent)' }} />
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="al-2col mb-4">
              <div>
                <label className="al-label">Start Date *</label>
                <input type="date" className={`al-input${error && !form.startDate ? ' e' : ''}`} value={form.startDate} min={today} onChange={e => set('startDate', e.target.value)} />
              </div>
              <div>
                <label className="al-label">End Date *</label>
                <input type="date" className={`al-input${error && !form.endDate ? ' e' : ''}`} value={form.endDate} min={form.startDate || today} onChange={e => set('endDate', e.target.value)} />
              </div>
            </div>
          )}

          {/* Days pill counter */}
          {days > 0 && (
            <div className="mb-4">
              <div className="al-pill">
                <i className="bi bi-calendar-week" />
                {days} working day{days !== 1 ? 's' : ''} requested
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
            <div style={{ fontSize: 11, color: 'var(--eb-text-muted)', textAlign: 'right', marginTop: 3 }}>{form.reason.length}/500</div>
          </div>

          {/* Contact */}
          <div className="mb-4">
            <label className="al-label">Emergency Contact <span className="al-opt">(optional)</span></label>
            <input type="tel" className="al-input" placeholder="Phone number reachable during leave" value={form.contactNum} onChange={e => set('contactNum', e.target.value)} />
          </div>

          <button type="submit" className="al-btn" disabled={submitting}>
            {submitting ? <><div className="al-sp" />Submitting…</> : <><i className="bi bi-send" />Submit Leave Request</>}
          </button>
        </form>

        <div className="tip-box">
          <i className="bi bi-lightbulb-fill" />
          <strong>Reminder:</strong> Submit standard leave requests at least 2 working days in advance. Same-day applications are generally reviewed on priority for emergencies.
        </div>
      </div>
    </>
  )
}