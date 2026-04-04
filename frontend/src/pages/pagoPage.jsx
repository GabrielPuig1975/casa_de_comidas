import { useState } from 'react'
import { useCarritoStore } from '../store/carritoStore'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export function PagoPage() {
  const { items, getTotal, vaciarCarrito } = useCarritoStore()
  const [metodoPago, setMetodoPago] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  const total = getTotal()
  
  // Procesar pago con Mercado Pago
  const handlePagoMercadoPago = async () => {
    setProcesando(true)
    setError('')
    
    try {
      const response = await axios.post('http://localhost:3000/api/create-preference', {
        items: items.map(item => ({
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio
        })),
        total: total
      })
      
      // Redirigir a Mercado Pago
      window.location.href = response.data.init_point
    } catch (error) {
      console.error('Error:', error)
      setError('Error al procesar el pago. Intenta nuevamente.')
    } finally {
      setProcesando(false)
    }
  }
  
  // Generar QR para pago (usando Mercado Pago)
  const handleGenerarQR = async () => {
    setProcesando(true)
    setError('')
    
    try {
      const response = await axios.post('http://localhost:3000/api/create-preference', {
        items: items.map(item => ({
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio
        })),
        total: total
      })
      
      // Guardar la preferencia ID para el QR
      const preferenceId = response.data.id
      
      // Redirigir a página de QR con el ID
      navigate(`/pago-qr/${preferenceId}`)
    } catch (error) {
      console.error('Error:', error)
      setError('Error al generar el código QR')
    } finally {
      setProcesando(false)
    }
  }
  
  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <i className="bi bi-cart-x fs-1"></i>
          <h3>Tu carrito está vacío</h3>
          <Link to="/menu" className="btn btn-primary mt-3">
            Ir al Menú
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Detalle del Pedido</h4>
            </div>
            <div className="card-body">
              {items.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>
                    {item.nombre} x {item.cantidad}
                  </span>
                  <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span className="text-primary fs-4">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Método de Pago</h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
              
              <div className="mb-4">
                <button 
                  className="btn btn-primary w-100 mb-3 py-3"
                  onClick={handlePagoMercadoPago}
                  disabled={procesando}
                >
                  {procesando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Redirigiendo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card"></i> Pagar con Tarjeta
                    </>
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-primary w-100 py-3"
                  onClick={handleGenerarQR}
                  disabled={procesando}
                >
                  <i className="bi bi-qr-code"></i> Pagar con Código QR
                </button>
              </div>
              
              <div className="alert alert-info">
                <i className="bi bi-shield-check"></i>
                <small> Pago 100% seguro a través de Mercado Pago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}