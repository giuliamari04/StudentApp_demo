import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../assets/styles/pages/dashboard.css";
import "../assets/styles/pages/exams.css";
import AppModal from "../components/AppModal";

function Exams() {
  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [status, setStatus] = useState("planned");
  const [editingId, setEditingId] = useState(null);
  const [number_pages, setNumberPages] = useState(0);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("exam_date", { ascending: true });

    if (error) {
      setModal({
        type: "error",
        title: "Errore",
        message: error.message,
        confirmText: "OK",
        onConfirm: () => setModal(null),
      });
      return;
    }

    setExams(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Devi essere loggata");
      return;
    }

    const payload = {
      user_id: userData.user.id,
      title,
      exam_date: examDate,
      status,
      number_pages: number_pages || 1,
    };

    if (editingId) {
      const { error } = await supabase
        .from("exams")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setModal({
          type: "error",
          title: "Errore",
          message: error.message,
          confirmText: "OK",
          onConfirm: () => setModal(null),
        });
        return;
      }
    } else {
      const { error } = await supabase.from("exams").insert(payload);

      if (error) {
        setModal({
          type: "error",
          title: "Errore",
          message: error.message,
          confirmText: "OK",
          onConfirm: () => setModal(null),
        });
        return;
      }
    }

    setTitle("");
    setExamDate("");
    setStatus("planned");
    setNumberPages(0);
    setEditingId(null);
    fetchExams();
  }

  function startEdit(exam) {
    setEditingId(exam.id);
    setTitle(exam.title);
    setExamDate(exam.exam_date);
    setStatus(exam.status || "planned");
    setNumberPages(exam.number_pages || 0);
  }

  async function deleteExam(id) {
    const { error } = await supabase.from("exams").delete().eq("id", id);

    if (error) {
      setModal({
        type: "error",
        title: "Errore",
        message: error.message,
        confirmText: "OK",
        onConfirm: () => setModal(null),
      });
      return;
    }

    setModal(null);
    fetchExams();
  }

  function getExamStatus(status) {
  switch (status) {
    case 'planned':
      return <span className="status planned">Pianificato</span>

    case 'in_progress':
      return <span className="status in_progress">In studio</span>

    case 'ready':
      return <span className="status ready">Pronta</span>

    case 'done':
      return <span className="status done">Superato</span>

    case 'failed':
      return <span className="status failed">Non superato</span>

    default:
      return <span className="status">N/D</span>
  }
}

  function daysLeft(date) {
    const today = new Date();
    const exam = new Date(date);
    const diff = exam - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
          <option value="failed">Non superato</option>
        </select>

        <input
          className="input"
          type="number"
          placeholder="num pagine"
          value={number_pages}
          onChange={(e) => setNumberPages(parseInt(e.target.value))}
          min="1"
        />

        <button className="btn-primary">
          {editingId ? "Salva" : "Aggiungi"}
        </button>
      </form>

      <div className="exam-grid">
        {exams.map((exam) => (
          <article key={exam.id} className="exam-card glass">
            <div className="exam-top">
              <div>
                <h2 className="exam-title">{exam.title}</h2>
                <p>{exam.exam_date}</p>
                    <p>  Stato: {getExamStatus(exam.status)}</p>

                {exam.number_pages > 0 && <p>📄 {exam.number_pages} pagine</p>}
              </div>

              <div className="exam-date">
                {(daysLeft(exam.exam_date) < 0) ? (
                  <>
                    <strong>Andato 🎉</strong>
                    <p>nel bene o nel male</p>
                  </>
                ) : (
                  <>
                    <strong>{daysLeft(exam.exam_date)}</strong>
                    <p>giorni</p>
                  </>
                )}
              </div>
            </div>

            <div className="exam-actions">
              <button className="edit-btn" onClick={() => startEdit(exam)}>
                Modifica
              </button>

              <button
                className="delete-btn"
                onClick={() =>
                  setModal({
                    type: "danger",
                    title: "Eliminare esame?",
                    message: `Stai per eliminare "${exam.title}". Questa azione non può essere annullata.`,
                    confirmText: "Elimina",
                    showCancel: true,
                    onConfirm: () => deleteExam(exam.id),
                  })
                }
              >
                Elimina
              </button>
            </div>
          </article>
        ))}
      </div>
      {modal && <AppModal {...modal} onCancel={() => setModal(null)} />}
    </div>
  );
}

export default Exams;
