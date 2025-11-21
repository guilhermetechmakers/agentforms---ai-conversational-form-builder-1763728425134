import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, Zap, Shield, BarChart3, ArrowRight } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent-yellow to-accent-blue bg-clip-text text-transparent">
              Build AI-Powered Conversational Forms
            </h1>
            <p className="text-xl md:text-2xl text-foreground-secondary mb-8 max-w-3xl mx-auto">
              Create intelligent agents that collect structured data through natural conversations. 
              Share a link, start collecting insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 md:px-12 bg-background-secondary">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 card-hover animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-12 h-12 rounded-lg bg-accent-blue/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground-secondary">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <Card className="p-12 bg-gradient-to-br from-background-secondary to-background-primary">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-foreground-secondary mb-8">
              Join thousands of teams using AgentForms to collect better data through conversation.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/signup">
                Create Your First Agent
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-foreground-secondary">© 2024 AgentForms. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy-terms" className="text-foreground-secondary hover:text-foreground-primary transition-colors">
                Privacy & Terms
              </Link>
              <Link to="/help" className="text-foreground-secondary hover:text-foreground-primary transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: MessageSquare,
    title: "Conversational Interface",
    description: "Engage users with natural, AI-driven conversations that feel human, not robotic."
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Create and publish your agent in minutes. No coding required."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade security with data encryption and privacy controls."
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track conversions, analyze responses, and export data in multiple formats."
  },
  {
    icon: MessageSquare,
    title: "Custom Branding",
    description: "Match your brand with custom colors, logos, and welcome messages."
  },
  {
    icon: Zap,
    title: "Webhook Integration",
    description: "Automatically forward responses to your systems via webhooks."
  },
]
