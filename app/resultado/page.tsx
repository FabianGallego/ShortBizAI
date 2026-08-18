"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { diagnosticos } from "@/lib/diagnosticos";

import { jsPDF } from "jspdf";

import { supabase } from "@/lib/supabase";

export default function Resultado() {

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [diagnosticoDB, setDiagnosticoDB] = useState<any>(null);
const [cargando, setCargando] = useState(false);
  const tipo = searchParams.get("tipo") || "Restaurante";
  const empresaId = searchParams.get("empresa");
  useEffect(() => {
  if (!id) return;

  const cargarDiagnostico = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("diagnosticos")
      .select(`
        *,
        empresas (
          nombre,
          ciudad
        )
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setDiagnosticoDB(data);
    }

    setCargando(false);
  };

  cargarDiagnostico();
}, [id]);

if (cargando) {
  return <div className="p-10">Cargando diagnóstico...</div>;
}

if (!diagnosticoDB) {
  return <div className="p-10">Diagnóstico no encontrado.</div>;
}
const web = searchParams.get("web") || "Sí";
const wa = searchParams.get("wa") || "Sí";
const google = searchParams.get("google") || "Sí";



const descargarPDF = () => {
  const pdf = new jsPDF();

  const empresa =
    diagnosticoDB?.empresas?.nombre || "Empresa";

  const ciudad =
    diagnosticoDB?.empresas?.ciudad || "No especificada";

  const fecha = new Date().toLocaleDateString("es-CO");

  let nivelPDF = "";

  if (puntaje >= 85) {
    nivelPDF = "Excelente";
  } else if (puntaje >= 70) {
    nivelPDF = "Bueno";
  } else if (puntaje >= 50) {
    nivelPDF = "Puede mejorar";
  } else {
    nivelPDF = "Crítico";
  }

  // -----------------------------------
  // COLORES
  // -----------------------------------

  const azul = [0, 102, 204];
  const azulOscuro = [15, 55, 95];
  const gris = [90, 90, 90];
  const grisClaro = [235, 240, 245];
  const verde = [30, 150, 80];
  const amarillo = [245, 170, 40];
  const rojo = [210, 60, 60];

  // -----------------------------------
  // FUNCIONES AUXILIARES
  // -----------------------------------

  const agregarPie = (numeroPagina: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);

    pdf.text(
      "ShortBizAI System · Diagnóstico Ejecutivo",
      20,
      287
    );

    pdf.text(
      `Página ${numeroPagina}`,
      175,
      287
    );
  };

  const textoEnvuelto = (
    texto: string,
    x: number,
    y: number,
    ancho: number,
    tamaño = 11,
    color = gris
  ) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(tamaño);
    pdf.setTextColor(
      color[0],
      color[1],
      color[2]
    );

    const lineas = pdf.splitTextToSize(
      texto,
      ancho
    );

    pdf.text(lineas, x, y);

    return y + lineas.length * (tamaño * 0.45);
  };

  const agregarTituloSeccion = (
    titulo: string,
    y: number
  ) => {
    pdf.setFillColor(
      azul[0],
      azul[1],
      azul[2]
    );

    pdf.roundedRect(
      15,
      y - 7,
      180,
      10,
      2,
      2,
      "F"
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(255, 255, 255);

    pdf.text(
      titulo,
      20,
      y
    );

    return y + 15;
  };

  const agregarArea = (
    nombre: string,
    valor: number,
    maximo: number,
    y: number,
    color: number[]
  ) => {

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(40, 40, 40);

    pdf.text(
      nombre,
      20,
      y
    );

    pdf.setFont("helvetica", "normal");
    pdf.text(
      `${valor}/${maximo}`,
      170,
      y
    );

    pdf.setFillColor(
      225,
      230,
      235
    );

    pdf.roundedRect(
      20,
      y + 4,
      150,
      5,
      2,
      2,
      "F"
    );

    pdf.setFillColor(
      color[0],
      color[1],
      color[2]
    );

    const porcentaje =
      Math.max(
        0,
        Math.min(
          100,
          (valor / maximo) * 100
        )
      );

    pdf.roundedRect(
      20,
      y + 4,
      150 * (porcentaje / 100),
      5,
      2,
      2,
      "F"
    );

    return y + 18;
  };

  // -----------------------------------
  // PORTADA
  // -----------------------------------

  pdf.setFillColor(
    azul[0],
    azul[1],
    azul[2]
  );

  pdf.rect(
    0,
    0,
    210,
    55,
    "F"
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(25);
  pdf.setTextColor(255, 255, 255);

  pdf.text(
    "ShortBizAI System",
    20,
    25
  );

  pdf.setFontSize(17);

  pdf.text(
    "Diagnóstico Ejecutivo",
    20,
    38
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    "Evaluación de madurez digital y oportunidades de crecimiento",
    20,
    47
  );

  // Información de empresa

  pdf.setFillColor(
    245,
    247,
    250
  );

  pdf.roundedRect(
    15,
    70,
    180,
    45,
    4,
    4,
    "F"
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(
    azulOscuro[0],
    azulOscuro[1],
    azulOscuro[2]
  );

  pdf.text(
    "EMPRESA EVALUADA",
    22,
    82
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);

  pdf.text(
    empresa,
    22,
    94
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(
    gris[0],
    gris[1],
    gris[2]
  );

  pdf.text(
    `Tipo de negocio: ${tipo}`,
    22,
    104
  );

  pdf.text(
    `Ciudad: ${ciudad} · Fecha: ${fecha}`,
    22,
    111
  );

  // Puntaje principal

  pdf.setFillColor(
    235,
    245,
    255
  );

  pdf.roundedRect(
    15,
    125,
    180,
    55,
    4,
    4,
    "F"
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(
    azulOscuro[0],
    azulOscuro[1],
    azulOscuro[2]
  );

  pdf.text(
    "RESULTADO GENERAL",
    22,
    138
  );

  pdf.setFontSize(34);
  pdf.setTextColor(
    azul[0],
    azul[1],
    azul[2]
  );

  pdf.text(
    `${puntaje}/100`,
    22,
    160
  );

  pdf.setFontSize(15);

  pdf.setTextColor(
    verde[0],
    verde[1],
    verde[2]
  );

  pdf.text(
    nivelPDF,
    105,
    158
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(
    gris[0],
    gris[1],
    gris[2]
  );

  pdf.text(
    "Nivel de preparación digital del negocio",
    105,
    168
  );

  agregarPie(1);

  // -----------------------------------
  // PÁGINA 2 — RESUMEN EJECUTIVO
  // -----------------------------------

  pdf.addPage();

  let y = 25;

  y = agregarTituloSeccion(
    "1. RESUMEN EJECUTIVO",
    y
  );

  let resumenEjecutivo = "";

  if (puntaje >= 85) {
    resumenEjecutivo =
      `El diagnóstico evidencia que ${empresa} cuenta con una estructura digital sólida y presenta un nivel de madurez excelente (${puntaje}/100). El negocio dispone de capacidades importantes para atraer clientes y gestionar su operación. El principal reto identificado no está en construir una presencia digital desde cero, sino en aprovechar mejor la información, la automatización y las herramientas de inteligencia artificial para convertir esa capacidad existente en mayor eficiencia, seguimiento y crecimiento.`;
  } else if (puntaje >= 70) {
    resumenEjecutivo =
      `El diagnóstico muestra que ${empresa} presenta una base digital buena (${puntaje}/100), con capacidades que permiten competir y captar oportunidades. Sin embargo, todavía existen brechas que pueden limitar el crecimiento, especialmente en automatización, seguimiento de clientes, uso de datos y procesos comerciales. La prioridad debe ser convertir las herramientas existentes en procesos más sistemáticos y medibles.`;
  } else if (puntaje >= 50) {
    resumenEjecutivo =
      `El diagnóstico muestra que ${empresa} se encuentra en una etapa intermedia de madurez digital (${puntaje}/100). Existen herramientas y capacidades aprovechables, pero todavía hay oportunidades relevantes para mejorar la captación, atención, fidelización y toma de decisiones. Una estrategia ordenada de transformación digital puede generar mejoras importantes en eficiencia y crecimiento.`;
  } else {
    resumenEjecutivo =
      `El diagnóstico evidencia una madurez digital crítica (${puntaje}/100). Actualmente existen varias áreas que pueden estar generando pérdida de oportunidades comerciales y limitando la capacidad de crecimiento del negocio. Se recomienda iniciar un proceso gradual de transformación digital, priorizando primero la captación y atención de clientes y posteriormente la automatización y fidelización.`;
  }

  y = textoEnvuelto(
    resumenEjecutivo,
    20,
    y,
    170,
    11
  );

  y += 12;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(
    azulOscuro[0],
    azulOscuro[1],
    azulOscuro[2]
  );

  pdf.text(
    "Lectura estratégica del resultado",
    20,
    y
  );

  y += 8;

  const lectura =
    `El puntaje general se construye a partir de cuatro dimensiones: Atracción (${atraccion}/30), Atención (${atencion}/25), Fidelización (${fidelizacion}/20) e Inteligencia (${inteligencia}/25). Esta distribución permite identificar no solamente el resultado final, sino también dónde se encuentran las principales fortalezas y oportunidades del negocio.`;

  y = textoEnvuelto(
    lectura,
    20,
    y,
    170,
    11
  );

  y += 15;

  // -----------------------------------
  // FORTALEZAS
  // -----------------------------------

  y = agregarTituloSeccion(
    "2. FORTALEZAS IDENTIFICADAS",
    y
  );

  const fortalezas: string[] = [];

  if (atraccion >= 24) {
    fortalezas.push(
      "El negocio cuenta con una buena capacidad para atraer nuevos clientes mediante sus canales digitales."
    );
  }

  if (atencion >= 20) {
    fortalezas.push(
      "Existe una estructura favorable para atender y responder a los clientes."
    );
  }

  if (fidelizacion >= 16) {
    fortalezas.push(
      "El negocio presenta buenas condiciones para construir relaciones con clientes recurrentes."
    );
  }

  if (inteligencia >= 20) {
    fortalezas.push(
      "Existe un nivel favorable de utilización de tecnología, automatización, datos o inteligencia artificial."
    );
  }

  if (fortalezas.length === 0) {
    fortalezas.push(
      "Existe una base sobre la cual construir un proceso ordenado de transformación digital."
    );
  }

  fortalezas.forEach((fortaleza) => {

    pdf.setFillColor(
      235,
      248,
      240
    );

    pdf.roundedRect(
      15,
      y - 5,
      180,
      20,
      3,
      3,
      "F"
    );

    pdf.setFillColor(
      verde[0],
      verde[1],
      verde[2]
    );

    pdf.circle(
      24,
      y + 5,
      3,
      "F"
    );

    y = textoEnvuelto(
      fortaleza,
      32,
      y + 3,
      155,
      10
    );

    y += 12;
  });

  agregarPie(2);

  // -----------------------------------
  // PÁGINA 3 — ÁREAS EVALUADAS
  // -----------------------------------

  pdf.addPage();

  y = 25;

  y = agregarTituloSeccion(
    "3. ANÁLISIS POR ÁREAS",
    y
  );

  y = agregarArea(
    "Atracción",
    atraccion,
    30,
    y,
    azul
  );

  y = textoEnvuelto(
    atraccion >= 24
      ? "Fortaleza: el negocio cuenta con una buena capacidad para generar visibilidad y atraer nuevos clientes."
      : "Oportunidad: fortalecer la presencia digital, los canales de captación y la visibilidad frente a nuevos clientes.",
    20,
    y,
    170,
    9
  );

  y += 10;

  y = agregarArea(
    "Atención",
    atencion,
    25,
    y,
    verde
  );

  y = textoEnvuelto(
    atencion >= 20
      ? "Fortaleza: existen buenas condiciones para responder y gestionar las necesidades de los clientes."
      : "Oportunidad: mejorar los tiempos de respuesta y automatizar procesos de atención.",
    20,
    y,
    170,
    9
  );

  y += 10;

  y = agregarArea(
    "Fidelización",
    fidelizacion,
    20,
    y,
    [210, 70, 130]
  );

  y = textoEnvuelto(
    fidelizacion >= 16
      ? "Fortaleza: existe una buena base para generar relaciones y compras recurrentes."
      : "Oportunidad: fortalecer el seguimiento de clientes y crear mecanismos de recompra y fidelización.",
    20,
    y,
    170,
    9
  );

  y += 10;

  y = agregarArea(
    "Inteligencia",
    inteligencia,
    25,
    y,
    amarillo
  );

  y = textoEnvuelto(
    inteligencia >= 20
      ? "Fortaleza: el negocio presenta una buena utilización de herramientas de datos, automatización o IA."
      : "Oportunidad prioritaria: utilizar mejor la inteligencia artificial, automatización y análisis de información.",
    20,
    y,
    170,
    9
  );

  y += 20;

  y = agregarTituloSeccion(
    "4. PRINCIPAL OPORTUNIDAD",
    y
  );

  let principalOportunidad =
    "Optimizar los procesos digitales existentes para convertirlos en un sistema comercial más medible y eficiente.";

  if (inteligencia < 20) {
    principalOportunidad =
      "Incrementar el uso de inteligencia artificial, automatización y análisis de datos para mejorar la eficiencia y la toma de decisiones.";
  } else if (fidelizacion < 16) {
    principalOportunidad =
      "Construir un sistema de seguimiento y fidelización que aumente la recompra y el valor de cada cliente.";
  } else if (atencion < 20) {
    principalOportunidad =
      "Automatizar y estructurar la atención al cliente para responder más rápido y convertir más oportunidades.";
  } else if (atraccion < 24) {
    principalOportunidad =
      "Fortalecer los canales de captación y visibilidad para aumentar el flujo de nuevos clientes.";
  }

  pdf.setFillColor(
    255,
    248,
    230
  );

  pdf.roundedRect(
    15,
    y - 5,
    180,
    35,
    3,
    3,
    "F"
  );

  y = textoEnvuelto(
    principalOportunidad,
    22,
    y + 6,
    165,
    11
  );

  agregarPie(3);

  // -----------------------------------
  // PÁGINA 4 — OPORTUNIDADES
  // -----------------------------------

  pdf.addPage();

  y = 25;

  y = agregarTituloSeccion(
    "5. OPORTUNIDADES DE MEJORA",
    y
  );

  const oportunidadesPDF =
    oportunidades.slice(0, 8);

  oportunidadesPDF.forEach(
    (item, index) => {

      pdf.setFillColor(
        250,
        250,
        250
      );

      pdf.roundedRect(
        15,
        y - 6,
        180,
        22,
        3,
        3,
        "F"
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.setTextColor(
        azul[0],
        azul[1],
        azul[2]
      );

      pdf.text(
        `${index + 1}.`,
        21,
        y + 5
      );

      y = textoEnvuelto(
        item,
        31,
        y + 4,
        155,
        10
      );

      y += 12;
    }
  );

  y += 5;

  y = agregarTituloSeccion(
    "6. IMPACTO EMPRESARIAL",
    y
  );

  const impacto =
    "Cerrar estas brechas puede ayudar al negocio a captar más oportunidades comerciales, responder con mayor rapidez, aumentar la recurrencia de los clientes y tomar decisiones con mayor información. La recomendación es priorizar las acciones según su impacto y facilidad de implementación, evitando intentar transformar todos los procesos al mismo tiempo.";

  textoEnvuelto(
    impacto,
    20,
    y,
    170,
    11
  );

  agregarPie(4);

  // -----------------------------------
  // PÁGINA 5 — PLAN DE ACCIÓN
  // -----------------------------------

  pdf.addPage();

  y = 25;

  y = agregarTituloSeccion(
    "7. PLAN DE ACCIÓN RECOMENDADO",
    y
  );

  const fases = [
    {
      titulo: "FASE 1 · CAPTAR",
      texto:
        "Fortalecer la presencia digital, Google Business, página web y contenido para aumentar la visibilidad y generar nuevas oportunidades comerciales.",
      color: azul,
    },
    {
      titulo: "FASE 2 · CONVERTIR",
      texto:
        "Optimizar WhatsApp Business, automatizar respuestas y estructurar procesos de atención para convertir más consultas en clientes.",
      color: verde,
    },
    {
      titulo: "FASE 3 · FIDELIZAR",
      texto:
        "Crear una base de datos de clientes y establecer campañas de seguimiento, recompra y fidelización.",
      color: [150, 80, 180],
    },
    {
      titulo: "FASE 4 · INTELIGENCIA",
      texto:
        "Incorporar inteligencia artificial, automatización y análisis de ventas para tomar mejores decisiones y escalar la operación.",
      color: amarillo,
    },
  ];

  fases.forEach((fase, index) => {

    pdf.setFillColor(
      248,
      249,
      250
    );

    pdf.roundedRect(
      15,
      y - 5,
      180,
      42,
      4,
      4,
      "F"
    );

    pdf.setFillColor(
      fase.color[0],
      fase.color[1],
      fase.color[2]
    );

    pdf.rect(
      15,
      y - 5,
      5,
      42,
      "F"
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(13);

    pdf.setTextColor(
      35,
      35,
      35
    );

    pdf.text(
      fase.titulo,
      27,
      y + 7
    );

    textoEnvuelto(
      fase.texto,
      27,
      y + 17,
      158,
      10
    );

    y += 50;
  });

  y += 5;

  y = agregarTituloSeccion(
    "8. CONCLUSIÓN EJECUTIVA",
    y
  );

  const conclusion =
    `Con un resultado de ${puntaje}/100, ${empresa} presenta un nivel ${nivelPDF.toLowerCase()}. El siguiente paso recomendado es convertir las oportunidades detectadas en un plan de implementación concreto, priorizando aquellas acciones que puedan generar resultados comerciales y operativos en el menor tiempo posible.`;

  textoEnvuelto(
    conclusion,
    20,
    y,
    170,
    11
  );

  agregarPie(5);

  // -----------------------------------
  // PÁGINA FINAL — AAF
  // -----------------------------------

  pdf.addPage();

  pdf.setFillColor(
    azul[0],
    azul[1],
    azul[2]
  );

  pdf.rect(
    0,
    0,
    210,
    297,
    "F"
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(26);
  pdf.setTextColor(
    255,
    255,
    255
  );

  pdf.text(
    "ShortBizAI System",
    105,
    85,
    {
      align: "center",
    }
  );

  pdf.setFontSize(19);

  pdf.text(
    "De diagnóstico a crecimiento",
    105,
    105,
    {
      align: "center",
    }
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(12);

  pdf.text(
    "El verdadero valor del diagnóstico está",
    105,
    130,
    {
      align: "center",
    }
  );

  pdf.text(
    "en convertir sus hallazgos en acciones.",
    105,
    138,
    {
      align: "center",
    }
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(15);

  pdf.text(
    "Agenda una asesoría personalizada",
    105,
    170,
    {
      align: "center",
    }
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(11);

  pdf.text(
    "WhatsApp: +1 929 301 1167",
    105,
    183,
    {
      align: "center",
    }
  );

  pdf.setFontSize(9);

  pdf.text(
    "Diagnóstico generado por ShortBizAI System",
    105,
    270,
    {
      align: "center",
    }
  );

  pdf.save(
    `Diagnostico-Ejecutivo-${empresa}.pdf`
  );
};




 

const datos = 
  diagnosticos[tipo as keyof typeof diagnosticos] ||
  diagnosticos.Restaurante;


let oportunidades =
  diagnosticoDB?.oportunidades
    ? [...diagnosticoDB.oportunidades]
    : [...datos.oportunidades];


if (web === "No") {
  oportunidades.push("No tiene página web profesional.");
}

if (wa === "No") {
  oportunidades.push("No utiliza WhatsApp Business.");
}

if (google === "No") {
  oportunidades.push("No aparece en Google Business.");

let hallazgos = [];

if (web === "No") {
  hallazgos.push({
    color: "red",
    titulo: "Sin página web profesional",
    descripcion:
      "Los clientes tienen dificultades para encontrar información de tu negocio y generar confianza.",
  });
}

if (wa === "No") {
  hallazgos.push({
    color: "yellow",
    titulo: "Atención poco automatizada",
    descripcion:
      "No utilizar WhatsApp Business limita la velocidad de atención y el seguimiento de clientes.",
  });
}

if (google === "No") {
  hallazgos.push({
    color: "blue",
    titulo: "Baja visibilidad en Google",
    descripcion:
      "Muchos clientes potenciales no podrán encontrarte cuando busquen negocios como el tuyo.",
  });
}




}

 let puntaje = diagnosticoDB?.puntaje ?? 0;
let atraccion = diagnosticoDB?.atraccion ?? 0;
let atencion = diagnosticoDB?.atencion ?? 0;
let fidelizacion = diagnosticoDB?.fidelizacion ?? 0;
let inteligencia = diagnosticoDB?.inteligencia ?? 0;







let nivel = "";

if (puntaje >= 85) {
  nivel = "🟢 Excelente";
} else if (puntaje >= 70) {
  nivel = "🟡 Bueno";
} else if (puntaje >= 50) {
  nivel = "🟠 Puede mejorar";
} else {
  nivel = "🔴 Crítico";
}

let colorBarra = "bg-red-500";
let resumen = "";

if (puntaje >= 80) {
  resumen =
    "¡Excelente! Tu negocio tiene una base digital sólida. Ahora el enfoque debe ser optimizar y automatizar procesos para seguir creciendo.";
} else if (puntaje >= 60) {
  resumen =
    "Tu negocio tiene una buena presencia digital, pero existen oportunidades importantes para captar más clientes y mejorar la eficiencia.";
} else if (puntaje >= 40) {
  resumen =
    "Tu negocio necesita fortalecer varios aspectos digitales para aumentar su competitividad y mejorar la experiencia del cliente.";
} else {
  resumen =
    "Se recomienda iniciar una transformación digital cuanto antes para evitar perder oportunidades de crecimiento.";
}


if (puntaje >= 80) {
  colorBarra = "bg-green-500";
} else if (puntaje >= 60) {
  colorBarra = "bg-yellow-500";
} else if (puntaje >= 40) {
  colorBarra = "bg-orange-500";
}





const hallazgos = [];

// =========================
// ATRACCIÓN — máximo 30
// =========================

if (atraccion < 30) {
  hallazgos.push({
    color: "red",
    titulo: "Oportunidad de mejorar la atracción",
    descripcion:
      "Existen aspectos de presencia digital que pueden mejorarse para atraer más clientes.",
  });
} else {
  hallazgos.push({
    color: "blue",
    titulo: "Excelente capacidad de atracción",
    descripcion:
      "Tu negocio cuenta con una buena presencia digital para atraer nuevos clientes.",
  });
}

// =========================
// ATENCIÓN — máximo 25
// =========================

if (atencion < 25) {
  hallazgos.push({
    color: "yellow",
    titulo: "Oportunidad de mejorar la atención",
    descripcion:
      "Existen oportunidades para mejorar la rapidez, automatización y gestión de la atención al cliente.",
  });
} else {
  hallazgos.push({
    color: "blue",
    titulo: "Excelente proceso de atención",
    descripcion:
      "Tu negocio cuenta con buenas herramientas para atender y gestionar a sus clientes.",
  });
}

// =========================
// FIDELIZACIÓN — máximo 20
// =========================

if (fidelizacion < 20) {
  hallazgos.push({
    color: "yellow",
    titulo: "Oportunidad de mejorar la fidelización",
    descripcion:
      "Existen oportunidades para fortalecer el seguimiento y generar más clientes recurrentes.",
  });
} else {
  hallazgos.push({
    color: "blue",
    titulo: "Excelente capacidad de fidelización",
    descripcion:
      "Tu negocio cuenta con una buena base para generar clientes recurrentes.",
  });
}

// =========================
// INTELIGENCIA — máximo 25
// =========================

if (inteligencia < 25) {
  hallazgos.push({
    color: "orange",
    titulo: "Oportunidad de mejorar la inteligencia del negocio",
    descripcion:
      "Existen oportunidades para utilizar mejor la inteligencia artificial, automatización y análisis de datos.",
  });
} else {
  hallazgos.push({
    color: "blue",
    titulo: "Excelente nivel de inteligencia empresarial",
    descripcion:
      "Tu negocio cuenta con buenas herramientas de automatización, IA y análisis.",
  });
}





const recomendaciones = [
  "Implementar una estrategia de contenido para redes sociales.",
  "Automatizar la atención mediante IA y WhatsApp.",
  "Optimizar la ficha de Google Business.",
  "Crear campañas para fidelizar clientes.",
];



<div className="mt-10 bg-red-50 border-l-8 border-red-600 rounded-2xl p-6 shadow-lg">

  <h2 className="text-2xl font-bold text-red-700 mb-4">
    📉 Impacto en el Negocio
  </h2>

  <p className="text-gray-700 leading-8">
    Si estas oportunidades no se corrigen, el negocio puede perder clientes
    potenciales, reducir sus ventas y quedar en desventaja frente a
    competidores que ya utilizan herramientas digitales y automatización.
  </p>

</div>
  return (

        
    <main className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white rounded-xl shadow-xl p-10 w-[700px]">

 <div id="reporte" className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl p-8">

  <h1 className="text-4xl font-extrabold">
    🏢 ShortBizAI
  </h1>

  <h2 className="text-2xl mt-3 font-semibold">
    Diagnóstico Ejecutivo del Negocio
  </h2>

  <p className="mt-4 text-blue-100">
    Analizamos las principales áreas de tu negocio y generamos un plan de acción personalizado.
  </p>

<p className="mt-4 font-semibold">
  Empresa: {diagnosticoDB?.empresas?.nombre}
</p>

<p className="text-blue-100">
  Ciudad: {diagnosticoDB?.empresas?.ciudad}
</p>

</div>

<div className="mt-8 bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-6 shadow-lg">

  <h2 className="text-2xl font-bold text-blue-800 mb-4">
    📋 Diagnóstico Ejecutivo
  </h2>

  <p className="text-gray-700 leading-8">
    Después de analizar la información suministrada por tu empresa,
    identificamos oportunidades importantes de mejora en la forma en que
    atraes clientes, los atiendes y logras que regresen.
  </p>

  <p className="text-gray-700 leading-8 mt-4">
    Este informe no evalúa la calidad de tu producto o servicio; evalúa
    qué tan preparado está tu negocio para crecer utilizando marketing,
    automatización e inteligencia artificial.
  </p>

  <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">

  <h2 className="text-2xl font-bold mb-6">
    🔍 Hallazgos Principales
  </h2>

 <div className="space-y-4">

  {hallazgos.map((h: any, index) => (

    <div
      key={index}
      className={`rounded-xl p-5 border-l-8 shadow-lg
      ${
        h.color === "red"
          ? "border-red-500 bg-red-50"
          : h.color === "yellow"
          ? "border-yellow-500 bg-yellow-50"
          : "border-blue-500 bg-blue-50"
      }`}
    >

      <h3 className="font-bold text-xl">
        {h.titulo}
      </h3>

      <p className="mt-2 text-gray-700">
        {h.descripcion}
      </p>

    </div>

  ))}

</div>





</div>

</div>

<button
  onClick={descargarPDF}
className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
>
  📄 Descargar Diagnóstico en PDF
</button>
        

       <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">

  <h2 className="text-2xl font-bold text-gray-700">
    Puntaje General
  </h2>

  <p className="mt-4 text-7xl font-extrabold text-blue-600">
    {puntaje}/100
  </p>

  <div className="mt-3 inline-block px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-bold">
    {nivel}
  </div>

</div>

<div className="w-full bg-gray-200 rounded-full h-4 mt-4">
  <div
    className={`${colorBarra} h-4 rounded-full transition-all duration-500`}
    style={{ width: `${puntaje}%` }}
  ></div>
</div>

<div className="mt-6 p-6 rounded-xl bg-blue-50 border border-blue-200">
  <h2 className="text-xl font-bold mb-2">
    Resumen del diagnóstico
  </h2>

  <p>
    Tu negocio obtuvo un puntaje de <strong>{puntaje}/100</strong>, con un nivel{" "}
    <strong>{nivel}</strong>.
  </p>

  
</div>


<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-blue-500">
    <div className="text-4xl">🎯</div>
    <h3 className="text-xl font-bold mt-2">Atracción</h3>
    <p className="text-3xl font-bold text-blue-600 mt-2">{atraccion}%</p>

    <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
      <div
        className="bg-blue-600 h-3 rounded-full"
        style={{ width: `${atraccion}%` }}
      />
    </div>
  </div>

  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-green-500">
    <div className="text-4xl">🤖</div>
    <h3 className="text-xl font-bold mt-2">Atención</h3>
    <p className="text-3xl font-bold text-green-600 mt-2">{atencion}%</p>

    <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
      <div
        className="bg-green-600 h-3 rounded-full"
        style={{ width: `${atencion}%` }}
      />
    </div>
  </div>

  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-pink-500">
  <div className="text-4xl">❤️</div>
  <h3 className="text-xl font-bold mt-2">Fidelización</h3>
  <p className="text-3xl font-bold text-pink-600 mt-2">{fidelizacion}%</p>

  <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
    <div
      className="bg-pink-500 h-3 rounded-full"
      style={{ width: `${fidelizacion}%` }}
    ></div>
  </div>
</div>

<div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-orange-500">
  <div className="text-4xl">📊</div>
  <h3 className="text-xl font-bold mt-2">Inteligencia</h3>
  <p className="text-3xl font-bold text-orange-600 mt-2">{inteligencia}%</p>

  <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
    <div
      className="bg-orange-500 h-3 rounded-full"
      style={{ width: `${inteligencia}%` }}
    ></div>
  </div>
</div>
</div>
<div className="mt-16 clear-both">

</div>
        <div className="mt-8">

          <div className="mt-10">

  <h2 className="text-3xl font-bold text-gray-800 mb-6">
    💡 Oportunidades Detectadas
  </h2>

  <div className="space-y-4">


    {oportunidades.map((item, index) => (

      <div
        key={index}
        className="bg-yellow-50 rounded-2xl border-l-8 border-yellow-500 p-5 shadow-lg hover:scale-[1.02] transition-all duration-300"
      >

        <div className="flex items-center gap-3">

          <div className="text-3xl">
            ⚠️
          </div>

          <p className="text-lg font-medium text-gray-700">
            {item}
          </p>

        </div>

      </div>

    ))}

  </div>

</div>

<h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">
  🎯 Plan de Crecimiento
</h2>

<div className="space-y-6">

  <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-6">
    <h3 className="text-xl font-bold">
      Fase 1 · Atraer clientes
    </h3>

    <p className="mt-2 text-gray-700">
      Incrementar la visibilidad del negocio mediante redes sociales,
      Google Business, página web y contenido de valor.
    </p>
  </div>

  <div className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-6">
    <h3 className="text-xl font-bold">
      Fase 2 · Atender mejor
    </h3>

    <p className="mt-2 text-gray-700">
      Automatizar la atención con WhatsApp Business e Inteligencia Artificial
      para responder más rápido y captar más oportunidades.
    </p>
  </div>

  <div className="bg-purple-50 border-l-8 border-purple-600 rounded-2xl p-6">
    <h3 className="text-xl font-bold">
      Fase 3 · Fidelizar clientes
    </h3>

    <p className="mt-2 text-gray-700">
      Implementar campañas de seguimiento y fidelización para aumentar
      las compras repetidas y el valor de cada cliente.
    </p>
  </div>

</div>

<div className="mt-12 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-center text-white">

  <h2 className="text-3xl font-bold">
    🚀 ¿Listo para hacer crecer tu negocio?
  </h2>

  <p className="mt-4 text-green-100">
    Agenda una asesoría personalizada con ShortBizAI System y descubre cómo aumentar tus ventas utilizando automatización e inteligencia artificial.
  </p>

  <a
    href="https://wa.me/9293011167?text=Hola%20AAF%20Business%20System,%20quiero%20agendar%20una%20asesoría."
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block mt-6 bg-white text-green-700 font-bold px-10 py-4 rounded-xl shadow-lg hover:scale-105 transition"
  >
    📲 Agendar Asesoría por WhatsApp
  </a>

</div>



        </div>

        
      </div>



    </main>
  );
}