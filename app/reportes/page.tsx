"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Reserva = {
  id: number;
  empresa_id?: number | string | null;
  cliente_nombre?: string | null;
  telefono?: string | null;
  email?: string | null;
  fecha?: string | null;
  hora?: string | null;
  personas?: string | number | null;
  estado?: string | null;
};

type Campana = {
  id: number;
  estado?: string | null;
};

export default function Reportes() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarReportes = async () => {
      setCargando(true);
      setError("");

      try {
        const [
          { data: reservasData, error: reservasError },
          { data: campanasData, error: campanasError },
        ] = await Promise.all([
          supabase
            .from("reservas")
            .select(
              `
                id,
                empresa_id,
                cliente_nombre,
                telefono,
                email,
                fecha,
                hora,
                personas,
                estado
              `
            )
            .order("fecha", { ascending: false }),

          supabase
            .from("fidelizacion_campanas")
            .select("id, estado"),
        ]);

        if (reservasError) {
          console.error("ERROR RESERVAS:", reservasError);
          throw new Error(
            `Error cargando reservas: ${reservasError.message}`
          );
        }

        if (campanasError) {
          console.error("ERROR CAMPAÑAS:", campanasError);
          throw new Error(
            `Error cargando campañas: ${campanasError.message}`
          );
        }

        setReservas((reservasData || []) as Reserva[]);
        setCampanas((campanasData || []) as Campana[]);
      } catch (err) {
        console.error("ERROR REPORTES:", err);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los informes."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarReportes();
  }, []);

  /* =========================================================
     ESTADOS DE RESERVA
  ========================================================= */

  const esCancelada = (estado?: string | null) => {
    const valor = (estado || "").toLowerCase().trim();

    return (
      valor.includes("cancel") ||
      valor === "cancelada" ||
      valor === "cancelado"
    );
  };

  const esConfirmada = (estado?: string | null) => {
    const valor = (estado || "").toLowerCase().trim();

    return (
      valor.includes("confirm") ||
      valor === "confirmada" ||
      valor === "confirmado"
    );
  };

  const reservasConfirmadas = reservas.filter((r) =>
    esConfirmada(r.estado)
  );

  const reservasCanceladas = reservas.filter((r) =>
    esCancelada(r.estado)
  );

  const reservasPendientes = reservas.filter(
    (r) => !esConfirmada(r.estado) && !esCancelada(r.estado)
  );

  /* =========================================================
     CLIENTES
  ========================================================= */

  const obtenerClaveCliente = (reserva: Reserva) => {
    const email = reserva.email?.trim().toLowerCase();

    if (email) {
      return `email:${email}`;
    }

    const telefono = reserva.telefono
      ?.replace(/\D/g, "")
      .trim();

    if (telefono) {
      return `telefono:${telefono}`;
    }

    const nombre = reserva.cliente_nombre
      ?.trim()
      .toLowerCase();

    if (nombre) {
      return `nombre:${nombre}`;
    }

    return `reserva:${reserva.id}`;
  };

  const clientesMap = new Map<string, Reserva[]>();

  reservas
    .filter((r) => !esCancelada(r.estado))
    .forEach((reserva) => {
      const clave = obtenerClaveCliente(reserva);

      const existentes = clientesMap.get(clave) || [];

      existentes.push(reserva);

      clientesMap.set(clave, existentes);
    });

  const clientesTotales = clientesMap.size;

  const clientesRecurrentes = Array.from(
    clientesMap.values()
  ).filter((lista) => lista.length >= 2).length;

  const clientesNuevos = Math.max(
    clientesTotales - clientesRecurrentes,
    0
  );

  const reservasClientesRecurrentes = Array.from(
    clientesMap.values()
  )
    .filter((lista) => lista.length >= 2)
    .reduce((total, lista) => total + lista.length, 0);

  /* =========================================================
     FIDELIZACIÓN
  ========================================================= */

  const campanasEnviadas = campanas.filter(
    (campana) =>
      (campana.estado || "").toLowerCase() === "enviada"
  ).length;

  /* =========================================================
     ÚLTIMOS 7 DÍAS
  ========================================================= */

  const obtenerFecha = (fecha?: string | null) => {
    if (!fecha) return null;

    const resultado = new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(resultado.getTime())) {
      return null;
    }

    return resultado;
  };

  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

  const datosUltimos7Dias = [];

  for (let i = 6; i >= 0; i--) {
    const dia = new Date(hoy);

    dia.setDate(hoy.getDate() - i);

    const fechaTexto = dia.toISOString().slice(0, 10);

    const cantidad = reservas.filter((reserva) => {
      if (esCancelada(reserva.estado)) {
        return false;
      }

      return reserva.fecha === fechaTexto;
    }).length;

    datosUltimos7Dias.push({
      nombre: dia.toLocaleDateString("es-CO", {
        weekday: "short",
      }),
      reservas: cantidad,
    });
  }

  /* =========================================================
     ÚLTIMAS RESERVAS
  ========================================================= */

  const ultimasReservas = [...reservas]
    .sort((a, b) => {
      const fechaA = new Date(
        `${a.fecha || "1900-01-01"}T${a.hora || "00:00:00"}`
      ).getTime();

      const fechaB = new Date(
        `${b.fecha || "1900-01-01"}T${b.hora || "00:00:00"}`
      ).getTime();

      return fechaB - fechaA;
    })
    .slice(0, 10);

  /* =========================================================
     FORMATO
  ========================================================= */

  const formatearFecha = (
    fecha?: string | null,
    hora?: string | null
  ) => {
    if (!fecha) return "—";

    const texto = `${fecha}T${hora || "00:00:00"}`;

    const fechaObjeto = new Date(texto);

    if (Number.isNaN(fechaObjeto.getTime())) {
      return fecha;
    }

    return fechaObjeto.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerEstadoTexto = (estado?: string | null) => {
    if (esConfirmada(estado)) {
      return "Confirmada";
    }

    if (esCancelada(estado)) {
      return "Cancelada";
    }

    return "Pendiente";
  };

  const obtenerEstadoClase = (estado?: string | null) => {
    if (esConfirmada(estado)) {
      return "bg-green-100 text-green-700";
    }

    if (esCancelada(estado)) {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  /* =========================================================
     CARGANDO
  ========================================================= */

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          📊 Informes ShortBizAI
        </h1>

        <p className="mt-4 text-gray-600">
          Cargando información...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          📊 Informes ShortBizAI
        </h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      {/* CABECERA */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          📊 Informes ShortBizAI
        </h1>

        <p className="mt-2 text-gray-600">
          Resumen del comportamiento de reservas,
          clientes y fidelización.
        </p>
      </div>

      {/* RESERVAS */}

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          📅 Reservas
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total
            </p>

            <p className="mt-2 text-4xl font-bold text-gray-900">
              {reservas.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Confirmadas
            </p>

            <p className="mt-2 text-4xl font-bold text-green-600">
              {reservasConfirmadas.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Canceladas
            </p>

            <p className="mt-2 text-4xl font-bold text-red-600">
              {reservasCanceladas.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pendientes
            </p>

            <p className="mt-2 text-4xl font-bold text-yellow-600">
              {reservasPendientes.length}
            </p>
          </div>

        </div>
      </section>

      {/* CLIENTES */}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          👥 Clientes
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Clientes totales
            </p>

            <p className="mt-2 text-4xl font-bold text-blue-600">
              {clientesTotales}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Clientes nuevos
            </p>

            <p className="mt-2 text-4xl font-bold text-purple-600">
              {clientesNuevos}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Clientes recurrentes
            </p>

            <p className="mt-2 text-4xl font-bold text-orange-600">
              {clientesRecurrentes}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {reservasClientesRecurrentes} reservas de clientes recurrentes
            </p>
          </div>

        </div>
      </section>

      {/* FIDELIZACIÓN */}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          ❤️ Fidelización
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Campañas enviadas
            </p>

            <p className="mt-2 text-4xl font-bold text-pink-600">
              {campanasEnviadas}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Clientes que regresaron
            </p>

            <p className="mt-2 text-4xl font-bold text-indigo-600">
              {clientesRecurrentes}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Basado en clientes con más de una reserva no cancelada.
            </p>
          </div>

        </div>
      </section>

      {/* GRÁFICA */}

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            📈 Reservas — últimos 7 días
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Reservas no canceladas.
          </p>
        </div>

        <div className="h-[320px] w-full">

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosUltimos7Dias}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="nombre" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="reservas"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>

        </div>

      </section>

      {/* ÚLTIMAS RESERVAS */}

      <section className="mt-10">

        <h2 className="mb-4 text-xl font-bold text-gray-900">
          🧾 Últimas reservas
        </h2>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">

          <table className="min-w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Cliente
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Fecha
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Personas
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Estado
                </th>

              </tr>

            </thead>

            <tbody>

              {ultimasReservas.map((reserva) => (

                <tr
                  key={reserva.id}
                  className="border-t border-gray-100"
                >

                  <td className="px-4 py-4">

                    <p className="font-semibold text-gray-900">
                      {reserva.cliente_nombre || "Cliente"}
                    </p>

                    {reserva.email && (
                      <p className="text-sm text-gray-500">
                        {reserva.email}
                      </p>
                    )}

                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700">
                    {formatearFecha(
                      reserva.fecha,
                      reserva.hora
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700">
                    {reserva.personas || "—"}
                  </td>

                  <td className="px-4 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstadoClase(
                        reserva.estado
                      )}`}
                    >
                      {obtenerEstadoTexto(
                        reserva.estado
                      )}
                    </span>

                  </td>

                </tr>

              ))}

              {ultimasReservas.length === 0 && (

                <tr>

                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Todavía no hay reservas.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}