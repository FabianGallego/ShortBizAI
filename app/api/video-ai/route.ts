import { fal } from "@fal-ai/client";

import {
  createAiDirectorPlan,
  type AiDirectorInput,
} from "@/lib/aiDirector";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { spawn } from "node:child_process";

import {

  mkdtemp,

  readFile,

  rm,

  writeFile,

} from "node:fs/promises";

import { tmpdir } from "node:os";

import path from "node:path";



export const runtime = "nodejs";

export const maxDuration = 300;



/* =========================================================

   CONFIGURACIÓN

========================================================= */



const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const MAX_PREPARED_VIDEO_BYTES = 150 * 1024 * 1024;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const MAX_IMAGES = 5;
const MAX_VIDEOS = 5;



const WIDTH = 720;

const HEIGHT = 1280;

const FPS = 24;



type FalAudioResult = {

  audio?: {

    url?: string;

  };

};



type AdFields = {
  title: string;
  description: string;
  offer: string;
  price: string;
  cta: string;
  businessName: string;
  campaignBrand: string;
  duration: number;
  style: string;
  platform: string;
  voice: string;
  languageCode: string;
  narrationText: string;
  audioPrompt: string;
};




/* =========================================================

   UTILIDADES

========================================================= */



function clean(

  value: FormDataEntryValue | null,

  fallback = ""

): string {

  return typeof value === "string"

    ? value.trim().slice(0, 1200)

    : fallback;

}



function getDuration(value: string): number {
  const parsed = Number(value);

  return [15, 30, 45].includes(parsed) ? parsed : 15;
}



function getPosterDuration(value: string): number {
  const parsed = Number(value);
  return [15, 30, 45].includes(parsed) ? parsed : 30;
}



function getAdFields(formData: FormData): AdFields {

  return {

    title: clean(formData.get("title")),

    description: clean(formData.get("description")),

    offer: clean(formData.get("offer")),

    price: clean(formData.get("price")),

    cta: clean(formData.get("cta"), "Contáctanos hoy"),

    businessName: clean(formData.get("businessName")),
    campaignBrand: clean(formData.get("campaignBrand"), clean(formData.get("businessName"))),

    duration: getDuration(

      clean(formData.get("duration"), "15")

    ),

    style: clean(formData.get("style"), "Premium"),

    platform: clean(

      formData.get("platform"),

      "Instagram Reels / TikTok / YouTube Shorts"

    ),
    voice: clean(formData.get("voice"), "Fenrir"),
    languageCode: clean(formData.get("languageCode"), "Spanish (Latin America)"),
    narrationText: clean(formData.get("narrationText"), "").slice(0, 900),
    audioPrompt: clean(formData.get("audioPrompt"), "").slice(0, 1200),

  };

}



