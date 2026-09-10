import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* =========================================================
   CONFIGURACIÓN DEL MOTOR DE FIDELIZACIÓN
========================================================= */

const DIAS_AGRADECIMIENTO = 5;
const DIAS_INVITACION = 15;
const DIAS_SEGUNDO_INTENTO = 30;
const DIAS_REACTIVACION = 45;

const MINIMO_DIAS_ENTRE_COMUNICACIONES = 15;

/* =========================================================
   TIPOS
========================================================= */

type Reserva = {
  id: number | string;
  empresa_id: number | string | null;
  cliente_nombre: string | null;
  telefono: string | null;
  email: string | null;
  fecha: string | null;
  hora: string | null;
  estado: string | null;
};

type Campana = {
  id: number | string;
  empresa_id: number | string;
  cliente_key: string;
  reserva_id: number | string | null;
  tipo: string;
  canal: string;
  programada_para: string;
  enviada_at: string | null;
  estado: string;
};

/* =========================================================
   UTILIDADES
========================================================= */

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

  return nombre
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/* =========================================================
   CLAVE ÚNICA DEL CLIENTE
========================================================= */

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

/* =========================================================
   FECHA DE RESERVA
========================================================= */

function obtenerFechaReserva(
  fecha: string | null,
  hora: string | null
) {
  if (!fecha) {
    return null;
  }

  const horaNormalizada = hora
    ? hora.length === 5
      ? `${hora}:00`
      : hora
    : "00:00:00";

  const resultado = new Date(
    `${fecha}T${horaNormalizada}`
  );

  if (Number.isNaN(resultado.getTime())) {
    return null;
  }

  return resultado;
}

/* =========================================================
   RESERVA CANCELADA
========================================================= */

function esReservaCancelada(estado: string | null) {
  if (!estado) {
    return false;
  }

  const estadoNormalizado =
    estado.trim().toLowerCase();

  return [
    "cancelada",
    "cancelado",
    "cancelled",
    "canceled",
  ].includes(estadoNormalizado);
}

/* =========================================================
   DIFERENCIA DE DÍAS
========================================================= */

function diasDesde(fecha: Date) {
  const ahora = new Date();

  const diferencia =
    ahora.getTime() -
    fecha.getTime();

  return Math.floor(
    diferencia /
      (1000 * 60 * 60 * 24)
  );
}

/* =========================================================
   FECHA PROGRAMADA
========================================================= */

function sumarDias(
  fecha: Date,
  dias: number
) {
  const resultado = new Date(fecha);

  resultado.setDate(
    resultado.getDate() + dias
  );

  return resultado;
}

/* =========================================================
   DETERMINAR PRÓXIMA CAMPAÑA
========================================================= */

function obtenerProximaCampana(
  fechaUltimaReserva: Date,
  campanasReserva: Campana[]
) {
  const diasTranscurridos =
    diasDesde(fechaUltimaReserva);

  const tiposExistentes =
    new Set(
      campanasReserva.map(
        (campana) => campana.tipo
      )
    );

  /* =======================================================
     DÍA 5 — AGRADECIMIENTO
  ======================================================= */

  if (
    diasTranscurridos >=
      DIAS_AGRADECIMIENTO &&
    !tiposExistentes.has(
      "agradecimiento"
    )
  ) {
    return {
      tipo: "agradecimiento",
      programada_para:
        sumarDias(
          fechaUltimaReserva,
          DIAS_AGRADECIMIENTO
        ),
    };
  }

  /* =======================================================
     DÍA 15 — INVITACIÓN
  ======================================================= */

  if (
    diasTranscurridos >=
      DIAS_INVITACION &&
    !tiposExistentes.has(
      "invitacion"
    )
  ) {
    return {
      tipo: "invitacion",
      programada_para:
        sumarDias(
          fechaUltimaReserva,
          DIAS_INVITACION
        ),
    };
  }

  /* =======================================================
     DÍA 30 — SEGUNDO INTENTO
  ======================================================= */

  if (
    diasTranscurridos >=
      DIAS_SEGUNDO_INTENTO &&
    !tiposExistentes.has(
      "segundo_intento"
    )
  ) {
    return {
      tipo: "segundo_intento",
      programada_para:
        sumarDias(
          fechaUltimaReserva,
          DIAS_SEGUNDO_INTENTO
        ),
    };
  }

  /* =======================================================
     DÍA 45 — REACTIVACIÓN
  ======================================================= */

  if (
    diasTranscurridos >=
      DIAS_REACTIVACION &&
    !tiposExistentes.has(
      "reactivacion"
    )
  ) {
    return {
      tipo: "reactivacion",
      programada_para:
        sumarDias(
          fechaUltimaReserva,
          DIAS_REACTIVACION
        ),
    };
  }

  /* =======================================================
     NO HAY MÁS CAMPAÑAS
  ======================================================= */

  return null;
}

/* =========================================================
   MOTOR PRINCIPAL
========================================================= */

