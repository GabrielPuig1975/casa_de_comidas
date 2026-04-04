import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useCarritoStore } from '../store/carritoStore'

export function PagoExitosoPage() {
  const { vaciarCarrito } = useCarritoStore()
  
  useEffect(() => {
    vaciarCarrito()
  }, [vaciarCarrito])
  
  return (
    <div className="container py-5 text-center">
      <div className="alert alert-success">
        <i className="bi bi-check-circle-fill fs-1"></i>
        <h3 className="mt-3">¡Pago Completado Exitosamente!</h3>
        <p className="lead">Gracias por tu compra.</p>
        <hr />
        <Link to="/" className="btn btn-primary">
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}