async function probeMedia(filePath: string): Promise<{ duration: number; hasAudio: boolean }> {
  return new Promise((resolve, reject) => {
    const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";
    const child = spawn(
      ffprobePath,
      [
        "-v", "error",
        "-show_entries", "format=duration:stream=codec_type",
        "-of", "json",
        filePath,
      ],
      { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { stderr = (stderr + chunk.toString()).slice(-4000); });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code !== 0) {
        reject(new Error(`No se pudo analizar el MP4 con ffprobe: ${stderr}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        const duration = Number(parsed.format?.duration);
        if (!Number.isFinite(duration) || duration <= 0) {
          throw new Error("El video aprobado no tiene una duración válida.");
        }
        resolve({
          duration,
          hasAudio: Array.isArray(parsed.streams) && parsed.streams.some((stream: { codec_type?: string }) => stream.codec_type === "audio"),
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

/* =========================================================

   EJECUTAR FFMPEG

========================================================= */



function runFfmpeg(

  args: string[],

  cwd: string

): Promise<void> {

  return new Promise((resolve, reject) => {

    const ffmpegPath =

      process.env.FFMPEG_PATH || "ffmpeg";



    const child = spawn(

      ffmpegPath,

      ["-hide_banner", "-loglevel", "error", ...args],

      {

        cwd,

        windowsHide: true,

        stdio: ["ignore", "ignore", "pipe"],

      }

    );



    let stderr = "";



    child.stderr.on("data", (chunk: Buffer) => {

      stderr = (

        stderr + chunk.toString()

      ).slice(-12000);

    });



    child.once("error", (error) => {

      reject(

        new Error(

          `No se pudo ejecutar FFmpeg. Instálalo en el servidor o configura FFMPEG_PATH. ${error.message}`

        )

      );

    });



    child.once("close", (code) => {

      if (code === 0) {

        resolve();

      } else {

        reject(

          new Error(

            `FFmpeg terminó con código ${code}: ${stderr}`

          )

        );

      }

    });

  });

}



/* =========================================================

   DESCARGA DE RECURSOS

   Los reintentos solo se aplican a descargas HTTP.

========================================================= */



async function downloadFile(

  url: string,

  destination: string

): Promise<void> {

  let lastError: unknown;



  for (let attempt = 1; attempt <= 3; attempt++) {

    try {

      const response = await fetch(url, {

        signal: AbortSignal.timeout(90000),

      });



      if (!response.ok) {

        throw new Error(

          `No se pudo descargar un recurso (${response.status}).`

        );

      }



      const bytes = Buffer.from(

        await response.arrayBuffer()

      );



      if (bytes.length === 0) {

        throw new Error("El archivo descargado está vacío.");

      }



      await writeFile(destination, bytes);

      return;

    } catch (error) {

      lastError = error;



      if (attempt < 3) {

        console.warn(

          `Reintento de descarga ${attempt}/3`,

          error

        );

      }

    }

  }



  throw lastError instanceof Error

    ? lastError

    : new Error("No se pudo descargar el recurso.");

}



/* =========================================================

   VALIDACIÓN DE FOTOS

========================================================= */



function getImages(formData: FormData): File[] {

  return formData

    .getAll("images")

    .filter(

      (item): item is File =>

        item instanceof File

    );

}



function validateImages(

  sourceType: string,

  images: File[]

): string | null {

  if (images.length === 0) {

    return "Selecciona al menos una foto.";

  }



  if (images.length > MAX_IMAGES) {

    return `Puedes enviar como máximo ${MAX_IMAGES} fotos.`;

  }



  if (

    sourceType === "single-image" &&

    images.length !== 1

  ) {

    return "En el modo de una foto, envía exactamente una imagen.";

  }



  



  for (const image of images) {

    if (!image.type.startsWith("image/")) {

      return "Todos los archivos deben ser imágenes.";

    }



    if (image.size > MAX_IMAGE_BYTES) {

      return "Cada imagen debe pesar máximo 10 MB.";

    }

  }



  return null;

}



/* =========================================================

   ETAPA 1: PREPARACIÓN LOCAL DE FOTOS

   No utiliza FAL ni modelos de inteligencia artificial.

========================================================= */



async function prepareImageClip(

  image: File,

  index: number,

  duration: number,

  workDir: string

): Promise<string> {

  const inputName = `photo-${index}.jpg`;

  const outputName = `photo-clip-${index}.mp4`;

  const inputPath = path.join(workDir, inputName);



  await writeFile(inputPath, Buffer.from(await image.arrayBuffer()));



  const totalFrames = Math.max(2, Math.round(duration * FPS));

  const lastFrame = totalFrames - 1;

  const progress = `on/${lastFrame}`;



  // Alterna desplazamientos suaves para dar variedad a cada escena.

  const movements = [

    { x: `(iw-iw/zoom)*${progress}`, y: `(ih-ih/zoom)*0.5`, zoom: `1+0.16*${progress}` },

    { x: `(iw-iw/zoom)*(1-${progress})`, y: `(ih-ih/zoom)*0.5`, zoom: `1+0.15*${progress}` },

    { x: `(iw-iw/zoom)*0.5`, y: `(ih-ih/zoom)*${progress}`, zoom: `1+0.17*${progress}` },

    { x: `(iw-iw/zoom)*0.5`, y: `(ih-ih/zoom)*(1-${progress})`, zoom: `1+0.15*${progress}` },

    { x: `(iw-iw/zoom)*${progress}`, y: `(ih-ih/zoom)*${progress}`, zoom: `1+0.16*${progress}` },

  ];

  const movement = movements[index % movements.length];



  const videoFilter = [

    "scale=1080:1920:force_original_aspect_ratio=increase",

    "crop=1080:1920",

    `zoompan=z='${movement.zoom}':x='${movement.x}':y='${movement.y}':d=1:s=${WIDTH}x${HEIGHT}:fps=${FPS}`,

    "eq=contrast=1.06:saturation=1.10:brightness=0.01",

    "unsharp=5:5:0.45:5:5:0.0",

    "vignette=PI/5",

    "format=yuv420p",

  ].join(",");



  await runFfmpeg([

    "-y", "-loop", "1", "-framerate", String(FPS), "-i", inputName,

    "-vf", videoFilter, "-frames:v", String(totalFrames), "-an",

    "-c:v", "libx264", "-preset", "fast", "-crf", "18",

    "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart",

    outputName,

  ], workDir);



  return outputName;

}



/* =========================================================

   UNIR CLIPS CON TRANSICIONES SUAVES

========================================================= */



async function joinPreparedClips(

  clipNames: string[],

  clipDurations: number[],

  workDir: string

): Promise<string> {

  const outputName = "shortbizai-preliminary.mp4";

  const outputPath = path.join(workDir, outputName);



  if (clipNames.length === 0 || clipNames.length !== clipDurations.length) {

    throw new Error("No hay clips válidos para construir la previsualización.");

  }



  if (clipNames.length === 1) {

    await runFfmpeg([

      "-y", "-i", clipNames[0], "-an", "-c:v", "libx264",

      "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",

      "-movflags", "+faststart", outputName,

    ], workDir);

    return outputPath;

  }



  const transition = 13 / FPS;

  const args: string[] = ["-y"];

  for (const clipName of clipNames) args.push("-i", clipName);



  const filters: string[] = [];

  for (let i = 0; i < clipNames.length; i++) {

    filters.push(

      `[${i}:v]settb=AVTB,setpts=PTS-STARTPTS,fps=${FPS},format=yuv420p[clip${i}]`

    );

  }



  let previousLabel = "clip0";

  for (let i = 1; i < clipNames.length; i++) {

    const offset = clipDurations

      .slice(0, i)

      .reduce((sum, value) => sum + value, 0) - transition * i;

    const outputLabel = `transition${i}`;

    filters.push(

      `[${previousLabel}][clip${i}]xfade=transition=fade:duration=${transition.toFixed(4)}:offset=${offset.toFixed(4)}[${outputLabel}]`

    );

    previousLabel = outputLabel;

  }



  filters.push(

    `[${previousLabel}]fade=t=in:st=0:d=0.25,fade=t=out:st=${Math.max(0.25, clipDurations.reduce((a, b) => a + b, 0) - transition * (clipNames.length - 1) - 0.3).toFixed(3)}:d=0.3,format=yuv420p[final]`

  );



  args.push(

    "-filter_complex", filters.join(";"), "-map", "[final]", "-an",

    "-c:v", "libx264", "-preset", "fast", "-crf", "18",

    "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart",

    outputName,

  );



  await runFfmpeg(args, workDir);

  return outputPath;

}



/* =========================================================

   ETAPA 1: PREPARACIÓN LOCAL DE VIDEO ORIGINAL

========================================================= */



async function prepareOriginalVideos(
  videos: File[],
  duration: number,
  workDir: string
): Promise<string> {
  if (videos.length === 0) {
    throw new Error("Selecciona al menos un video original.");
  }

  if (videos.length > MAX_VIDEOS) {
    throw new Error(`Puedes enviar como máximo ${MAX_VIDEOS} videos.`);
  }

  for (const video of videos) {
    if (!video.type.startsWith("video/")) {
      throw new Error(`El archivo ${video.name} no es un video válido.`);
    }

    if (video.size > MAX_VIDEO_BYTES) {
      throw new Error(`El video ${video.name} supera el límite de 100 MB.`);
    }
  }

  const outputName = "shortbizai-preliminary.mp4";
  const normalizedFiles: string[] = [];

  // Distribuye la duración total entre los clips.
  const baseDuration = duration / videos.length;

  for (let index = 0; index < videos.length; index++) {
    const video = videos[index];
    const inputName = `original-video-${index + 1}.input`;
    const normalizedName = `original-video-${index + 1}.mp4`;

    const inputPath = path.join(workDir, inputName);

    await writeFile(
      inputPath,
      Buffer.from(await video.arrayBuffer())
    );

    const mediaInfo = await probeMedia(inputPath);

    const segmentDuration =
      index === videos.length - 1
        ? duration - baseDuration * index
        : baseDuration;

    const args: string[] = [
      "-y",
      "-i",
      inputName,
    ];

    // Si el video no tiene audio, incorpora una pista silenciosa.
    if (!mediaInfo.hasAudio) {
      args.push(
        "-f",
        "lavfi",
        "-t",
        String(segmentDuration),
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=48000"
      );
    }

    const videoFilter = [
      `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase`,
      `crop=${WIDTH}:${HEIGHT}`,
      `fps=${FPS}`,
      "setsar=1",
      "eq=contrast=1.04:saturation=1.08",
      "tpad=stop_mode=clone:stop_duration=2",
      "format=yuv420p",
    ].join(",");

    args.push(
      "-map",
      "0:v:0",
      "-map",
      mediaInfo.hasAudio ? "0:a:0" : "1:a:0",
      "-vf",
      videoFilter,
      "-af",
      "aresample=48000,apad",
      "-t",
      String(segmentDuration),
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "19",
      "-pix_fmt",
      "yuv420p",
      "-r",
      String(FPS),
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-movflags",
      "+faststart",
      normalizedName
    );

    await runFfmpeg(args, workDir);

    normalizedFiles.push(normalizedName);
  }

  // Crear la lista de clips normalizados.
  const concatListName = "original-videos-concat.txt";

  const concatContent = normalizedFiles
    .map((file) => `file '${file}'`)
    .join("\n");

  await writeFile(
    path.join(workDir, concatListName),
    concatContent,
    "utf8"
  );

  // Unir los clips en un único MP4.
  await runFfmpeg(
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListName,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      outputName,
    ],
    workDir
  );

  return path.join(workDir, outputName);
}



/* =========================================================

   RESPUESTA DE PREPARACIÓN

========================================================= */



/* AFICHE A VIDEO: PRODUCCIÓN CINEMATOGRÁFICA CON HAILUO 02 PRO */
const HAILUO_IMAGE_MODEL = "fal-ai/minimax/hailuo-02/pro/image-to-video";

async function generatePosterVideoPath(formData: FormData, workDir: string): Promise<string> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("Falta configurar FAL_KEY en el servidor.");
  const poster = formData.get("posterImage");
  if (!(poster instanceof File) || poster.size === 0) throw new Error("Selecciona el afiche que deseas animar.");
  if (!poster.type.startsWith("image/")) throw new Error("El afiche debe ser una imagen JPG, PNG o WEBP.");
  if (poster.size > MAX_IMAGE_BYTES) throw new Error("El afiche no puede superar los 10 MB.");

  const duration = getPosterDuration(clean(formData.get("duration"), "30"));
  const fields = getAdFields(formData);
  const userVisualPrompt = clean(formData.get("prompt"), "").slice(0, 600);
  if (!userVisualPrompt) throw new Error("Escribe la instrucción visual antes de generar el video.");
  fal.config({ credentials: apiKey });

  const posterArrayBuffer = await poster.arrayBuffer();
  const posterBytes = Buffer.from(posterArrayBuffer);
  const posterExtension = poster.type === "image/jpeg" ? ".jpg" : poster.type === "image/webp" ? ".webp" : ".png";
  const localPosterPath = path.join(workDir, `campaign-original-poster${posterExtension}`);
  await writeFile(localPosterPath, posterBytes);
  const imageUrl = await fal.storage.upload(new File([posterArrayBuffer], poster.name || `shortbizai-poster${posterExtension}`, { type: poster.type }));
  const suppliedSceneFiles = formData.getAll("posterSceneImages").filter((item): item is File => item instanceof File && item.size > 0);
  if (suppliedSceneFiles.length > 6) throw new Error("Puedes adjuntar como máximo seis fotografías individuales para las escenas.");
  for (const sceneFile of suppliedSceneFiles) {
    if (!sceneFile.type.startsWith("image/")) throw new Error("Las imágenes individuales deben ser JPG, PNG o WEBP.");
    if (sceneFile.size > MAX_IMAGE_BYTES) throw new Error(`La imagen ${sceneFile.name} supera el límite de 10 MB.`);
  }
  const sceneImageUrls = await Promise.all(suppliedSceneFiles.map(async (file, index) => {
    const bytes = await file.arrayBuffer();
    return fal.storage.upload(new File([bytes], file.name || `shortbizai-scene-${index + 1}.jpg`, { type: file.type }));
  }));

  // Hailuo 02 Pro entrega clips de aproximadamente 6 s por solicitud.
  // Se generan 2, 4 o 6 escenas según la duración elegida; el cierre conserva
  // el afiche original para no alterar precios, marca, fechas ni teléfonos.
  const sceneCountByDuration: Record<number, number> = { 15: 3, 30: 4, 45: 6 };
  const clipSeconds = duration === 15 ? 4 : 6;
  const requestedSceneCount = sceneCountByDuration[duration] || 4;
  // MODO CREATIVO: no asignamos acciones literales (barco, paneo, presentador).
  // Cada toma invita a Hailuo a interpretar libremente el material visual y
  // descubrir por sí mismo qué movimiento cinematográfico funciona mejor.
  const scenes = Array.from({ length: sceneImageUrls.length > 0 ? Math.min(requestedSceneCount, sceneImageUrls.length) : requestedSceneCount }, (_, index) => ({
    key: `creative-take-${index + 1}`,
    takeNumber: index + 1,
  }));

  const generated = await Promise.all(scenes.map(async (scene, index) => {
    const sceneImageUrl = sceneImageUrls[index] || imageUrl;
    const sceneSourceInstruction = sceneImageUrls[index]
      ? "Use this individual photograph as the visual source. Interpret its actual subject and setting freely; do not add a predetermined action or unrelated objects."
      : "Use the complete original campaign poster as your visual reference and creative starting point. Read and interpret its photographic content intelligently. Do not treat the poster as a flat page that merely zooms in or out. Discover the strongest visual subject or moment within it and bring that content to life.";
    // Hailuo 02 Pro limita el campo prompt a 2.000 caracteres.
    // La voz, música, datos comerciales y guion se procesan en otras etapas;
    // aquí enviamos únicamente dirección visual breve para evitar el error 422.
    // Solo dirección VISUAL. No incorporar aquí guion, campaña, marca,
    // precio, teléfono, instrucciones de voz/música ni texto libre del usuario.
    // Hailuo limita body.prompt a 2.000 caracteres; este prompt fijo queda
    // ampliamente por debajo del límite y evita duplicaciones accidentales.
    const prompt = [
      `Premium photorealistic vertical 9:16 travel-film shot, take ${scene.takeNumber} of ${scenes.length}. Animate only subjects genuinely visible in the supplied image.`,
      "Choose the most compelling natural action and camera movement for this exact image. Create coherent subject or environmental motion, layered foreground/background parallax, changing perspective, smooth tracking or cinematic panning, natural light and atmospheric depth. Avoid a simple digital zoom.",
      sceneSourceInstruction,
      "Preserve recognizable people, faces, architecture and objects. Do not invent destinations, boats, rivers, presenters or vehicles. No text, logos, prices, phone numbers, watermarks, flicker, morphing or distorted subjects. One immersive continuous shot with premium live-action documentary cinematography.",
      `USER VISUAL DIRECTION: ${userVisualPrompt}`
    ].join(" ");
    if (prompt.length > 1800) {
      throw new Error(`La instrucción visual de Hailuo excede el límite seguro (${prompt.length} caracteres).`);
    }
    console.log(`[SHORTBIZAI] Hailuo prompt ${scene.key}: ${prompt.length}/1800 caracteres`);

    const result = await fal.subscribe(HAILUO_IMAGE_MODEL, {
      input: { image_url: sceneImageUrl, prompt },
      logs: true,
      onQueueUpdate: (update: { status?: string; logs?: Array<{ message: string }> }) => {
        if (update.status === "IN_PROGRESS") (update.logs || []).forEach((log) => console.log(`[HAILUO 02 PRO ${scene.key}] ${log.message}`));
      },
    });
    const generatedUrl = (result.data as FalVideoResult).video?.url;
    if (!generatedUrl) throw new Error(`Hailuo 02 Pro no devolvió la escena ${scene.key}.`);
    const segmentPath = path.join(workDir, `hailuo-scene-${index + 1}.mp4`);
    await downloadFile(generatedUrl, segmentPath);
    const info = await probeMedia(segmentPath);
    if (info.duration < clipSeconds - 0.5) throw new Error(`La escena ${scene.key} quedó demasiado corta (${info.duration.toFixed(1)} s).`);
    const normalizedPath = path.join(workDir, `hailuo-scene-normalized-${index + 1}.mp4`);
    await runFfmpeg([
      "-y", "-i", path.basename(segmentPath), "-an",
      "-vf", `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},fps=${FPS},setsar=1,format=yuv420p`,
      "-t", String(clipSeconds), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", normalizedPath,
    ], workDir);
    return normalizedPath;
  }));

  const generatedDuration = scenes.length * clipSeconds;
  const closingDuration = duration - generatedDuration;
  const generatedSegments = [...generated];
  if (closingDuration > 0) {
    const closingPath = path.join(workDir, "poster-original-animated-close.mp4");
    const totalFrames = Math.max(1, Math.round(closingDuration * FPS));
    const zoomExpression = `if(lte(on,${Math.round(totalFrames / 2)}),1+on*0.0007,1.021-(on-${Math.round(totalFrames / 2)})*0.0007)`;
    await runFfmpeg([
      "-y", "-loop", "1", "-framerate", String(FPS), "-i", path.basename(localPosterPath),
      "-t", String(closingDuration),
      "-vf", `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black,zoompan=z='${zoomExpression}':d=1:s=${WIDTH}x${HEIGHT}:fps=${FPS},setsar=1,format=yuv420p`,
      "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", closingPath,
    ], workDir);
    generatedSegments.push(closingPath);
  }

  const concatListPath = path.join(workDir, "poster-scenes-concat.txt");
  await writeFile(concatListPath, generatedSegments.map((file) => `file '${path.basename(file)}'`).join("\n"), "utf8");
  const finalScenesPath = path.join(workDir, "poster-cinematic-scenes.mp4");
  await runFfmpeg([
    "-y", "-f", "concat", "-safe", "0", "-i", path.basename(concatListPath),
    "-an", "-vf", `fps=${FPS},format=yuv420p`, "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", finalScenesPath,
  ], workDir);
  const finalInfo = await probeMedia(finalScenesPath);
  if (Math.abs(finalInfo.duration - duration) > 1.0) throw new Error(`El montaje de escenas dura ${finalInfo.duration.toFixed(1)} s; se esperaban ${duration} s.`);
  return finalScenesPath;
}

async function prepareLocally(

  formData: FormData,

  workDir: string

): Promise<NextResponse> {

  const sourceType = clean(

    formData.get("sourceType")

  );



  const duration = getDuration(

    clean(formData.get("duration"), "15")

  );



  let preliminaryPath: string;



  if (

    sourceType === "single-image" ||

    sourceType === "multiple-images"

  ) {

    const images = getImages(formData);



    const validationError = validateImages(

      sourceType,

      images

    );



    if (validationError) {

      return NextResponse.json(

        { error: validationError },

        { status: 400 }

      );

    }



    const transitionFrames = images.length > 1 ? 13 : 0;

    const requestedFrames = duration * FPS;

    const framesForAllClips =

      requestedFrames + transitionFrames * (images.length - 1);

    const baseFrames = Math.floor(framesForAllClips / images.length);

    const extraFrames = framesForAllClips % images.length;



    const clips: string[] = [];

    const clipDurations: number[] = [];



    for (let index = 0; index < images.length; index++) {

      const sceneFrames = baseFrames + (index < extraFrames ? 1 : 0);

      const sceneDuration = sceneFrames / FPS;

      const clip = await prepareImageClip(

        images[index], index, sceneDuration, workDir

      );

      clips.push(clip);

      clipDurations.push(sceneDuration);

    }



    preliminaryPath = await joinPreparedClips(

      clips,

      clipDurations,

      workDir

    );






 } else if (sourceType === "video") {
  const videos = formData
    .getAll("videoFiles")
    .filter(
      (item): item is File =>
        item instanceof File && item.size > 0
    );

  // Compatibilidad con el formulario anterior.
  if (videos.length === 0) {
    const legacyVideo = formData.get("videoFile");

    if (legacyVideo instanceof File && legacyVideo.size > 0) {
      videos.push(legacyVideo);
    }
  }

  if (videos.length === 0) {
    return NextResponse.json(
      { error: "Selecciona al menos un video original." },
      { status: 400 }
    );
  }

  if (videos.length > MAX_VIDEOS) {
    return NextResponse.json(
      { error: `Puedes enviar como máximo ${MAX_VIDEOS} videos.` },
      { status: 400 }
    );
  }

  preliminaryPath = await prepareOriginalVideos(
    videos,
    duration,
    workDir
  );



  } else {

    return NextResponse.json(

      { error: "Tipo de material de origen no válido." },

      { status: 400 }

    );

  }



  const preliminaryBytes = await readFile(

    preliminaryPath

  );



  if (

    preliminaryBytes.length >

    MAX_PREPARED_VIDEO_BYTES

  ) {

    return NextResponse.json(

      {

        error:

          "El video preliminar supera el tamaño permitido.",

      },

      { status: 413 }

    );

  }



  /*

   * Se devuelve el MP4 directamente.

   * El navegador lo guarda como Blob para mostrarlo

   * y enviarlo después si el usuario lo aprueba.

   */



  return new NextResponse(

    new Uint8Array(preliminaryBytes),

    {

      status: 200,

      headers: {

        "Content-Type": "video/mp4",

        "Content-Disposition":

          'inline; filename="shortbizai-preliminary.mp4"',

        "X-ShortBizAI-Stage": "local-preparation",

        "X-ShortBizAI-AI": "disabled",

        "Cache-Control": "no-store",

      },

    }

  );

}



/* =========================================================

   TRANSFORMACIÓN PREMIUM WAN 2.2 A14B

========================================================= */

const WAN_VIDEO_MODEL = "fal-ai/wan/v2.2-a14b/video-to-video";
const WAN_MAX_SEGMENT_SECONDS = 10;

type FalVideoResult = {
  video?: { url?: string };
};

/**
 * PROMPT MAESTRO PERMANENTE SHORTBIZAI PREMIUM.
 * No depende de que el usuario escriba instrucciones en cada campaña.
 * Los campos comerciales solo personalizan el anuncio; no sustituyen
 * las reglas cinematográficas ni autorizan inventar contenido.
 */
function buildCinematicPrompt(fields: AdFields, creativeDirection: string): string {
  const masterPrompt = [
    "SHORTBIZAI PREMIUM MASTER COMMERCIAL DIRECTOR.",
    "Create a finished, high-end, photorealistic advertising film with the visual standards of an internationally acclaimed commercial production studio.",
    "SOURCE-FIRST RULE: Treat the supplied video segment as the authoritative visual source. Transform and enhance its actual content; preserve the recognizable subject, real people, faces, clothing, products, landmarks, architecture, locations, event details and visual sequence. Do not replace the source with unrelated stock footage or create a different story.",
    "CINEMATOGRAPHY: Use purposeful, physically plausible camera movement, refined tracking and dolly motion, subtle parallax, stable framing, natural depth, realistic lens behavior, premium lighting, controlled highlights, rich but believable color grading, fine detail and polished commercial composition.",
    "MOTION: Keep people and objects anatomically and physically realistic. Preserve identity and scene geometry. Motion must be subtle, elegant and motivated by the source. Do not make static subjects move unnaturally.",
    "EDITING CONTINUITY: Maintain the source segment's temporal order and visual continuity. No jump cuts, random scene changes, flashy transitions, wipes, split screens, collages, repeated frames, duplicated people or abrupt changes in style. Do not add transitions inside an individual source segment.",
    "BRAND SAFETY: Do not invent, redraw, alter or hallucinate logos, brand marks, signage, readable words, prices, dates, offers, phone numbers, claims, products, services or locations. Do not add text, subtitles or watermarks. Commercial typography and calls to action are added later by the finishing stage, not generated inside the video.",
    "QUALITY: Avoid flicker, jitter, ghosting, warped faces, deformed hands, melting or bending buildings, unstable geometry, plastic skin, oversharpening, oversaturation, compression artifacts and artificial CGI appearance.",
    "ADVERTISING INTENT: Make the real source material feel aspirational, emotionally engaging, trustworthy and commercially polished. Every enhancement must support the supplied campaign, never distract from the actual subject.",
    `CAMPAIGN BRAND: ${fields.businessName || "Use only the brand visible or supplied by the advertiser; do not invent a brand."}`,
    `CAMPAIGN TITLE: ${fields.title || "Not supplied; do not invent on-screen wording."}`,
    `CAMPAIGN DESCRIPTION: ${fields.description || "Not supplied."}`,
    `OFFER: ${fields.offer || "Not supplied; do not invent an offer."}`,
    `PRICE: ${fields.price || "Not supplied; do not invent a price."}`,
    `CALL TO ACTION: ${fields.cta || "Not supplied; do not invent a call to action."}`,
    `CAMPAIGN STYLE: ${fields.style || "Luxury cinematic commercial, elegant and realistic."}`,
    `DESTINATION PLATFORM: ${fields.platform || "Vertical social video."}`,
    creativeDirection.trim()
      ? `ADDITIONAL USER CREATIVE NOTES (secondary to all source-preservation and brand-safety rules): ${creativeDirection.trim()}`
      : "No additional user creative notes. Follow the permanent ShortBizAI Premium creative direction.",
    "FINAL DIRECTIVE: Produce a coherent, premium, photorealistic transformation of this exact source segment. Preserve its content and sequence. Do not create text or new facts. Favor fidelity, visual polish and natural motion over dramatic but destructive changes.",
  ];
  return masterPrompt.join("\n").slice(0, 6500);
}

async function generateWanTransformation(
  inputPath: string,
  workDir: string,
  fields: AdFields,
  creativeDirection: string
): Promise<string> {
  const sourceInfo = await probeMedia(inputPath);
  const duration = sourceInfo.duration;
  const segmentCount = Math.ceil(duration / WAN_MAX_SEGMENT_SECONDS);
  const prompt = buildCinematicPrompt(fields, creativeDirection);
  const negativePrompt = "low quality, blurry, flicker, jitter, unstable camera, camera shake, distorted faces, identity change, deformed hands, extra fingers, duplicated people, duplicated objects, warped architecture, melting buildings, bent straight lines, changing landmarks, scene replacement, random stock footage, text, letters, subtitles, misspelled words, logos, watermarks, collage, split screen, flashy transitions, abrupt cuts, ghosting, frame blending artifacts, plastic skin, CGI look, oversaturated colors, excessive sharpening";
  const generatedSegments: string[] = [];

  // Repartir la duración equitativamente evita un último segmento demasiado corto.
  const segmentDuration = duration / segmentCount;
  for (let index = 0; index < segmentCount; index++) {
    const start = index * segmentDuration;
    const inputSegmentPath = path.join(workDir, `wan-input-${index + 1}.mp4`);
    const outputSegmentPath = path.join(workDir, `wan-output-${index + 1}.mp4`);

    await runFfmpeg([
      "-y", "-ss", start.toFixed(3), "-i", path.basename(inputPath),
      "-t", segmentDuration.toFixed(3), "-map", "0:v:0", "-an",
      "-vf", `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},fps=16,setsar=1`,
      "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
      inputSegmentPath,
    ], workDir);

    const inputBytes = await readFile(inputSegmentPath);
    const falInputFile = new File([inputBytes], `shortbizai-source-segment-${index + 1}.mp4`, { type: "video/mp4" });
    const videoUrl = await fal.storage.upload(falInputFile);
    const frameCount = Math.max(17, Math.min(161, Math.round(segmentDuration * 16)));

    const result = await fal.subscribe(WAN_VIDEO_MODEL, {
      input: {
        video_url: videoUrl,
        prompt,
        negative_prompt: negativePrompt,
        strength: 0.58,
        num_frames: frameCount,
        frames_per_second: 16,
        resolution: "720p",
        aspect_ratio: "9:16",
        num_inference_steps: 32,
        acceleration: "none",
        guidance_scale: 3.5,
        guidance_scale_2: 4,
        interpolator_model: "film",
        num_interpolated_frames: 1,
        adjust_fps_for_interpolation: true,
        video_quality: "maximum",
        video_write_mode: "balanced",
        resample_fps: true,
        enable_safety_checker: true,
        enable_output_safety_checker: true,
        enable_prompt_expansion: false,
      },
      logs: true,
      onQueueUpdate: (update: { status?: string; logs?: Array<{ message: string }> }) => {
        if (update.status === "IN_PROGRESS") {
          (update.logs || []).forEach((log) => console.log(`[WAN ${index + 1}/${segmentCount}] ${log.message}`));
        }
      },
    });

    const generatedUrl = (result.data as FalVideoResult).video?.url;
    if (!generatedUrl) {
      throw new Error(`WAN no devolvió un video para el segmento ${index + 1}.`);
    }
    await downloadFile(generatedUrl, outputSegmentPath);
    const generatedInfo = await probeMedia(outputSegmentPath);
    if (generatedInfo.duration < segmentDuration * 0.85) {
      throw new Error(`El segmento Premium ${index + 1} quedó demasiado corto (${generatedInfo.duration.toFixed(2)} s frente a ${segmentDuration.toFixed(2)} s). Se detuvo la edición para no entregar un video incompleto.`);
    }
    generatedSegments.push(outputSegmentPath);
  }

  if (generatedSegments.length === 1) return generatedSegments[0];

  const concatListPath = path.join(workDir, "wan-concat-list.txt");
  const concatList = generatedSegments.map((file) => `file '${path.basename(file).replace(/'/g, "'\\''")}'`).join("\n");
  await writeFile(concatListPath, concatList, "utf8");
  const joinedPath = path.join(workDir, "wan-transformed-joined.mp4");
  await runFfmpeg([
    "-y", "-f", "concat", "-safe", "0", "-i", path.basename(concatListPath),
    "-an", "-vf", `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS},format=yuv420p`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", joinedPath,
  ], workDir);

  const joinedInfo = await probeMedia(joinedPath);
  if (Math.abs(joinedInfo.duration - duration) > Math.max(1.0, duration * 0.08)) {
    throw new Error(`Control Premium: WAN devolvió ${joinedInfo.duration.toFixed(2)} s para un original de ${duration.toFixed(2)} s. No se publicará un video con una duración tan diferente.`);
  }
  return joinedPath;
}

/* =========================================================

   VOZ EN OFF

========================================================= */



async function generateVoiceover(

  fields: AdFields

): Promise<string | null> {

  const languagePhrases: Record<string, { discover: string; offer: string; price: string }> = {
    "Spanish (Latin America)": { discover: "Descubre", offer: "Aprovecha", price: "Precio" },
    "Spanish (Mexico)": { discover: "Descubre", offer: "Aprovecha", price: "Precio" },
    "Spanish (Spain)": { discover: "Descubre", offer: "Aprovecha", price: "Precio" },
    "English (US)": { discover: "Discover", offer: "Take advantage of", price: "Price" },
    "English (UK)": { discover: "Discover", offer: "Take advantage of", price: "Price" },
    "French (France)": { discover: "Découvrez", offer: "Profitez de", price: "Prix" },
    "Portuguese (Brazil)": { discover: "Descubra", offer: "Aproveite", price: "Preço" },
    "Italian (Italy)": { discover: "Scopri", offer: "Approfitta di", price: "Prezzo" },
    "German (Germany)": { discover: "Entdecken Sie", offer: "Nutzen Sie", price: "Preis" },
  };
  const phrases = languagePhrases[fields.languageCode] || languagePhrases["Spanish (Latin America)"];
  const generatedNarration = [
    fields.title ? `${fields.title}.` : (fields.campaignBrand ? `${phrases.discover} ${fields.campaignBrand}.` : "Una nueva experiencia está por comenzar."),
    fields.description ? `${fields.description}.` : "Hay lugares que merecen ser descubiertos y momentos que vale la pena vivir.",
    fields.offer ? `${phrases.offer}: ${fields.offer}.` : "",
    fields.price ? `${phrases.price}: ${fields.price}.` : "",
    fields.cta ? `${fields.cta}.` : "",
    fields.campaignBrand ? `${fields.campaignBrand}.` : "",
  ]
    .filter(Boolean)
    .join(" … ")
    .trim()
    .slice(0, 900);
  const narration = fields.narrationText.trim() || generatedNarration;
  const voiceCharacter = ["Kore", "Aoede", "Zephyr"].includes(fields.voice)
    ? "Adult feminine-sounding, warm, resonant and natural tone"
    : "Adult masculine-sounding, deep, warm, resonant and natural tone";

  if (!narration) {

    return null;

  }



  const result = await fal.subscribe(

    "fal-ai/gemini-tts",

    {

      input: {

        prompt: narration,

        style_instructions:

          `Interpret the exact supplied copy in ${fields.languageCode} as an intimate, premium documentary storyteller, NOT as a traditional radio or television commercial announcer. ${voiceCharacter}; calm authority; conversational storytelling; measured pace; expressive but restrained emotion; meaningful pauses at ellipses and sentence boundaries; subtle changes of intensity; precise diction without sounding over-enunciated. Make the listener feel invited into a travel story. Avoid salesy projection, exaggerated enthusiasm, theatrical acting, robotic cadence and a flat read. Do not add words, invent facts or translate brand names.`, 

        voice: ((["Charon", "Puck", "Fenrir", "Orus", "Kore", "Aoede", "Zephyr"].includes(fields.voice) ? fields.voice : "Fenrir") as any),

        model: "gemini-2.5-flash-tts",

        language_code: ((["Spanish (Latin America)", "Spanish (Mexico)", "Spanish (Spain)", "English (US)", "English (UK)", "French (France)", "Portuguese (Brazil)", "Italian (Italy)", "German (Germany)"].includes(fields.languageCode) ? fields.languageCode : "Spanish (Latin America)") as any),

     

      },

    }

  );



  return (

    result.data as FalAudioResult

  ).audio?.url ?? null;

}



/* =========================================================

   ACABADO PREMIUM

   Mezcla narración documental y música sobre la producción cinematográfica.

========================================================= */



async function finishPremiumVideo(
  inputPath: string,
  workDir: string,
  fields: AdFields,
  uploadedMusicPath: string | null,
  originalAudioPath: string | null = null,
  requireVoiceover = false
): Promise<string> {
  const outputPath = path.join(workDir, "shortbizai-video-final-premium.mp4");
  const sourceInfo = await probeMedia(inputPath);
  // La duración real del preliminar aprobado manda. Nunca se fuerza a 5 o 15 s.
  const duration = Math.max(0.5, sourceInfo.duration);
  const fadeOutStart = Math.max(0, duration - 0.35);

  const videoFilter = [
    `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease`,
    `pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black`,
    `fps=${FPS}`,
    "setsar=1",
    "format=yuv420p",
    "fade=t=in:st=0:d=0.25",
    `fade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.35`,
  ].join(",");

  let voicePath: string | null = null;
  if (process.env.FAL_KEY) {
    try {
      const voiceUrl = await generateVoiceover(fields);
      if (voiceUrl) {
        voicePath = path.join(workDir, "voiceover.mp3");
        await downloadFile(voiceUrl, voicePath);
      }
    } catch (error) {
      console.warn("No se pudo generar la narración.", error);
      if (requireVoiceover) throw new Error("No se pudo generar la narración. No se entregará un comercial sin la voz solicitada.");
    }
  } else if (requireVoiceover) {
    throw new Error("FAL_KEY no está configurada; no se puede generar la narración.");
  }

  let musicPath: string | null = uploadedMusicPath;
  const musicUrl = process.env.SHORTBIZAI_MUSIC_URL?.trim();
  if (!musicPath && musicUrl) {
    musicPath = path.join(workDir, "background-music.mp3");
    await downloadFile(musicUrl, musicPath);
  }

  const inputs = ["-y", "-i", inputPath];
  let nextInputIndex = 1;
  let originalAudioInputIndex: number | null = null;
  if (originalAudioPath) {
    originalAudioInputIndex = nextInputIndex++;
    inputs.push("-i", originalAudioPath);
  }
  let voiceInputIndex: number | null = null;
  if (voicePath) {
    voiceInputIndex = nextInputIndex++;
    inputs.push("-i", voicePath);
  }
  let musicInputIndex: number | null = null;
  if (musicPath) {
    musicInputIndex = nextInputIndex++;
    inputs.push("-stream_loop", "-1", "-i", musicPath);
  }

  const filters: string[] = [`[0:v:0]${videoFilter}[v]`];
  const audioLabels: string[] = [];

  if (originalAudioInputIndex !== null) {
    filters.push(`[${originalAudioInputIndex}:a:0]aresample=44100,volume=${voicePath ? 0.18 : (musicPath ? 0.22 : 1.0)},apad,atrim=duration=${duration.toFixed(3)}[source]`);
    audioLabels.push("[source]");
  }

  if (voiceInputIndex !== null) {
    filters.push(`[${voiceInputIndex}:a:0]aresample=44100,volume=1.0,apad,atrim=duration=${duration.toFixed(3)}[voice]`);
    audioLabels.push("[voice]");
  }

  if (musicInputIndex !== null) {
    filters.push(`[${musicInputIndex}:a:0]aresample=44100,volume=0.12,atrim=duration=${duration.toFixed(3)},afade=t=in:st=0:d=0.8,afade=t=out:st=${Math.max(0, duration - 1.2).toFixed(3)}:d=${Math.min(1.2, duration).toFixed(3)}[music]`);
    audioLabels.push("[music]");
  }

  const args = [...inputs];
  if (audioLabels.length > 1) {
    filters.push(`${audioLabels.join("")}amix=inputs=${audioLabels.length}:duration=longest:dropout_transition=1,alimiter=limit=0.95[a]`);
    args.push("-filter_complex", filters.join(";"), "-map", "[v]", "-map", "[a]");
  } else if (audioLabels.length === 1) {
    filters.push(`${audioLabels[0]}anull[a]`);
    args.push("-filter_complex", filters.join(";"), "-map", "[v]", "-map", "[a]");
  } else {
    args.push("-vf", videoFilter, "-map", "0:v:0", "-an");
  }

  args.push(
    "-t", duration.toFixed(3),
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    outputPath
  );

  await runFfmpeg(args, workDir);

  const outputInfo = await probeMedia(outputPath);
  if (Math.abs(outputInfo.duration - sourceInfo.duration) > 0.15) {
    throw new Error(
      `Control de calidad: el video final dura ${outputInfo.duration.toFixed(2)} s y el preliminar ${sourceInfo.duration.toFixed(2)} s. No se entregará un archivo con duración alterada.`
    );
  }
  return outputPath;
}



/* =========================================================

   SUBIR VIDEO FINAL

========================================================= */



async function uploadFinalVideo(

  filePath: string

): Promise<string> {

  const bytes = await readFile(filePath);



  const finalFile = new File(

    [bytes],

    "shortbizai-video-final-premium.mp4",

    { type: "video/mp4" }

  );



  return fal.storage.upload(finalFile);

}



/* =========================================================

   ETAPA 2: ACABADO PREMIUM DEL VIDEO APROBADO

   Recibe el preliminar aprobado por el usuario.

========================================================= */



async function generateFinalVideo(

  formData: FormData,

  workDir: string

): Promise<NextResponse> {

  const apiKey = process.env.FAL_KEY;



  if (!apiKey) {

    return NextResponse.json(

      {

        error:

          "Falta configurar FAL_KEY en el servidor.",

      },

      { status: 500 }

    );

  }



  const preparedKind = clean(formData.get("preparedKind"));
  const preparedVideo = formData.get("preparedVideo");
  let preparedPath: string;

  if (preparedKind === "poster") {
    // El afiche se convierte directamente en escenas durante la producción final.
    preparedPath = "";
  } else {
    if (!(preparedVideo instanceof File)) {
      return NextResponse.json({ error: "No se recibió el video preliminar aprobado." }, { status: 400 });
    }
    if (!preparedVideo.type.startsWith("video/")) {
      return NextResponse.json({ error: "El archivo preliminar no es un video válido." }, { status: 400 });
    }
    if (preparedVideo.size === 0 || preparedVideo.size > MAX_PREPARED_VIDEO_BYTES) {
      return NextResponse.json({ error: "El video preliminar está vacío o supera el tamaño permitido." }, { status: 413 });
    }
    preparedPath = path.join(workDir, "approved-preliminary.mp4");
    await writeFile(preparedPath, Buffer.from(await preparedVideo.arrayBuffer()));
  }


  const musicEntry = formData.get("backgroundMusic");
  let uploadedMusicPath: string | null = null;

  if (musicEntry instanceof File && musicEntry.size > 0) {
    if (musicEntry.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "El audio supera el límite de 25 MB." },
        { status: 413 }
      );
    }

    const extension = path.extname(musicEntry.name).toLowerCase();
    const allowedExtensions = [".mp3", ".wav", ".m4a", ".aac"];

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: "Formato de audio no permitido. Usa MP3, WAV, M4A o AAC." },
        { status: 400 }
      );
    }

    if (musicEntry.type && !musicEntry.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "El archivo seleccionado no parece ser un audio." },
        { status: 400 }
      );
    }

    uploadedMusicPath = path.join(
      workDir,
      `uploaded-background-music${extension}`
    );

    await writeFile(
      uploadedMusicPath,
      Buffer.from(await musicEntry.arrayBuffer())
    );

    // Comprueba que FFmpeg pueda leer el audio antes de consumir créditos.
    await runFfmpeg(
      [
        "-i",
        path.basename(uploadedMusicPath),
        "-map",
        "0:a:0",
        "-t",
        "1",
        "-f",
        "null",
        "-"
      ],
      workDir
    );
  }

  if (preparedKind === "poster") {
    // Una sola acción del usuario; el backend genera las escenas secuenciales del afiche.
    preparedPath = await generatePosterVideoPath(formData, workDir);
  }

  const creativeDirection = clean(formData.get("prompt"));
  const fields = getAdFields(formData);

  fal.config({ credentials: apiKey });



  /*

   * Guardar el preliminar en el directorio temporal.

   * El original del usuario no se modifica.

   */



  const originalInfo = await probeMedia(preparedPath);
  let originalAudioPath: string | null = null;
  if (originalInfo.hasAudio) {
    originalAudioPath = path.join(workDir, "approved-original-audio.m4a");
    await runFfmpeg(["-y", "-i", path.basename(preparedPath), "-vn", "-c:a", "aac", "-b:a", "192k", originalAudioPath], workDir);
  }

  let transformedPath: string;
  if (preparedKind === "poster") {
    // El afiche ya se convirtió en escenas: guía, destinos y cierre de marca.
    transformedPath = preparedPath;
    console.log("SHORTBIZAI: escenas del afiche montadas en secuencia en la producción final.");
  } else {
    console.log("SHORTBIZAI: iniciando transformación Premium WAN 2.2 A14B.");
    transformedPath = await generateWanTransformation(preparedPath, workDir, fields, creativeDirection);
  }

  const finalPath = await finishPremiumVideo(
    transformedPath,
    workDir,
    fields,
    uploadedMusicPath,
    originalAudioPath
  );

  const videoUrl = await uploadFinalVideo(

    finalPath

  );



  return NextResponse.json({

    success: true,

    videoUrl,

    sourceType: "approved-preliminary-video-transformed",
    aiVideoTransformation: true,

    format: "mp4",

    final: true,

  });

}




