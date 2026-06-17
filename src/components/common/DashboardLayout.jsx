import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? 68 : 240

  return (
    <>
      <style>{`
        .eb-layout {
          min-height: 100vh;
          background: var(--eb-slate-bg);
        }
        .eb-content-wrap {
          padding-top: var(--eb-navbar-h);
          transition: margin-left .22s cubic-bezier(.4,0,.2,1);
        }
        .eb-content {
          padding: 28px 28px 40px;
          min-height: calc(100vh - var(--eb-navbar-h));
        }
        @media (max-width: 768px) {
          .eb-content { padding: 16px; }
        }
      `}</style>

      <div className="eb-layout">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
        />
        <Navbar sidebarCollapsed={collapsed} />

        <main
          className="eb-content-wrap"
          style={{ marginLeft: sidebarW }}
        >
          <div className="eb-content page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
