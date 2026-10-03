import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESERVA_FROM_EMAIL =
  process.env.RESERVA_FROM_EMAIL || "reserva@shortbizai.com";

// =====================================================
// WHATSAPP CLOUD API
// =====================================================

const WHATSAPP_ACCESS_TOKEN =
  process.env.WHATSAPP_ACCESS_TOKEN;

const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;

// =====================================================
// ENVIAR WHATSAPP AL CLIENTE
//
// Importante:
// - WhatsApp es independiente de Push y Email.
// - Si WhatsApp falla, NO se cancela la reserva.
// - El token nunca se imprime en los logs.
// =====================================================

async function enviarWhatsApp(
  telefono: string | null | undefined,
  clienteNombre: string | null | undefined,
  fecha: string | null | undefined,
  hora: string | null | undefined,
  personas: number | null | undefined,
  reservaId: number | string,
  confirmado: boolean
) {
  if (
    !WHATSAPP_ACCESS_TOKEN ||
    !WHATSAPP_PHONE_NUMBER_ID
  ) {
    console.warn(
      "⚠️ WHATSAPP NO CONFIGURADO: falta WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID"
    );

    return {
      enviado: false,
      motivo:
        "Falta configuración de WhatsApp",
    };
  }

  if (!telefono?.trim()) {
    console.warn(
      "⚠️ WHATSAPP: la reserva no tiene teléfono:",
      reservaId
    );

    return {
      enviado: false,
      motivo:
        "La reserva no tiene teléfono del cliente",
    };
  }

  // ===================================================
  // NORMALIZAR TELÉFONO
  //
  // Ejemplo:
  // (929) 301-1167
  // 929-301-1167
  // +1 929 301 1167
  //
  // Se convierte a:
  // 19293011167
  // ===================================================

  let telefonoWhatsApp =
    telefono.replace(/\D/g, "");

  // Si el teléfono viene con 10 dígitos,
  // asumimos Estados Unidos.

  if (
    telefonoWhatsApp.length === 10
  ) {
    telefonoWhatsApp =
      `1${telefonoWhatsApp}`;
  }

  if (
    telefonoWhatsApp.length < 10
  ) {
    console.warn(
      "⚠️ WHATSAPP: teléfono inválido:",
      telefono
    );

    return {
      enviado: false,
      motivo:
        "Número de teléfono inválido",
    };
  }

  const nombre =
    clienteNombre?.trim() ||
    "Cliente";

  const fechaTexto =
    fecha || "la fecha solicitada";

  const horaTexto =
    hora || "la hora solicitada";

  const personasTexto =
    personas
      ? String(personas)
      : "—";

  // ===================================================
  // MENSAJE
  // ===================================================

  const mensaje = confirmado
    ? `Hola ${nombre} 👋
Tu reserva ha sido confirmada. ✅
📅 Fecha: ${fechaTexto}
🕐 Hora: ${horaTexto}
👥 Personas: ${personasTexto}
Número de reserva: #${reservaId}
Gracias por reservar con nosotros.
— ShortBizAI`
    : `Hola ${nombre} 👋
Tu reserva ha sido cancelada. ❌
📅 Fecha: ${fechaTexto}
🕐 Hora: ${horaTexto}
👥 Personas: ${personasTexto}
Número de reserva: #${reservaId}
Si necesitas realizar una nueva reserva, puedes hacerlo nuevamente.
— ShortBizAI`;

  // ===================================================
  // ENDPOINT WHATSAPP CLOUD API
  // ===================================================

  const url =
    `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const respuesta =
      await fetch(url, {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${WHATSAPP_ACCESS_TOKEN}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          messaging_product:
            "whatsapp",

          recipient_type:
            "individual",

          to:
            telefonoWhatsApp,

          type:
            "text",

          text: {
            preview_url:
              false,

            body:
              mensaje,
          },
        }),
      });

    const resultado =
      await respuesta.json();

    console.log(
      "WHATSAPP HTTP STATUS:",
      respuesta.status
    );

    // IMPORTANTE:
    // Nunca imprimimos el token.

    console.log(
      "WHATSAPP RESPONSE:",
      resultado
    );

    if (!respuesta.ok) {
      const motivo =
        resultado?.error?.message ||
        resultado?.message ||
        "WhatsApp rechazó el mensaje";

      console.error(
        "❌ WHATSAPP NO ENVIADO:",
        motivo
      );

      return {
        enviado: false,
        motivo,
        respuesta:
          resultado,
      };
    }

    const messageId =
      resultado?.messages?.[0]?.id ||
      null;

    console.log(
      "================================="
    );

    console.log(
      "✅ WHATSAPP ENVIADO AL CLIENTE"
    );

    console.log(
      "RESERVA:",
      reservaId
    );

    console.log(
      "TELÉFONO:",
      telefonoWhatsApp
    );

    console.log(
      "MESSAGE ID:",
      messageId
    );

    console.log(
      "================================="
    );

    return {
      enviado: true,
      messageId,
      respuesta:
        resultado,
    };

  } catch (error: any) {
    const motivo =
      error?.message ||
      "Error enviando WhatsApp";

    console.error(
      "❌ ERROR ENVIANDO WHATSAPP:",
      motivo
    );

    return {
      enviado: false,
      motivo,
    };
  }
}

// =====================================================
// ENVIAR MENSAJE TELEGRAM
// =====================================================

async function enviarMensajeTelegram(
  chatId: number | string,
  texto: string
) {
  if (!TELEGRAM_TOKEN) {
    throw new Error(
      "Falta TELEGRAM_BOT_TOKEN"
    );
  }

  const respuesta =
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          chat_id: chatId,
          text: texto,
        }),
      }
    );

  const resultado =
    await respuesta.json();

  if (
    !respuesta.ok ||
    !resultado?.ok
  ) {
    throw new Error(
      resultado?.description ||
      "Telegram rechazó el mensaje"
    );
  }

  return resultado;
}

// =====================================================
// POST - WEBHOOK TELEGRAM
// =====================================================

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    console.log(
      "================================="
    );

    console.log(
      "TELEGRAM WEBHOOK RECIBIDO"
    );

    console.log(
      JSON.stringify(
        body,
        null,
        2
      )
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

          error:
            "Falta TELEGRAM_BOT_TOKEN",
        },

        {
          status: 500,
        }
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
    // CONEXIÓN AUTOMÁTICA DE TELEGRAM
    // POR CÓDIGO DE 6 DÍGITOS
    // =====================================================

    if (body.message) {

      const texto =
        String(
          body.message.text || ""
        ).trim();

      const chatId =
        body.message.chat?.id;

      // ===================================================
      // /START
      //
      // Ya no usamos tokens ni HMAC.
      // ===================================================

      if (
        chatId &&
        texto.startsWith("/start")
      ) {

        await enviarMensajeTelegram(
          chatId,

          "👋 Hola. Para conectar Telegram con tu restaurante, genera un código de 6 dígitos desde ShortBizAI y envíamelo aquí."
        );

        return NextResponse.json({
          ok: true,
          conectado: false,
        });
      }

      // ===================================================
      // CÓDIGO DE 6 DÍGITOS
      // ===================================================

      if (
        chatId &&
        /^\d{6}$/.test(texto)
      ) {

        const ahora =
          new Date().toISOString();

        // =================================================
        // BUSCAR CÓDIGO
        // =================================================

        const {
          data: conexion,
          error: conexionError,
        } =
          await supabaseAdmin
            .from(
              "telegram_conexiones"
            )
            .select(
              "empresa_id, codigo, expira_at, usado_at"
            )
            .eq(
              "codigo",
              texto
            )
            .is(
              "usado_at",
              null
            )
            .gt(
              "expira_at",
              ahora
            )
            .maybeSingle();

        if (conexionError) {

          console.error(
            "❌ ERROR BUSCANDO CÓDIGO TELEGRAM:",
            conexionError
          );

          await enviarMensajeTelegram(
            chatId,

            "❌ No fue posible validar el código. Intenta nuevamente."
          );

          return NextResponse.json({
            ok: false,
            conectado: false,
          });
        }

        // =================================================
        // CÓDIGO INVÁLIDO / EXPIRADO / USADO
        // =================================================

        if (!conexion) {

          await enviarMensajeTelegram(
            chatId,

            "❌ El código no es válido, ya fue utilizado o expiró. Genera un código nuevo desde ShortBizAI."
          );

          return NextResponse.json({
            ok: true,
            conectado: false,
          });
        }

        // =================================================
        // BUSCAR EMPRESA
        // =================================================

        const {
          data: empresa,
          error: empresaError,
        } =
          await supabaseAdmin
            .from("empresas")
            .select(
              "id, nombre, activo"
            )
            .eq(
              "id",
              conexion.empresa_id
            )
            .maybeSingle();

        if (empresaError) {

          console.error(
            "❌ ERROR BUSCANDO EMPRESA PARA TELEGRAM:",
            empresaError
          );

          await enviarMensajeTelegram(
            chatId,

            "❌ No fue posible comprobar la empresa. Intenta nuevamente."
          );

          return NextResponse.json({
            ok: false,
            conectado: false,
          });
        }

        // =================================================
        // EMPRESA INACTIVA
        // =================================================

        if (
          !empresa ||
          empresa.activo === false
        ) {

          await enviarMensajeTelegram(
            chatId,

            "❌ La empresa no está activa o ya no está disponible."
          );

          return NextResponse.json({
            ok: true,
            conectado: false,
          });
        }

        // =================================================
        // BUSCAR CONFIGURACIÓN DE NOTIFICACIONES
        // =================================================

        const {
          data: configuracion,
          error: configuracionError,
        } =
          await supabaseAdmin
            .from(
              "empresa_notificaciones"
            )
            .select(
              "empresa_id, telegram_activo, telegram_chat_id, telegram_conectado"
            )
            .eq(
              "empresa_id",
              empresa.id
            )
            .maybeSingle();

        if (configuracionError) {

          console.error(
            "❌ ERROR BUSCANDO CONFIGURACIÓN TELEGRAM:",
            configuracionError
          );

          await enviarMensajeTelegram(
            chatId,

            "❌ No fue posible guardar la conexión de Telegram. Intenta nuevamente."
          );

          return NextResponse.json({
            ok: false,
            conectado: false,
          });
        }

        // =================================================
        // ACTUALIZAR CONFIGURACIÓN EXISTENTE
        // =================================================

        if (configuracion) {

          const {
            error:
              actualizarTelegramError,
          } =
            await supabaseAdmin
              .from(
                "empresa_notificaciones"
              )
              .update({
                telegram_chat_id:
                  String(chatId),

                telegram_conectado:
                  true,

                telegram_activo:
                  true,
              })
              .eq(
                "empresa_id",
                empresa.id
              );

          if (
            actualizarTelegramError
          ) {

            console.error(
              "❌ ERROR ACTUALIZANDO TELEGRAM:",
              actualizarTelegramError
            );

            await enviarMensajeTelegram(
              chatId,

              "❌ No fue posible guardar la conexión de Telegram. Intenta nuevamente."
            );

            return NextResponse.json({
              ok: false,
              conectado: false,
            });
          }

        } else {

          // ===============================================
          // CREAR CONFIGURACIÓN
          // ===============================================

          const {
            error:
              insertarTelegramError,
          } =
            await supabaseAdmin
              .from(
                "empresa_notificaciones"
              )
              .insert({
                empresa_id:
                  empresa.id,

                telegram_chat_id:
                  String(chatId),

                telegram_conectado:
                  true,

                telegram_activo:
                  true,
              });

          if (
            insertarTelegramError
          ) {

            console.error(
              "❌ ERROR CREANDO CONFIGURACIÓN TELEGRAM:",
              insertarTelegramError
            );

            await enviarMensajeTelegram(
              chatId,

              "❌ No fue posible guardar la conexión de Telegram. Intenta nuevamente."
            );

            return NextResponse.json({
              ok: false,
              conectado: false,
            });
          }
        }

        // =================================================
        // MARCAR CÓDIGO COMO USADO
        //
        // IMPORTANTE:
        // Se hace DESPUÉS de guardar correctamente
        // la conexión de Telegram.
        // =================================================

        const {
          error:
            marcarCodigoError,
        } =
          await supabaseAdmin
            .from(
              "telegram_conexiones"
            )
            .update({
              usado_at:
                new Date().toISOString(),
            })
            .eq(
              "empresa_id",
              empresa.id
            )
            .eq(
              "codigo",
              texto
            )
            .is(
              "usado_at",
              null
            );

        if (marcarCodigoError) {

          console.error(
            "⚠️ ERROR MARCANDO CÓDIGO TELEGRAM COMO USADO:",
            marcarCodigoError
          );
        }

        // =================================================
        // CONFIRMACIÓN AL USUARIO
        // =================================================

        await enviarMensajeTelegram(
          chatId,

          `✅ Telegram conectado correctamente.

Restaurante: ${empresa.nombre}

ShortBizAI ya puede enviar aquí las notificaciones de reservas.`
        );

        console.log(
          "================================="
        );

        console.log(
          "✅ TELEGRAM CONECTADO POR CÓDIGO"
        );

        console.log(
          "EMPRESA:",
          empresa.id,
          empresa.nombre
        );

        console.log(
          "CHAT ID:",
          chatId
        );

        console.log(
          "================================="
        );

        return NextResponse.json({
          ok: true,

          conectado: true,

          empresaId:
            empresa.id,

          empresaNombre:
            empresa.nombre,

          telegramChatId:
            String(chatId),
        });
      }

      // =================================================
      // OTROS MENSAJES NORMALES
      // =================================================

      console.log(
        "MENSAJE TELEGRAM:",
        texto
      );
    }

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

      if (
        separador === -1
      ) {

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
        "ID:",
        id
      );

      if (
        tipo !== "confirmar" &&
        tipo !== "cancelar"
      ) {

        console.error(
          "❌ TIPO DE CALLBACK NO PERMITIDO:",
          tipo
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const reservaId =
        Number(id);

      if (
        !Number.isFinite(
          reservaId
        )
      ) {

        console.error(
          "❌ ID DE RESERVA INVÁLIDO:",
          id
        );

        return NextResponse.json({
          ok: true,
        });
      }

      // ===================================================
      // BUSCAR RESERVA
      // ===================================================

      const {
        data: reserva,
        error: reservaError,
      } =
        await supabaseAdmin
          .from("reservas")
          .select("*")
          .eq(
            "id",
            reservaId
          )
          .maybeSingle();

      if (reservaError) {

        console.error(
          "❌ ERROR BUSCANDO RESERVA:",
          reservaError
        );

        return NextResponse.json(
          {
            ok: false,

            error:
              "No fue posible buscar la reserva",
          },

          {
            status: 500,
          }
        );
      }

      if (!reserva) {

        console.error(
          "❌ RESERVA NO ENCONTRADA:",
          reservaId
        );

        try {

          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery?callback_query_id=${encodeURIComponent(
              callbackQuery.id
            )}&text=${encodeURIComponent(
              "La reserva ya no existe."
            )}`
          );

        } catch {}

        return NextResponse.json({
          ok: true,
        });
      }

      // ===================================================
      // NUEVO ESTADO
      // ===================================================

      const nuevoEstado =
        tipo === "confirmar"
          ? "confirmada"
          : "cancelada";

      // ===================================================
      // ACTUALIZAR RESERVA
      // ===================================================

      const {
        data:
          reservaActualizada,
        error:
          actualizarError,
      } =
        await supabaseAdmin
          .from("reservas")
          .update({
            estado:
              nuevoEstado,
          })
          .eq(
            "id",
            reservaId
          )
          .select("*")
          .maybeSingle();

      if (actualizarError) {

        console.error(
          "❌ ERROR ACTUALIZANDO RESERVA:",
          actualizarError
        );

        try {

          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery?callback_query_id=${encodeURIComponent(
              callbackQuery.id
            )}&text=${encodeURIComponent(
              "No fue posible actualizar la reserva."
            )}`
          );

        } catch {}

        return NextResponse.json(
          {
            ok: false,

            error:
              "No fue posible actualizar la reserva",
          },

          {
            status: 500,
          }
        );
      }

      const reservaFinal =
        reservaActualizada ||
        {
          ...reserva,
          estado:
            nuevoEstado,
        };

      // ===================================================
      // RESPONDER AL BOTÓN DE TELEGRAM
      // ===================================================

      try {

        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                callback_query_id:
                  callbackQuery.id,

                text:
                  tipo ===
                  "confirmar"
                    ? "Reserva confirmada"
                    : "Reserva cancelada",

                show_alert:
                  false,
              }),
          }
        );

      } catch (
        callbackError
      ) {

        console.error(
          "❌ ERROR RESPONDIENDO CALLBACK TELEGRAM:",
          callbackError
        );
      }

      // ===================================================
      // EDITAR MENSAJE TELEGRAM
      // ===================================================

      try {

        const mensajeOriginal =
          callbackQuery.message;

        const chatId =
          mensajeOriginal?.chat?.id;

        const messageId =
          mensajeOriginal?.message_id;

        if (
          chatId &&
          messageId
        ) {

          const textoEstado =
            tipo ===
            "confirmar"
              ? "✅ RESERVA CONFIRMADA"
              : "❌ RESERVA CANCELADA";

          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  chat_id:
                    chatId,

                  message_id:
                    messageId,

                  text:
                    `${textoEstado}\n\n` +
                    `👤 ${reserva.cliente_nombre || "Cliente"}\n` +
                    `📅 ${reserva.fecha || "—"}\n` +
                    `🕐 ${reserva.hora || "—"}\n` +
                    `👥 ${reserva.personas || "—"}\n` +
                    `📞 ${reserva.telefono || "—"}\n` +
                    `📧 ${reserva.email || "—"}\n\n` +
                    `Reserva #${reserva.id}`,
                }),
            }
          );
        }

      } catch (
        editarError
      ) {

        console.error(
          "❌ ERROR EDITANDO MENSAJE TELEGRAM:",
          editarError
        );
      }

      // ===================================================
      // VARIABLES DE NOTIFICACIONES
      // ===================================================

      let pushEnviado =
        false;

      let emailEnviado =
        false;

      let whatsappEnviado =
        false;

      let motivoPush =
        "";

      let motivoEmail =
        "";

      let motivoWhatsApp =
        "";

      // ===================================================
      // PUSH
      // ===================================================

      try {

        const {
          data:
            configuracionNotificaciones,
          error:
            configuracionNotificacionesError,
        } =
          await supabaseAdmin
            .from(
              "empresa_notificaciones"
            )
            .select(
              "*"
            )
            .eq(
              "empresa_id",
              reservaFinal.empresa_id
            )
            .maybeSingle();

        if (
          configuracionNotificacionesError
        ) {

          console.error(
            "❌ ERROR BUSCANDO CONFIGURACIÓN DE NOTIFICACIONES:",
            configuracionNotificacionesError
          );

          motivoPush =
            "No fue posible obtener la configuración de notificaciones.";

        } else {

          // =================================================
          // PUSH ACTIVADO
          // =================================================

          if (
            configuracionNotificaciones
              ?.push_activo !== false
          ) {

            const {
              data:
                suscripciones,
              error:
                suscripcionesError,
            } =
              await supabaseAdmin
                .from(
                  "push_subscriptions"
                )
                .select("*")
                .eq(
                  "empresa_id",
                  reservaFinal.empresa_id
                );

            if (
              suscripcionesError
            ) {

              console.error(
                "❌ ERROR BUSCANDO SUSCRIPCIONES PUSH:",
                suscripcionesError
              );

              motivoPush =
                "No fue posible obtener las suscripciones Push.";

            } else if (
              !suscripciones ||
              suscripciones.length ===
                0
            ) {

              motivoPush =
                "No hay dispositivos registrados para Push.";

              console.log(
                "⚠️ NO HAY SUSCRIPCIONES PUSH PARA LA EMPRESA:",
                reservaFinal.empresa_id
              );

            } else {

              for (
                const suscripcion of suscripciones
              ) {

                try {

                  const payload =
                    JSON.stringify({
                      title:
                        tipo ===
                        "confirmar"
                          ? "Reserva confirmada"
                          : "Reserva cancelada",

                      body:
                        `${reservaFinal.cliente_nombre || "Cliente"} - ${reservaFinal.fecha || "—"} ${reservaFinal.hora || "—"}`,

                      icon:
                        "/icon-192.png",

                      badge:
                        "/icon-192.png",

                      data: {
                        reservaId:
                          reservaFinal.id,

                        estado:
                          reservaFinal.estado,
                      },
                    });

                  await webpush.sendNotification(
                    {
                      endpoint:
                        suscripcion.endpoint,

                      keys: {
                        p256dh:
                          suscripcion.p256dh,

                        auth:
                          suscripcion.auth,
                      },
                    },

                    payload
                  );

                  pushEnviado =
                    true;

                } catch (
                  pushError: any
                ) {

                  console.error(
                    "❌ ERROR ENVIANDO PUSH:",
                    pushError
                  );

                  if (
                    pushError?.statusCode ===
                      404 ||
                    pushError?.statusCode ===
                      410
                  ) {

                    try {

                      await supabaseAdmin
                        .from(
                          "push_subscriptions"
                        )
                        .delete()
                        .eq(
                          "endpoint",
                          suscripcion.endpoint
                        );

                    } catch {}

                  }

                  motivoPush =
                    pushError?.message ||
                    "Error enviando Push";
                }
              }
            }

          } else {

            motivoPush =
              "Las notificaciones Push están desactivadas.";
          }
        }

      } catch (
        pushGeneralError: any
      ) {

        motivoPush =
          pushGeneralError?.message ||
          "Error general de Push";

        console.error(
          "❌ ERROR GENERAL PUSH:",
          pushGeneralError
        );
      }

      // ===================================================
      // EMAIL AL CLIENTE
      // ===================================================

      if (
        RESEND_API_KEY &&
        reservaFinal.email
      ) {

        const asunto =
          tipo ===
          "confirmar"
            ? "Tu reserva ha sido confirmada"
            : "Tu reserva ha sido cancelada";

        const html =
          tipo ===
          "confirmar"

            ? `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Reserva confirmada</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:30px 15px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr>
<td style="padding:30px;text-align:center;background:#111827;color:#ffffff;">
<div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
ShortBizAI
</div>
<div style="font-size:28px;font-weight:800;margin-top:10px;">
Reserva confirmada
</div>
</td>
</tr>
<tr>
<td style="padding:35px;">
<p style="font-size:18px;color:#111827;margin-top:0;">
Hola ${reservaFinal.cliente_nombre || "Cliente"},
</p>
<p style="font-size:15px;line-height:24px;color:#4b5563;">
Tu reserva ha sido confirmada correctamente.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:25px;background:#f9fafb;border-radius:10px;">
<tr>
<td style="padding:22px;">
<div style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">
Date
</div>
<div style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding:5px 0 17px;">
${reservaFinal.fecha || "—"}
</div>
<div style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">
Time
</div>
<div style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding:5px 0 17px;">
${reservaFinal.hora || "—"}
</div>
<div style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">
Guests
</div>
<div style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding-top:5px;">
${reservaFinal.personas || "—"}
</div>
</td>
</tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
<tr>
<td align="center">
<div style="font-size:11px;line-height:16px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
Reservation ID
</div>
<div style="font-size:14px;line-height:20px;color:#374151;font-weight:700;padding-top:3px;">
#${reservaFinal.id}
</div>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="padding:16px 12px 0;">
<p style="margin:0;font-size:11px;line-height:17px;color:#9ca3af;">
This is an automated reservation notification from ShortBizAI.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`

            : `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Reserva cancelada</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:30px 15px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr>
<td style="padding:30px;text-align:center;background:#7f1d1d;color:#ffffff;">
<div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
ShortBizAI
</div>
<div style="font-size:28px;font-weight:800;margin-top:10px;">
Reserva cancelada
</div>
</td>
</tr>
<tr>
<td style="padding:35px;">
<p style="font-size:18px;color:#111827;margin-top:0;">
Hola ${reservaFinal.cliente_nombre || "Cliente"},
</p>
<p style="font-size:15px;line-height:24px;color:#4b5563;">
Tu reserva ha sido cancelada.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:25px;background:#f9fafb;border-radius:10px;">
<tr>
<td style="padding:22px;">
<div style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">
Date
</div>
<div style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding:5px 0 17px;">
${reservaFinal.fecha || "—"}
</div>
<div style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">
Time
</div>
<div style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding:5px 0 17px;">
${reservaFinal.hora || "—"}
</div>
<div style="font-size:11px;line-height:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">
Guests
</div>
<div style="font-size:17px;line-height:24px;font-weight:700;color:#111827;padding-top:5px;">
${reservaFinal.personas || "—"}
</div>
</td>
</tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
<tr>
<td align="center">
<div style="font-size:11px;line-height:16px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
Reservation ID
</div>
<div style="font-size:14px;line-height:20px;color:#374151;font-weight:700;padding-top:3px;">
#${reservaFinal.id}
</div>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="padding:16px 12px 0;">
<p style="margin:0;font-size:11px;line-height:17px;color:#9ca3af;">
This is an automated reservation notification from ShortBizAI.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;

        try {

          const respuestaEmail =
            await fetch(
              "https://api.resend.com/emails",
              {
                method: "POST",

                headers: {
                  Authorization:
                    `Bearer ${RESEND_API_KEY}`,

                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    from:
                      RESERVA_FROM_EMAIL,

                    to: [
                      reservaFinal.email.trim(),
                    ],

                    subject:
                      asunto,

                    html,
                  }),
              }
            );

          const resultadoEmail =
            await respuestaEmail.json();

          console.log(
            "RESEND HTTP STATUS:",
            respuestaEmail.status
          );

          console.log(
            "RESEND RESPONSE:",
            resultadoEmail
          );

          if (
            !respuestaEmail.ok ||
            !resultadoEmail?.id
          ) {

            motivoEmail =
              resultadoEmail?.message ||
              resultadoEmail?.error ||
              "Resend rechazó el email";

            console.error(
              "❌ EMAIL NO ENVIADO:",
              motivoEmail
            );

          } else {

            emailEnviado =
              true;

            console.log(
              "================================="
            );

            console.log(
              "✅ EMAIL ENVIADO AL CLIENTE"
            );

            console.log(
              "EMAIL:",
              reservaFinal.email.trim()
            );

            console.log(
              "RESEND ID:",
              resultadoEmail.id
            );

            console.log(
              "================================="
            );
          }

        } catch (
          emailError: any
        ) {

          motivoEmail =
            emailError?.message ||
            "Error enviando email";

          console.error(
            "❌ ERROR ENVIANDO EMAIL:",
            emailError
          );
        }

      } else if (
        !RESEND_API_KEY
      ) {

        motivoEmail =
          "Falta RESEND_API_KEY";

      } else {

        motivoEmail =
          "La reserva no tiene email del cliente";
      }

      // ===================================================
      // WHATSAPP AL CLIENTE
      //
      // IMPORTANTE:
      // Se ejecuta DESPUÉS de actualizar la reserva.
      //
      // Si WhatsApp falla:
      // - la reserva sigue confirmada/cancelada
      // - Telegram ya respondió
      // - Push sigue funcionando
      // - Email sigue funcionando
      // ===================================================

      try {

        const resultadoWhatsApp =
          await enviarWhatsApp(
            reservaFinal.telefono,
            reservaFinal.cliente_nombre,
            reservaFinal.fecha,
            reservaFinal.hora,
            reservaFinal.personas,
            reservaFinal.id,
            tipo === "confirmar"
          );

        whatsappEnviado =
          resultadoWhatsApp.enviado;

        if (
          !resultadoWhatsApp.enviado
        ) {

          motivoWhatsApp =
            resultadoWhatsApp.motivo ||
            "WhatsApp no pudo enviar el mensaje";
        }

      } catch (
        whatsappError: any
      ) {

        motivoWhatsApp =
          whatsappError?.message ||
          "Error enviando WhatsApp";

        console.error(
          "❌ ERROR GENERAL WHATSAPP:",
          whatsappError
        );
      }

      // ===================================================
      // RESULTADO FINAL
      // ===================================================

      console.log(
        "================================="
      );

      console.log(
        "📊 RESULTADO NOTIFICACIONES"
      );

      console.log(
        "RESERVA:",
        reservaFinal.id
      );

      console.log(
        "ESTADO:",
        reservaFinal.estado
      );

      console.log(
        "PUSH:",
        pushEnviado
      );

      console.log(
        "EMAIL:",
        emailEnviado
      );

      console.log(
        "WHATSAPP:",
        whatsappEnviado
      );

      if (motivoPush) {

        console.log(
          "MOTIVO PUSH:",
          motivoPush
        );
      }

      if (motivoEmail) {

        console.log(
          "MOTIVO EMAIL:",
          motivoEmail
        );
      }

      if (motivoWhatsApp) {

        console.log(
          "MOTIVO WHATSAPP:",
          motivoWhatsApp
        );
      }

      console.log(
        "================================="
      );

      return NextResponse.json({
        ok: true,

        reservaActualizada:
          true,

        reservaId:
          reservaFinal.id,

        estado:
          reservaFinal.estado,

        pushEnviado,

        emailEnviado,

        whatsappEnviado,

        motivoPush:
          motivoPush || undefined,

        motivoEmail:
          motivoEmail || undefined,

        motivoWhatsApp:
          motivoWhatsApp || undefined,
      });
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

      {
        status: 500,
      }
    );
  }
}

// =====================================================
// GET - CONFIGURAR WEBHOOK TELEGRAM
// =====================================================

export async function GET() {

  try {

    const webhookUrl =
      "https://www.shortbizai.com/api/telegram/webhook";

    const respuesta =
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`,

        {
          method: "GET",

          cache: "no-store",
        }
      );

    const resultado =
      await respuesta.json();

    console.log(
      "TELEGRAM SET WEBHOOK:",

      JSON.stringify(
        resultado,
        null,
        2
      )
    );

    return NextResponse.json({

      ok:
        resultado.ok,

      webhookUrl,

      telegram:
        resultado,
    });

  } catch (error: any) {

    console.error(
      "ERROR CONFIGURANDO WEBHOOK:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "Error configurando webhook",
      },

      {
        status: 500,
      }
    );
  }
}