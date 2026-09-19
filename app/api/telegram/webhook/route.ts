import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESERVA_FROM_EMAIL =
  process.env.RESERVA_FROM_EMAIL || "reserva@shortbizai.com";

// =====================================================
// WHATSAPP CLOUD API
// =====================================================

const WHATSAPP_ACCESS_TOKEN =
  process.env.WHATSAPP_ACCESS_TOKEN;

const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;

// =====================================================
// ENVIAR WHATSAPP AL CLIENTE
//
// Importante:
// - WhatsApp es independiente de Push y Email.
// - Si WhatsApp falla, NO se cancela la reserva.
// - El token nunca se imprime en los logs.
// =====================================================

async function enviarWhatsApp(
  telefono: string | null | undefined,
  clienteNombre: string | null | undefined,
  fecha: string | null | undefined,
  hora: string | null | undefined,
  personas: number | null | undefined,
  reservaId: number | string,
  confirmado: boolean
) {
  if (
    !WHATSAPP_ACCESS_TOKEN ||
    !WHATSAPP_PHONE_NUMBER_ID
  ) {
    console.warn(
      "⚠️ WHATSAPP NO CONFIGURADO: falta WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID"
    );

    return {
      enviado: false,
      motivo:
        "Falta configuración de WhatsApp",
    };
  }

  if (!telefono?.trim()) {
    console.warn(
      "⚠️ WHATSAPP: la reserva no tiene teléfono:",
      reservaId
    );

    return {
      enviado: false,
      motivo:
        "La reserva no tiene teléfono del cliente",
    };
  }

  // ===================================================
  // NORMALIZAR TELÉFONO
  //
  // Ejemplo:
  // (929) 301-1167
  // 929-301-1167
  // +1 929 301 1167
  //
  // Se convierte a:
  // 19293011167
  // ===================================================

  let telefonoWhatsApp =
    telefono.replace(/\D/g, "");

  // Si el teléfono viene con 10 dígitos,
  // asumimos Estados Unidos.
  if (
    telefonoWhatsApp.length === 10
  ) {
    telefonoWhatsApp =
      `1${telefonoWhatsApp}`;
  }

  if (
    telefonoWhatsApp.length < 10
  ) {
    console.warn(
      "⚠️ WHATSAPP: teléfono inválido:",
      telefono
    );

    return {
      enviado: false,
      motivo:
        "Número de teléfono inválido",
    };
  }

  const nombre =
    clienteNombre?.trim() ||
    "Cliente";

  const fechaTexto =
    fecha || "la fecha solicitada";

  const horaTexto =
    hora || "la hora solicitada";

  const personasTexto =
    personas
      ? String(personas)
      : "—";

  // ===================================================
  // MENSAJE
  // ===================================================

  const mensaje = confirmado
    ? `Hola ${nombre} 👋

Tu reserva ha sido confirmada. ✅

📅 Fecha: ${fechaTexto}
🕐 Hora: ${horaTexto}
👥 Personas: ${personasTexto}

Número de reserva: #${reservaId}

Gracias por reservar con nosotros.

— ShortBizAI`
    : `Hola ${nombre} 👋

Tu reserva ha sido cancelada. ❌

📅 Fecha: ${fechaTexto}
🕐 Hora: ${horaTexto}
👥 Personas: ${personasTexto}

Número de reserva: #${reservaId}

Si necesitas realizar una nueva reserva, puedes hacerlo nuevamente.

— ShortBizAI`;

  // ===================================================
  // ENDPOINT WHATSAPP CLOUD API
  // ===================================================

  const url =
    `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const respuesta =
      await fetch(url, {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${WHATSAPP_ACCESS_TOKEN}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          messaging_product:
            "whatsapp",

          recipient_type:
            "individual",

          to:
            telefonoWhatsApp,

          type:
            "text",

          text: {
            preview_url:
              false,

            body:
              mensaje,
          },
        }),
      });

    const resultado =
      await respuesta.json();

    console.log(
      "WHATSAPP HTTP STATUS:",
      respuesta.status
    );

    // IMPORTANTE:
    // Nunca imprimimos el token.

    console.log(
      "WHATSAPP RESPONSE:",
      resultado
    );

    if (!respuesta.ok) {
      const motivo =
        resultado?.error?.message ||
        resultado?.message ||
        "WhatsApp rechazó el mensaje";

      console.error(
        "❌ WHATSAPP NO ENVIADO:",
        motivo
      );

      return {
        enviado: false,
        motivo,
        respuesta:
          resultado,
      };
    }

    const messageId =
      resultado?.messages?.[0]?.id ||
      null;

    console.log(
      "================================="
    );

    console.log(
      "✅ WHATSAPP ENVIADO AL CLIENTE"
    );

    console.log(
      "RESERVA:",
      reservaId
    );

    console.log(
      "TELÉFONO:",
      telefonoWhatsApp
    );

    console.log(
      "MESSAGE ID:",
      messageId
    );

    console.log(
      "================================="
    );

    return {
      enviado: true,
      messageId,
      respuesta:
        resultado,
    };
  } catch (error: any) {
    const motivo =
      error?.message ||
      "Error enviando WhatsApp";

    console.error(
      "❌ ERROR ENVIANDO WHATSAPP:",
      motivo
    );

    return {
      enviado: false,
      motivo,
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "================================="
    );

    console.log(
      "TELEGRAM WEBHOOK RECIBIDO"
    );

    console.log(
      JSON.stringify(body, null, 2)
    );

    console.log(
      "================================="
    );

    // =====================================================
    // VALIDAR TOKEN
    // =====================================================

    if (!TELEGRAM_TOKEN) {
      console.error(
        "❌ FALTA TELEGRAM_BOT_TOKEN"
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Falta TELEGRAM_BOT_TOKEN",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // CONFIGURAR WEB PUSH
    // =====================================================

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    // =====================================================
    // CONFIRMAR / CANCELAR
    // =====================================================

    if (body.callback_query) {
      const callbackQuery =
        body.callback_query;

      const accion =
        callbackQuery.data;

      console.log(
        "ACCIÓN TELEGRAM:",
        accion
      );

      if (!accion) {
        console.error(
          "❌ CALLBACK SIN ACCIÓN"
        );

        return NextResponse.json({
          ok: true,
        });
      }

      // ===================================================
      // EXTRAER ACCIÓN E ID
      //
      // Ejemplo:
      // confirmar_123
      // cancelar_123
      // ===================================================

      const separador =
        accion.indexOf("_");

      if (separador === -1) {
        console.error(
          "❌ CALLBACK INVÁLIDO:",
          accion
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const tipo =
        accion.substring(
          0,
          separador
        );

      const id =
        accion.substring(
          separador + 1
        );

      console.log(
        "TIPO:",
        tipo
      );

      console.log(
        "ID RESERVA:",
        id
      );

      // ===================================================
      // VALIDAR ACCIÓN
      // ===================================================

      if (
        !id ||
        ![
          "confirmar",
          "cancelar",
        ].includes(tipo)
      ) {
        console.error(
          "❌ ACCIÓN INVÁLIDA:",
          accion
        );

        return NextResponse.json({
          ok: true,
        });
      }

      // ===================================================
      // NUEVO ESTADO
      // ===================================================

      const estado =
        tipo === "confirmar"
          ? "confirmada"
          : "cancelada";

      console.log(
        "NUEVO ESTADO:",
        estado
      );

      // ===================================================
      // BUSCAR RESERVA
      // ===================================================

      const {
        data: reservaExistente,
        error: buscarError,
      } = await supabaseAdmin
        .from("reservas")
        .select(
          "id, cliente_nombre, telefono, email, fecha, hora, personas, push_endpoint, estado"
        )
        .eq("id", id)
        .maybeSingle();

      if (buscarError) {
        console.error(
          "❌ ERROR BUSCANDO RESERVA:",
          buscarError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Error buscando la reserva",
            detalle:
              buscarError.message,
          },
          { status: 500 }
        );
      }

      if (!reservaExistente) {
        console.error(
          "❌ RESERVA NO ENCONTRADA:",
          id
        );

        try {
          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                callback_query_id:
                  callbackQuery.id,

                text:
                  "❌ Reserva no encontrada",
              }),
            }
          );
        } catch (error) {
          console.error(
            "ERROR CALLBACK TELEGRAM:",
            error
          );
        }

        return NextResponse.json(
          {
            ok: false,
            error:
              "Reserva no encontrada",
          },
          { status: 404 }
        );
      }

      console.log(
        "RESERVA ENCONTRADA:",
        reservaExistente
      );

      // ===================================================
      // ACTUALIZAR ESTADO
      // ===================================================

      const {
        data: reserva,
        error: actualizarError,
      } = await supabaseAdmin
        .from("reservas")
        .update({
          estado,
        })
        .eq("id", id)
        .select(
          "id, cliente_nombre, telefono, email, fecha, hora, personas, push_endpoint, estado"
        )
        .single();

      if (actualizarError) {
        console.error(
          "❌ ERROR ACTUALIZANDO RESERVA:",
          actualizarError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "No se pudo actualizar la reserva",
            detalle:
              actualizarError.message,
          },
          { status: 500 }
        );
      }

      console.log(
        "================================="
      );

      console.log(
        "✅ RESERVA ACTUALIZADA"
      );

      console.log(
        "ID:",
        reserva.id
      );

      console.log(
        "ESTADO:",
        reserva.estado
      );

      console.log(
        "================================="
      );

      // ===================================================
      // RESPONDER A TELEGRAM
      // ===================================================

      try {
        const respuestaCallback =
          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                callback_query_id:
                  callbackQuery.id,

                text:
                  tipo === "confirmar"
                    ? "✅ Reserva confirmada"
                    : "❌ Reserva cancelada",

                show_alert: false,
              }),
            }
          );

        const resultadoCallback =
          await respuestaCallback.json();

        console.log(
          "TELEGRAM CALLBACK:",
          resultadoCallback
        );
      } catch (error) {
        console.error(
          "❌ ERROR RESPONDIENDO A TELEGRAM:",
          error
        );
      }

      // ===================================================
      // NOTIFICACIONES AL CLIENTE
      //
      // PUSH, EMAIL Y WHATSAPP SON INDEPENDIENTES.
      //
      // Si uno falla, los otros continúan.
      // ===================================================

      let pushEnviado = false;
      let emailEnviado = false;
      let whatsappEnviado = false;

      let motivoPush = "";
      let motivoEmail = "";
      let motivoWhatsApp = "";

      // ===================================================
      // PUSH AL CLIENTE
      // ===================================================

      if (!reserva.push_endpoint) {
        console.warn(
          "⚠️ ESTA RESERVA NO TIENE push_endpoint:",
          reserva.id
        );

        motivoPush =
          "La reserva no tiene push_endpoint";
      } else {
        // =================================================
        // BUSCAR LA SUSCRIPCIÓN DEL CLIENTE
        // =================================================

        const {
          data: suscripcion,
          error: suscripcionError,
        } = await supabaseAdmin
          .from("push_subscriptions")
          .select(
            "id, endpoint, subscription"
          )
          .eq(
            "endpoint",
            reserva.push_endpoint
          )
          .maybeSingle();

        if (suscripcionError) {
          console.error(
            "❌ ERROR BUSCANDO SUSCRIPCIÓN:",
            suscripcionError
          );

          motivoPush =
            suscripcionError.message ||
            "Error buscando la suscripción";
        } else if (!suscripcion) {
          console.warn(
            "⚠️ NO SE ENCONTRÓ SUSCRIPCIÓN PARA:",
            reserva.push_endpoint
          );

          motivoPush =
            "No se encontró la suscripción Push";
        } else {
          console.log(
            "PUSH: suscripción encontrada:",
            suscripcion.id
          );

          const titulo =
            tipo === "confirmar"
              ? "✅ Reserva confirmada"
              : "❌ Reserva cancelada";

          const mensaje =
            tipo === "confirmar"
              ? `Tu reserva para ${reserva.fecha} a las ${reserva.hora} fue confirmada.`
              : `Tu reserva para ${reserva.fecha} a las ${reserva.hora} fue cancelada.`;

          try {
            await webpush.sendNotification(
              suscripcion.subscription,
              JSON.stringify({
                title: titulo,
                body: mensaje,
                icon:
                  "/logo-foodshortai.png",
                data: {
                  reservaId:
                    reserva.id,
                  estado:
                    reserva.estado,
                },
              })
            );

            pushEnviado = true;

            console.log(
              "================================="
            );

            console.log(
              "✅ PUSH ENVIADO AL CLIENTE"
            );

            console.log(
              "SUSCRIPCIÓN:",
              suscripcion.id
            );

            console.log(
              "RESERVA:",
              reserva.id
            );

            console.log(
              "================================="
            );
          } catch (pushError: any) {
            console.error(
              "❌ ERROR ENVIANDO PUSH:",
              pushError
            );

            motivoPush =
              pushError?.message ||
              "No se pudo enviar Push";

            // =============================================
            // SUSCRIPCIÓN VENCIDA
            // =============================================

            if (
              pushError?.statusCode === 404 ||
              pushError?.statusCode === 410
            ) {
              const {
                error: deleteError,
              } = await supabaseAdmin
                .from(
                  "push_subscriptions"
                )
                .delete()
                .eq(
                  "id",
                  suscripcion.id
                );

              if (deleteError) {
                console.error(
                  "❌ ERROR ELIMINANDO SUSCRIPCIÓN VENCIDA:",
                  deleteError
                );
              } else {
                console.log(
                  "🗑️ SUSCRIPCIÓN ELIMINADA:",
                  suscripcion.id
                );
              }
            }
          }
        }
      }

      // ===================================================
      // EMAIL AL CLIENTE
      // ===================================================

      if (!reserva.email?.trim()) {
        console.warn(
          "⚠️ ESTA RESERVA NO TIENE EMAIL:",
          reserva.id
        );

        motivoEmail =
          "La reserva no tiene email del cliente";
      } else if (!RESEND_API_KEY) {
        console.error(
          "❌ FALTA RESEND_API_KEY"
        );

        motivoEmail =
          "Falta RESEND_API_KEY";
      } else {
        const clienteNombre =
          reserva.cliente_nombre?.trim() ||
          "Cliente";

        const asunto =
          tipo === "confirmar"
            ? "✅ Your reservation is confirmed"
            : "❌ Your reservation has been cancelled";

        const tituloEmail =
          tipo === "confirmar"
            ? "Reservation Confirmed"
            : "Reservation Cancelled";

        const textoPrincipal =
          tipo === "confirmar"
            ? `Your reservation for ${reserva.fecha || "the requested date"} at ${reserva.hora || "the requested time"} has been confirmed.`
            : `Your reservation for ${reserva.fecha || "the requested date"} at ${reserva.hora || "the requested time"} has been cancelled.`;

        const colorEstado =
          tipo === "confirmar"
            ? "#16a34a"
            : "#dc2626";

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no" />
  <title>${asunto}</title>

  <style>
    body {
      margin:0 !important;
      padding:0 !important;
      width:100% !important;
      background:#f3f4f6;
    }

    table {
      border-collapse:collapse;
      border-spacing:0;
    }

    img {
      border:0;
      outline:none;
      text-decoration:none;
      display:block;
    }

    @media only screen and (max-width:620px) {
      .outer {
        padding:16px 10px !important;
      }

      .card {
        border-radius:18px !important;
      }

      .card-pad {
        padding:26px 20px !important;
      }

      .title {
        font-size:22px !important;
        line-height:28px !important;
        letter-spacing:-.2px !important;
        word-break:keep-all !important;
        overflow-wrap:normal !important;
        white-space:normal !important;
      }

      .intro {
        font-size:16px !important;
        line-height:25px !important;
      }

      .detail-pad {
        padding:18px !important;
      }

      .detail-value {
        font-size:16px !important;
        line-height:22px !important;
      }
    }
  </style>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="width:100%;background:#f3f4f6;"
  >
    <tr>
      <td
        class="outer"
        align="center"
        style="padding:30px 16px;"
      >

        <table
          role="presentation"
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="width:100%;max-width:600px;"
        >

          <tr>
            <td
              align="center"
              style="padding:0 0 16px;"
            >
              <div
                style="font-size:15px;line-height:20px;font-weight:800;letter-spacing:2.5px;color:#111827;"
              >
                SHORTBIZAI
              </div>
            </td>
          </tr>

          <tr>
            <td
              class="card card-pad"
              style="background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;padding:34px 32px;box-shadow:0 4px 18px rgba(17,24,39,.06);"
            >

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >

                <tr>
                  <td
                    align="center"
                    style="padding:0 0 24px;border-bottom:1px solid #eef0f2;"
                  >

                    <div
                      style="display:inline-block;padding:7px 12px;border-radius:999px;background:${tipo === "confirmar" ? "#ecfdf3" : "#fef2f2"};color:${colorEstado};font-size:11px;line-height:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase;"
                    >
                      ${tipo === "confirmar" ? "Confirmed" : "Cancelled"}
                    </div>

                    <h1
                      class="title"
                      style="margin:13px 0 0;color:${colorEstado};font-size:30px;line-height:36px;font-weight:800;letter-spacing:-.4px;"
                    >
                      ${tituloEmail}
                    </h1>

                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 0 0;">

                    <p
                      class="intro"
                      style="margin:0 0 12px;font-size:16px;line-height:25px;color:#111827;"
                    >
                      Hello ${clienteNombre},
                    </p>

                    <p
                      class="intro"
                      style="margin:0 0 24px;font-size:16px;line-height:25px;color:#4b5563;"
                    >
                      ${textoPrincipal}
                    </p>

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="width:100%;background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;"
                    >

                      <tr>
                        <td
                          class="detail-pad"
                          style="padding:20px;"
                        >

                          <div
                            style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;"
                          >
                            Date
                          </div>

                          <div
                            class="detail-value"
                            style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding:5px 0 17px;"
                          >
                            ${reserva.fecha || "—"}
                          </div>

                          <div
                            style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;"
                          >
                            Time
                          </div>

                          <div
                            class="detail-value"
                            style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding:5px 0 17px;"
                          >
                            ${reserva.hora || "—"}
                          </div>

                          <div
                            style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;"
                          >
                            Guests
                          </div>

                          <div
                            class="detail-value"
                            style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding-top:5px;"
                          >
                            ${reserva.personas || "—"}
                          </div>

                        </td>
                      </tr>

                    </table>

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin-top:22px;"
                    >

                      <tr>
                        <td
                          align="center"
                          style="padding:0;"
                        >

                          <div
                            style="font-size:11px;line-height:16px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:700;"
                          >
                            Reservation ID
                          </div>

                          <div
                            style="font-size:14px;line-height:20px;color:#374151;font-weight:700;padding-top:3px;"
                          >
                            #${reserva.id}
                          </div>

                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:16px 12px 0;"
            >

              <p
                style="margin:0;font-size:11px;line-height:17px;color:#9ca3af;"
              >
                This is an automated reservation notification from ShortBizAI.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

        try {
          const respuestaEmail =
            await fetch(
              "https://api.resend.com/emails",
              {
                method: "POST",

                headers: {
                  Authorization:
                    `Bearer ${RESEND_API_KEY}`,

                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  from:
                    RESERVA_FROM_EMAIL,

                  to: [
                    reserva.email.trim(),
                  ],

                  subject: asunto,

                  html,
                }),
              }
            );

          const resultadoEmail =
            await respuestaEmail.json();

          console.log(
            "RESEND HTTP STATUS:",
            respuestaEmail.status
          );

          console.log(
            "RESEND RESPONSE:",
            resultadoEmail
          );

          if (
            !respuestaEmail.ok ||
            !resultadoEmail?.id
          ) {
            motivoEmail =
              resultadoEmail?.message ||
              resultadoEmail?.error ||
              "Resend rechazó el email";

            console.error(
              "❌ EMAIL NO ENVIADO:",
              motivoEmail
            );
          } else {
            emailEnviado = true;

            console.log(
              "================================="
            );

            console.log(
              "✅ EMAIL ENVIADO AL CLIENTE"
            );

            console.log(
              "EMAIL:",
              reserva.email.trim()
            );

            console.log(
              "RESEND ID:",
              resultadoEmail.id
            );

            console.log(
              "================================="
            );
          }
        } catch (emailError: any) {
          motivoEmail =
            emailError?.message ||
            "Error enviando email";

          console.error(
            "❌ ERROR ENVIANDO EMAIL:",
            emailError
          );
        }
      }

      // ===================================================
      // WHATSAPP AL CLIENTE
      //
      // IMPORTANTE:
      // Se ejecuta DESPUÉS de actualizar la reserva.
      //
      // Si WhatsApp falla:
      // - la reserva sigue confirmada/cancelada
      // - Telegram ya respondió
      // - Push sigue funcionando
      // - Email sigue funcionando
      // ===================================================

      try {
        const resultadoWhatsApp =
          await enviarWhatsApp(
            reserva.telefono,
            reserva.cliente_nombre,
            reserva.fecha,
            reserva.hora,
            reserva.personas,
            reserva.id,
            tipo === "confirmar"
          );

        whatsappEnviado =
          resultadoWhatsApp.enviado;

        if (
          !resultadoWhatsApp.enviado
        ) {
          motivoWhatsApp =
            resultadoWhatsApp.motivo ||
            "WhatsApp no pudo enviar el mensaje";
        }

      } catch (whatsappError: any) {
        motivoWhatsApp =
          whatsappError?.message ||
          "Error enviando WhatsApp";

        console.error(
          "❌ ERROR GENERAL WHATSAPP:",
          whatsappError
        );
      }

      // ===================================================
      // RESULTADO FINAL
      // ===================================================

      console.log(
        "================================="
      );

      console.log(
        "📊 RESULTADO NOTIFICACIONES"
      );

      console.log(
        "RESERVA:",
        reserva.id
      );

      console.log(
        "ESTADO:",
        reserva.estado
      );

      console.log(
        "PUSH:",
        pushEnviado
      );

      console.log(
        "EMAIL:",
        emailEnviado
      );

      console.log(
        "WHATSAPP:",
        whatsappEnviado
      );

      if (motivoPush) {
        console.log(
          "MOTIVO PUSH:",
          motivoPush
        );
      }

      if (motivoEmail) {
        console.log(
          "MOTIVO EMAIL:",
          motivoEmail
        );
      }

      if (motivoWhatsApp) {
        console.log(
          "MOTIVO WHATSAPP:",
          motivoWhatsApp
        );
      }

      console.log(
        "================================="
      );

      return NextResponse.json({
        ok: true,

        reservaActualizada:
          true,

        reservaId:
          reserva.id,

        estado:
          reserva.estado,

        pushEnviado,

        emailEnviado,

        whatsappEnviado,

        motivoPush:
          motivoPush || undefined,

        motivoEmail:
          motivoEmail || undefined,

        motivoWhatsApp:
          motivoWhatsApp || undefined,
      });
    }

    // =====================================================
    // MENSAJES NORMALES DE TELEGRAM
    // =====================================================

    if (body.message) {
      console.log(
        "MENSAJE TELEGRAM:",
        body.message.text
      );
    }

    return NextResponse.json({
      ok: true,
    });

  } catch (error: any) {
    console.error(
      "================================="
    );

    console.error(
      "❌ ERROR WEBHOOK TELEGRAM:"
    );

    console.error(
      error
    );

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "Error interno del webhook",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// GET - CONFIGURAR WEBHOOK TELEGRAM
// =====================================================

export async function GET() {
  try {
    const webhookUrl =
      "https://www.shortbizai.com/api/telegram/webhook";

    const respuesta =
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

    const resultado =
      await respuesta.json();

    console.log(
      "TELEGRAM SET WEBHOOK:",
      JSON.stringify(
        resultado,
        null,
        2
      )
    );

    return NextResponse.json({
      ok: resultado.ok,

      webhookUrl,

      telegram:
        resultado,
    });

  } catch (error: any) {
    console.error(
      "ERROR CONFIGURANDO WEBHOOK:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "Error configurando webhook",
      },
      { status: 500 }
    );
  }
}