import React, { useState, useEffect, useMemo } from 'react'
import api from '../services/api'

export default function DepartmentsManagement() {
  const [search, setSearch] = useState('')
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  // Modal Triggers
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [selectedDept, setSelectedDept] = useState(null)
  const [formData, setFormData] = useState({ name: '', code: '', description: '', headId: '' })
  
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Used for selecting a department head
  const [managers, setManagers] = useState([])

  const showMessage = msg => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const loadData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/employees?role=manager&limit=1000') // fetch all managers
      ])
      if (deptRes.data.success) setDepartments(deptRes.data.data)
      if (empRes.data.success) setManagers(empRes.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setFormError('')
    try {
      const payload = { ...formData };
      if (!payload.headId) delete payload.headId;
      
      const res = await api.post('/admin/departments', payload)
      if (res.data.success) {
        setShowAddModal(false)
        setFormData({ name: '', code: '', description: '', headId: '' })
        showMessage('Department provisioned successfully.')
        loadData()
      }
    } catch (err) { setFormError(err.response?.data?.message || 'Provisioning failed.') }
    finally { setSubmitting(false) }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setFormError('')
    try {
      const payload = { ...selectedDept }
      if (payload.headId && typeof payload.headId === 'object') {
        payload.headId = payload.headId._id;
      }
      if (!payload.headId) delete payload.headId;

      await api.put(`/admin/departments/${selectedDept._id}`, payload)
      setShowEditModal(false)
      showMessage('Department parameter modification successful.')
      loadData()
    } catch (err) { setFormError(err.response?.data?.message || 'Modification failed.') }
    finally { setSubmitting(false) }
  }

  const handleDeleteExecute = async () => {
    setSubmitting(true); setFormError('')
    try {
      await api.delete(`/admin/departments/${selectedDept._id}`)
      setShowDeleteModal(false)
      showMessage('Department deactivated securely.')
      loadData()
    } catch (err) { setFormError(err.response?.data?.message || 'Purge operation failed.') }
    finally { setSubmitting(false) }
  }

  const filtered = useMemo(() => departments.filter(d => {
    const q = search.toLowerCase()
    if (!q) return true
    return d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q)
  }), [search, departments])

  return (
    <>
      <style>{`
        .dm-pt{font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;}
        .dm-ps{font-size:13px;color:#64748b;margin-bottom:24px;}
        .dm-toolbar{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid #e2e8f0;background:#fff;border-radius:12px 12px 0 0;}
        .dm-search{display:flex;align-items:center;gap:8px;background:#f8fafc;border:1.5px solid transparent;border-radius:8px;padding:7px 12px;width:300px;}
        .dm-search input{border:none;background:none;outline:none;font-size:13px;width:100%;}
        .dm-add-btn{padding:8px 16px;background:#7C3AED;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;}
        .dm-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);overflow-x:auto;}
        .dm-table{width:100%;border-collapse:collapse;font-size:13px;min-width:600px;}
        .dm-table th{background:#f8fafc;padding:12px 16px;color:#64748b;text-transform:uppercase;font-size:11px;text-align:left;border-bottom:1px solid #e2e8f0;}
        .dm-table td{padding:12px 16px;border-bottom:1px solid #e2e8f0;vertical-align:middle;}
        .dm-icon{width:40px;height:40px;border-radius:10px;background:#F5F3FF;color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:20px;}
        .dm-actions{display:flex;gap:6px;}
        .dm-action-btn{width:30px;height:30px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;}
        .dm-action-btn.danger:hover { background: #fef2f2; color: #dc2626; }
        .m-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.4);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;}
        .m-box{background:#fff;border-radius:16px;width:100%;max-width:500px;padding:24px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);}
        .m-input{width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;margin-top:4px;outline:none;}
        .dm-toast{position:fixed;bottom:24px;right:24px;z-index:3000;background:#0f172a;color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);}
        .stat-badge { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; margin-right: 6px; }
      `}</style>

      {toast && <div className="dm-toast">{toast}</div>}

      <div className="page-enter">
        <div className="dm-pt">Department Directory</div>
        <div className="dm-ps">Manage structural organizational units and their respective analytical boundaries</div>

        <div className="dm-card">
          <div className="dm-toolbar">
            <div className="dm-search">
              <i className="bi bi-search" />
              <input placeholder="Filter departments..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="dm-add-btn" onClick={() => setShowAddModal(true)}><i className="bi bi-plus-lg me-1" /> Add Department</button>
          </div>

          <table className="dm-table">
            <thead>
              <tr><th>Department Identity</th><th>Sector Code</th><th>Head / Supervisor</th><th>Metrics</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="dm-icon"><i className="bi bi-diagram-3-fill" /></div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.description || 'No description provided'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>{d.code}</td>
                  <td>
                    {d.headId ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{d.headId.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{d.headId.email}</div>
                      </div>
                    ) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>}
                  </td>
                  <td>
                    <span className="stat-badge">{d.employeeCount || 0} Emps</span>
                    <span className="stat-badge" style={{ background: '#FEF3C7', color: '#92400E' }}>{d.onLeaveCount || 0} Away</span>
                  </td>
                  <td>
                    <div className="dm-actions">
                      <button className="dm-action-btn" onClick={() => { 
                        const payload = { ...d };
                        if (payload.headId) payload.headId = payload.headId._id;
                        setSelectedDept(payload); 
                        setShowEditModal(true); 
                      }}><i className="bi bi-pencil" /></button>
                      <button className="dm-action-btn danger" onClick={() => { 
                        setSelectedDept(d); setFormError(''); setShowDeleteModal(true); 
                      }}><i className="bi bi-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No departments found matching filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="m-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="m-box" onClick={e => e.stopPropagation()}>
            <h5 className="mb-3" style={{ fontWeight: 800 }}>Create Department</h5>
            {formError && <div className="alert alert-danger p-2" style={{ fontSize: 12 }}>{formError}</div>}
            <form onSubmit={handleAddSubmit}>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Department Name *</label><input required className="m-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Identifier Code *</label><input required className="m-input" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} style={{ textTransform: 'uppercase' }} /></div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Description</label><textarea className="m-input" rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="mb-2">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Department Head</label>
                <select className="m-input" value={formData.headId} onChange={e => setFormData({ ...formData, headId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {managers.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                </select>
              </div>
              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#7C3AED', border: 'none' }} disabled={submitting}>Deploy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && selectedDept && (
        <div className="m-overlay" onClick={() => !submitting && setShowEditModal(false)}>
          <div className="m-box" onClick={e => e.stopPropagation()}>
            <h5 className="mb-3" style={{ fontWeight: 800 }}>Edit Department</h5>
            {formError && <div className="alert alert-danger p-2" style={{ fontSize: 12 }}>{formError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Department Name *</label><input required className="m-input" value={selectedDept.name} onChange={e => setSelectedDept({ ...selectedDept, name: e.target.value })} /></div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Identifier Code *</label><input required className="m-input" value={selectedDept.code} onChange={e => setSelectedDept({ ...selectedDept, code: e.target.value })} style={{ textTransform: 'uppercase' }} /></div>
              <div className="mb-2"><label style={{ fontSize: 12, fontWeight: 600 }}>Description</label><textarea className="m-input" rows="2" value={selectedDept.description || ''} onChange={e => setSelectedDept({ ...selectedDept, description: e.target.value })} /></div>
              <div className="mb-2">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Department Head</label>
                <select className="m-input" value={selectedDept.headId || ''} onChange={e => setSelectedDept({ ...selectedDept, headId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {managers.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                </select>
              </div>
              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#7C3AED', border: 'none' }} disabled={submitting}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && selectedDept && (
        <div className="m-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="m-box text-center" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40 }} className="mb-2">⚠️</div>
            <h5 style={{ fontWeight: 800 }}>Deactivate Department</h5>
            <p className="text-muted mb-2">Are you sure you want to deactivate <strong>{selectedDept.name}</strong>?</p>
            {selectedDept.employeeCount > 0 && (
              <div className="alert alert-warning p-2" style={{ fontSize: 12, textAlign: 'left' }}>
                <strong>Warning:</strong> This department has {selectedDept.employeeCount} active employee(s). 
                The system will block this action until all employees are reassigned.
              </div>
            )}
            {formError && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: 12, textAlign: 'left' }}>{formError}</div>}
            
            <div className="d-flex gap-2 justify-content-center mt-4">
              <button className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ background: '#dc2626' }} onClick={handleDeleteExecute} disabled={submitting}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}