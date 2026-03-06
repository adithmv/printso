import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import OwnerLogin from "./pages/OwnerLogin"

import StudentDashboard from "./pages/student/Dashboard"
import NewOrder from "./pages/student/NewOrder"
import OrderTracking from "./pages/student/OrderTracking"

import OwnerDashboard from "./pages/owner/Dashboard"
import OrderDetail from "./pages/owner/OrderDetail"

const ProtectedStudent = ({ children }) => {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-brand-600 text-xl">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (profile?.role === "owner") return <Navigate to="/owner/dashboard" />
  return children
}

const ProtectedOwner = ({ children }) => {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-brand-600 text-xl">Loading...</div>
  if (!user) return <Navigate to="/owner-login" />
  if (profile?.role === "student") return <Navigate to="/dashboard" />
  return children
}

const AppRoutes = () => {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen text-brand-600 text-xl">Loading...</div>

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/owner-login" element={<OwnerLogin />} />

      {/* Student Routes */}
      <Route path="/dashboard" element={<ProtectedStudent><StudentDashboard /></ProtectedStudent>} />
      <Route path="/new-order" element={<ProtectedStudent><NewOrder /></ProtectedStudent>} />
      <Route path="/order/:id" element={<ProtectedStudent><OrderTracking /></ProtectedStudent>} />

      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={<ProtectedOwner><OwnerDashboard /></ProtectedOwner>} />
      <Route path="/owner/order/:id" element={<ProtectedOwner><OrderDetail /></ProtectedOwner>} />

      {/* Default redirect */}
      <Route path="*" element={
        !user ? <Navigate to="/login" /> :
        profile?.role === "owner" ? <Navigate to="/owner/dashboard" /> :
        <Navigate to="/dashboard" />
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
