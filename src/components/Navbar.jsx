import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Navbar() {
  const navigate = useNavigate()

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-900 p-6 md:block">
      <h1 className="mb-10 text-2xl font-bold text-indigo-400">
        StudyFlow
      </h1>

      <nav className="flex flex-col gap-3">
        <Link className="rounded-xl px-4 py-3 hover:bg-slate-800" to="/dashboard">
          Dashboard
        </Link>
        <Link className="rounded-xl px-4 py-3 hover:bg-slate-800" to="/courses">
          Corsi
        </Link>
        <Link className="rounded-xl px-4 py-3 hover:bg-slate-800" to="/exams">
          Esami
        </Link>
        <Link className="rounded-xl px-4 py-3 hover:bg-slate-800" to="/tasks">
          Task
        </Link>
        <Link className="rounded-xl px-4 py-3 hover:bg-slate-800" to="/timer">
          Timer
        </Link>
      </nav>

      <button
        onClick={logout}
        className="absolute bottom-6 left-6 right-6 rounded-xl bg-red-500 px-4 py-3 font-semibold hover:bg-red-600"
      >
        Logout
      </button>
    </aside>
  )
}

export default Navbar