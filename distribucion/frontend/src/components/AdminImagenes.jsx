import React, { useState, useEffect } from 'react'  // ← Primera línea
import axios from 'axios'
import toast from 'react-hot-toast'
// ... resto del código

export function AdminImagenes() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState('')

  const token = localStorage.getItem('token')

  const cargarProductos = async () => {
    try {
      const response = await axios.get('/api/productos')
      setProductos(response.data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

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

  const subirImagen = async (e) => {
    e.preventDefault()
    if (!selectedProducto || !imagenFile) {
      toast.error('Selecciona un producto y una imagen')
      return
    }

    const formData = new FormData()
    formData.append('imagen', imagenFile)
    formData.append('nombre', selectedProducto.nombre)
    formData.append('descripcion', selectedProducto.descripcion)
    formData.append('precio', selectedProducto.precio)
    formData.append('categoria', selectedProducto.categoria)
    formData.append('disponible', selectedProducto.disponible)

    try {
      await axios.put(`/api/productos/${selectedProducto.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Imagen actualizada exitosamente')
      setImagenFile(null)
      setImagenPreview('')
      cargarProductos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al subir la imagen')
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
      <h2 className="mb-4">Galería de Imágenes</h2>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Seleccionar Producto</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {productos.map(producto => (
                  <button
                    key={producto.id}
                    className={`list-group-item list-group-item-action ${selectedProducto?.id === producto.id ? 'active' : ''}`}
                    onClick={() => setSelectedProducto(producto)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{producto.nombre}</strong>
                        <br />
                        <small>${producto.precio}</small>
                      </div>
                      {producto.imagen && (
                        <img 
                          src={`http://localhost:3000${producto.imagen}`} 
                          alt={producto.nombre}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          className="rounded"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Subir/Actualizar Imagen</h5>
            </div>
            <div className="card-body">
              {selectedProducto ? (
                <form onSubmit={subirImagen}>
                  <div className="mb-3">
                    <label className="form-label">
                      Producto: <strong>{selectedProducto.nombre}</strong>
                    </label>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Seleccionar imagen</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImagenChange}
                      required
                    />
                  </div>

                  {imagenPreview && (
                    <div className="mb-3 text-center">
                      <img 
                        src={imagenPreview} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                        className="img-thumbnail"
                      />
                    </div>
                  )}

                  {selectedProducto.imagen && !imagenPreview && (
                    <div className="mb-3 text-center">
                      <p>Imagen actual:</p>
                      <img 
                        src={`http://localhost:3000${selectedProducto.imagen}`} 
                        alt={selectedProducto.nombre}
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                        className="img-thumbnail"
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-success w-100">
                    <i className="bi bi-cloud-upload"></i> Subir Imagen
                  </button>
                </form>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-image fs-1"></i>
                  <p className="mt-3">Selecciona un producto para gestionar su imagen</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}