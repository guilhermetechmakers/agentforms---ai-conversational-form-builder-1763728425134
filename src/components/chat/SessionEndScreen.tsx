import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Calendar } from "lucide-react"
import type { Agent } from "@/types/database/agents"

interface SessionEndScreenProps {
  agent?: Agent | null
  onDownload?: () => void
  onSchedule?: () => void
  thankYouMessage?: string
}

export function SessionEndScreen({
  onDownload,
  onSchedule,
  thankYouMessage,
}: SessionEndScreenProps) {
  const defaultMessage = thankYouMessage || "Thank you for your responses! We'll be in touch soon."

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 text-center space-y-6 animate-fade-in-up">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-accent-green/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-accent-green" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground-primary">
            All Done!
          </h2>
          <p className="text-foreground-secondary">{defaultMessage}</p>
        </div>
        <div className="flex flex-col gap-2 pt-4">
          {onDownload && (
            <Button variant="outline" onClick={onDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download My Data
            </Button>
          )}
          {onSchedule && (
            <Button onClick={onSchedule} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule a Follow-up
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
