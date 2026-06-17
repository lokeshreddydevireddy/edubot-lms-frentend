import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function DepartmentsManagement() {
  const [search, setSearch] = useState('')
  const [toast,  setToast]  = useState('')
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  // Add Department State
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', code: '', description: '', headId: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [deptRes, empRes] = await Promise.all([
          api.get('/admin/departments'),
          api.get('/admin/employees', { params: { limit: 500 } })
        ])
        if (deptRes.data.success) setDepartments(deptRes.data.data)
        if (empRes.data.success) setEmployees(empRes.data.data)
      } catch (err) {
        console.error('Error fetching departments:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    
    // Clean up payload
    const payload = { ...formData }
    if (!payload.headId) delete payload.headId

    try {
      const res = await api.post('/admin/departments', payload)
      if (res.data.success) {
        // Find full head details for immediate UI update if provided
        let newDept = res.data.data
        if (payload.headId) {
          const head = employees.find(emp => emp._id === payload.headId)
          if (head) newDept.headId = { _id: head._id, name: head.name }
        }
        
        setDepartments([...departments, newDept])
        setShowAddModal(false)
        setFormData({ name: '', code: '', description: '', headId: '' })
        showToast('✓ Department created successfully!')
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create department.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = departments.filter(d =>
    !search || 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.headId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.code?.toLowerCase().includes(search.toLowerCase())
  )

  const total = departments.reduce((a, d) => a + (d.employeeCount || 0), 0)
  const onLeave = departments.reduce((a, d) => a + (d.onLeaveCount || 0), 0)

  // Default UI helpers since backend doesn't store colors and icons
  const getStyles = (code) => {
    const map = {
      'ENG': { color:'#2563EB', icon:'bi-code-slash' },
      'HR':  { color:'#16A34A', icon:'bi-people' },
      'SLS': { color:'#7C3AED', icon:'bi-bar-chart' },
      'FIN': { color:'#D97706', icon:'bi-currency-rupee' },
      'IT':  { color:'#0891B2', icon:'bi-laptop' },
      'MKT': { color:'#DB2777', icon:'bi-megaphone' },
      'OPS': { color:'#DC2626', icon:'bi-gear' }
    }
    return map[code] || { color:'#475569', icon:'bi-building' }
  }

  return (
    <>
      <style>{`
        .dm-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .dm-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}
        .dm-hdr{display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap;}
        .dm-search{display:flex;align-items:center;gap:8px;background:var(--eb-slate-bg);border:1.5px solid transparent;border-radius:8px;padding:7px 12px;transition:var(--eb-transition);flex:1;min-width:200px;}
        .dm-search:focus-within{border-color:var(--eb-accent);background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .dm-search input{border:none;background:none;outline:none;font-size:13px;font-family:inherit;color:var(--eb-text-main);width:100%;}
        .dm-search input::placeholder{color:#94A3B8;}
        .dm-add-btn{padding:7px 16px;background:var(--eb-accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:var(--eb-transition);display:flex;align-items:center;gap:6px;}
        .dm-add-btn:hover{background:#1D4ED8;transform:translateY(-1px);}
        .dm-chips{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;}
        .dm-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:99px;font-size:13px;font-weight:700;}
        .dm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;}
        .dm-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);transition:var(--eb-transition);overflow:hidden;cursor:pointer;position:relative;}
        .dm-card:hover{box-shadow:var(--eb-shadow-md);transform:translateY(-2px);}
        .dm-card-accent{height:4px;border-radius:var(--eb-radius) var(--eb-radius) 0 0;}
        .dm-card-body{padding:20px;}
        .dm-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;}
        .dm-card-left{display:flex;align-items:center;gap:12px;}
        .dm-dept-ico{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;}
        .dm-dept-name{font-size:16px;font-weight:800;color:var(--eb-text-main);}
        .dm-dept-code{font-size:11px;color:var(--eb-text-muted);font-family:monospace;font-weight:700;margin-top:2px;}
        .dm-desc{font-size:12px;color:var(--eb-text-muted);line-height:1.55;margin-bottom:14px;min-height:38px;}
        .dm-card-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .dm-cs{text-align:center;background:var(--eb-slate-bg);border-radius:8px;padding:8px 4px;}
        .dm-cs-n{font-size:18px;font-weight:800;letter-spacing:-.04em;}
        .dm-cs-l{font-size:10px;color:var(--eb-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-top:1px;}
        .dm-head-row{display:flex;align-items:center;gap:8px;padding-top:12px;border-top:1px solid var(--eb-border);}
        .dm-head-ava{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;}
        .dm-head-name{font-size:12px;font-weight:700;color:var(--eb-text-main);}
        .dm-head-lbl{font-size:11px;color:var(--eb-text-muted);margin-left:auto;}
        .dm-actions-row{display:flex;gap:6px;margin-top:10px;}
        .dm-act-btn{flex:1;padding:6px;border-radius:7px;border:1.5px solid var(--eb-border);background:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:var(--eb-transition);font-family:inherit;display:flex;align-items:center;justify-content:center;gap:5px;color:var(--eb-text-muted);}
        .dm-act-btn:hover{border-color:var(--eb-accent);color:var(--eb-accent);background:#EFF6FF;}
        .dm-act-btn.danger:hover{border-color:#FECACA;color:#DC2626;background:#FEF2F2;}
        .dm-toast{position:fixed;bottom:24px;right:24px;z-index:1100;background:#1E293B;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:slideUp .25s ease;}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); backdrop-filter: blur(3px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-box { background: #fff; border-radius: 16px; box-shadow: 0 24px 60px rgba(0,0,0,.18); width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; }
        .modal-hdr { padding: 20px 24px; border-bottom: 1px solid var(--eb-border); display: flex; align-items: center; justify-content: space-between; }
        .modal-hdr h5 { margin: 0; font-weight: 800; font-size: 18px; color: var(--eb-text-main); }
        .modal-close { background: none; border: none; font-size: 20px; color: var(--eb-text-muted); cursor: pointer; }
        .modal-body { padding: 24px; }
        .modal-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .modal-form-group label { font-size: 13px; font-weight: 600; color: var(--eb-text-main); }
        .modal-input { padding: 9px 12px; border: 1.5px solid var(--eb-border); border-radius: 8px; font-size: 14px; font-family: inherit; transition: var(--eb-transition); }
        .modal-input:focus { border-color: var(--eb-accent); outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
        .modal-textarea { resize: vertical; min-height: 80px; }
        .modal-ftr { padding: 16px 24px; border-top: 1px solid var(--eb-border); display: flex; justify-content: flex-end; gap: 10px; background: #FAFBFC; border-radius: 0 0 16px 16px; }
        .modal-btn { padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: var(--eb-transition); }
        .modal-btn.cancel { background: #fff; border: 1.5px solid var(--eb-border); color: var(--eb-text-main); }
        .modal-btn.cancel:hover { background: var(--eb-slate-bg); }
        .modal-btn.submit { background: var(--eb-accent); color: #fff; }
        .modal-btn.submit:hover { background: #1D4ED8; }
        .modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-err { background: #FEF2F2; color: #DC2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 16px; border: 1px solid #FECACA; }
      `}</style>

      {toast && <div className="dm-toast">{toast}</div>}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h5>Add New Department</h5>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><i className="bi bi-x"/></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {formError && <div className="form-err"><i className="bi bi-exclamation-circle me-2"/>{formError}</div>}
                <div className="modal-form-group">
                  <label>Department Name</label>
                  <input required className="modal-input" placeholder="e.g. Engineering" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="modal-form-group">
                  <label>Department Code</label>
                  <input required className="modal-input" placeholder="e.g. ENG" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="modal-form-group">
                  <label>Department Head (Optional)</label>
                  <select className="modal-input" value={formData.headId} onChange={e => setFormData({...formData, headId: e.target.value})}>
                    <option value="">Select a head</option>
                    {employees.filter(emp => emp.role === 'manager' || emp.role === 'admin').map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-form-group" style={{ marginBottom: 0 }}>
                  <label>Description</label>
                  <textarea className="modal-input modal-textarea" placeholder="Brief description of this department..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
              <div className="modal-ftr">
                <button type="button" className="modal-btn cancel" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="modal-btn submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Department'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-enter">
        <div className="dm-pt">Departments Management</div>
        <div className="dm-ps">Manage organizational departments, heads, and team structures</div>

        <div className="dm-hdr">
          <div className="dm-search">
            <i className="bi bi-search" style={{color:'#94A3B8',fontSize:14}}/>
            <input placeholder="Search department, head, or code…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <button className="dm-add-btn" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus"/>Add Department
          </button>
        </div>

        <div className="dm-chips">
          <div className="dm-chip" style={{background:'#EFF6FF',color:'#2563EB'}}><i className="bi bi-building"/>{departments.length} departments</div>
          <div className="dm-chip" style={{background:'#F0FDF4',color:'#16A34A'}}><i className="bi bi-people"/>{total} total employees</div>
          <div className="dm-chip" style={{background:'#FEF3C7',color:'#92400E'}}><i className="bi bi-calendar-minus"/>{onLeave} currently on leave</div>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">Loading departments...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">No data available</div>
        ) : (
          <div className="dm-grid">
            {filtered.map(d => {
              const styles = getStyles(d.code)
              const activeCount = Math.max(0, (d.employeeCount || 0) - (d.onLeaveCount || 0))
              const headName = d.headId?.name || 'Unassigned'
              const headAvatar = headName !== 'Unassigned' ? headName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '?'
              return (
                <div key={d._id} className="dm-card">
                  <div className="dm-card-accent" style={{background:styles.color}}/>
                  <div className="dm-card-body">
                    <div className="dm-card-top">
                      <div className="dm-card-left">
                        <div className="dm-dept-ico" style={{background:styles.color+'18',color:styles.color}}>
                          <i className={`bi ${styles.icon}`}/>
                        </div>
                        <div>
                          <div className="dm-dept-name">{d.name}</div>
                          <div className="dm-dept-code">{d.code}</div>
                        </div>
                      </div>
                    </div>

                    <div className="dm-desc">{d.description || 'No description provided.'}</div>

                    <div className="dm-card-stats">
                      <div className="dm-cs">
                        <div className="dm-cs-n" style={{color:styles.color}}>{d.employeeCount || 0}</div>
                        <div className="dm-cs-l">Total</div>
                      </div>
                      <div className="dm-cs">
                        <div className="dm-cs-n" style={{color:'#16A34A'}}>{activeCount}</div>
                        <div className="dm-cs-l">Active</div>
                      </div>
                      <div className="dm-cs">
                        <div className="dm-cs-n" style={{color: (d.onLeaveCount || 0) > 0 ? '#D97706' : '#94A3B8'}}>{d.onLeaveCount || 0}</div>
                        <div className="dm-cs-l">On Leave</div>
                      </div>
                    </div>

                    <div className="dm-head-row">
                      <div className="dm-head-ava" style={{background:styles.color}}>{headAvatar}</div>
                      <div className="dm-head-name">{headName}</div>
                      <div className="dm-head-lbl"><i className="bi bi-person-badge me-1"/>Head</div>
                    </div>

                    <div className="dm-actions-row">
                      <button className="dm-act-btn" onClick={() => showToast(`Viewing ${d.name} details`)}><i className="bi bi-eye"/>View</button>
                      <button className="dm-act-btn" onClick={() => showToast(`Editing ${d.name}`)}><i className="bi bi-pencil"/>Edit</button>
                      <button className="dm-act-btn danger" onClick={() => showToast(`Cannot delete ${d.name} — has active employees`)}><i className="bi bi-trash"/>Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
