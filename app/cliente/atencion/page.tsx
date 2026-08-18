"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AtencionPage() {
  const [reservas, setReservas] = useState<any[]>([]);

  const [clienteNombre, setClienteNombre] = useState("");
const [telefono, setTelefono] = useState("");
const [fecha, setFecha] = useState("");
const [hora, setHora] = useState("");
const [personas, setPersonas] = useState(1);

const [editandoId, setEditandoId] = useState<number | null>(null);


  useEffect(() => {
    cargarReservas();
  }, []);
  
async function guardarReserva() {
alert("Entró a guardarReserva");
  if (editandoId) {
    const { error } = await supabase
      .from("reservas")
      .update({
        cliente_nombre: clienteNombre,
        telefono,
        fecha,
        hora,
        personas,
      })
      .eq("id", editandoId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditandoId(null);

  } else {
    const { error } = await supabase
      .from("reservas")
      .insert({
        cliente_nombre: clienteNombre,
        telefono,
        fecha,
        hora,
        personas,
      });

    if (error) {
      alert(error.message);
      return;
    }
  }

  setClienteNombre("");
  setTelefono("");
  setFecha("");
  setHora("");
  setPersonas(1);

  cargarReservas();
}

async function cancelarReserva(id: number) {
  const { error } = await supabase
    .from("reservas")
    .update({ estado: "Cancelada" })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  cargarReservas();
}

  async function cargarReservas() {
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReservas(data);
    }
  }

async function confirmarReserva(id: number) {
  alert("Confirmando reserva " + id);

  const { data, error } = await supabase
  .from("reservas")
  .update({ estado: "Confirmada" })
  .eq("id", id)
  .select();

console.log("UPDATE:", data, error);

    if (error) {
  console.error(error);
  alert(error.message);
  return;
}

alert("Reserva confirmada");

 

  cargarReservas();
}

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📅 Módulo Atención</h1>

<div className="mb-8 border rounded-lg p-4 shadow">

    
  <h2 className="text-xl font-semibold mb-4">
    ➕ Nueva Reserva
  </h2>

  <input
    type="text"
    placeholder="Nombre del cliente"
    value={clienteNombre}
    onChange={(e) => setClienteNombre(e.target.value)}
    className="w-full border p-2 rounded mb-3"
  />

  <input
    type="text"
    placeholder="Teléfono"
    value={telefono}
    onChange={(e) => setTelefono(e.target.value)}
    className="w-full border p-2 rounded mb-3"
  />

  <input
    type="date"
    value={fecha}
    onChange={(e) => setFecha(e.target.value)}
    className="w-full border p-2 rounded mb-3"
  />

  <input
    type="time"
    value={hora}
    onChange={(e) => setHora(e.target.value)}
    className="w-full border p-2 rounded mb-3"
  />

  <input
    type="number"
    min="1"
    value={personas}
    onChange={(e) => setPersonas(Number(e.target.value))}
    className="w-full border p-2 rounded mb-3"
  />

<button
  onClick={guardarReserva}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  {editandoId !== null ? "Actualizar Reserva" : "Guardar Reserva"}
</button>
</div>

      {reservas.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        reservas.map((reserva) => (
          <div
            key={reserva.id}
            className="border rounded-lg p-4 mb-4 shadow"
          >
            <h2 className="font-bold">{reserva.cliente_nombre}</h2>
            <p>📞 {reserva.telefono}</p>
            <p>📅 {reserva.fecha}</p>
            <p>🕒 {reserva.hora}</p>
            <p>👥 {reserva.personas} personas</p>


            <div className="mt-2">
  {reserva.estado === "Confirmada" && (
    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
      🟢 Confirmada
    </span>
  )}

  {reserva.estado === "Pendiente" && (
    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
      🟡 Pendiente
    </span>
  )}

  {reserva.estado === "Cancelada" && (
    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
      🔴 Cancelada
    </span>
  )}
</div>
            
<button
  onClick={() => confirmarReserva(reserva.id)}
  className="mt-3 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
>
  ✅ Confirmar
</button>
<button
  onClick={() => cancelarReserva(reserva.id)}
  className="mt-3 ml-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
>
  ❌ Cancelar
</button>

<button
  onClick={() => {
    

    setEditandoId(reserva.id);
    setClienteNombre(reserva.cliente_nombre ?? "");
    setTelefono(reserva.telefono ?? "");
    setFecha(reserva.fecha ?? "");
    setHora(reserva.hora ?? "");
    setPersonas(reserva.personas ?? 1);
  }}
  className="mt-3 ml-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
>
  ✏️ Editar
</button>

          </div>
          
        ))
      )}
    </div>
  );
}