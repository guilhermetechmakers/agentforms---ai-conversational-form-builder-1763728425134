import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Field } from "@/types"
import type { FieldValue } from "@/types/database/field-values"

interface SessionProgressIndicatorProps {
  fields: Field[]
  fieldValues: FieldValue[]
  className?: string
}

export function SessionProgressIndicator({
  fields,
  fieldValues,
  className,
}: SessionProgressIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  // Calculate progress
  const requiredFields = fields.filter((f) => f.required)
  const completedFields = requiredFields.filter((field) =>
    fieldValues.some((fv) => fv.field_key === field.key && fv.validated)
  )
  const progress = requiredFields.length > 0 
    ? (completedFields.length / requiredFields.length) * 100 
    : 100

  const remainingFields = requiredFields.filter(
    (field) => !fieldValues.some((fv) => fv.field_key === field.key && fv.validated)
  )

  if (!isVisible) return null

  return (
    <Card className={cn("p-4 space-y-3 animate-fade-in", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground-primary">
            Progress
          </h3>
          <span className="text-xs text-foreground-secondary">
            {completedFields.length} / {requiredFields.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      {isExpanded && remainingFields.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-border">
          <p className="text-xs text-foreground-secondary mb-2">Still needed:</p>
          <ul className="space-y-1">
            {remainingFields.map((field) => (
              <li key={field.id} className="text-xs text-foreground-secondary">
                • {field.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
