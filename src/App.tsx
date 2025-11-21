import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toast"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { SignupPage } from "@/pages/SignupPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { AgentBuilderPage } from "@/pages/AgentBuilderPage"
import { PublicChatPage } from "@/pages/PublicChatPage"
import { SessionsPage } from "@/pages/SessionsPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ServerErrorPage } from "@/pages/ServerErrorPage"
import { AboutHelpPage } from "@/pages/AboutHelpPage"
import { PrivacyTermsPage } from "@/pages/PrivacyTermsPage"

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/privacy-terms" element={<PrivacyTermsPage />} />
          <Route path="/chat/:agentId" element={<PublicChatPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/agents" element={<DashboardPage />} />
            <Route path="/agents/new" element={<AgentBuilderPage />} />
            <Route path="/agents/:id" element={<AgentBuilderPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/webhooks" element={<SessionsPage />} />
            <Route path="/team" element={<SessionsPage />} />
            <Route path="/help" element={<AboutHelpPage />} />
          </Route>
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
