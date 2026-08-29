import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

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
          "id, cliente_nombre, telefono, fecha, hora, personas, push_endpoint, estado"
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
          "id, cliente_nombre, telefono, fecha, hora, personas, push_endpoint, estado"
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
      // PUSH AL CLIENTE
      //
      // IMPORTANTE:
      // Usamos el push_endpoint de ESTA reserva.
      // No enviamos la notificación a todos.
      // ===================================================

      if (!reserva.push_endpoint) {
        console.warn(
          "⚠️ ESTA RESERVA NO TIENE push_endpoint:",
          reserva.id
        );

        return NextResponse.json({
          ok: true,
          reservaActualizada: true,
          reservaId: reserva.id,
          estado: reserva.estado,
          pushEnviado: false,
          motivo:
            "La reserva no tiene push_endpoint",
        });
      }

      // ===================================================
      // BUSCAR LA SUSCRIPCIÓN DEL CLIENTE
      // ===================================================

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

        return NextResponse.json({
          ok: true,
          reservaActualizada: true,
          reservaId: reserva.id,
          estado: reserva.estado,
          pushEnviado: false,
        });
      }

      if (!suscripcion) {
        console.warn(
          "⚠️ NO SE ENCONTRÓ SUSCRIPCIÓN PARA:",
          reserva.push_endpoint
        );

        return NextResponse.json({
          ok: true,
          reservaActualizada: true,
          reservaId: reserva.id,
          estado: reserva.estado,
          pushEnviado: false,
        });
      }

      console.log(
        "PUSH: suscripción encontrada:",
        suscripcion.id
      );

      // ===================================================
      // MENSAJE PARA EL CLIENTE
      // ===================================================

      const titulo =
        tipo === "confirmar"
          ? "✅ Reserva confirmada"
          : "❌ Reserva cancelada";

      const mensaje =
        tipo === "confirmar"
          ? `Tu reserva para ${reserva.fecha} a las ${reserva.hora} fue confirmada.`
          : `Tu reserva para ${reserva.fecha} a las ${reserva.hora} fue cancelada.`;

      // ===================================================
      // ENVIAR PUSH
      // ===================================================

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

        return NextResponse.json({
          ok: true,
          reservaActualizada: true,
          reservaId: reserva.id,
          estado: reserva.estado,
          pushEnviado: true,
        });

      } catch (pushError: any) {
        console.error(
          "❌ ERROR ENVIANDO PUSH:",
          pushError
        );

        // =================================================
        // SUSCRIPCIÓN VENCIDA
        // =================================================

        if (
          pushError?.statusCode === 404 ||
          pushError?.statusCode === 410
        ) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq(
              "id",
              suscripcion.id
            );

          console.log(
            "🗑️ SUSCRIPCIÓN ELIMINADA:",
            suscripcion.id
          );
        }

        return NextResponse.json({
          ok: true,
          reservaActualizada: true,
          reservaId: reserva.id,
          estado: reserva.estado,
          pushEnviado: false,
          errorPush:
            pushError?.message ||
            "No se pudo enviar Push",
        });
      }
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
    const respuesta = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getWebhookInfo`,
      {
        cache: "no-store",
      }
    );

    const resultado = await respuesta.json();

    console.log(
      "TELEGRAM WEBHOOK INFO:",
      JSON.stringify(resultado, null, 2)
    );

    return NextResponse.json(resultado);

  } catch (error: any) {
    console.error(
      "ERROR WEBHOOK INFO:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Error",
      },
      { status: 500 }
    );
  }
}
