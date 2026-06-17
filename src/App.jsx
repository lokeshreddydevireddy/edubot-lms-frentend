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
            <Route path="apply"           element={<ApplyLeave />} />
            <Route path="my-leaves"       element={<MyLeaves />} />
            <Route path="balance"         element={<LeaveBalance />} />

            {/* ── Manager ────────────────────────────────── */}
            <Route path="pending"         element={<PendingRequests />} />
            <Route path="approved"        element={<ApprovedRequests />} />
            <Route path="rejected"        element={<RejectedRequests />} />
            <Route path="team"            element={<TeamCalendar />} />

            {/* ── Admin ──────────────────────────────────── */}
            <Route path="users"           element={<UserManagement />} />
            <Route path="departments"     element={<DepartmentsManagement />} />
            <Route path="leave-types"     element={<LeaveTypes />} />
            <Route path="reports"         element={<Reports />} />
            <Route path="audit"           element={<AuditLogs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
