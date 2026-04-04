import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import QRCode from 'qrcode.react'
import { useCarritoStore } from '../store/carritoStore'

export function PagoQRPage() {
  const { preferenceId } = useParams()
  const navigate = useNavigate()
  const { vaciarCarrito } = useCarritoStore()
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [checking, setChecking] = useState(true)
  
  // Verificar estado del pago cada 3 segundos
  useEffect(() => {
    const checkPayment = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/check-payment/${preferenceId}`)
        
        if (response.data.status === 'approved') {
          setPaymentStatus('approved')
          vaciarCarrito()
          clearInterval(checkPayment)
          setTimeout(() => {
            navigate('/pago-exitoso')
          }, 2000)
        } else if (response.data.status === 'rejected') {
          setPaymentStatus('rejected')
          clearInterval(checkPayment)
        }
      } catch (error) {
        console.error('Error al verificar pago:', error)
      } finally {
        setChecking(false)
      }
    }, 3000)
    
    return () => clearInterval(checkPayment)
  }, [preferenceId, navigate, vaciarCarrito])
  
  const qrValue = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow text-center">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Pago con Código QR</h4>
            </div>
            <div className="card-body py-5">
              {paymentStatus === 'pending' && (
                <>
                  <div className="mb-4">
                    <QRCode 
                      value={qrValue} 
                      size={250}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-muted">
                    Escanea este código QR con tu aplicación de Mercado Pago o cualquier app bancaria
                  </p>
                  <div className="alert alert-info">
                    <i className="bi bi-clock"></i> Esperando confirmación de pago...
                  </div>
                  {checking && (
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Verificando pago...</span>
                    </div>
                  )}
                </>
              )}
              
              {paymentStatus === 'approved' && (
                <div className="text-success">
                  <i className="bi bi-check-circle-fill fs-1"></i>
                  <h3 className="mt-3">¡Pago Completado!</h3>
                  <p>Redirigiendo...</p>
                </div>
              )}
              
              {paymentStatus === 'rejected' && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill fs-1"></i>
                  <h3 className="mt-3">Pago Rechazado</h3>
                  <p>El pago no pudo ser procesado. Intenta nuevamente.</p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => navigate('/pago')}
                  >
                    Volver a intentar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}