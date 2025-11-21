import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { WelcomeBanner } from "@/components/chat/WelcomeBanner"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { MessageInput } from "@/components/chat/MessageInput"
import { SessionProgressIndicator } from "@/components/chat/SessionProgressIndicator"
import { ConsentModal } from "@/components/chat/ConsentModal"
import { SessionEndScreen } from "@/components/chat/SessionEndScreen"
import { MinimizedBrandingFooter } from "@/components/chat/MinimizedBrandingFooter"
import { useAgentByPublicUrl } from "@/hooks/useAgents"
import { useCreateSession, useSession, useCompleteSession } from "@/hooks/useSessions"
import { useMessages, useSendMessage, useSubscribeToMessages } from "@/hooks/useMessages"
import { useCreateOrGetVisitor, useUpdateConsent } from "@/hooks/useVisitors"
import { useFieldValues } from "@/hooks/useFieldValues"

// Generate a simple fingerprint (in production, use a proper fingerprinting library)
function generateFingerprint(): string {
  const stored = localStorage.getItem("visitor_fingerprint")
  if (stored) return stored

  const fingerprint = `fp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  localStorage.setItem("visitor_fingerprint", fingerprint)
  return fingerprint
}

export function PublicChatPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [consentGiven, setConsentGiven] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Get agent by public URL (agentId in the route)
  const { data: agent, isLoading: agentLoading } = useAgentByPublicUrl(agentId || null)

  // Create or get visitor
  const createVisitorMutation = useCreateOrGetVisitor()
  const updateConsentMutation = useUpdateConsent()

  // Session management
  const createSessionMutation = useCreateSession()
  const { data: session } = useSession(sessionId)
  const completeSessionMutation = useCompleteSession()

  // Messages
  const { data: messages = [], isLoading: messagesLoading } = useMessages(sessionId)
  const sendMessageMutation = useSendMessage()

  // Field values
  const { data: fieldValues = [] } = useFieldValues(sessionId)

  // Initialize visitor and session
  useEffect(() => {
    if (!agent || visitorId) return

    const initializeVisitor = async () => {
      try {
        const fingerprint = generateFingerprint()
        const visitor = await createVisitorMutation.mutateAsync({
          fingerprint,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          metadata: {},
        })
        setVisitorId(visitor.id)

        // Check if consent is required (for now, we'll show consent modal)
        if (!visitor.consent_given) {
          setShowConsentModal(true)
        } else {
          setConsentGiven(true)
          await initializeSession(visitor.id)
        }
      } catch (error) {
        toast.error("Failed to initialize visitor session")
        console.error(error)
      }
    }

    initializeVisitor()
  }, [agent, visitorId, createVisitorMutation])

  // Initialize session after consent
  const initializeSession = useCallback(
    async (visitorId: string) => {
      if (!agent || sessionId) return

      try {
        const session = await createSessionMutation.mutateAsync({
          agent_id: agent.id,
          visitor_id: visitorId,
          visitor_metadata: {
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
          },
        })
        setSessionId(session.id)
      } catch (error) {
        toast.error("Failed to create session")
        console.error(error)
      }
    },
    [agent, sessionId, createSessionMutation]
  )

  // Handle consent
  const handleConsent = async (consented: boolean) => {
    if (!visitorId) return

    try {
      await updateConsentMutation.mutateAsync({
        visitor_id: visitorId,
        consent_given: consented,
        consent_version: "1.0", // In production, use actual version
      })
      setConsentGiven(consented)
      setShowConsentModal(false)

      if (consented) {
        await initializeSession(visitorId)
      }
    } catch (error) {
      toast.error("Failed to update consent")
      console.error(error)
    }
  }

  // Subscribe to new messages
  useSubscribeToMessages(sessionId, (message) => {
    // Handle new agent messages
    if (message.role === "agent") {
      setIsTyping(false)
    }
  })

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!sessionId || !agent) return

    try {
      // Send visitor message
      await sendMessageMutation.mutateAsync({
        session_id: sessionId,
        role: "visitor",
        content,
      })

      // Simulate agent typing
      setIsTyping(true)

      // In production, this would be handled by a backend service/LLM
      // For now, we'll simulate a simple response
      setTimeout(async () => {
        try {
          const agentResponse = `Thank you for your message: "${content}". How can I help you further?`
          await sendMessageMutation.mutateAsync({
            session_id: sessionId,
            role: "agent",
            content: agentResponse,
          })
        } catch (error) {
          console.error("Failed to send agent response", error)
        }
      }, 1000)
    } catch (error) {
      toast.error("Failed to send message")
      console.error(error)
    }
  }

  // Check if session is completed
  const isSessionCompleted = session?.status === "completed"

  // Get required fields from agent schema
  const requiredFields = agent?.schema?.fields?.filter((f) => f.required) || []

  // Handle session completion
  const handleCompleteSession = async () => {
    if (!sessionId) return

    try {
      await completeSessionMutation.mutateAsync(sessionId)
      toast.success("Session completed successfully!")
    } catch (error) {
      toast.error("Failed to complete session")
      console.error(error)
    }
  }

  // Auto-complete session when all required fields are collected
  useEffect(() => {
    if (
      !sessionId ||
      isSessionCompleted ||
      requiredFields.length === 0 ||
      fieldValues.length === 0
    )
      return

    const allFieldsCollected = requiredFields.every((field) =>
      fieldValues.some((fv) => fv.field_key === field.key && fv.validated)
    )

    if (allFieldsCollected && session?.status === "in-progress") {
      handleCompleteSession()
    }
  }, [fieldValues, requiredFields, sessionId, session, isSessionCompleted])

  if (agentLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col">
        <WelcomeBanner agent={null} isLoading={true} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground-secondary">Loading agent...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-semibold text-foreground-primary">
            Agent Not Found
          </h1>
          <p className="text-foreground-secondary">
            The agent you're looking for doesn't exist or is no longer available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <WelcomeBanner agent={agent} isLoading={agentLoading} />

      {isSessionCompleted ? (
        <SessionEndScreen
          agent={agent}
          onDownload={() => {
            // TODO: Implement download functionality
            toast.info("Download feature coming soon")
          }}
          onSchedule={() => {
            // TODO: Implement scheduling functionality
            toast.info("Scheduling feature coming soon")
          }}
        />
      ) : (
        <>
          <div className="flex-1 flex gap-4 p-4">
            <div className="flex-1 flex flex-col min-w-0">
              <ChatWindow
                messages={messages}
                agent={agent}
                isLoading={messagesLoading}
                isTyping={isTyping}
              />
            </div>
            {requiredFields.length > 0 && (
              <div className="hidden md:block w-64 shrink-0">
                <SessionProgressIndicator
                  fields={requiredFields}
                  fieldValues={fieldValues}
                />
              </div>
            )}
          </div>

          {requiredFields.length > 0 && (
            <div className="md:hidden px-4 pb-2">
              <SessionProgressIndicator
                fields={requiredFields}
                fieldValues={fieldValues}
              />
            </div>
          )}

          {sessionId && consentGiven && (
            <MessageInput
              onSend={handleSendMessage}
              isLoading={sendMessageMutation.isPending || isTyping}
              disabled={isSessionCompleted}
              placeholder="Type your message..."
            />
          )}
        </>
      )}

      <MinimizedBrandingFooter agent={agent} />

      <ConsentModal
        open={showConsentModal}
        onConsent={handleConsent}
        privacyNotice={
          agent.persona?.instructions || "We collect and process your data according to our privacy policy."
        }
      />
    </div>
  )
}
