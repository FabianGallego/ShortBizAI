import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TOKEN = "TU_TOKEN";

export async function POST(req: Request) {
  const body = await req.json();

  console.log(JSON.stringify(body, null, 2));

  if (body.callback_query) {
    const accion = body.callback_query.data;

    console.log("Acción:", accion);

    const [tipo, id] = accion.split("_");

    if (tipo === "confirmar") {
      await supabase
        .from("reservas")
        .update({ estado: "confirmada" })
        .eq("id", Number(id));

      console.log("Reserva confirmada:", id);
    }

    if (tipo === "cancelar") {
      await supabase
        .from("reservas")
        .update({ estado: "cancelada" })
        .eq("id", Number(id));

      console.log("Reserva cancelada:", id);
    }

    return NextResponse.json({ ok: true });
  }

  const chatId = body.message.chat.id;
  const texto = body.message.text;

  console.log("Mensaje:", texto);

  if (texto === "hola") {
    await fetch(`https://api.telegram.org/bot8848673785:AAEPLTJ5B-CF_lFPFuA4156JvE2Rgf15MNc/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "¡Hola! Soy el asistente de ShortBizAI 🚀",
      }),
    });
  }

  return NextResponse.json({ ok: true });
}