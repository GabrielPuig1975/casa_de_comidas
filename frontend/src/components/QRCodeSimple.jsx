// Componente QR simple sin dependencias externas
export function QRCodeSimple({ value, size = 200 }) {
  // Este es un componente visual que simula un QR
  // En producción, usarías una API real de generación de QR
  return (
    <div className="text-center">
      <div 
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ddd',
          borderRadius: '10px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <i className="bi bi-qr-code" style={{ fontSize: '80px', color: '#000' }}></i>
          <div style={{ fontSize: '12px', marginTop: '10px', wordBreak: 'break-all', padding: '10px' }}>
            {value.substring(0, 50)}...
          </div>
        </div>
      </div>
      <p className="mt-2 text-muted small">
        Código QR Simulado<br/>
        Valor: {value}
      </p>
    </div>
  )
}