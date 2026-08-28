import { NextResponse } from "next/server";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function GET() {
  try {
    console.log("========== PRUEBA TELEGRAM ==========");

    if (!TELEGRAM_TOKEN) {
      return NextResponse.json(
        {
          ok: false,
          paso: "configuracion",
          error: "Falta TELEGRAM_BOT_TOKEN",
        },
        { status: 500 }
      );
    }

    if (!TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        {
          ok: false,
          paso: "configuracion",
          error: "Falta TELEGRAM_CHAT_ID",
        },
        { status: 500 }
      );
    }

    console.log("TELEGRAM_CHAT_ID:", TELEGRAM_CHAT_ID);
    console.log("Probando conexión con Telegram...");

    // 1. PROBAR EL TOKEN
    const meResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`
    );

    const meResult = await meResponse.json();

    console.log("GETME STATUS:", meResponse.status);
    console.log("GETME RESPONSE:", meResult);

    if (!meResponse.ok || !meResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          paso: "TOKEN",
          telegram: meResult,
        },
        { status: 500 }
      );
    }

    // 2. PROBAR ENVÍO AL CHAT
    const messageResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: "🧪 PRUEBA SHORTBIZAI\n\n✅ Telegram está conectado correctamente.",
        }),
      }
    );

    const messageResult = await messageResponse.json();

    console.log("SEND MESSAGE STATUS:", messageResponse.status);
    console.log("SEND MESSAGE RESPONSE:", messageResult);

    if (!messageResponse.ok || !messageResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          paso: "CHAT_ID_O_PERMISOS",
          telegram: messageResult,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Telegram funciona correctamente",
      bot: meResult.result?.username,
      chatId: TELEGRAM_CHAT_ID,
      messageId: messageResult.result?.message_id,
    });
  } catch (error) {
    console.error("ERROR PRUEBA TELEGRAM:", error);

    return NextResponse.json(
      {
        ok: false,
        paso: "ERROR_INTERNO",
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
      },
      { status: 500 }
    );
  }
}