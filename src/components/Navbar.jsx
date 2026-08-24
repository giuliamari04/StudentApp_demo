import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import '../assets/styles/navbar.css'

function Navbar() {
  const navigate = useNavigate()

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">📚</div>
          <span>StudyFlow</span>
        </div>

        <nav className="sidebar-nav">
          <Link className="nav-link" to="/dashboard">Dashboard</Link>
          <Link className="nav-link" to="/courses">Corsi</Link>
          <Link className="nav-link" to="/exams">Esami</Link>
          <Link className="nav-link" to="/tasks">Task</Link>
          <Link className="nav-link" to="/timer">Timer</Link>
          <Link className="nav-link" to="/study-ai">Study AI</Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="btn-danger logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <nav className="mobile-nav glass">
        <Link className="nav-link" to="/dashboard">🏠</Link>
        <Link className="nav-link" to="/courses">📚</Link>
        <Link className="nav-link" to="/tasks">✅</Link>
        <Link className="nav-link" to="/exams">📅</Link>
        <Link className="nav-link" to="/timer">⏱️</Link>
        <Link className="nav-link" to="/study-ai">🤖</Link>
      </nav>
    </>
  )
}

export default Navbar