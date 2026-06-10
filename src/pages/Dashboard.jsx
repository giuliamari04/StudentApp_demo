import "../assets/styles/pages/dashboard.css";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

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
          {(daysUntilNextExam === 0) ? (
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
        <section className="section-card glass">
          <h2>Weekly Progress</h2>

          <div className="chart-bars">
            {[
              ["Lun", "60%"],
              ["Mar", "80%"],
              ["Mer", "45%"],
              ["Gio", "90%"],
              ["Ven", "70%"],
              ["Sab", "30%"],
              ["Dom", "20%"],
            ].map(([day, height]) => (
              <div className="chart-item" key={day}>
                <div className="chart-bar" style={{ height }} />
                <span>{day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card glass">
          <h2>Focus Today</h2>
          <p className="stat-label">Completa 3 task e studia almeno 2 ore.</p>

          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <div>✅ Ripassare SQL</div>
            <div>⬜ Studiare React</div>
            <div>⬜ Preparare appunti</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
