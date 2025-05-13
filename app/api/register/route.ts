import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { Pool } from "pg";

// Configura tu conexión a Neon (usa variables de entorno)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL='postgresql://cromu_db_owner:npg_jG1koHu2SxUv@ep-orange-bread-a4o6r5h6-pooler.us-east-1.aws.neon.tech/cromu_db?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: Request) {
  try {
    const { cedula, password } = await req.json();

    if (!cedula || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Hashear contraseña
    const passwordHash = await hash(password, 10);

    // Insertar en la base de datos
    const client = await pool.connect();

    try {
      const result = await client.query(
        `INSERT INTO usuarios (cedula, password_hash) VALUES ($1, $2) RETURNING id`,
        [cedula, passwordHash]
      );

      return NextResponse.json({ success: true, userId: result.rows[0].id }, { status: 201 });
    } catch (dbError: any) {
      if (dbError.code === "23505") {
        return NextResponse.json({ error: "Cédula ya registrada" }, { status: 409 });
      }
      return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
