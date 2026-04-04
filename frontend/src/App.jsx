import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { MenuPage } from './pages/MenuPage'
import { AdminPage } from './pages/AdminPage'
import { PagoPage } from './pages/PagoPage'
import { PagoQRPage } from './pages/PagoQRPage'
import { PagoExitosoPage } from './pages/PagoExitosoPage'
import { AdminRoute } from './components/AdminRoute'
import { CarritoFlotante } from './components/CarritoFlotante'
import { Toaster } from 'react-hot-toast'
import './App.css'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="app">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">
              🍽️ Casa de Comidas
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Inicio</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/menu">Menú</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Admin</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/pago" element={<PagoPage />} />
          <Route path="/pago-qr/:preferenceId" element={<PagoQRPage />} />
          <Route path="/pago-exitoso" element={<PagoExitosoPage />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
        </Routes>
        
        <CarritoFlotante />
      </div>
    </Router>
  )
}

export default App