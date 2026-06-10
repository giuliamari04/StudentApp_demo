import '../assets/styles/pages/dashboard.css'

function Dashboard() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Good Morning, Giulia 👋</h1>
        <p>Organizza studio, esami e task in un unico posto.</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon">📚</div>
          <div className="stat-value">4</div>
          <div className="stat-label">Corsi attivi</div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon">📅</div>
          <div className="stat-value">2</div>
          <div className="stat-label">Esami prossimi</div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon">✅</div>
          <div className="stat-value">7</div>
          <div className="stat-label">Task oggi</div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">12</div>
          <div className="stat-label">Streak giorni</div>
        </div>
      </section>

      <div className="quick-actions">
        <button className="btn-primary">+ Task</button>
        <button className="btn-primary">+ Esame</button>
        <button className="btn-primary">Avvia studio</button>
      </div>

      <div className="dashboard-grid">
        <section className="section-card glass">
          <h2>Weekly Progress</h2>

          <div className="chart-bars">
            {[
              ['Lun', '60%'],
              ['Mar', '80%'],
              ['Mer', '45%'],
              ['Gio', '90%'],
              ['Ven', '70%'],
              ['Sab', '30%'],
              ['Dom', '20%'],
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

          <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
            <div>✅ Ripassare SQL</div>
            <div>⬜ Studiare React</div>
            <div>⬜ Preparare appunti</div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard