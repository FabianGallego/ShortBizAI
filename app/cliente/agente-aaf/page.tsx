"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import NotificacionesObligatorias from "@/app/components/NotificacionesObligatorias";

function convertirFecha(fecha: string): string | null {
  const meses: Record<string, string> = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12",
  };

  const texto = fecha.toLowerCase().trim();

  let m = texto.match(
    /^([a-zñ]+)\s+(\d{1,2})\s+de\s+(\d{4})$/
  );

  if (m) {
    const mes = meses[m[1]];

    if (!mes) return null;

    return `${m[3]}-${mes}-${m[2].padStart(2, "0")}`;
  }

  m = texto.match(
    /^(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4})$/
  );

  if (m) {
    const mes = meses[m[2]];

    if (!mes) return null;

    return `${m[3]}-${mes}-${m[1].padStart(2, "0")}`;
  }

  return null;
}

function convertirFechaIngles(fecha: string): string | null {
  const meses: Record<string, string> = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  const texto = fecha.toLowerCase().trim();

  let m = texto.match(
    /^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/
  );

  if (m) {
    const mes = meses[m[1]];

    if (!mes) return null;

    return `${m[3]}-${mes}-${m[2].padStart(2, "0")}`;
  }

  m = texto.match(
    /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/
  );

  if (m) {
    const mes = meses[m[2]];

    if (!mes) return null;

    return `${m[3]}-${mes}-${m[1].padStart(2, "0")}`;
  }

  return null;
}

