"use client";

import { useEffect, useMemo } from "react";
import {
  createShortScenes,
  type VideoSceneInput,
  type VideoSceneRole,
  type VideoSceneAnimation,
  type VideoSceneTransition,
  type VideoSceneTextPosition,
} from "../lib/videoScenes";

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type SceneBuilderProps = {
  images: File[];
  prompt: string;
  duration: string;
  title: string;
  description: string;
  offer: string;
  price: string;
  cta: string;
  onScenesReady?: (
    scenes: ReturnType<typeof createShortScenes>
  ) => void;
};

function detectarRol(
  index: number,
  total: number,
  prompt: string,
  offer: string,
  cta: string
): VideoSceneRole {
  const instrucciones =
    normalizarTexto(prompt);

  /*
   * Si el propietario menciona explícitamente
   * la oferta al principio, hacemos que una
   * escena inicial tenga ese papel.
   */
  const ofertaPrimero =
    instrucciones.includes(
      "oferta al principio"
    ) ||
    instrucciones.includes(
      "promocion al principio"
    ) ||
    instrucciones.includes(
      "descuento al principio"
    );

  if (
    ofertaPrimero &&
    index === 0 &&
    offer
  ) {
    return "offer";
  }

  if (index === 0) {
    return "hook";
  }

  if (index === total - 1) {
    return "cta";
  }

  /*
   * Si hay una oferta, una escena intermedia
   * se dedica a destacarla.
   */
  if (
    offer &&
    index === Math.min(2, total - 1)
  ) {
    return "offer";
  }

  return "product";
}

function detectarAnimacion(
  index: number,
  role: VideoSceneRole,
  prompt: string
): VideoSceneAnimation {
  const instrucciones =
    normalizarTexto(prompt);

  if (
    instrucciones.includes(
      "zoom"
    )
  ) {
    return "zoom-in";
  }

  if (
    instrucciones.includes(
      "desplazamiento a la izquierda"
    ) ||
    instrucciones.includes(
      "mueve a la izquierda"
    )
  ) {
    return "pan-left";
  }

  if (
    instrucciones.includes(
      "desplazamiento a la derecha"
    ) ||
    instrucciones.includes(
      "mueve a la derecha"
    )
  ) {
    return "pan-right";
  }

  if (role === "hook") {
    return "zoom-in";
  }

  if (role === "offer") {
    return "zoom-in";
  }

  if (role === "cta") {
    return "zoom-out";
  }

  return index % 2 === 0
    ? "pan-right"
    : "pan-left";
}

function detectarTransicion(
  index: number,
  role: VideoSceneRole,
  prompt: string
): VideoSceneTransition {
  const instrucciones =
    normalizarTexto(prompt);

  if (
    instrucciones.includes(
      "transicion suave"
    ) ||
    instrucciones.includes(
      "transiciones suaves"
    )
  ) {
    return "crossfade";
  }

  if (
    instrucciones.includes(
      "desliza a la izquierda"
    )
  ) {
    return "slide-left";
  }

  if (
    instrucciones.includes(
      "desliza a la derecha"
    )
  ) {
    return "slide-right";
  }

  if (role === "hook") {
    return "fade";
  }

  if (role === "cta") {
    return "fade";
  }

  return index % 2 === 0
    ? "crossfade"
    : "fade";
}

function detectarPosicionTexto(
  role: VideoSceneRole,
  prompt: string
): VideoSceneTextPosition {
  const instrucciones =
    normalizarTexto(prompt);

  if (
    instrucciones.includes(
      "texto arriba"
    ) ||
    instrucciones.includes(
      "texto en la parte superior"
    )
  ) {
    return "top";
  }

  if (
    instrucciones.includes(
      "texto en el centro"
    )
  ) {
    return "center";
  }

  if (
    instrucciones.includes(
      "texto abajo"
    ) ||
    instrucciones.includes(
      "texto en la parte inferior"
    )
  ) {
    return "bottom";
  }

  if (role === "hook") {
    return "center";
  }

  if (role === "offer") {
    return "center";
  }

  return "bottom";
}

