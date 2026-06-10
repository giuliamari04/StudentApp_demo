import "../assets/styles/pages/dashboard.css";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import MiniCalendar from "../components/MiniCalendar.jsx";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData);

      // Fetch courses, exams, and tasks
      const { data: coursesData } = await supabase.from("courses").select();
      setCourses(coursesData);

      const { data: examsData } = await supabase.from("exams").select();
      setExams(examsData);

      const { data: tasksData } = await supabase.from("tasks").select();
      setTasks(tasksData);
    }

    fetchData();
  }, []);

  function getNextExam(exams) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingExams = exams
      .filter((exam) => {
        const examDate = new Date(exam.exam_date);
        examDate.setHours(0, 0, 0, 0);

        return examDate >= today && exam.status !== "done";
      })
      .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

    if (upcomingExams.length === 0) {
      return null;
    }

    const nextExam = upcomingExams[0];

    const examDate = new Date(nextExam.exam_date);
    examDate.setHours(0, 0, 0, 0);

    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...nextExam,
      days_left: diffDays,
    };
  }
  const daysUntilNextExam = getNextExam(exams)?.days_left || 0;
  const today = new Date().toISOString().split("T")[0];

  const todayTasks = tasks
    .filter((task) => task.due_date === today)
    .sort((a, b) => Number(a.completed) - Number(b.completed));

  async function toggleTask(task) {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);

    if (error) {
      alert(error.message);
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item,
      ),
    );
  }

  function calculateDailyPages(exam) {
    if (!exam.number_pages || exam.number_pages <= 0) return null;
    if (!exam.exam_date || !exam.created_at) return null;

    const startDate = new Date(exam.created_at);
    const examDate = new Date(exam.exam_date);

    startDate.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    const diffTime = examDate - startDate;
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) return null;

    return Math.ceil(exam.number_pages / totalDays);
  }

  const pageStudyPlan = exams
    .filter((exam) => exam.status !== "done")
    .map((exam) => ({
      ...exam,
      pagesPerDay: calculateDailyPages(exam),
    }))
    .filter((exam) => exam.pagesPerDay !== null)
    .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Good Morning, {user?.name || "Student"} 👋</h1>
        <p>Organizza studio, esami e task in un unico posto.</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Corsi attivi</div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{exams.length}</div>
          <div className="stat-label">Esami prossimi</div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Task oggi</div>
        </div>

        <div className="stat-card glass">
          {daysUntilNextExam === 0 ? (
            <>
              <div className="stat-icon">🎉</div>
              <div className="stat-value">{daysUntilNextExam}</div>
              <div className="stat-label">Giorno d'Esame!</div>
            </>
          ) : (
            <>
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{daysUntilNextExam}</div>
              <div className="stat-label">Giorni rimanenti prossimo esame</div>
            </>
          )}
        </div>
      </section>

      <div className="quick-actions">
        <Link className="btn-primary" to="/tasks">
          + Task
        </Link>
        <Link className="btn-primary" to="/exams">
          + Esame
        </Link>
        <Link className="btn-primary" to="/timer">
          Avvia studio
        </Link>
      </div>
      <div className="dashboard-grid">
        <MiniCalendar exams={exams} />
        <section className="section-card glass">
          <h2>Pagine da studiare oggi</h2>
          <p className="stat-label">
            Calcolo automatico basato su pagine totali e data esame.
          </p>

          <div className="auto-study-list">
            {pageStudyPlan.length > 0 ? (
              pageStudyPlan.map((exam) => (
                <div key={exam.id} className="auto-study-item">
                  <div>
                    <strong>{exam.title}</strong>
                    <p>Esame il {exam.exam_date}</p>
                  </div>

                  <span>{exam.pagesPerDay} pag/giorno</span>
                </div>
              ))
            ) : (
              <p className="dashboard-empty">
                Nessun piano pagine disponibile.
              </p>
            )}
            <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <div key={task.id} className="dashboard-task">
                    <input
                      type="checkbox"
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                    />

                    <label htmlFor={`task-${task.id}`}>{task.title}</label>
                  </div>
                ))
              ) : (
                <p className="dashboard-empty">🎉 Nessun task per oggi!</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
