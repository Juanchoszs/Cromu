import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { Pool } from "pg";

// Crear una conexión con la base de datos usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Esto es necesario si usas un servicio como Neon.tech o Heroku
  },
});

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Conexión exitosa:", result.rows[0]);
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  } finally {
    pool.end();
  }
})();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { cedula, password } = req.body;

  // Validar que los campos no estén vacíos
  if (!cedula || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  // Validar que la cédula tenga máximo 11 caracteres
  if (cedula.length > 11) {
    return res.status(400).json({ error: "La cédula no puede tener más de 11 caracteres." });
  }

  try {
    // Verificar si la cédula ya está registrada
    const result = await pool.query("SELECT * FROM usuarios WHERE cedula = $1", [cedula]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: "La cédula ya está registrada." });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario en la base de datos
    await pool.query(
      "INSERT INTO usuarios (cedula, password_hash, created_at) VALUES ($1, $2, NOW())",
      [cedula, hashedPassword]
    );

    return res.status(201).json({ message: "Usuario registrado con éxito." });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    return res.status(500).json({ error: "Error al registrar el usuario. Intente nuevamente." });
  }
}