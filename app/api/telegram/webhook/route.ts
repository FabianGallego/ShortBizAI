import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "TELEGRAM WEBHOOK:",
      JSON.stringify(body, null, 2)
    );

    // =====================================================
    // BOTONES: CONFIRMAR / CANCELAR
    // =====================================================

    if (body.callback_query) {
      const callbackQuery = body.callback_query;

      const accion = callbackQuery.data;

      console.log("ACCIÓN TELEGRAM:", accion);

      // -----------------------------------------------------
      // SEPARAR ACCIÓN E ID
      // -----------------------------------------------------

      const [tipo, idTexto] = accion.split("_");

      // IMPORTANTE:
      // El ID se mantiene como texto.
      // No lo convertimos a Number porque puede ser UUID.
      const id = idTexto;

      console.log("TIPO:", tipo);
      console.log("ID RESERVA:", id);

      if (
        !id ||
        !["confirmar", "cancelar"].includes(tipo)
      ) {
        console.error(
          "❌ ACCIÓN INVÁLIDA:",
          accion
        );

        return NextResponse.json({
          ok: true,
        });
      }

      // =====================================================
      // DETERMINAR NUEVO ESTADO
      // =====================================================

      const estado =
        tipo === "confirmar"
          ? "confirmada"
          : "cancelada";

      console.log(
        "NUEVO ESTADO:",
        estado
      );

      // =====================================================
      // ACTUALIZAR RESERVA EN SUPABASE
      // =====================================================

      const {
        data: reserva,
        error: reservaError,
      } = await supabaseAdmin
        .from("reservas")
        .update({
          estado,
        })
        .eq("id", id)
        .select()
        .single();

      // =====================================================
      // ERROR ACTUALIZANDO RESERVA
      // =====================================================

      if (reservaError) {
        console.error(
          "❌ ERROR ACTUALIZANDO RESERVA:",
          reservaError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "No se pudo actualizar la reserva",
            detalle: reservaError.message,
          },
          { status: 500 }
        );
      }

      if (!reserva) {
        console.error(
          "❌ NO SE ENCONTRÓ LA RESERVA:",
          id
        );

        return NextResponse.json(
          {
            ok: false,
            error: "Reserva no encontrada",
          },
          { status: 404 }
        );
      }

      console.log(
        `✅ RESERVA ${id} ACTUALIZADA:`,
        estado
      );

      // =====================================================
      // RESPONDER AL CLICK DE TELEGRAM
      // =====================================================

      const respuestaCallback =
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              callback_query_id:
                callbackQuery.id,

              text:
                tipo === "confirmar"
                  ? "✅ Reserva confirmada"
                  : "❌ Reserva cancelada",
            }),
          }
        );

      const resultadoCallback =
        await respuestaCallback.json();

      console.log(
        "TELEGRAM CALLBACK RESPONSE:",
        resultadoCallback
      );

      // =====================================================
      // BUSCAR SUSCRIPCIONES PUSH
      // =====================================================

      const {
        data: suscripciones,
        error: suscripcionesError,
      } = await supabaseAdmin
        .from("push_subscriptions")
        .select("id, subscription");

      if (suscripcionesError) {
        console.error(
          "❌ ERROR BUSCANDO SUSCRIPCIONES:",
          suscripcionesError
        );

        return NextResponse.json({
          ok: true,
          reservaActualizada: true,
          estado,
          pushEnviado: false,
        });
      }

      console.log(
        "SUSCRIPCIONES ENCONTRADAS:",
        suscripciones?.length || 0
      );

      // =====================================================
      // MENSAJE DE NOTIFICACIÓN
      // =====================================================

      const titulo =
        tipo === "confirmar"
          ? "✅ Reserva confirmada"
          : "❌ Reserva cancelada";

      const mensaje =
        tipo === "confirmar"
          ? `La reserva de ${
              reserva.cliente_nombre
            } para ${
              reserva.fecha
            } a las ${
              reserva.hora
            } fue confirmada.`
          : `La reserva de ${
              reserva.cliente_nombre
            } para ${
              reserva.fecha
            } a las ${
              reserva.hora
            } fue cancelada.`;

      // =====================================================
      // ENVIAR PUSH A LOS NAVEGADORES
      // =====================================================

      for (const item of suscripciones || []) {
        try {
          await webpush.sendNotification(
            item.subscription,
            JSON.stringify({
              title: titulo,
              body: mensaje,
              icon: "/logo-foodshortai.png",
            })
          );

          console.log(
            "✅ PUSH ENVIADO CORRECTAMENTE:",
            item.id
          );
        } catch (pushError: any) {
          console.error(
            "❌ ERROR ENVIANDO PUSH:",
            pushError
          );

          // -------------------------------------------------
          // SUSCRIPCIÓN VENCIDA O INVÁLIDA
          // -------------------------------------------------

          if (
            pushError?.statusCode === 404 ||
            pushError?.statusCode === 410
          ) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("id", item.id);

            console.log(
              "🗑️ SUSCRIPCIÓN ELIMINADA:",
              item.id
            );
          }
        }
      }

      // =====================================================
      // RESPUESTA FINAL
      // =====================================================

      console.log(
        "================================="
      );

      console.log(
        "✅ PROCESO COMPLETADO"
      );

      console.log(
        "RESERVA:",
        id
      );

      console.log(
        "ESTADO:",
        estado
      );

      console.log(
        "================================="
      );

      return NextResponse.json({
        ok: true,
        reservaActualizada: true,
        reservaId: id,
        estado,
        pushEnviado: true,
      });
    }

    // =====================================================
    // OTROS MENSAJES DE TELEGRAM
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
      "❌ ERROR WEBHOOK TELEGRAM:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Error interno",
      },
      { status: 500 }
    );
  }
}