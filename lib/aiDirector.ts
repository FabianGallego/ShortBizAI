/**
 * ShortBizAI — Director IA
 * Planificación creativa determinista: no llama a servicios externos ni consume créditos.
 */

export type DirectorSourceType = "poster" | "video" | "images";
export type DirectorSceneRole = "hook" | "context" | "experience" | "benefit" | "offer" | "cta";
export type DirectorMovement =
  | "dolly-in"
  | "tracking"
  | "pan"
  | "orbit"
  | "crane"
  | "pull-back"
  | "static";

export interface AiDirectorInput {
  businessName?: string;
  campaignBrand?: string;
  title?: string;
  description?: string;
  offer?: string;
  price?: string;
  cta?: string;
  duration: 15 | 30 | 45;
  style?: string;
  platform?: string;
  sourceType: DirectorSourceType;
  imageCount?: number;
  videoCount?: number;
  narrationText?: string;
  audioPrompt?: string;
  voice?: string;
  languageCode?: string;
}

export interface DirectorScene {
  role: DirectorSceneRole;
  title: string;
  duration: number;
  objective: string;
  visualPrompt: string;
  prompt: string;
  movement: DirectorMovement;
  cameraMovement: DirectorMovement;
  transition: "cut" | "crossfade" | "fade" | "match-cut";
  overlayText: string;
  textOverlay: string;
}

export interface AiDirectorPlan {
  sector: string;
  visualStyle: string;
  style: string;
  concept: string;
  creativeConcept: string;
  scenes: DirectorScene[];
  narration: string;
  narrationScript: string;
  musicDirection: string;
  sourceStrategy: string;
  duration: number;
  finalCta: string;
  creditsUsed: 0;
}

const clean = (value?: string) => (value ?? "").replace(/\s+/g, " ").trim();
const norm = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function detectSector(input: AiDirectorInput): string {
  const text = norm([
    input.businessName, input.campaignBrand, input.title, input.description, input.offer,
  ].filter(Boolean).join(" "));
  const rules: Array<[RegExp, string]> = [
    [/\b(spa|masaje|masajes|wellness|relajacion|terapia|facial)\b/, "Bienestar y SPA"],
    [/\b(gym|gimnasio|fitness|entrenamiento|personal trainer|deporte)\b/, "Fitness y entrenamiento"],
    [/\b(restaurante|comida|gastronomia|chef|menu|cena|almuerzo|cafe|cafeteria)\b/, "Gastronomía y restaurantes"],
    [/\b(turismo|tour|viaje|viajes|hotel|excursion|destino|turistico|capital| washington|paris|roma)\b/, "Turismo y experiencias"],
    [/\b(boda|matrimonio|evento|fiesta|celebracion|fotografia|video|fagavision|quinceanos)\b/, "Eventos y producción audiovisual"],
    [/\b(abogado|legal|consultoria|asesoria|contabilidad|financiero|inmobiliaria)\b/, "Servicios profesionales"],
    [/\b(salon|belleza|peluqueria|unas|estetica|barberia)\b/, "Belleza y cuidado personal"],
    [/\b(limpieza|mantenimiento|reparacion|plomeria|electricista)\b/, "Servicios para el hogar y empresas"],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] ?? "Servicios y negocios";
}

function getSpecificVisualContext(input: AiDirectorInput, sector: string): string {
  const text = norm([input.title, input.description, input.offer].filter(Boolean).join(" "));
  if (sector === "Turismo y experiencias" && /\bwashington|washington d\.?c\.?|capital de estados unidos\b/.test(text)) {
    return "Si el material de referencia muestra Washington D. C., priorizar tomas reconocibles y fieles de sus monumentos y arquitectura, como el Capitolio, el National Mall y los memoriales. No insertar monumentos que no correspondan al destino ni fingir que el grupo visitó un lugar no confirmado.";
  }
  if (sector === "Gastronomía y restaurantes") {
    return "Priorizar detalles reales del establecimiento, preparación, ingredientes, emplatado, ambiente y experiencia de los comensales. No inventar platos ni instalaciones.";
  }
  if (sector === "Bienestar y SPA") {
    return "Priorizar ambiente sereno, texturas, iluminación cálida, manos profesionales y detalles reales del tratamiento. Evitar promesas médicas o resultados garantizados.";
  }
  if (sector === "Fitness y entrenamiento") {
    return "Priorizar movimiento humano natural, entrenamiento real, instalaciones y progreso expresado sin promesas físicas garantizadas.";
  }
  if (sector === "Eventos y producción audiovisual") {
    return "Priorizar momentos emotivos auténticos, montaje del evento, detalles de decoración, fotografía y producción audiovisual que aparezcan en el material.";
  }
  return "Mostrar el servicio real, sus espacios, personas, proceso y resultado observable a partir del material aportado. No usar imágenes genéricas que no representen el negocio.";
}

