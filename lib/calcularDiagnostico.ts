import { diagnosticos } from "@/lib/diagnosticos";

export function calcularDiagnostico(
  tipo: string,
  web: string,
  wa: string,
  google: string,
  redes: string,
  ia: string,
  automatizacion: string,
  baseDatos: string,
  ventas: string,
  reservas: string
) {
  const datos =
    diagnosticos[tipo as keyof typeof diagnosticos] ??
    diagnosticos.Restaurante;

  const esSi = (valor: string) => valor === "Sí";

  // =========================
  // ATRACCIÓN — 30 PUNTOS
  // =========================

  let atraccion = 0;

  if (esSi(web)) atraccion += 10;
  if (esSi(google)) atraccion += 10;
  if (esSi(redes)) atraccion += 10;

  // =========================
  // ATENCIÓN — 25 PUNTOS
  // =========================

  let atencion = 0;

  if (esSi(wa)) atencion += 10;
  if (esSi(automatizacion)) atencion += 10;
  if (esSi(reservas)) atencion += 5;

  // =========================
  // FIDELIZACIÓN — 20 PUNTOS
  // =========================

  let fidelizacion = 0;

  if (esSi(wa)) fidelizacion += 5;
  if (esSi(baseDatos)) fidelizacion += 10;
  if (esSi(reservas)) fidelizacion += 5;

  // =========================
  // INTELIGENCIA — 25 PUNTOS
  // =========================

  let inteligencia = 0;

  if (esSi(ia)) inteligencia += 10;
  if (esSi(automatizacion)) inteligencia += 5;
  if (esSi(baseDatos)) inteligencia += 5;
  if (esSi(ventas)) inteligencia += 5;

  // =========================
  // PUNTAJE GENERAL
  // =========================

  const puntaje = Math.round(
    atraccion +
    atencion +
    fidelizacion +
    inteligencia
  );

  // =========================
  // NIVEL
  // =========================

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

  // =========================
  // OPORTUNIDADES
  // =========================

 const oportunidades: string[] = [...datos.oportunidades];
  if (!esSi(web)) {
    oportunidades.push(
      "Crear o mejorar una página web profesional."
    );
  }

  if (!esSi(wa)) {
    oportunidades.push(
      "Implementar WhatsApp Business para mejorar la atención."
    );
  }

  if (!esSi(google)) {
    oportunidades.push(
      "Optimizar la presencia del negocio en Google Business Profile."
    );
  }

  if (!esSi(redes)) {
    oportunidades.push(
      "Desarrollar una estrategia constante de contenido en redes sociales."
    );
  }

  if (!esSi(ia)) {
    oportunidades.push(
      "Implementar herramientas de Inteligencia Artificial."
    );
  }

  if (!esSi(automatizacion)) {
    oportunidades.push(
      "Automatizar respuestas y procesos repetitivos."
    );
  }

  if (!esSi(baseDatos)) {
    oportunidades.push(
      "Crear una base de datos de clientes."
    );
  }

  if (!esSi(ventas)) {
    oportunidades.push(
      "Analizar periódicamente las ventas y el comportamiento de los clientes."
    );
  }

  if (!esSi(reservas)) {
    oportunidades.push(
      "Implementar reservas, citas o pedidos en línea."
    );
  }

  return {
    puntaje,
    nivel,
    atraccion,
    atencion,
    fidelizacion,
    inteligencia,
    oportunidades,
  };
}