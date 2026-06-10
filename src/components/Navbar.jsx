import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Navbar() {
  const navigate = useNavigate()

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link> |{' '}
      <Link to="/courses">Corsi</Link> |{' '}
      <Link to="/exams">Esami</Link> |{' '}
      <Link to="/tasks">Task</Link> |{' '}
      <Link to="/timer">Timer</Link> |{' '}
      <button onClick={logout}>Logout</button>
    </nav>
  )
}

export default Navbar