/* =========================================================
   ETAPA VISUAL: GENERA Y ENTREGA SOLO EL VIDEO, SIN AUDIO
========================================================= */

async function generateVisualOnly(formData: FormData, workDir: string): Promise<NextResponse> {
  const preparedKind = clean(formData.get("preparedKind"));
  let visualPath: string;
  if (preparedKind === "poster") {
    visualPath = await generatePosterVideoPath(formData, workDir);
  } else {
    const apiKey = process.env.FAL_KEY;
    if (!apiKey) return NextResponse.json({ error: "Falta configurar FAL_KEY en el servidor." }, { status: 500 });
    const preparedVideo = formData.get("preparedVideo");
    if (!(preparedVideo instanceof File) || !preparedVideo.type.startsWith("video/") || preparedVideo.size === 0 || preparedVideo.size > MAX_PREPARED_VIDEO_BYTES) {
      return NextResponse.json({ error: "No se recibió un video preliminar válido para la etapa visual." }, { status: 400 });
    }
    const sourcePath = path.join(workDir, "source-for-visual-ai.mp4");
    await writeFile(sourcePath, Buffer.from(await preparedVideo.arrayBuffer()));
    const fields = getAdFields(formData);
    const creativeDirection = clean(formData.get("prompt"));
    fal.config({ credentials: apiKey });
    visualPath = await generateWanTransformation(sourcePath, workDir, fields, creativeDirection);
  }
  const visualUrl = await uploadFinalVideo(visualPath);
  const visualInfo = await probeMedia(visualPath);
  return NextResponse.json({ success: true, visualVideoUrl: visualUrl, duration: visualInfo.duration, stage: "visual-ready-for-approval", audioGenerated: false });
}

