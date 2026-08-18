"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export default function AtraccionPage() {
  
  const [videos, setVideos] = useState<any[]>([]);

useEffect(() => {
  async function cargarVideos() {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      

    console.log("DATA:", data);
    console.log("ERROR:", error);

    setVideos(data || []);
  }

  cargarVideos();
}, []);

const urls = (video: any) =>
  typeof video.urls === "string"
    ? JSON.parse(video.urls)
    : video.urls;
   
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          🎥 Módulo Atracción
        </h1>

        <p className="text-gray-600 mb-8">
          Aquí puedes ver todo el contenido que ShortBizAI está creando para atraer nuevos clientes.
        </p>

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">📹 Videos</h3>
            <p className="text-3xl font-bold mt-2">8 / 12</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">👥 Alcance</h3>
            <p className="text-3xl font-bold mt-2">25.340</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">▶️ Reproducciones</h3>
            <p className="text-3xl font-bold mt-2">18.900</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">💬 Mensajes</h3>
            <p className="text-3xl font-bold mt-2">126</p>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📅 Resumen del mes</h2>

          <p>✅ Videos publicados: <strong>8</strong></p>
          <p>📆 Próxima grabación: <strong>Viernes</strong></p>
          <p>🎯 Meta mensual: <strong>12 videos</strong></p>
          <p>🚀 Estado: <strong>En progreso</strong></p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            🎬 Biblioteca de Videos
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            {videos.map((video, index) => (
              <div
                key={index}
                className="border rounded-xl p-4"
              >
{urls(video)?.youtube && (
  
<a
  href={urls(video)?.youtube}
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src={`https://img.youtube.com/vi/${
      urls(video).youtube.split("/shorts/")[1]
    }/hqdefault.jpg`}
    alt={video.titulo}
    className="w-full h-52 object-cover rounded-lg mb-4 hover:opacity-90 cursor-pointer"
  />
</a>
)}

                <h3 className="font-bold text-lg">
                  {video.titulo}
                </h3>

                <p className="text-gray-500 mt-2">

{video.plataformas
  ?.replace("[", "")
  .replace("]", "")
  .replaceAll('"', "")
  .replaceAll(",", " • ")}

</p>

                <p className="mt-2 font-semibold">
                  {video.estado}
                </p>

  <div className="flex flex-wrap gap-2 mt-4">

  {urls(video)?.instagram && (
    <button
      onClick={() => window.open(urls(video).instagram, "_blank")}
      className="px-3 py-2 rounded-lg bg-pink-600 text-white"
    >
      📸 Instagram
    </button>
  )}

  {urls(video)?.tiktok && (
    <button
      onClick={() => window.open(urls(video).tiktok, "_blank")}
      className="px-3 py-2 rounded-lg bg-black text-white"
    >
      🎵 TikTok
    </button>
  )}

  {urls(video)?.facebook && (
    <button
      onClick={() => window.open(urls(video).facebook, "_blank")}
      className="px-3 py-2 rounded-lg bg-blue-600 text-white"
    >
      📘 Facebook
    </button>
  )}

  {urls(video)?.youtube && (
    <button
      onClick={() => window.open(urls(video).youtube, "_blank")}
      className="px-3 py-2 rounded-lg bg-red-600 text-white"
    >
      ▶️ YouTube
    </button>
  )}

</div>


<p className="text-sm text-gray-500 mt-1">
  📅 {video.fecha}
</p>
<div className="mt-3 text-sm text-gray-600 space-y-1">
  <p>👥 Alcance: {video.alcance?.toLocaleString()}</p>
  <p>▶️ Reproducciones: {video.reproducciones?.toLocaleString()}</p>
  <p>💬 Interacciones: {video.interacciones?.toLocaleString()}

<div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
  <p className="font-semibold text-blue-700">
    🤖 Recomendación IA ShortBizAI
  </p>

  <p className="text-sm text-gray-700 mt-1">
    Este video presenta un buen rendimiento. Se recomienda crear más contenido
    similar para aumentar el alcance y las reservas del restaurante.
  </p>
</div>

  </p>
</div>
              </div>
            ))}

          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">
            💡 Recomendación ShortBizAI
          </h2>

          <p>
            Los videos donde se muestra la preparación de los platos tienen
            mejor rendimiento. Recomendamos crear más contenido de cocina.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">

          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl">
            ➕ Solicitar nueva grabación
          </button>

          <button className="bg-green-600 text-white px-6 py-3 rounded-xl">
            📅 Solicitar reunión
          </button>

        </div>

      </div>
    </main>
  );
}