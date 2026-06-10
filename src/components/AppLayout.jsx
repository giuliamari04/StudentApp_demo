import Navbar from './Navbar.jsx'

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="p-6 md:ml-64">
        {children}
      </main>
    </div>
  )
}

export default AppLayout