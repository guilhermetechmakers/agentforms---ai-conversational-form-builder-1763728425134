import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Search } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-12 text-center animate-fade-in-up">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-foreground-secondary mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <Search className="mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
