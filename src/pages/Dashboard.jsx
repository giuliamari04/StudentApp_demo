function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-400">Bentornata 👋</p>
        <h1 className="text-4xl font-bold">La tua giornata di studio</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">Corsi attivi</p>
          <h2 className="mt-2 text-3xl font-bold">4</h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">Prossimi esami</p>
          <h2 className="mt-2 text-3xl font-bold">2</h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">Task oggi</p>
          <h2 className="mt-2 text-3xl font-bold">7</h2>
        </div>

        <div className="rounded-2xl bg-indigo-600 p-6">
          <p className="text-indigo-100">Minuti studiati</p>
          <h2 className="mt-2 text-3xl font-bold">120</h2>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-bold">Task di oggi</h2>
          <ul className="space-y-3">
            <li className="rounded-xl bg-slate-800 p-4">Ripassare SQL</li>
            <li className="rounded-xl bg-slate-800 p-4">Studiare React Router</li>
            <li className="rounded-xl bg-slate-800 p-4">Preparare appunti esame</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-bold">Prossimi esami</h2>
          <ul className="space-y-3">
            <li className="rounded-xl bg-slate-800 p-4">
              Programmazione Web — 20 Giugno
            </li>
            <li className="rounded-xl bg-slate-800 p-4">
              Basi di Dati — 28 Giugno
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Dashboard