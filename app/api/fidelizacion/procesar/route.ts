import { NextResponse } from "next/server";

/* =========================================================
   MOTOR CENTRAL DE FIDELIZACIÓN

   Este endpoint ejecuta en orden:

   1. GENERAR campañas pendientes
   2. ENVIAR campañas pendientes

   Así posteriormente podremos ejecutarlo automáticamente
   una vez al día mediante un cron.
   ========================================================= */

export async function POST(request: Request) {
  try {
    /* =======================================================
       LEER EMPRESA OPCIONAL
    ======================================================= */

    let empresaId: string | null = null;

    try {
      const body = await request.json();

      if (body && body.empresaId) {
        empresaId = String(body.empresaId);
      }
    } catch {
      /*
       * Body vacío permitido.
       */
    }

    /* =======================================================
       DETERMINAR URL BASE
    ======================================================= */

    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    /* =======================================================
       PASO 1 — GENERAR CAMPAÑAS
    ======================================================= */

    const urlGenerar = new URL(
      "/api/fidelizacion/generar",
      baseUrl
    );

    if (empresaId) {
      urlGenerar.searchParams.set(
        "empresaId",
        empresaId
      );
    }

    const respuestaGenerar = await fetch(
      urlGenerar.toString(),
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const resultadoGenerar =
      await respuestaGenerar.json();

    if (!respuestaGenerar.ok) {
      throw new Error(
        resultadoGenerar?.error ||
          "Error ejecutando el motor de generación."
      );
    }

    /* =======================================================
       PASO 2 — ENVIAR CAMPAÑAS
    ======================================================= */

    const respuestaEnviar = await fetch(
      `${baseUrl}/api/fidelizacion/enviar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          empresaId
            ? { empresaId }
            : {}
        ),
        cache: "no-store",
      }
    );

    const resultadoEnviar =
      await respuestaEnviar.json();

    if (!respuestaEnviar.ok) {
      throw new Error(
        resultadoEnviar?.error ||
          "Error ejecutando el motor de envío."
      );
    }

    /* =======================================================
       RESULTADO FINAL
    ======================================================= */

    return NextResponse.json({
      ok: true,

      mensaje:
        "Motor completo de fidelización ejecutado correctamente.",

      generar: resultadoGenerar,

      enviar: resultadoEnviar,
    });
  } catch (error) {
    console.error(
      "ERROR MOTOR CENTRAL DE FIDELIZACIÓN:",
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
   GET

   También permitimos ejecutar el motor desde el navegador
   para hacer pruebas fácilmente.
   ========================================================= */

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const empresaId =
      url.searchParams.get("empresaId");

    const baseUrl =
      `${url.protocol}//${url.host}`;

    /* =======================================================
       PASO 1 — GENERAR
    ======================================================= */

    const urlGenerar = new URL(
      "/api/fidelizacion/generar",
      baseUrl
    );

    if (empresaId) {
      urlGenerar.searchParams.set(
        "empresaId",
        empresaId
      );
    }

    const respuestaGenerar =
      await fetch(
        urlGenerar.toString(),
        {
          method: "GET",
          cache: "no-store",
        }
      );

    const resultadoGenerar =
      await respuestaGenerar.json();

    if (!respuestaGenerar.ok) {
      throw new Error(
        resultadoGenerar?.error ||
          "Error ejecutando generación."
      );
    }

    /* =======================================================
       PASO 2 — ENVIAR
    ======================================================= */

    const respuestaEnviar =
      await fetch(
        `${baseUrl}/api/fidelizacion/enviar`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            empresaId
              ? { empresaId }
              : {}
          ),

          cache: "no-store",
        }
      );

    const resultadoEnviar =
      await respuestaEnviar.json();

    if (!respuestaEnviar.ok) {
      throw new Error(
        resultadoEnviar?.error ||
          "Error ejecutando envío."
      );
    }

    /* =======================================================
       RESULTADO
    ======================================================= */

    return NextResponse.json({
      ok: true,

      mensaje:
        "Motor completo de fidelización ejecutado correctamente.",

      generar:
        resultadoGenerar,

      enviar:
        resultadoEnviar,
    });
  } catch (error) {
    console.error(
      "ERROR MOTOR CENTRAL DE FIDELIZACIÓN:",
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