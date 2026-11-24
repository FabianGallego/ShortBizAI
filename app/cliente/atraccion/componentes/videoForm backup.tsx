"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export type VideoFormData = {
  images: File[];
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

const EXAMPLE_PROMPTS = [
  "Crea un video elegante de 15 segundos para promocionar nuestros mejores platos. Muestra primero la comida, después la oferta y termina invitando a reservar.",
  "Haz un video energético para TikTok que llame la atención desde el primer segundo y destaque nuestra especialidad.",
  "Quiero un video moderno para Instagram. Usa poco texto, movimientos suaves y termina con una llamada a reservar.",
  "Crea un video de lujo usando las mejores fotos de nuestro negocio. Que se vea profesional y sofisticado.",
  "Haz un video de 10 segundos para promocionar nuestra oferta. Que sea llamativo y tenga poco texto.",
];

export default function VideoForm({
  initialBusinessName = "",
  initialReservationUrl = "",
  onSubmit,
}: VideoFormProps) {
  const [images, setImages] = useState<File[]>([]);

  const [prompt, setPrompt] = useState("");

  const [duration, setDuration] = useState("15");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [offer, setOffer] = useState("");
  const [price, setPrice] = useState("");
  const [cta, setCta] = useState("Reserva ahora");
  const [style, setStyle] = useState("Premium");
  const [platform, setPlatform] = useState(
    "Instagram + TikTok + YouTube Shorts"
  );

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));

    setImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    const validImages = selectedFiles
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5);

    setImages(validImages);

    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function handleExampleClick(example: string) {
    setPrompt(example);
    setShowExamples(false);
  }

  function handleSurpriseMe() {
    const surprisePrompt = `Sorpréndeme con un video ${style.toLowerCase()} de ${duration} segundos para promocionar mi negocio. Usa las mejores fotos disponibles, destaca lo más atractivo de mi negocio y termina con una llamada a la acción para reservar. Quiero que se vea como un anuncio profesional para redes sociales.`;

    setPrompt(surprisePrompt);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (images.length === 0) {
      alert("Selecciona al menos una foto para crear el Short.");
      return;
    }

    if (!prompt.trim()) {
      alert("Escribe qué video quieres que cree la IA.");
      return;
    }

    onSubmit?.({
      images,
      prompt: prompt.trim(),
      duration,
      title: title.trim(),
      description: description.trim(),
      offer: offer.trim(),
      price: price.trim(),
      cta: cta.trim() || "Reserva ahora",
      style,
      platform,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* ENCABEZADO */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          🎬 Crear video con IA
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Dile a ShortBizAI qué video quieres y la IA utilizará tus fotos y
          datos del negocio para construirlo.
        </p>
      </div>

      {/* NEGOCIO */}
      {initialBusinessName && (
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Negocio
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {initialBusinessName}
          </p>
        </div>
      )}

      {/* DIRECTOR IA */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              ✨ Director IA
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Describe con tus propias palabras cómo quieres que sea el video.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSurpriseMe}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            🎲 Sorpréndeme
          </button>
        </div>

        <textarea
          id="video-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={5}
          placeholder="Ej. Quiero un video elegante de 15 segundos. Empieza mostrando nuestro plato principal, después presenta la oferta y termina invitando a reservar. Usa poco texto y movimientos suaves."
          className="mt-4 w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Puedes escribirlo de forma natural. No necesitas saber cómo crear
            un video.
          </p>

          <button
            type="button"
            onClick={() => setShowExamples((current) => !current)}
            className="text-left text-sm font-semibold text-blue-700 hover:text-blue-900 sm:text-right"
          >
            💡 {showExamples ? "Ocultar ejemplos" : "Ver ejemplos"}
          </button>
        </div>

        {showExamples && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              Ejemplos de lo que puedes pedir
            </p>

            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="block w-full rounded-xl border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DURACIÓN */}
      <div>
        <label
          htmlFor="video-duration"
          className="block text-sm font-semibold text-gray-900"
        >
          Duración del video
        </label>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {["10", "15", "30"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDuration(value)}
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
      </div>

      {/* FOTOS */}
      <div>
        <label
          htmlFor="video-images"
          className="block text-sm font-semibold text-gray-900"
        >
          Fotos del negocio
        </label>

        <p className="mt-1 text-xs text-gray-500">
          Puedes seleccionar entre 1 y 5 fotos.
        </p>

        <input
          id="video-images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="mt-3 block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
        />

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {imagePreviews.map((preview, index) => (
              <div
                key={`${preview}-${index}`}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                <img
                  src={preview}
                  alt={`Foto ${index + 1}`}
                  className="aspect-[9/16] w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white"
                  aria-label={`Eliminar foto ${index + 1}`}
                >
                  ×
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center text-xs text-white">
                  Foto {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INFORMACIÓN DEL CONTENIDO */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="video-title"
            className="block text-sm font-semibold text-gray-900"
          >
            Título
          </label>

          <input
            id="video-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. El mejor brunch de Queens"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="video-offer"
            className="block text-sm font-semibold text-gray-900"
          >
            Oferta o promoción
          </label>

          <input
            id="video-offer"
            value={offer}
            onChange={(event) => setOffer(event.target.value)}
            placeholder="Ej. 20% de descuento este fin de semana"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="video-price"
            className="block text-sm font-semibold text-gray-900"
          >
            Precio
          </label>

          <input
            id="video-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Ej. $24.99"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="video-cta"
            className="block text-sm font-semibold text-gray-900"
          >
            Llamada a la acción
          </label>

          <input
            id="video-cta"
            value={cta}
            onChange={(event) => setCta(event.target.value)}
            placeholder="Reserva ahora"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label
          htmlFor="video-description"
          className="block text-sm font-semibold text-gray-900"
        >
          Descripción
        </label>

        <textarea
          id="video-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Describe el plato, servicio, ambiente, evento o experiencia que quieres promocionar."
          className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* RESERVACIÓN */}
      {initialReservationUrl && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Enlace de reserva
          </p>

          <p className="mt-1 break-all text-sm text-gray-700">
            {initialReservationUrl}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Este enlace será utilizado automáticamente en el CTA del Short.
          </p>
        </div>
      )}

      {/* ESTILO Y PLATAFORMA */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="video-style"
            className="block text-sm font-semibold text-gray-900"
          >
            Estilo del video
          </label>

          <select
            id="video-style"
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
          >
            <option value="Premium">Premium</option>
            <option value="Elegante">Elegante</option>
            <option value="Moderno">Moderno</option>
            <option value="Energetico">Enérgico</option>
            <option value="Minimalista">Minimalista</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="video-platform"
            className="block text-sm font-semibold text-gray-900"
          >
            Plataformas
          </label>

          <select
            id="video-platform"
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
          >
            <option value="Instagram + TikTok + YouTube Shorts">
              Instagram + TikTok + YouTube Shorts
            </option>
            <option value="Instagram Reels">Instagram Reels</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube Shorts">YouTube Shorts</option>
          </select>
        </div>
      </div>

      {/* INFORMACIÓN */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-gray-900">
          🧠 ¿Qué hará la IA?
        </p>

        <p className="mt-1 text-sm text-gray-600">
          ShortBizAI utilizará tu descripción, fotos, información del negocio,
          oferta, duración, estilo y plataforma para construir el concepto del
          video. En el siguiente paso convertiremos esta información en un
          storyboard antes de generar el video.
        </p>
      </div>

      {/* BOTÓN */}
      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        ✨ Crear video con IA
      </button>
    </form>
  );
}