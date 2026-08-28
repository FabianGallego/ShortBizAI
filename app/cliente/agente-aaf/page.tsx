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
  const [mensaje, setMensaje] = useState("");
  const [paso, setPaso] = useState("inicio");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState("");

  const [conversacion, setConversacion] = useState<Mensaje[]>([]);

  const [guardando, setGuardando] = useState(false);

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
          "Este navegador no soporta notificaciones."
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
          "Este navegador no soporta notificaciones Push."
        );

        console.log(
          "Este navegador no soporta notificaciones Push"
        );

        return;
      }

      // =================================================
      // NOTIFICATION API
      // =================================================

      if (!("Notification" in window)) {
        setErrorNotificaciones(
          "Este navegador no soporta notificaciones."
        );

        console.log(
          "Este navegador no soporta Notification API"
        );

        return;
      }

      // =================================================
      // PEDIR PERMISO
      // =================================================

      let permiso = Notification.permission;

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
          "Debes permitir las notificaciones para recibir la confirmación o cancelación de tu reserva."
        );

        console.log(
          "PUSH: permiso de notificaciones no concedido"
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
          "PUSH: no existe suscripción, creando una nueva"
        );

        const vapidKey =
          process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidKey) {
          setErrorNotificaciones(
            "No se encontró la configuración de notificaciones."
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
      // OBTENER ENDPOINT
      // =================================================

      const endpoint =
        subscription.endpoint;

      console.log(
        "PUSH ENDPOINT:",
        endpoint
      );

      setPushEndpoint(endpoint);

      // =================================================
      // GUARDAR SUSCRIPCIÓN EN EL SERVIDOR
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
          "No pudimos registrar este dispositivo. Inténtalo nuevamente."
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
        "No pudimos activar las notificaciones. Inténtalo nuevamente."
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
  // REGISTRAR PUSH AUTOMÁTICAMENTE
  // =====================================================

 

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
          autor: "Asistente",
          texto:
            "🔔 Primero debes activar las notificaciones para poder realizar una reserva.",
        },
      ]);

      setErrorNotificaciones(
        "Activa las notificaciones para recibir la confirmación o cancelación de tu reserva."
      );

      return;
    }

    const texto = mensaje.trim();

    setConversacion((anterior) => [
      ...anterior,
      {
        autor: "Cliente",
        texto,
      },
    ]);

    setMensaje("");

    // =====================================================
    // INICIO
    // =====================================================

    if (paso === "inicio") {
      if (
        texto
          .toLowerCase()
          .includes("reserva") ||
        texto
          .toLowerCase()
          .includes("mesa")
      ) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "Asistente",
            texto:
              "¡Con mucho gusto! ¿A nombre de quién hago la reserva?",
          },
        ]);

        setPaso("nombre");
      } else {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "Asistente",
            texto:
              "Puedo ayudarte a realizar una reserva. Escribe “quiero una reserva” para comenzar.",
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
          autor: "Asistente",
          texto:
            "¿Cuál es tu número de teléfono?",
        },
      ]);

      setPaso("telefono");

      return;
    }

    // =====================================================
    // TELÉFONO
    // =====================================================

    if (paso === "telefono") {
      if (!/^\d{10}$/.test(texto)) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "Asistente",
            texto:
              "❌ El teléfono debe tener 10 dígitos. Inténtalo nuevamente.",
          },
        ]);

        return;
      }

      setTelefono(texto);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor: "Asistente",
          texto:
            "¿Para qué fecha deseas la reserva?",
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
        convertirFecha(texto);

      if (!fechaConvertida) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "Asistente",
            texto:
              "❌ Fecha inválida. Ejemplo: 10 de agosto de 2026.",
          },
        ]);

        return;
      }

      setFecha(texto);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor: "Asistente",
          texto:
            "¿A qué hora deseas la reserva?",
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
            autor: "Asistente",
            texto:
              "❌ Hora inválida. Escribe, por ejemplo: 2 pm, 2:30 pm o 14:00.",
          },
        ]);

        return;
      }

      setHora(texto);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor: "Asistente",
          texto:
            "¿Para cuántas personas será la reserva?",
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
          autor: "Asistente",
          texto:
            "✅ Guardando tu reserva...",
        },
      ]);

      const fechaConvertida =
        convertirFecha(fecha);

      const horaConvertida =
        convertirHora(hora);

      // =================================================
      // COMPROBAR ENDPOINT
      // =================================================

      if (!pushEndpoint) {
        console.error(
          "PUSH: no hay endpoint. No se puede guardar la reserva."
        );

        setGuardando(false);

        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "Asistente",
            texto:
              "❌ No se puede guardar la reserva porque las notificaciones no están activadas.",
          },
        ]);

        setPaso("inicio");

        return;
      }

      console.log(
        "PUSH: endpoint asociado a la reserva:",
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
              cliente_nombre: nombre,
              telefono,
              fecha: fechaConvertida,
              hora: horaConvertida,
              personas: texto,

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
            autor: "Asistente",
            texto:
              "❌ No pude guardar la reserva. Por favor, inténtalo nuevamente.",
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
                reservaId: data.id,
                cliente_nombre:
                  nombre,
                telefono,
                fecha:
                  fechaConvertida,
                hora:
                  horaConvertida,
                personas: texto,
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
  JSON.stringify(resultadoTelegram, null, 2)
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
          autor: "Asistente",
          texto:
            "🎉 ¡Reserva registrada correctamente! En unos minutos recibirás la confirmación.",
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
              ENCABEZADO
          ================================================== */}

          <header className="mb-6 border-b border-gray-200 pb-5 sm:mb-8 sm:pb-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl">
                  Centro de Reservas
                </h1>

                <div className="mt-2 flex items-center gap-2">

                  <span className="h-3 w-3 shrink-0 rounded-full bg-green-500" />

                  <p className="text-sm font-medium text-green-600 sm:text-base">
                    Asistente inteligente disponible 24/7
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
                        Activa las notificaciones
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-gray-600 sm:text-base">
                        Para recibir directamente en este
                        dispositivo la confirmación o
                        cancelación de tu reserva, debes
                        activar las notificaciones.
                      </p>

                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Solo recibirás avisos relacionados
                        con tu reserva.
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
                      ? "Activando..."
                      : "🔔 Activar notificaciones"}
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
                      Notificaciones activadas
                    </p>

                    <p className="text-sm text-green-700">
                      Este dispositivo está listo para
                      recibir la confirmación o
                      cancelación de tu reserva.
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
                Asistente de reservas y disponibilidad
              </h2>

              <p className="mt-2 text-base leading-6 text-gray-500 sm:text-lg">
                Bienvenido al sistema de reservas y disponibilidad,
                ¿en qué puedo ayudar?
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
                      "Cliente";

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
                      Guardando reserva...
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
                    🔔 Activa las notificaciones
                    para comenzar tu reserva.
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
                      ? "Escribe tu solicitud de reserva"
                      : "Activa primero las notificaciones"
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
                    ? "Guardando..."
                    : "Consultar Disponibilidad"}
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>
    </NotificacionesObligatorias>
  );
}