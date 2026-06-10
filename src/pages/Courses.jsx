import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

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
    <div>
      <div className="mb-8">
        <p className="text-slate-400">Organizza i tuoi insegnamenti</p>
        <h1 className="text-4xl font-bold">Corsi</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-4 rounded-2xl bg-slate-900 p-6 md:grid-cols-4"
      >
        <input
          className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
          placeholder="Nome corso"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
          placeholder="Professore"
          value={professor}
          onChange={(e) => setProfessor(e.target.value)}
        />

        <input
          className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
          placeholder="CFU"
          type="number"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
        />

        <button
          className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-700"
          type="submit"
        >
          {editingId ? 'Salva modifiche' : 'Aggiungi corso'}
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl bg-slate-900 p-6"
          >
            <h2 className="text-xl font-bold">{course.name}</h2>

            <p className="mt-2 text-slate-400">
              {course.professor || 'Nessun professore'}
            </p>

            <p className="mt-2 text-sm text-indigo-400">
              {course.credits ? `${course.credits} CFU` : 'CFU non inseriti'}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => startEdit(course)}
                className="rounded-xl bg-slate-800 px-4 py-2 hover:bg-slate-700"
              >
                Modifica
              </button>

              <button
                onClick={() => deleteCourse(course.id)}
                className="rounded-xl bg-red-500 px-4 py-2 hover:bg-red-600"
              >
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Courses