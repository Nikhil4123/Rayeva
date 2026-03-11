import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ProductTagger from './pages/ProductTagger'
import ProposalBuilder from './pages/ProposalBuilder'
import ImpactReports from './pages/ImpactReports'
import AILogs from './pages/AILogs'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import useAppStore from './store/useAppStore'

function RequireAuth({ children }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="product-tagger" element={<ProductTagger />} />
          <Route path="proposals" element={<ProposalBuilder />} />
          <Route path="impact-reports" element={<ImpactReports />} />
          <Route path="ai-logs" element={<AILogs />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