function sceneDurations(duration: number): number[] {
  if (duration === 15) return [3, 4, 4, 4];
  if (duration === 30) return [5, 6, 7, 6, 6];
  return [6, 7, 8, 8, 8, 8];
}

function roleSequence(duration: number): DirectorSceneRole[] {
  if (duration === 15) return ["hook", "experience", "offer", "cta"];
  if (duration === 30) return ["hook", "context", "experience", "offer", "cta"];
  return ["hook", "context", "experience", "benefit", "offer", "cta"];
}

function roleDetails(role: DirectorSceneRole, input: AiDirectorInput, sector: string, specificity: string) {
  const brand = clean(input.businessName || input.campaignBrand || input.title || "la marca");
  const offer = clean(input.offer);
  const price = clean(input.price);
  const cta = clean(input.cta) || "Reserva o solicita información";
  const title = clean(input.title);
  const commercial = [offer, price ? `Precio indicado: ${price}` : ""].filter(Boolean).join(". ");
  const common = `Campaña para ${brand}. Sector: ${sector}. ${specificity} Estética ${clean(input.style) || "premium cinematográfica"}, fotografía realista, luz natural cuidada, composición profesional, movimiento físico creíble y continuidad visual. Respetar el afiche y el material suministrado. No inventar logotipos, precios, fechas, ubicaciones, testimonios ni características. No generar letras deformadas dentro de la imagen.`;
  const details: Record<DirectorSceneRole, { title: string; objective: string; visual: string; movement: DirectorMovement; transition: DirectorScene["transition"]; text: string }> = {
    hook: {
      title: "Apertura / Hook",
      objective: "Detener el desplazamiento y despertar curiosidad en los primeros segundos.",
      visual: `Abrir con el plano visual más potente y reconocible del material. Comenzar con un encuadre con intención, revelar el sujeto mediante un movimiento de cámara preciso y establecer inmediatamente el tono de la experiencia. ${common}`,
      movement: "dolly-in", transition: "cut", text: title,
    },
    context: {
      title: "Contexto y descubrimiento",
      objective: "Situar al espectador y mostrar qué experiencia o servicio se ofrece.",
      visual: `Construir un plano de contexto que ubique al espectador en el entorno real del servicio. Usar profundidad, capas visuales y un movimiento lateral o de seguimiento suave. ${common}`,
      movement: "tracking", transition: "match-cut", text: brand,
    },
    experience: {
      title: "La experiencia",
      objective: "Hacer que el público imagine que está viviendo el servicio.",
      visual: `Mostrar la experiencia desde una perspectiva inmersiva: detalles, acción principal, interacción humana y ambiente. Alternar plano general y detalle con continuidad de luz, escala y dirección de movimiento. ${common}`,
      movement: "orbit", transition: "crossfade", text: "",
    },
    benefit: {
      title: "Valor y diferenciación",
      objective: "Comunicar el valor principal sin exageraciones ni afirmaciones no verificadas.",
      visual: `Elegir una secuencia visual que demuestre el beneficio descrito en la información comercial. Enfatizar calidad, atención, comodidad o resultado observable solo cuando esté respaldado por el material. ${common}`,
      movement: "crane", transition: "match-cut", text: "",
    },
    offer: {
      title: "La propuesta",
      objective: "Presentar la oferta de manera clara y atractiva.",
      visual: `Crear una secuencia de producto o servicio con composición publicitaria premium. Reservar espacio visual limpio para incorporar posteriormente la oferta como texto gráfico legible en edición. Información disponible: ${commercial || "No se suministró una oferta específica."} ${common}`,
      movement: "pan", transition: "crossfade", text: commercial || title,
    },
    cta: {
      title: "Cierre / Llamada a la acción",
      objective: "Convertir el interés en una acción concreta.",
      visual: `Cerrar con el plano más memorable y una composición limpia que permita mostrar la marca y la llamada a la acción en postproducción. Terminar con una pausa visual deliberada y un cierre elegante; no inventar datos de contacto. CTA suministrado: ${cta}. ${common}`,
      movement: "pull-back", transition: "fade", text: cta,
    },
  };
  return details[role];
}