function detectarEnfasis(
  role: VideoSceneRole,
  prompt: string
): "subtle" | "normal" | "strong" {
  const instrucciones =
    normalizarTexto(prompt);

  if (
    instrucciones.includes(
      "poco movimiento"
    ) ||
    instrucciones.includes(
      "movimiento suave"
    ) ||
    instrucciones.includes(
      "muy elegante"
    )
  ) {
    return "subtle";
  }

  if (
    instrucciones.includes(
      "llamativo"
    ) ||
    instrucciones.includes(
      "impactante"
    ) ||
    instrucciones.includes(
      "mucho movimiento"
    ) ||
    instrucciones.includes(
      "energetico"
    )
  ) {
    return "strong";
  }

  if (role === "hook") {
    return "strong";
  }

  if (role === "offer") {
    return "strong";
  }

  return "normal";
}

export default function SceneBuilder({
  images,
  prompt,
  duration,
  title,
  description,
  offer,
  price,
  cta,
  onScenesReady,
}: SceneBuilderProps) {
  const imageUrls = useMemo(() => {
    return images.map((image) =>
      URL.createObjectURL(image)
    );
  }, [images]);

  const totalDuration =
    Number(duration) || 15;

  const scenes = useMemo(() => {
    const totalImages =
      imageUrls.length;

    // Construye una secuencia de mensajes: cada fotografía recibe
    // un único texto, en lugar de repetir todos los campos en todas.
    const contexto = normalizarTexto(
      `${prompt} ${title} ${description} ${offer}`
    );

    const esViajeWashington =
      contexto.includes("washington") ||
      contexto.includes("anditrans");

    const mensajesViaje = [
      "ESCÁPATE A WASHINGTON",
      "VEN Y DISFRUTA",
      "DESCUBRE UNA CIUDAD LLENA DE HISTORIA",
      "UNA NOCHE DE HOTEL INCLUIDA",
      "ALMUERZO BUFFET INCLUIDO",
      "24 Y 25 DE OCTUBRE",
      "$360 POR PERSONA",
      "RESERVAS: 929-599-8459",
    ];

    const frasesDescripcion = description
      .split(/\n+|(?<=[.!?])\s+/)
      .map((frase) => frase.trim())
      .filter(Boolean);

    const mensajesGenericos = [
      title.trim(),
      ...frasesDescripcion,
      offer.trim(),
      price.trim(),
      cta.trim(),
    ].filter(Boolean).filter((mensaje, index, lista) =>
      lista.findIndex((otro) => normalizarTexto(otro) === normalizarTexto(mensaje)) === index
    );

    const mensajes = esViajeWashington
      ? mensajesViaje
      : mensajesGenericos;

    const inputs: VideoSceneInput[] = imageUrls.map(
      (imageUrl, index) => {
        const role = detectarRol(
          index,
          totalImages,
          prompt,
          offer,
          cta
        );
        const mensaje = mensajes[index] ?? "";

        return {
          imageUrl,
          // El título es el único texto que se pinta en esta escena.
          title: mensaje,
          description: "",
          offer: "",
          price: "",
          cta: "",
          role,
          animation: detectarAnimacion(index, role, prompt),
          transition: detectarTransicion(index, role, prompt),
          textPosition: detectarPosicionTexto(role, prompt),
          emphasis: detectarEnfasis(role, prompt),
        };
      }
    );

    return createShortScenes(
      inputs,
      totalDuration
    );
  }, [
    imageUrls,
    prompt,
    title,
    description,
    offer,
    price,
    cta,
    totalDuration,
  ]);

  useEffect(() => {
    onScenesReady?.(scenes);
  }, [
    scenes,
    onScenesReady,
  ]);

  if (scenes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm font-medium text-gray-700">
          Todavía no hay escenas.
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Sube al menos una foto para construir el Short.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {scenes.map((scene, index) => (
          <article key={scene.id} className="overflow-hidden rounded-xl bg-gray-100">
            <div className="aspect-[9/16] overflow-hidden">
              <img
                src={scene.imageUrl}
                alt={`Foto original ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
