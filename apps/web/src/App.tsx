import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Overview } from './pages/dashboard/Overview'
import { EmailList } from './pages/dashboard/emails/EmailList'
import { EmailDetail } from './pages/dashboard/emails/EmailDetail'
import { DomainList } from './pages/dashboard/domains/DomainList'
import { DomainDetail } from './pages/dashboard/domains/DomainDetail'
import { ApiKeys } from './pages/dashboard/ApiKeys'
import { AudienceList } from './pages/dashboard/audiences/AudienceList'
import { AudienceDetail } from './pages/dashboard/audiences/AudienceDetail'
import { BroadcastList } from './pages/dashboard/broadcasts/BroadcastList'
import { BroadcastEditor } from './pages/dashboard/broadcasts/BroadcastEditor'
import { Webhooks } from './pages/dashboard/Webhooks'
import { Logs } from './pages/dashboard/Logs'
import { Templates } from './pages/dashboard/Templates'
import { Settings } from './pages/dashboard/Settings'
import { Spinner } from './components/ui/Spinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="animate-spin h-6 w-6 border-2 border-[#1a1a1a] border-t-primary rounded-full" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="emails" element={<EmailList />} />
            <Route path="emails/:id" element={<EmailDetail />} />
            <Route path="domains" element={<DomainList />} />
            <Route path="domains/:id" element={<DomainDetail />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="audiences" element={<AudienceList />} />
            <Route path="audiences/:id" element={<AudienceDetail />} />
            <Route path="broadcasts" element={<BroadcastList />} />
            <Route path="broadcasts/new" element={<BroadcastEditor />} />
            <Route path="broadcasts/:id" element={<BroadcastEditor />} />
            <Route path="webhooks" element={<Webhooks />} />
            <Route path="logs" element={<Logs />} />
            <Route path="templates" element={<Templates />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
