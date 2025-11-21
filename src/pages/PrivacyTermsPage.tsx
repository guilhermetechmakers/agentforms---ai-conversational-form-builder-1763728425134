import { useState, useEffect, useRef } from "react"
import { FileText, Shield, Cookie, Mail, ArrowUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLegalDocument } from "@/hooks/useLegalDocuments"
import { useCreateLegalRequest } from "@/hooks/useLegalRequests"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { RequestType } from "@/types/database/legal-requests"

// Legal request form schema
const legalRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  request_type: z.enum(["data-deletion", "data-export", "data-inquiry", "privacy-inquiry", "other"]),
  message: z.string().min(20, "Message must be at least 20 characters"),
})

type LegalRequestForm = z.infer<typeof legalRequestSchema>

export function PrivacyTermsPage() {
  const [activeSection, setActiveSection] = useState<string>("privacy-policy")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  
  const privacyRef = useRef<HTMLDivElement>(null)
  const termsRef = useRef<HTMLDivElement>(null)
  const cookieRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  // Fetch legal documents
  const { data: privacyDoc, isLoading: privacyLoading } = useLegalDocument("privacy-policy")
  const { data: termsDoc, isLoading: termsLoading } = useLegalDocument("terms-of-service")
  const { data: cookieDoc, isLoading: cookieLoading } = useLegalDocument("cookie-policy")

  // Legal request mutation
  const createRequest = useCreateLegalRequest()

  // Form handling
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LegalRequestForm>({
    resolver: zodResolver(legalRequestSchema),
    defaultValues: {
      request_type: "privacy-inquiry",
    },
  })

  const onSubmitLegalRequest = async (data: LegalRequestForm) => {
    try {
      await createRequest.mutateAsync({
        name: data.name,
        email: data.email,
        request_type: data.request_type as RequestType,
        message: data.message,
      })
      reset()
      setFormSubmitted(true)
      setTimeout(() => setFormSubmitted(false), 5000)
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Scroll to section
  const scrollToSection = (section: string) => {
    setActiveSection(section)
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      "privacy-policy": privacyRef,
      "terms-of-service": termsRef,
      "cookie-policy": cookieRef,
      "contact": contactRef,
    }
    const ref = refs[section]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Default content if documents are not loaded
  const defaultPrivacyContent = `# Privacy Policy

Last Updated: ${new Date().toLocaleDateString()}

## 1. Information We Collect

We collect information that you provide directly to us, including:
- Account information (name, email address, password)
- Agent configuration and form data
- Session data and conversation history
- Payment and billing information

## 2. How We Use Your Information

We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices and support messages
- Respond to your comments and questions
- Monitor and analyze usage patterns

## 3. Information Sharing

We do not sell, trade, or rent your personal information. We may share your information:
- With service providers who assist us in operating our platform
- When required by law or to protect our rights
- In connection with a business transfer

## 4. Data Security

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 5. Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Object to processing of your data
- Data portability

## 6. Data Retention

We retain your information for as long as necessary to provide our services and comply with legal obligations.

## 7. Contact Us

For privacy-related questions, please use the contact form below or email us at privacy@agentforms.com.`

  const defaultTermsContent = `# Terms of Service

Last Updated: ${new Date().toLocaleDateString()}

## 1. Acceptance of Terms

By accessing and using AgentForms, you accept and agree to be bound by these Terms of Service.

## 2. Description of Service

AgentForms is an AI-powered conversational form builder that allows users to create, configure, and share interactive form agents.

## 3. User Accounts

You are responsible for:
- Maintaining the confidentiality of your account credentials
- All activities that occur under your account
- Ensuring your account information is accurate and up-to-date

## 4. Acceptable Use

You agree not to:
- Use the service for any illegal purpose
- Violate any applicable laws or regulations
- Infringe on intellectual property rights
- Transmit harmful code or malware
- Attempt to gain unauthorized access to the service

## 5. Intellectual Property

All content, features, and functionality of the service are owned by AgentForms and are protected by copyright, trademark, and other intellectual property laws.

## 6. Payment Terms

- Subscription fees are billed in advance
- All fees are non-refundable unless otherwise stated
- We reserve the right to change pricing with 30 days notice

## 7. Limitation of Liability

AgentForms shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.

## 8. Termination

We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms.

## 9. Changes to Terms

We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.

## 10. Contact Information

For questions about these Terms, please contact us at legal@agentforms.com.`

  const defaultCookieContent = `# Cookie Policy

Last Updated: ${new Date().toLocaleDateString()}

## 1. What Are Cookies

Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience.

## 2. Types of Cookies We Use

### Essential Cookies
These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.

### Analytics Cookies
We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience.

### Functional Cookies
These cookies enable enhanced functionality and personalization, such as remembering your preferences.

## 3. Third-Party Cookies

We may use third-party services that set cookies on your device, including:
- Analytics providers (Google Analytics)
- Authentication providers
- Payment processors

## 4. Managing Cookies

You can control and manage cookies through your browser settings. However, disabling cookies may affect the functionality of our website.

## 5. Updates to This Policy

We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.`

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="border-b border-border bg-background-secondary px-6 py-8 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-2">Privacy & Terms</h1>
          <p className="text-foreground-secondary">
            Understand how we handle your data and the terms of using our service
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeSection === "privacy-policy" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => scrollToSection("privacy-policy")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy Policy
                </Button>
                <Button
                  variant={activeSection === "terms-of-service" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => scrollToSection("terms-of-service")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Terms of Service
                </Button>
                <Button
                  variant={activeSection === "cookie-policy" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => scrollToSection("cookie-policy")}
                >
                  <Cookie className="mr-2 h-4 w-4" />
                  Cookie Policy
                </Button>
                <Button
                  variant={activeSection === "contact" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => scrollToSection("contact")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Privacy Policy Section */}
            <section
              ref={privacyRef}
              id="privacy-policy"
              className="animate-fade-in-up"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-6 w-6 text-accent-blue" />
                    <CardTitle className="text-3xl">Privacy Policy</CardTitle>
                  </div>
                  {privacyDoc && (
                    <CardDescription>
                      Last Updated: {privacyDoc.effective_date 
                        ? new Date(privacyDoc.effective_date).toLocaleDateString()
                        : new Date(privacyDoc.updated_at).toLocaleDateString()}
                      {privacyDoc.version_number && ` • Version ${privacyDoc.version_number}`}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {privacyLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-4 bg-background-secondary rounded w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-foreground-primary">
                        {privacyDoc?.content || defaultPrivacyContent}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Terms of Service Section */}
            <section
              ref={termsRef}
              id="terms-of-service"
              className="animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-6 w-6 text-accent-yellow" />
                    <CardTitle className="text-3xl">Terms of Service</CardTitle>
                  </div>
                  {termsDoc && (
                    <CardDescription>
                      Last Updated: {termsDoc.effective_date 
                        ? new Date(termsDoc.effective_date).toLocaleDateString()
                        : new Date(termsDoc.updated_at).toLocaleDateString()}
                      {termsDoc.version_number && ` • Version ${termsDoc.version_number}`}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {termsLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-4 bg-background-secondary rounded w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-foreground-primary">
                        {termsDoc?.content || defaultTermsContent}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Cookie Policy Section */}
            <section
              ref={cookieRef}
              id="cookie-policy"
              className="animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Cookie className="h-6 w-6 text-accent-pink" />
                    <CardTitle className="text-3xl">Cookie Policy</CardTitle>
                  </div>
                  {cookieDoc && (
                    <CardDescription>
                      Last Updated: {cookieDoc.effective_date 
                        ? new Date(cookieDoc.effective_date).toLocaleDateString()
                        : new Date(cookieDoc.updated_at).toLocaleDateString()}
                      {cookieDoc.version_number && ` • Version ${cookieDoc.version_number}`}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {cookieLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-4 bg-background-secondary rounded w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-foreground-primary">
                        {cookieDoc?.content || defaultCookieContent}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Contact for Legal Requests Section */}
            <section
              ref={contactRef}
              id="contact"
              className="animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-6 w-6 text-accent-green" />
                    <CardTitle className="text-3xl">Contact for Legal Requests</CardTitle>
                  </div>
                  <CardDescription>
                    Submit a request regarding your data, privacy, or legal inquiries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {formSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-16 w-16 text-accent-green mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold mb-2">Request Submitted Successfully</h3>
                      <p className="text-foreground-secondary mb-6">
                        We've received your request and will respond as soon as possible.
                      </p>
                      <Button onClick={() => setFormSubmitted(false)}>
                        Submit Another Request
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmitLegalRequest)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            {...register("name")}
                            placeholder="Your full name"
                            className="mt-1"
                          />
                          {errors.name && (
                            <p className="text-sm text-status-high mt-1">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="your.email@example.com"
                            className="mt-1"
                          />
                          {errors.email && (
                            <p className="text-sm text-status-high mt-1">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="request_type">Request Type *</Label>
                        <Controller
                          name="request_type"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select request type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="data-deletion">Data Deletion Request</SelectItem>
                                <SelectItem value="data-export">Data Export Request</SelectItem>
                                <SelectItem value="data-inquiry">Data Inquiry</SelectItem>
                                <SelectItem value="privacy-inquiry">Privacy Inquiry</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.request_type && (
                          <p className="text-sm text-status-high mt-1">{errors.request_type.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          {...register("message")}
                          placeholder="Please provide details about your request..."
                          rows={6}
                          className="mt-1"
                        />
                        {errors.message && (
                          <p className="text-sm text-status-high mt-1">{errors.message.message}</p>
                        )}
                        <p className="text-sm text-foreground-secondary mt-2">
                          Minimum 20 characters required
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="min-w-[140px]"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full h-12 w-12 p-0 shadow-lg z-50 animate-fade-in"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
