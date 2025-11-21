import { useState, useMemo } from "react"
import { Search, HelpCircle, BookOpen, MessageSquare, ExternalLink, FileText, Sparkles, Mail, Github, Code, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDocumentationSearch } from "@/hooks/useDocumentation"
import { useFAQs, useIncrementFAQHelpful } from "@/hooks/useFAQs"
import { useSamplePrompts } from "@/hooks/useSamplePrompts"
import { useCreateSupportTicket } from "@/hooks/useSupportTickets"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import type { DocumentationCategory } from "@/types/database/documentation"
import type { FAQCategory } from "@/types/database/faqs"
import type { PromptType } from "@/types/database/sample-prompts"

// Support ticket form schema
const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  session_id: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
})

type SupportTicketForm = z.infer<typeof supportTicketSchema>

export function AboutHelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<DocumentationCategory | "all">("all")
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<FAQCategory | "all">("all")
  const [selectedPromptType, setSelectedPromptType] = useState<PromptType | "all">("all")
  const [supportDialogOpen, setSupportDialogOpen] = useState(false)

  // Documentation search
  const { data: docsData, isLoading: docsLoading } = useDocumentationSearch(
    searchQuery || undefined,
    selectedCategory !== "all" ? selectedCategory : undefined,
    !!searchQuery || selectedCategory !== "all"
  )

  // FAQs
  const { data: faqs = [], isLoading: faqsLoading } = useFAQs(
    selectedFAQCategory !== "all" ? selectedFAQCategory : undefined
  )

  // Sample prompts
  const { data: samplePrompts = [], isLoading: promptsLoading } = useSamplePrompts(
    selectedPromptType !== "all" ? selectedPromptType : undefined
  )

  // Support ticket mutation
  const createTicket = useCreateSupportTicket()
  const incrementHelpful = useIncrementFAQHelpful()

  // Support ticket form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupportTicketForm>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      priority: "medium",
    },
  })

  const onSubmitSupportTicket = async (data: SupportTicketForm) => {
    try {
      await createTicket.mutateAsync({
        subject: data.subject,
        description: data.description,
        session_id: data.session_id || null,
        priority: data.priority,
      })
      reset()
      setSupportDialogOpen(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleFAQHelpful = async (id: string) => {
    try {
      await incrementHelpful.mutateAsync(id)
      toast.success("Thank you for your feedback!")
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Filtered documentation
  const filteredDocs = useMemo(() => {
    if (!docsData?.data) return []
    return docsData.data
  }, [docsData])

  // Documentation categories
  const docCategories: { value: DocumentationCategory | "all"; label: string }[] = [
    { value: "all", label: "All Categories" },
    { value: "getting-started", label: "Getting Started" },
    { value: "agents", label: "Agents" },
    { value: "webhooks", label: "Webhooks" },
    { value: "exports", label: "Exports" },
    { value: "privacy", label: "Privacy" },
    { value: "api", label: "API" },
    { value: "integrations", label: "Integrations" },
  ]

  // FAQ categories
  const faqCategories: { value: FAQCategory | "all"; label: string }[] = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "agents", label: "Agents" },
    { value: "sessions", label: "Sessions" },
    { value: "webhooks", label: "Webhooks" },
    { value: "billing", label: "Billing" },
    { value: "technical", label: "Technical" },
  ]

  // Prompt types
  const promptTypes: { value: PromptType | "all"; label: string }[] = [
    { value: "all", label: "All Types" },
    { value: "persona", label: "Personas" },
    { value: "field-phrasing", label: "Field Phrasing" },
    { value: "welcome-message", label: "Welcome Messages" },
    { value: "validation", label: "Validation" },
  ]

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="border-b border-border bg-background-secondary px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-2">About & Help</h1>
          <p className="text-foreground-secondary">
            Find answers, explore documentation, and get support
          </p>
        </div>
      </header>

      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Searchable Documentation Section */}
          <section className="animate-fade-in-up">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-6 w-6 text-accent-blue" />
                <h2 className="text-2xl font-semibold">Documentation</h2>
              </div>
              <p className="text-foreground-secondary mb-6">
                Search our comprehensive guides and tutorials
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-secondary" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as DocumentationCategory | "all")}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {docCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Documentation Results */}
            {docsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-background-secondary rounded w-3/4 mb-2" />
                      <div className="h-3 bg-background-secondary rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-background-secondary rounded w-full mb-2" />
                      <div className="h-3 bg-background-secondary rounded w-5/6" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDocs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map((doc, index) => (
                  <Card
                    key={doc.id}
                    className="card-hover animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-accent-blue/10 text-accent-blue">
                          {doc.category}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground-secondary line-clamp-3 mb-4">
                        {doc.content.substring(0, 150)}...
                      </p>
                      <Button variant="ghost" size="sm" className="w-full">
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No documentation found</h3>
                <p className="text-foreground-secondary">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Select a category or search to view documentation"}
                </p>
              </Card>
            )}
          </section>

          {/* FAQ Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="h-6 w-6 text-accent-yellow" />
                <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
              </div>
              <p className="text-foreground-secondary mb-6">
                Quick answers to common questions
              </p>
            </div>

            {/* FAQ Category Filter */}
            <div className="mb-6">
              <Select
                value={selectedFAQCategory}
                onValueChange={(value) => setSelectedFAQCategory(value as FAQCategory | "all")}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {faqCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* FAQ Accordion */}
            {faqsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-background-secondary rounded w-3/4" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : faqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border border-border rounded-lg px-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-foreground-secondary mb-4 whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFAQHelpful(faq.id)}
                            className="text-xs"
                          >
                            Helpful ({faq.helpful_count})
                          </Button>
                          {faq.category && (
                            <span className="px-2 py-1 text-xs rounded-full bg-accent-yellow/10 text-accent-yellow">
                              {faq.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card className="p-12 text-center">
                <HelpCircle className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No FAQs found</h3>
                <p className="text-foreground-secondary">
                  Try selecting a different category
                </p>
              </Card>
            )}
          </section>

          {/* Sample Prompt Library Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-accent-pink" />
                <h2 className="text-2xl font-semibold">Sample Prompt Library</h2>
              </div>
              <p className="text-foreground-secondary mb-6">
                Browse persona examples and field phrasing templates
              </p>
            </div>

            {/* Prompt Type Filter */}
            <div className="mb-6">
              <Select
                value={selectedPromptType}
                onValueChange={(value) => setSelectedPromptType(value as PromptType | "all")}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {promptTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sample Prompts Grid */}
            {promptsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-background-secondary rounded w-3/4 mb-2" />
                      <div className="h-3 bg-background-secondary rounded w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : samplePrompts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {samplePrompts.map((prompt, index) => (
                  <Card
                    key={prompt.id}
                    className="card-hover animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{prompt.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-accent-pink/10 text-accent-pink">
                          {prompt.prompt_type}
                        </span>
                        {prompt.category && (
                          <span className="px-2 py-1 text-xs rounded-full bg-accent-blue/10 text-accent-blue">
                            {prompt.category}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {prompt.description && (
                        <p className="text-sm text-foreground-secondary mb-4 line-clamp-2">
                          {prompt.description}
                        </p>
                      )}
                      <div className="bg-background-primary rounded-lg p-3 mb-4">
                        <p className="text-xs text-foreground-secondary font-mono line-clamp-4">
                          {prompt.content}
                        </p>
                      </div>
                      {prompt.example_usage && (
                        <details className="mb-4">
                          <summary className="text-sm text-accent-blue cursor-pointer mb-2">
                            Example Usage
                          </summary>
                          <p className="text-xs text-foreground-secondary whitespace-pre-wrap">
                            {prompt.example_usage}
                          </p>
                        </details>
                      )}
                      <Button variant="ghost" size="sm" className="w-full">
                        Copy Prompt
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No sample prompts found</h3>
                <p className="text-foreground-secondary">
                  Try selecting a different type
                </p>
              </Card>
            )}
          </section>

          {/* Support Contact Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-accent-green" />
                <h2 className="text-2xl font-semibold">Contact Support</h2>
              </div>
              <p className="text-foreground-secondary mb-6">
                Need help? Submit a support ticket or reach out to our team
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Support Ticket Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Ticket</CardTitle>
                  <CardDescription>
                    Describe your issue and we'll get back to you soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Create Support Ticket
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Support Ticket</DialogTitle>
                        <DialogDescription>
                          Fill out the form below and we'll respond as soon as possible
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit(onSubmitSupportTicket)} className="space-y-4">
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            {...register("subject")}
                            placeholder="Brief description of your issue"
                            className="mt-1"
                          />
                          {errors.subject && (
                            <p className="text-sm text-status-high mt-1">{errors.subject.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Please provide as much detail as possible..."
                            rows={6}
                            className="mt-1"
                          />
                          {errors.description && (
                            <p className="text-sm text-status-high mt-1">{errors.description.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="session_id">Session ID (Optional)</Label>
                          <Input
                            id="session_id"
                            {...register("session_id")}
                            placeholder="Paste session ID for context"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setSupportDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Ticket"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>
                    Additional resources and support channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="mailto:support@agentforms.com" target="_blank" rel="noopener noreferrer">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Support
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="https://discord.gg/agentforms" target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Discord Community
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="https://github.com/agentforms/docs" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub Documentation
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Community Links Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="h-6 w-6 text-accent-green" />
                <h2 className="text-2xl font-semibold">Community & Resources</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="card-hover">
                <CardHeader>
                  <FileText className="h-8 w-8 text-accent-blue mb-2" />
                  <CardTitle>Changelog</CardTitle>
                  <CardDescription>
                    Stay updated with the latest features and improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" asChild>
                    <a href="/changelog" target="_blank" rel="noopener noreferrer">
                      View Changelog <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <Code className="h-8 w-8 text-accent-yellow mb-2" />
                  <CardTitle>API Reference</CardTitle>
                  <CardDescription>
                    Complete API documentation for developers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" asChild>
                    <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                      View API Docs <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <Rocket className="h-8 w-8 text-accent-pink mb-2" />
                  <CardTitle>Roadmap</CardTitle>
                  <CardDescription>
                    See what's coming next and vote on features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" asChild>
                    <a href="/roadmap" target="_blank" rel="noopener noreferrer">
                      View Roadmap <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
