import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import type { Agent } from "@/types/database/agents"

interface WelcomeBannerProps {
  agent: Agent | null
  isLoading?: boolean
}

export function WelcomeBanner({ agent, isLoading }: WelcomeBannerProps) {
  if (isLoading || !agent) {
    return (
      <Card className="border-b border-border rounded-none rounded-t-xl bg-background-secondary p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-background-primary animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-background-primary rounded animate-pulse" />
              <div className="h-4 w-64 bg-background-primary rounded animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const visuals = agent.visuals || {}
  const persona = agent.persona as { welcome_message?: string } | null
  const welcomeMessage = persona?.welcome_message || `Welcome! I'm ${agent.name}. How can I help you today?`

  return (
    <Card className="border-b border-border rounded-none rounded-t-xl bg-background-secondary p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          {visuals.avatar_url ? (
            <Avatar className="h-12 w-12">
              <AvatarImage src={visuals.avatar_url} alt={agent.name} />
              <AvatarFallback>{agent.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-12 w-12">
              <AvatarFallback>{agent.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground-primary mb-1">
              {agent.name}
            </h1>
            <p className="text-sm text-foreground-secondary">{welcomeMessage}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
