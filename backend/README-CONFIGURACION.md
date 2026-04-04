# Configuración de Métodos de Pago

## Configurar Mercado Pago

1. Crear cuenta en [Mercado Pago Developers](https://developers.mercadopago.com/)
2. Ir a "Mis credenciales"
3. Copiar:
   - Access Token (APP_USR-xxxx-xxxx)
   - Public Key (APP_USR-xxxx-xxxx)
4. En el panel admin → Métodos de Pago → Mercado Pago
5. Pegar las credenciales y guardar

## Activar/Desactivar Métodos de Pago

1. Ir a Panel Admin → Métodos de Pago
2. Usar los botones "Activar/Desactivar" según necesidad

## Agregar Nuevo Método de Pago Personalizado

Desde el panel admin puedes agregar:
- Transferencia bancaria
- Efectivo
- Criptomonedas
- Cualquier otro método

## Base de Datos

Las configuraciones se guardan en la tabla `configuraciones_pago`
Los métodos de pago se guardan en `metodos_pago`