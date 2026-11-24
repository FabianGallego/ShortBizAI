
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VideoForm, {
  type VideoFormData,
} from "./componentes/videoForm";

type VideoItem = {
  id?: string | number;
  titulo?: string;
  title?: string;
  descripcion?: string;
  description?: string;
  urls?: unknown;
  video_url?: string;
  url?: string;
  plataforma?: string;
  created_at?: string;
  fecha?: string;
};

type DirectorPlanData = {
  sector?: string;
  concept?: string;
  creativeConcept?: string;
  visualStyle?: string;
  style?: string;
  duration?: number;
  narration?: string;
  narrationScript?: string;
  musicDirection?: string;
  scenes?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

type PremiumFormData = {
  title: string;
  description: string;
  offer: string;
  price: string;
  cta: string;
  style: string;
  platform: string;
};

const INITIAL_PREMIUM_FORM: PremiumFormData = {
  title: "",
  description: "",
  offer: "",
  price: "",
  cta: "Reserva ahora",
  style: "Premium cinematográfico",
  platform: "Instagram + TikTok + YouTube Shorts",
};

export default function AtraccionPage() {
  /* =========================================================
     ESTADO GENERAL
  ========================================================= */

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [reservationUrl, setReservationUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     ETAPA 1: PREVISUALIZACIÓN
  ========================================================= */

  const [formData, setFormData] =
    useState<VideoFormData | null>(null);

  const [preliminaryVideoUrl, setPreliminaryVideoUrl] =
    useState<string | null>(null);

  const [preliminaryVideoBlob, setPreliminaryVideoBlob] =
    useState<Blob | null>(null);

  const [isPreparingVideo, setIsPreparingVideo] =
    useState(false);

  // Dirección cinematográfica generada localmente por aiDirector.ts.
  const [directorPlan, setDirectorPlan] = useState<DirectorPlanData | null>(null);
  const [isPlanningDirector, setIsPlanningDirector] = useState(false);

  // Nueva modalidad independiente: afiche -> video IA.
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterSceneFiles, setPosterSceneFiles] = useState<File[]>([]);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [visualVideoUrl, setVisualVideoUrl] = useState<string | null>(null);
  const [visualApproved, setVisualApproved] = useState(false);
  const [posterDuration, setPosterDuration] = useState(30);
  const [visualPrompt, setVisualPrompt] = useState("Convierte este afiche en un anuncio cinematográfico vertical 9:16. Anima los elementos reales de las fotografías, crea escenas dinámicas con movimientos de cámara fluidos, profundidad, iluminación profesional y transiciones elegantes. Respeta exactamente las personas, lugares, marca, fechas, precios y datos visibles. No inventes textos ni elementos que no aparezcan en el material.");
  const [audioPrompt, setAudioPrompt] = useState("Crea una experiencia sonora cinematográfica y emotiva, moderna y elegante, con música instrumental que acompañe la narración sin taparla. La voz debe sonar natural, cálida, profesional y convincente, sin tono exagerado de anuncio.");
  const [posterMode, setPosterMode] = useState(false);
  const [narrationVoice, setNarrationVoice] = useState("Fenrir");
  const [narrationLanguage, setNarrationLanguage] = useState("Spanish (Latin America)");
  const [narrationScript, setNarrationScript] = useState("");
 const [campaignBrand, setCampaignBrand] = useState("");

  /* =========================================================
     ETAPA 2: FORMULARIO COMERCIAL
  ========================================================= */

  const [premiumForm, setPremiumForm] =
    useState<PremiumFormData>(INITIAL_PREMIUM_FORM);

  const [backgroundMusicFile, setBackgroundMusicFile] =
    useState<File | null>(null);

  const [showPremiumForm, setShowPremiumForm] =
    useState(false);

  const [isGeneratingVideo, setIsGeneratingVideo] =
    useState(false);

  const [videoUrl, setVideoUrl] =
    useState<string | null>(null);

  /* =========================================================
     CARGAR DATOS
  ========================================================= */

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("ERROR AUTENTICACIÓN:", userError);
          setError("No se pudo verificar la sesión.");
          return;
        }

        if (!user) {
          setError("No hay una sesión activa.");
          return;
        }

        const {
          data: perfil,
          error: perfilError,
        } = await supabase
          .from("perfiles")
          .select("user_id, nombre, rol, activo")
          .eq("user_id", user.id)
          .maybeSingle();

        if (perfilError) {
          console.error("ERROR PERFIL:", perfilError);
          setError("No se pudo cargar el perfil del usuario.");
          return;
        }

        if (!perfil) {
          setError("No se encontró el perfil del usuario.");
          return;
        }

        const {
          data: relacion,
          error: relacionError,
        } = await supabase
          .from("usuarios_empresas")
          .select("empresa_id, rol, activo")
          .eq("user_id", user.id)
          .eq("activo", true)
          .maybeSingle();

        if (relacionError) {
          console.error("ERROR RELACIÓN EMPRESA:", relacionError);
          setError("No se pudo identificar la empresa del usuario.");
          return;
        }

        if (!relacion?.empresa_id) {
          setError("Este usuario no tiene una empresa asignada.");
          return;
        }

        const {
          data: empresa,
          error: empresaError,
        } = await supabase
          .from("empresas")
          .select("id, nombre, url_reservas")
          .eq("id", relacion.empresa_id)
          .maybeSingle();

        if (empresaError) {
          console.error("ERROR EMPRESA:", empresaError);
          setError("No se pudo cargar la información de la empresa.");
          return;
        }

        if (empresa) {
          setBusinessName(empresa.nombre || "");
          setReservationUrl(empresa.url_reservas || "");
        }

        // La tabla videos de este proyecto no tiene created_at.
        // Cargamos los registros sin ordenar por una columna inexistente.
        const {
          data: videosData,
          error: videosError,
        } = await supabase
          .from("videos")
          .select("*");

        if (videosError) {
          console.warn(
            "No se pudieron cargar los videos:",
            videosError.message
          );
        }

        setVideos((videosData || []) as VideoItem[]);
      } catch (err) {
        console.error("ERROR GENERAL ATRACCIÓN:", err);
        setError("Ocurrió un error cargando el módulo Atracción.");
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, []);

  /* =========================================================
     LIBERAR URL LOCAL
  ========================================================= */

  useEffect(() => {
    return () => {
      if (preliminaryVideoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(preliminaryVideoUrl);
      }
    };
  }, [preliminaryVideoUrl]);

  /* =========================================================
     MANEJAR FORMULARIO PREMIUM
  ========================================================= */

  function updatePremiumField(
    field: keyof PremiumFormData,
    value: string
  ) {
    setPremiumForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =========================================================
     LEER ERRORES DEL SERVIDOR
  ========================================================= */

  async function getResponseError(response: Response) {
    const contentType =
      response.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        const result = await response.json();

        return (
          result.error ||
          result.message ||
          "Ocurrió un error."
        );
      }

      const message = await response.text();

      return message || "Ocurrió un error.";
    } catch {
      return "No se pudo interpretar la respuesta del servidor.";
    }
  }

  async function requestDirectorPlan(options: {
    sourceType: "poster" | "video" | "single-image" | "multiple-images";
    duration: number | string;
    prompt: string;
    title?: string;
    description?: string;
    offer?: string;
    price?: string;
    cta?: string;
    style?: string;
    platform?: string;
    images?: File[];
    videos?: File[];
    poster?: File | null;
    posterScenes?: File[];
  }) {
    setIsPlanningDirector(true);
    setDirectorPlan(null);

    try {
      const body = new FormData();
      body.append("action", "director-plan");
      body.append("sourceType", options.sourceType);
      body.append("duration", String(options.duration || 15));
      body.append("prompt", options.prompt.trim());
      body.append("businessName", businessName);
      body.append("campaignBrand", campaignBrand.trim() || businessName);
      body.append("title", options.title || "");
      body.append("description", options.description || "");
      body.append("offer", options.offer || "");
      body.append("price", options.price || "");
      body.append("cta", options.cta || "Reserva ahora");
      body.append("style", options.style || premiumForm.style);
      body.append("platform", options.platform || premiumForm.platform);
      body.append("narrationText", narrationScript.trim());
      body.append("audioPrompt", audioPrompt.trim());
      body.append("voice", narrationVoice);
      body.append("languageCode", narrationLanguage);

      (options.images || []).forEach((file) => body.append("images", file));
      (options.videos || []).forEach((file) => body.append("videoFiles", file));
      if (options.poster) body.append("posterImage", options.poster);
      (options.posterScenes || []).forEach((file) => body.append("posterSceneImages", file));

      const response = await fetch("/api/video-ai", { method: "POST", body });
      let result: { success?: boolean; plan?: DirectorPlanData; error?: string; message?: string };
      try {
        result = await response.json();
      } catch {
        throw new Error("El director IA no devolvió una respuesta JSON válida.");
      }
      if (!response.ok || !result.plan) {
        throw new Error(result.error || result.message || "No se pudo crear el plan cinematográfico.");
      }
      setDirectorPlan(result.plan);
      return result.plan;
    } finally {
      setIsPlanningDirector(false);
    }
  }

  /* =========================================================
     ETAPA 1: PREPARAR VIDEO LOCAL
     SIN GENERACIÓN DE IA
  ========================================================= */