function buildNarration(input: AiDirectorInput, sector: string): string {
  if (clean(input.narrationText)) return clean(input.narrationText);
  const title = clean(input.title);
  const brand = clean(input.businessName || input.campaignBrand);
  const offer = clean(input.offer);
  const price = clean(input.price);
  const cta = clean(input.cta) || "Contáctanos y descubre más.";
  const parts = [
    title ? `${title}.` : `Descubre ${brand || "una experiencia diferente"}.`,
    sector === "Turismo y experiencias"
      ? "Cada destino tiene una historia. Es momento de vivirla."
      : sector === "Gastronomía y restaurantes"
        ? "Un momento para disfrutar con todos los sentidos."
        : sector === "Bienestar y SPA"
          ? "Regálate un momento para desconectar y renovarte."
          : sector === "Fitness y entrenamiento"
            ? "Tu próximo paso comienza con una decisión."
            : "Calidad, dedicación y una experiencia pensada para ti.",
    offer ? `${offer}.` : "",
    price ? `Por ${price}.` : "",
    cta.endsWith(".") || cta.endsWith("!") ? cta : `${cta}.`,
  ];
  return parts.filter(Boolean).join(" ");
}

export function createAiDirectorPlan(input: AiDirectorInput): AiDirectorPlan {
  const duration = [15, 30, 45].includes(Number(input.duration))
    ? Number(input.duration)
    : 30;
  const sector = detectSector(input);
  const brand = clean(input.businessName || input.campaignBrand || input.title || "la marca");
  const style = clean(input.style) || "Premium cinematográfico";
  const specificity = getSpecificVisualContext(input, sector);
  const roles = roleSequence(duration);
  const durations = sceneDurations(duration);

  const scenes: DirectorScene[] = roles.map((role, index) => {
    const detail = roleDetails(role, input, sector, specificity);
    const visualPrompt = `${detail.visual} Duración objetivo: ${durations[index]} segundos.`;
    return {
      role,
      title: detail.title,
      duration: durations[index],
      objective: detail.objective,
      visualPrompt,
      prompt: visualPrompt,
      movement: detail.movement,
      cameraMovement: detail.movement,
      transition: detail.transition,
      overlayText: detail.text,
      textOverlay: detail.text,
    };
  });

  const concept = `Una campaña cinematográfica para ${brand} que convierte su propuesta en una historia visual: captar la atención, introducir la experiencia, demostrar su valor, presentar la oferta disponible y cerrar con una invitación clara a actuar. La narrativa y las imágenes deben corresponder al sector ${sector} y al material real proporcionado.`;

  const sourceStrategy = input.sourceType === "poster"
    ? "Usar el afiche como referencia principal para identidad, fotografías y datos. Extraer sus elementos visuales y convertirlos en planos con profundidad y movimiento; no limitar el anuncio a animar el afiche completo. Mantener los textos comerciales exactos y añadirlos en postproducción."
    : input.sourceType === "video"
      ? `Analizar los clips aportados (${input.videoCount || 1}) y seleccionar los mejores momentos por encuadre, acción, luz y continuidad. Reordenar y montar el material para construir una historia; no repetir tomas sin función narrativa.`
      : `Analizar las fotografías aportadas (${input.imageCount || 1}) y asignar a cada una una función narrativa. Crear movimiento de cámara sutil y profundidad sin deformar personas, productos, arquitectura ni logotipos.`;

  const musicDirection = clean(input.audioPrompt) ||
    `Diseñar una banda sonora original de estilo ${style}, coherente con ${sector}. La música debe acompañar la emoción y el ritmo de montaje, crecer progresivamente y dejar espacio a la narración. Evitar competir con la voz y evitar clichés musicales ajenos a la marca.`;

  const narration = buildNarration(input, sector);
  return {
    sector,
    visualStyle: style,
    style,
    concept,
    creativeConcept: concept,
    scenes,
    narration,
    narrationScript: narration,
    musicDirection,
    sourceStrategy,
    duration,
    finalCta: clean(input.cta) || "Reserva o solicita información",
    creditsUsed: 0,
  };
}
