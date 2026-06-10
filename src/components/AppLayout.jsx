import Navbar from './Navbar.jsx'
import '../assets/styles/layout.css'

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default AppLayout