/* =========================================================
   ETAPA DE AUDIO: USA EL VIDEO VISUAL YA APROBADO
========================================================= */

async function generateAudioForApprovedVisual(formData: FormData, workDir: string): Promise<NextResponse> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta configurar FAL_KEY en el servidor." }, { status: 500 });

  const visualVideoUrl = clean(formData.get("visualVideoUrl"), "");
  if (!visualVideoUrl) return NextResponse.json({ error: "No se recibió el video visual aprobado." }, { status: 400 });
  let parsedUrl: URL;
  try { parsedUrl = new URL(visualVideoUrl); } catch { return NextResponse.json({ error: "La dirección del video aprobado no es válida." }, { status: 400 }); }
  if (parsedUrl.protocol !== "https:" || !(parsedUrl.hostname === "fal.media" || parsedUrl.hostname.endsWith(".fal.media"))) {
    return NextResponse.json({ error: "La dirección del video aprobado no pertenece al almacenamiento seguro de fal.ai." }, { status: 400 });
  }

  fal.config({ credentials: apiKey });
  const visualPath = path.join(workDir, "approved-visual-only.mp4");
  await downloadFile(visualVideoUrl, visualPath);
  const visualInfo = await probeMedia(visualPath);
  if (visualInfo.duration < 1 || visualInfo.duration > 90) {
    return NextResponse.json({ error: "El video aprobado tiene una duración no válida." }, { status: 400 });
  }

  const musicEntry = formData.get("backgroundMusic");
  let uploadedMusicPath: string | null = null;
  if (musicEntry instanceof File && musicEntry.size > 0) {
    if (musicEntry.size > MAX_AUDIO_BYTES) return NextResponse.json({ error: "El audio supera el límite de 25 MB." }, { status: 413 });
    const extension = path.extname(musicEntry.name).toLowerCase();
    if (![".mp3", ".wav", ".m4a", ".aac"].includes(extension) || (musicEntry.type && !musicEntry.type.startsWith("audio/"))) {
      return NextResponse.json({ error: "Formato de música no válido. Usa MP3, WAV, M4A o AAC." }, { status: 400 });
    }
    uploadedMusicPath = path.join(workDir, `approved-music${extension}`);
    await writeFile(uploadedMusicPath, Buffer.from(await musicEntry.arrayBuffer()));
    await runFfmpeg(["-i", path.basename(uploadedMusicPath), "-map", "0:a:0", "-t", "1", "-f", "null", "-"], workDir);
  }

  const fields = getAdFields(formData);
  // Si el usuario no sube una pista propia, el Prompt 2 genera música instrumental
  // con Stable Audio 2.5. Esta operación ocurre únicamente después de aprobar
  // el video visual y de confirmar la etapa de audio.
  if (!uploadedMusicPath && fields.audioPrompt) {
    const musicResult = await fal.subscribe("fal-ai/stable-audio-25/text-to-audio", {
      input: {
        prompt: fields.audioPrompt.slice(0, 1000),
        seconds_total: Math.max(10, Math.min(190, Math.ceil(visualInfo.duration))),
      
       
      },
      logs: true,
    });
    const generatedMusicUrl = (musicResult.data as FalAudioResult).audio?.url;
    if (!generatedMusicUrl) throw new Error("Stable Audio no devolvió la pista musical generada.");
    uploadedMusicPath = path.join(workDir, "ai-generated-background-music.wav");
    await downloadFile(generatedMusicUrl, uploadedMusicPath);
    await runFfmpeg(["-i", path.basename(uploadedMusicPath), "-map", "0:a:0", "-t", "1", "-f", "null", "-"], workDir);
  }

  const finalPath = await finishPremiumVideo(visualPath, workDir, fields, uploadedMusicPath, null, true);
  const videoUrl = await uploadFinalVideo(finalPath);
  return NextResponse.json({ success: true, videoUrl, stage: "complete", visualRegenerated: false });
}

