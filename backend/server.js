import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';

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

// ============ CONFIGURACIÓN MERCADO PAGO ============
import mercadopago from 'mercadopago';

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Crear preferencia de pago
app.post('/api/create-preference', async (req, res) => {
  try {
    const { items, total } = req.body;
    
    // Mapear items para Mercado Pago
    const preferenceItems = items.map(item => ({
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: parseFloat(item.precio),
      currency_id: 'ARS', // Cambiar según tu país: ARS, MXN, COP, etc.
    }));
    
    const preference = {
      items: preferenceItems,
      back_urls: {
        success: 'http://localhost:5173/pago-exitoso',
        failure: 'http://localhost:5173/pago-fallido',
        pending: 'http://localhost:5173/pago-pendiente'
      },
      auto_return: 'approved',
      notification_url: 'http://localhost:3000/api/webhook',
      statement_descriptor: 'CASA DE COMIDAS',
      external_reference: `pedido_${Date.now()}`,
    };
    
    const response = await mercadopago.preferences.create(preference);
    res.json({
      id: response.body.id,
      init_point: response.body.init_point
    });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
});

// Webhook para recibir notificaciones de pago
app.post('/api/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      const payment = await mercadopago.payment.findById(paymentId);
      
      if (payment.body.status === 'approved') {
        // Aquí actualizas tu base de datos, envías email, etc.
        console.log(`✅ Pago aprobado: ${paymentId}`);
        console.log(`Pedido: ${payment.body.external_reference}`);
        console.log(`Monto: ${payment.body.transaction_amount}`);
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).send('Error');
  }
});

// Verificar estado de pago
app.get('/api/check-payment/:paymentId', async (req, res) => {
  try {
    const payment = await mercadopago.payment.findById(req.params.paymentId);
    res.json({
      status: payment.body.status,
      status_detail: payment.body.status_detail
    });
  } catch (error) {
    console.error('Error al verificar pago:', error);
    res.status(500).json({ error: 'Error al verificar pago' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});