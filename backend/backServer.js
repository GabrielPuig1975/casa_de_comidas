import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
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
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de PostgreSQL (Supabase)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false } // Necesario para Supabase
});

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
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL (Supabase)');
    client.release();
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
  }
};

testConnection();

// ============ RUTAS DE AUTENTICACIÓN ============
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('📝 Intento de login:', username);
    
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', username);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
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
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM productos WHERE disponible = true ORDER BY categoria, nombre'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/productos/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

app.post('/api/productos', authenticateToken, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, imagen, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nombre, descripcion, precio, imagen, categoria]
    );
    
    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.put('/api/productos/:id', authenticateToken, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, disponible } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;
    
    let query = 'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, disponible=$5';
    let params = [nombre, descripcion, precio, categoria, disponible];
    let paramCount = 6;
    
    if (imagen) {
      query += `, imagen=$${paramCount}`;
      params.push(imagen);
      paramCount++;
    }
    
    query += ` WHERE id=$${paramCount}`;
    params.push(req.params.id);
    
    await pool.query(query, params);
    
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

app.delete('/api/productos/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});