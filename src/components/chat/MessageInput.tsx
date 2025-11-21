import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Paperclip } from "lucide-react"

interface MessageInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  showAttachment?: boolean
  onAttachmentClick?: () => void
}

export function MessageInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  showAttachment = false,
  onAttachmentClick,
}: MessageInputProps) {
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim() || isLoading || disabled) return
    onSend(input.trim())
    setInput("")
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border bg-background-secondary px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 items-end">
          {showAttachment && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onAttachmentClick}
              disabled={disabled || isLoading}
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
