import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Share2, QrCode, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import type { Agent } from "@/types/database/agents"

interface MinimizedBrandingFooterProps {
  agent: Agent | null
  className?: string
}

export function MinimizedBrandingFooter({ agent, className }: MinimizedBrandingFooterProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = agent?.public_url
    ? `${window.location.origin}/chat/${agent.public_url}`
    : window.location.href

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <>
      <div className={`flex items-center justify-between px-4 py-2 border-t border-border bg-background-secondary ${className}`}>
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <span>Powered by</span>
          <span className="font-semibold text-foreground-primary">AgentForms</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShareDialog(true)}
          className="h-8 text-xs"
        >
          <Share2 className="h-3 w-3 mr-1" />
          Share
        </Button>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this chat</DialogTitle>
            <DialogDescription>
              Share this conversation link with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-center pt-4">
              {/* QR Code would be generated here - placeholder for now */}
              <div className="h-32 w-32 bg-background-primary rounded-lg flex items-center justify-center border border-border">
                <QrCode className="h-12 w-12 text-foreground-secondary" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
