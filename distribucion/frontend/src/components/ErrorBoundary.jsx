import React from 'react'  // ← Importar React aquí también

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">¡Algo salió mal!</h4>
            <p>Ha ocurrido un error en la aplicación. Por favor, recarga la página.</p>
            <hr />
            <details className="mt-3">
              <summary>Ver detalles técnicos</summary>
              <pre className="mt-2 text-danger">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary