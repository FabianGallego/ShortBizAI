import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* =========================================================
   MOTOR DE ENVÍO DE FIDELIZACIÓN
   ========================================================= */

type Campana = {
  id: number | string;
  empresa_id: number | string;
  cliente_key: string;
  cliente_nombre: string | null;
  email: string | null;
  telefono: string | null;
  reserva_id: number | string | null;
  tipo: string;
  canal: string;
  programada_para: string;
  enviada_at: string | null;
  estado: string;
  created_at?: string | null;
};

/* =========================================================
   CONTENIDO DE LOS EMAILS
   ========================================================= */

function obtenerContenidoEmail(
  campana: Campana,
  empresaNombre: string
) {
  const nombre =
    campana.cliente_nombre?.trim() ||
    "Cliente";

  /* =======================================================
     ESTILOS RESPONSIVE
  ======================================================= */

  const estilos = `
    <style>
      @media only screen and (max-width: 600px) {
        .email-wrapper {
          padding: 0 !important;
        }

        .email-container {
          width: 100% !important;
          max-width: 100% !important;
        }

        .email-content {
          padding: 24px 20px !important;
        }

        .email-title {
          font-size: 28px !important;
          line-height: 1.25 !important;
          letter-spacing: -0.2px !important;
        }

        .email-text {
          font-size: 16px !important;
          line-height: 1.6 !important;
        }

        .email-card {
          padding: 18px !important;
        }

        .email-footer {
          padding: 20px !important;
        }

        .email-button {
          width: 100% !important;
          box-sizing: border-box !important;
        }
      }

      @media only screen and (max-width: 380px) {
        .email-content {
          padding: 22px 16px !important;
        }

        .email-title {
          font-size: 25px !important;
          line-height: 1.25 !important;
        }
      }

      body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        background-color: #f3f4f6;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      table {
        border-spacing: 0 !important;
        border-collapse: collapse !important;
      }

      td {
        word-break: normal !important;
        overflow-wrap: normal !important;
        word-wrap: normal !important;
      }

      p,
      h1,
      h2,
      h3 {
        word-break: normal !important;
        overflow-wrap: normal !important;
        word-wrap: normal !important;
      }

      h1 {
        white-space: normal !important;
      }

      img {
        border: 0;
        outline: none;
        text-decoration: none;
        max-width: 100%;
        height: auto;
      }

      a {
        word-break: normal !important;
        overflow-wrap: normal !important;
      }
    </style>
  `;

  /* =======================================================
     AGRADECIMIENTO
  ======================================================= */

  if (
    campana.tipo ===
    "agradecimiento"
  ) {
    return {
      subject:
        `Gracias por visitarnos, ${nombre} ❤️`,

      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >
          <meta
            name="x-apple-disable-message-reformatting"
          >
          <title>Gracias por visitarnos</title>

          ${estilos}
        </head>

        <body
          style="
            margin:0;
            padding:0;
            width:100%;
            background-color:#f3f4f6;
            font-family:Arial, Helvetica, sans-serif;
          "
        >

          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            class="email-wrapper"
            style="
              width:100%;
              background-color:#f3f4f6;
              margin:0;
              padding:30px 15px;
            "
          >

            <tr>
              <td
                align="center"
                valign="top"
              >

                <table
                  role="presentation"
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  class="email-container"
                  style="
                    width:100%;
                    max-width:600px;
                    background-color:#ffffff;
                    margin:0 auto;
                    border-radius:16px;
                    overflow:hidden;
                  "
                >

                  <!-- HEADER -->

                  <tr>
                    <td
                      style="
                        padding:22px 24px;
                        background-color:#111827;
                        text-align:center;
                      "
                    >

                      <div
                        style="
                          font-size:20px;
                          line-height:1.3;
                          font-weight:700;
                          color:#ffffff;
                        "
                      >
                        ShortBizAI
                      </div>

                    </td>
                  </tr>

                  <!-- CONTENIDO -->

                  <tr>
                    <td
                      class="email-content"
                      style="
                        padding:36px 40px;
                        color:#111827;
                      "
                    >

                      <h1
                        class="email-title"
                        style="
                          margin:0 0 24px 0;
                          padding:0;
                          font-family:Arial, Helvetica, sans-serif;
                          font-size:28px;
                          line-height:1.25;
                          font-weight:700;
                          color:#111827;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                          letter-spacing:-0.2px;
                        "
                      >
                        Gracias por visitarnos ❤️
                      </h1>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Hola ${nombre},
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Gracias por haber visitado
                        <strong>${empresaNombre}</strong>.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Nos encantó recibirte y esperamos
                        verte nuevamente muy pronto.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 26px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Estamos preparando nuevos beneficios,
                        promociones y experiencias especiales
                        para nuestros clientes.
                      </p>

                      <!-- TARJETA -->

                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                      >
                        <tr>
                          <td
                            class="email-card"
                            style="
                              padding:20px;
                              background-color:#f3f4f6;
                              border-radius:12px;
                              color:#111827;
                              font-size:15px;
                              line-height:1.5;
                              white-space:normal;
                            "
                          >

                            <strong>
                              Gracias por ser parte de nuestra comunidad.
                            </strong>

                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- FOOTER -->

                  <tr>
                    <td
                      class="email-footer"
                      style="
                        padding:22px 40px;
                        background-color:#f9fafb;
                        border-top:1px solid #e5e7eb;
                        text-align:center;
                      "
                    >

                      <p
                        style="
                          margin:0;
                          padding:0;
                          font-size:12px;
                          line-height:1.5;
                          color:#9ca3af;
                        "
                      >
                        Powered by ShortBizAI
                      </p>

                    </td>
                  </tr>

                </table>

              </td>
            </tr>

          </table>

        </body>
        </html>
      `,
    };
  }

  /* =======================================================
     INVITACIÓN
  ======================================================= */

  if (
    campana.tipo ===
    "invitacion"
  ) {
    return {
      subject:
        `¿Volvemos a vernos, ${nombre}?`,

      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >
          <meta
            name="x-apple-disable-message-reformatting"
          >
          <title>Volvemos a vernos</title>

          ${estilos}
        </head>

        <body
          style="
            margin:0;
            padding:0;
            width:100%;
            background-color:#f3f4f6;
            font-family:Arial, Helvetica, sans-serif;
          "
        >

          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            class="email-wrapper"
            style="
              width:100%;
              background-color:#f3f4f6;
              margin:0;
              padding:30px 15px;
            "
          >

            <tr>
              <td align="center">

                <table
                  role="presentation"
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  class="email-container"
                  style="
                    width:100%;
                    max-width:600px;
                    background-color:#ffffff;
                    margin:0 auto;
                    border-radius:16px;
                    overflow:hidden;
                  "
                >

                  <tr>
                    <td
                      style="
                        padding:22px 24px;
                        background-color:#111827;
                        text-align:center;
                      "
                    >

                      <div
                        style="
                          font-size:20px;
                          line-height:1.3;
                          font-weight:700;
                          color:#ffffff;
                        "
                      >
                        ShortBizAI
                      </div>

                    </td>
                  </tr>

                  <tr>
                    <td
                      class="email-content"
                      style="
                        padding:36px 40px;
                        color:#111827;
                      "
                    >

                      <h1
                        class="email-title"
                        style="
                          margin:0 0 24px 0;
                          padding:0;
                          font-family:Arial, Helvetica, sans-serif;
                          font-size:28px;
                          line-height:1.25;
                          font-weight:700;
                          color:#111827;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                          letter-spacing:-0.2px;
                        "
                      >
                        ¡Nos gustaría verte nuevamente!
                      </h1>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Hola ${nombre},
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Hace unos días disfrutaste de
                        <strong>${empresaNombre}</strong>.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        ¿Qué tal si volvemos a vernos?
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Nos encantará recibirte nuevamente.
                      </p>

                    </td>
                  </tr>

                  <tr>
                    <td
                      class="email-footer"
                      style="
                        padding:22px 40px;
                        background-color:#f9fafb;
                        border-top:1px solid #e5e7eb;
                        text-align:center;
                      "
                    >

                      <p
                        style="
                          margin:0;
                          font-size:12px;
                          line-height:1.5;
                          color:#9ca3af;
                        "
                      >
                        Powered by ShortBizAI
                      </p>

                    </td>
                  </tr>

                </table>

              </td>
            </tr>

          </table>

        </body>
        </html>
      `,
    };
  }

  /* =======================================================
     SEGUNDO INTENTO
  ======================================================= */

  if (
    campana.tipo ===
    "segundo_intento"
  ) {
    return {
      subject:
        `Te esperamos nuevamente en ${empresaNombre}`,

      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >
          <meta
            name="x-apple-disable-message-reformatting"
          >
          <title>Te esperamos nuevamente</title>

          ${estilos}
        </head>

        <body
          style="
            margin:0;
            padding:0;
            width:100%;
            background-color:#f3f4f6;
            font-family:Arial, Helvetica, sans-serif;
          "
        >

          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            class="email-wrapper"
            style="
              width:100%;
              background-color:#f3f4f6;
              margin:0;
              padding:30px 15px;
            "
          >

            <tr>
              <td align="center">

                <table
                  role="presentation"
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  class="email-container"
                  style="
                    width:100%;
                    max-width:600px;
                    background-color:#ffffff;
                    margin:0 auto;
                    border-radius:16px;
                    overflow:hidden;
                  "
                >

                  <tr>
                    <td
                      style="
                        padding:22px 24px;
                        background-color:#111827;
                        text-align:center;
                      "
                    >

                      <div
                        style="
                          font-size:20px;
                          line-height:1.3;
                          font-weight:700;
                          color:#ffffff;
                        "
                      >
                        ShortBizAI
                      </div>

                    </td>
                  </tr>

                  <tr>
                    <td
                      class="email-content"
                      style="
                        padding:36px 40px;
                        color:#111827;
                      "
                    >

                      <h1
                        class="email-title"
                        style="
                          margin:0 0 24px 0;
                          padding:0;
                          font-family:Arial, Helvetica, sans-serif;
                          font-size:28px;
                          line-height:1.25;
                          font-weight:700;
                          color:#111827;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                          letter-spacing:-0.2px;
                        "
                      >
                        Te esperamos nuevamente
                      </h1>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Hola ${nombre},
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Queríamos pasar a saludarte y recordarte
                        que las puertas de
                        <strong>${empresaNombre}</strong>
                        están abiertas para ti.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                          white-space:normal;
                          word-break:normal;
                          overflow-wrap:normal;
                          word-wrap:normal;
                        "
                      >
                        Esperamos tener la oportunidad de recibirte
                        nuevamente.
                      </p>

                    </td>
                  </tr>

                  <tr>
                    <td
                      class="email-footer"
                      style="
                        padding:22px 40px;
                        background-color:#f9fafb;
                        border-top:1px solid #e5e7eb;
                        text-align:center;
                      "
                    >

                      <p
                        style="
                          margin:0;
                          font-size:12px;
                          line-height:1.5;
                          color:#9ca3af;
                        "
                      >
                        Powered by ShortBizAI
                      </p>

                    </td>
                  </tr>

                </table>

              </td>
            </tr>

          </table>

        </body>
        </html>
      `,
    };
  }

  /* =======================================================
     REACTIVACIÓN
  ======================================================= */

  return {
    subject:
      `Te extrañamos en ${empresaNombre} ❤️`,

    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        >
        <meta
          name="x-apple-disable-message-reformatting"
        >
        <title>Te extrañamos</title>

        ${estilos}
      </head>

      <body
        style="
          margin:0;
          padding:0;
          width:100%;
          background-color:#f3f4f6;
          font-family:Arial, Helvetica, sans-serif;
        "
      >

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          class="email-wrapper"
          style="
            width:100%;
            background-color:#f3f4f6;
            margin:0;
            padding:30px 15px;
          "
        >

          <tr>
            <td align="center">

              <table
                role="presentation"
                width="600"
                cellpadding="0"
                cellspacing="0"
                border="0"
                class="email-container"
                style="
                  width:100%;
                  max-width:600px;
                  background-color:#ffffff;
                  margin:0 auto;
                  border-radius:16px;
                  overflow:hidden;
                "
              >

                <tr>
                  <td
                    style="
                      padding:22px 24px;
                      background-color:#111827;
                      text-align:center;
                    "
                  >

                    <div
                      style="
                        font-size:20px;
                        line-height:1.3;
                        font-weight:700;
                        color:#ffffff;
                      "
                    >
                      ShortBizAI
                    </div>

                  </td>
                </tr>

                <tr>
                  <td
                    class="email-content"
                    style="
                      padding:36px 40px;
                      color:#111827;
                    "
                  >

                    <h1
                      class="email-title"
                      style="
                        margin:0 0 24px 0;
                        padding:0;
                        font-family:Arial, Helvetica, sans-serif;
                        font-size:28px;
                        line-height:1.25;
                        font-weight:700;
                        color:#111827;
                        white-space:normal;
                        word-break:normal;
                        overflow-wrap:normal;
                        word-wrap:normal;
                        letter-spacing:-0.2px;
                      "
                    >
                      Te extrañamos ❤️
                    </h1>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                        white-space:normal;
                        word-break:normal;
                        overflow-wrap:normal;
                        word-wrap:normal;
                      "
                    >
                      Hola ${nombre},
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                        white-space:normal;
                        word-break:normal;
                        overflow-wrap:normal;
                        word-wrap:normal;
                      "
                    >
                      Hace un tiempo no te vemos por
                      <strong>${empresaNombre}</strong>.
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                        white-space:normal;
                        word-break:normal;
                        overflow-wrap:normal;
                        word-wrap:normal;
                      "
                    >
                      Nos encantaría recibirte nuevamente.
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                        white-space:normal;
                        word-break:normal;
                        overflow-wrap:normal;
                        word-wrap:normal;
                      "
                    >
                      ¡Esperamos verte pronto!
                    </p>

                  </td>
                </tr>

                <tr>
                  <td
                    class="email-footer"
                    style="
                      padding:22px 40px;
                      background-color:#f9fafb;
                      border-top:1px solid #e5e7eb;
                      text-align:center;
                    "
                  >

                    <p
                      style="
                        margin:0;
                        font-size:12px;
                        line-height:1.5;
                        color:#9ca3af;
                      "
                    >
                      Powered by ShortBizAI
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

        </table>

      </body>
      </html>
    `,
  };
}

/* =========================================================
   OBTENER EMPRESA
   ========================================================= */

async function obtenerEmpresaNombre(
  empresaId: number | string
) {
  const {
    data,
    error,
  } = await supabase
    .from("empresas")
    .select("nombre")
    .eq(
      "id",
      empresaId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Error buscando empresa: ${error.message}`
    );
  }

  return (
    data?.nombre ||
    "nuestro restaurante"
  );
}

/* =========================================================
   ENVIAR EMAIL CON RESEND
   ========================================================= */

async function enviarEmail(
  campana: Campana,
  empresaNombre: string
) {
  const apiKey =
    process.env.RESEND_API_KEY;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error(
      "Falta RESEND_API_KEY en las variables de entorno."
    );
  }

  if (!fromEmail) {
    throw new Error(
      "Falta RESEND_FROM_EMAIL en las variables de entorno."
    );
  }

  if (!campana.email) {
    throw new Error(
      "La campaña no tiene email."
    );
  }

  const contenido =
    obtenerContenidoEmail(
      campana,
      empresaNombre
    );

  const respuesta =
    await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          from:
            fromEmail,

          to: [
            campana.email,
          ],

          subject:
            contenido.subject,

          html:
            contenido.html,
        }),
      }
    );

  const resultado =
    await respuesta.json();

  if (!respuesta.ok) {
    console.error(
      "ERROR RESEND:",
      resultado
    );

    throw new Error(
      resultado?.message ||
        "Resend no pudo enviar el email."
    );
  }

  return resultado;
}

/* =========================================================
   PROCESAR CAMPAÑAS PENDIENTES
   ========================================================= */

async function procesarCampanas(
  empresaIdFiltro?: string | null
) {
  let consulta =
    supabase
      .from(
        "fidelizacion_campanas"
      )
      .select(
        `
          id,
          empresa_id,
          cliente_key,
          cliente_nombre,
          email,
          telefono,
          reserva_id,
          tipo,
          canal,
          programada_para,
          enviada_at,
          estado,
          created_at
        `
      )
      .eq(
        "estado",
        "pendiente"
      )
      .lte(
        "programada_para",
        new Date().toISOString()
      )
      .order(
        "programada_para",
        {
          ascending: true,
        }
      );

  if (
    empresaIdFiltro
  ) {
    consulta =
      consulta.eq(
        "empresa_id",
        empresaIdFiltro
      );
  }

  const {
    data,
    error,
  } =
    await consulta;

  if (error) {
    throw new Error(
      `Error buscando campañas pendientes: ${error.message}`
    );
  }

  const campanas =
    (data || []) as Campana[];

  const resultados: any[] = [];

  for (
    const campana of campanas
  ) {
    try {
      /* =====================================================
         OBTENER EMPRESA
      ===================================================== */

      const empresaNombre =
        await obtenerEmpresaNombre(
          campana.empresa_id
        );

      /* =====================================================
         ENVIAR EMAIL
      ===================================================== */

      const resultadoEmail =
        await enviarEmail(
          campana,
          empresaNombre
        );

      console.log(
        "EMAIL ENVIADO:",
        resultadoEmail
      );

      /* =====================================================
         MARCAR CAMPAÑA COMO ENVIADA
      ===================================================== */

      const ahora =
        new Date().toISOString();

      const {
        error:
          errorActualizar,
      } =
        await supabase
          .from(
            "fidelizacion_campanas"
          )
          .update({
            estado:
              "enviada",

            enviada_at:
              ahora,
          })
          .eq(
            "id",
            campana.id
          );

      if (
        errorActualizar
      ) {
        throw new Error(
          `Email enviado pero no se pudo actualizar la campaña: ${errorActualizar.message}`
        );
      }

      resultados.push({
        id:
          campana.id,

        email:
          campana.email,

        tipo:
          campana.tipo,

        estado:
          "enviada",

        mensaje:
          "Email enviado correctamente.",

        resend:
          resultadoEmail,
      });
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "Error desconocido.";

      console.error(
        `ERROR CAMPAÑA ${campana.id}:`,
        mensaje
      );

      /*
       * No dejamos la campaña en pendiente
       * si el envío falló.
       */

      await supabase
        .from(
          "fidelizacion_campanas"
        )
        .update({
          estado:
            "error",
        })
        .eq(
          "id",
          campana.id
        );

      resultados.push({
        id:
          campana.id,

        email:
          campana.email,

        tipo:
          campana.tipo,

        estado:
          "error",

        mensaje,
      });
    }
  }

  return {
    totalEncontradas:
      campanas.length,

    enviadas:
      resultados.filter(
        (resultado) =>
          resultado.estado ===
          "enviada"
      ).length,

    errores:
      resultados.filter(
        (resultado) =>
          resultado.estado ===
          "error"
      ).length,

    resultados,
  };
}

/* =========================================================
   GET
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
      await procesarCampanas(
        empresaId
      );

    return NextResponse.json({
      ok: true,

      mensaje:
        "Motor de envío de fidelización ejecutado correctamente.",

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
      /*
       * Body vacío permitido.
       */
    }

    const resultado =
      await procesarCampanas(
        empresaId
      );

    return NextResponse.json({
      ok: true,

      mensaje:
        "Motor de envío de fidelización ejecutado correctamente.",

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