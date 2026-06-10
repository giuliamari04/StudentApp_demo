import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import '../assets/styles/pages/dashboard.css'
import '../assets/styles/pages/timer.css'
import AppModal from '../components/AppModal.jsx'

const INITIAL_SECONDS = 25 * 60
const DAILY_SESSIONS = 6

function Timer() {
  const [seconds, setSeconds] = useState(INITIAL_SECONDS)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(null)
  const [sessionsLeft, setSessionsLeft] = useState(DAILY_SESSIONS)

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
        type: 'error',
        title: 'Errore',
        message: error.message,
        confirmText: 'OK',
        onConfirm: () => setModal(null),
      })
      return
    }

    setSessionsLeft((prev) => {
      const nextValue = Math.max(prev - 1, 0)

      if (nextValue === 0) {
        setModal({
          type: 'success',
          title: 'Studio giornaliero completato 🎉',
          message: 'Hai completato tutte le sessioni previste per oggi. Ottimo lavoro!',
          confirmText: 'OK',
          onConfirm: () => setModal(null),
        })
      }

      return nextValue
    })
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
    if (sessionsLeft === 0) return
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
  const completedToday = DAILY_SESSIONS - sessionsLeft

  return (
    <div className="page timer-page">
      <header className="page-header">
        <h1>Timer Studio</h1>
        <p>
          {sessionsLeft === 0
            ? 'Studio giornaliero completato 🎉'
            : 'Sessione focus da 25 minuti.'}
        </p>
      </header>

      <section className="timer-card glass">
        <div className="timer-circle" style={{ '--progress': progress }}>
          <div>
            <div className="timer-time">
              {sessionsLeft === 0 ? 'Done' : formatTime(seconds)}
            </div>

            <div className="timer-label">
              {sessionsLeft === 0
                ? 'Studio giornaliero completato'
                : running
                  ? 'Focus in corso'
                  : 'Pronta per iniziare'}
            </div>
          </div>
        </div>

        <div className="timer-controls">
          <button
            className="btn-primary timer-main-btn"
            onClick={toggleTimer}
            disabled={sessionsLeft === 0}
          >
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
            <strong>{completedToday}</strong>
            <span>Completate</span>
          </div>

          <div className="timer-stat glass">
            <strong>
              {sessionsLeft === 0 ? 'Completato' : sessionsLeft}
            </strong>
            <span>
              {sessionsLeft === 0 ? 'Studio giornaliero' : 'Sessioni rimaste'}
            </span>
          </div>
        </div>

        <div className="page-header w-100 mt-8">
          <p>
            Ricordati di fare pausa attiva di 10 minuti dopo ogni sessione di studio.
          </p>
        </div>
      </section>

      {modal && <AppModal {...modal} onCancel={() => setModal(null)} />}
    </div>
  )
}

export default Timer