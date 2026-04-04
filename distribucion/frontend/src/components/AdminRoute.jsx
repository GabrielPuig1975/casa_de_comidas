// Por ahora es simple, después implementarás autenticación real
export function AdminRoute({ children }) {
  // Aquí verificarás si el usuario está autenticado
  const isAdmin = true // Temporal
  
  if (!isAdmin) {
    return <div>Acceso denegado</div>
  }
  
  return children
}