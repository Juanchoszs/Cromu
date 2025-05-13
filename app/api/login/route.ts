import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Pool } from "pg";

// Conexión a PostgreSQL usando Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cedula, password } = body;

    if (!cedula || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    const result = await pool.query("SELECT * FROM usuarios WHERE cedula = $1", [cedula]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cédula o contraseña incorrecta." }, { status: 400 });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Cédula o contraseña incorrecta." }, { status: 400 });
    }

    return NextResponse.json({ message: "Inicio de sesión exitoso.", "isAdmin": true }, { status: 200 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      { error: "Error en el servidor. Intente nuevamente." },
      { status: 500 }
    );
  }
}
