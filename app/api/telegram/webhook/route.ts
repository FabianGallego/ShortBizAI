import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESERVA_FROM_EMAIL =
  process.env.RESERVA_FROM_EMAIL || "reserva@shortbizai.com";

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
          error: "Falta TELEGRAM_BOT_TOKEN",
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
      //
      // Primero la buscamos para tener:
      // - cliente
      // - fecha
      // - hora
      // - push_endpoint
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

        // Avisar a Telegram aunque la reserva
        // no exista.
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
      // NOTIFICACIÓN AL CLIENTE
      //
      // Intentamos PUSH y EMAIL de forma independiente.
      // Un fallo de Push no debe impedir el email.
      // ===================================================

      let pushEnviado = false;
      let emailEnviado = false;
      let motivoPush = "";
      let motivoEmail = "";

      // ===================================================
      // PUSH AL CLIENTE
      // ===================================================

      if (!reserva.push_endpoint) {
        console.warn(
          "⚠️ ESTA RESERVA NO TIENE push_endpoint:",
          reserva.id
        );

        motivoPush = "La reserva no tiene push_endpoint";
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
                icon: "/logo-foodshortai.png",
                data: {
                  reservaId: reserva.id,
                  estado: reserva.estado,
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
              const { error: deleteError } =
                await supabaseAdmin
                  .from("push_subscriptions")
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
      //
      // Usa:
      //   RESEND_API_KEY
      //   RESERVA_FROM_EMAIL
      //
      // NO utiliza loyalty@shortbizai.com.
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

        const empresaTexto =
          "ShortBizAI";

        const esConfirmacion =
          tipo === "confirmar";

        const asunto =
          esConfirmacion
            ? "✅ Your reservation is confirmed"
            : "❌ Your reservation has been cancelled";

        const tituloEmail =
          esConfirmacion
            ? "Reservation Confirmed"
            : "Reservation Cancelled";

        const textoPrincipal =
          esConfirmacion
            ? `Your reservation for ${reserva.fecha || "the requested date"} at ${reserva.hora || "the requested time"} has been confirmed.`
            : `Your reservation for ${reserva.fecha || "the requested date"} at ${reserva.hora || "the requested time"} has been cancelled.`;

        const colorEstado =
          esConfirmacion
            ? "#16a34a"
            : "#dc2626";

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${asunto}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      <div style="font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:24px;">
        ShortBizAI
      </div>

      <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:${colorEstado};">
        ${tituloEmail}
      </h1>

      <p style="font-size:16px;line-height:1.6;margin:0 0 20px;">
        Hello ${clienteNombre},
      </p>

      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
        ${textoPrincipal}
      </p>

      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Date</p>
        <p style="margin:0 0 16px;font-size:17px;font-weight:700;">${reserva.fecha || "—"}</p>

        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Time</p>
        <p style="margin:0 0 16px;font-size:17px;font-weight:700;">${reserva.hora || "—"}</p>

        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Guests</p>
        <p style="margin:0;font-size:17px;font-weight:700;">${reserva.personas || "—"}</p>
      </div>

      <p style="font-size:13px;line-height:1.5;color:#9ca3af;margin:0;">
        Reservation ID: ${reserva.id}
      </p>
    </div>
  </div>
</body>
</html>`;

        try {
          const respuestaEmail = await fetch(
            "https://api.resend.com/emails",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                from: RESERVA_FROM_EMAIL,
                to: [reserva.email.trim()],
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
      // RESULTADO FINAL
      // ===================================================

      return NextResponse.json({
        ok: true,
        reservaActualizada: true,
        reservaId: reserva.id,
        estado: reserva.estado,
        pushEnviado,
        emailEnviado,
        motivoPush: motivoPush || undefined,
        motivoEmail: motivoEmail || undefined,
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


export async function GET() {
  try {
    const webhookUrl =
      "https://www.shortbizai.com/api/telegram/webhook";

    const respuesta = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const resultado = await respuesta.json();

    console.log(
      "TELEGRAM SET WEBHOOK:",
      JSON.stringify(resultado, null, 2)
    );

    return NextResponse.json({
      ok: resultado.ok,
      webhookUrl,
      telegram: resultado,
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