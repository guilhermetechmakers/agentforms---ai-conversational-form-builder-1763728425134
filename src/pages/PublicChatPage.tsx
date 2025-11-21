import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import type { Message } from "@/types"

export function PublicChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      session_id: "session-1",
      role: "visitor",
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages([...messages, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: `msg-${Date.now()}`,
        session_id: "session-1",
        role: "agent",
        content: "Thank you for your response! How can I help you further?",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, agentMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* Welcome Banner */}
      <div className="bg-background-secondary border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Welcome to AgentForms</h1>
          <p className="text-foreground-secondary">
            I'm here to help you. Let's start a conversation!
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <Card className="p-8 text-center animate-fade-in-up">
              <p className="text-foreground-secondary">
                Start the conversation by sending a message below.
              </p>
            </Card>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "visitor" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "visitor"
                    ? "bg-accent-blue text-white"
                    : "bg-background-secondary text-foreground-primary"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-background-secondary rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background-secondary px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
