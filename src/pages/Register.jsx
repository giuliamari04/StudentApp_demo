import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import '../assets/styles/auth.css'

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Registrazione completata.')
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-logo">✨</div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Inizia a organizzare lo studio</p>

        <form onSubmit={handleRegister} className="auth-form">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn-primary auth-button" disabled={loading}>
            {loading ? 'Creazione...' : 'Registrati'}
          </button>
        </form>

        <p className="auth-footer">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </div>
    </div>
  )
}

export default Register