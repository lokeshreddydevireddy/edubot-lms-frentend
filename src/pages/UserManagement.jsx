import React, { useState, useEffect, useMemo } from 'react'
import api from '../services/api'

const ROLE_CLR = { employee: '#2563EB', manager: '#7C3AED', admin: '#DC2626' }
const STATUS_CLR = { active: '#16A34A', inactive: '#DC2626', 'on-leave': '#D97706' }
const ROLES = ['All Roles', 'employee', 'manager', 'admin']
const STATS = ['All Status', 'active', 'inactive', 'on-leave']

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statFilter, setStatFilter] = useState('All Status')
  const [toast, setToast] = useState('')
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal Control Triggers
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee', department: '', phone: '', joinDate: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const loadData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/admin/employees?limit=1000'), // Ensure we get enough for the table
        api.get('/admin/departments')
      ])
      if (empRes.data.success) setEmployees(empRes.data.data)
      if (deptRes.data.success) setDepartments(deptRes.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setFormError('')
    try {
      const res = await api.post('/admin/employees', formData)
      if (res.data.success) {
        setShowAddModal(false)
        setFormData({ name: '', email: '', password: '', role: 'employee', department: '', phone: '', joinDate: '' })
        showToast('Employee successfully added to system.')
        loadData()
      }
    } catch (err) { setFormError(err.response?.data?.message || 'Transaction failed.') }
    finally { setSubmitting(false) }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setFormError('')
    try {
      const payload = { ...selectedUser }
      if (payload.department && typeof payload.department === 'object') {
        payload.department = payload.department._id;
      }
      await api.put(`/admin/employees/${selectedUser._id}`, payload)
      setShowEditModal(false)
      showToast('Employee successfully updated.')
      loadData()
    } catch (err) { setFormError(err.response?.data?.message || 'Modification failed.') }
    finally { setSubmitting(false) }
  }

  const handleDeleteExecute = async () => {
    setSubmitting(true)
    try {
      await api.delete(`/admin/employees/${selectedUser._id}`)
      setShowDeleteModal(false)
      showToast('Employee successfully deleted.')
      loadData()
    } catch (err) { alert('Purge operation failure.') }
    finally { setSubmitting(false) }
  }

  const filtered = useMemo(() => employees.filter(e => {
    const q = search.toLowerCase()
    if (q && !e.name?.toLowerCase().includes(q) && !e.email?.toLowerCase().includes(q)) return false
    if (deptFilter !== 'All Departments' && e.department?._id !== deptFilter) return false
    if (roleFilter !== 'All Roles' && e.role !== roleFilter) return false
    if (statFilter !== 'All Status' && e.status !== statFilter) return false
    return true
  }), [search, deptFilter, roleFilter, statFilter, employees])

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'

  return (
    <>
      <style>{`
        .um-pt{font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;}
        .um-ps{font-size:13px;color:#64748b;margin-bottom:24px;}
        .um-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
        .um-stat{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;display:flex;align-items:center;gap:12px;}
        .um-stat-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;}
        .um-stat-n{font-size:24px;font-weight:800;}
        .um-toolbar{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid #e2e8f0;background:#fff;border-radius:12px 12px 0 0;flex-wrap:wrap;}
        .um-search{display:flex;align-items:center;gap:8px;background:#f8fafc;border:1.5px solid transparent;border-radius:8px;padding:7px 12px;flex:1;min-width:200px;}
        .um-search input{border:none;background:none;outline:none;font-size:13px;width:100%;}
        .um-sel{padding:7px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;}
        .um-add-btn{padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;}
        .um-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);overflow-x:auto;}
        .um-table{width:100%;border-collapse:collapse;font-size:13px;min-width:700px;}
        .um-table th{background:#f8fafc;padding:12px 16px;color:#64748b;text-transform:uppercase;font-size:11px;text-align:left;border-bottom:1px solid #e2e8f0;}
        .um-table td{padding:12px 16px;border-bottom:1px solid #e2e8f0;}
        .um-avatar{width:34px;height:34px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0;}
        .um-badge{padding:3px 8px;border-radius:99px;font-size:11px;font-weight:700;}
        .um-actions{display:flex;gap:6px;}
        .um-action-btn{width:30px;height:30px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;}
        .um-action-btn.danger:hover { background: #fef2f2; color: #dc2626; }
        .m-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.4);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;}
        .m-box{background:#fff;border-radius:16px;width:100%;max-width:500px;padding:24px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);max-height:90vh;overflow-y:auto;}
        .m-input{width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;margin-top:4px;outline:none;}
        .um-toast{position:fixed;bottom:24px;right:24px;z-index:3000;background:#0f172a;color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);}
      `}</style>

      {toast && <div className="um-toast">{toast}</div>}

      <div className="page-enter">
        <div className="um-pt">Employees Management</div>
        <div className="um-ps">Provision and oversee workspace credentials and relational assignments</div>

        <div className="um-card">
          <div className="um-toolbar">
            <div className="um-search">
              <i className="bi bi-search" />
              <input placeholder="Filter identities..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="um-sel" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="All Departments">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select className="um-sel" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="um-add-btn" onClick={() => setShowAddModal(true)}><i className="bi bi-person-plus-fill me-1" /> Add Employee</button>
          </div>

          <table className="um-table">
            <thead>
              <tr><th>System ID</th><th>User Context</th><th>Department</th><th>Security Classification</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e._id}>
                  <td style={{ fontFamily: 'monospace' }}>{e.employeeId || 'EB-PENDING'}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="um-avatar">{e.name?.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{e.department?.name || 'Unassigned'}</td>
                  <td><span className="um-badge" style={{ background: ROLE_CLR[e.role] + '15', color: ROLE_CLR[e.role] }}>{e.role}</span></td>
                  <td><span className="um-badge" style={{ background: STATUS_CLR[e.status] + '15', color: STATUS_CLR[e.status] }}>{e.status}</span></td>
                  <td>
                    <div className="um-actions">
                      <button className="um-action-btn" onClick={() => { setSelectedUser(e); setShowViewModal(true); }}><i className="bi bi-eye" /></button>
                      <button className="um-action-btn" onClick={() => { 
                        // Map department object to just its ID for the edit select
                        const editPayload = { ...e };
                        if (editPayload.department) editPayload.department = editPayload.department._id;
                        setSelectedUser(editPayload); 
                        setShowEditModal(true); 
                      }}><i className="bi bi-pencil" /></button>
                      <button className="um-action-btn danger" onClick={() => { setSelectedUser(e); setShowDeleteModal(true); }}><i className="bi bi-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No employees found matching filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD EMPLOYEE FORM MODAL ── */}
      {showAddModal && (
        <div className="m-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="m-box" onClick={e => e.stopPropagation()}>
            <h5 className="mb-3" style={{ fontWeight: 800 }}>Add Employee</h5>
            {formError && <div className="alert alert-danger p-2" style={{ fontSize: 12 }}>{formError}</div>}
            <form onSubmit={handleAddSubmit}>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Full Name *</label><input required className="m-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Corporate Email *</label><input required type="email" className="m-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Password</label><input className="m-input" placeholder="Defaults to Emp@123" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>
              <div className="mb-2">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Department</label>
                <select className="m-input" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                  <option value="">Unassigned</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="mb-2">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Role</label>
                <select required className="m-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Phone Number</label><input type="text" className="m-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
              
              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#2563eb' }} disabled={submitting}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW INSIGHT MODAL ── */}
      {showViewModal && selectedUser && (
        <div className="m-overlay" onClick={() => setShowViewModal(false)}>
          <div className="m-box" onClick={e => e.stopPropagation()}>
            <h5 className="mb-3" style={{ fontWeight: 800 }}>Employee Details</h5>
            <div className="table-responsive">
              <table className="table table-borderless table-sm">
                <tbody>
                  <tr><th style={{ width: '40%', color: '#64748b' }}>Employee ID</th><td style={{ fontWeight: 600 }}>{selectedUser.employeeId || 'N/A'}</td></tr>
                  <tr><th style={{ color: '#64748b' }}>Name</th><td style={{ fontWeight: 600 }}>{selectedUser.name}</td></tr>
                  <tr><th style={{ color: '#64748b' }}>Email</th><td>{selectedUser.email}</td></tr>
                  <tr><th style={{ color: '#64748b' }}>Department</th><td>{selectedUser.department?.name || 'Unassigned'}</td></tr>
                  <tr><th style={{ color: '#64748b' }}>Role</th><td className="text-capitalize">{selectedUser.role}</td></tr>
                  <tr><th style={{ color: '#64748b' }}>Status</th><td><span className="um-badge" style={{ background: STATUS_CLR[selectedUser.status] + '15', color: STATUS_CLR[selectedUser.status] }}>{selectedUser.status}</span></td></tr>
                  <tr><th style={{ color: '#64748b' }}>Join Date</th><td>{fmtDate(selectedUser.joinDate)}</td></tr>
                </tbody>
              </table>
            </div>
            <button className="btn btn-secondary w-100 mt-3" onClick={() => setShowViewModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ── EDIT INSIGHT MODAL ── */}
      {showEditModal && selectedUser && (
        <div className="m-overlay" onClick={() => !submitting && setShowEditModal(false)}>
          <div className="m-box" onClick={e => e.stopPropagation()}>
            <h5 className="mb-3" style={{ fontWeight: 800 }}>Edit Employee</h5>
            {formError && <div className="alert alert-danger p-2" style={{ fontSize: 12 }}>{formError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Full Name</label><input required className="m-input" value={selectedUser.name} onChange={e => setSelectedUser({ ...selectedUser, name: e.target.value })} /></div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Email Address</label><input required type="email" className="m-input" value={selectedUser.email} onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })} /></div>
              <div className="mb-2">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Department</label>
                <select className="m-input" value={selectedUser.department || ''} onChange={e => setSelectedUser({ ...selectedUser, department: e.target.value })}>
                  <option value="">Unassigned</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="mb-2">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Role</label>
                <select required className="m-input" value={selectedUser.role} onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                  <option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-2">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Status</label>
                <select required className="m-input" value={selectedUser.status} onChange={e => setSelectedUser({ ...selectedUser, status: e.target.value })}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="on-leave">On Leave</option>
                </select>
              </div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Phone Number</label><input className="m-input" value={selectedUser.phone || ''} onChange={e => setSelectedUser({ ...selectedUser, phone: e.target.value })} /></div>
              
              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#2563eb' }} disabled={submitting}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PERMANENT PURGE MODAL ── */}
      {showDeleteModal && selectedUser && (
        <div className="m-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="m-box text-center" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40 }} className="mb-2">⚠️</div>
            <h5 style={{ fontWeight: 800 }}>Delete Employee</h5>
            <p className="text-muted">Are you sure you want to delete <strong>{selectedUser.name}</strong>? This will deactivate the account.</p>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <button className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ background: '#dc2626' }} onClick={handleDeleteExecute}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}