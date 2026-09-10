"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Empresa = {
  id: number | string;
  nombre: string;
  ciudad?: string | null;
};

type Reserva = {
  id: number | string;
  empresa_id: number | string | null;
  cliente_nombre: string | null;
  telefono: string | null;
  email: string | null;
  fecha: string | null;
  hora: string | null;
  personas?: number | string | null;
  estado: string | null;
  created_at: string | null;
};

type Cliente = {
  key: string;
  nombre: string;
  telefono: string;
  email: string;
  reservas: number;
  ultimaReserva: string | null;
  ultimaFecha: Date | null;
  estado: "Nuevo" | "Recurrente" | "Inactivo";
};

const DIAS_INACTIVO = 30;

function normalizarTelefono(telefono: string | null) {
  if (!telefono) return "";
  return telefono.replace(/\D/g, "");
}

function normalizarEmail(email: string | null) {
  if (!email) return "";
  return email.trim().toLowerCase();
}

function normalizarNombre(nombre: string | null) {
  if (!nombre) return "";
  return nombre.trim().toLowerCase().replace(/\s+/g, " ");
}

function obtenerClaveCliente(reserva: Reserva) {
  const telefono = normalizarTelefono(reserva.telefono);
  const email = normalizarEmail(reserva.email);
  const nombre = normalizarNombre(reserva.cliente_nombre);

  if (telefono) {
    return `telefono:${telefono}`;
  }

  if (email) {
    return `email:${email}`;
  }

  if (nombre) {
    return `nombre:${nombre}`;
  }

  return `reserva:${reserva.id}`;
}

function obtenerFechaReserva(
  fecha: string | null,
  hora: string | null
): Date | null {
  if (!fecha) return null;

  const horaNormalizada = hora
    ? hora.length === 5
      ? `${hora}:00`
      : hora
    : "00:00:00";

  const resultado = new Date(`${fecha}T${horaNormalizada}`);

  if (Number.isNaN(resultado.getTime())) {
    return null;
  }

  return resultado;
}

