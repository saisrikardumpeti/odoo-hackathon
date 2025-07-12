import { Routes, Route } from "react-router-dom"
import Layout from "@/components/layout/Layout"
import Home from "@/pages/Home"
import Login from "@/pages/Login"
import QuestionDetail from "@/pages/QuestionDetail"
import AskQuestion from "@/pages/AskQuestion"
import Profile from "@/pages/Profile"
import Tags from "@/pages/Tags"
import Notifications from "@/pages/Notifications"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="questions/:id" element={<QuestionDetail />} />
          <Route
            path="ask"
            element={
              <ProtectedRoute>
                <AskQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="tags" element={<Tags />} />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
