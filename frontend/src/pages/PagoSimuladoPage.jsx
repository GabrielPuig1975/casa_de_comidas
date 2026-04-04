import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCarritoStore } from '../store/carritoStore'

export function PagoSimuladoPage() {
  const { preferenceId } = useParams()
  const navigate = useNavigate()
  const { vaciarCarrito } = useCarritoStore()
  const [contador, setContador] = useState(5)
  
  // Obtener total de la URL
  const params = new URLSearchParams(window.location.search)
  const total = params.get('total')
  
  useEffect(() => {
    const timer = setInterval(() => {
      setContador((prev) => prev - 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Efecto separado para manejar cuando el contador llega a 0
  useEffect(() => {
    if (contador === 0) {
      vaciarCarrito()
      navigate('/pago-exitoso')
    }
  }, [contador, vaciarCarrito, navigate])
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow text-center">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Pago Simulado</h4>
            </div>
            <div className="card-body py-5">
              <i className="bi bi-credit-card fs-1 text-primary"></i>
              <h3 className="mt-3">Procesando pago...</h3>
              <p className="lead">Monto: ${total}</p>
              <div className="alert alert-info">
                <i className="bi bi-info-circle"></i> Esto es una simulación de pago
              </div>
              <div className="progress mb-3">
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated" 
                  style={{ width: `${(5 - contador) * 20}%` }}
                ></div>
              </div>
              <p>Redirigiendo en {contador} segundos...</p>
              <button 
                className="btn btn-secondary mt-3"
                onClick={() => navigate('/pago')}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}