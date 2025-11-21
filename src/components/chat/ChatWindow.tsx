import { useEffect, useRef } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { Message } from "@/types/database/messages"
import type { Agent } from "@/types/database/agents"

interface ChatWindowProps {
  messages: Message[]
  agent: Agent | null
  isLoading?: boolean
  isTyping?: boolean
}

export function ChatWindow({ messages, agent, isLoading, isTyping }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center animate-fade-in">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-foreground-secondary" />
            <p className="text-foreground-secondary">Loading conversation...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center animate-fade-in">
            <p className="text-foreground-secondary">
              Start the conversation by sending a message below.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  const visuals = agent?.visuals || {}

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "visitor" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {message.role === "agent" && (
              <Avatar className="h-8 w-8 shrink-0">
                {visuals.avatar_url ? (
                  <AvatarImage src={visuals.avatar_url} alt="Agent" />
                ) : (
                  <AvatarFallback>
                    {agent?.name.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            <div
              className={`flex flex-col max-w-[80%] ${
                message.role === "visitor" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === "visitor"
                    ? "bg-accent-blue text-white"
                    : "bg-background-secondary text-foreground-primary border border-border"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <p className="text-xs text-foreground-secondary mt-1 px-1">
                {format(new Date(message.created_at), "HH:mm")}
              </p>
            </div>
            {message.role === "visitor" && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-accent-pink">V</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 justify-start animate-fade-in-up">
            {agent && (
              <Avatar className="h-8 w-8 shrink-0">
                {visuals.avatar_url ? (
                  <AvatarImage src={visuals.avatar_url} alt="Agent" />
                ) : (
                  <AvatarFallback>
                    {agent.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            <div className="bg-background-secondary rounded-lg px-4 py-2 border border-border">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-foreground-secondary rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="h-2 w-2 bg-foreground-secondary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="h-2 w-2 bg-foreground-secondary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
