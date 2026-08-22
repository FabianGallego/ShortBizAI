"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

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

  // Ejemplo: agosto 10 de 2026
  let m = texto.match(/^([a-zñ]+)\s+(\d{1,2})\s+de\s+(\d{4})$/);

  if (m) {
    const mes = meses[m[1]];

    if (!mes) return null;

    return `${m[3]}-${mes}-${m[2].padStart(2, "0")}`;
  }

  // Ejemplo: 10 de agosto de 2026
  m = texto.match(/^(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4})$/);

  if (m) {
    const mes = meses[m[2]];

    if (!mes) return null;

    return `${m[3]}-${mes}-${m[1].padStart(2, "0")}`;
  }

  return null;
}

function convertirHora(hora: string): string | null {
  const texto = hora.toLowerCase().trim();

  // Ejemplo: 2 pm
  let m = texto.match(/^(\d{1,2})\s*(am|pm)$/);

  if (m) {
    let h = parseInt(m[1], 10);
    const periodo = m[2];

    if (h < 1 || h > 12) return null;

    if (periodo === "pm" && h !== 12) h += 12;
    if (periodo === "am" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:00`;
  }

  // Ejemplo: 2:30 pm
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

  // Ejemplo: 14:00
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

export default function AgenteAAFPage() {
  const [mensaje, setMensaje] = useState("");
  const [paso, setPaso] = useState("inicio");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState("");

  const [conversacion, setConversacion] = useState<Mensaje[]>([
    {
      autor: "ReservAI",
      texto:
        "👋 ¡Bienvenido(a)! Estoy listo para ayudarte a reservar una mesa, consultar disponibilidad o responder cualquier inquietud. ¿En qué puedo ayudarte hoy?",
    },
  ]);

  const [guardando, setGuardando] = useState(false);

  async function enviarMensaje() {
    if (!mensaje.trim() || guardando) return;

    const texto = mensaje.trim();

    setConversacion((anterior) => [
      ...anterior,
      {
        autor: "Cliente",
        texto,
      },
    ]);

    setMensaje("");

    if (paso === "inicio") {
      if (
        texto.toLowerCase().includes("reserva") ||
        texto.toLowerCase().includes("mesa")
      ) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "ReservAI",
            texto:
              "¡Con mucho gusto! ¿A nombre de quién hago la reserva?",
          },
        ]);

        setPaso("nombre");
      } else {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "ReservAI",
            texto:
              "Puedo ayudarte a realizar una reserva. Solo escribe “quiero una reserva”.",
          },
        ]);
      }

      return;
    }

    if (paso === "nombre") {
      setNombre(texto);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor: "ReservAI",
          texto: "¿Cuál es tu número de teléfono?",
        },
      ]);

      setPaso("telefono");
      return;
    }

    if (paso === "telefono") {
      if (!/^\d{10}$/.test(texto)) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "ReservAI",
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
          autor: "ReservAI",
          texto: "¿Para qué fecha deseas la reserva?",
        },
      ]);

      setPaso("fecha");
      return;
    }

    if (paso === "fecha") {
      const fechaConvertida = convertirFecha(texto);

      if (!fechaConvertida) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "ReservAI",
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
          autor: "ReservAI",
          texto: "¿A qué hora deseas la reserva?",
        },
      ]);

      setPaso("hora");
      return;
    }

    if (paso === "hora") {
      const horaConvertida = convertirHora(texto);

      if (!horaConvertida) {
        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "ReservAI",
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
          autor: "ReservAI",
          texto: "¿Para cuántas personas será la reserva?",
        },
      ]);

      setPaso("personas");
      return;
    }

    if (paso === "personas") {
      setPersonas(texto);
      setPaso("confirmado");
      setGuardando(true);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor: "ReservAI",
          texto: "✅ Guardando tu reserva...",
        },
      ]);

      const fechaConvertida = convertirFecha(fecha);
      const horaConvertida = convertirHora(hora);

      const { data, error } = await supabase
        .from("reservas")
        .insert([
          {
            cliente_nombre: nombre,
            telefono,
            fecha: fechaConvertida,
            hora: horaConvertida,
            personas: texto,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("ERROR AL GUARDAR:", error);

        setGuardando(false);

        setConversacion((anterior) => [
          ...anterior,
          {
            autor: "ReservAI",
            texto:
              "❌ No pude guardar la reserva. Por favor, inténtalo nuevamente.",
          },
        ]);

        setPaso("inicio");
        return;
      }

      try {
        await fetch(
          "https://api.telegram.org/bot8848673785:AAEPLTJ5B-CF_lFPFuA4156JvE2Rgf15MNc/sendMessage",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: "-1004324063012",
              text: `🍽️ Nueva reserva

👤 Cliente: ${nombre}
📞 Teléfono: ${telefono}
📅 Fecha: ${fecha}
🕒 Hora: ${hora}
👥 Personas: ${texto}`,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "✅ Confirmar",
                      callback_data: `confirmar_${data.id}`,
                    },
                    {
                      text: "❌ Cancelar",
                      callback_data: `cancelar_${data.id}`,
                    },
                  ],
                ],
              },
            }),
          }
        );
      } catch (telegramError) {
        console.error(
          "Error enviando la reserva a Telegram:",
          telegramError
        );
      }

      setGuardando(false);

      setConversacion((anterior) => [
        ...anterior,
        {
          autor: "ReservAI",
          texto:
            "🎉 ¡Reserva registrada correctamente! En unos minutos recibirás la confirmación.",
        },
      ]);

      setTimeout(() => {
        setConversacion([
          {
            autor: "ReservAI",
            texto:
              "👋 Bienvenido a ShortBizAI. Escribe “quiero una reserva” para comenzar.",
          },
        ]);

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
    <main className="min-h-screen w-full bg-white text-gray-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ENCABEZADO */}
        <header className="mb-6 border-b border-gray-200 pb-5 sm:mb-8 sm:pb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* TÍTULO */}
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

            {/* LOGO */}
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

        {/* CHAT */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* CABECERA */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-gray-950">
              ReservAI
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Asistente virtual para reservas y disponibilidad.
            </p>
          </div>

          {/* CONVERSACIÓN */}
          <div className="h-[420px] overflow-y-auto bg-white p-4 sm:h-[500px] sm:p-6">

            <div className="space-y-4">

              {conversacion.map((item, index) => {
                const esCliente = item.autor === "Cliente";

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

          {/* CAMPO DE MENSAJE */}
          <div className="border-t border-gray-200 bg-white p-4 sm:p-6">

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    enviarMensaje();
                  }
                }}
                disabled={guardando}
                className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                placeholder="Escribe tu solicitud de reserva"
              />

              <button
                onClick={enviarMensaje}
                disabled={guardando || !mensaje.trim()}
                className="min-h-[54px] w-full rounded-xl bg-blue-600 px-6 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
              >
                {guardando
                  ? "Guardando..."
                  : "Consultar Disponibilidad"}
              </button>

            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              Escribe “quiero una reserva” para comenzar.
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}