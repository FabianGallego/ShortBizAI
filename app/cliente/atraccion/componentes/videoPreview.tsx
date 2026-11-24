"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  VideoScene,
  VideoSceneTextPosition,
  VideoSceneTransition,
} from "../lib/videoScenes";

type VideoPreviewProps = {
  scenes: VideoScene[];
  businessName?: string;
  reservationUrl?: string;
};

export default function VideoPreview({
  scenes,
  businessName = "",
  reservationUrl = "",
}: VideoPreviewProps) {
  const [currentScene, setCurrentScene] =
    useState(0);

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const totalDuration = useMemo(
    () =>
      scenes.reduce(
        (total, scene) =>
          total + scene.duration,
        0
      ),
    [scenes]
  );

  // Reproduce una escena a la vez y avanza cuando termina su duración.
  useEffect(() => {
    if (!playing || scenes.length === 0) return;

    const interval = window.setInterval(() => {
      setElapsed((previous) => previous + 0.05);
    }, 50);

    return () => window.clearInterval(interval);
  }, [playing, scenes.length]);

  useEffect(() => {
    if (!playing || scenes.length === 0) return;
    const duration = Math.max(0.1, scenes[currentScene]?.duration ?? 2);
    if (elapsed >= duration) {
      setElapsed(0);
      setCurrentScene((index) => (index + 1) % scenes.length);
    }
  }, [elapsed, playing, currentScene, scenes]);

  if (scenes.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Vista previa
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          La vista previa aparecerá cuando hayas creado al menos una escena.
        </p>
      </section>
    );
  }

  const scene = scenes[currentScene];

  const obtenerPosicionTexto = (
    position?: VideoSceneTextPosition
  ) => {
    switch (position) {
      case "top":
        return "top-24";

      case "center":
        return "top-1/2 -translate-y-1/2";

      case "bottom":
      default:
        return "bottom-6";
    }
  };

  const obtenerTransicion = (
    transition?: VideoSceneTransition
  ) => {
    switch (transition) {
      case "slide-left":
        return "animate-[slideLeft_0.6s_ease-out]";

      case "slide-right":
        return "animate-[slideRight_0.6s_ease-out]";

      case "crossfade":
        return "animate-[fadeIn_0.6s_ease-out]";

      case "fade":
      default:
        return "animate-[fadeIn_0.6s_ease-out]";
    }
  };

  const avanzarEscena = () => {
    setElapsed(0);
    setCurrentScene((previous) =>
      previous >= scenes.length - 1 ? 0 : previous + 1
    );
  };

  const retrocederEscena = () => {
    setElapsed(0);
    setCurrentScene((previous) =>
      previous <= 0 ? scenes.length - 1 : previous - 1
    );
  };

  const alternarReproduccion = () => {
    setElapsed(0);
    setPlaying((previous) => !previous);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* =====================================================
          CABECERA
      ===================================================== */}

      <div className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Previsualización
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              🎬 Vista previa del Short
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Revisa las escenas antes de generar el video final.
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
            <p className="text-xs font-medium text-blue-600">
              Duración
            </p>

            <p className="text-lg font-black text-blue-700">
              {totalDuration.toFixed(1)} s
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          PREVIEW
      ===================================================== */}

      <div className="flex flex-col items-center">
        <div className="relative aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-3xl bg-black shadow-2xl">
          {/* IMAGEN */}

          <img
            key={`${scene.id}-${currentScene}`}
            src={scene.imageUrl}
            alt={`Vista previa de la escena ${currentScene + 1}`}
            className={`absolute inset-0 h-full w-full object-cover ${obtenerTransicion(
              scene.transition
            )}`}
          />

          {/* OVERLAY */}

          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />

          {/* BRANDING */}

          <div className="absolute left-4 right-4 top-5">
            <div className="inline-flex rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              SHORTBIZAI
            </div>
          </div>

          {/* INDICADOR DE ESCENA */}

          <div className="absolute right-4 top-5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            {currentScene + 1}/{scenes.length}
          </div>

          {/* CONTENIDO: solo el mensaje propio de esta escena */}
          {(() => {
            const duracion = Math.max(0.1, scene.duration);
            const fundido = Math.min(0.6, duracion / 4);
            const opacidadEntrada = Math.min(1, elapsed / fundido);
            const opacidadSalida = Math.min(1, Math.max(0, (duracion - elapsed) / fundido));
            const opacidad = playing ? Math.min(opacidadEntrada, opacidadSalida) : 1;

            return scene.title?.trim() ? (
              <div
                key={`${scene.id}-texto`}
                className={`absolute left-4 right-4 text-center text-white ${obtenerPosicionTexto(scene.textPosition)}`}
                style={{ opacity: 1, transition: "opacity 0.6s ease-in-out" }}
              >
                <h3 className={`drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] leading-tight ${
                  scene.emphasis === "strong"
                    ? "text-3xl font-black"
                    : scene.emphasis === "subtle"
                    ? "text-xl font-bold"
                    : "text-2xl font-extrabold"
                }`}>
                  {scene.title}
                </h3>
              </div>
            ) : null;
          })()}

          {/* PROGRESO */}

          <div className="absolute bottom-2 left-4 right-4">
            <div className="h-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{
                  width: `${
                    ((currentScene + 1) /
                      scenes.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTROLES
        ===================================================== */}

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={retrocederEscena}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ←
          </button>

          <button
            type="button"
            onClick={alternarReproduccion}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            {playing ? "⏸ Pausar" : "▶ Reproducir"}
          </button>

          <button
            type="button"
            onClick={avanzarEscena}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            →
          </button>
        </div>

        {/* =====================================================
            ESCENAS
        ===================================================== */}

        <div className="mt-5 grid w-full max-w-[360px] grid-cols-5 gap-2">
          {scenes.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setElapsed(0);
                setCurrentScene(index);
              }}
              className={`relative aspect-[9/16] overflow-hidden rounded-lg border-2 transition ${
                index === currentScene
                  ? "border-blue-600 ring-2 ring-blue-100"
                  : "border-transparent"
              }`}
            >
              <img
                src={item.imageUrl}
                alt={`Escena ${index + 1}`}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-x-1 bottom-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">
                {index + 1}
              </div>
            </button>
          ))}
        </div>

        {/* =====================================================
            INFORMACIÓN DE LA ESCENA
        ===================================================== */}

        <div className="mt-5 w-full max-w-[360px] rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">
              Escena {currentScene + 1}
            </p>

            <p className="text-xs font-semibold text-blue-600">
              {scene.duration.toFixed(1)} s
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white p-2">
              <p className="text-[10px] font-bold uppercase text-gray-400">
                Rol
              </p>

              <p className="mt-1 text-xs font-semibold capitalize text-gray-700">
                {scene.role ?? "product"}
              </p>
            </div>

            <div className="rounded-lg bg-white p-2">
              <p className="text-[10px] font-bold uppercase text-gray-400">
                Movimiento
              </p>

              <p className="mt-1 text-xs font-semibold text-gray-700">
                {scene.animation}
              </p>
            </div>

            <div className="rounded-lg bg-white p-2">
              <p className="text-[10px] font-bold uppercase text-gray-400">
                Transición
              </p>

              <p className="mt-1 text-xs font-semibold text-gray-700">
                {scene.transition ?? "fade"}
              </p>
            </div>

            <div className="rounded-lg bg-white p-2">
              <p className="text-[10px] font-bold uppercase text-gray-400">
                Texto
              </p>

              <p className="mt-1 text-xs font-semibold text-gray-700">
                {scene.textPosition ?? "bottom"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            RESUMEN
        ===================================================== */}

        <div className="mt-5 w-full max-w-[360px] rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-gray-900">
            {scenes.length === 1
              ? "1 escena preparada"
              : `${scenes.length} escenas preparadas`}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            {totalDuration.toFixed(1)} segundos · 1080 × 1920 ·
            Instagram · TikTok · YouTube Shorts
          </p>
        </div>
      </div>
    </section>
  );
}