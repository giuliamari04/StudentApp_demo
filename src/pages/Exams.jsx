import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import '../assets/styles/pages/dashboard.css'
import '../assets/styles/pages/exams.css'

function Exams() {
  const [exams, setExams] = useState([])
  const [title, setTitle] = useState('')
  const [examDate, setExamDate] = useState('')
  const [status, setStatus] = useState('planned')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchExams()
  }, [])

  async function fetchExams() {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('exam_date', { ascending: true })

    if (error) {
      alert(error.message)
      return
    }

    setExams(data || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      alert('Devi essere loggata')
      return
    }

    const payload = {
      user_id: userData.user.id,
      title,
      exam_date: examDate,
      status,
    }

    if (editingId) {
      const { error } = await supabase
        .from('exams')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        alert(error.message)
        return
      }
    } else {
      const { error } = await supabase.from('exams').insert(payload)

      if (error) {
        alert(error.message)
        return
      }
    }

    setTitle('')
    setExamDate('')
    setStatus('planned')
    setEditingId(null)
    fetchExams()
  }

  function startEdit(exam) {
    setEditingId(exam.id)
    setTitle(exam.title)
    setExamDate(exam.exam_date)
    setStatus(exam.status || 'planned')
  }

  async function deleteExam(id) {
    if (!confirm('Vuoi eliminare questo esame?')) return

    const { error } = await supabase.from('exams').delete().eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchExams()
  }

  function daysLeft(date) {
    const today = new Date()
    const exam = new Date(date)
    const diff = exam - today
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Esami</h1>
        <p>Monitora le prossime date e lo stato di preparazione.</p>
      </header>

      <form onSubmit={handleSubmit} className="exam-form glass">
        <input
          className="input"
          placeholder="Nome esame"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="input"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          required
        />

        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="planned">Pianificato</option>
          <option value="in_progress">In studio</option>
          <option value="ready">Pronta</option>
          <option value="done">Superato</option>
        </select>

        <button className="btn-primary">
          {editingId ? 'Salva' : 'Aggiungi'}
        </button>
      </form>

      <div className="exam-grid">
        {exams.map((exam) => (
          <article key={exam.id} className="exam-card glass">
            <div className="exam-top">
              <div>
                <h2>{exam.title}</h2>
                <p>{exam.exam_date}</p>
                <p>Stato: {exam.status}</p>
              </div>

              <div className="exam-date">
                <strong>{daysLeft(exam.exam_date)}</strong>
                <p>giorni</p>
              </div>
            </div>

            <div className="exam-actions">
              <button className="edit-btn" onClick={() => startEdit(exam)}>
                Modifica
              </button>

              <button className="delete-btn" onClick={() => deleteExam(exam.id)}>
                Elimina
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Exams