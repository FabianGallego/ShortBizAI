
"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export type VideoSourceType = "poster" | "single-image" | "multiple-images" | "video";

export type VideoFormData = {
  sourceType: VideoSourceType;
  images: File[];
  videoFiles: File[];
  // Se conserva temporalmente por compatibilidad con código anterior.
  videoFile: File | null;
  prompt: string;
  duration: string;
  title: string;
  description: string;
  offer: string;
  price: string;
  cta: string;
  style: string;
  platform: string;
};

type VideoFormProps = {
  initialBusinessName?: string;
  initialReservationUrl?: string;
  onSubmit?: (data: VideoFormData) => void;
};

const MAX_VIDEO_FILES = 5;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const EXAMPLE_PROMPTS = [
  "Crea un comercial cinematográfico que muestre lo más atractivo de nuestro negocio y termine con una invitación a contactarnos.",
  "Haz un video moderno para Instagram. Usa movimientos de cámara elegantes y una presentación visual impactante.",
  "Quiero un anuncio premium que cuente una pequeña historia visual y destaque la experiencia que ofrecemos.",
  "Crea una pieza publicitaria dinámica para redes sociales, con una apertura llamativa y un cierre memorable.",
];

export default function VideoForm({
  initialBusinessName = "",
  initialReservationUrl = "",
  onSubmit,
}: VideoFormProps) {
  const [sourceType, setSourceType] =
    useState<VideoSourceType>("video");

  const [images, setImages] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("15");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [offer, setOffer] = useState("");
  const [price, setPrice] = useState("");
  const [cta, setCta] = useState("");
  const [style, setStyle] = useState("Premium");
  const [platform, setPlatform] = useState(
    "Instagram + TikTok + YouTube Shorts"
  );

  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    const urls = videoFiles.map((file) => URL.createObjectURL(file));
    setVideoPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [videoFiles]);

  function handleSourceTypeChange(nextType: VideoSourceType) {
    setSourceType(nextType);
    setImages([]);
    setVideoFiles([]);
  }

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selected.length === 0) return;

    const valid: File[] = [];

    for (const file of selected) {
      if (!file.type.startsWith("video/")) {
        alert(`${file.name}: el archivo no es un video válido.`);
        return;
      }

      if (file.size > MAX_VIDEO_BYTES) {
        alert(`${file.name}: supera el límite de 100 MB.`);
        return;
      }

      valid.push(file);
    }

    const combined = [...videoFiles, ...valid];

    if (combined.length > MAX_VIDEO_FILES) {
      alert(`Puedes seleccionar como máximo ${MAX_VIDEO_FILES} videos.`);
      return;
    }

    setVideoFiles(combined);
  }

  function removeVideo(index: number) {
    setVideoFiles((current) => current.filter((_, i) => i !== index));
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    const maximum = sourceType === "poster" || sourceType === "single-image" ? 1 : 5;

    if (selected.some((file) => !file.type.startsWith("image/"))) {
      alert("Selecciona únicamente archivos de imagen.");
      return;
    }

    if (selected.some((file) => file.size > MAX_IMAGE_BYTES)) {
      alert("Cada fotografía debe pesar como máximo 10 MB.");
      return;
    }

    if (selected.length > maximum) {
      alert(`Puedes seleccionar como máximo ${maximum} fotografía(s).`);
      return;
    }

    setImages(selected);
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function handleSurpriseMe() {
    setPrompt(
      `Crea un comercial cinematográfico de ${duration} segundos, estilo ${style.toLowerCase()}. Utiliza el material original para mostrar lo más atractivo del negocio o servicio. Construye una secuencia visual profesional, con movimientos naturales y un cierre publicitario elegante. No inventes precios, ofertas ni información que no haya proporcionado.`
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sourceType === "video" && videoFiles.length === 0) {
      alert("Selecciona al menos un video original.");
      return;
    }

    if (sourceType !== "video" && images.length === 0) {
      alert(sourceType === "poster" ? "Selecciona un afiche." : "Selecciona al menos una fotografía.");
      return;
    }
    if (sourceType === "poster" && images.length !== 1) {
      alert("Para la modalidad afiche debes seleccionar una sola imagen.");
      return;
    }

    if (!prompt.trim()) {
      alert("Describe qué tipo de comercial quieres crear.");
      return;
    }

    onSubmit?.({
      sourceType,
      images,
      videoFiles,
      videoFile: videoFiles[0] ?? null,
      prompt: prompt.trim(),
      duration,
      title: title.trim(),
      description: description.trim(),
      offer: offer.trim(),
      price: price.trim(),
      cta: cta.trim(),
      style,
      platform,
    });
  }

  const sourceOptions = [
    {
      value: "video" as const,
      title: "Videos originales",
      detail: "Hasta 5 videos del negocio o servicio",
      icon: "🎥",
    },
    {
      value: "multiple-images" as const,
      title: "Fotografías",
      detail: "De 1 a 5 fotografías",
      icon: "📸",
    },
    {
      value: "poster" as const,
      title: "Afiche",
      detail: "Una sola imagen publicitaria",
      icon: "📰",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          🎬 Crear comercial con IA
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Elige el material, carga tus archivos y define tu propuesta comercial.
        </p>
      </div>

      {initialBusinessName && (
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Empresa o negocio
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            {initialBusinessName}
          </p>
        </div>
      )}

      {/* SELECCIÓN DEL MATERIAL */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900">
          ¿Con qué material quieres trabajar?
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {sourceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSourceTypeChange(option.value)}
              aria-pressed={sourceType === option.value}
              className={`rounded-xl border p-4 text-left transition ${
                sourceType === option.value
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="mt-2 block font-semibold text-gray-900">
                {option.title}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                {option.detail}
              </span>
            </button>
          ))}
        </div>

        {sourceType === "video" && (
          <div className="mt-5 rounded-xl border border-gray-200 p-4">
            <label
              htmlFor="video-source"
              className="block text-sm font-semibold text-gray-900"
            >
              Seleccionar videos originales
            </label>

            <p className="mt-1 text-xs text-gray-500">
              Puedes añadir hasta 5 videos. Máximo 100 MB por archivo.
            </p>

            <input
              id="video-source"
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoChange}
              className="mt-3 block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
            />

            {videoFiles.length > 0 && (
              <div className="mt-4 space-y-4">
                {videoFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="rounded-xl border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {index + 1}. {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        aria-label={`Eliminar ${file.name}`}
                      >
                        Eliminar
                      </button>
                    </div>

                    <video
                      src={videoPreviews[index]}
                      controls
                      playsInline
                      preload="metadata"
                      className="mt-3 max-h-64 w-full rounded-lg bg-black"
                    />
                  </div>
                ))}

                <p className="text-xs text-gray-500">
                  {videoFiles.length} de {MAX_VIDEO_FILES} videos seleccionados.
                </p>
              </div>
            )}
          </div>
        )}

        {sourceType !== "video" && (
          <div className="mt-5 rounded-xl border border-gray-200 p-4">
            <label
              htmlFor="video-images"
              className="block text-sm font-semibold text-gray-900"
            >
              {sourceType === "poster" ? "Cargar afiche" : "Cargar fotografías"}
            </label>

            <p className="mt-1 text-xs text-gray-500">
              {sourceType === "poster" ? "Una sola imagen · Máximo 10 MB." : "De 1 a 5 fotografías · Máximo 10 MB cada una."}
            </p>

            <input
              id="video-images"
              type="file"
              accept="image/*"
              multiple={sourceType === "multiple-images"}
              onChange={handleImagesChange}
              className="mt-3 block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
            />

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={`${preview}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-gray-200"
                  >
                    <img
                      src={preview}
                      alt={`Fotografía ${index + 1}`}
                      className="aspect-[9/16] w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white"
                      aria-label={`Eliminar fotografía ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* DIRECTOR CINEMATOGRÁFICO */}
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="text-lg font-bold text-gray-900">Director cinematográfico IA</h3>
        <p className="mt-1 text-sm text-gray-600">
          ¿Qué quieres que comunique tu comercial? Escribe tu instrucción creativa.
        </p>
        <textarea
          id="video-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Ej. Quiero un comercial elegante y emocionante que destaque la experiencia que ofrecemos..."
          className="mt-4 w-full resize-y rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </section>

      {/* DURACIÓN */}
      <section>
        <p className="text-sm font-semibold text-gray-900">
          Duración del comercial
        </p>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {["15", "30", "45"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDuration(value)}
              aria-pressed={duration === value}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                duration === value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
              }`}
            >
              {value} segundos
            </button>
          ))}
        </div>
      </section>

      {/* PROPUESTA COMERCIAL */}
      <h3 className="text-lg font-bold text-gray-900">Propuesta comercial</h3>
      <section className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="video-title" className="block text-sm font-semibold text-gray-900">
            Título
          </label>
          <input
            id="video-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título de la campaña"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="video-offer" className="block text-sm font-semibold text-gray-900">
            Oferta o promoción
          </label>
          <input
            id="video-offer"
            value={offer}
            onChange={(event) => setOffer(event.target.value)}
            placeholder="Oferta proporcionada por tu empresa"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="video-price" className="block text-sm font-semibold text-gray-900">
            Precio
          </label>
          <input
            id="video-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Precio, si corresponde"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="video-cta" className="block text-sm font-semibold text-gray-900">
            Llamada a la acción
          </label>
          <input
            id="video-cta"
            value={cta}
            onChange={(event) => setCta(event.target.value)}
            placeholder="Ej. Contáctanos"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        </div>
      </section>

      <section>
        <label htmlFor="video-description" className="block text-sm font-semibold text-gray-900">
          Descripción del negocio, producto o servicio
        </label>
        <textarea
          id="video-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Describe el servicio, experiencia, evento o negocio que quieres promocionar."
          className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm"
        />
      </section>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        ✨ Preparar mi comercial
      </button>
    </form>
  );
}
