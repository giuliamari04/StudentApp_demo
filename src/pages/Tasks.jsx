import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import '../assets/styles/pages/dashboard.css'
import '../assets/styles/pages/tasks.css'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('todo')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setTasks(data || [])
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
      due_date: dueDate || null,
      priority,
    }

    if (editingId) {
      const { error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        alert(error.message)
        return
      }
    } else {
      const { error } = await supabase.from('tasks').insert({
        ...payload,
        completed: false,
      })

      if (error) {
        alert(error.message)
        return
      }
    }

    setTitle('')
    setDueDate('')
    setPriority('medium')
    setEditingId(null)
    fetchTasks()
  }

  function startEdit(task) {
    setEditingId(task.id)
    setTitle(task.title)
    setDueDate(task.due_date || '')
    setPriority(task.priority || 'medium')
  }

  async function toggleTask(task) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)

    if (error) {
      alert(error.message)
      return
    }

    fetchTasks()
  }

  async function deleteTask(id) {
    if (!confirm('Vuoi eliminare questo task?')) return

    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchTasks()
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'done') return task.completed
    if (filter === 'todo') return !task.completed
    return true
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1>Task</h1>
        <p>Organizza le attività giornaliere in stile Todoist.</p>
      </header>

      <form onSubmit={handleSubmit} className="task-form glass">
        <input
          className="input"
          placeholder="Nuovo task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          className="input"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Bassa</option>
        </select>

        <button className="btn-primary">
          {editingId ? 'Salva' : 'Aggiungi'}
        </button>
      </form>

      <div className="task-tabs">
        <button
          className={filter === 'todo' ? 'task-tab active' : 'task-tab'}
          onClick={() => setFilter('todo')}
        >
          Da fare
        </button>

        <button
          className={filter === 'done' ? 'task-tab active' : 'task-tab'}
          onClick={() => setFilter('done')}
        >
          Completati
        </button>

        <button
          className={filter === 'all' ? 'task-tab active' : 'task-tab'}
          onClick={() => setFilter('all')}
        >
          Tutti
        </button>
      </div>

      <div className="task-list">
        {filteredTasks.map((task) => (
          <article
            key={task.id}
            className={task.completed ? 'task-card glass done' : 'task-card glass'}
          >
            <button
              className="task-check"
              onClick={() => toggleTask(task)}
            />

            <div className="task-content">
              <h3>{task.completed ? <s>{task.title}</s> : task.title}</h3>
              <p>{task.due_date || 'Nessuna scadenza'}</p>
            </div>

            <span className={`priority ${task.priority || 'medium'}`}>
              {task.priority || 'medium'}
            </span>

            <div className="task-actions">
              <button className="edit-btn" onClick={() => startEdit(task)}>
                ✎
              </button>

              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                ×
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Tasks