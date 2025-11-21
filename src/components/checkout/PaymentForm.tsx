import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CreditCard, Loader2 } from 'lucide-react'

const billingFormSchema = z.object({
  // Card details (handled by Stripe Elements in production)
  cardName: z.string().min(1, 'Cardholder name is required'),
  
  // Billing address
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').max(2, 'Country code must be 2 letters'),
  
  // VAT
  vatNumber: z.string().optional(),
  
  // Terms
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service',
  }),
})

export type BillingFormData = z.infer<typeof billingFormSchema>

interface PaymentFormProps {
  onSubmit: (data: BillingFormData) => void
  isLoading?: boolean
  couponCode?: string
  onCouponChange?: (code: string) => void
}

export function PaymentForm({ onSubmit, isLoading, couponCode, onCouponChange }: PaymentFormProps) {
  const [showCouponInput, setShowCouponInput] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      acceptTerms: false,
    },
  })

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
        <CardDescription>Enter your payment and billing details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Coupon Code */}
          {showCouponInput || couponCode ? (
            <div className="space-y-2">
              <Label htmlFor="coupon">Coupon Code</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="Enter coupon code"
                  value={couponCode || ''}
                  onChange={(e) => onCouponChange?.(e.target.value)}
                  className="flex-1"
                />
                {couponCode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onCouponChange?.('')
                      setShowCouponInput(false)
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCouponInput(true)}
              className="text-sm"
            >
              Have a coupon code?
            </Button>
          )}

          {/* Card Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                {...register('cardName')}
                className={errors.cardName ? 'border-status-high' : ''}
              />
              {errors.cardName && (
                <p className="text-sm text-status-high">{errors.cardName.message}</p>
              )}
            </div>

            {/* Stripe Card Element will be inserted here */}
            <div className="space-y-2">
              <Label>Card Details</Label>
              <div className="rounded-lg border border-input bg-background-secondary p-4 min-h-[50px] flex items-center justify-center">
                <p className="text-sm text-foreground-secondary">
                  Stripe Elements will be integrated here
                </p>
              </div>
              <p className="text-xs text-foreground-secondary">
                Card details are securely processed by Stripe
              </p>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground-primary">Billing Address</h3>
            
            <div className="space-y-2">
              <Label htmlFor="line1">Address Line 1</Label>
              <Input
                id="line1"
                placeholder="123 Main Street"
                {...register('line1')}
                className={errors.line1 ? 'border-status-high' : ''}
              />
              {errors.line1 && (
                <p className="text-sm text-status-high">{errors.line1.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="line2">Address Line 2 (Optional)</Label>
              <Input
                id="line2"
                placeholder="Apartment, suite, etc."
                {...register('line2')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  {...register('city')}
                  className={errors.city ? 'border-status-high' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-status-high">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  {...register('state')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  placeholder="10001"
                  {...register('postal_code')}
                  className={errors.postal_code ? 'border-status-high' : ''}
                />
                {errors.postal_code && (
                  <p className="text-sm text-status-high">{errors.postal_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country Code</Label>
                <Input
                  id="country"
                  placeholder="US"
                  maxLength={2}
                  {...register('country')}
                  className={errors.country ? 'border-status-high' : ''}
                />
                {errors.country && (
                  <p className="text-sm text-status-high">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* VAT Number */}
          <div className="space-y-2">
            <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
            <Input
              id="vatNumber"
              placeholder="VAT123456789"
              {...register('vatNumber')}
            />
            <p className="text-xs text-foreground-secondary">
              Enter your VAT number if applicable
            </p>
          </div>

          {/* Terms of Service */}
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptTerms"
                {...register('acceptTerms')}
                className="mt-1"
              />
              <Label
                htmlFor="acceptTerms"
                className="text-sm cursor-pointer leading-relaxed"
              >
                I agree to the{' '}
                <a
                  href="/privacy-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-blue hover:underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-blue hover:underline"
                >
                  Privacy Policy
                </a>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-status-high">{errors.acceptTerms.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Complete Payment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
