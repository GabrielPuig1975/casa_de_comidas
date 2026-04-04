import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1342',
  database: process.env.DB_NAME || 'casa_comidas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Verificar conexión a la base de datos
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
};

testConnection();

// ============ RUTAS DE AUTENTICACIÓN ============
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('📝 Intento de login:', username);
    
    const [users] = await pool.execute(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      console.log('❌ Usuario no encontrado:', username);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    console.log('🔐 Contraseña válida:', validPassword);
    
    if (!validPassword) {
      console.log('❌ Contraseña incorrecta para:', username);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET || 'mi_secreto_super_seguro_2024',
      { expiresIn: '24h' }
    );
    
    console.log('✅ Login exitoso:', username);
    
    res.json({ 
      token, 
      user: { id: user.id, username: user.username, rol: user.rol } 
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ============ RUTAS DE PRODUCTOS ============
// Obtener todos los productos (público)
app.get('/api/productos', async (req, res) => {
  try {
    const [productos] = await pool.execute(
      'SELECT * FROM productos WHERE disponible = 1 ORDER BY categoria, nombre'
    );
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
  try {
    const [productos] = await pool.execute(
      'SELECT * FROM productos WHERE id = ?',
      [req.params.id]
    );
    
    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(productos[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Crear nuevo producto (solo admin)
app.post('/api/productos', authenticateToken, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      'INSERT INTO productos (nombre, descripcion, precio, imagen, categoria) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, imagen, categoria]
    );
    
    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Actualizar producto (solo admin)
app.put('/api/productos/:id', authenticateToken, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, disponible } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;
    
    let query = 'UPDATE productos SET nombre=?, descripcion=?, precio=?, categoria=?, disponible=?';
    let params = [nombre, descripcion, precio, categoria, disponible];
    
    if (imagen) {
      query += ', imagen=?';
      params.push(imagen);
    }
    
    query += ' WHERE id=?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto (solo admin)
app.delete('/api/productos/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM productos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// ============ CONFIGURACIÓN MERCADO PAGO (COMENTADO TEMPORALMENTE) ============
// 
// // Configurar cliente de Mercado Pago
// const mpClient = new MercadoPagoConfig({
//   accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'test_token'
// });
// 
// // Crear preferencia de pago
// app.post('/api/create-preference', async (req, res) => {
//   try {
//     const { items, total } = req.body;
//     
//     // Mapear items para Mercado Pago
//     const preferenceItems = items.map(item => ({
//       title: item.nombre,
//       quantity: Number(item.cantidad),
//       unit_price: Number(item.precio),
//       currency_id: 'ARS',
//     }));
//     
//     const preference = new Preference(mpClient);
//     
//     const body = {
//       items: preferenceItems,
//       back_urls: {
//         success: 'http://localhost:5173/pago-exitoso',
//         failure: 'http://localhost:5173/pago-fallido',
//         pending: 'http://localhost:5173/pago-pendiente'
//       },
//       auto_return: 'approved',
//       statement_descriptor: 'CASA DE COMIDAS',
//       external_reference: `pedido_${Date.now()}`,
//     };
//     
//     const response = await preference.create({ body });
//     res.json({
//       id: response.id,
//       init_point: response.init_point
//     });
//   } catch (error) {
//     console.error('Error al crear preferencia:', error);
//     res.status(500).json({ error: 'Error al crear la preferencia de pago' });
//   }
// });

// ============ SISTEMA DE PAGO SIMULADO (para pruebas) ============

// Crear preferencia de pago simulada
app.post('/api/create-preference', async (req, res) => {
  try {
    const { items, total } = req.body;
    
    // Simular una preferencia de pago
    const fakePreferenceId = `fake_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    console.log(`📝 Pago simulado creado: ${fakePreferenceId}`);
    console.log(`💰 Total: $${total}`);
    console.log(`📦 Items: ${items.length}`);
    
    res.json({
      id: fakePreferenceId,
      init_point: `http://localhost:5173/pago-simulado/${fakePreferenceId}?total=${total}`
    });
  } catch (error) {
    console.error('Error al crear pago simulado:', error);
    res.status(500).json({ error: 'Error al crear el pago' });
  }
});

// Verificar estado de pago simulado
app.get('/api/check-payment/:paymentId', async (req, res) => {
  try {
    // Simular que el pago siempre es aprobado después de 5 segundos
    const paymentId = req.params.paymentId;
    
    // Si el ID comienza con "fake_", consideramos que está pendiente
    if (paymentId.startsWith('fake_')) {
      // Simular aprobación después de cierto tiempo (opcional)
      res.json({
        status: 'approved',
        status_detail: 'accredited',
        id: paymentId
      });
    } else {
      res.json({
        status: 'approved',
        status_detail: 'accredited'
      });
    }
  } catch (error) {
    console.error('Error al verificar pago simulado:', error);
    res.status(500).json({ error: 'Error al verificar pago' });
  }
});

// ============ RUTAS DE CONFIGURACIÓN DE PAGOS ============

// Obtener configuración de pagos (pública)
app.get('/api/configuracion-pago', async (req, res) => {
  try {
    const [configs] = await pool.execute(
      'SELECT nombre_proveedor, configuracion, activo FROM configuraciones_pago WHERE activo = 1'
    );
    
    const configsSanitizadas = configs.map(config => {
      if (config.nombre_proveedor === 'mercadopago') {
        const configData = JSON.parse(config.configuracion);
        return {
          nombre_proveedor: config.nombre_proveedor,
          public_key: configData.public_key || '',
          activo: config.activo
        };
      }
      return config;
    });
    
    res.json(configsSanitizadas);
  } catch (error) {
    console.error('Error al obtener configuración de pago:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// Guardar configuración de pago (solo admin)
app.post('/api/configuracion-pago', authenticateToken, async (req, res) => {
  try {
    const { nombre_proveedor, configuracion } = req.body;
    
    const [existing] = await pool.execute(
      'SELECT id FROM configuraciones_pago WHERE nombre_proveedor = ?',
      [nombre_proveedor]
    );
    
    if (existing.length > 0) {
      await pool.execute(
        'UPDATE configuraciones_pago SET configuracion = ?, updated_at = NOW() WHERE nombre_proveedor = ?',
        [JSON.stringify(configuracion), nombre_proveedor]
      );
    } else {
      await pool.execute(
        'INSERT INTO configuraciones_pago (nombre_proveedor, configuracion) VALUES (?, ?)',
        [nombre_proveedor, JSON.stringify(configuracion)]
      );
    }
    
    res.json({ 
      message: 'Configuración guardada exitosamente',
      proveedor: nombre_proveedor
    });
  } catch (error) {
    console.error('Error al guardar configuración de pago:', error);
    res.status(500).json({ error: 'Error al guardar configuración' });
  }
});

// Obtener métodos de pago activos (público)
app.get('/api/metodos-pago', async (req, res) => {
  try {
    const [metodos] = await pool.execute(
      'SELECT id, nombre, icono, descripcion FROM metodos_pago WHERE activo = 1 ORDER BY orden'
    );
    res.json(metodos);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({ error: 'Error al obtener métodos de pago' });
  }
});

// Actualizar método de pago (solo admin)
app.put('/api/metodos-pago/:id', authenticateToken, async (req, res) => {
  try {
    const { activo, orden, nombre, descripcion, icono } = req.body;
    
    const updates = [];
    const values = [];
    
    if (activo !== undefined) {
      updates.push('activo = ?');
      values.push(activo);
    }
    if (orden !== undefined) {
      updates.push('orden = ?');
      values.push(orden);
    }
    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(descripcion);
    }
    if (icono !== undefined) {
      updates.push('icono = ?');
      values.push(icono);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    values.push(req.params.id);
    
    await pool.execute(
      `UPDATE metodos_pago SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Método de pago actualizado' });
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// Crear nuevo método de pago (solo admin)
app.post('/api/metodos-pago', authenticateToken, async (req, res) => {
  try {
    const { nombre, icono, descripcion, orden } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO metodos_pago (nombre, icono, descripcion, orden) VALUES (?, ?, ?, ?)',
      [nombre, icono, descripcion, orden || 999]
    );
    
    res.status(201).json({ 
      message: 'Método de pago creado',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear método de pago:', error);
    res.status(500).json({ error: 'Error al crear método de pago' });
  }
});

// Eliminar método de pago (solo admin)
app.delete('/api/metodos-pago/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM metodos_pago WHERE id = ?', [req.params.id]);
    res.json({ message: 'Método de pago eliminado' });
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});