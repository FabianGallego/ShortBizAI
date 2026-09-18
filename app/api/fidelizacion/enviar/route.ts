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
  empresaNombre: string,
  codigoPublico: string | null
) {
  const nombre =
    campana.cliente_nombre?.trim() ||
    "Guest";

  /* =======================================================
     URL PÚBLICA DE RESERVA
  ======================================================= */

  const reservaUrl =
    codigoPublico
      ? `https://shortbizai.com/r/${codigoPublico}`
      : "https://shortbizai.com";

  /* =======================================================
     BOTÓN DE RESERVA
  ======================================================= */

  const botonReserva = `
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="margin-top:28px;"
    >
      <tr>
        <td align="center">

          <a
            href="${reservaUrl}"
            target="_blank"
            class="email-button"
            style="
              display:inline-block;
              background-color:#111827;
              color:#ffffff;
              text-decoration:none;
              font-family:Arial, Helvetica, sans-serif;
              font-size:15px;
              font-weight:700;
              line-height:1;
              padding:16px 28px;
              border-radius:8px;
              text-align:center;
            "
          >
            BOOK YOUR TABLE →
          </a>

        </td>
      </tr>
    </table>
  `;

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
     DAY 5 — THANK YOU
  ======================================================= */

  if (
    campana.tipo ===
    "agradecimiento"
  ) {
    return {
      subject:
        `Thank you for visiting us, ${nombre} ❤️`,

      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <meta
            name="x-apple-disable-message-reformatting"
          >

          <title>
            Thank you for visiting us
          </title>

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

                  <!-- CONTENT -->

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
                        Thank you for visiting us ❤️
                      </h1>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Hi ${nombre},
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Thank you for choosing
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
                        "
                      >
                        We hope you enjoyed the food,
                        the atmosphere, and your time with us.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        For us, every visit is more than
                        just a reservation. It is an opportunity
                        to create an experience that makes
                        you want to come back.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        We're always working on new
                        experiences, special moments,
                        and reasons to make your next
                        visit even better.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 26px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        We'd love to see you again.
                      </p>

                      <!-- CTA -->

                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="margin-bottom:8px;"
                      >
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size:13px;
                              line-height:1.5;
                              font-weight:700;
                              color:#111827;
                              letter-spacing:0.5px;
                            "
                          >
                            READY FOR YOUR NEXT VISIT?
                          </td>
                        </tr>
                      </table>

                      ${botonReserva}

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
                          margin:0 0 8px 0;
                          font-size:14px;
                          line-height:1.5;
                          color:#374151;
                        "
                      >
                        With appreciation,
                      </p>

                      <p
                        style="
                          margin:0 0 12px 0;
                          font-size:14px;
                          line-height:1.5;
                          font-weight:600;
                          color:#374151;
                        "
                      >
                        The ${empresaNombre} Team
                      </p>

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
     DAY 15 — COME BACK
  ======================================================= */

  if (
    campana.tipo ===
    "invitacion"
  ) {
    return {
      subject:
        `What if we did it again, ${nombre}?`,

      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <meta
            name="x-apple-disable-message-reformatting"
          >

          <title>
            What if we did it again?
          </title>

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

                  <!-- CONTENT -->

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
                        What if we did it again?
                      </h1>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Hi ${nombre},
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        It's been a little while since
                        your last visit to
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
                        "
                      >
                        So we thought we'd ask:
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:18px;
                          line-height:1.6;
                          font-weight:700;
                          color:#111827;
                        "
                      >
                        What if we did it again?
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Maybe it's another dinner with
                        someone special.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Maybe it's a night out with friends.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Or maybe you simply feel like
                        enjoying that experience again.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Whatever the occasion, we'd love
                        to have you back.
                      </p>

                      <!-- CTA -->

                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="margin-bottom:8px;"
                      >
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size:13px;
                              line-height:1.5;
                              font-weight:700;
                              color:#111827;
                              letter-spacing:0.5px;
                            "
                          >
                            READY FOR ANOTHER VISIT?
                          </td>
                        </tr>
                      </table>

                      ${botonReserva}

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
                          margin:0 0 8px 0;
                          font-size:14px;
                          line-height:1.5;
                          color:#374151;
                        "
                      >
                        We'll take care of the rest.
                      </p>

                      <p
                        style="
                          margin:0 0 12px 0;
                          font-size:14px;
                          line-height:1.5;
                          color:#374151;
                        "
                      >
                        Warmly,<br>
                        The ${empresaNombre} Team
                      </p>

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
     DAY 30 — A REASON TO RETURN
  ======================================================= */

  if (
    campana.tipo ===
    "segundo_intento"
  ) {
    return {
      subject:
        `We have something for your next visit, ${nombre}`,

      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <meta
            name="x-apple-disable-message-reformatting"
          >

          <title>
            We have something for your next visit
          </title>

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

                  <!-- CONTENT -->

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
                        We have something for your next visit
                      </h1>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Hi ${nombre},
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        It's been a little while since
                        we last saw you at
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
                        "
                      >
                        We'd love to welcome you back.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        So here's a little something to
                        make your next visit even more special:
                      </p>

                      <!-- BENEFICIO CONTROLADO POR EL RESTAURANTE -->

                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                          margin:24px 0 22px 0;
                        "
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
                              text-align:center;
                            "
                          >

                            <strong>
                              [YOUR SPECIAL BENEFIT / OFFER]
                            </strong>

                          </td>
                        </tr>
                      </table>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 18px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Because coming back should feel
                        just as good as the first time.
                      </p>

                      <p
                        class="email-text"
                        style="
                          margin:0 0 26px 0;
                          padding:0;
                          font-size:16px;
                          line-height:1.6;
                          color:#374151;
                        "
                      >
                        Whether it's dinner, drinks,
                        a celebration, or simply a night out,
                        we'd love to have you with us again.
                      </p>

                      <!-- CTA -->

                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="margin-bottom:8px;"
                      >
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size:13px;
                              line-height:1.5;
                              font-weight:700;
                              color:#111827;
                              letter-spacing:0.5px;
                            "
                          >
                            READY TO COME BACK?
                          </td>
                        </tr>
                      </table>

                      ${botonReserva}

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
                          margin:0 0 8px 0;
                          font-size:14px;
                          line-height:1.5;
                          color:#374151;
                        "
                      >
                        We'll be happy to see you.
                      </p>

                      <p
                        style="
                          margin:0 0 12px 0;
                          font-size:14px;
                          line-height:1.5;
                          color:#374151;
                        "
                      >
                        Warmly,<br>
                        The ${empresaNombre} Team
                      </p>

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
     DAY 45 — WE MISS YOU
  ======================================================= */

  return {
    subject:
      `We miss seeing you, ${nombre} ❤️`,

    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        >

        <meta
          name="x-apple-disable-message-reformatting"
        >

        <title>
          We miss seeing you
        </title>

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

                <!-- CONTENT -->

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
                      We miss seeing you ❤️
                    </h1>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                      "
                    >
                      Hi ${nombre},
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                      "
                    >
                      It's been a little while since
                      your last visit to
                      <strong>${empresaNombre}</strong>.
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                      "
                    >
                      And honestly...
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:18px;
                        line-height:1.6;
                        font-weight:700;
                        color:#111827;
                      "
                    >
                      We'd love to see you again.
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                      "
                    >
                      Maybe it's been a busy few weeks.
                      Maybe you've discovered somewhere new.
                      Or maybe you simply haven't had a reason
                      to come back yet.
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 18px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                      "
                    >
                      Whatever the reason, your table
                      is always waiting.
                    </p>

                    <p
                      class="email-text"
                      style="
                        margin:0 0 26px 0;
                        font-size:16px;
                        line-height:1.6;
                        color:#374151;
                      "
                    >
                      Come enjoy your favorite dishes,
                      discover something new, or simply
                      spend another great evening with us.
                    </p>

                    <!-- CTA -->

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin-bottom:8px;"
                    >
                      <tr>
                        <td
                          align="center"
                          style="
                            font-size:13px;
                            line-height:1.5;
                            font-weight:700;
                            color:#111827;
                            letter-spacing:0.5px;
                          "
                        >
                          YOUR NEXT VISIT IS JUST A CLICK AWAY.
                        </td>
                      </tr>
                    </table>

                    ${botonReserva}

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
                        margin:0 0 8px 0;
                        font-size:14px;
                        line-height:1.5;
                        color:#374151;
                      "
                    >
                      We hope to welcome you back soon.
                    </p>

                    <p
                      style="
                        margin:0 0 12px 0;
                        font-size:14px;
                        line-height:1.5;
                        color:#374151;
                      "
                    >
                      Warmly,<br>
                      The ${empresaNombre} Team
                    </p>

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
    .select(
      "nombre, codigo_publico"
    )
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

  return {
    nombre:
      data?.nombre ||
      "our restaurant",

    codigoPublico:
      data?.codigo_publico ||
      null,
  };
}

/* =========================================================
   ENVIAR EMAIL CON RESEND
   ========================================================= */

async function enviarEmail(
  campana: Campana,
  empresaNombre: string,
  codigoPublico: string | null
) {
  const apiKey =
    process.env.RESEND_API_KEY;

  const fromEmail =
    process.env.LOYALTY_FROM_EMAIL;

  if (!apiKey) {
    throw new Error(
      "Falta RESEND_API_KEY en las variables de entorno."
    );
  }

  if (!fromEmail) {
    throw new Error(
      "Falta LOYALTY_FROM_EMAIL en las variables de entorno."
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
      empresaNombre,
      codigoPublico
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
        "Resend could not send the email."
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

      const empresa =
        await obtenerEmpresaNombre(
          campana.empresa_id
        );

      /* =====================================================
         ENVIAR EMAIL
      ===================================================== */

      const resultadoEmail =
        await enviarEmail(
          campana,
          empresa.nombre,
          empresa.codigoPublico
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
        "Loyalty email engine executed successfully.",

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
            : "Unknown error.",
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
       * Empty body allowed.
       */
    }

    const resultado =
      await procesarCampanas(
        empresaId
      );

    return NextResponse.json({
      ok: true,

      mensaje:
        "Loyalty email engine executed successfully.",

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
            : "Unknown error.",
      },
      {
        status: 500,
      }
    );
  }
}