import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Courses from './pages/Courses.jsx'
import Exams from './pages/Exams.jsx'
import Tasks from './pages/Tasks.jsx'
import Timer from './pages/Timer.jsx'
import StudyAI from './pages/StudyAI.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/AppLayout.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Courses />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Exams />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Tasks />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/timer"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Timer />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-ai"
        element={
          <ProtectedRoute>
            <AppLayout>
              <StudyAI />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App