function formatearFecha(fecha: Date | null) {
  if (!fecha) return "—";

  return fecha.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatearHora(hora: string | null) {
  if (!hora) return "—";

  const partes = hora.split(":");

  if (partes.length < 2) {
    return hora;
  }

  const horas = Number(partes[0]);
  const minutos = partes[1];

  if (Number.isNaN(horas)) {
    return hora;
  }

  const periodo = horas >= 12 ? "PM" : "AM";
  const hora12 = horas % 12 || 12;

  return `${hora12}:${minutos} ${periodo}`;
}

function esReservaCancelada(estado: string | null) {
  if (!estado) return false;

  const estadoNormalizado = estado.trim().toLowerCase();

  return [
    "cancelada",
    "cancelado",
    "cancelled",
    "canceled",
  ].includes(estadoNormalizado);
}

function obtenerAccionPrincipal(
  estado: Cliente["estado"]
) {
  if (estado === "Nuevo") {
    return {
      titulo: "Invitar a volver",
      descripcion:
        "Invita a este nuevo cliente a realizar una segunda visita.",
      icono: "🆕",
    };
  }

  if (estado === "Recurrente") {
    return {
      titulo: "Agradecer al cliente",
      descripcion:
        "Reconoce la recurrencia y fortalece la relación con este cliente.",
      icono: "❤️",
    };
  }

  return {
    titulo: "Reactivar cliente",
    descripcion:
      "Crea una acción para intentar recuperar a este cliente inactivo.",
    icono: "🔄",
  };
}

/*
 * MENSAJE DE WHATSAPP
 */
function obtenerMensajeWhatsApp(
  cliente: Cliente,
  empresaNombre: string
) {
  if (cliente.estado === "Nuevo") {
    return `Hola ${cliente.nombre}, gracias por haber visitado ${empresaNombre}. Nos encantó recibirte. ¡Esperamos verte nuevamente pronto!`;
  }

  if (cliente.estado === "Recurrente") {
    return `Hola ${cliente.nombre}, queremos agradecerte por volver a ${empresaNombre}. ¡Es un placer tenerte como cliente! Esperamos seguir recibiéndote.`;
  }

  return `Hola ${cliente.nombre}, hace un tiempo no te vemos por ${empresaNombre}. Nos encantaría recibirte nuevamente. ¡Esperamos verte pronto!`;
}

export default function FidelizacionPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState("");

  const [reservas, setReservas] = useState<Reserva[]>([]);

  const [cargandoEmpresas, setCargandoEmpresas] =
    useState(true);

  const [cargandoReservas, setCargandoReservas] =
    useState(false);

  const [error, setError] = useState("");

  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);

  const [accionSeleccionada, setAccionSeleccionada] =
    useState("");

  /*
   * CARGAR EMPRESAS
   */
  useEffect(() => {
    const cargarEmpresas = async () => {
      setCargandoEmpresas(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("empresas")
          .select("id, nombre, ciudad")
          .order("nombre", {
            ascending: true,
          });

        if (error) {
          console.error(
            "ERROR CARGANDO EMPRESAS:",
            error
          );

          setError(
            "No fue posible cargar las empresas."
          );

          return;
        }

        const lista = (data || []) as Empresa[];

        setEmpresas(lista);

        const params = new URLSearchParams(
          window.location.search
        );

        const empresaDesdeURL =
          params.get("empresaId");

        if (
          empresaDesdeURL &&
          lista.some(
            (empresa) =>
              String(empresa.id) ===
              empresaDesdeURL
          )
        ) {
          setEmpresaId(
            empresaDesdeURL
          );
        } else if (lista.length === 1) {
          setEmpresaId(
            String(lista[0].id)
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          "Ocurrió un error cargando las empresas."
        );
      } finally {
        setCargandoEmpresas(false);
      }
    };

    cargarEmpresas();
  }, []);

  /*
   * CARGAR RESERVAS
   */
  useEffect(() => {
    if (!empresaId) {
      setReservas([]);
      setClienteSeleccionado(null);
      setAccionSeleccionada("");
      return;
    }

    const cargarReservas = async () => {
      setCargandoReservas(true);
      setError("");
      setClienteSeleccionado(null);
      setAccionSeleccionada("");

      try {
        const idNumerico = Number(
          empresaId
        );

        if (!Number.isFinite(idNumerico)) {
          setError(
            "El identificador de la empresa no es válido."
          );

          return;
        }

        const { data, error } = await supabase
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
              estado,
              created_at
            `
          )
          .eq(
            "empresa_id",
            idNumerico
          )
          .order("fecha", {
            ascending: false,
          });

        if (error) {
          console.error(
            "ERROR CARGANDO RESERVAS:",
            error
          );

          setError(
            "No fue posible cargar las reservas."
          );

          return;
        }

        setReservas(
          (data || []) as Reserva[]
        );
      } catch (err) {
        console.error(err);

        setError(
          "Ocurrió un error cargando las reservas."
        );
      } finally {
        setCargandoReservas(false);
      }
    };

    cargarReservas();
  }, [empresaId]);

  /*
   * EMPRESA SELECCIONADA
   */
  const empresaSeleccionada = useMemo(() => {
    return empresas.find(
      (empresa) =>
        String(empresa.id) ===
        String(empresaId)
    );
  }, [
    empresas,
    empresaId,
  ]);

  /*
   * CONSTRUIR CLIENTES
   */
  const clientes = useMemo(() => {
    const mapa = new Map<
      string,
      {
        nombre: string;
        telefono: string;
        email: string;
        reservas: number;
        ultimaFecha: Date | null;
      }
    >();

    for (const reserva of reservas) {
      if (
        esReservaCancelada(
          reserva.estado
        )
      ) {
        continue;
      }

      const key =
        obtenerClaveCliente(
          reserva
        );

      const fechaReserva =
        obtenerFechaReserva(
          reserva.fecha,
          reserva.hora
        );

      const clienteExistente =
        mapa.get(key);

      if (!clienteExistente) {
        mapa.set(key, {
          nombre:
            reserva.cliente_nombre?.trim() ||
            "Cliente",

          telefono:
            reserva.telefono?.trim() ||
            "",

          email:
            reserva.email?.trim() ||
            "",

          reservas: 1,

          ultimaFecha:
            fechaReserva,
        });

        continue;
      }

      clienteExistente.reservas += 1;

      if (
        fechaReserva &&
        (!clienteExistente.ultimaFecha ||
          fechaReserva >
            clienteExistente.ultimaFecha)
      ) {
        clienteExistente.ultimaFecha =
          fechaReserva;
      }

      if (reserva.telefono?.trim()) {
        clienteExistente.telefono =
          reserva.telefono.trim();
      }

      if (reserva.email?.trim()) {
        clienteExistente.email =
          reserva.email.trim();
      }

      if (
        (!clienteExistente.nombre ||
          clienteExistente.nombre ===
            "Cliente") &&
        reserva.cliente_nombre
      ) {
        clienteExistente.nombre =
          reserva.cliente_nombre.trim();
      }
    }

    const ahora = new Date();

    const limiteInactivo =
      new Date(ahora);

    limiteInactivo.setDate(
      limiteInactivo.getDate() -
        DIAS_INACTIVO
    );

    const resultado: Cliente[] = [];

    for (
      const [key, cliente]
      of mapa.entries()
    ) {
      let estado: Cliente["estado"] =
        "Nuevo";

      if (
        cliente.ultimaFecha &&
        cliente.ultimaFecha <
          limiteInactivo
      ) {
        estado = "Inactivo";
      } else if (
        cliente.reservas >= 2
      ) {
        estado = "Recurrente";
      }

      resultado.push({
        key,
        nombre: cliente.nombre,
        telefono:
          cliente.telefono,
        email:
          cliente.email,
        reservas:
          cliente.reservas,
        ultimaReserva:
          formatearFecha(
            cliente.ultimaFecha
          ),
        ultimaFecha:
          cliente.ultimaFecha,
        estado,
      });
    }

    resultado.sort((a, b) => {
      const fechaA =
        a.ultimaFecha?.getTime() ||
        0;

      const fechaB =
        b.ultimaFecha?.getTime() ||
        0;

      return fechaB - fechaA;
    });

    return resultado;
  }, [reservas]);

  /*
   * ESTADÍSTICAS
   */
  const estadisticas = useMemo(() => {
    const totalClientes =
      clientes.length;

    const nuevos =
      clientes.filter(
        (cliente) =>
          cliente.estado === "Nuevo"
      ).length;

    const recurrentes =
      clientes.filter(
        (cliente) =>
          cliente.reservas >= 2
      ).length;

    const inactivos =
      clientes.filter(
        (cliente) =>
          cliente.estado ===
          "Inactivo"
      ).length;

    const totalReservas =
      reservas.filter(
        (reserva) =>
          !esReservaCancelada(
            reserva.estado
          )
      ).length;

    const tasaRecurrencia =
      totalClientes > 0
        ? Math.round(
            (recurrentes /
              totalClientes) *
              100
          )
        : 0;

    return {
      totalClientes,
      nuevos,
      recurrentes,
      inactivos,
      totalReservas,
      tasaRecurrencia,
    };
  }, [
    clientes,
    reservas,
  ]);

  /*
   * HISTORIAL DEL CLIENTE
   */
  const historialCliente =
    useMemo(() => {
      if (!clienteSeleccionado) {
        return [];
      }

      return reservas
        .filter(
          (reserva) =>
            !esReservaCancelada(
              reserva.estado
            ) &&
            obtenerClaveCliente(
              reserva
            ) ===
              clienteSeleccionado.key
        )
        .sort((a, b) => {
          const fechaA =
            obtenerFechaReserva(
              a.fecha,
              a.hora
            )?.getTime() || 0;

          const fechaB =
            obtenerFechaReserva(
              b.fecha,
              b.hora
            )?.getTime() || 0;

          return fechaB - fechaA;
        });
    }, [
      reservas,
      clienteSeleccionado,
    ]);

  /*
   * ACCIÓN PRINCIPAL
   */
  const accionPrincipal =
    clienteSeleccionado
      ? obtenerAccionPrincipal(
          clienteSeleccionado.estado
        )
      : null;

  /*
   * INTERFAZ
   */
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                ShortBizAI
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                Fidelización
              </h1>

              <p className="mt-2 max-w-2xl text-gray-600">
                Convierte las reservas en relaciones con clientes recurrentes.
              </p>
            </div>

            {/* SELECTOR DE EMPRESA */}
            <div className="w-full md:w-80">

              <label
                htmlFor="empresa"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Empresa
              </label>

              <select
                id="empresa"
                value={empresaId}
                onChange={(e) => {
                  setEmpresaId(
                    e.target.value
                  );

                  setClienteSeleccionado(
                    null
                  );

                  setAccionSeleccionada(
                    ""
                  );
                }}
                disabled={
                  cargandoEmpresas
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900"
              >
                <option value="">
                  {cargandoEmpresas
                    ? "Cargando empresas..."
                    : "Seleccionar empresa"}
                </option>

                {empresas.map(
                  (empresa) => (
                    <option
                      key={
                        empresa.id
                      }
                      value={String(
                        empresa.id
                      )}
                    >
                      {empresa.nombre}
                      {empresa.ciudad
                        ? ` — ${empresa.ciudad}`
                        : ""}
                    </option>
                  )
                )}
              </select>

            </div>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SIN EMPRESA */}
        {!empresaId &&
          !cargandoEmpresas && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                👥
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                Selecciona una empresa
              </h2>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                Selecciona una empresa para analizar sus clientes y reservas.
              </p>

            </div>
          )}

        {/* EMPRESA SELECCIONADA */}
        {empresaId && (
          <>
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-gray-500">
                Empresa seleccionada
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">

                <h2 className="text-2xl font-bold text-gray-900">
                  {empresaSeleccionada?.nombre ||
                    "Empresa"}
                </h2>

                {empresaSeleccionada?.ciudad && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {
                      empresaSeleccionada.ciudad
                    }
                  </span>
                )}

              </div>

            </div>

            {/* CARGANDO */}
            {cargandoReservas ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                <p className="text-gray-600">
                  Cargando información de clientes...
                </p>

              </div>
            ) : (
              <>
                {/* ESTADÍSTICAS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

                  <StatCard
                    titulo="Clientes"
                    valor={
                      estadisticas.totalClientes
                    }
                    descripcion="Clientes identificados"
                  />

                  <StatCard
                    titulo="Nuevos"
                    valor={
                      estadisticas.nuevos
                    }
                    descripcion="1 reserva"
                  />

                  <StatCard
                    titulo="Recurrentes"
                    valor={
                      estadisticas.recurrentes
                    }
                    descripcion="2+ reservas"
                  />

                  <StatCard
                    titulo="Inactivos"
                    valor={
                      estadisticas.inactivos
                    }
                    descripcion={`+${DIAS_INACTIVO} días`}
                  />

                  <StatCard
                    titulo="Reservas"
                    valor={
                      estadisticas.totalReservas
                    }
                    descripcion="Reservas registradas"
                  />

                  <StatCard
                    titulo="Recurrencia"
                    valor={`${estadisticas.tasaRecurrencia}%`}
                    descripcion="Clientes con 2+ reservas"
                  />

                </div>

                {/* TABLA CLIENTES */}
                <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">

                  <div className="border-b border-gray-200 p-6">

                    <h2 className="text-xl font-bold text-gray-900">
                      Clientes
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Haz clic sobre un cliente para ver su ficha e historial.
                    </p>

                  </div>

                  {clientes.length === 0 ? (
                    <div className="p-10 text-center">

                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                        📋
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900">
                        Todavía no hay clientes
                      </h3>

                      <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
                        Cuando esta empresa reciba reservas, aquí aparecerá automáticamente su base de clientes.
                      </p>

                    </div>
                  ) : (
                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[1000px]">

                        <thead className="border-b border-gray-200 bg-gray-50">

                          <tr>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Cliente
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Teléfono
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Email
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Reservas
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Última reserva
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Estado
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                          {clientes.map(
                            (cliente) => (
                              <tr
                                key={
                                  cliente.key
                                }
                                onClick={() => {
                                  setClienteSeleccionado(
                                    cliente
                                  );

                                  setAccionSeleccionada(
                                    ""
                                  );
                                }}
                                className="cursor-pointer transition hover:bg-gray-50"
                              >

                                {/* CLIENTE */}
                                <td className="px-5 py-4">

                                  <div className="font-medium text-gray-900">
                                    {
                                      cliente.nombre
                                    }
                                  </div>

                                </td>

                                {/* TELEFONO */}
                                <td className="px-5 py-4 text-sm text-gray-600">
                                  {
                                    cliente.telefono ||
                                    "—"
                                  }
                                </td>

                                {/* EMAIL */}
                                <td className="px-5 py-4 text-sm text-gray-600">

                                  {cliente.email ? (
                                    <span className="break-all">
                                      {
                                        cliente.email
                                      }
                                    </span>
                                  ) : (
                                    "—"
                                  )}

                                </td>

                                {/* RESERVAS */}
                                <td className="px-5 py-4">

                                  <span className="font-semibold text-gray-900">
                                    {
                                      cliente.reservas
                                    }
                                  </span>

                                </td>

                                {/* ULTIMA RESERVA */}
                                <td className="px-5 py-4 text-sm text-gray-600">
                                  {
                                    cliente.ultimaReserva
                                  }
                                </td>

                                {/* ESTADO */}
                                <td className="px-5 py-4">

                                  <EstadoBadge
                                    estado={
                                      cliente.estado
                                    }
                                  />

                                </td>

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                    </div>
                  )}

                </div>

                {/* FICHA DEL CLIENTE */}
                {clienteSeleccionado && (
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {/* CABECERA */}
                    <div className="flex flex-col gap-4 border-b border-gray-200 p-6 md:flex-row md:items-start md:justify-between">

                      <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
                          {clienteSeleccionado.nombre
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h2 className="text-2xl font-bold text-gray-900">
                              {
                                clienteSeleccionado.nombre
                              }
                            </h2>

                            <EstadoBadge
                              estado={
                                clienteSeleccionado.estado
                              }
                            />

                          </div>

                          <div className="mt-2 space-y-1 text-sm text-gray-500">

                            {clienteSeleccionado.telefono && (
                              <p>
                                📱{" "}
                                {
                                  clienteSeleccionado.telefono
                                }
                              </p>
                            )}

                            {clienteSeleccionado.email && (
                              <p>
                                ✉️{" "}
                                {
                                  clienteSeleccionado.email
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setClienteSeleccionado(
                            null
                          );

                          setAccionSeleccionada(
                            ""
                          );
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Cerrar
                      </button>

                    </div>

                    {/* RESUMEN */}
                    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">

                      <MiniStat
                        titulo="Reservas"
                        valor={
                          clienteSeleccionado.reservas
                        }
                      />

                      <MiniStat
                        titulo="Última reserva"
                        valor={
                          clienteSeleccionado.ultimaReserva ||
                          "—"
                        }
                      />

                      <MiniStat
                        titulo="Estado"
                        valor={
                          clienteSeleccionado.estado
                        }
                      />

                    </div>

                    {/* ACCIÓN PRINCIPAL */}
                    {accionPrincipal && (
                      <div className="border-t border-gray-200 p-6">

                        <h3 className="text-lg font-bold text-gray-900">
                          Acción recomendada
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          ShortBizAI identifica una acción inicial según el estado del cliente.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setAccionSeleccionada(
                              accionPrincipal.titulo
                            )
                          }
                          className="mt-4 w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:border-gray-400 hover:bg-white hover:shadow-sm"
                        >

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                              {
                                accionPrincipal.icono
                              }
                            </div>

                            <div>

                              <p className="font-bold text-gray-900">
                                {
                                  accionPrincipal.titulo
                                }
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-500">
                                {
                                  accionPrincipal.descripcion
                                }
                              </p>

                            </div>

                          </div>

                        </button>

                        {accionSeleccionada && (
                          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

                            <p className="text-sm font-semibold text-gray-900">
                              Acción seleccionada
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              {
                                accionSeleccionada
                              }
                            </p>

                          </div>
                        )}

                      </div>
                    )}

                    {/* CONTACTAR CLIENTE */}
                    {clienteSeleccionado.telefono && (
                      <div className="border-t border-gray-200 p-6">

                        <h3 className="text-lg font-bold text-gray-900">
                          Contactar cliente
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Envía un mensaje personalizado según el estado del cliente.
                        </p>

                        <a
                          href={`https://wa.me/${normalizarTelefono(
                            clienteSeleccionado.telefono
                          )}?text=${encodeURIComponent(
                            obtenerMensajeWhatsApp(
                              clienteSeleccionado,
                              empresaSeleccionada?.nombre ||
                                "nuestro restaurante"
                            )
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-3 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                          <span className="text-lg">
                            💬
                          </span>

                          Abrir WhatsApp
                        </a>

                      </div>
                    )}

                    {/* HISTORIAL */}
                    <div className="border-t border-gray-200 p-6">

                      <h3 className="text-lg font-bold text-gray-900">
                        Historial de reservas
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Registro de las reservas de este cliente.
                      </p>

                      {historialCliente.length ===
                      0 ? (
                        <div className="mt-4 rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                          No hay historial disponible.
                        </div>
                      ) : (
                        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">

                          <table className="w-full min-w-[700px]">

                            <thead className="bg-gray-50">

                              <tr>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Fecha
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Hora
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Personas
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Estado
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  ID
                                </th>

                              </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                              {historialCliente.map(
                                (reserva) => (
                                  <tr
                                    key={
                                      reserva.id
                                    }
                                  >

                                    <td className="px-4 py-3 text-sm text-gray-700">
                                      {formatearFecha(
                                        obtenerFechaReserva(
                                          reserva.fecha,
                                          reserva.hora
                                        )
                                      )}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-700">
                                      {formatearHora(
                                        reserva.hora
                                      )}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-700">
                                      {
                                        reserva.personas ||
                                        "—"
                                      }
                                    </td>

                                    <td className="px-4 py-3">

                                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                        {
                                          reserva.estado ||
                                          "Registrada"
                                        }
                                      </span>

                                    </td>

                                    <td className="px-4 py-3 text-xs text-gray-400">
                                      #{reserva.id}
                                    </td>

                                  </tr>
                                )
                              )}

                            </tbody>

                          </table>

                        </div>
                      )}

                    </div>

                  </div>
                )}

                {/* EXPLICACIÓN */}
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                  <h3 className="text-base font-semibold text-gray-900">
                    Cómo funciona esta primera versión
                  </h3>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">

                    <InfoItem
                      titulo="Nuevo"
                      texto="Cliente identificado con una sola reserva."
                    />

                    <InfoItem
                      titulo="Recurrente"
                      texto="Cliente identificado con dos o más reservas."
                    />

                    <InfoItem
                      titulo="Inactivo"
                      texto={`Cliente cuya última reserva fue hace más de ${DIAS_INACTIVO} días.`}
                    />

                  </div>

                </div>

              </>
            )}

          </>
        )}

      </div>
    </main>
  );
}

/*
 * TARJETA DE ESTADÍSTICA
 */
function StatCard({
  titulo,
  valor,
  descripcion,
}: {
  titulo: string;
  valor: number | string;
  descripcion: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-gray-500">
        {titulo}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {valor}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {descripcion}
      </p>

    </div>
  );
}

/*
 * MINI ESTADÍSTICA
 */
function MiniStat({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string | number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {titulo}
      </p>

      <p className="mt-2 text-xl font-bold text-gray-900">
        {valor}
      </p>

    </div>
  );
}

/*
 * ESTADO
 */
function EstadoBadge({
  estado,
}: {
  estado: Cliente["estado"];
}) {
  if (estado === "Recurrente") {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Recurrente
      </span>
    );
  }

  if (estado === "Inactivo") {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Inactivo
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
      Nuevo
    </span>
  );
}

/*
 * INFORMACIÓN
 */
function InfoItem({
  titulo,
  texto,
}: {
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <p className="font-semibold text-gray-900">
        {titulo}
      </p>

      <p className="mt-1 text-sm leading-6 text-gray-500">
        {texto}
      </p>

    </div>
  );
}