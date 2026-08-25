import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:tu-correo@ejemplo.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    const { subscription, title, message } = await request.json();

    if (!subscription) {
      return Response.json(
        { error: "No se recibió la suscripción" },
        { status: 400 }
      );
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: title || "ShortBizAI",
        body: message || "Tienes una nueva notificación.",
        icon: "/logo-foodshortai.png",
      })
    );

    return Response.json({
      success: true,
      message: "Notificación enviada",
    });
  } catch (error) {
    console.error("ERROR PUSH:", error);

    return Response.json(
      {
        success: false,
        error: "No se pudo enviar la notificación",
      },
      { status: 500 }
    );
  }
}npm 