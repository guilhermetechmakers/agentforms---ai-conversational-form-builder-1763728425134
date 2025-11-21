import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, MessageSquare, TrendingUp, Users } from "lucide-react"
import type { Agent } from "@/types"

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  // Mock data - will be replaced with actual API calls
  const agents: Agent[] = []

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Top Bar */}
      <header className="border-b border-border bg-background-secondary px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link to="/agents/new">
              <Plus className="mr-2" />
              Create Agent
            </Link>
          </Button>
        </div>
      </header>

      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="animate-fade-in-up">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary">
                  Total Agents
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-accent-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-foreground-secondary mt-1">
                  Active agents
                </p>
              </CardContent>
            </Card>
            <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary">
                  Total Sessions
                </CardTitle>
                <Users className="h-4 w-4 text-accent-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-foreground-secondary mt-1">
                  All time
                </p>
              </CardContent>
            </Card>
            <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary">
                  Conversion Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-accent-yellow" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-foreground-secondary mt-1">
                  Completed sessions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Agents List */}
          {agents.length === 0 ? (
            <Card className="p-12 text-center animate-fade-in-up">
              <MessageSquare className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
              <p className="text-foreground-secondary mb-6">
                Create your first agent to start collecting data through conversations.
              </p>
              <Button asChild>
                <Link to="/agents/new">
                  <Plus className="mr-2" />
                  Create Your First Agent
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="card-hover animate-fade-in-up">
                  <CardHeader>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-secondary">
                        {agent.published ? "Published" : "Draft"}
                      </span>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
