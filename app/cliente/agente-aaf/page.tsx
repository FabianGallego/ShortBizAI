"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

function convertirHora(hora: string) {
  const texto = hora.trim().toLowerCase();

  const match = texto.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);

  if (!match) return hora;

  let horas = parseInt(match[1], 10);
  const minutos = match[2] || "00";
  const periodo = match[3];

  if (periodo === "pm" && horas < 12) horas += 12;
  if (periodo === "am" && horas === 12) horas = 0;

  return `${String(horas).padStart(2, "0")}:${minutos}:00`;
}
function convertirFecha(fecha: string) {
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

  const match = texto.match(/(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4})/);

  if (!match) return fecha;

  const dia = match[1].padStart(2, "0");
  const mes = meses[match[2]];
  const anio = match[3];

  if (!mes) return fecha;

  return `${anio}-${mes}-${dia}`;
}
export default function AgenteAAFPage() {
  const [mensaje, setMensaje] = useState("");
const [paso, setPaso] = useState("inicio");

const [nombre, setNombre] = useState("");
const [telefono, setTelefono] = useState("");
const [fecha, setFecha] = useState("");
const [hora, setHora] = useState("");
const [personas, setPersonas] = useState("");


  const [conversacion, setConversacion] = useState([
    {
      autor: "ReservAI",
      texto: "👋 ¡Bienvenido(a)!  Estoy listo para ayudarte a reservar una mesa, consultar disponibilidad o responder cualquier inquietud. ¿En qué puedo ayudarte hoy?",
    },
  ]);

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

  // agosto 10 de 2026
  let m = texto.match(/^([a-zñ]+)\s+(\d{1,2})\s+de\s+(\d{4})$/);

  if (m) {
    return `${m[3]}-${meses[m[1]]}-${m[2].padStart(2, "0")}`;
  }

  // 10 de agosto de 2026
  m = texto.match(/^(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4})$/);

  if (m) {
    return `${m[3]}-${meses[m[2]]}-${m[1].padStart(2, "0")}`;
  }

  return null;
}

function convertirHora(hora: string): string | null {

  const texto = hora.toLowerCase().trim();

  // Ejemplo: 2 pm
  let m = texto.match(/^(\d{1,2})\s*(am|pm)$/);

  if (m) {
    let h = parseInt(m[1]);
    const periodo = m[2];

    if (h < 1 || h > 12) return null;

    if (periodo === "pm" && h !== 12) h += 12;
    if (periodo === "am" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:00`;
  }

  // Ejemplo: 2:30 pm
  m = texto.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);

  if (m) {
    let h = parseInt(m[1]);
    const minutos = m[2];
    const periodo = m[3];

    if (h < 1 || h > 12) return null;

    if (periodo === "pm" && h !== 12) h += 12;
    if (periodo === "am" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${minutos}`;
  }

  return null;
}
async function enviarMensaje() {
  if (!mensaje.trim()) return;

  const texto = mensaje;

  setConversacion((anterior) => {
    const nuevaConversacion = [
      ...anterior,
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

        nuevaConversacion.push({
          autor: "IA",
          texto: "¡Con mucho gusto! ¿A nombre de quién hago la reserva?",
        });


        setPaso("nombre");

      } else {

        nuevaConversacion.push({
          autor: "IA",
          texto: "Puedo ayudarte a realizar una reserva. Solo escribe 'quiero una reserva'.",
        });

      }
    }

    if (paso === "nombre") {

      setNombre(texto);

      nuevaConversacion.push({
        autor: "IA",
        texto: "¿Cuál es tu número de teléfono?",
      });

      setPaso("telefono");
    }


if (paso === "telefono") {

  if (!/^\d{10}$/.test(texto)) {
    nuevaConversacion.push({
      autor: "IA",
      texto: "❌ El teléfono debe tener 10 dígitos. Inténtalo nuevamente.",
    });

    return nuevaConversacion;
  }

  setTelefono(texto);

  nuevaConversacion.push({
    autor: "IA",
    texto: "¿Para qué fecha deseas la reserva?",
  });

  setPaso("fecha");
}

if (paso === "fecha") {

  const fechaConvertida = convertirFecha(texto);

  if (!fechaConvertida) {
    nuevaConversacion.push({
      autor: "IA",
      texto: "❌ Fecha inválida. Ejemplo: 10 de agosto de 2026.",
    });

    return nuevaConversacion;
  }

  setFecha(texto);

  nuevaConversacion.push({
    autor: "IA",
    texto: "¿A qué hora deseas la reserva?",
  });

  setPaso("hora");
}
if (paso === "hora") {

  const horaConvertida = convertirHora(texto);

  if (!horaConvertida) {
    nuevaConversacion.push({
      autor: "IA",
      texto: "❌ Hora inválida. Escribe, por ejemplo: 2 pm, 2:30 pm o 14:00.",
    });

    return nuevaConversacion;
  }

  setHora(texto);

  nuevaConversacion.push({
    autor: "IA",
    texto: "¿Para cuántas personas será la reserva?",
  });

  setPaso("personas");
}


    return nuevaConversacion;
  });

  setMensaje("");

if (paso === "personas") {

  setPersonas(texto);

  setPaso("confirmado");

  setConversacion((anterior) => [
  ...anterior,
  {
    autor: "IA",
    texto: "✅ Guardando tu reserva...",
  },
]);


  setTimeout(async () => {
console.log("===== INSERTANDO RESERVA =====");
    const { data, error } = await supabase
  .from("reservas")
  .insert([
    {
      cliente_nombre: nombre,
      telefono,
      fecha: convertirFecha(fecha),
      hora: convertirHora(hora),
      personas: texto,
    },
  ])
  .select()
  .single();


    if (error) {

      alert(JSON.stringify(error, null, 2));
      console.log(error);

    } else {

      await fetch("https://api.telegram.org/bot8848673785:AAEPLTJ5B-CF_lFPFuA4156JvE2Rgf15MNc/sendMessage", {
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
      });

      console.log("Reserva guardada y enviada a Telegram");
console.log("Reserva guardada y enviada a Telegram");

setTimeout(() => {
  setConversacion([
    {
      autor: "IA",
      texto: "👋 Bienvenido a ShortBizAI. Escribe 'quiero una reserva' para comenzar.",
    },
  ]);

  setPaso("inicio");
  setNombre("");
  setTelefono("");
  setFecha("");
  setHora("");
  setPersonas("");
  setMensaje("");
}, 3000);
    }

  }, 100);

}

  
}

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 border-b pb-4 mb-6">



  <div className="flex items-center justify-between border-b pb-4 mb-6 w-full">

  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      Centro de Reservas
    </h1>

    <p className="text-green-600 text-sm mt-1">
      🟢 Asistente inteligente disponible 24/7
    </p>
  </div>

  <Image
    src="/logo-foodshortai.png"
    alt="ShortBizAI"
    width={235}
    height={235}
    className="object-contain"
  />

</div>

</div>

      <div className="border rounded-lg p-4">

        <div className="border rounded p-3 h-64 overflow-y-auto mb-4 bg-gray-50">
          {conversacion.map((item, index) => (
            <div key={index}>
              <strong>{item.autor}:</strong> {item.texto}
            </div>
          ))}
        </div>

        <input
  value={mensaje}
  onChange={(e) => setMensaje(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      enviarMensaje();
    }
  }}
  className="w-full border rounded p-2"
  placeholder="Escribe tu solicitud de reserva"
/>

        <button
          onClick={enviarMensaje}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Consultar Disponibilidad
        </button>

      </div>
    </div>
  );
}