export function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white text-center py-5">
        <div className="container">
          <h1 className="display-4 fw-bold">Bienvenido a Casa de Comidas</h1>
          <p className="lead">Lo mejor de la cocina casera, hecha con amor</p>
          <a href="/menu" className="btn btn-light btn-lg">Ver Menú</a>
        </div>
      </div>

      {/* Carrusel de imágenes */}
      <div className="container py-5">
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner rounded-4 shadow">
            <div className="carousel-item active">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop" 
                className="d-block w-100" 
                alt="Plato principal"
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded">
                <h5>Platos Especiales</h5>
                <p>Nuestras recetas más populares</p>
              </div>
            </div>
            <div className="carousel-item">
              <img 
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=400&fit=crop" 
                className="d-block w-100" 
                alt="Comida casera"
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded">
                <h5>Comida Casera</h5>
                <p>Hecha con ingredientes frescos</p>
              </div>
            </div>
            <div className="carousel-item">
              <img 
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=400&fit=crop" 
                className="d-block w-100" 
                alt="Pizzas artesanales"
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded">
                <h5>Pizzas Artesanales</h5>
                <p>Masa madre y ingredientes de primera</p>
              </div>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      </div>

      {/* Sección de características con cards */}
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <i className="bi bi-egg-fried fs-1 text-primary"></i>
                <h3 className="card-title mt-3">Comida Casera</h3>
                <p className="card-text text-muted">Recetas tradicionales con ingredientes frescos y de calidad</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <i className="bi bi-truck fs-1 text-primary"></i>
                <h3 className="card-title mt-3">Delivery Rápido</h3>
                <p className="card-text text-muted">Entregamos tu pedido en la puerta de tu casa</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <i className="bi bi-star-fill fs-1 text-primary"></i>
                <h3 className="card-title mt-3">Mejor Calidad</h3>
                <p className="card-text text-muted">Seleccionamos los mejores ingredientes para ti</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <div className="container">
          <p className="mb-0">&copy; 2024 Casa de Comidas. Todos los derechos reservados.</p>
          <small className="text-muted">Hecho con ❤️ para nuestra familia</small>
        </div>
      </footer>
    </div>
  )
}