"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
export default function AgenteAtencionPage() {
  const [mensaje, setMensaje] = useState("");
  const [paso, setPaso] = useState("inicio");
  const [nombre, setNombre] = useState("");
const [telefono, setTelefono] = useState("");
const [fecha, setFecha] = useState("");
const [hora, setHora] = useState("");
const [personas, setPersonas] = useState("");
const [conversacion, setConversacion] = useState([
    
  {
    autor: "IA",
    texto: "¡Hola! Soy el asistente del restaurante. ¿En qué puedo ayudarte?",
  },
]);

async function enviarMensaje() {
  if (!mensaje.trim()) return;

  const texto = mensaje;

let guardarReserva = false;
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
      }
    } else if (paso === "nombre") {
        setNombre(texto);
  nuevaConversacion.push({
    autor: "IA",
    texto: `Mucho gusto, ${texto}. ¿Cuál es tu número de teléfono?`,
  });

  setPaso("telefono");

} else if (paso === "telefono") {
    setTelefono(texto);
  nuevaConversacion.push({
    autor: "IA",
    texto: "Perfecto. ¿Para qué fecha deseas la reserva?",
  });

  setPaso("fecha");
}else if (paso === "fecha") {
    setFecha(texto);
  nuevaConversacion.push({
    autor: "IA",
    texto: "Perfecto. ¿A qué hora deseas la reserva?",
  });

  setPaso("hora");

}else if (paso === "hora") {
    setHora(texto);
  nuevaConversacion.push({
    autor: "IA",
    texto: "Perfecto. ¿Para cuántas personas será la reserva?",
  });
setPaso("personas");

  } else if (paso === "personas") {
    setPersonas(texto);
    guardarReserva = true;
    alert("GuardarReserva = " + guardarReserva);

    nuevaConversacion.push({
      autor: "IA",
      texto: "✅ ¡Perfecto! Tu reserva ha sido registrada. En unos minutos recibirás la confirmación.",
    });

    setPaso("finalizado");
}

return nuevaConversacion;


  });


if (guardarReserva) {

  console.log({
  nombre,
  telefono,
  fecha,
  hora,
  personas: texto,
});

alert(
  JSON.stringify({
    nombre,
    telefono,
    fecha,
    hora,
    personas: texto,
  }, null, 2)
);
console.log("VOY A GUARDAR");

const { data, error } = await supabase
  .from("reservas")
  
  .insert([
    {
      cliente_nombre: nombre,
      telefono,
      fecha,
      hora,
      personas: texto,
    },
  ])
  .select();

console.log("DATA:", data);
console.log("ERROR:", error);

alert(JSON.stringify(error));



console.log(error);
console.log(data);
console.log("YA TERMINÉ EL INSERT");
console.log(data);
console.log(error);

  if (error) {
    console.error(error);
    alert(error.message);
  }
}
await fetch(
  `https://api.telegram.org/bot8848673785:AAFBESghDAq2KW7KBahQW9jiH9X221hcPOI/sendMessage`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: "-1004324063012",
      text: `
🍽 Nueva reserva

👤 ${nombre}
📞 ${telefono}
📅 ${fecha}
🕒 ${hora}
👥 ${texto}
      `,
    }),
  }
);
  setMensaje("");

}

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        🤖 Agente de Atención IA
      </h1>

      <div className="border rounded-lg p-4">
        <div className="border rounded p-3 h-64 overflow-y-auto mb-4 bg-gray-50">
  {conversacion.map((item, index) => (
    <div key={index} className="mb-2">
      <strong>{item.autor}:</strong> {item.texto}
    </div>
  ))}
</div>
        <input
          type="text"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="w-full border rounded p-2"
        />

        <button
  onClick={enviarMensaje}
  
  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
>
  Enviar
</button>

      </div>
    </div>
  );
}