/* =========================================================

   DIRECTOR IA: PLANIFICACIÓN SIN CONSUMIR CRÉDITOS

========================================================= */

async function generateDirectorPlan(
  formData: FormData
): Promise<NextResponse> {
  const rawSourceType = clean(formData.get("sourceType"));
  const durationValue = Number(clean(formData.get("duration"), "15"));

  if (![15, 30, 45].includes(durationValue)) {
    return NextResponse.json(
      { error: "La duración debe ser 15, 30 o 45 segundos." },
      { status: 400 }
    );
  }

  const sourceType: AiDirectorInput["sourceType"] =
    rawSourceType === "video"
      ? "video"
      : rawSourceType === "poster"
        ? "poster"
        : "images";

  const imageCount = formData.getAll("images").filter(
    (item) => item instanceof File && item.size > 0
  ).length;

  const videoCount = formData.getAll("videoFiles").filter(
    (item) => item instanceof File && item.size > 0
  ).length;

  const legacyVideo = formData.get("videoFile");
  const effectiveVideoCount =
    videoCount > 0
      ? videoCount
      : legacyVideo instanceof File && legacyVideo.size > 0
        ? 1
        : 0;

  const input: AiDirectorInput = {
    businessName: clean(formData.get("businessName")),
    campaignBrand: clean(formData.get("campaignBrand")),
    title: clean(formData.get("title")),
    description: clean(formData.get("description")),
    offer: clean(formData.get("offer")),
    price: clean(formData.get("price")),
    cta: clean(formData.get("cta")),
    duration: getDuration(clean(formData.get("duration"), "15")) as 15 | 30 | 45,
    style: clean(formData.get("style")),
    platform: clean(formData.get("platform")),
    sourceType,
    imageCount,
    videoCount: effectiveVideoCount,
    narrationText: clean(formData.get("narrationText")),
    audioPrompt: clean(formData.get("audioPrompt")),
    voice: clean(formData.get("voice")),
    languageCode: clean(formData.get("languageCode")),
  };

  const plan = createAiDirectorPlan(input);

  return NextResponse.json({
    success: true,
    stage: "director-plan-ready",
    creditsUsed: 0,
    plan,
  });
}


