import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? '78px' : '260px'

  return (
    <>
      <style>{`
        .eb-layout { min-height: 100vh; background: #f8fafc; display: flex; }
        .eb-content-wrap { flex: 1; display: flex; flex-direction: column; min-width: 0; transition: all 0.3s ease; }
        .eb-content { padding: 32px; min-height: calc(100vh - 72px); background: #f8fafc; }
        @media (max-width: 768px) { 
          .eb-content-wrap { margin-left: 0 !important; }
          .eb-content { padding: 18px; }
        }
      `}</style>

      <div className="eb-layout">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <div className="eb-content-wrap" style={{ marginLeft: sidebarW }}>
          <Navbar sidebarCollapsed={collapsed} />
          <main className="eb-content page-enter">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}