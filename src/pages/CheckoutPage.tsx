import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePlan } from '@/hooks/usePlans'
import { useValidateCoupon } from '@/hooks/useCoupons'
import { useCalculateInvoice, useCreatePaymentIntent } from '@/hooks/useBilling'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { PlanSummary } from '@/components/checkout/PlanSummary'
import { PaymentForm } from '@/components/checkout/PaymentForm'
import { InvoicePreview } from '@/components/checkout/InvoicePreview'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PaymentIntentRequest } from '@/api/billing'
import type { BillingFormData } from '@/components/checkout/PaymentForm'
import type { BillingAddress } from '@/types/database/transactions'

export function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('planId')
  const billingCycle = (searchParams.get('cycle') || 'monthly') as 'monthly' | 'yearly'
  const additionalSeats = parseInt(searchParams.get('seats') || '0', 10)

  const { data: plan, isLoading: planLoading } = usePlan(planId)
  const validateCoupon = useValidateCoupon()
  const calculateInvoice = useCalculateInvoice()
  const createPaymentIntent = useCreatePaymentIntent()
  const createTransaction = useCreateTransaction()

  const [couponCode, setCouponCode] = useState('')
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null)
  const [invoiceCalculation, setInvoiceCalculation] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate invoice when plan or coupon changes
  useEffect(() => {
    if (plan && planId) {
      const request: PaymentIntentRequest = {
        planId,
        billingCycle,
        couponCode: validatedCoupon?.code || undefined,
        additionalSeats: additionalSeats > 0 ? additionalSeats : undefined,
      }

      calculateInvoice.mutate(request, {
        onSuccess: (data) => {
          setInvoiceCalculation(data)
        },
        onError: () => {
          // Fallback calculation if API fails
          const price = billingCycle === 'yearly' && plan.price_yearly 
            ? plan.price_yearly 
            : plan.price_monthly
          const seatCost = additionalSeats > 0 && plan.seat_pack_price 
            ? additionalSeats * plan.seat_pack_price 
            : 0
          const subtotal = price + seatCost
          const discount = validatedCoupon 
            ? validatedCoupon.discount_type === 'percentage'
              ? subtotal * (validatedCoupon.discount_value / 100)
              : validatedCoupon.discount_value
            : 0
          const total = subtotal - discount

          setInvoiceCalculation({
            subtotal,
            discount,
            tax: 0,
            total,
            currency: plan.currency,
            breakdown: {
              planPrice: price,
              additionalSeats: seatCost,
              discountAmount: discount,
              taxAmount: 0,
            },
          })
        },
      })
    }
  }, [plan, planId, billingCycle, additionalSeats, validatedCoupon])

  const handleCouponChange = async (code: string) => {
    setCouponCode(code)
    
    if (code.trim()) {
      validateCoupon.mutate(
        { code, planId: planId || undefined },
        {
          onSuccess: (coupon) => {
            if (coupon) {
              setValidatedCoupon(coupon)
            } else {
              setValidatedCoupon(null)
            }
          },
        }
      )
    } else {
      setValidatedCoupon(null)
    }
  }

  const handlePaymentSubmit = async (formData: BillingFormData) => {
    if (!plan || !planId) {
      toast.error('Please select a plan')
      return
    }

    setIsProcessing(true)

    try {
      // Create billing address
      const billingAddress: BillingAddress = {
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country.toUpperCase(),
      }

      // Create payment intent request
      const paymentRequest: PaymentIntentRequest = {
        planId,
        billingCycle,
        couponCode: validatedCoupon?.code || undefined,
        additionalSeats: additionalSeats > 0 ? additionalSeats : undefined,
        billingAddress,
        vatNumber: formData.vatNumber || undefined,
      }

      // Create payment intent
      const paymentIntent = await createPaymentIntent.mutateAsync(paymentRequest)

      // Extract payment intent ID from client secret
      const paymentIntentId = paymentIntent.clientSecret.includes('_secret_')
        ? paymentIntent.clientSecret.split('_secret_')[0]
        : paymentIntent.clientSecret

      // Create transaction record (user_id will be set by the API)
      const transaction = await createTransaction.mutateAsync({
        transaction_type: 'subscription',
        status: 'pending',
        plan_id: planId,
        amount: invoiceCalculation?.breakdown.planPrice || plan.price_monthly,
        currency: plan.currency,
        discount_amount: invoiceCalculation?.discount || 0,
        tax_amount: invoiceCalculation?.tax || 0,
        total_amount: invoiceCalculation?.total || plan.price_monthly,
        coupon_id: validatedCoupon?.id || null,
        coupon_code: validatedCoupon?.code || null,
        stripe_payment_intent_id: paymentIntentId,
        billing_cycle: billingCycle,
        additional_seats: additionalSeats,
        billing_address: billingAddress,
        vat_number: formData.vatNumber || null,
        tax_rate: 0, // Will be calculated by backend
      })

      // Navigate to success page with transaction ID
      navigate(`/checkout/success?transactionId=${transaction.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment')
      setIsProcessing(false)
    }
  }

  if (planLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-blue" />
          <p className="text-foreground-secondary">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!plan && planId) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Plan Not Found</h1>
          <p className="text-foreground-secondary">
            The selected plan could not be found. Please select a plan to continue.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="border-b border-border bg-background-secondary px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              isLoading={isProcessing}
              couponCode={couponCode}
              onCouponChange={handleCouponChange}
            />
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <PlanSummary
              plan={plan || null}
              billingCycle={billingCycle}
              additionalSeats={additionalSeats}
              seatPackPrice={plan?.seat_pack_price || undefined}
            />
            <InvoicePreview
              calculation={invoiceCalculation}
              isLoading={calculateInvoice.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
