import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testLogin = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1342',
      database: process.env.DB_NAME || 'casa_comidas',
    });

    // Verificar si existe el usuario
    const [users] = await pool.execute(
      'SELECT * FROM usuarios WHERE username = ?',
      ['admin']
    );
    
    console.log('Usuario encontrado:', users.length > 0 ? 'Sí' : 'No');
    
    if (users.length > 0) {
      console.log('Usuario:', users[0].username);
      console.log('Password hash:', users[0].password);
      
      // Probar la contraseña admin123
      const isValid = await bcrypt.compare('admin123', users[0].password);
      console.log('¿Contraseña admin123 es válida?', isValid);
      
      // Si no es válida, crear un nuevo hash
      if (!isValid) {
        const newHash = await bcrypt.hash('admin123', 10);
        console.log('Nuevo hash para admin123:', newHash);
        
        // Actualizar la contraseña
        await pool.execute(
          'UPDATE usuarios SET password = ? WHERE username = ?',
          [newHash, 'admin']
        );
        console.log('✅ Contraseña actualizada');
      }
    } else {
      // Crear usuario si no existe
      const hash = await bcrypt.hash('admin123', 10);
      await pool.execute(
        'INSERT INTO usuarios (username, password) VALUES (?, ?)',
        ['admin', hash]
      );
      console.log('✅ Usuario admin creado con contraseña: admin123');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testLogin();