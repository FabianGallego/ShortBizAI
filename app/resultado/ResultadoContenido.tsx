"use client";



import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";

import { supabase } from "@/lib/supabase";

type Hallazgo = {
  color: "red" | "yellow" | "blue" | "orange";
  titulo: string;
  descripcion: string;
};

function ResultadoContenido() {
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const tipo = searchParams.get("tipo") || "Restaurante";

  const web = searchParams.get("web") || "Sí";
  const wa = searchParams.get("wa") || "Sí";
  const google = searchParams.get("google") || "Sí";

  const [diagnosticoDB, setDiagnosticoDB] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  // =====================================================
  // CARGAR DIAGNÓSTICO
  // =====================================================

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

      if (error) {
        console.error("Error cargando diagnóstico:", error);
      } else if (data) {
        setDiagnosticoDB(data);
      }

      setCargando(false);
    };

    cargarDiagnostico();
  }, [id]);

  // =====================================================
  // ESTADOS
  // =====================================================

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="text-4xl mb-4">⏳</div>

          <h1 className="text-2xl font-bold text-gray-800">
            Cargando diagnóstico...
          </h1>

          <p className="mt-2 text-gray-500">
            Estamos preparando tu diagnóstico ejecutivo.
          </p>
        </div>
      </main>
    );
  }

  if (!diagnosticoDB) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="text-4xl mb-4">⚠️</div>

          <h1 className="text-2xl font-bold text-red-600">
            Diagnóstico no encontrado
          </h1>

          <p className="mt-2 text-gray-600">
            No pudimos encontrar la información del diagnóstico.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // DATOS
  // =====================================================

  const puntaje = Number(diagnosticoDB.puntaje ?? 0);
  const atraccion = Number(diagnosticoDB.atraccion ?? 0);
  const atencion = Number(diagnosticoDB.atencion ?? 0);
  const fidelizacion = Number(
    diagnosticoDB.fidelizacion ?? 0
  );
  const inteligencia = Number(
    diagnosticoDB.inteligencia ?? 0
  );

  const empresa =
    diagnosticoDB.empresas?.nombre || "Empresa";

  const ciudad =
    diagnosticoDB.empresas?.ciudad || "No especificada";

  

  // =====================================================
  // NIVEL
  // =====================================================

  let nivel = "";
  let nivelPDF = "";
  let colorBarra = "bg-red-500";

  if (puntaje >= 85) {
    nivel = "🟢 Excelente";
    nivelPDF = "Excelente";
    colorBarra = "bg-green-500";
  } else if (puntaje >= 70) {
    nivel = "🟡 Bueno";
    nivelPDF = "Bueno";
    colorBarra = "bg-yellow-500";
  } else if (puntaje >= 50) {
    nivel = "🟠 Puede mejorar";
    nivelPDF = "Puede mejorar";
    colorBarra = "bg-orange-500";
  } else {
    nivel = "🔴 Crítico";
    nivelPDF = "Crítico";
    colorBarra = "bg-red-500";
  }

  // =====================================================
  // RESUMEN
  // =====================================================

  let resumen = "";

  if (puntaje >= 85) {
    resumen =
      "¡Excelente! Tu negocio tiene una base digital sólida. Ahora el enfoque debe ser optimizar y automatizar procesos para seguir creciendo.";
  } else if (puntaje >= 70) {
    resumen =
      "Tu negocio tiene una buena presencia digital, pero existen oportunidades importantes para captar más clientes y mejorar la eficiencia.";
  } else if (puntaje >= 50) {
    resumen =
      "Tu negocio necesita fortalecer varios aspectos digitales para aumentar su competitividad y mejorar la experiencia del cliente.";
  } else {
    resumen =
      "Se recomienda iniciar una transformación digital cuanto antes para evitar perder oportunidades de crecimiento.";
  }

  // =====================================================
  // OPORTUNIDADES
  // =====================================================


  const oportunidades: string[] = Array.isArray(
  diagnosticoDB?.oportunidades
)
  ? [...diagnosticoDB.oportunidades]
  : [];

  if (web === "No") {
    oportunidades.push(
      "No tiene página web profesional."
    );
  }

  if (wa === "No") {
    oportunidades.push(
      "No utiliza WhatsApp Business."
    );
  }

  if (google === "No") {
    oportunidades.push(
      "No aparece en Google Business."
    );
  }

  const oportunidadesUnicas = [
    ...new Set(oportunidades),
  ];

  // =====================================================
  // HALLAZGOS
  // =====================================================

  const hallazgos: Hallazgo[] = [];

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

  if (inteligencia < 25) {
    hallazgos.push({
      color: "orange",
      titulo:
        "Oportunidad de mejorar la inteligencia del negocio",
      descripcion:
        "Existen oportunidades para utilizar mejor la inteligencia artificial, automatización y análisis de datos.",
    });
  } else {
    hallazgos.push({
      color: "blue",
      titulo:
        "Excelente nivel de inteligencia empresarial",
      descripcion:
        "Tu negocio cuenta con buenas herramientas de automatización, IA y análisis.",
    });
  }

  // =====================================================
  // PRINCIPAL OPORTUNIDAD
  // =====================================================

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

  // =====================================================
  // PORCENTAJES REALES
  // =====================================================

  const atraccionPct = Math.round(
    (atraccion / 30) * 100
  );

  const atencionPct = Math.round(
    (atencion / 25) * 100
  );

  const fidelizacionPct = Math.round(
    (fidelizacion / 20) * 100
  );

  const inteligenciaPct = Math.round(
    (inteligencia / 25) * 100
  );

  // =====================================================
  // PDF
  // =====================================================

  const descargarPDF = () => {
    const pdf = new jsPDF();

    const fecha =
      new Date().toLocaleDateString("es-CO");

    // Aquí mantienes tu función PDF completa.
    // Tu código de generación PDF de la segunda versión
    // puede ir aquí sin duplicar ninguna otra parte del componente.

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(25);

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
      `Empresa: ${empresa}`,
      20,
      55
    );

    pdf.text(
      `Ciudad: ${ciudad}`,
      20,
      63
    );

    pdf.text(
      `Fecha: ${fecha}`,
      20,
      71
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(30);

    pdf.text(
      `${puntaje}/100`,
      20,
      100
    );

    pdf.setFontSize(15);

    pdf.text(
      nivelPDF,
      20,
      112
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    pdf.text(
      `Atracción: ${atraccion}/30`,
      20,
      135
    );

    pdf.text(
      `Atención: ${atencion}/25`,
      20,
      145
    );

    pdf.text(
      `Fidelización: ${fidelizacion}/20`,
      20,
      155
    );

    pdf.text(
      `Inteligencia: ${inteligencia}/25`,
      20,
      165
    );

    pdf.text(
      "Principal oportunidad:",
      20,
      185
    );

    const lineas = pdf.splitTextToSize(
      principalOportunidad,
      170
    );

    pdf.text(
      lineas,
      20,
      195
    );

    pdf.save(
      `Diagnostico-Ejecutivo-${empresa
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, "")
        .replace(/\s+/g, "-")}.pdf`
    );
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-[900px] mx-auto">

        {/* CABECERA */}

        <div
          id="reporte"
          className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl p-8 shadow-xl"
        >
          <h1 className="text-4xl font-extrabold">
            🏢 ShortBizAI
          </h1>

          <h2 className="text-2xl mt-3 font-semibold">
            Diagnóstico Ejecutivo del Negocio
          </h2>

          <p className="mt-4 text-blue-100">
            Analizamos las principales áreas de tu negocio
            y generamos un plan de acción personalizado.
          </p>

          <p className="mt-4 font-semibold">
            Empresa: {empresa}
          </p>

          <p className="text-blue-100">
            Ciudad: {ciudad}
          </p>
        </div>

        {/* DIAGNÓSTICO */}

        <div className="mt-8 bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            📋 Diagnóstico Ejecutivo
          </h2>

          <p className="text-gray-700 leading-8">
            Después de analizar la información suministrada
            por tu empresa, identificamos oportunidades
            importantes de mejora en la forma en que atraes
            clientes, los atiendes y logras que regresen.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            Este informe evalúa qué tan preparado está tu
            negocio para crecer utilizando marketing,
            automatización e inteligencia artificial.
          </p>
        </div>

        {/* HALLAZGOS */}

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">

          <h2 className="text-2xl font-bold mb-6">
            🔍 Hallazgos Principales
          </h2>

          <div className="space-y-4">

            {hallazgos.map((h, index) => (
              <div
                key={index}
                className={`rounded-xl p-5 border-l-8 shadow-lg ${
                  h.color === "red"
                    ? "border-red-500 bg-red-50"
                    : h.color === "yellow"
                    ? "border-yellow-500 bg-yellow-50"
                    : h.color === "orange"
                    ? "border-orange-500 bg-orange-50"
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

        {/* PDF */}

        <button
          onClick={descargarPDF}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
        >
          📄 Descargar Diagnóstico en PDF
        </button>

        {/* PUNTAJE */}

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

          <p className="mt-5 text-gray-600">
            {resumen}
          </p>

        </div>

        {/* BARRA */}

        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div
            className={`${colorBarra} h-4 rounded-full transition-all duration-500`}
            style={{
              width: `${Math.min(100, puntaje)}%`,
            }}
          />
        </div>

        {/* ÁREAS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-blue-500">
            <div className="text-4xl">🎯</div>

            <h3 className="text-xl font-bold mt-2">
              Atracción
            </h3>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {atraccion}/{30}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{
                  width: `${atraccionPct}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {atraccionPct}% de cumplimiento
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-green-500">
            <div className="text-4xl">🤖</div>

            <h3 className="text-xl font-bold mt-2">
              Atención
            </h3>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {atencion}/{25}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{
                  width: `${atencionPct}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {atencionPct}% de cumplimiento
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-pink-500">
            <div className="text-4xl">❤️</div>

            <h3 className="text-xl font-bold mt-2">
              Fidelización
            </h3>

            <p className="text-3xl font-bold text-pink-600 mt-2">
              {fidelizacion}/{20}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div
                className="bg-pink-500 h-3 rounded-full"
                style={{
                  width: `${fidelizacionPct}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {fidelizacionPct}% de cumplimiento
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-orange-500">
            <div className="text-4xl">📊</div>

            <h3 className="text-xl font-bold mt-2">
              Inteligencia
            </h3>

            <p className="text-3xl font-bold text-orange-600 mt-2">
              {inteligencia}/{25}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div
                className="bg-orange-500 h-3 rounded-full"
                style={{
                  width: `${inteligenciaPct}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {inteligenciaPct}% de cumplimiento
            </p>
          </div>

        </div>

        {/* OPORTUNIDADES */}

        <div className="mt-12">

          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            💡 Oportunidades Detectadas
          </h2>

          <div className="space-y-4">

            {oportunidadesUnicas.map(
              (item, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 rounded-2xl border-l-8 border-yellow-500 p-5 shadow-lg"
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
              )
            )}

          </div>

        </div>

        {/* PRINCIPAL OPORTUNIDAD */}

        <div className="mt-10 bg-orange-50 border-l-8 border-orange-500 rounded-2xl p-6 shadow-lg">

          <h2 className="text-2xl font-bold text-orange-700 mb-3">
            🎯 Principal oportunidad
          </h2>

          <p className="text-gray-700 leading-8">
            {principalOportunidad}
          </p>

        </div>

        {/* IMPACTO */}

        <div className="mt-10 bg-red-50 border-l-8 border-red-600 rounded-2xl p-6 shadow-lg">

          <h2 className="text-2xl font-bold text-red-700 mb-4">
            📉 Impacto en el Negocio
          </h2>

          <p className="text-gray-700 leading-8">
            Si estas oportunidades no se corrigen, el negocio
            puede perder clientes potenciales, reducir sus
            ventas y quedar en desventaja frente a competidores
            que ya utilizan herramientas digitales y
            automatización.
          </p>

        </div>

        {/* PLAN */}

        <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">
          🎯 Plan de Crecimiento
        </h2>

        <div className="space-y-6">

          <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-6">
            <h3 className="text-xl font-bold">
              Fase 1 · Atraer clientes
            </h3>

            <p className="mt-2 text-gray-700">
              Incrementar la visibilidad del negocio mediante
              redes sociales, Google Business, página web y
              contenido de valor.
            </p>
          </div>

          <div className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-6">
            <h3 className="text-xl font-bold">
              Fase 2 · Atender mejor
            </h3>

            <p className="mt-2 text-gray-700">
              Automatizar la atención con WhatsApp Business
              e Inteligencia Artificial para responder más
              rápido y captar más oportunidades.
            </p>
          </div>

          <div className="bg-purple-50 border-l-8 border-purple-600 rounded-2xl p-6">
            <h3 className="text-xl font-bold">
              Fase 3 · Fidelizar clientes
            </h3>

            <p className="mt-2 text-gray-700">
              Implementar campañas de seguimiento y
              fidelización para aumentar las compras repetidas
              y el valor de cada cliente.
            </p>
          </div>

          <div className="bg-orange-50 border-l-8 border-orange-600 rounded-2xl p-6">
            <h3 className="text-xl font-bold">
              Fase 4 · Inteligencia
            </h3>

            <p className="mt-2 text-gray-700">
              Incorporar IA, automatización y análisis de datos
              para mejorar la toma de decisiones y escalar
              la operación.
            </p>
          </div>

        </div>

        {/* CTA */}

        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-center text-white">

          <h2 className="text-3xl font-bold">
            🚀 ¿Listo para hacer crecer tu negocio?
          </h2>

          <p className="mt-4 text-green-100">
            Agenda una asesoría personalizada con ShortBizAI
            System y descubre cómo aumentar tus ventas
            utilizando automatización e inteligencia artificial.
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
    </main>
  );
}
export default ResultadoContenido;
