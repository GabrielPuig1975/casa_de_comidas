import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export function AdminProductosSimple() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await fetch('/api/productos')
        const data = await response.json()
        setProductos(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }
    cargarProductos()
  }, [])

  if (loading) {
    return <div className="text-center py-5">Cargando...</div>
  }

  return (
    <div>
      <h2>Productos ({productos.length})</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>${p.precio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}