import React, { useState, useEffect } from 'react'  // ← Primera línea
import axios from 'axios'
import toast from 'react-hot-toast'
// ... resto del código

export function AdminProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    disponible: true
  })
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState('')

  const token = localStorage.getItem('token')

  // Configurar axios con token
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }

  // Cargar productos
  const cargarProductos = async () => {
    try {
      const response = await axios.get('/api/productos')
      setProductos(response.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  // Manejar cambio de inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Manejar selección de imagen
  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagenFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Abrir modal para crear/editar
  const abrirModal = (producto = null) => {
    if (producto) {
      setEditando(producto)
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        categoria: producto.categoria || '',
        disponible: producto.disponible
      })
      if (producto.imagen) {
        setImagenPreview(`http://localhost:3000${producto.imagen}`)
      }
    } else {
      setEditando(null)
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        disponible: true
      })
      setImagenPreview('')
      setImagenFile(null)
    }
    setShowModal(true)
  }

  // Guardar producto (crear o editar)
  const guardarProducto = async (e) => {
    e.preventDefault()
    
    const formDataToSend = new FormData()
    formDataToSend.append('nombre', formData.nombre)
    formDataToSend.append('descripcion', formData.descripcion)
    formDataToSend.append('precio', formData.precio)
    formDataToSend.append('categoria', formData.categoria)
    formDataToSend.append('disponible', formData.disponible)
    
    if (imagenFile) {
      formDataToSend.append('imagen', imagenFile)
    }

    try {
      if (editando) {
        // Editar producto
        await axios.put(`/api/productos/${editando.id}`, formDataToSend, axiosConfig)
        toast.success('Producto actualizado exitosamente')
      } else {
        // Crear producto
        await axios.post('/api/productos', formDataToSend, axiosConfig)
        toast.success('Producto creado exitosamente')
      }
      
      setShowModal(false)
      cargarProductos()
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        disponible: true
      })
      setImagenFile(null)
      setImagenPreview('')
    } catch (error) {
      console.error('Error al guardar:', error)
      toast.error('Error al guardar el producto')
    }
  }

  // Eliminar producto
  const eliminarProducto = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      try {
        await axios.delete(`/api/productos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        toast.success('Producto eliminado exitosamente')
        cargarProductos()
      } catch (error) {
        console.error('Error al eliminar:', error)
        toast.error('Error al eliminar el producto')
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Productos</h2>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          <i className="bi bi-plus-circle"></i> Nuevo Producto
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>
                  {producto.imagen ? (
                    <img 
                      src={`http://localhost:3000${producto.imagen}`} 
                      alt={producto.nombre}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      className="rounded"
                    />
                  ) : (
                    <div className="bg-secondary rounded" style={{ width: '50px', height: '50px' }}></div>
                  )}
                </td>
                <td>{producto.nombre}</td>
                <td>
                  <span className="badge bg-info">{producto.categoria || 'Sin categoría'}</span>
                </td>
                <td>${producto.precio}</td>
                <td>
                  <span className={`badge ${producto.disponible ? 'bg-success' : 'bg-danger'}`}>
                    {producto.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => abrirModal(producto)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => eliminarProducto(producto.id, producto.nombre)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar producto */}
      {showModal && (
        <>
          <div 
            className="modal fade show d-block" 
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    {editando ? 'Editar Producto' : 'Nuevo Producto'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={guardarProducto}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Nombre *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Precio *</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        name="descripcion"
                        rows="3"
                        value={formData.descripcion}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Categoría</label>
                          <select
                            className="form-select"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                          >
                            <option value="">Seleccionar categoría</option>
                            <option value="Platos Principales">Platos Principales</option>
                            <option value="Pizzas">Pizzas</option>
                            <option value="Pastas">Pastas</option>
                            <option value="Ensaladas">Ensaladas</option>
                            <option value="Postres">Postres</option>
                            <option value="Bebidas">Bebidas</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Estado</label>
                          <select
                            className="form-select"
                            name="disponible"
                            value={formData.disponible}
                            onChange={handleChange}
                          >
                            <option value={true}>Disponible</option>
                            <option value={false}>No disponible</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Imagen</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImagenChange}
                      />
                      {imagenPreview && (
                        <div className="mt-2">
                          <img 
                            src={imagenPreview} 
                            alt="Preview" 
                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                            className="img-thumbnail"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editando ? 'Actualizar' : 'Crear'} Producto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}