function convertirHora(hora: string): string | null {
  const texto = hora.toLowerCase().trim();

  let m = texto.match(/^(\d{1,2})\s*(am|pm)$/);

  if (m) {
    let h = parseInt(m[1], 10);
    const periodo = m[2];

    if (h < 1 || h > 12) return null;

    if (periodo === "pm" && h !== 12) h += 12;
    if (periodo === "am" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:00`;
  }

  m = texto.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);

  if (m) {
    let h = parseInt(m[1], 10);
    const minutos = m[2];
    const periodo = m[3];

    if (h < 1 || h > 12) return null;

    if (periodo === "pm" && h !== 12) h += 12;
    if (periodo === "am" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${minutos}`;
  }

  m = texto.match(/^(\d{1,2}):(\d{2})$/);

  if (m) {
    const h = parseInt(m[1], 10);
    const minutos = m[2];

    if (h < 0 || h > 23) return null;

    return `${String(h).padStart(2, "0")}:${minutos}`;
  }

  return null;
}

type Mensaje = {
  autor: string;
  texto: string;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

export default function AgenteAAFPage() {
  // =====================================================
  // IDIOMA
  // =====================================================

  // INGLÉS ES EL IDIOMA POR DEFECTO
  const [idioma, setIdioma] =
    useState<"es" | "en">("en");

  // =====================================================
  // RESERVA
  // =====================================================

  const [mensaje, setMensaje] = useState("");
  const [paso, setPaso] = useState("inicio");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState("");

  const [conversacion, setConversacion] =
    useState<Mensaje[]>([]);

  const [guardando, setGuardando] =
    useState(false);

  // =====================================================
  // TEXTOS
  // =====================================================

  const textos = {
    en: {
      titulo: "Reservation Center",

      disponible:
        "Smart assistant available 24/7",

      activarTitulo:
        "Enable notifications",

      activarTexto:
        "To receive the confirmation or cancellation of your reservation directly on this device, you must enable notifications.",

      soloAvisos:
        "You will only receive notifications related to your reservation.",

      activarBoton:
        "🔔 Enable notifications",

      activando:
        "Activating...",

      notificacionesActivadas:
        "Notifications enabled",

      dispositivoListo:
        "This device is ready to receive your reservation confirmation or cancellation.",

      asistente:
        "Reservation and Availability Assistant",

      bienvenida:
        "Welcome to the reservation and availability system. How can I help you?",

      activarPrimero:
        "🔔 Enable notifications to start your reservation.",

      placeholder:
        "Write your reservation request",

      placeholderBloqueado:
        "Enable notifications first",

      consultar:
        "Check Availability",

      guardando:
        "Saving...",

      cliente:
        "Customer",

      asistenteNombre:
        "Assistant",

      reservaPregunta:
        "Of course! What name should I put the reservation under?",

      telefonoPregunta:
        "What is your phone number?",

      fechaPregunta:
        "What date would you like the reservation for?",

      horaPregunta:
        "What time would you like the reservation for?",

      personasPregunta:
        "How many people will the reservation be for?",

      inicioAyuda:
        "I can help you make a reservation. Type “I want a reservation” to get started.",

      telefonoInvalido:
        "❌ The phone number must have 10 digits. Please try again.",

      fechaInvalida:
        "❌ Invalid date. Example: August 28, 2026.",

      horaInvalida:
        "❌ Invalid time. For example: 2 pm, 2:30 pm, or 14:00.",

      guardandoReserva:
        "✅ Saving your reservation...",

      sinEndpoint:
        "❌ The reservation cannot be saved because notifications are not enabled.",

      errorGuardar:
        "❌ I couldn't save the reservation. Please try again.",

      reservaRegistrada:
        "🎉 Reservation registered successfully! You will receive confirmation shortly.",

      errorNotificaciones:
        "You must allow notifications to receive your reservation confirmation or cancellation.",

      navegadorNoSoporta:
        "This browser does not support notifications.",

      pushNoSoporta:
        "This browser does not support Push notifications.",

      configuracionFaltante:
        "Notification configuration was not found.",

      registrarError:
        "We could not register this device. Please try again.",

      activarError:
        "We could not enable notifications. Please try again.",

      español:
        "Español",

      ingles:
        "English",
    },

    es: {
      titulo: "Centro de Reservas",

      disponible:
        "Asistente inteligente disponible 24/7",

      activarTitulo:
        "Activa las notificaciones",

      activarTexto:
        "Para recibir directamente en este dispositivo la confirmación o cancelación de tu reserva, debes activar las notificaciones.",

      soloAvisos:
        "Solo recibirás avisos relacionados con tu reserva.",

      activarBoton:
        "🔔 Activar notificaciones",

      activando:
        "Activando...",

      notificacionesActivadas:
        "Notificaciones activadas",

      dispositivoListo:
        "Este dispositivo está listo para recibir la confirmación o cancelación de tu reserva.",

      asistente:
        "Asistente de reservas y disponibilidad",

      bienvenida:
        "Bienvenido al sistema de reservas y disponibilidad, ¿en qué puedo ayudar?",

      activarPrimero:
        "🔔 Activa las notificaciones para comenzar tu reserva.",

      placeholder:
        "Escribe tu solicitud de reserva",

      placeholderBloqueado:
        "Activa primero las notificaciones",

      consultar:
        "Consultar Disponibilidad",

      guardando:
        "Guardando...",

      cliente:
        "Cliente",

      asistenteNombre:
        "Asistente",

      reservaPregunta:
        "¡Con mucho gusto! ¿A nombre de quién hago la reserva?",

      telefonoPregunta:
        "¿Cuál es tu número de teléfono?",

      fechaPregunta:
        "¿Para qué fecha deseas la reserva?",

      horaPregunta:
        "¿A qué hora deseas la reserva?",

      personasPregunta:
        "¿Para cuántas personas será la reserva?",

      inicioAyuda:
        "Puedo ayudarte a realizar una reserva. Escribe “quiero una reserva” para comenzar.",

      telefonoInvalido:
        "❌ El teléfono debe tener 10 dígitos. Inténtalo nuevamente.",

      fechaInvalida:
        "❌ Fecha inválida. Ejemplo: 28 de agosto de 2026.",

      horaInvalida:
        "❌ Hora inválida. Escribe, por ejemplo: 2 pm, 2:30 pm o 14:00.",

      guardandoReserva:
        "✅ Guardando tu reserva...",

      sinEndpoint:
        "❌ No se puede guardar la reserva porque las notificaciones no están activadas.",

      errorGuardar:
        "❌ No pude guardar la reserva. Por favor, inténtalo nuevamente.",

      reservaRegistrada:
        "🎉 ¡Reserva registrada correctamente! En unos minutos recibirás la confirmación.",

      errorNotificaciones:
        "Debes permitir las notificaciones para recibir la confirmación o cancelación de tu reserva.",

      navegadorNoSoporta:
        "Este navegador no soporta notificaciones.",

      pushNoSoporta:
        "Este navegador no soporta notificaciones Push.",

      configuracionFaltante:
        "No se encontró la configuración de notificaciones.",

      registrarError:
        "No pudimos registrar este dispositivo. Inténtalo nuevamente.",

      activarError:
        "No pudimos activar las notificaciones. Inténtalo nuevamente.",

      español:
        "Español",

      ingles:
        "English",
    },
  };

  const t = textos[idioma];

  // =====================================================
  // PUSH
  // =====================================================

  const [pushEndpoint, setPushEndpoint] =
    useState<string | null>(null);

  const [notificacionesActivas, setNotificacionesActivas] =
    useState(false);

  const [activandoNotificaciones, setActivandoNotificaciones] =
    useState(false);

  const [errorNotificaciones, setErrorNotificaciones] =
    useState("");

  // =====================================================
  // AUTOSCROLL
  // =====================================================

  const finalConversacionRef =
    useRef<HTMLDivElement>(null);

  // =====================================================
  // REGISTRAR NOTIFICACIONES PUSH
  // =====================================================

  async function registrarNotificaciones() {
    console.log("PUSH: iniciando registro");

    setActivandoNotificaciones(true);
    setErrorNotificaciones("");

    try {
      // =================================================
      // SERVICE WORKER
      // =================================================

      if (!("serviceWorker" in navigator)) {
        setErrorNotificaciones(
          t.navegadorNoSoporta
        );

        console.log(
          "Este navegador no soporta Service Worker"
        );

        return;
      }

      // =================================================
      // PUSH MANAGER
      // =================================================

      if (!("PushManager" in window)) {
        setErrorNotificaciones(
          t.pushNoSoporta
        );

        console.log(
          "Este navegador no soporta Push"
        );

        return;
      }

      // =================================================
      // NOTIFICATION API
      // =================================================

      if (!("Notification" in window)) {
        setErrorNotificaciones(
          t.navegadorNoSoporta
        );

        return;
      }

      // =================================================
      // PEDIR PERMISO
      // =================================================

      let permiso =
        Notification.permission;

      console.log(
        "PUSH: permiso actual:",
        permiso
      );

      if (permiso === "default") {
        permiso =
          await Notification.requestPermission();

        console.log(
          "PUSH: nuevo permiso:",
          permiso
        );
      }

      // =================================================
      // PERMISO DENEGADO
      // =================================================

      if (permiso !== "granted") {
        setNotificacionesActivas(false);

        setErrorNotificaciones(
          t.errorNotificaciones
        );

        console.log(
          "PUSH: permiso no concedido"
        );

        return;
      }

      // =================================================
      // REGISTRAR SERVICE WORKER
      // =================================================

      console.log(
        "PUSH: registrando /sw.js"
      );

      const registro =
        await navigator.serviceWorker.register(
          "/sw.js"
        );

      await navigator.serviceWorker.ready;

      console.log(
        "PUSH: Service Worker listo"
      );

      // =================================================
      // BUSCAR SUSCRIPCIÓN EXISTENTE
      // =================================================

      let subscription =
        await registro.pushManager.getSubscription();

      // =================================================
      // CREAR SUSCRIPCIÓN
      // =================================================

      if (!subscription) {
        console.log(
          "PUSH: no existe suscripción, creando nueva"
        );

        const vapidKey =
          process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidKey) {
          setErrorNotificaciones(
            t.configuracionFaltante
          );

          console.error(
            "Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY"
          );

          return;
        }

        subscription =
          await registro.pushManager.subscribe({
            userVisibleOnly: true,

            applicationServerKey:
              urlBase64ToUint8Array(
                vapidKey
              ),
          });

        console.log(
          "PUSH: nueva suscripción creada"
        );
      } else {
        console.log(
          "PUSH: usando suscripción existente"
        );
      }

      // =================================================
      // ENDPOINT
      // =================================================

      const endpoint =
        subscription.endpoint;

      console.log(
        "PUSH ENDPOINT:",
        endpoint
      );

      setPushEndpoint(endpoint);

      // =================================================
      // GUARDAR SUSCRIPCIÓN
      // =================================================

      console.log(
        "PUSH: registrando dispositivo en /api/push"
      );

      const respuesta =
        await fetch("/api/push", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            subscription,
          }),
        });

      const resultado =
        await respuesta.json();

      console.log(
        "PUSH: respuesta /api/push:",
        resultado
      );

      if (!respuesta.ok) {
        setNotificacionesActivas(false);

        setErrorNotificaciones(
          t.registrarError
        );

        console.error(
          "ERROR REGISTRANDO PUSH:",
          resultado
        );

        return;
      }

      // =================================================
      // TODO CORRECTO
      // =================================================

      setNotificacionesActivas(true);
      setErrorNotificaciones("");

      console.log(
        "PUSH: dispositivo registrado correctamente"
      );
    } catch (error) {
      console.error(
        "ERROR REGISTRANDO PUSH:",
        error
      );

      setNotificacionesActivas(false);

      setErrorNotificaciones(
        t.activarError
      );
    } finally {
      setActivandoNotificaciones(false);
    }
  }

  // =====================================================
  // AUTOSCROLL
  // =====================================================

  useEffect(() => {
    finalConversacionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversacion, guardando]);

  // =====================================================
  // CAMBIAR IDIOMA
  // =====================================================

  function cambiarIdioma(
    nuevoIdioma: "es" | "en"
  ) {
    setIdioma(nuevoIdioma);

    setErrorNotificaciones("");
  }

  // =====================================================
  // ENVIAR MENSAJE
  // =====================================================

  async function enviarMensaje() {
    if (!mensaje.trim() || guardando) return;

    // =================================================
    // PROTECCIÓN PUSH
    // =================================================

    if (
      !notificacionesActivas ||
      !pushEndpoint
    ) {
      setConversacion((anterior) => [
        ...anterior,
        {
          autor:
            t.asistenteNombre,

          texto:
            t.activarPrimero,
        },
      ]);

      setErrorNotificaciones(
        t.errorNotificaciones
      );

      return;
    }

    const texto =
      mensaje.trim();

    setConversacion((anterior) => [
      ...anterior,
      {
        autor: t.cliente,
        texto,
      },
    ]);

    setMensaje("");

    // =====================================================
    // INICIO
    // =====================================================

    if (paso === "inicio") {
      const textoMinuscula =
        texto.toLowerCase();

      const quiereReserva =
        idioma === "en"
          ? textoMinuscula.includes(
              "reservation"
            ) ||
            textoMinuscula.includes(
              "table"
            ) ||
            textoMinuscula.includes(
              "reserve"
            )
          : textoMinuscula.includes(
              "reserva"
            ) ||
            textoMinuscula.includes(
              "mesa"
            );

      if (quiereReserva) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor:
              t.asistenteNombre,

            texto:
              t.reservaPregunta,
          },
        ]);

        setPaso("nombre");
      } else {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor:
              t.asistenteNombre,

            texto:
              t.inicioAyuda,
          },
        ]);
      }

      return;
    }

    // =====================================================
    // NOMBRE
    // =====================================================

    if (paso === "nombre") {
      setNombre(texto);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor:
            t.asistenteNombre,

          texto:
            t.telefonoPregunta,
        },
      ]);

      setPaso("telefono");

      return;
    }

    // =====================================================
    // TELÉFONO
    // =====================================================

    if (paso === "telefono") {
      const telefonoLimpio =
        texto.replace(/\D/g, "");

      if (
        telefonoLimpio.length !== 10
      ) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor:
              t.asistenteNombre,

            texto:
              t.telefonoInvalido,
          },
        ]);

        return;
      }

      setTelefono(
        telefonoLimpio
      );

      setConversacion((anterior) => [
        ...anterior,
        {
          autor:
            t.asistenteNombre,

          texto:
            t.fechaPregunta,
        },
      ]);

      setPaso("fecha");

      return;
    }

    // =====================================================
    // FECHA
    // =====================================================

    if (paso === "fecha") {
      const fechaConvertida =
        idioma === "en"
          ? convertirFechaIngles(texto)
          : convertirFecha(texto);

      if (!fechaConvertida) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor:
              t.asistenteNombre,

            texto:
              t.fechaInvalida,
          },
        ]);

        return;
      }

      setFecha(texto);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor:
            t.asistenteNombre,

          texto:
            t.horaPregunta,
        },
      ]);

      setPaso("hora");

      return;
    }

    // =====================================================
    // HORA
    // =====================================================

    if (paso === "hora") {
      const horaConvertida =
        convertirHora(texto);

      if (!horaConvertida) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor:
              t.asistenteNombre,

            texto:
              t.horaInvalida,
          },
        ]);

        return;
      }

      setHora(texto);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor:
            t.asistenteNombre,

          texto:
            t.personasPregunta,
        },
      ]);

      setPaso("personas");

      return;
    }

    // =====================================================
    // PERSONAS
    // =====================================================

    if (paso === "personas") {
      setPersonas(texto);

      setPaso("confirmado");
      setGuardando(true);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor:
            t.asistenteNombre,

          texto:
            t.guardandoReserva,
        },
      ]);

      const fechaConvertida =
        idioma === "en"
          ? convertirFechaIngles(fecha)
          : convertirFecha(fecha);

      const horaConvertida =
        convertirHora(hora);

      // =================================================
      // COMPROBAR ENDPOINT
      // =================================================

      if (!pushEndpoint) {
        console.error(
          "PUSH: no hay endpoint"
        );

        setGuardando(false);

        setConversacion((anterior) => [
          ...anterior,
          {
            autor:
              t.asistenteNombre,

            texto:
              t.sinEndpoint,
          },
        ]);

        setPaso("inicio");

        return;
      }

      console.log(
        "PUSH: endpoint asociado:",
        pushEndpoint
      );

      // =================================================
      // GUARDAR RESERVA EN SUPABASE
      // =================================================

      const { data, error } =
        await supabase
          .from("reservas")
          .insert([
            {
              cliente_nombre:
                nombre,

              telefono,

              fecha:
                fechaConvertida,

              hora:
                horaConvertida,

              personas:
                texto,

              push_endpoint:
                pushEndpoint,
            },
          ])
          .select()
          .single();

      // =================================================
      // ERROR SUPABASE
      // =================================================

      if (error) {
        console.error(
          "ERROR AL GUARDAR RESERVA:",
          error
        );

        setGuardando(false);

        setConversacion((anterior) => [
          ...anterior,
          {
            autor:
              t.asistenteNombre,

            texto:
              t.errorGuardar,
          },
        ]);

        setPaso("inicio");

        return;
      }

      console.log(
        "RESERVA CREADA:",
        data
      );

      // =================================================
      // NOTIFICAR AL SERVIDOR
      // =================================================

      try {
        const respuestaTelegram =
          await fetch(
            "/api/reservas/notificar",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                reservaId:
                  data.id,

                cliente_nombre:
                  nombre,

                telefono,

                fecha:
                  fechaConvertida,

                hora:
                  horaConvertida,

                personas:
                  texto,

                pushEndpoint:
                  pushEndpoint,
              }),
            }
          );

        const resultadoTelegram =
          await respuestaTelegram.json();

        if (!respuestaTelegram.ok) {
          console.error(
            "ERROR NOTIFICANDO RESERVA:",
            JSON.stringify(
              resultadoTelegram,
              null,
              2
            )
          );
        } else {
          console.log(
            "RESERVA NOTIFICADA CORRECTAMENTE:",
            resultadoTelegram
          );
        }
      } catch (error) {
        console.error(
          "ERROR COMUNICANDO CON /api/reservas/notificar:",
          error
        );
      }

      setGuardando(false);

      // =================================================
      // RESERVA REGISTRADA
      // =================================================

      setConversacion((anterior) => [
        ...anterior,
        {
          autor:
            t.asistenteNombre,

          texto:
            t.reservaRegistrada,
        },
      ]);

      // =================================================
      // REINICIAR CHAT
      // =================================================

      setTimeout(() => {
        setConversacion([]);

        setPaso("inicio");

        setNombre("");
        setTelefono("");
        setFecha("");
        setHora("");
        setPersonas("");

        setMensaje("");
      }, 5000);
    }
  }

  return (
    <NotificacionesObligatorias>
      <main className="min-h-screen w-full bg-white text-gray-900">

        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

          {/* ==================================================
              SELECTOR DE IDIOMA
          ================================================== */}

          <div className="mb-5 flex justify-end">

            <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white">

              {/* ENGLISH PRIMERO */}

              <button
                type="button"
                onClick={() =>
                  cambiarIdioma("en")
                }
                className={`px-4 py-2 text-sm font-bold transition ${
                  idioma === "en"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                🇺🇸 English
              </button>

              {/* ESPAÑOL SEGUNDO */}

              <button
                type="button"
                onClick={() =>
                  cambiarIdioma("es")
                }
                className={`px-4 py-2 text-sm font-bold transition ${
                  idioma === "es"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                🇪🇸 Español
              </button>

            </div>

          </div>

          {/* ==================================================
              ENCABEZADO
          ================================================== */}

          <header className="mb-6 border-b border-gray-200 pb-5 sm:mb-8 sm:pb-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl">
                  {t.titulo}
                </h1>

                <div className="mt-2 flex items-center gap-2">

                  <span className="h-3 w-3 shrink-0 rounded-full bg-green-500" />

                  <p className="text-sm font-medium text-green-600 sm:text-base">
                    {t.disponible}
                  </p>

                </div>

              </div>

              <div className="flex w-full justify-start sm:w-auto sm:justify-end">

                <Image
                  src="/logo-foodshortai.png"
                  alt="ShortBizAI"
                  width={235}
                  height={235}
                  priority
                  className="h-auto w-[190px] max-w-full object-contain sm:w-[235px]"
                />

              </div>

            </div>

          </header>

          {/* ==================================================
              PANEL PRINCIPAL
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* ==================================================
                ACTIVAR NOTIFICACIONES
            ================================================== */}

            {!notificacionesActivas && (
              <div className="border-b border-blue-200 bg-blue-50 px-4 py-5 sm:px-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-3">

                    <div className="mt-1 text-2xl">
                      🔔
                    </div>

                    <div>

                      <h2 className="text-lg font-bold text-gray-950 sm:text-xl">
                        {t.activarTitulo}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-gray-600 sm:text-base">
                        {t.activarTexto}
                      </p>

                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        {t.soloAvisos}
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={
                      registrarNotificaciones
                    }
                    disabled={
                      activandoNotificaciones
                    }
                    className="min-h-[50px] w-full shrink-0 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                  >
                    {activandoNotificaciones
                      ? t.activando
                      : t.activarBoton}
                  </button>

                </div>

                {errorNotificaciones && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {errorNotificaciones}
                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                NOTIFICACIONES ACTIVADAS
            ================================================== */}

            {notificacionesActivas && (
              <div className="border-b border-green-200 bg-green-50 px-4 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  <span className="text-xl">
                    ✅
                  </span>

                  <div>

                    <p className="font-bold text-green-800">
                      {t.notificacionesActivadas}
                    </p>

                    <p className="text-sm text-green-700">
                      {t.dispositivoListo}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* ==================================================
                ENCABEZADO DEL ASISTENTE
            ================================================== */}

            <div className="border-b border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">

              <h2 className="text-xl font-bold leading-tight text-gray-950 sm:text-2xl">
                {t.asistente}
              </h2>

              <p className="mt-2 text-base leading-6 text-gray-500 sm:text-lg">
                {t.bienvenida}
              </p>

            </div>

            {/* ==================================================
                CONVERSACIÓN
            ================================================== */}

            <div className="max-h-[500px] min-h-[280px] overflow-y-auto bg-white p-4 sm:min-h-[320px] sm:p-6">

              <div className="space-y-4">

                {conversacion.map(
                  (item, index) => {

                    const esCliente =
                      item.autor ===
                      t.cliente;

                    return (
                      <div
                        key={index}
                        className={`flex ${
                          esCliente
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                            esCliente
                              ? "rounded-br-md bg-blue-600 text-white"
                              : "rounded-bl-md bg-gray-100 text-gray-900"
                          }`}
                        >

                          <p
                            className={`mb-1 text-xs font-bold ${
                              esCliente
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            {item.autor}
                          </p>

                          <p className="text-sm leading-6 sm:text-base">
                            {item.texto}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

                {guardando && (
                  <div className="flex justify-start">

                    <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-500">
                      {t.guardando}
                    </div>

                  </div>
                )}

                <div
                  ref={
                    finalConversacionRef
                  }
                  className="h-px w-full"
                />

              </div>

            </div>

            {/* ==================================================
                CAMPO DE MENSAJE
            ================================================== */}

            <div className="border-t border-gray-200 bg-white p-4 sm:p-6">

              {!notificacionesActivas && (
                <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">

                  <p className="text-sm font-semibold text-yellow-800">
                    {t.activarPrimero}
                  </p>

                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  value={mensaje}
                  onChange={(e) =>
                    setMensaje(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      enviarMensaje();
                    }
                  }}
                  disabled={
                    guardando ||
                    !notificacionesActivas
                  }
                  className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder={
                    notificacionesActivas
                      ? t.placeholder
                      : t.placeholderBloqueado
                  }
                />

                <button
                  onClick={
                    enviarMensaje
                  }
                  disabled={
                    guardando ||
                    !mensaje.trim() ||
                    !notificacionesActivas
                  }
                  className="min-h-[54px] w-full rounded-xl bg-blue-600 px-6 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                >
                  {guardando
                    ? t.guardando
                    : t.consultar}
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>
    </NotificacionesObligatorias>
  );
}