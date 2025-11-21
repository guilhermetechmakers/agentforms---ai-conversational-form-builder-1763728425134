import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import type { Plan } from '@/types/database/plans'

interface PlanSummaryProps {
  plan: Plan | null
  billingCycle: 'monthly' | 'yearly'
  additionalSeats?: number
  seatPackPrice?: number
}

export function PlanSummary({ plan, billingCycle, additionalSeats = 0, seatPackPrice }: PlanSummaryProps) {
  if (!plan) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Plan Summary</CardTitle>
          <CardDescription>No plan selected</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const price = billingCycle === 'yearly' && plan.price_yearly 
    ? plan.price_yearly 
    : plan.price_monthly

  const seatCost = additionalSeats > 0 && seatPackPrice 
    ? additionalSeats * seatPackPrice 
    : 0

  const features = Array.isArray(plan.features) 
    ? plan.features 
    : Object.entries(plan.features || {}).map(([key, value]) => ({
        name: key,
        value: value,
      }))

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description || 'Selected plan'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-foreground-secondary">Plan Price</span>
            <span className="text-lg font-semibold">
              ${price.toFixed(2)}/{billingCycle === 'yearly' ? 'year' : 'month'}
            </span>
          </div>
          {additionalSeats > 0 && seatCost > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-foreground-secondary">
                Additional Seats ({additionalSeats})
              </span>
              <span className="text-sm font-medium">${seatCost.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground-primary">Features</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => {
                const featureName = typeof feature === 'string' 
                  ? feature 
                  : feature.name || String(feature.value)
                const featureValue = typeof feature === 'object' 
                  ? feature.value 
                  : null

                return (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground-secondary">
                      {featureName}
                      {typeof featureValue === 'number' && (
                        <span className="ml-1 font-medium text-foreground-primary">
                          ({featureValue})
                        </span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Limits */}
        {plan.limits && Object.keys(plan.limits).length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground-primary">Limits</h4>
            <div className="space-y-1.5">
              {Object.entries(plan.limits).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-foreground-secondary capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-medium text-foreground-primary">
                    {typeof value === 'number' ? value.toLocaleString() : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
