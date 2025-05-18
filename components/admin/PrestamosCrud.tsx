import React, { useState } from "react";

type EstadoPrestamo = "Activo" | "Pagado" | "Vencido";

interface Prestamo {
  id: string;
  nombreDeudor: string;
  cedula: string;
  telefono: string;
  direccion: string;
  monto: number;
  plazoMeses: number;
  tasaInteres: number;
  fechaDesembolso: string;
  estado: EstadoPrestamo;
  observaciones?: string;
}

export default function PrestamosCrud() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [form, setForm] = useState<Prestamo>({
    id: "",
    nombreDeudor: "",
    cedula: "",
    telefono: "",
    direccion: "",
    monto: 0,
    plazoMeses: 12,
    tasaInteres: 2,
    fechaDesembolso: "",
    estado: "Activo",
    observaciones: "",
  });
  const [editando, setEditando] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const limpiarForm = () => {
    setForm({
      id: "",
      nombreDeudor: "",
      cedula: "",
      telefono: "",
      direccion: "",
      monto: 0,
      plazoMeses: 12,
      tasaInteres: 2,
      fechaDesembolso: "",
      estado: "Activo",
      observaciones: "",
    });
    setEditando(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editando) {
      setPrestamos(prev =>
        prev.map(p => (p.id === editando ? { ...form, id: editando } : p))
      );
    } else {
      setPrestamos(prev => [
        ...prev,
        { ...form, id: Date.now().toString() },
      ]);
    }
    limpiarForm();
    setMostrarFormulario(false);
  };

  const handleEditar = (id: string) => {
    const prestamo = prestamos.find(p => p.id === id);
    if (prestamo) {
      setForm(prestamo);
      setEditando(id);
      setMostrarFormulario(true);
    }
  };

  const handleEliminar = (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este préstamo?")) {
      setPrestamos(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Préstamos</h2>
      <button
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={() => {
          limpiarForm();
          setMostrarFormulario(true);
        }}
      >
        Nuevo Préstamo
      </button>
      {mostrarFormulario && (
        <form
          className="bg-gray-800 p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <input
            className="p-2 border rounded"
            placeholder="Nombre del deudor"
            value={form.nombreDeudor}
            onChange={e => setForm(f => ({ ...f, nombreDeudor: e.target.value }))}
            required
          />
          <input
            className="p-2 border rounded"
            placeholder="Cédula"
            value={form.cedula}
            onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))}
            required
          />
          <input
            className="p-2 border rounded"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
          />
          <input
            className="p-2 border rounded"
            placeholder="Dirección"
            value={form.direccion}
            onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
          />
          <input
            className="p-2 border rounded"
            type="number"
            min={0}
            placeholder="Monto del préstamo"
            value={form.monto}
            onChange={e => setForm(f => ({ ...f, monto: Number(e.target.value) }))}
            required
          />
          <input
            className="p-2 border rounded"
            type="number"
            min={1}
            placeholder="Plazo (meses)"
            value={form.plazoMeses}
            onChange={e => setForm(f => ({ ...f, plazoMeses: Number(e.target.value) }))}
            required
          />
          <input
            className="p-2 border rounded"
            type="number"
            min={0}
            step={0.01}
            placeholder="Tasa de interés mensual (%)"
            value={form.tasaInteres}
            onChange={e => setForm(f => ({ ...f, tasaInteres: Number(e.target.value) }))}
            required
          />
          <input
            className="p-2 border rounded"
            type="date"
            placeholder="Fecha de desembolso"
            value={form.fechaDesembolso}
            onChange={e => setForm(f => ({ ...f, fechaDesembolso: e.target.value }))}
            required
          />
          <select
            className="p-2 border rounded"
            value={form.estado}
            onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoPrestamo }))}
          >
            <option value="Activo">Activo</option>
            <option value="Pagado">Pagado</option>
            <option value="Vencido">Vencido</option>
          </select>
          <textarea
            className="p-2 border rounded md:col-span-2"
            placeholder="Observaciones"
            value={form.observaciones}
            onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
          />
          <div className="md:col-span-2 flex gap-2">
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
              type="submit"
            >
              {editando ? "Actualizar" : "Guardar"}
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              type="button"
              onClick={() => {
                limpiarForm();
                setMostrarFormulario(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prestamos.map(prestamo => (
          <div
            key={prestamo.id}
            className="bg-blue-900 p-4 rounded shadow flex flex-col gap-2 border border-blue-700"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">{prestamo.nombreDeudor}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  prestamo.estado === "Activo"
                    ? "bg-emerald-200 text-emerald-900"
                    : prestamo.estado === "Pagado"
                    ? "bg-emerald-600 text-white"
                    : "bg-red-400 text-white"
                }`}
              >
                {prestamo.estado}
              </span>
            </div>
            <div className="text-xs text-gray-200">
              <p>Cédula: {prestamo.cedula}</p>
              <p>Teléfono: {prestamo.telefono}</p>
              <p>Dirección: {prestamo.direccion}</p>
              <p>Monto: <span className="font-semibold">${prestamo.monto.toLocaleString()}</span></p>
              <p>Plazo: {prestamo.plazoMeses} meses</p>
              <p>Tasa interés: {prestamo.tasaInteres}% mensual</p>
              <p>Fecha desembolso: {prestamo.fechaDesembolso}</p>
              {prestamo.observaciones && (
                <p className="italic text-gray-300">Obs: {prestamo.observaciones}</p>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1 rounded"
                onClick={() => handleEditar(prestamo.id)}
              >
                Editar
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-1 rounded"
                onClick={() => handleEliminar(prestamo.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}