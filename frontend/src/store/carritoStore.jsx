import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Agregar producto al carrito
      agregarProducto: (producto) => {
        const { items } = get()
        const existe = items.find(item => item.id === producto.id)
        
        if (existe) {
          set({
            items: items.map(item =>
              item.id === producto.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            )
          })
        } else {
          set({ items: [...items, { ...producto, cantidad: 1 }] })
        }
      },
      
      // Eliminar producto del carrito
      eliminarProducto: (id) => {
        set({ items: get().items.filter(item => item.id !== id) })
      },
      
      // Actualizar cantidad
      actualizarCantidad: (id, cantidad) => {
        if (cantidad <= 0) {
          get().eliminarProducto(id)
          return
        }
        set({
          items: get().items.map(item =>
            item.id === id ? { ...item, cantidad } : item
          )
        })
      },
      
      // Vaciar carrito
      vaciarCarrito: () => {
        set({ items: [] })
      },
      
      // Calcular total
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.precio * item.cantidad), 0)
      },
      
      // Obtener cantidad total de items
      getCantidadTotal: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0)
      }
    }),
    {
      name: 'carrito-storage', // nombre en localStorage
    }
  )
)