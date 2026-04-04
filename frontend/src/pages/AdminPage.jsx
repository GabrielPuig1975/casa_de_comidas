import React, { useState, useEffect } from 'react'  // ← Importar React así
import { AdminProductos } from '../components/AdminProductos'
import { AdminImagenes } from '../components/AdminImagenes'
import { Toaster } from 'react-hot-toast'

// Definir ErrorBoundary como clase ANTES de usarlo
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error en componente:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle"></i> Error al cargar este componente.
          <button 
            className="btn btn-sm btn-warning ms-3"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token')
    return !!token
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('productos')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        setIsAuthenticated(true)
        setError('')
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      console.error('Error de conexión:', err)
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <Toaster position="top-right" />
        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Acceso Administrador</h4>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Usuario</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input 
                      type="password" 
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <Toaster position="top-right" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Panel de Administración</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
        </button>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            <i className="bi bi-grid"></i> Productos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'imagenes' ? 'active' : ''}`}
            onClick={() => setActiveTab('imagenes')}
          >
            <i className="bi bi-images"></i> Galería de Imágenes
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'productos' && (
          <ErrorBoundary>
            <AdminProductos />
          </ErrorBoundary>
        )}
        {activeTab === 'imagenes' && (
          <ErrorBoundary>
            <AdminImagenes />
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}