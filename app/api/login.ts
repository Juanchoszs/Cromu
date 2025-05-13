import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const { cedula, password } = req.body;

    if (!cedula || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // --- Lógica para el admin ---
    if (cedula === "CromuAdmin" && password === "CromuAdministracion#") {
      return res.status(200).json({ message: "Inicio de sesión exitoso.", isAdmin: true });
    }

    // --- Lógica para usuarios normales ---
    const result = await pool.query("SELECT * FROM usuarios WHERE cedula = $1", [cedula]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Cédula o contraseña incorrecta." });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Cédula o contraseña incorrecta." });
    }

    return res.status(200).json({ message: "Inicio de sesión exitoso.", isAdmin: false });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ error: "Error en el servidor. Intente nuevamente." });
  }
}