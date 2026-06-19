import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage       from './pages/LoginPage'
import DashboardLayout from './components/common/DashboardLayout'
import DashboardHome   from './pages/DashboardHome'
import NotFound        from './pages/NotFound'

// ── New pages ──────────────────────────────────────────────────
import ApplyLeave            from './pages/ApplyLeave'
import MyLeaves              from './pages/MyLeaves'
import LeaveBalance          from './pages/LeaveBalance'
import PendingRequests       from './pages/PendingRequests'
import ApprovedRequests      from './pages/ApprovedRequests'
import RejectedRequests      from './pages/RejectedRequests'
import TeamCalendar          from './pages/TeamCalendar'
import UserManagement        from './pages/UserManagement'
import DepartmentsManagement from './pages/DepartmentsManagement'
import LeaveTypes            from './pages/LeaveTypes'
import Reports               from './pages/Reports'
import AuditLogs             from './pages/AuditLogs'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* ── Common ─────────────────────────────────── */}
            <Route index                  element={<DashboardHome />} />
            
            {/* ── Employee ───────────────────────────────── */}
            <Route path="apply"           element={<RoleRoute allowedRoles={['employee']}><ApplyLeave /></RoleRoute>} />
            <Route path="my-leaves"       element={<RoleRoute allowedRoles={['employee']}><MyLeaves /></RoleRoute>} />
            <Route path="balance"         element={<RoleRoute allowedRoles={['employee']}><LeaveBalance /></RoleRoute>} />

            {/* ── Manager ────────────────────────────────── */}
            <Route path="pending"         element={<RoleRoute allowedRoles={['manager']}><PendingRequests /></RoleRoute>} />
            <Route path="approved"        element={<RoleRoute allowedRoles={['manager']}><ApprovedRequests /></RoleRoute>} />
            <Route path="rejected"        element={<RoleRoute allowedRoles={['manager']}><RejectedRequests /></RoleRoute>} />
            <Route path="team"            element={<RoleRoute allowedRoles={['manager']}><TeamCalendar /></RoleRoute>} />

            {/* ── Admin ──────────────────────────────────── */}
            <Route path="users"           element={<RoleRoute allowedRoles={['admin']}><UserManagement /></RoleRoute>} />
            <Route path="departments"     element={<RoleRoute allowedRoles={['admin']}><DepartmentsManagement /></RoleRoute>} />
            <Route path="leave-types"     element={<RoleRoute allowedRoles={['admin']}><LeaveTypes /></RoleRoute>} />
            <Route path="reports"         element={<RoleRoute allowedRoles={['admin']}><Reports /></RoleRoute>} />
            <Route path="audit"           element={<RoleRoute allowedRoles={['admin']}><AuditLogs /></RoleRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
