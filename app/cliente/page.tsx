"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ClienteSidebar from "../components/ClienteSidebar";
export default function ClientePage() {
const [diagnostico, setDiagnostico] = useState<any>(null);
const [historial, setHistorial] = useState<any[]>([]);


useEffect(() => {
  const cargar = async () => {
    const { data } = await supabase
      .from("diagnosticos")
      .select(`
        *,
        empresas (
          nombre
        )
      `)
      .order("fecha", { ascending: false })
      .limit(1)
      .single();

    setDiagnostico(data);

    if (data?.empresa_id) {
  const { data: historialData } = await supabase
    .from("diagnosticos")
    .select("fecha, puntaje")
    .eq("empresa_id", data.empresa_id)
    .order("fecha", { ascending: true });

  setHistorial(historialData || []);
}
  };

  cargar();
}, []);

const datosGrafica = historial.map((item) => ({
  fecha: new Date(item.fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  }),
  puntaje: item.puntaje,
}));

  return (
<div className="flex min-h-screen bg-gray-100">
  <ClienteSidebar />

  <main className="flex-1 p-8">
      <h1 className="text-4xl font-bold mb-2">
  📈 {diagnostico?.empresas?.nombre || "Centro de Crecimiento AAF"}
</h1>

<p className="text-gray-600 mb-8">
  Bienvenido al Portal del Cliente.
</p>

      {/* Tarjetas superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">📹 Videos Publicados</h2>
          <p className="text-3xl font-bold mt-2">8 / 12</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">💬 Mensajes Atendidos</h2>
          <p className="text-3xl font-bold mt-2">126</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">⭐ Nuevas Reseñas</h2>
          <p className="text-3xl font-bold mt-2">18</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">📈 Índice ShortBizAI</h2>

          <p className="text-3xl font-bold mt-2">
  {diagnostico?.puntaje ?? "--"} / 100
</p>

        </div>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Atracción</p>
    <p className="text-3xl font-bold">
      {diagnostico?.atraccion}
    </p>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Atención</p>
    <p className="text-3xl font-bold">
      {diagnostico?.atencion}
    </p>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Fidelización</p>
    <p className="text-3xl font-bold">
      {diagnostico?.fidelizacion}
    </p>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Inteligencia</p>
    <p className="text-3xl font-bold">
      {diagnostico?.inteligencia}
    </p>
  </div>

</div>

<div className="bg-white rounded-xl shadow p-6 mb-8">

  <h2 className="text-2xl font-bold mb-4">
    📋 Diagnóstico ShortBizAI
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    <div>
      <p className="text-gray-500">Nivel</p>
      <p className="text-2xl font-bold">
        {diagnostico?.nivel}
      </p>
    </div>



    <div>
      <p className="text-gray-500">Fecha del diagnóstico</p>
      <p className="text-2xl font-bold">
        {diagnostico?.fecha
  ? new Date(diagnostico.fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  : "--"}

  
      </p>
      
    </div>

  </div>
</div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow p-6 mb-8">

  <h3 className="text-lg font-semibold mb-4">
    💡 Oportunidades de mejora
  </h3>

  <ul className="space-y-3">
    {diagnostico?.oportunidades?.map((op: string, index: number) => (
      <li key={index} className="flex items-start gap-3">
        <span className="text-green-600 font-bold">✔</span>
        <span className="text-gray-700">{op}</span>
      </li>
    ))}
  </ul>



</div>

<div className="bg-white rounded-xl shadow p-6 mb-8">
  <h2 className="text-xl font-bold mb-4">
    📈 Evolución del Índice ShortBizAI
  </h2>

  <div style={{ width: "100%", height: 300 }}>
    <ResponsiveContainer>
      <LineChart data={datosGrafica}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fecha" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="puntaje"
          stroke="#2563eb"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            🚀 Lo que hicimos esta semana
          </h2>

          <ul className="space-y-3">
            <li>✅ Publicamos 5 videos en redes sociales.</li>
            <li>✅ Respondimos 48 mensajes.</li>
            <li>✅ Actualizamos Google Business.</li>
            <li>✅ Solicitamos nuevas reseñas.</li>
            <li>✅ Creamos contenido para la próxima campaña.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            📅 Próximas acciones
          </h2>

          <ul className="space-y-3">
            <li>🎥 Grabar nuevos platos.</li>
            <li>📱 Publicar 4 Reels.</li>
            <li>🤖 Optimizar respuestas automáticas.</li>
            <li>⭐ Conseguir nuevas reseñas.</li>
            <li>📢 Preparar la campaña del mes.</li>
          </ul>
        </div>

      </div>

      {/* Recomendación */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          💡 Recomendación ShortBizAI
        </h2>

        <p>
          Los videos donde aparece el chef preparando los platos generan
          más interacción que las fotografías. Recomendamos crear más
          contenido de este tipo durante las próximas semanas.
        </p>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          📈 Resultados del Mes
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          <div>
            <p className="text-gray-500">Alcance</p>
            <p className="text-2xl font-bold">25.340</p>
          </div>

          <div>
            <p className="text-gray-500">Reproducciones</p>
            <p className="text-2xl font-bold">18.900</p>
          </div>

          <div>
            <p className="text-gray-500">Seguidores</p>
            <p className="text-2xl font-bold">320</p>
          </div>

          <div>
            <p className="text-gray-500">Mensajes</p>
            <p className="text-2xl font-bold">126</p>
          </div>

          <div>
            <p className="text-gray-500">Cómo llegar</p>
            <p className="text-2xl font-bold">84</p>
          </div>

          <div>
            <p className="text-gray-500">Reseñas</p>
            <p className="text-2xl font-bold">18</p>
          </div>

        </div>
      </div>

    </main> </div>
  );
}