async function generarCampanas(
  empresaIdFiltro?: string | null
) {
  /* =======================================================
     BUSCAR RESERVAS
  ======================================================= */

  let consultaReservas =
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
          estado
        `
      );

  if (empresaIdFiltro) {
    consultaReservas =
      consultaReservas.eq(
        "empresa_id",
        empresaIdFiltro
      );
  }

  const {
    data: reservas,
    error: errorReservas,
  } = await consultaReservas;

  if (errorReservas) {
    throw new Error(
      `Error buscando reservas: ${errorReservas.message}`
    );
  }

  const reservasValidas =
    (reservas as Reserva[] | null || [])
      .filter(
        (reserva) =>
          !esReservaCancelada(
            reserva.estado
          )
      )
      .filter(
        (reserva) =>
          obtenerFechaReserva(
            reserva.fecha,
            reserva.hora
          ) !== null
      )
      .filter((reserva) => {
        const fecha =
          obtenerFechaReserva(
            reserva.fecha,
            reserva.hora
          );

        return fecha
          ? fecha.getTime() <=
              Date.now()
          : false;
      });

  /* =======================================================
     AGRUPAR CLIENTES
  ======================================================= */

  const clientes =
    new Map<
      string,
      {
        key: string;
        empresa_id: number | string;
        nombre: string;
        telefono: string;
        email: string;
        reservas: Reserva[];
      }
    >();

  for (const reserva of reservasValidas) {
    if (!reserva.empresa_id) {
      continue;
    }

    const key =
      obtenerClaveCliente(
        reserva
      );

    const clienteExistente =
      clientes.get(key);

    if (
      clienteExistente
    ) {
      clienteExistente.reservas.push(
        reserva
      );

      // Actualizar datos del cliente
      // cuando una reserva posterior tenga
      // información que antes estaba vacía.
      if (
        !clienteExistente.email &&
        reserva.email
      ) {
        clienteExistente.email =
          normalizarEmail(
            reserva.email
          );
      }

      if (
        !clienteExistente.telefono &&
        reserva.telefono
      ) {
        clienteExistente.telefono =
          reserva.telefono.trim();
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
    } else {
      clientes.set(key, {
        key,
        empresa_id:
          reserva.empresa_id,
        nombre:
          reserva.cliente_nombre?.trim() ||
          "Cliente",
        telefono:
          reserva.telefono?.trim() ||
          "",
        email:
          normalizarEmail(
            reserva.email
          ),
        reservas: [reserva],
      });
    }
  }

  /* =======================================================
     BUSCAR CAMPAÑAS EXISTENTES
  ======================================================= */

  let consultaCampanas =
    supabase
      .from(
        "fidelizacion_campanas"
      )
      .select(
        `
          id,
          empresa_id,
          cliente_key,
          reserva_id,
          tipo,
          canal,
          programada_para,
          enviada_at,
          estado
        `
      );

  if (empresaIdFiltro) {
    consultaCampanas =
      consultaCampanas.eq(
        "empresa_id",
        empresaIdFiltro
      );
  }

  const {
    data: campanas,
    error: errorCampanas,
  } = await consultaCampanas;

  if (errorCampanas) {
    throw new Error(
      `Error buscando campañas: ${errorCampanas.message}`
    );
  }

  const campanasExistentes =
    (campanas as Campana[] | null || []);

  /* =======================================================
     RESULTADOS
  ======================================================= */

  const creadas: Campana[] = [];

  const omitidas: {
    cliente: string;
    motivo: string;
  }[] = [];

  /* =======================================================
     PROCESAR CADA CLIENTE
  ======================================================= */

  for (const cliente of clientes.values()) {
    /* =====================================================
       NECESITAMOS EMAIL PARA EL CANAL INICIAL
    ===================================================== */

    if (!cliente.email) {
      omitidas.push({
        cliente: cliente.nombre,
        motivo:
          "El cliente no tiene email registrado.",
      });

      continue;
    }

    /* =====================================================
       ORDENAR RESERVAS DE MÁS RECIENTE A MÁS ANTIGUA
    ===================================================== */

    const reservasOrdenadas =
      [...cliente.reservas]
        .sort((a, b) => {
          const fechaA =
            obtenerFechaReserva(
              a.fecha,
              a.hora
            );

          const fechaB =
            obtenerFechaReserva(
              b.fecha,
              b.hora
            );

          return (
            (fechaB?.getTime() || 0) -
            (fechaA?.getTime() || 0)
          );
        });

    const ultimaReserva =
      reservasOrdenadas[0];

    if (!ultimaReserva) {
      continue;
    }

    const fechaUltimaReserva =
      obtenerFechaReserva(
        ultimaReserva.fecha,
        ultimaReserva.hora
      );

    if (!fechaUltimaReserva) {
      continue;
    }

    /* =====================================================
       CAMPAÑAS DEL CLIENTE
    ===================================================== */

    const campanasCliente =
      campanasExistentes.filter(
        (campana) =>
          String(
            campana.empresa_id
          ) ===
            String(
              cliente.empresa_id
            ) &&
          campana.cliente_key ===
            cliente.key
      );

    /* =====================================================
       SI HAY CAMPAÑA PENDIENTE,
       NO CREAR OTRA
    ===================================================== */

    const tienePendiente =
      campanasCliente.some(
        (campana) =>
          campana.estado ===
            "pendiente" ||
          campana.estado ===
            "programada"
      );

    if (tienePendiente) {
      omitidas.push({
        cliente: cliente.nombre,
        motivo:
          "Ya tiene una campaña pendiente.",
      });

      continue;
    }

    /* =====================================================
       ÚLTIMA COMUNICACIÓN ENVIADA
    ===================================================== */

    const campanasEnviadas =
      campanasCliente
        .filter(
          (campana) =>
            campana.enviada_at
        )
        .sort((a, b) => {
          return (
            new Date(
              b.enviada_at!
            ).getTime() -
            new Date(
              a.enviada_at!
            ).getTime()
          );
        });

    const ultimaCampanaEnviada =
      campanasEnviadas[0];

    if (
      ultimaCampanaEnviada?.enviada_at
    ) {
      const diasDesdeUltimaComunicacion =
        diasDesde(
          new Date(
            ultimaCampanaEnviada.enviada_at
          )
        );

      if (
        diasDesdeUltimaComunicacion <
        MINIMO_DIAS_ENTRE_COMUNICACIONES
      ) {
        omitidas.push({
          cliente: cliente.nombre,
          motivo:
            "Todavía no han pasado 15 días desde la última comunicación.",
        });

        continue;
      }
    }

    /* =====================================================
       CAMPAÑAS DE LA ÚLTIMA RESERVA
    ===================================================== */

    const campanasUltimaReserva =
      campanasCliente.filter(
        (campana) =>
          String(
            campana.reserva_id
          ) ===
          String(
            ultimaReserva.id
          )
      );

    /* =====================================================
       DETERMINAR PRÓXIMA ACCIÓN
    ===================================================== */

    const proximaCampana =
      obtenerProximaCampana(
        fechaUltimaReserva,
        campanasUltimaReserva
      );

    if (!proximaCampana) {
      omitidas.push({
        cliente: cliente.nombre,
        motivo:
          "No hay una nueva campaña programable en este ciclo.",
      });

      continue;
    }

    /* =====================================================
       FECHA PROGRAMADA

       Si la fecha calculada ya pasó,
       la programamos para ahora.
    ===================================================== */

    const fechaProgramada =
      proximaCampana.programada_para.getTime() <
      Date.now()
        ? new Date()
        : proximaCampana.programada_para;

    /* =====================================================
       CREAR CAMPAÑA
    ===================================================== */

    const {
      data: nuevaCampana,
      error: errorInsertar,
    } = await supabase
      .from(
        "fidelizacion_campanas"
      )
      .insert([
        {
          empresa_id:
            cliente.empresa_id,

          cliente_key:
            cliente.key,

          cliente_nombre:
            cliente.nombre,

          email:
            cliente.email,

          telefono:
            cliente.telefono,

          reserva_id:
            ultimaReserva.id,

          tipo:
            proximaCampana.tipo,

          canal:
            "email",

          programada_para:
            fechaProgramada.toISOString(),

          estado:
            "pendiente",
        },
      ])
      .select()
      .single();

    if (errorInsertar) {
      throw new Error(
        `Error creando campaña para ${cliente.nombre}: ${errorInsertar.message}`
      );
    }

    creadas.push(
      nuevaCampana as Campana
    );

    /* =====================================================
       ACTUALIZAR MEMORIA LOCAL
       PARA EVITAR DUPLICADOS EN ESTA EJECUCIÓN
    ===================================================== */

    campanasExistentes.push(
      nuevaCampana as Campana
    );
  }

  return {
    totalReservas:
      reservasValidas.length,

    totalClientes:
      clientes.size,

    campanasCreadas:
      creadas.length,

    omitidas:
      omitidas.length,

    motivos:
      omitidas,

    creadas,
  };
}

/* =========================================================
   GET
   Permite probar el motor desde el navegador.
   
   Ejemplo:
   /api/fidelizacion/generar?empresaId=93
========================================================= */

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(
        request.url
      );

    const empresaId =
      url.searchParams.get(
        "empresaId"
      );

    const resultado =
      await generarCampanas(
        empresaId
      );

    return NextResponse.json({
      ok: true,
      mensaje:
        "Motor de fidelización ejecutado correctamente.",
      resultado,
    });
  } catch (error) {
    console.error(
      "ERROR MOTOR FIDELIZACIÓN:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   También permite ejecutar el motor desde el sistema.
========================================================= */

export async function POST(
  request: Request
) {
  try {
    let empresaId:
      | string
      | null = null;

    try {
      const body =
        await request.json();

      if (
        body &&
        body.empresaId
      ) {
        empresaId =
          String(
            body.empresaId
          );
      }
    } catch {
      /* El body puede venir vacío */
    }

    const resultado =
      await generarCampanas(
        empresaId
      );

    return NextResponse.json({
      ok: true,
      mensaje:
        "Motor de fidelización ejecutado correctamente.",
      resultado,
    });
  } catch (error) {
    console.error(
      "ERROR MOTOR FIDELIZACIÓN:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido.",
      },
      {
        status: 500,
      }
    );
  }
}