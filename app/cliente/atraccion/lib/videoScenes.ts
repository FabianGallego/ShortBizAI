export type VideoSceneRole =
  | "hook"
  | "product"
  | "offer"
  | "cta";

export type VideoSceneAnimation =
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right";

export type VideoSceneTransition =
  | "fade"
  | "crossfade"
  | "slide-left"
  | "slide-right";

export type VideoSceneTextPosition =
  | "top"
  | "center"
  | "bottom";

export type VideoScene = {
  id: string;
  imageUrl: string;
  duration: number;

  title?: string;
  description?: string;
  offer?: string;
  price?: string;
  cta?: string;

  /**
   * Función narrativa de la escena.
   */
  role?: VideoSceneRole;

  /**
   * Movimiento aplicado a la fotografía.
   */
  animation: VideoSceneAnimation;

  /**
   * Transición utilizada al entrar
   * en esta escena.
   */
  transition?: VideoSceneTransition;

  /**
   * Posición principal del contenido textual.
   */
  textPosition?: VideoSceneTextPosition;

  /**
   * Intensidad visual de la escena.
   *
   * subtle = movimiento muy suave
   * normal = movimiento estándar
   * strong = movimiento más llamativo
   */
  emphasis?: "subtle" | "normal" | "strong";
};

export type VideoSceneInput = {
  imageUrl: string;
  title?: string;
  description?: string;
  offer?: string;
  price?: string;
  cta?: string;

  role?: VideoSceneRole;
  animation?: VideoSceneAnimation;
  transition?: VideoSceneTransition;
  textPosition?: VideoSceneTextPosition;
  emphasis?: "subtle" | "normal" | "strong";
};

const ANIMATIONS: VideoSceneAnimation[] = [
  "zoom-in",
  "zoom-out",
  "pan-left",
  "pan-right",
];

const TRANSITIONS: VideoSceneTransition[] = [
  "fade",
  "crossfade",
  "slide-left",
  "slide-right",
];

/**
 * Construye las escenas base que utilizará
 * el generador de Shorts.
 *
 * Cada fotografía se convierte inicialmente
 * en una escena independiente.
 *
 * El Director IA podrá posteriormente
 * modificar las propiedades visuales
 * de cada escena.
 */
export function buildVideoScenes(
  inputs: VideoSceneInput[],
  durationPerScene = 2
): VideoScene[] {
  return inputs
    .filter(
      (input) =>
        input.imageUrl.trim() !== ""
    )
    .map((input, index) => ({
      id: `scene-${index + 1}`,

      imageUrl: input.imageUrl,

      duration: durationPerScene,

      title: input.title,
      description: input.description,
      offer: input.offer,
      price: input.price,
      cta: input.cta,

      role:
        input.role ??
        obtenerRolPorIndice(
          index,
          inputs.length
        ),

      animation:
        input.animation ??
        ANIMATIONS[
          index % ANIMATIONS.length
        ],

      transition:
        input.transition ??
        TRANSITIONS[
          index % TRANSITIONS.length
        ],

      textPosition:
        input.textPosition ??
        obtenerPosicionTexto(
          index,
          inputs.length
        ),

      emphasis:
        input.emphasis ??
        "normal",
    }));
}

/**
 * Determina automáticamente la función
 * narrativa de una escena cuando todavía
 * no existe una decisión del Director IA.
 */
function obtenerRolPorIndice(
  index: number,
  totalScenes: number
): VideoSceneRole {
  if (index === 0) {
    return "hook";
  }

  if (index === totalScenes - 1) {
    return "cta";
  }

  if (index === 1) {
    return "product";
  }

  return "offer";
}

/**
 * Determina una posición inicial para
 * distribuir visualmente el contenido.
 */
function obtenerPosicionTexto(
  index: number,
  totalScenes: number
): VideoSceneTextPosition {
  if (index === 0) {
    return "center";
  }

  if (index === totalScenes - 1) {
    return "bottom";
  }

  return index % 2 === 0
    ? "bottom"
    : "center";
}

/**
 * Calcula la duración total del video.
 */
export function getTotalVideoDuration(
  scenes: VideoScene[]
): number {
  return scenes.reduce(
    (total, scene) =>
      total + scene.duration,
    0
  );
}

/**
 * Ajusta proporcionalmente la duración
 * de todas las escenas para que el video
 * tenga exactamente la duración indicada.
 */
export function normalizeSceneDurations(
  scenes: VideoScene[],
  totalDuration: number
): VideoScene[] {
  if (
    scenes.length === 0 ||
    !Number.isFinite(totalDuration) ||
    totalDuration <= 0
  ) {
    return scenes;
  }

  const durationPerScene =
    totalDuration / scenes.length;

  return scenes.map((scene) => ({
    ...scene,
    duration: durationPerScene,
  }));
}

/**
 * Crea las escenas finales para un Short vertical.
 *
 * La duración puede ser definida por el usuario
 * desde el Director IA.
 *
 * Si no se especifica una duración,
 * se utiliza 15 segundos como valor estándar.
 */
export function createShortScenes(
  inputs: VideoSceneInput[],
  totalDuration = 15
): VideoScene[] {
  const validDuration =
    Number.isFinite(totalDuration) &&
    totalDuration > 0
      ? totalDuration
      : 15;

  const scenes =
    buildVideoScenes(inputs);

  return normalizeSceneDurations(
    scenes,
    validDuration
  );
}