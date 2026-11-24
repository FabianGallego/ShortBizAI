"use client";


import type {
  VideoScene,
  VideoSceneAnimation,
  VideoSceneTransition,
} from "./videoScenes";

type GenerateVideoOptions = {
  width?: number;
  height?: number;
  fps?: number;
};

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));

    img.src = src;
  });
}

function limitar(
  valor: number,
  minimo: number,
  maximo: number
): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

function easeOutCubic(valor: number): number {
  return 1 - Math.pow(1 - valor, 3);
}

function easeInOutCubic(valor: number): number {
  return valor < 0.5
    ? 4 * valor * valor * valor
    : 1 - Math.pow(-2 * valor + 2, 3) / 2;
}

function dibujarImagenCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  zoom = 1,
  opacity = 1,
  offsetX = 0,
  offsetY = 0
) {
  const escalaBase = Math.max(
    width / img.width,
    height / img.height
  );

  const escala = escalaBase * zoom;

  const drawWidth = img.width * escala;
  const drawHeight = img.height * escala;

  const x = (width - drawWidth) / 2 + offsetX;
  const y = (height - drawHeight) / 2 + offsetY;

  ctx.save();

  ctx.globalAlpha = opacity;

  ctx.drawImage(
    img,
    x,
    y,
    drawWidth,
    drawHeight
  );

  ctx.restore();
}

function dibujarTextoEnvuelto(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
  textAlign: CanvasTextAlign = "left"
): number {
  if (!texto) {
    return 0;
  }

  const palabras = texto.trim().split(/\s+/);
  const lineas: string[] = [];

  let lineaActual = "";

  for (const palabra of palabras) {
    const prueba = lineaActual
      ? `${lineaActual} ${palabra}`
      : palabra;

    const ancho = ctx.measureText(prueba).width;

    if (ancho <= maxWidth || !lineaActual) {
      lineaActual = prueba;
    } else {
      lineas.push(lineaActual);
      lineaActual = palabra;

      if (lineas.length >= maxLines) {
        break;
      }
    }
  }

  if (
    lineaActual &&
    lineas.length < maxLines
  ) {
    lineas.push(lineaActual);
  }

  ctx.textAlign = textAlign;
  ctx.textBaseline = "top";

  lineas.forEach((linea, index) => {
    ctx.fillText(
      linea,
      x,
      y + index * lineHeight
    );
  });

  return lineas.length * lineHeight;
}

function dibujarRedondeado(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radio: number
) {
  ctx.beginPath();

  ctx.roundRect(
    x,
    y,
    width,
    height,
    radio
  );
}

function dibujarBranding(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity: number
) {
  ctx.save();

  ctx.globalAlpha = opacity;

  const x = 54;
  const y = 58;
  const brandingWidth = 238;
  const brandingHeight = 62;

  dibujarRedondeado(
    ctx,
    x,
    y,
    brandingWidth,
    brandingHeight,
    31
  );

  ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
  ctx.fill();

  ctx.fillStyle = "#ffffff";

  ctx.font = "700 25px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  ctx.fillText(
    "SHORTBIZAI",
    x + 52,
    y + brandingHeight / 2
  );

  ctx.beginPath();

  ctx.arc(
    x + 28,
    y + brandingHeight / 2,
    7,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "#38bdf8";
  ctx.fill();

  ctx.restore();
}

function dibujarOverlayPremium(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  /*
   * Gradiente superior.
   */
  const topGradient = ctx.createLinearGradient(
    0,
    0,
    0,
    height * 0.42
  );

  topGradient.addColorStop(
    0,
    "rgba(0,0,0,0.58)"
  );

  topGradient.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  ctx.fillStyle = topGradient;

  ctx.fillRect(
    0,
    0,
    width,
    height * 0.42
  );

  /*
   * Gradiente inferior.
   */
  const bottomGradient = ctx.createLinearGradient(
    0,
    height * 0.48,
    0,
    height
  );

  bottomGradient.addColorStop(
    0,
    "rgba(0,0,0,0)"
  );

  bottomGradient.addColorStop(
    0.55,
    "rgba(0,0,0,0.30)"
  );

  bottomGradient.addColorStop(
    1,
    "rgba(0,0,0,0.88)"
  );

  ctx.fillStyle = bottomGradient;

  ctx.fillRect(
    0,
    height * 0.48,
    width,
    height * 0.52
  );
}

