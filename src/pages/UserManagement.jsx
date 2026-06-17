import React, { useState, useEffect, useMemo } from 'react'
import api from '../services/api'

const ROLE_CLR   = { employee:'#2563EB', manager:'#7C3AED', admin:'#DC2626' }
const STATUS_CLR = { active:'#16A34A', inactive:'#DC2626', 'on-leave':'#D97706' }
const AV_COLORS  = ['#2563EB','#7C3AED','#16A34A','#D97706','#DC2626','#0891B2','#DB2777']

const ROLES  = ['All Roles', 'employee', 'manager', 'admin']
const STATS  = ['All Status', 'active', 'inactive', 'on-leave']

function fmt(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A' }

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter]   = useState('All Departments')
  const [roleFilter, setRoleFilter]   = useState('All Roles')
  const [statFilter, setStatFilter]   = useState('All Status')
  const [toast,  setToast]  = useState('')

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  // Add Employee State
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'employee', department: '', managerId: '', phone: '', joinDate: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [empRes, deptRes] = await Promise.all([
          api.get('/admin/employees', { params: { limit: 100 } }),
          api.get('/admin/departments')
        ])
        if (empRes.data.success) setEmployees(empRes.data.data)
        if (deptRes.data.success) setDepartments(deptRes.data.data)
      } catch (err) {
        console.error('Error fetching user management data:', err)
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
    try {
      const res = await api.post('/admin/employees', formData)
      if (res.data.success) {
        setEmployees([res.data.data, ...employees])
        setShowAddModal(false)
        setFormData({ name: '', email: '', password: '', role: 'employee', department: '', managerId: '', phone: '', joinDate: '' })
        showToast('✓ Employee created successfully!')
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create employee.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = useMemo(() => employees.filter(e => {
    const q = search.toLowerCase()
    const nameMatch = e.name?.toLowerCase().includes(q)
    const emailMatch = e.email?.toLowerCase().includes(q)
    const idMatch = e.employeeId?.toLowerCase().includes(q)
    
    if (q && !nameMatch && !emailMatch && !idMatch) return false
    if (deptFilter !== 'All Departments' && e.department?._id !== deptFilter) return false
    if (roleFilter !== 'All Roles' && e.role !== roleFilter) return false
    if (statFilter !== 'All Status' && e.status !== statFilter) return false
    return true
  }), [search, deptFilter, roleFilter, statFilter, employees])

  const summary = {
    total:   employees.length,
    active:  employees.filter(e => e.status === 'active').length,
    onLeave: employees.filter(e => e.status === 'on-leave').length,
    inactive:employees.filter(e => e.status === 'inactive').length,
  }

  return (
    <>
      <style>{`
        .um-pt{font-size:22px;font-weight:800;color:var(--eb-text-main);letter-spacing:-.03em;margin-bottom:4px;}
        .um-ps{font-size:13px;color:var(--eb-text-muted);margin-bottom:24px;}
        .um-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
        @media(max-width:700px){.um-stats{grid-template-columns:repeat(2,1fr);}}
        .um-stat{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);padding:16px 18px;box-shadow:var(--eb-shadow-sm);display:flex;align-items:center;gap:12px;}
        .um-stat-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
        .um-stat-n{font-size:24px;font-weight:800;letter-spacing:-.04em;line-height:1;}
        .um-stat-l{font-size:12px;color:var(--eb-text-muted);margin-top:1px;}
        .um-toolbar{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--eb-border);flex-wrap:wrap;}
        .um-search{display:flex;align-items:center;gap:8px;background:var(--eb-slate-bg);border:1.5px solid transparent;border-radius:8px;padding:7px 12px;transition:var(--eb-transition);flex:1;min-width:180px;}
        .um-search:focus-within{border-color:var(--eb-accent);background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .um-search input{border:none;background:none;outline:none;font-size:13px;font-family:inherit;color:var(--eb-text-main);width:100%;}
        .um-search input::placeholder{color:#94A3B8;}
        .um-sel{padding:7px 12px;border:1.5px solid var(--eb-border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;cursor:pointer;}
        .um-add-btn{margin-left:auto;padding:7px 16px;background:var(--eb-accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:var(--eb-transition);display:flex;align-items:center;gap:6px;white-space:nowrap;}
        .um-add-btn:hover{background:#1D4ED8;transform:translateY(-1px);}
        .um-card{background:#fff;border:1px solid var(--eb-border);border-radius:var(--eb-radius);box-shadow:var(--eb-shadow-sm);overflow:hidden;}
        .um-table{width:100%;border-collapse:collapse;font-size:13px;}
        .um-table thead th{background:var(--eb-slate-bg);border-bottom:1px solid var(--eb-border);font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--eb-text-muted);padding:10px 16px;text-align:left;white-space:nowrap;}
        .um-table tbody td{padding:13px 16px;border-bottom:1px solid var(--eb-border);vertical-align:middle;}
        .um-table tbody tr:last-child td{border-bottom:none;}
        .um-table tbody tr:hover{background:#FAFBFC;}
        .um-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;}
        .um-name{font-weight:700;font-size:13px;color:var(--eb-text-main);}
        .um-email{font-size:11px;color:var(--eb-text-muted);}
        .um-role-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;text-transform:capitalize;}
        .um-stat-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;}
        .um-actions{display:flex;gap:6px;}
        .um-action-btn{width:28px;height:28px;border-radius:6px;border:1.5px solid var(--eb-border);background:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;transition:var(--eb-transition);color:var(--eb-text-muted);}
        .um-action-btn:hover{background:var(--eb-slate-bg);border-color:var(--eb-accent);color:var(--eb-accent);}
        .um-action-btn.danger:hover{background:#FEF2F2;border-color:#FECACA;color:#DC2626;}
        
        .um-toast{position:fixed;bottom:24px;right:24px;z-index:1100;background:#1E293B;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:slideUp .25s ease;}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); backdrop-filter: blur(3px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-box { background: #fff; border-radius: 16px; box-shadow: 0 24px 60px rgba(0,0,0,.18); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-hdr { padding: 20px 24px; border-bottom: 1px solid var(--eb-border); display: flex; align-items: center; justify-content: space-between; }
        .modal-hdr h5 { margin: 0; font-weight: 800; font-size: 18px; color: var(--eb-text-main); }
        .modal-close { background: none; border: none; font-size: 20px; color: var(--eb-text-muted); cursor: pointer; }
        .modal-body { padding: 24px; }
        .modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .modal-form-group { display: flex; flex-direction: column; gap: 6px; }
        .modal-form-group.full { grid-column: span 2; }
        .modal-form-group label { font-size: 13px; font-weight: 600; color: var(--eb-text-main); }
        .modal-input { padding: 9px 12px; border: 1.5px solid var(--eb-border); border-radius: 8px; font-size: 14px; font-family: inherit; transition: var(--eb-transition); }
        .modal-input:focus { border-color: var(--eb-accent); outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
        .modal-ftr { padding: 16px 24px; border-top: 1px solid var(--eb-border); display: flex; justify-content: flex-end; gap: 10px; background: #FAFBFC; border-radius: 0 0 16px 16px; }
        .modal-btn { padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: var(--eb-transition); }
        .modal-btn.cancel { background: #fff; border: 1.5px solid var(--eb-border); color: var(--eb-text-main); }
        .modal-btn.cancel:hover { background: var(--eb-slate-bg); }
        .modal-btn.submit { background: var(--eb-accent); color: #fff; }
        .modal-btn.submit:hover { background: #1D4ED8; }
        .modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-err { background: #FEF2F2; color: #DC2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 16px; border: 1px solid #FECACA; }
      `}</style>

      {toast && <div className="um-toast">{toast}</div>}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h5>Add New Employee</h5>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><i className="bi bi-x"/></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {formError && <div className="form-err"><i className="bi bi-exclamation-circle me-2"/>{formError}</div>}
                <div className="modal-form-grid">
                  <div className="modal-form-group full">
                    <label>Full Name</label>
                    <input required className="modal-input" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="modal-form-group">
                    <label>Email Address</label>
                    <input required type="email" className="modal-input" placeholder="e.g. john@edubot.in" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="modal-form-group">
                    <label>Password</label>
                    <input required type="password" minLength={6} className="modal-input" placeholder="Min. 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="modal-form-group">
                    <label>Role</label>
                    <select className="modal-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label>Department</label>
                    <select required className="modal-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label>Phone (Optional)</label>
                    <input className="modal-input" placeholder="+91..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="modal-form-group">
                    <label>Join Date</label>
                    <input required type="date" className="modal-input" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-ftr">
                <button type="button" className="modal-btn cancel" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="modal-btn submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-enter">
        <div className="um-pt">Employees Management</div>
        <div className="um-ps">Manage all employee accounts, roles, and departments</div>

        {/* Stats */}
        <div className="um-stats">
          {[
            { label:'Total Employees', value:summary.total,    ico:'bi-people',         clr:'#2563EB', bg:'#EFF6FF' },
            { label:'Active',          value:summary.active,   ico:'bi-person-check',   clr:'#16A34A', bg:'#F0FDF4' },
            { label:'On Leave',        value:summary.onLeave,  ico:'bi-calendar-minus', clr:'#D97706', bg:'#FFFBEB' },
            { label:'Inactive',        value:summary.inactive, ico:'bi-person-dash',    clr:'#DC2626', bg:'#FEF2F2' },
          ].map(s => (
            <div key={s.label} className="um-stat">
              <div className="um-stat-ico" style={{background:s.bg,color:s.clr}}><i className={`bi ${s.ico}`}/></div>
              <div><div className="um-stat-n" style={{color:s.clr}}>{s.value}</div><div className="um-stat-l">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="um-card">
          <div className="um-toolbar">
            <div className="um-search">
              <i className="bi bi-search" style={{color:'#94A3B8',fontSize:14}}/>
              <input placeholder="Search name, email, ID…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="um-sel" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="All Departments">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select className="um-sel" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r === 'All Roles' ? 'All Roles' : r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
            </select>
            <select className="um-sel" value={statFilter} onChange={e => setStatFilter(e.target.value)}>
              {STATS.map(s => <option key={s} value={s}>{s === 'All Status' ? 'All Status' : s.charAt(0).toUpperCase()+s.slice(1).replace('-',' ')}</option>)}
            </select>
            <button className="um-add-btn" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-person-plus"/>Add Employee
            </button>
          </div>

          <div style={{overflowX:'auto'}}>
            <table className="um-table">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">Loading employees...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No data available</td></tr>
                ) : filtered.map((e, i) => {
                  const rClr = ROLE_CLR[e.role] || '#2563EB'
                  const sClr = STATUS_CLR[e.status] || '#16A34A'
                  const sLbl = e.status === 'on-leave' ? 'On Leave' : e.status.charAt(0).toUpperCase()+e.status.slice(1)
                  const sBg  = { active:'#DCFCE7', inactive:'#FEE2E2', 'on-leave':'#FEF3C7' }[e.status] || '#F1F5F9'
                  const avatar = e.name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || '??'
                  
                  return (
                    <tr key={e._id}>
                      <td style={{fontFamily:'monospace',fontSize:12,color:'var(--eb-text-muted)'}}>{e.employeeId || '-'}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div className="um-avatar" style={{background: AV_COLORS[i % AV_COLORS.length]}}>{avatar}</div>
                          <div>
                            <div className="um-name">{e.name}</div>
                            <div className="um-email">{e.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{fontWeight:500}}>{e.department?.name || '-'}</td>
                      <td><span className="um-role-badge" style={{background:rClr+'15',color:rClr}}>{e.role}</span></td>
                      <td style={{fontSize:12,color:'var(--eb-text-muted)',whiteSpace:'nowrap'}}>{fmt(e.joinDate)}</td>
                      <td><span className="um-stat-badge" style={{background:sBg,color:sClr}}>{sLbl}</span></td>
                      <td>
                        <div className="um-actions">
                          <button className="um-action-btn" title="View profile" onClick={() => showToast(`Profile of ${e.name}`)}>
                            <i className="bi bi-eye"/>
                          </button>
                          <button className="um-action-btn" title="Edit employee" onClick={() => showToast(`Editing ${e.name}`)}>
                            <i className="bi bi-pencil"/>
                          </button>
                          <button className="um-action-btn danger" title="Deactivate" onClick={() => showToast(`Deactivating ${e.name}`)}>
                            <i className="bi bi-person-x"/>
                          </button>
                        </div>
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
