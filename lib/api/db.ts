import { Pool } from 'pg';

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://cromu_db_owner:npg_jG1koHu2SxUv@ep-orange-bread-a4o6r5h6-pooler.us-east-1.aws.neon.tech/cromu_db?sslmode=require',
  ssl: {
    rejectUnauthorized: false // Necesario para conexiones a Neon
  }
});

// Evento para manejar errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL', err);
  process.exit(-1);
});

export default pool;