function obtenerZoom(
  animation: VideoSceneAnimation,
  progress: number,
  emphasis: "subtle" | "normal" | "strong"
): number {
  const intensidad =
    emphasis === "strong"
      ? 1.35
      : emphasis === "subtle"
        ? 0.65
        : 1;

  /*
   * Base conocida que ya estaba funcionando.
   */
  const zoomBase =
    1.02 + progress * 0.08;

  switch (animation) {
    case "zoom-out":
      return (
        1.10 -
        progress * 0.08 * intensidad
      );

    case "zoom-in":
      return (
        1.02 +
        progress * 0.08 * intensidad
      );

    case "pan-left":
    case "pan-right":
      return zoomBase;

    default:
      return zoomBase;
  }
}

function obtenerMovimiento(
  animation: VideoSceneAnimation,
  progress: number,
  width: number,
  emphasis: "subtle" | "normal" | "strong"
) {
  const intensidad =
    emphasis === "strong"
      ? 1.4
      : emphasis === "subtle"
        ? 0.65
        : 1;

  const movimiento =
    width * 0.035 * intensidad;

  const suave =
    Math.sin(progress * Math.PI);

  if (animation === "pan-left") {
    return {
      x: -movimiento * suave,
      y: 0,
    };
  }

  if (animation === "pan-right") {
    return {
      x: movimiento * suave,
      y: 0,
    };
  }

  return {
    x: 0,
    y: suave * 5 * intensidad,
  };
}

function aplicarTransicion(
  ctx: CanvasRenderingContext2D,
  previousImg: HTMLImageElement,
  img: HTMLImageElement,
  width: number,
  height: number,
  zoom: number,
  progress: number,
  transition: VideoSceneTransition
) {
  const eased = easeInOutCubic(progress);

  if (transition === "slide-left") {
    dibujarImagenCover(
      ctx,
      previousImg,
      width,
      height,
      zoom,
      1,
      -width * eased,
      0
    );

    dibujarImagenCover(
      ctx,
      img,
      width,
      height,
      zoom,
      1,
      width * (1 - eased),
      0
    );

    return;
  }

  if (transition === "slide-right") {
    dibujarImagenCover(
      ctx,
      previousImg,
      width,
      height,
      zoom,
      1,
      width * eased,
      0
    );

    dibujarImagenCover(
      ctx,
      img,
      width,
      height,
      zoom,
      1,
      -width * (1 - eased),
      0
    );

    return;
  }

  if (
    transition === "fade" ||
    transition === "crossfade"
  ) {
    dibujarImagenCover(
      ctx,
      previousImg,
      width,
      height,
      zoom,
      1 - eased
    );

    dibujarImagenCover(
      ctx,
      img,
      width,
      height,
      zoom,
      eased
    );

    return;
  }

  dibujarImagenCover(
    ctx,
    img,
    width,
    height,
    zoom,
    1
  );
}

