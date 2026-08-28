import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: Request) {
  try {
    // ==========================================
    // RECIBIR DATOS
    // ==========================================

    const body = await req.json();

    const {
      reservaId,
      cliente_nombre,
      telefono,
      fecha,
      hora,
      personas,
    } = body;

    console.log("=================================");
    console.log("TELEGRAM: solicitud recibida");
    console.log("RESERVA ID:", reservaId);
    console.log("CLIENTE:", cliente_nombre);
    console.log("=================================");

    // ==========================================
    // VALIDAR RESERVA
    // ==========================================

    if (!reservaId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Falta reservaId",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // VALIDAR TELEGRAM
    // ==========================================

    if (!TELEGRAM_TOKEN) {
      console.error(
        "❌ TELEGRAM: falta TELEGRAM_BOT_TOKEN"
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Falta TELEGRAM_BOT_TOKEN",
        },
        { status: 500 }
      );
    }

    if (!TELEGRAM_CHAT_ID) {
      console.error(
        "❌ TELEGRAM: falta TELEGRAM_CHAT_ID"
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Falta TELEGRAM_CHAT_ID",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // RECLAMAR RESERVA
    //
    // Solo continúa si NO está marcada
    // como telegram_notificado = true.
    //
    // Esto permite false o null.
    // ==========================================

    const {
      data: reserva,
      error: reservaError,
    } = await supabaseAdmin
      .from("reservas")
      .update({
        telegram_notificado: true,
      })
      .eq("id", reservaId)
      .neq("telegram_notificado", true)
      .select("id")
      .maybeSingle();

    // ==========================================
    // NO SE PUDO RECLAMAR
    // ==========================================

    if (reservaError) {
      console.error(
        "❌ ERROR ACTUALIZANDO RESERVA:",
        reservaError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "No se pudo actualizar la reserva",
          detalle: reservaError.message,
        },
        { status: 500 }
      );
    }

    if (!reserva) {
      console.log(
        `ℹ️ TELEGRAM: reserva ${reservaId} ya fue procesada.`
      );

      return NextResponse.json({
        ok: true,
        reservaId,
        telegramEnviado: false,
        duplicado: true,
        mensaje: "La reserva ya fue notificada.",
      });
    }

    console.log(
      `🔒 TELEGRAM: reserva ${reservaId} bloqueada.`
    );

    // ==========================================
    // CREAR MENSAJE
    // ==========================================

    const texto = `🍽️ NUEVA RESERVA

👤 Cliente: ${cliente_nombre || "No indicado"}
📞 Teléfono: ${telefono || "No indicado"}
📅 Fecha: ${fecha || "No indicada"}
🕒 Hora: ${hora || "No indicada"}
👥 Personas: ${personas || "No indicado"}

🆔 Reserva: ${reservaId}`;

    console.log("📨 TELEGRAM: enviando mensaje...");

    // ==========================================
    // ENVIAR A TELEGRAM
    // ==========================================

    const respuestaTelegram = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: texto,

          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Confirmar",
                  callback_data: `confirmar_${reservaId}`,
                },
                {
                  text: "❌ Cancelar",
                  callback_data: `cancelar_${reservaId}`,
                },
              ],
            ],
          },
        }),
      }
    );

    // ==========================================
    // LEER RESPUESTA TELEGRAM
    // ==========================================

    const resultadoTelegram =
      await respuestaTelegram.json();

    console.log(
      "TELEGRAM HTTP STATUS:",
      respuestaTelegram.status
    );

    console.log(
      "TELEGRAM RESPONSE:",
      resultadoTelegram
    );

    // ==========================================
    // TELEGRAM FALLÓ
    // ==========================================

    if (
      !respuestaTelegram.ok ||
      !resultadoTelegram.ok
    ) {
      console.error(
        "❌ TELEGRAM RECHAZÓ LA RESERVA"
      );

      console.error(
        "DESCRIPCIÓN:",
        resultadoTelegram?.description
      );

      // Liberar reserva para permitir reintento
      const { error: liberarError } =
        await supabaseAdmin
          .from("reservas")
          .update({
            telegram_notificado: false,
          })
          .eq("id", reservaId);

      if (liberarError) {
        console.error(
          "❌ ERROR LIBERANDO RESERVA:",
          liberarError
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "Telegram rechazó el envío",
          detalle:
            resultadoTelegram?.description ||
            "Error desconocido de Telegram",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // TELEGRAM FUNCIONÓ
    // ==========================================

    const messageId =
      resultadoTelegram?.result?.message_id;

    const chatId =
      resultadoTelegram?.result?.chat?.id;

    console.log(
      "================================="
    );

    console.log(
      `✅ TELEGRAM: reserva ${reservaId} enviada correctamente`
    );

    console.log(
      "MESSAGE ID:",
      messageId
    );

    console.log(
      "CHAT ID:",
      chatId
    );

    console.log(
      "================================="
    );

    // ==========================================
    // RESPUESTA FINAL
    // ==========================================

    return NextResponse.json({
      ok: true,
      reservaId,
      telegramEnviado: true,
      telegramMessageId: messageId,
      telegramChatId: chatId,
    });

  } catch (error: any) {
    console.error(
      "❌ ERROR /api/reservas/notificar:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Error interno enviando la reserva",
      },
      { status: 500 }
    );
  }
}