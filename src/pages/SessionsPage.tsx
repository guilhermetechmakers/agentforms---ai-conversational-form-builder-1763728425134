import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Eye } from "lucide-react"
import type { Session } from "@/types"

export function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  // Mock data - will be replaced with actual API calls
  const sessions: Session[] = []

  return (
    <div className="min-h-screen bg-background-primary p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Sessions</h1>
          <p className="text-foreground-secondary">
            View and manage all conversation sessions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card className="p-12 text-center animate-fade-in-up">
            <p className="text-foreground-secondary mb-4">
              No sessions yet. Sessions will appear here once visitors start conversations with your agents.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="card-hover animate-fade-in-up">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Session {session.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        Started {new Date(session.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      session.status === 'completed' 
                        ? 'bg-accent-green/10 text-accent-green'
                        : session.status === 'in-progress'
                        ? 'bg-accent-blue/10 text-accent-blue'
                        : 'bg-foreground-secondary/10 text-foreground-secondary'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
