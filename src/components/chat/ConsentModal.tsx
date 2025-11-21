import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface ConsentModalProps {
  open: boolean
  onConsent: (consented: boolean) => void
  privacyNotice?: string
}

export function ConsentModal({ open, onConsent, privacyNotice }: ConsentModalProps) {
  const [consented, setConsented] = useState(false)

  const handleContinue = () => {
    if (consented) {
      onConsent(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Privacy & Consent</DialogTitle>
          <DialogDescription>
            Before we begin, please review our privacy policy and provide your consent.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {privacyNotice && (
            <div className="text-sm text-foreground-secondary bg-background-primary rounded-lg p-4 max-h-48 overflow-y-auto">
              {privacyNotice}
            </div>
          )}
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consented}
              onCheckedChange={(checked) => setConsented(checked === true)}
            />
            <Label
              htmlFor="consent"
              className="text-sm text-foreground-primary cursor-pointer"
            >
              I agree to the privacy policy and consent to the collection and processing of my data.
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleContinue}
            disabled={!consented}
            className="w-full sm:w-auto"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
