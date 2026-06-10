import { useMemo, useState } from 'react'
import '../assets/styles/miniCalendar.css'

function MiniCalendar({ exams = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = currentDate.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    const totalDays = lastDay.getDate()

    const emptyDays = Array.from({ length: startDay }, () => null)
    const monthDays = Array.from({ length: totalDays }, (_, i) => i + 1)

    return [...emptyDays, ...monthDays]
  }, [year, month])

  function examsForDay(day) {
    if (!day) return []

    return exams.filter((exam) => {
      const date = new Date(exam.exam_date)
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      )
    })
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  return (
    <section className="mini-calendar glass">
      <div className="mini-calendar-header">
        <h2>{monthName}</h2>

        <div>
          <button onClick={prevMonth}>‹</button>
          <button onClick={nextMonth}>›</button>
        </div>
      </div>

      <div className="mini-calendar-weekdays">
        <span>L</span>
        <span>M</span>
        <span>M</span>
        <span>G</span>
        <span>V</span>
        <span>S</span>
        <span>D</span>
      </div>

      <div className="mini-calendar-grid">
        {days.map((day, index) => {
          const dayExams = examsForDay(day)

          return (
            <div
              key={index}
              className={
                dayExams.length > 0
                  ? 'mini-calendar-day has-exam'
                  : 'mini-calendar-day'
              }
            >
              {day && <span>{day}</span>}

              {dayExams.length > 0 && (
                <div className="exam-dots">
                  {dayExams.slice(0, 3).map((exam) => (
                    <span key={exam.id} title={exam.title}></span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mini-calendar-list">
        <h3>Esami del mese</h3>

        {exams
          .filter((exam) => {
            const date = new Date(exam.exam_date)
            return date.getFullYear() === year && date.getMonth() === month
          })
          .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
          .map((exam) => (
            <div className="mini-calendar-exam" key={exam.id}>
              <span>{new Date(exam.exam_date).getDate()}</span>
              <p>{exam.title}</p>
            </div>
          ))}

        {exams.filter((exam) => {
          const date = new Date(exam.exam_date)
          return date.getFullYear() === year && date.getMonth() === month
        }).length === 0 && (
          <p className="mini-calendar-empty">Nessun esame questo mese</p>
        )}
      </div>
    </section>
  )
}

export default MiniCalendar