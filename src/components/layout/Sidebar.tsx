import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Webhook,
  FileText,
  Users,
  ChevronRight,
  HelpCircle
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Agents", href: "/agents", icon: MessageSquare },
      { title: "Sessions", href: "/sessions", icon: FileText },
    ],
  },
  {
    title: "Integrations",
    items: [
      { title: "Webhooks", href: "/webhooks", icon: Webhook },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Team", href: "/team", icon: Users },
    ],
  },
  {
    items: [
      { title: "Help & Support", href: "/help", icon: HelpCircle },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background-primary border-r border-border transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b border-border px-6">
          {!collapsed && (
            <h2 className="text-xl font-bold">AgentForms</h2>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {group.title && !collapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.href || 
                  location.pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent-yellow/10 text-foreground-primary border-l-4 border-accent-yellow"
                        : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground-primary"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="rounded-full bg-accent-blue px-2 py-0.5 text-xs">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm text-foreground-secondary hover:bg-background-secondary transition-colors"
          >
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span className="ml-2">Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
