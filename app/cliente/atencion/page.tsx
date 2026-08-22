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
    if (editandoId !== null) {
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

    cargarReservas();
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ENCABEZADO */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950">
            📅 Módulo Atención
          </h1>

          <p className="mt-2 text-gray-600 text-base sm:text-lg">
            Administra las reservas de tus clientes.
          </p>
        </div>


        {/* FORMULARIO NUEVA RESERVA */}
        <section className="mb-10 bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              ➕ Nueva Reserva
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Completa la información de la reserva.
            </p>
          </div>


          <div className="space-y-4">

            {/* NOMBRE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del cliente
              </label>

              <input
                type="text"
                placeholder="Nombre del cliente"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>


            {/* TELEFONO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>

              <input
                type="text"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>


            {/* FECHA Y HORA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha
                </label>

                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hora
                </label>

                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

            </div>


            {/* PERSONAS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de personas
              </label>

              <input
                type="number"
                min="1"
                value={personas}
                onChange={(e) => setPersonas(Number(e.target.value))}
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>


            {/* BOTÓN GUARDAR */}
            <div className="pt-2">

              <button
                onClick={guardarReserva}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {editandoId !== null
                  ? "Actualizar Reserva"
                  : "Guardar Reserva"}
              </button>

            </div>

          </div>

        </section>


        {/* LISTADO DE RESERVAS */}
        <section>

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-2xl font-bold text-gray-950">
              Reservas
            </h2>

            <span className="text-sm text-gray-500">
              {reservas.length}{" "}
              {reservas.length === 1 ? "reserva" : "reservas"}
            </span>

          </div>


          {reservas.length === 0 ? (

            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">

              <p className="text-gray-500">
                No hay reservas registradas.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {reservas.map((reserva) => (

                <article
                  key={reserva.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm"
                >

                  {/* INFORMACIÓN */}
                  <div>

                    <h3 className="text-xl font-bold text-gray-950 mb-4">
                      {reserva.cliente_nombre}
                    </h3>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">

                      <p>
                        📞{" "}
                        <span className="text-gray-900">
                          {reserva.telefono}
                        </span>
                      </p>

                      <p>
                        📅{" "}
                        <span className="text-gray-900">
                          {reserva.fecha}
                        </span>
                      </p>

                      <p>
                        🕒{" "}
                        <span className="text-gray-900">
                          {reserva.hora}
                        </span>
                      </p>

                      <p>
                        👥{" "}
                        <span className="text-gray-900">
                          {reserva.personas} personas
                        </span>
                      </p>

                    </div>


                    {/* ESTADO */}
                    <div className="mt-5">

                      {reserva.estado === "Confirmada" && (
                        <span className="inline-flex bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                          🟢 Confirmada
                        </span>
                      )}

                      {reserva.estado === "Pendiente" && (
                        <span className="inline-flex bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                          🟡 Pendiente
                        </span>
                      )}

                      {reserva.estado === "Cancelada" && (
                        <span className="inline-flex bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                          🔴 Cancelada
                        </span>
                      )}

                    </div>

                  </div>


                  {/* BOTONES */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <button
                      onClick={() => confirmarReserva(reserva.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                    >
                      ✅ Confirmar
                    </button>


                    <button
                      onClick={() => cancelarReserva(reserva.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition"
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                    >
                      ✏️ Editar
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}