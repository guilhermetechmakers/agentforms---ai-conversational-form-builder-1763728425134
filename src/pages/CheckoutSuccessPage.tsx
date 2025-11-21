import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTransaction } from '@/hooks/useTransactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function CheckoutSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('transactionId')

  const { data: transaction, isLoading } = useTransaction(transactionId)

  useEffect(() => {
    if (!transactionId) {
      toast.error('Invalid transaction ID')
      navigate('/dashboard')
    }
  }, [transactionId, navigate])

  const handleDownloadInvoice = async () => {
    if (!transaction) return

    try {
      // In production, this would fetch the invoice URL from the API
      toast.info('Invoice download will be available after backend integration')
      // const { url } = await billingApi.getInvoiceUrl(transaction.id)
      // window.open(url, '_blank')
    } catch (error: any) {
      toast.error(`Failed to download invoice: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-blue" />
          <p className="text-foreground-secondary">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Transaction Not Found</h1>
          <p className="text-foreground-secondary">
            The transaction could not be found. Please contact support if you believe this is an error.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="border-b border-border bg-background-secondary px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Payment Successful</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="space-y-6">
          {/* Success Message */}
          <Card className="animate-fade-in-up border-accent-green/20 bg-accent-green/5">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-accent-green/20 p-4">
                  <CheckCircle2 className="h-12 w-12 text-accent-green" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground-primary">
                    Payment Confirmed!
                  </h2>
                  <p className="text-foreground-secondary">
                    Your subscription has been successfully activated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>Your payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground-secondary">Transaction ID</p>
                  <p className="font-mono text-sm text-foreground-primary">
                    {transaction.id.slice(0, 8)}...
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Status</p>
                  <p className="text-sm font-semibold text-accent-green capitalize">
                    {transaction.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Amount</p>
                  <p className="text-lg font-bold text-foreground-primary">
                    {transaction.currency} {transaction.total_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Date</p>
                  <p className="text-sm text-foreground-primary">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {transaction.coupon_code && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-foreground-secondary">Coupon Applied</p>
                  <p className="text-sm font-medium text-foreground-primary">
                    {transaction.coupon_code}
                    {transaction.discount_amount > 0 && (
                      <span className="ml-2 text-accent-green">
                        (-{transaction.currency} {transaction.discount_amount.toFixed(2)})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-1">✓</span>
                  <span>Your subscription is now active</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-1">✓</span>
                  <span>You can start creating agents and collecting data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-1">✓</span>
                  <span>Check your email for a receipt and welcome information</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
