import { useState } from 'react'
import { useCarritoStore } from '../store/carritoStore'
import { Link } from 'react-router-dom'

export function CarritoFlotante() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, eliminarProducto, actualizarCantidad, getTotal, getCantidadTotal, vaciarCarrito } = useCarritoStore()
  const cantidadTotal = getCantidadTotal()
  const total = getTotal()

  return (
    <>
      {/* Botón flotante del carrito */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="position-fixed bottom-0 end-0 m-4 btn btn-primary rounded-circle shadow-lg"
        style={{ width: '60px', height: '60px', zIndex: 1000 }}
      >
        <i className="bi bi-cart-fill fs-3"></i>
        {cantidadTotal > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {cantidadTotal}
          </span>
        )}
      </button>

      {/* Modal del carrito */}
      {isOpen && (
        <>
          <div 
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={() => setIsOpen(false)}
          ></div>
          <div 
            className="position-fixed end-0 top-0 h-100 bg-white shadow-lg"
            style={{ width: '400px', zIndex: 1050, overflowY: 'auto' }}
          >
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>
                  <i className="bi bi-cart-fill"></i> Mi Carrito
                </h3>
                <button 
                  className="btn-close"
                  onClick={() => setIsOpen(false)}
                ></button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x fs-1 text-muted"></i>
                  <p className="mt-3">Tu carrito está vacío</p>
                  <Link to="/menu" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                    Ver Menú
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="card mb-2">
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="mb-1">{item.nombre}</h6>
                              <small className="text-muted">${item.precio}</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                              >
                                -
                              </button>
                              <span className="mx-2">{item.cantidad}</span>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                              >
                                +
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => eliminarProducto(item.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <strong>Subtotal: ${(item.precio * item.cantidad).toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total:</strong>
                      <strong className="text-primary fs-4">${total.toFixed(2)}</strong>
                    </div>
                    
                    <Link 
                      to="/pago" 
                      className="btn btn-success w-100 mb-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <i className="bi bi-credit-card"></i> Proceder al Pago
                    </Link>
                    
                    <button 
                      className="btn btn-outline-danger w-100"
                      onClick={() => vaciarCarrito()}
                    >
                      Vaciar Carrito
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}