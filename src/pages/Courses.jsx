import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import '../assets/styles/pages/courses.css'
import '../assets/styles/pages/dashboard.css'

function Courses() {
  const [courses, setCourses] = useState([])
  const [name, setName] = useState('')
  const [professor, setProfessor] = useState('')
  const [credits, setCredits] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Errore fetch courses:', error)
    alert(error.message)
    return
  }

  setCourses(data || [])
}
  async function handleSubmit(e) {
    e.preventDefault()

    const { data: userData } = await supabase.auth.getUser()
    console.log('USER:', userData.user)

    if (!userData.user) {
      alert('Devi essere loggata')
      return
    }

    if (editingId) {
      const { error } = await supabase
        .from('courses')
        .update({
          name,
          professor,
          credits: credits ? Number(credits) : null,
        })
        .eq('id', editingId)

      if (error) {
        alert(error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('courses')
        .insert({
          user_id: userData.user.id,
          name,
          professor,
          credits: credits ? Number(credits) : null,
        })

      if (error) {
        alert(error.message)
        return
      }
    }

    setName('')
    setProfessor('')
    setCredits('')
    setEditingId(null)
    fetchCourses()
  }

  function startEdit(course) {
    setEditingId(course.id)
    setName(course.name)
    setProfessor(course.professor || '')
    setCredits(course.credits || '')
  }

  async function deleteCourse(id) {
    const confirmDelete = confirm('Vuoi eliminare questo corso?')

    if (!confirmDelete) return

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchCourses()
  }

  return (
  <div className="page">
    <header className="page-header">
      <h1>Corsi</h1>
      <p>Gestisci insegnamenti, professori e CFU.</p>
    </header>

    <form onSubmit={handleSubmit} className="course-form glass">
      <input className="input" placeholder="Nome corso" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="input" placeholder="Professore" value={professor} onChange={(e) => setProfessor(e.target.value)} />
      <input className="input" placeholder="CFU" type="number" value={credits} onChange={(e) => setCredits(e.target.value)} />

      <button className="btn-primary">
        {editingId ? 'Salva' : 'Aggiungi'}
      </button>
    </form>

    <div className="course-grid">
      {courses.map((course) => (
        <article key={course.id} className="course-card glass">
          <div className="course-top">
            <div className="course-icon">📘</div>

            <div>
              <h2>{course.name}</h2>
              <p>{course.professor || 'Nessun professore'}</p>
            </div>
          </div>

          <p style={{ marginTop: 16 }}>
            {course.credits ? `${course.credits} CFU` : 'CFU non inseriti'}
          </p>

          <div className="course-actions">
            <button className="edit-btn" onClick={() => startEdit(course)}>
              Modifica
            </button>

            <button className="delete-btn" onClick={() => deleteCourse(course.id)}>
              Elimina
            </button>
          </div>
        </article>
      ))}
    </div>
  </div>
)
}

export default Courses