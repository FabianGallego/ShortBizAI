"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReservasPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const pendientes = reservas.filter(r => r.estado === "Pendiente").length;
const confirmadas = reservas.filter(r => r.estado === "Confirmada").length;
const canceladas = reservas.filter(r => r.estado === "Cancelada").length;
const [fechaSeleccionada, setFechaSeleccionada] = useState("");
const [busqueda, setBusqueda] = useState("");
const [estadoSeleccionado, setEstadoSeleccionado] = useState("Todas");

const reservasFiltradas = reservas.filter((r) => {
  const coincideEstado =
    estadoSeleccionado === "Todas" ||
    r.estado === estadoSeleccionado;

  const coincideFecha =
    fechaSeleccionada === "" ||
    r.fecha === fechaSeleccionada;

  const coincideBusqueda =
    busqueda === "" ||
    r.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.telefono.includes(busqueda);

  return coincideEstado && coincideFecha && coincideBusqueda;
});
    async function cargarReservas() {
    const { data } = await supabase
      .from("reservas")
      .select("*")
      .order("id", { ascending: false });

    if (data) setReservas(data);
  }
async function confirmarReserva(id: number) {
  await supabase
    .from("reservas")
    .update({ estado: "Confirmada" })
    .eq("id", id);

  cargarReservas();
}

async function cancelarReserva(id: number) {
  await supabase
    .from("reservas")
    .update({ estado: "Cancelada" })
    .eq("id", id);

  cargarReservas();
}



  useEffect(() => {
    cargarReservas();
  }, []);

  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Reservas del restaurante
      </h1>
<div className="grid grid-cols-3 gap-4 mb-6">

  <div className="bg-yellow-400 rounded-lg p-4 text-center">
    <h2 className="text-xl font-bold">Pendientes</h2>
    <p className="text-4xl font-bold">{pendientes}</p>
  </div>

  <div className="bg-green-500 text-white rounded-lg p-4 text-center">
    <h2 className="text-xl font-bold">Confirmadas</h2>
    <p className="text-4xl font-bold">{confirmadas}</p>
  </div>

  <div className="bg-red-500 text-white rounded-lg p-4 text-center">
    <h2 className="text-xl font-bold">Canceladas</h2>
    <p className="text-4xl font-bold">{canceladas}</p>
  </div>

</div>
<input
  type="text"
  placeholder="Buscar por cliente o teléfono..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  className="border rounded-lg p-2 mb-4 w-full"
/>
<select
  value={estadoSeleccionado}
  onChange={(e) => setEstadoSeleccionado(e.target.value)}
  className="border rounded-lg p-2 mb-4 ml-2"
>
<option value="Todas">Todas</option>
<option value="Pendiente">Pendiente</option>
<option value="Confirmada">Confirmada</option>
<option value="Cancelada">Cancelada</option>
</select>
<input
  type="date"
  
  value={fechaSeleccionada}
  onChange={(e) => setFechaSeleccionada(e.target.value)}
/>
<p>Fecha seleccionada: {fechaSeleccionada}</p>
      <table className="w-full border">
        <thead>
  <tr>
    <th>Cliente</th>
    <th>Teléfono</th>
    <th>Fecha</th>
    <th>Hora</th>
    <th>Personas</th>
    <th>Estado</th>
    <th>Acciones</th>
  </tr>
</thead>

       <tbody>
       
  {reservasFiltradas.map((r) => (
    <tr key={r.id}>
      <td>{r.cliente_nombre}</td>
      <td>{r.telefono}</td>
      <td>{r.fecha}</td>
      <td>{r.hora}</td>
      <td>{r.personas}</td>

      <td>
  <span
    className={
      r.estado === "Confirmada"
        ? "bg-green-500 text-white px-2 py-1 rounded"
        : r.estado === "Cancelada"
        ? "bg-red-500 text-white px-2 py-1 rounded"
        : "bg-yellow-400 text-black px-2 py-1 rounded"
    }
    >
    {r.estado}
  </span>

  
</td>
      <td>
        <button
          onClick={() => confirmarReserva(r.id)}
          className="bg-green-600 text-white px-2 py-1 rounded mr-2"
        >
          Confirmar
        </button>

        <button
          onClick={() => cancelarReserva(r.id)}
          className="bg-red-600 text-white px-2 py-1 rounded"
        >
          Cancelar
        </button>
      </td>
    </tr>
  ))
  
  }
</tbody>
      </table>
    </div>
  );
}