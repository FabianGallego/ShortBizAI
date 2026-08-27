import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      reservaId,
      cliente_nombre,
      telefono,
      fecha,
      hora,
      personas,
    } = body;

    // ==========================================
    // VALIDAR DATOS
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

    if (!TELEGRAM_TOKEN) {
      console.error(
        "Falta TELEGRAM_BOT_TOKEN en las variables de entorno"
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Falta configuración de Telegram",
        },
        { status: 500 }
      );
    }

    if (!TELEGRAM_CHAT_ID) {
      console.error(
        "Falta TELEGRAM_CHAT_ID en las variables de entorno"
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
    // VERIFICAR QUE LA RESERVA EXISTE
    // ==========================================

    const { data: reserva, error: reservaError } =
      await supabaseAdmin
        .from("reservas")
        .select("id, push_endpoint")
        .eq("id", reservaId)
        .single();

    if (reservaError || !reserva) {
      console.error(
        "ERROR BUSCANDO RESERVA:",
        reservaError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "No se encontró la reserva",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // MENSAJE PARA EL RESTAURANTE
    // ==========================================

    const texto = `🍽️ Nueva reserva

👤 Cliente: ${cliente_nombre}
📞 Teléfono: ${telefono}
📅 Fecha: ${fecha}
🕒 Hora: ${hora}
👥 Personas: ${personas}`;

    // ==========================================
    // ENVIAR A TELEGRAM
    // ==========================================

    const respuesta = await fetch(
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

    const resultado = await respuesta.json();

    if (!respuesta.ok || !resultado.ok) {
      console.error(
        "ERROR TELEGRAM:",
        resultado
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Telegram no pudo recibir la reserva",
          detalle: resultado,
        },
        { status: 500 }
      );
    }

    console.log(
      `TELEGRAM: reserva ${reservaId} enviada correctamente`
    );

    // ==========================================
    // RESPUESTA
    // ==========================================

    return NextResponse.json({
      ok: true,
      reservaId,
      telegramEnviado: true,
    });
  } catch (error) {
    console.error(
      "ERROR /api/reservas/notificar:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno enviando la reserva",
      },
      { status: 500 }
    );
  }
}