/* =========================================================

   POST PRINCIPAL

   action=prepare

   action=generate-visual | generate-audio | generate-final

========================================================= */



async function verificarSuperAdmin(request: Request): Promise<boolean> {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data: userData, error: userError } =
    await supabaseAuth.auth.getUser(token);
  if (userError || !userData.user) return false;

  const { data: perfil, error: perfilError } = await supabaseAuth
    .from("perfiles")
    .select("rol, activo")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  return !perfilError && !!perfil && perfil.rol === "super_admin" && perfil.activo !== false;
}

export async function POST(request: Request) {

  let workDir: string | null = null;



  try {

    const autorizado = await verificarSuperAdmin(request);
    if (!autorizado) {
      return NextResponse.json(
        { success: false, error: "Acceso exclusivo para Super Admin." },
        { status: 403 }
      );
    }

    const formData = await request.formData();



    const action = clean(

      formData.get("action")

    );



    /*

     * No se exige FAL_KEY para la preparación local.

     */



    if (!["director-plan", "prepare", "generate-visual", "generate-audio"].includes(action)) {
      return NextResponse.json(
        { error: "Acción no válida. Utiliza director-plan, prepare, generate-visual o generate-audio." },
        { status: 400 }
      );
    }

    // La planificación creativa no necesita directorio temporal ni consume créditos.
    if (action === "director-plan") {
      return await generateDirectorPlan(formData);
    }

    workDir = await mkdtemp(path.join(tmpdir(), "shortbizai-"));

    if (action === "prepare") {
      return await prepareLocally(formData, workDir);
    }
    if (action === "generate-visual") {
      return await generateVisualOnly(formData, workDir);
    }
    return await generateAudioForApprovedVisual(formData, workDir);

  } catch (error) {

    console.error(

      "SHORTBIZAI VIDEO API ERROR:",

      error

    );



    const apiError = error as Error & {

      status?: number;

      body?: unknown;

      requestId?: string;

    };



    console.error(

      "ESTADO DEL ERROR:",

      apiError.status ?? "No disponible"

    );



    console.error(

      "DETALLE FAL:",

      JSON.stringify(

        apiError.body ?? null,

        null,

        2

      )

    );



    console.error(

      "REQUEST ID:",

      apiError.requestId ?? "No disponible"

    );



    const message =

      error instanceof Error

        ? error.message

        : "Error desconocido.";



    return NextResponse.json(

      {

        success: false,

        error:

          `No se pudo completar el proceso de video. ${message}`,

      },

      { status: 500 }

    );

  } finally {

    if (workDir) {

      await rm(

        workDir,

        {

          recursive: true,

          force: true,

        }

      ).catch(() => undefined);

    }

  }

}