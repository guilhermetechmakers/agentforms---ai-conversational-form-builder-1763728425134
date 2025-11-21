import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Home, 
  Search, 
  ArrowRight, 
  HelpCircle, 
  FileText,
  MessageSquare,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { useDocumentationSearch } from "@/hooks/useDocumentation"
import { toast } from "sonner"
import type { Documentation } from "@/types/database/documentation"

export function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Search documentation when query is provided and dialog is open
  const { data: searchResults, isLoading: isSearchLoading } = useDocumentationSearch(
    searchQuery.trim() || undefined,
    undefined,
    isSearchOpen && !!searchQuery.trim()
  )

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setHasSearched(true)
      setIsSearchOpen(true)
    } else {
      toast.error("Please enter a search query")
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.trim() && hasSearched) {
      setIsSearchOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Header with Logo/Home Link */}
        <div className="mb-8 animate-fade-in-down">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground-primary transition-colors"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-lg font-semibold">AgentForms</span>
          </Link>
        </div>

        {/* Main Error Card */}
        <Card className="w-full mb-8 animate-fade-in-up shadow-card">
          <CardHeader className="text-center pb-4">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-status-high/10 mb-4 animate-bounce-in">
                <AlertCircle className="h-12 w-12 text-status-high" />
              </div>
            </div>
            <CardTitle className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent-yellow to-accent-blue bg-clip-text text-transparent">
              404
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl text-foreground-primary font-semibold mb-2">
              Page Not Found
            </CardDescription>
            <p className="text-base md:text-lg text-foreground-secondary max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, we'll help you find what you need.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Field */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-secondary" />
                <Input
                  type="text"
                  placeholder="Search for agents, documentation, or help articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 h-12 text-base"
                  onFocus={() => {
                    if (searchQuery.trim() && hasSearched) {
                      setIsSearchOpen(true)
                    }
                  }}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={isSearchLoading}
              >
                <Search className="mr-2 h-4 w-4" />
                {isSearchLoading ? "Searching..." : "Search"}
              </Button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                asChild 
                size="lg" 
                className="flex-1 btn-primary"
              >
                <Link to="/dashboard">
                  <Home className="mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="flex-1"
              >
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Contact Support Link */}
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-foreground-secondary text-center mb-4">
                Need more help?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  variant="ghost"
                  className="text-foreground-secondary hover:text-foreground-primary"
                >
                  <Link to="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Visit Help Center
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-foreground-secondary hover:text-foreground-primary"
                >
                  <Link to="/help#contact">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Support
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card className="w-full animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
            <CardDescription>
              Popular pages you might be looking for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background-secondary hover:bg-background-primary hover:border-accent-blue/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center group-hover:bg-accent-blue/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-accent-blue" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Dashboard</p>
                  <p className="text-xs text-foreground-secondary">View your agents</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground-secondary group-hover:text-accent-blue group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                to="/agents/new"
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background-secondary hover:bg-background-primary hover:border-accent-yellow/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-yellow/10 flex items-center justify-center group-hover:bg-accent-yellow/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-accent-yellow" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Create Agent</p>
                  <p className="text-xs text-foreground-secondary">Build a new form</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground-secondary group-hover:text-accent-yellow group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                to="/help"
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background-secondary hover:bg-background-primary hover:border-accent-green/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center group-hover:bg-accent-green/20 transition-colors">
                  <FileText className="h-5 w-5 text-accent-green" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Documentation</p>
                  <p className="text-xs text-foreground-secondary">Guides and tutorials</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground-secondary group-hover:text-accent-green group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background-secondary hover:bg-background-primary hover:border-accent-pink/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-pink/10 flex items-center justify-center group-hover:bg-accent-pink/20 transition-colors">
                  <HelpCircle className="h-5 w-5 text-accent-pink" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Settings</p>
                  <p className="text-xs text-foreground-secondary">Account preferences</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground-secondary group-hover:text-accent-pink group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Results Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
            <DialogDescription>
              {searchQuery && `Results for "${searchQuery}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isSearchLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
              </div>
            ) : searchResults && searchResults.data.length > 0 ? (
              <div className="space-y-3">
                {searchResults.data.map((result: Documentation) => {
                  // Extract a summary from content (first 150 chars)
                  const summary = result.content 
                    ? result.content.replace(/[#*`]/g, '').substring(0, 150).trim() + '...'
                    : undefined
                  
                  return (
                    <Link
                      key={result.id}
                      to={`/help#${result.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="block p-4 rounded-lg border border-border bg-background-secondary hover:bg-background-primary hover:border-accent-blue/50 transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 group-hover:text-accent-blue transition-colors">
                            {result.title}
                          </h4>
                          {summary && (
                            <p className="text-xs text-foreground-secondary line-clamp-2">
                              {summary}
                            </p>
                          )}
                          {result.category && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-md bg-accent-blue/10 text-accent-blue">
                              {result.category}
                            </span>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-foreground-secondary group-hover:text-accent-blue transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : searchQuery && hasSearched ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-foreground-secondary mx-auto mb-4 opacity-50" />
                <p className="text-foreground-secondary mb-2">No results found</p>
                <p className="text-sm text-foreground-secondary/70">
                  Try adjusting your search terms or browse our{" "}
                  <Link
                    to="/help"
                    className="text-accent-blue hover:underline"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    help center
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
