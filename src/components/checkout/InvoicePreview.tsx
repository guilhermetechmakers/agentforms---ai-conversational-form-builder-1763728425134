import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { InvoiceCalculation } from '@/api/billing'

interface InvoicePreviewProps {
  calculation: InvoiceCalculation | null
  isLoading?: boolean
}

export function InvoicePreview({ calculation, isLoading }: InvoicePreviewProps) {
  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Invoice Preview</CardTitle>
          <CardDescription>Calculating...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-background-secondary rounded w-3/4"></div>
            <div className="h-4 bg-background-secondary rounded w-1/2"></div>
            <div className="h-4 bg-background-secondary rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!calculation) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Invoice Preview</CardTitle>
          <CardDescription>No calculation available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { subtotal, discount, tax, total, currency, breakdown } = calculation

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Invoice Preview</CardTitle>
        <CardDescription>Review your order summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-secondary">Plan Price</span>
            <span className="text-foreground-primary">
              {currency} {breakdown.planPrice.toFixed(2)}
            </span>
          </div>
          {breakdown.additionalSeats > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Additional Seats</span>
              <span className="text-foreground-primary">
                {currency} {breakdown.additionalSeats.toFixed(2)}
              </span>
            </div>
          )}
          {breakdown.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-accent-green">
              <span>Discount</span>
              <span>-{currency} {breakdown.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {breakdown.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Tax</span>
              <span className="text-foreground-primary">
                {currency} {breakdown.taxAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-2"></div>

        {/* Total */}
        <div className="flex justify-between items-baseline">
          <span className="text-base font-semibold text-foreground-primary">Total</span>
          <span className="text-2xl font-bold text-foreground-primary">
            {currency} {total.toFixed(2)}
          </span>
        </div>

        {/* Subtotal info */}
        {discount > 0 && (
          <div className="text-xs text-foreground-secondary pt-2 border-t border-border">
            Subtotal: {currency} {subtotal.toFixed(2)}
            {discount > 0 && ` - Discount: ${currency} ${discount.toFixed(2)}`}
            {tax > 0 && ` + Tax: ${currency} ${tax.toFixed(2)}`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
