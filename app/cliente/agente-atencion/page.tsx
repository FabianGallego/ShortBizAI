"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mensaje = {
  autor: "IA" | "Cliente";
  texto: string;
};

export default function AgenteAtencionPage() {
  const [mensaje, setMensaje] = useState("");
  const [paso, setPaso] = useState("inicio");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState("");

  const [conversacion, setConversacion] = useState<Mensaje[]>([
    {
      autor: "IA",
      texto:
        "¡Hola! Soy el asistente del restaurante. ¿En qué puedo ayudarte?",
    },
  ]);

  const [guardando, setGuardando] = useState(false);

  async function enviarMensaje() {
    if (!mensaje.trim() || guardando) return;

    const texto = mensaje.trim();

    let siguientePaso = paso;

    const nuevosMensajes: Mensaje[] = [
      {
        autor: "Cliente",
        texto,
      },
    ];

    if (paso === "inicio") {
      if (
        texto.toLowerCase().includes("reserva") ||
        texto.toLowerCase().includes("mesa")
      ) {
        nuevosMensajes.push({
          autor: "IA",
          texto: "¡Con mucho gusto! ¿A nombre de quién hago la reserva?",
        });

        siguientePaso = "nombre";
      } else {
        nuevosMensajes.push({
          autor: "IA",
          texto:
            "Claro. Puedo ayudarte a realizar una reserva. Escribe, por ejemplo, “quiero hacer una reserva”.",
        });
      }
    } else if (paso === "nombre") {
      setNombre(texto);

      nuevosMensajes.push({
        autor: "IA",
        texto: `Mucho gusto, ${texto}. ¿Cuál es tu número de teléfono?`,
      });

      siguientePaso = "telefono";
    } else if (paso === "telefono") {
      setTelefono(texto);

      nuevosMensajes.push({
        autor: "IA",
        texto: "Perfecto. ¿Para qué fecha deseas la reserva?",
      });

      siguientePaso = "fecha";
    } else if (paso === "fecha") {
      setFecha(texto);

      nuevosMensajes.push({
        autor: "IA",
        texto: "Perfecto. ¿A qué hora deseas la reserva?",
      });

      siguientePaso = "hora";
    } else if (paso === "hora") {
      setHora(texto);

      nuevosMensajes.push({
        autor: "IA",
        texto: "Perfecto. ¿Para cuántas personas será la reserva?",
      });

      siguientePaso = "personas";
    } else if (paso === "personas") {
      setPersonas(texto);

      const reserva = {
        cliente_nombre: nombre,
        telefono,
        fecha,
        hora,
        personas: texto,
      };

      setGuardando(true);

      try {
        const { data, error } = await supabase
          .from("reservas")
          .insert([reserva])
          .select();

        console.log("RESERVA GUARDADA:", data);
        console.log("ERROR:", error);

        if (error) {
          console.error(error);

          nuevosMensajes.push({
            autor: "IA",
            texto:
              "Hubo un problema al registrar la reserva. Por favor, inténtalo nuevamente.",
          });
        } else {
          nuevosMensajes.push({
            autor: "IA",
            texto:
              "✅ ¡Perfecto! Tu reserva ha sido registrada. En unos minutos recibirás la confirmación.",
          });

          /*
           * IMPORTANTE:
           * No dejes el token de Telegram directamente aquí.
           * Más adelante lo moveremos a una variable de entorno.
           */

          try {
            await fetch("/api/notificar-reserva", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(reserva),
            });
          } catch (telegramError) {
            console.error(
              "No se pudo enviar la notificación:",
              telegramError
            );
          }
        }
      } finally {
        setGuardando(false);
      }

      siguientePaso = "finalizado";
    }

    setConversacion((anterior) => [
      ...anterior,
      ...nuevosMensajes,
    ]);

    setPaso(siguientePaso);
    setMensaje("");
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">

        {/* ENCABEZADO */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mb-3 text-4xl">
            🤖
          </div>

          <h1 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
            Agente de Atención IA
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            Asistente inteligente para gestionar las reservas de tu restaurante.
          </p>
        </div>

        {/* ESTADO DEL ASISTENTE */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <span className="h-3 w-3 shrink-0 rounded-full bg-green-500 shadow-sm" />

          <div>
            <p className="text-sm font-bold text-green-800">
              Asistente activo
            </p>

            <p className="text-xs text-green-700">
              Disponible para recibir reservas
            </p>
          </div>
        </div>

        {/* CONTENEDOR DEL CHAT */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">

          {/* CABECERA DEL CHAT */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
            <h2 className="text-base font-bold text-gray-900">
              ReservAI
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Atención automática para tus clientes
            </p>
          </div>

          {/* CONVERSACIÓN */}
          <div className="h-[420px] overflow-y-auto bg-white p-4 sm:h-[480px] sm:p-5">
            <div className="space-y-4">
              {conversacion.map((item, index) => {
                const esIA = item.autor === "IA";

                return (
                  <div
                    key={index}
                    className={`flex ${
                      esIA ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                        esIA
                          ? "rounded-bl-md bg-gray-100 text-gray-900"
                          : "rounded-br-md bg-blue-600 text-white"
                      }`}
                    >
                      <p
                        className={`mb-1 text-xs font-bold ${
                          esIA
                            ? "text-gray-500"
                            : "text-blue-100"
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
              })}

              {guardando && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-500">
                    Guardando reserva...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ESCRIBIR MENSAJE */}
          <div className="border-t border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    enviarMensaje();
                  }
                }}
                placeholder="Escribe tu solicitud de reserva..."
                disabled={guardando}
                className="min-h-[52px] w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />

              <button
                onClick={enviarMensaje}
                disabled={guardando || !mensaje.trim()}
                className="min-h-[52px] w-full rounded-xl bg-blue-600 px-6 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
              >
                {guardando ? "Guardando..." : "Enviar"}
              </button>

            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              Escribe “quiero hacer una reserva” para comenzar.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}