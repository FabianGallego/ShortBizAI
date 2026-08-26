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

    console.log("TELEGRAM WEBHOOK:", JSON.stringify(body, null, 2));

    // =====================================================
    // BOTONES: CONFIRMAR / CANCELAR
    // =====================================================

    if (body.callback_query) {
      const callbackQuery = body.callback_query;

      const accion = callbackQuery.data;

      console.log("ACCIÓN TELEGRAM:", accion);

      const [tipo, idTexto] = accion.split("_");
      const id = Number(idTexto);

      if (!id || !["confirmar", "cancelar"].includes(tipo)) {
        console.error("Acción inválida:", accion);

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

      // =====================================================
      // ACTUALIZAR RESERVA
      // =====================================================

      const { data: reserva, error: reservaError } =
        await supabaseAdmin
          .from("reservas")
          .update({
            estado,
          })
          .eq("id", id)
          .select()
          .single();

      if (reservaError) {
        console.error(
          "ERROR ACTUALIZANDO RESERVA:",
          reservaError
        );

        return NextResponse.json(
          {
            ok: false,
            error: "No se pudo actualizar la reserva",
          },
          { status: 500 }
        );
      }

      console.log(
        `RESERVA ${id} ACTUALIZADA:`,
        estado
      );

      // =====================================================
      // RESPONDER AL CLICK DE TELEGRAM
      // =====================================================

      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text:
              tipo === "confirmar"
                ? "✅ Reserva confirmada"
                : "❌ Reserva cancelada",
          }),
        }
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
          "ERROR BUSCANDO SUSCRIPCIONES:",
          suscripcionesError
        );

        return NextResponse.json({
          ok: true,
          reservaActualizada: true,
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
          ? `La reserva de ${reserva.cliente_nombre} para ${reserva.fecha} a las ${reserva.hora} fue confirmada.`
          : `La reserva de ${reserva.cliente_nombre} para ${reserva.fecha} a las ${reserva.hora} fue cancelada.`;

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
            "PUSH ENVIADO CORRECTAMENTE:",
            item.id
          );
        } catch (pushError: any) {
          console.error(
            "ERROR ENVIANDO PUSH:",
            pushError
          );

          // Suscripción vencida o inválida
          if (
            pushError?.statusCode === 404 ||
            pushError?.statusCode === 410
          ) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("id", item.id);

            console.log(
              "SUSCRIPCIÓN ELIMINADA:",
              item.id
            );
          }
        }
      }

      return NextResponse.json({
        ok: true,
        reservaActualizada: true,
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
  } catch (error) {
    console.error(
      "ERROR WEBHOOK TELEGRAM:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno",
      },
      { status: 500 }
    );
  }
}