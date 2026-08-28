import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    // ==========================================
    // COMPROBAR CONFIGURACIÓN VAPID
    // ==========================================

    const publicKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const privateKey =
      process.env.VAPID_PRIVATE_KEY;

    if (!publicKey) {
      console.error(
        "ERROR PUSH: falta NEXT_PUBLIC_VAPID_PUBLIC_KEY"
      );

      return Response.json(
        {
          success: false,
          error:
            "Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY en las variables de entorno.",
        },
        { status: 500 }
      );
    }

    if (!privateKey) {
      console.error(
        "ERROR PUSH: falta VAPID_PRIVATE_KEY"
      );

      return Response.json(
        {
          success: false,
          error:
            "Falta VAPID_PRIVATE_KEY en las variables de entorno.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // CONFIGURAR WEB PUSH
    // ==========================================

    webpush.setVapidDetails(
      "mailto:fabianallego123@gmail.com",
      publicKey,
      privateKey
    );

    // ==========================================
    // LEER REQUEST
    // ==========================================

    const body = await request.json();

    const {
      subscription,
      title,
      message,
    } = body;

    if (!subscription) {
      return Response.json(
        {
          success: false,
          error:
            "No se recibió la suscripción",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // OBTENER ENDPOINT DEL DISPOSITIVO
    // ==========================================

    const endpoint =
      subscription.endpoint;

    if (!endpoint) {
      return Response.json(
        {
          success: false,
          error:
            "La suscripción no tiene endpoint",
        },
        { status: 400 }
      );
    }

    console.log(
      "PUSH ENDPOINT:",
      endpoint
    );

    // ==========================================
    // GUARDAR / ACTUALIZAR SUSCRIPCIÓN
    // ==========================================

    const {
      error: saveError,
    } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        {
          endpoint,
          subscription,
        },
        {
          onConflict: "endpoint",
        }
      );

    if (saveError) {
      console.error(
        "ERROR GUARDANDO PUSH:",
        saveError
      );

      return Response.json(
        {
          success: false,
          error:
            saveError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "PUSH: suscripción guardada/actualizada correctamente"
    );

    // ==========================================
    // ENVIAR NOTIFICACIÓN DE PRUEBA
    // ==========================================

    if (title || message) {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title:
            title || "ShortBizAI",
          body:
            message ||
            "Tienes una nueva notificación.",
          icon:
            "/logo-foodshortai.png",
        })
      );

      console.log(
        "PUSH: notificación enviada"
      );
    }

    // ==========================================
    // RESPUESTA EXITOSA
    // ==========================================

    return Response.json({
      success: true,
      message:
        "Suscripción registrada correctamente",
    });
  } catch (error: any) {
    console.error(
      "ERROR PUSH:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "No se pudo procesar la notificación",
      },
      { status: 500 }
    );
  }
}