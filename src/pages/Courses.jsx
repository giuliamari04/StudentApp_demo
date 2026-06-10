import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function Courses() {
  const [courses, setCourses] = useState([])
  const [name, setName] = useState('')
  const [professor, setProfessor] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setCourses(data)
  }

  async function addCourse(e) {
    e.preventDefault()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    const { error } = await supabase.from('courses').insert({
      user_id: user.id,
      name,
      professor,
    })

    if (error) {
      alert(error.message)
    } else {
      setName('')
      setProfessor('')
      fetchCourses()
    }
  }

  async function deleteCourse(id) {
    await supabase.from('courses').delete().eq('id', id)
    fetchCourses()
  }

  return (
    <div>
      <h1>Corsi</h1>

      <form onSubmit={addCourse}>
        <input
          placeholder="Nome corso"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Professore"
          value={professor}
          onChange={(e) => setProfessor(e.target.value)}
        />

        <button type="submit">Aggiungi corso</button>
      </form>

      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            {course.name} - {course.professor}
            <button onClick={() => deleteCourse(course.id)}>Elimina</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Courses