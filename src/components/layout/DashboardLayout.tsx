import { Sidebar } from "./Sidebar"
import { Outlet } from "react-router-dom"

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-300 ml-64">
        <Outlet />
      </main>
    </div>
  )
}
