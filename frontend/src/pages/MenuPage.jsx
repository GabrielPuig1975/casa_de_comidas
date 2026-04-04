import { useState, useEffect } from 'react'
import axios from 'axios'
import { useCarritoStore } from '../store/carritoStore'

export function MenuPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos')
  const [categorias, setCategorias] = useState([])
  const { agregarProducto } = useCarritoStore()

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await axios.get('/api/productos')
        setProductos(response.data)
        
        // Extraer categorías únicas
        const cats = ['todos', ...new Set(response.data.map(p => p.categoria).filter(Boolean))]
        setCategorias(cats)
      } catch (error) {
        console.error('Error al cargar productos:', error)
      } finally {
        setLoading(false)
      }
    }
    cargarProductos()
  }, [])

  const productosFiltrados = categoriaSeleccionada === 'todos' 
    ? productos 
    : productos.filter(p => p.categoria === categoriaSeleccionada)

  const handleAgregarAlCarrito = (producto) => {
    agregarProducto(producto)
    // Mostrar notificación (opcional)
    const toast = document.createElement('div')
    toast.className = 'position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-success alert-dismissible fade show'
    toast.role = 'alert'
    toast.innerHTML = `
      ✅ ${producto.nombre} agregado al carrito
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 2000)
  }

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">Nuestro Menú</h1>
      
      {/* Filtros por categoría */}
      <div className="mb-4 text-center">
        <div className="btn-group" role="group">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`btn ${categoriaSeleccionada === cat ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {productosFiltrados.length === 0 ? (
        <div className="alert alert-info text-center">
          No hay productos en esta categoría.
        </div>
      ) : (
        <div className="row g-4">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {producto.imagen && (
                  <img 
                    src={`http://localhost:3000${producto.imagen}`} 
                    className="card-img-top" 
                    alt={producto.nombre}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{producto.nombre}</h5>
                  <p className="card-text text-muted">{producto.descripcion}</p>
                  <p className="card-text">
                    <span className="badge bg-secondary">{producto.categoria}</span>
                  </p>
                  <h4 className="text-primary">${producto.precio}</h4>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => handleAgregarAlCarrito(producto)}
                  >
                    <i className="bi bi-cart-plus"></i> Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}