function dibujarContenidoPremium(
  ctx: CanvasRenderingContext2D,
  scene: VideoScene,
  width: number,
  height: number,
  opacity: number,
  desplazamientoY: number
) {
  const {
    title,
    offer,
    price,
    description,
    cta,
    role = "product",
    textPosition = "bottom",
    emphasis = "normal",
  } = scene;

  // PREVISUALIZACIÓN LOCAL LIMPIA:
  // dibujar únicamente el título de esta escena y no acumular otros textos.
  if (title?.trim()) {
    const titulo = title.trim();
    const posicion = textPosition;
    const intensidadTitulo =
      emphasis === "strong" ? 1.12 : emphasis === "subtle" ? 0.92 : 1;

    let titleSize = 68 * intensidadTitulo;
    if (titulo.length > 45) titleSize = 54 * intensidadTitulo;
    if (titulo.length > 75) titleSize = 44 * intensidadTitulo;

    let titleY: number;
    if (posicion === "top") {
      titleY = height * 0.16 + desplazamientoY;
    } else if (posicion === "center") {
      titleY = height * 0.42 + desplazamientoY;
    } else {
      titleY = height * 0.68 + desplazamientoY;
    }

    ctx.save();
    ctx.globalAlpha = limitar(opacity, 0, 1);
    ctx.font = `700 ${Math.round(titleSize)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    dibujarTextoEnvuelto(
      ctx,
      titulo,
      width / 2,
      titleY,
      width - 140,
      Math.round(titleSize * 1.15),
      3,
      "center"
    );

    ctx.restore();
  }

  // Evita que el código de diseño antiguo dibuje oferta, precio, CTA o líneas.
  return;

  if (
    !title &&
    !offer &&
    !price &&
    !description &&
    !cta
  ) {
    return;
  }

  ctx.save();

  ctx.globalAlpha = opacity;

  const left = 60;
  const contentWidth = width - 120;

  const intensidad =
    emphasis === "strong"
      ? 1.12
      : emphasis === "subtle"
        ? 0.92
        : 1;

  let currentY = 0;

  if (textPosition === "top") {
    currentY =
      230 + desplazamientoY;
  } else if (textPosition === "center") {
    currentY =
      height * 0.43 +
      desplazamientoY;
  } else {
    currentY =
      height -
      650 +
      desplazamientoY;
  }

  let textX = left;
  let textAlign: CanvasTextAlign =
    "left";

  if (textPosition === "center") {
    textX = width / 2;
    textAlign = "center";
  }

  /*
   * CTA final:
   * hacemos que el contenido principal
   * tenga una posición más fuerte.
   */
  if (role === "cta" && cta) {
    currentY =
      height * 0.48 +
      desplazamientoY;
  }

  /*
   * Línea decorativa.
   */
  ctx.fillStyle = "#38bdf8";

  const lineWidth =
    role === "offer"
      ? 150
      : role === "cta"
        ? 180
        : 110;

  const lineX =
    textAlign === "center"
      ? width / 2 -
        lineWidth / 2
      : textX;

  ctx.fillRect(
    lineX,
    currentY - 24,
    lineWidth,
    7
  );

  /*
   * TÍTULO.
   */
  if (title) {
    let titleSize = 60;

    if (role === "hook") {
      titleSize = 76;
    } else if (role === "offer") {
      titleSize = 70;
    } else if (role === "cta") {
      titleSize = 66;
    }

    titleSize *= intensidad;

    ctx.font =
      `700 ${Math.round(titleSize)}px Arial`;

    ctx.fillStyle = "#ffffff";

    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";

    const titleHeight =
      dibujarTextoEnvuelto(
        ctx,
       title ?? "",
        textX,
        currentY,
        contentWidth,
        Math.round(
          titleSize * 1.12
        ),
        role === "hook"
          ? 2
          : 3,
        textAlign
      );

    currentY +=
      titleHeight + 22;
  }

  /*
   * OFERTA.
   *
   * En escenas de oferta la hacemos
   * visualmente dominante.
   */
  if (offer) {
    const offerSize =
      role === "offer"
        ? Math.round(
            62 * intensidad
          )
        : Math.round(
            48 * intensidad
          );

    const offerMaxWidth =
      Math.min(
        contentWidth,
        850
      );

    ctx.font =
      `700 ${offerSize}px Arial`;

    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";

    const offerTextWidth =
      Math.min(
        ctx.measureText(
          offer ?? ""
        ).width + 70,
        offerMaxWidth
      );

    const offerBoxWidth =
      textAlign === "center"
        ? offerTextWidth
        : Math.min(
            offerTextWidth,
            offerMaxWidth
          );

    const offerBoxX =
      textAlign === "center"
        ? width / 2 -
          offerBoxWidth / 2
        : textX;

    const offerBoxHeight =
      role === "offer"
        ? 88
        : 76;

    dibujarRedondeado(
      ctx,
      offerBoxX,
      currentY - 8,
      offerBoxWidth,
      offerBoxHeight,
      24
    );

    ctx.fillStyle =
      "rgba(15, 23, 42, 0.82)";

    ctx.fill();

    ctx.strokeStyle =
      "#38bdf8";

    ctx.lineWidth = 3;

    ctx.stroke();

    ctx.fillStyle =
      role === "offer"
        ? "#ffffff"
        : "#38bdf8";

    ctx.textAlign = "center";
    ctx.textBaseline =
      "middle";

    ctx.fillText(
     offer ?? "",
      offerBoxX +
        offerBoxWidth / 2,
      currentY -
        8 +
        offerBoxHeight / 2
    );

    currentY +=
      offerBoxHeight + 24;
  }

  /*
   * PRECIO.
   */
  if (price) {
    const priceWidth = 330;
    const priceHeight = 78;

    const priceX =
      textAlign === "center"
        ? width / 2 -
          priceWidth / 2
        : textX;

    dibujarRedondeado(
      ctx,
      priceX,
      currentY,
      priceWidth,
      priceHeight,
      22
    );

    ctx.fillStyle =
      "#38bdf8";

    ctx.fill();

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "700 40px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      price ?? "",
      priceX +
        priceWidth / 2,
      currentY +
        priceHeight / 2
    );

    currentY +=
      priceHeight + 28;
  }

  /*
   * DESCRIPCIÓN.
   *
   * Hook y CTA permanecen limpios.
   */
  if (
    description &&
    role !== "hook" &&
    role !== "cta"
  ) {
    ctx.font =
      "400 30px Arial";

    ctx.fillStyle =
      "rgba(255,255,255,0.92)";

    ctx.textAlign =
      textAlign;

    ctx.textBaseline =
      "top";

    const descriptionHeight =
      dibujarTextoEnvuelto(
        ctx,
        description ?? "",
        textX,
        currentY,
        contentWidth,
        42,
        3,
        textAlign
      );

    currentY +=
      descriptionHeight + 24;
  }

  /*
   * BOTÓN CTA.
   *
   * En una escena CTA se hace más grande.
   */
  if (cta) {
    const buttonWidth =
      role === "cta"
        ? Math.min(
            760,
            contentWidth
          )
        : Math.min(
            620,
            contentWidth
          );

    const buttonHeight =
      role === "cta"
        ? 98
        : 86;

    const buttonX =
      width / 2 -
      buttonWidth / 2;

    const buttonY =
      height -
      (
        role === "cta"
          ? 205
          : 174
      );

    dibujarRedondeado(
      ctx,
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      28
    );

    ctx.fillStyle =
      "#38bdf8";

    ctx.fill();

    ctx.strokeStyle =
      "rgba(255,255,255,0.28)";

    ctx.lineWidth = 2;

    ctx.stroke();

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      role === "cta"
        ? "700 38px Arial"
        : "700 34px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      cta ?? "",
      width / 2,
      buttonY +
        buttonHeight / 2
    );
  }

  ctx.restore();
}

export async function generateVideoFromScenes(
  scenes: VideoScene[],
  options: GenerateVideoOptions = {}
): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error(
      "El generador de video solo puede ejecutarse en el navegador."
    );
  }

  if (!scenes || scenes.length === 0) {
    throw new Error(
      "No hay escenas para generar el video."
    );
  }

  const width =
    options.width ?? 1080;

  const height =
    options.height ?? 1920;

  const fps =
    options.fps ?? 30;

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "No se pudo crear el contexto del canvas."
    );
  }

  /*
   * CORRECCIÓN:
   * Captura manual para sincronizar los fotogramas
   * con el tiempo de renderizado.
   */
  const stream = canvas.captureStream(0);

  const videoTrack =
    stream.getVideoTracks()[0] as
      | CanvasCaptureMediaStreamTrack
      | undefined;

  if (
    !videoTrack ||
    typeof videoTrack.requestFrame !== "function"
  ) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });

    throw new Error(
      "Este navegador no admite captura manual de fotogramas. Actualiza Chrome o Edge."
    );
  }

  const mimeTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  const mimeType =
    mimeTypes.find((type) =>
      MediaRecorder.isTypeSupported(
        type
      )
    ) ?? "video/webm";

  const recorder =
    new MediaRecorder(
      stream,
      {
        mimeType,
        videoBitsPerSecond:
          10_000_000,
      }
    );

  const chunks: Blob[] = [];

  const grabar =
    new Promise<Blob>(
      (resolve, reject) => {
        recorder.ondataavailable = (
          event
        ) => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            chunks.push(
              event.data
            );
          }
        };

        recorder.onerror = () => {
          reject(
            new Error(
              "Ocurrió un error durante la generación del video."
            )
          );
        };

        recorder.onstop = () => {
          resolve(
            new Blob(
              chunks,
              {
                type: mimeType,
              }
            )
          );
        };
      }
    );

  const images =
    await Promise.all(
      scenes.map((scene) =>
        cargarImagen(
          scene.imageUrl
        )
      )
    );

  recorder.start();

  for (
    let sceneIndex = 0;
    sceneIndex < scenes.length;
    sceneIndex++
  ) {
    const scene =
      scenes[sceneIndex];

    const img =
      images[sceneIndex];

    const previousImg =
      sceneIndex > 0
        ? images[
            sceneIndex - 1
          ]
        : null;

    const duration = Math.max(
      scene.duration ?? 2,
      0.5
    );

    const totalFrames =
      Math.max(
        1,
        Math.round(
          duration * fps
        )
      );

    const transitionFrames =
      Math.min(
        Math.round(
          fps * 0.45
        ),
        Math.floor(
          totalFrames * 0.30
        )
      );

    for (
      let frame = 0;
      frame < totalFrames;
      frame++
    ) {
      const progress =
        totalFrames > 1
          ? frame /
            (totalFrames - 1)
          : 1;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      ctx.fillStyle =
        "#000000";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      const animation =
        scene.animation ??
        "zoom-in";

      const emphasis =
        scene.emphasis ??
        "normal";

      const zoom =
        obtenerZoom(
          animation,
          progress,
          emphasis
        );

      const movimiento =
        obtenerMovimiento(
          animation,
          progress,
          width,
          emphasis
        );

      if (
        previousImg &&
        transitionFrames > 0 &&
        frame < transitionFrames
      ) {
        const transitionProgress =
          easeInOutCubic(
            frame /
              transitionFrames
          );

        aplicarTransicion(
          ctx,
          previousImg,
          img,
          width,
          height,
          zoom,
          transitionProgress,
          scene.transition ??
            "fade"
        );
      } else {
        dibujarImagenCover(
          ctx,
          img,
          width,
          height,
          zoom,
          1,
          movimiento.x,
          movimiento.y
        );
      }

      /*
       * Título: entrada suave, permanencia y salida completa.
       * No se dibuja ningún título de otra escena ni texto persistente.
       */
      const fadeInEnd = 0.12;
      const fadeOutStart = 0.62;
      const fadeOutEnd = 0.82;
      let contenidoOpacity = 0;

      if (progress < fadeInEnd) {
        contenidoOpacity = easeOutCubic(progress / fadeInEnd);
      } else if (progress < fadeOutStart) {
        contenidoOpacity = 1;
      } else if (progress < fadeOutEnd) {
        contenidoOpacity = 1 - easeInOutCubic(
          (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart)
        );
      }

      if (scene.title?.trim() && contenidoOpacity > 0.01) {
        const desplazamientoTexto = (1 - contenidoOpacity) * 18;
        dibujarContenidoPremium(
          ctx,
          scene,
          width,
          height,
          contenidoOpacity,
          desplazamientoTexto
        );
      }

      /*
       * CORRECCIÓN:
       * solicita la captura del fotograma dibujado
       * y espera el intervalo correspondiente a los FPS.
       */
      videoTrack.requestFrame();

      await new Promise<void>((resolve) => {
        window.setTimeout(
          resolve,
          1000 / fps
        );
      });
    }
  }

  /*
   * Esperar a que termine la grabación,
   * comprobar que el archivo tenga contenido
   * y liberar las pistas del video.
   */
  try {
    // Dejar tiempo para que MediaRecorder procese el último fotograma.
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 150);
    });

    if (recorder.state !== "inactive") {
      recorder.stop();
    }

    const blob = await grabar;

    if (blob.size === 0) {
      throw new Error(
        "La grabación terminó, pero el video está vacío."
      );
    }

    return blob;
  } finally {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}

export function descargarVideo(
  blob: Blob,
  nombre =
    "shortbizai-video-premium.webm"
) {
  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = nombre;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  /*
   * Revocar la URL después de que el navegador
   * haya tenido oportunidad de iniciar la descarga.
   */
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}