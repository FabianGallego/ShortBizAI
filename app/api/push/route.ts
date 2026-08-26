import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  webpush.setVapidDetails(
    "mailto:fabianallego123@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  try {
    const body = await request.json();

    const { subscription, title, message } = body;

    if (!subscription) {
      return Response.json(
        { error: "No se recibió la suscripción" },
        { status: 400 }
      );
    }

    // ==========================================
    // GUARDAR SUSCRIPCIÓN DEL NAVEGADOR
    // ==========================================

    const { error: saveError } = await supabaseAdmin
      .from("push_subscriptions")
      .insert([
        {
          subscription,
        },
      ]);

    if (saveError) {
      console.error("ERROR GUARDANDO PUSH:", saveError);
      console.error(
        "ERROR PUSH JSON:",
        JSON.stringify(saveError, null, 2)
      );

      return Response.json(
        {
          success: false,
          error: saveError.message,
        },
        { status: 500 }
      );
    }

    console.log("PUSH: suscripción guardada correctamente");

    // ==========================================
    // ENVIAR NOTIFICACIÓN SI VIENE MENSAJE
    // ==========================================

    if (title || message) {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: title || "ShortBizAI",
          body: message || "Tienes una nueva notificación.",
          icon: "/logo-foodshortai.png",
        })
      );

      console.log("PUSH: notificación enviada");
    }

    return Response.json({
      success: true,
      message: "Suscripción registrada correctamente",
    });
  } catch (error) {
    console.error("ERROR PUSH:", error);
    console.error(
      "ERROR PUSH JSON:",
      JSON.stringify(error, null, 2)
    );

    return Response.json(
      {
        success: false,
        error: "No se pudo procesar la notificación",
      },
      { status: 500 }
    );
  }
}