async function handlePrepareVideo(data: VideoFormData) {
  if (isPreparingVideo || isGeneratingVideo || isPlanningDirector) return;

  const selectedVideos =
    data.videoFiles?.length > 0
      ? data.videoFiles
      : data.videoFile
        ? [data.videoFile]
        : [];

  if (data.sourceType === "video") {
    if (selectedVideos.length === 0) {
      alert("Selecciona al menos un video original.");
      return;
    }

    if (selectedVideos.length > 5) {
      alert("Puedes seleccionar un máximo de cinco videos.");
      return;
    }

    const invalidVideo = selectedVideos.find(
      (file) =>
        !file.type.startsWith("video/") ||
        file.size > 100 * 1024 * 1024
    );

    if (invalidVideo) {
      alert(
        `El archivo ${invalidVideo.name} no es válido o supera los 100 MB.`
      );
      return;
    }
  }

  if (
    data.sourceType !== "video" &&
    (!data.images || data.images.length === 0)
  ) {
    alert("Selecciona al menos una fotografía.");
    return;
  }

  if (
    data.sourceType === "multiple-images" &&
    data.images.length > 5
  ) {
    alert("Puedes seleccionar un máximo de cinco fotografías.");
    return;
  }

  if (
    data.sourceType === "single-image" &&
    data.images.length !== 1
  ) {
    alert("Para esta modalidad debes seleccionar exactamente una fotografía.");
    return;
  }

  // El afiche usa el mismo formulario de entrada, pero conserva su ruta visual especializada.
  if (data.sourceType === "poster") {
    const poster = data.images[0];
    if (!poster || data.images.length !== 1) {
      alert("Selecciona un único afiche.");
      return;
    }

    try {
      setPosterFile(poster);
      setPosterSceneFiles([]);
      setPosterDuration(Number(data.duration || 30));
      setVisualPrompt(data.prompt.trim());
      setPosterMode(true);
      setFormData(null);
      setVisualVideoUrl(null);
      setVisualApproved(false);
      setShowPremiumForm(false);
      setVideoUrl(null);
      setNarrationScript("");
      setBackgroundMusicFile(null);
      setPremiumForm({
        title: data.title,
        description: data.description,
        offer: data.offer,
        price: data.price,
        cta: data.cta || "Reserva ahora",
        style: data.style || "Premium cinematográfico",
        platform: data.platform,
      });

      await requestDirectorPlan({
        sourceType: "poster",
        duration: Number(data.duration || 30),
        prompt: data.prompt,
        title: data.title,
        description: data.description,
        offer: data.offer,
        price: data.price,
        cta: data.cta,
        style: data.style,
        platform: data.platform,
        poster,
      });

      alert("El director IA preparó el plan cinematográfico. Revísalo antes de autorizar la generación visual.");
    } catch (err) {
      console.error("ERROR CREANDO PLAN DEL AFICHE:", err);
      alert(err instanceof Error ? err.message : "No se pudo crear el plan cinematográfico.");
    }
    return;
  }

  try {
    await requestDirectorPlan({
      sourceType: data.sourceType,
      duration: data.duration || 15,
      prompt: data.prompt || "",
      title: data.title,
      description: data.description,
      offer: data.offer,
      price: data.price,
      cta: data.cta,
      style: data.style,
      platform: data.platform,
      images: data.images || [],
      videos: selectedVideos,
    });

    setIsPreparingVideo(true);

    setFormData(data);
    setPosterMode(false);
    setVisualVideoUrl(null);
    setVisualApproved(false);
    setNarrationScript("");
    setShowPremiumForm(false);
    setVideoUrl(null);
    setPreliminaryVideoBlob(null);
    setPreliminaryVideoUrl(null);
    setPremiumForm(INITIAL_PREMIUM_FORM);
    setBackgroundMusicFile(null);

    const body = new FormData();

    body.append("action", "prepare");
    body.append("sourceType", data.sourceType);
    body.append("duration", String(data.duration || 15));
    body.append("prompt", (data.prompt || "").trim());

    if (data.sourceType === "video") {
      selectedVideos.forEach((file) => {
        body.append("videoFiles", file);
      });

      // Compatibilidad con la versión anterior del servidor.
      if (selectedVideos[0]) {
        body.append("videoFile", selectedVideos[0]);
      }
    } else {
      for (const image of data.images) {
        body.append("images", image);
      }
    }

    const response = await fetch("/api/video-ai", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      throw new Error(await getResponseError(response));
    }

    const blob = await response.blob();

    if (!blob.size) {
      throw new Error("El servidor devolvió un video vacío.");
    }

    if (
      blob.type &&
      !blob.type.includes("video") &&
      !blob.type.includes("octet-stream")
    ) {
      throw new Error(
        "La respuesta no parece ser un archivo de video."
      );
    }

    const localUrl = URL.createObjectURL(blob);

    setPreliminaryVideoBlob(blob);
    setPreliminaryVideoUrl(localUrl);

    alert(
      "¡Material preparado! Revisa el video preliminar antes de continuar."
    );
  } catch (err) {
    console.error("ERROR PREPARANDO VIDEO:", err);

    alert(
      err instanceof Error
        ? err.message
        : "No se pudo preparar el video."
    );
  } finally {
    setIsPreparingVideo(false);
  }
}

  /* =========================================================
     ETAPA VISUAL: GENERAR SOLO VIDEO, SIN AUDIO
  ========================================================= */

  async function handlePreparePoster() {
    if (!posterFile) {
      alert("Selecciona primero un afiche.");
      return;
    }
    if (isPreparingVideo || isGeneratingVideo || isPlanningDirector) return;

    try {
      setPosterMode(true);
      setFormData(null);
      setVideoUrl(null);
      setVisualVideoUrl(null);
      setVisualApproved(false);
      setShowPremiumForm(false);

      await requestDirectorPlan({
        sourceType: "poster",
        duration: posterDuration,
        prompt: visualPrompt,
        title: premiumForm.title,
        description: premiumForm.description,
        offer: premiumForm.offer,
        price: premiumForm.price,
        cta: premiumForm.cta,
        style: premiumForm.style,
        platform: premiumForm.platform,
        poster: posterFile,
        posterScenes: posterSceneFiles.slice(0, 6),
      });

      alert("El director IA preparó el plan cinematográfico. Revísalo antes de autorizar la generación visual.");
    } catch (err) {
      console.error("ERROR CREANDO PLAN DEL AFICHE:", err);
      alert(err instanceof Error ? err.message : "No se pudo crear el plan cinematográfico.");
    }
  }

  async function handleGeneratePosterVisual() {
    if (!posterFile || !directorPlan) {
      alert("Primero debes crear y revisar el plan cinematográfico.");
      return;
    }
    if (isPreparingVideo || isGeneratingVideo || isPlanningDirector) return;

    const confirmed = window.confirm(
      `Se generará la parte visual con Hailuo 02 Pro (${posterDuration} segundos). Esta etapa consume créditos de fal.ai. El plan cinematográfico ya está preparado. ¿Autorizas la generación visual?`
    );
    if (!confirmed) return;

    try {
      setIsGeneratingVideo(true);
      setVisualVideoUrl(null);
      setVisualApproved(false);
      setShowPremiumForm(false);

      const body = new FormData();
      body.append("action", "generate-visual");
      body.append("preparedKind", "poster");
      body.append("posterImage", posterFile);
      posterSceneFiles.slice(0, 6).forEach((file) => body.append("posterSceneImages", file));
      body.append("duration", String(posterDuration));
      body.append("prompt", visualPrompt.trim());
      body.append("businessName", businessName);
      body.append("campaignBrand", campaignBrand.trim() || businessName);
      body.append("title", premiumForm.title.trim());
      body.append("description", premiumForm.description.trim());
      body.append("offer", premiumForm.offer.trim());
      body.append("price", premiumForm.price.trim());
      body.append("cta", premiumForm.cta.trim());
      body.append("style", premiumForm.style);
      body.append("platform", premiumForm.platform);

      const response = await fetch("/api/video-ai", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "No se pudo generar el video visual.");
      if (!result.visualVideoUrl) throw new Error("El servidor no devolvió la previsualización visual.");
      setVisualVideoUrl(result.visualVideoUrl);
      alert("Video visual generado. Revísalo antes de aprobarlo. Todavía no se ha creado el audio.");
    } catch (err) {
      console.error("ERROR GENERANDO VIDEO VISUAL DEL AFICHE:", err);
      alert(err instanceof Error ? err.message : "No se pudo generar el video visual.");
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  async function handleGenerateVisualVideo() {
    if (!formData || !preliminaryVideoBlob) {
      alert("Primero prepara el video preliminar.");
      return;
    }
    if (isGeneratingVideo || isPreparingVideo || isPlanningDirector) return;
    if (!directorPlan) {
      alert("Primero debes crear el plan cinematográfico.");
      return;
    }

    const confirmed = window.confirm(
      "Se transformará el video preliminar con IA para crear la parte visual Premium. Esta etapa consume créditos de fal.ai. No se generarán narración ni música todavía. ¿Autorizas la generación visual?"
    );
    if (!confirmed) return;

    try {
      setIsGeneratingVideo(true);
      setVisualVideoUrl(null);
      setVisualApproved(false);
      setShowPremiumForm(false);

      const body = new FormData();
      body.append("action", "generate-visual");
      body.append("preparedKind", "video");
      body.append("preparedVideo", new File([preliminaryVideoBlob], "shortbizai-preliminary.mp4", { type: "video/mp4" }));
      body.append("duration", String(formData.duration || 15));
      body.append("prompt", (formData.prompt || "").trim());
      body.append("title", premiumForm.title.trim());
      body.append("description", premiumForm.description.trim());
      body.append("offer", premiumForm.offer.trim());
      body.append("price", premiumForm.price.trim());
      body.append("cta", premiumForm.cta.trim());
      body.append("businessName", businessName);
      body.append("campaignBrand", campaignBrand.trim() || businessName);
      body.append("style", premiumForm.style);

      const response = await fetch("/api/video-ai", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "No se pudo generar el video visual.");
      if (!result.visualVideoUrl) throw new Error("El servidor no devolvió el video visual generado.");
      setVisualVideoUrl(result.visualVideoUrl);
      alert("Video visual generado. Revísalo antes de aprobarlo. Todavía no se ha creado el audio.");
    } catch (err) {
      console.error("ERROR GENERANDO ETAPA VISUAL:", err);
      alert(err instanceof Error ? err.message : "No se pudo generar el video visual.");
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  function handleApproveVisual() {
    if (!visualVideoUrl) return;
    setVisualApproved(true);
    setShowPremiumForm(true);
    window.setTimeout(() => document.getElementById("premium-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function handleApprovePreliminary() {
    if (!directorPlan) {
      alert("Primero debes crear el plan del director IA.");
      return;
    }
    handleGenerateVisualVideo();
  }

  /* =========================================================
     ETAPA 2: GENERAR ANUNCIO PREMIUM
     PUEDE CONSUMIR CRÉDITOS
  ========================================================= */

  async function handleGenerateFinalVideo() {
    if (!visualVideoUrl || !visualApproved) {
      alert("Primero debes aprobar la previsualización visual.");
      return;
    }
    if (isGeneratingVideo || isPreparingVideo) return;

    const confirmed = window.confirm(
      "Se generará la narración y se mezclará con la música sobre el video visual aprobado. No se volverán a generar escenas ni se consumirán créditos de video. La narración y la generación de música con IA pueden consumir créditos de fal.ai. Si subes una pista propia, no se generará música nueva. ¿Autorizas esta etapa de audio?"
    );
    if (!confirmed) return;

    try {
      setIsGeneratingVideo(true);
      const body = new FormData();
      body.append("action", "generate-audio");
      body.append("visualVideoUrl", visualVideoUrl);
      body.append("title", premiumForm.title.trim());
      body.append("description", premiumForm.description.trim());
      body.append("offer", premiumForm.offer.trim());
      body.append("price", premiumForm.price.trim());
      body.append("cta", premiumForm.cta.trim());
      body.append("voice", narrationVoice);
      body.append("languageCode", narrationLanguage);
      body.append("narrationText", narrationScript.trim());
      body.append("audioPrompt", audioPrompt.trim());
      body.append("businessName", businessName);
      body.append("campaignBrand", campaignBrand.trim() || businessName);
      body.append("reservationUrl", reservationUrl);
      body.append("duration", String(posterMode ? posterDuration : (formData?.duration || 15)));
      body.append("style", premiumForm.style);
      body.append("platform", premiumForm.platform);
      if (backgroundMusicFile) body.append("backgroundMusic", backgroundMusicFile);

      const response = await fetch("/api/video-ai", { method: "POST", body });
      let result: { success?: boolean; videoUrl?: string; error?: string; message?: string };
      try {
        result = await response.json();
      } catch {
        throw new Error("El servidor no devolvió una respuesta válida.");
      }
      if (!response.ok) throw new Error(result.error || result.message || "No se pudo crear el audio final.");
      if (!result.videoUrl) throw new Error("No se recibió el video final con audio.");
      setVideoUrl(result.videoUrl);
      alert("¡Audio integrado! El comercial final está listo.");
    } catch (err) {
      console.error("ERROR GENERANDO AUDIO:", err);
      alert(err instanceof Error ? err.message : "No se pudo completar la etapa de audio.");
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  /* =========================================================
     DESCARTAR Y EMPEZAR DE NUEVO
  ========================================================= */

  function handleDiscardPreliminary() {
    if (isPreparingVideo || isGeneratingVideo || isPlanningDirector) return;

    const confirmed = window.confirm(
      "¿Quieres descartar el video preliminar y comenzar de nuevo?"
    );

    if (!confirmed) return;

    setFormData(null);
    setPosterMode(false);
    setDirectorPlan(null);
    setPosterFile(null);
    setVisualVideoUrl(null);
    setVisualApproved(false);
    setNarrationScript("");
    if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
    setPosterPreviewUrl(null);
    setPreliminaryVideoBlob(null);
    setPreliminaryVideoUrl(null);
    setShowPremiumForm(false);
    setVideoUrl(null);
    setPremiumForm(INITIAL_PREMIUM_FORM);
    setBackgroundMusicFile(null);
  }

  /* =========================================================
     URLS DE VIDEOS EXISTENTES
  ========================================================= */

  function getVideoUrls(video: VideoItem): string[] {
    if (!video.urls) return [];

    try {
      if (typeof video.urls === "string") {
        const parsed = JSON.parse(video.urls);

        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is string =>
              typeof item === "string"
          );
        }

        if (typeof parsed === "string") {
          return [parsed];
        }

        return [];
      }

      if (Array.isArray(video.urls)) {
        return video.urls.filter(
          (item): item is string =>
            typeof item === "string"
        );
      }

      return [];
    } catch {
      return [];
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-8 shadow">
            <p className="text-lg font-semibold">
              Cargando módulo Atracción...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-xl font-bold text-red-700">
              No se pudo cargar Atracción
            </h1>

            <p className="mt-3 text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
            >
              Volver a intentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     PÁGINA
  ========================================================= */

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* CABECERA */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-600">
            ATRAER · AUTOMÁTICO
          </p>

          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            🎥 Módulo Atracción
          </h1>

          {businessName && (
            <p className="mt-2 text-lg font-semibold text-gray-700">
              {businessName}
            </p>
          )}

          <p className="mt-3 max-w-3xl text-gray-600">
            Crea anuncios profesionales desde afiches, fotografías o videos. Los afiches tienen una modalidad de animación cinematográfica; el flujo existente de fotos y videos también se conserva.
          </p>
        </div>

        {/* ETAPA 1 */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:p-8">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Etapa 1
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              🎬 Crear anuncio desde tu material
            </h2>

            <p className="mt-2 text-gray-500">
              Elige una sola modalidad de entrada: afiche, de una a cinco fotografías o hasta cinco videos.
              El Director IA preparará el concepto y el storyboard antes de cualquier generación visual.
            </p>
          </div>

          <VideoForm
            initialBusinessName={businessName}
            initialReservationUrl={reservationUrl}
            onSubmit={handlePrepareVideo}
          />

          {isPlanningDirector && (
            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <p className="font-semibold text-violet-900">🧠 El director IA está diseñando el storyboard. Esta etapa no consume créditos.</p>
            </div>
          )}

          {isPreparingVideo && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="font-semibold text-blue-900">Preparando la vista previa gratuita...</p>
            </div>
          )}
        </section>

        {/* PLAN DEL DIRECTOR IA */}
        {directorPlan && (
          <section className="mb-8 rounded-3xl border border-violet-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-bold uppercase tracking-wide text-violet-700">Director IA · planificación sin créditos</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Plan cinematográfico de la campaña</h2>
            <p className="mt-2 text-sm text-gray-600">Este es el storyboard propuesto antes de generar imágenes o video con IA. La planificación no consume créditos de fal.ai.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-violet-50 p-4">
                <p className="text-xs font-bold uppercase text-violet-700">Sector</p>
                <p className="mt-1 font-semibold text-gray-900">{String(directorPlan.sector || "Servicios / negocio")}</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-4">
                <p className="text-xs font-bold uppercase text-violet-700">Estilo visual</p>
                <p className="mt-1 font-semibold text-gray-900">{String(directorPlan.visualStyle || directorPlan.style || premiumForm.style)}</p>
              </div>
            </div>
            {(directorPlan.concept || directorPlan.creativeConcept) && (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase text-gray-500">Concepto creativo</p>
                <p className="mt-1 text-gray-800">{String(directorPlan.concept || directorPlan.creativeConcept)}</p>
              </div>
            )}
            {Array.isArray(directorPlan.scenes) && directorPlan.scenes.length > 0 && (
              <div className="mt-5 space-y-3">
                <h3 className="font-bold text-gray-900">Storyboard · {directorPlan.scenes.length} escenas</h3>
                {directorPlan.scenes.map((scene, index) => (
                  <article key={`director-scene-${index}`} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">Escena {index + 1} · {String(scene.role || scene.title || "Secuencia")}</p>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{String(scene.duration ?? "—")} s</span>
                    </div>
                   {typeof scene.visualPrompt === "string" && scene.visualPrompt.trim() ? (
  <p className="mt-2 text-sm text-gray-700">{scene.visualPrompt}</p>
) : typeof scene.prompt === "string" && scene.prompt.trim() ? (
  <p className="mt-2 text-sm text-gray-700">{scene.prompt}</p>
) : null}


                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                      {typeof scene.movement === "string" && scene.movement.trim() ? (
                        <span className="rounded-lg bg-blue-50 px-2 py-1">Cámara: {scene.movement}</span>
                      ) : typeof scene.cameraMovement === "string" && scene.cameraMovement.trim() ? (
                        <span className="rounded-lg bg-blue-50 px-2 py-1">Cámara: {scene.cameraMovement}</span>
                      ) : null}
                      {typeof scene.transition === "string" && scene.transition.trim() ? (
                        <span className="rounded-lg bg-amber-50 px-2 py-1">Transición: {scene.transition}</span>
                      ) : null}
                      {typeof scene.overlayText === "string" && scene.overlayText.trim() ? (
                        <span className="rounded-lg bg-emerald-50 px-2 py-1">Texto: {scene.overlayText}</span>
                      ) : typeof scene.textOverlay === "string" && scene.textOverlay.trim() ? (
                        <span className="rounded-lg bg-emerald-50 px-2 py-1">Texto: {scene.textOverlay}</span>
                      ) : typeof scene.text === "string" && scene.text.trim() ? (
                        <span className="rounded-lg bg-emerald-50 px-2 py-1">Texto: {scene.text}</span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
            {((typeof directorPlan.narration === "string" && directorPlan.narration.trim()) ||
              (typeof directorPlan.narrationScript === "string" && directorPlan.narrationScript.trim())) && (
              <div className="mt-5 rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase text-gray-500">Narración sugerida</p>
                <p className="mt-1 text-gray-800">{String(directorPlan.narration || directorPlan.narrationScript)}</p>
              </div>
            )}
            {typeof directorPlan.musicDirection === "string" && directorPlan.musicDirection.trim() ? (
              <div className="mt-3 rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase text-gray-500">Dirección musical</p>
                <p className="mt-1 text-gray-800">{directorPlan.musicDirection}</p>
              </div>
            ) : null}
            {posterMode && (
              <button type="button" onClick={handleGeneratePosterVisual} disabled={isGeneratingVideo || isPlanningDirector} className="mt-6 rounded-xl bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
                🎬 Aprobar plan y generar video visual con Hailuo 02 Pro
              </button>
            )}
          </section>
        )}

        {/* PREVISUALIZACIÓN */}

        {!posterMode && preliminaryVideoUrl && preliminaryVideoBlob && (
          <section className="mb-8 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
              Etapa 1 completada
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Revisa tu video preliminar
            </h2>

            <p className="mt-2 text-gray-600">
              Reproduce el resultado y verifica el movimiento, los rostros, los textos y la secuencia antes de continuar.
            </p>

            <video src={preliminaryVideoUrl || undefined} controls playsInline className="mt-5 w-full max-w-xl rounded-2xl border border-gray-200 bg-black shadow-sm" />

            {preliminaryVideoBlob && !posterMode && <p className="mt-3 text-xs text-gray-500">Tamaño del video: {(preliminaryVideoBlob.size / (1024 * 1024)).toFixed(2)} MB</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleApprovePreliminary}
                disabled={isGeneratingVideo}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                🎬 Aprobar plan y generar video visual
              </button>

              <button
                type="button"
                onClick={handleDiscardPreliminary}
                disabled={isGeneratingVideo}
                className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Descartar y empezar de nuevo
              </button>
            </div>

            <p className="mt-4 text-xs text-emerald-700">Esta previsualización no ha consumido créditos de IA.</p>
          </section>
        )}

        {/* REVISIÓN Y APROBACIÓN DEL VIDEO VISUAL */}
        {visualVideoUrl && (
          <section className="mb-8 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Etapa visual generada</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Revisa el video antes de crear el audio</h2>
            <video src={visualVideoUrl} controls playsInline className="mt-5 w-full max-w-xl rounded-2xl border border-gray-200 bg-black shadow-sm" />
            <p className="mt-3 text-sm text-gray-600">La generación visual ya se realizó. Todavía no se ha generado narración ni mezclado música.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={handleApproveVisual} className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white">✓ Aprobar video visual y pasar al audio</button>
              <button type="button" onClick={() => { setVisualVideoUrl(null); setVisualApproved(false); setShowPremiumForm(false); }} className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700">No aprobar / volver a generar</button>
            </div>
          </section>
        )}

        {/* ETAPA 2: FORMULARIO COMERCIAL */}

        {showPremiumForm && visualApproved && visualVideoUrl && (
          <section
            id="premium-form"
            className="mb-8 scroll-mt-6 rounded-3xl border border-blue-200 bg-white p-6 shadow-sm md:p-8"
          >
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Etapa 2 · Audio del anuncio
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              🎙️ Narración y música del anuncio
            </h2>

            <p className="mt-2 text-gray-600">
              El video visual ya está aprobado. Completa o revisa los datos comerciales y configura la narración y la música. ShortBizAI añadirá el audio al video aprobado sin volver a generar las escenas.
            </p>

            <div className="mt-6 space-y-5">

              {/* MARCA DE ESTA CAMPAÑA */}
              <div>
                <label htmlFor="campaign-brand" className="block text-sm font-semibold text-gray-900">Marca que debe aparecer en este anuncio</label>
                <input id="campaign-brand" value={campaignBrand} onChange={(event) => setCampaignBrand(event.target.value)} 
                
               placeholder="Ej. Descubre una nueva experiencia con nuestra empresa" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500" />
                <p className="mt-1 text-xs text-gray-500">Se utilizará esta marca en la narración y en las instrucciones del video; no se sustituirá por otra empresa del perfil. Escribe título, descripción, oferta y llamado a la acción en el idioma que selecciones.</p>
              </div>

              {/* TÍTULO */}

              <div>
                <label
                  htmlFor="premium-title"
                  className="block text-sm font-semibold text-gray-900"
                >
                  Título del anuncio
                </label>

                <input
                  id="premium-title"
                  value={premiumForm.title}
                  onChange={(event) =>
                    updatePremiumField("title", event.target.value)
                  }
                  placeholder="Ej. Descubre Washington con My Travel Col Tour"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* VOZ E IDIOMA DE LA NARRACIÓN */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="narration-voice" className="block text-sm font-semibold text-gray-900">Voz de la narración</label>
                  <select id="narration-voice" value={narrationVoice} onChange={(event) => setNarrationVoice(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900">
                    <option value="Charon">Masculina · profesional y serena</option>
                    <option value="Puck">Masculina · dinámica y enérgica</option>
                    <option value="Fenrir">Masculina · documental y expresiva</option>
                    <option value="Orus">Masculina · firme y comercial</option>
                    <option value="Kore">Femenina · firme</option>
                    <option value="Aoede">Femenina · cálida</option>
                    <option value="Zephyr">Femenina · clara y brillante</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="narration-language" className="block text-sm font-semibold text-gray-900">Idioma de la narración</label>
                  <select id="narration-language" value={narrationLanguage} onChange={(event) => setNarrationLanguage(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900">
                    <option value="Spanish (Latin America)">Español latinoamericano</option>
                    <option value="Spanish (Mexico)">Español de México</option>
                    <option value="Spanish (Spain)">Español de España</option>
                    <option value="English (US)">Inglés estadounidense</option>
                    <option value="English (UK)">Inglés británico</option>
                    <option value="French (France)">Francés</option>
                    <option value="Portuguese (Brazil)">Portugués de Brasil</option>
                    <option value="Italian (Italy)">Italiano</option>
                    <option value="German (Germany)">Alemán</option>
                  </select>
                </div>
              </div>

              {/* DESCRIPCIÓN */}

              <div>
                <label
                  htmlFor="premium-description"
                  className="block text-sm font-semibold text-gray-900"
                >
                  Descripción comercial
                </label>

                <textarea
                  id="premium-description"
                  value={premiumForm.description}
                  onChange={(event) =>
                    updatePremiumField("description", event.target.value)
                  }
                  rows={3}
                  placeholder="Describe el viaje, el servicio, la experiencia o el producto."
                  className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* OFERTA Y PRECIO */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="premium-offer"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Oferta o promoción
                  </label>

                  <input
                    id="premium-offer"
                    value={premiumForm.offer}
                    onChange={(event) =>
                      updatePremiumField("offer", event.target.value)
                    }
                    placeholder="Ej. Excursión especial de fin de semana"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="premium-price"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Precio
                  </label>

                  <input
                    id="premium-price"
                    value={premiumForm.price}
                    onChange={(event) =>
                      updatePremiumField("price", event.target.value)
                    }
                    placeholder="Ej. $360 por persona"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* CTA */}

              <div>
                <label
                  htmlFor="premium-cta"
                  className="block text-sm font-semibold text-gray-900"
                >
                  Llamada a la acción
                </label>

                <input
                  id="premium-cta"
                  value={premiumForm.cta}
                  onChange={(event) =>
                    updatePremiumField("cta", event.target.value)
                  }
                  placeholder="Reserva tu lugar hoy"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* ESTILO Y PLATAFORMA */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="premium-style"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Estilo del anuncio
                  </label>

                  <select
                    id="premium-style"
                    value={premiumForm.style}
                    onChange={(event) =>
                      updatePremiumField("style", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
                  >
                    <option value="Premium cinematográfico">
                      Premium cinematográfico
                    </option>
                    <option value="Elegante">Elegante</option>
                    <option value="Moderno">Moderno</option>
                    <option value="Energético">Energético</option>
                    <option value="Minimalista">Minimalista</option>
                    <option value="Documental">Documental</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="premium-platform"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Plataforma de publicación
                  </label>

                  <select
                    id="premium-platform"
                    value={premiumForm.platform}
                    onChange={(event) =>
                      updatePremiumField("platform", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
                  >
                    <option value="Instagram + TikTok + YouTube Shorts">
                      Instagram + TikTok + YouTube Shorts
                    </option>
                    <option value="Instagram Reels">
                      Instagram Reels
                    </option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube Shorts">
                      YouTube Shorts
                    </option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
              </div>

              {/* PROMPT DE AUDIO Y MÚSICA */}
              <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
                <label htmlFor="audio-prompt" className="block text-sm font-semibold text-gray-900">Prompt 2 · Instrucción musical y de audio</label>
                <p className="mt-1 text-xs text-gray-600">Indica el ambiente musical, género, ritmo, instrumentos, energía y estilo de interpretación de la voz. Esta instrucción se usa únicamente en la etapa de audio.</p>
                <textarea id="audio-prompt" value={audioPrompt} onChange={(event) => setAudioPrompt(event.target.value)} maxLength={1200} rows={5} disabled={isGeneratingVideo} className="mt-2 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm" placeholder="Ej. Música épica y emotiva, percusión suave, cuerdas y piano..." />
                <p className="mt-1 text-right text-xs text-gray-500">{audioPrompt.length}/1200 caracteres</p>
              </div>

              {/* GUION DE NARRACIÓN */}
              <div className="mt-6">
                <label htmlFor="narration-script" className="block text-sm font-semibold text-gray-900">Guion de narración (opcional)</label>
                <p className="mt-1 text-xs text-gray-500">Escribe lo que debe decir la voz. Si lo dejas vacío, ShortBizAI redactará la narración a partir de los datos comerciales.</p>
                <textarea id="narration-script" value={narrationScript} onChange={(event) => setNarrationScript(event.target.value)} maxLength={900} rows={4} placeholder="Escribe la narración o deja este espacio vacío para generarla automáticamente." className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm" />
                <p className="mt-1 text-right text-xs text-gray-500">{narrationScript.length}/900</p>
              </div>

              {/* MÚSICA DE FONDO */}

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  🎵 Música de fondo del anuncio
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Sube una pista instrumental. ShortBizAI la mezclará
                  automáticamente con la voz comercial y el video final.
                </p>

                <label
                  htmlFor="premium-background-music"
                  className="mt-4 block text-sm font-semibold text-gray-900"
                >
                  Seleccionar archivo de audio
                </label>

                <input
                  id="premium-background-music"
                  type="file"
                  accept=".mp3,.wav,.m4a,.aac,audio/*"
                  disabled={isGeneratingVideo}
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;

                    if (file && file.size > 25 * 1024 * 1024) {
                      alert("El audio no puede superar los 25 MB.");
                      event.target.value = "";
                      setBackgroundMusicFile(null);
                      return;
                    }

                    setBackgroundMusicFile(file);
                  }}
                  className="mt-2 block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                />

                {backgroundMusicFile && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-green-700">
                      ✓ {backgroundMusicFile.name}
                    </p>

                    <button
                      type="button"
                      disabled={isGeneratingVideo}
                      onClick={() => {
                        setBackgroundMusicFile(null);
                        const input = document.getElementById(
                          "premium-background-music"
                        ) as HTMLInputElement | null;

                        if (input) input.value = "";
                      }}
                      className="text-sm font-semibold text-red-600"
                    >
                      Quitar música
                    </button>
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-500">
                  Formatos: MP3, WAV, M4A y AAC. Máximo 25 MB.
                  Utiliza música que tengas derecho a utilizar.
                  Si no cargas una pista, se usará la música predeterminada
                  del servidor si está configurada.
                </p>
              </div>

              {/* ENLACE DE RESERVA */}

              {reservationUrl && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Enlace de reserva del negocio
                  </p>

                  <p className="mt-2 break-all text-sm text-gray-700">
                    {reservationUrl}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Este enlace estará disponible para la composición
                    del anuncio y su llamada a la acción.
                  </p>
                </div>
              )}

              {/* CONFIRMACIÓN */}

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">
                  ⚠️ Antes de generar el anuncio premium
                </p>

                <p className="mt-1 text-sm text-amber-800">
                  {posterMode ? "La siguiente operación añadirá narración y música al video visual aprobado. No volverá a generar escenas. La voz y la música generada con IA pueden consumir créditos de fal.ai; si subes una pista propia, se usará esa pista." : "La siguiente operación generará la narración y mezclará el audio con el video visual aprobado. No volverá a generar escenas."} Revisaremos la información y te pediremos autorización antes de iniciar.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateFinalVideo}
                disabled={isGeneratingVideo}
                className="w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGeneratingVideo
                  ? "⏳ Generando anuncio premium..."
                  : (posterMode ? "🎧 Generar audio y terminar comercial" : "🎧 Generar audio y terminar comercial")}
              </button>

              {isGeneratingVideo && (
                <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                  ShortBizAI está generando la narración y mezclando el audio con el video visual aprobado. No cierres esta página mientras termina.
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIDEO FINAL */}

        {videoUrl && (
          <section className="mb-8 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
              Proceso completado
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              🎉 Anuncio premium generado
            </h2>

            <video
              src={videoUrl}
              controls
              playsInline
              className="mt-5 w-full max-w-xl rounded-2xl border border-gray-200 bg-black shadow-sm"
            />

            <div className="mt-5">
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >
                ↗️ Abrir / descargar video final
              </a>
            </div>
          </section>
        )}

        {/* MÉTRICAS */}

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Rendimiento de Atracción
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">Videos</p>
              <p className="mt-2 text-3xl font-black text-gray-900">
                8 / 12
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Meta mensual
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">Alcance</p>
              <p className="mt-2 text-3xl font-black text-gray-900">
                25.340
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Personas alcanzadas
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">Reproducciones</p>
              <p className="mt-2 text-3xl font-black text-gray-900">
                18.900
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Visualizaciones
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">Mensajes</p>
              <p className="mt-2 text-3xl font-black text-gray-900">
                126
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Interacciones
              </p>
            </div>
          </div>
        </section>

        {/* RESUMEN DEL MES */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Resumen del mes
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Videos publicados
              </p>
              <p className="mt-2 text-2xl font-black">8</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Próxima publicación
              </p>
              <p className="mt-2 text-2xl font-black">Viernes</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Meta mensual</p>
              <p className="mt-2 text-2xl font-black">12 videos</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Estado</p>
              <p className="mt-2 text-2xl font-black text-blue-600">
                En progreso
              </p>
            </div>
          </div>
        </section>

        {/* BIBLIOTECA */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:p-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Biblioteca de Videos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Aquí aparecerán los videos creados para este negocio.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {videos.length} videos
            </span>
          </div>

          {videos.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
              <p className="text-4xl">🎬</p>

              <p className="mt-3 font-semibold text-gray-700">
                Todavía no hay videos en la biblioteca.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Crea tu primer Short usando el generador de arriba.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, index) => {
                const urls = getVideoUrls(video);

                const existingVideoUrl =
                  video.video_url ||
                  video.url ||
                  urls[0] ||
                  "";

                const titulo =
                  video.titulo ||
                  video.title ||
                  `Video ${index + 1}`;

                const descripcion =
                  video.descripcion ||
                  video.description ||
                  "";

                return (
                  <div
                    key={video.id ?? `video-${index}`}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                  >
                    {existingVideoUrl ? (
                      <video
                        src={existingVideoUrl}
                        controls
                        className="aspect-video w-full bg-black object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-gray-100 text-gray-400">
                        Sin video disponible
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">
                        {titulo}
                      </h3>

                      {descripcion && (
                        <p className="mt-2 text-sm text-gray-500">
                          {descripcion}
                        </p>
                      )}

                      {video.plataforma && (
                        <p className="mt-3 text-xs font-semibold text-blue-600">
                          {video.plataforma}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* AUTOMATIZACIÓN FUTURA */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Automatización de Atracción
          </h2>

          <p className="mt-2 text-gray-500">
            Estas son las siguientes capacidades que construiremos
            dentro de este mismo módulo.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-5">
              <div className="text-3xl">✅</div>
              <h3 className="mt-3 font-bold">Aprobación</h3>
              <p className="mt-2 text-sm text-gray-500">
                El negocio podrá revisar el contenido antes de publicarlo.
              </p>
            </div>

            <div className="rounded-2xl border p-5">
              <div className="text-3xl">📅</div>
              <h3 className="mt-3 font-bold">Calendario</h3>
              <p className="mt-2 text-sm text-gray-500">
                Programaremos la creación y publicación de los Shorts.
              </p>
            </div>

            <div className="rounded-2xl border p-5">
              <div className="text-3xl">🤖</div>
              <h3 className="mt-3 font-bold">
                Publicación automática
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Conectaremos las cuentas sociales del negocio
                para publicar automáticamente.
              </p>
            </div>
          </div>
        </section>

        {/* RECOMENDACIÓN */}

        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg md:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-100">
            Recomendación ShortBizAI
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Mantén una publicación constante.
          </h2>

          <p className="mt-3 max-w-3xl text-blue-50">
            Crear contenido de manera constante permitirá aumentar
            el alcance del negocio y llevar más personas directamente
            hacia las reservas.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-xl bg-white px-5 py-3 font-bold text-blue-700 hover:bg-blue-50"
            >
              ➕ Solicitar nueva grabación
            </button>

            <button
              type="button"
              className="rounded-xl border border-white/30 px-5 py-3 font-bold text-white hover:bg-white/10"
            >
              📅 Solicitar reunión
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
