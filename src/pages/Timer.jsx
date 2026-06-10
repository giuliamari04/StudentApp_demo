import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import '../assets/styles/pages/dashboard.css'
import '../assets/styles/pages/timer.css'
import AppModal from '../components/AppModal.jsx'

const INITIAL_SECONDS = 25 * 60

function Timer() {
  const [seconds, setSeconds] = useState(INITIAL_SECONDS)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(null)

  async function saveSession() {
    setSaving(true)

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      setSaving(false)
      return
    }

    const { error } = await supabase.from('study_sessions').insert({
      user_id: userData.user.id,
      duration_minutes: 25,
      note: 'Sessione Pomodoro completata',
    })

    setSaving(false)

    if (error) {
      setModal({
        type: "error",
        title: "Errore",
        message: error.message,
        confirmText: "OK",
        onConfirm: () => setModal(null),
      });
    }
  }

  useEffect(() => {
    if (!running) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setRunning(false)
          saveSession()
          return INITIAL_SECONDS
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [running])

  function toggleTimer() {
    setRunning((prev) => !prev)
  }

  function resetTimer() {
    setRunning(false)
    setSeconds(INITIAL_SECONDS)
  }

  function formatTime(value) {
    const minutes = Math.floor(value / 60)
    const secs = value % 60

    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const progress = `${((INITIAL_SECONDS - seconds) / INITIAL_SECONDS) * 100}%`

  return (
    <div className="page timer-page">
      <header className="page-header">
        <h1>Timer Studio</h1>
        <p>Sessione focus da 25 minuti.</p>
      </header>

      <section className="timer-card glass">
        <div className="timer-circle" style={{ '--progress': progress }}>
          <div>
            <div className="timer-time">{formatTime(seconds)}</div>
            <div className="timer-label">
              {running ? 'Focus in corso' : 'Pronta per iniziare'}
            </div>
          </div>
        </div>

        <div className="timer-controls">
          <button className="btn-primary timer-main-btn" onClick={toggleTimer}>
            {running ? '⏸' : '▶'}
          </button>

          <button className="timer-secondary-btn" onClick={resetTimer}>
            ↺
          </button>
        </div>

        {saving && <p className="timer-label">Salvataggio sessione...</p>}

        <div className="timer-stats">
          <div className="timer-stat glass">
            <strong>25m</strong>
            <span>Sessione</span>
          </div>

          <div className="timer-stat glass">
            <strong>2h</strong>
            <span>Oggi</span>
          </div>

          <div className="timer-stat glass">
            <strong>6</strong>
            <span>Sessioni</span>
          </div>
        </div>
      </section>
            {modal && <AppModal {...modal} onCancel={() => setModal(null)} />}
    </div>
  )
}

export default Timer