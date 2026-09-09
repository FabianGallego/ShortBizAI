"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calcularDiagnostico } from "@/lib/calcularDiagnostico";
import Image from "next/image";

export default function Diagnostico() {
  const router = useRouter();

  /* =========================================================
     IDIOMA
  ========================================================= */

  const [idioma, setIdioma] = useState<"en" | "es">("en");

  useEffect(() => {
    const idiomaGuardado =
      window.localStorage.getItem("shortbizai_idioma");

    if (
      idiomaGuardado === "en" ||
      idiomaGuardado === "es"
    ) {
      setIdioma(idiomaGuardado);
    }
  }, []);

  /* =========================================================
     DATOS DEL NEGOCIO
  ========================================================= */

  const [tipo, setTipo] = useState("Restaurante");

  const [nombreNegocio, setNombreNegocio] =
    useState("");

  const [ciudad, setCiudad] =
    useState("");

  const [paginaWeb, setPaginaWeb] =
    useState("Sí");

  const [whatsapp, setWhatsapp] =
    useState("Sí");

  const [googleBusiness, setGoogleBusiness] =
    useState("Sí");

  const [redesSociales, setRedesSociales] =
    useState("Sí");

  const [inteligenciaArtificial, setInteligenciaArtificial] =
    useState("No");

  const [automatizacion, setAutomatizacion] =
    useState("No");

  const [baseDatosClientes, setBaseDatosClientes] =
    useState("No");

  const [analizaVentas, setAnalizaVentas] =
    useState("No");

  const [reservasOnline, setReservasOnline] =
    useState("No");

  /* =========================================================
     TEXTOS
  ========================================================= */

  const textos = {
    en: {
      titulo:
        "AI Growth Assessment",

      descripcion:
        "Discover in less than 3 minutes how to attract more customers, automate processes, and increase your business sales with Artificial Intelligence.",

      minutos:
        "3 minutes",

      ia:
        "AI",

      reporte:
        "Personalized report",

      nombreNegocio:
        "Business name",

      ciudad:
        "City",

      tipoNegocio:
        "Business type",

      restaurante:
        "Restaurant",

      barberia:
        "Barbershop",

      tienda:
        "Store",

      clinica:
        "Clinic",

      otro:
        "Other",

      paginaWeb:
        "🌐 Does your business have a website?",

      whatsapp:
        "💬 Do you serve your customers through WhatsApp?",

      googleBusiness:
        "📍 Does your business appear on Google Maps?",

      redesSociales:
        "📲 Does your business publish content on social media?",

      inteligenciaArtificial:
        "🤖 Does your business use Artificial Intelligence?",

      automatizacion:
        "⚙️ Do you automate customer service responses or processes?",

      baseDatosClientes:
        "👥 Does your business have a customer database?",

      analizaVentas:
        "📊 Do you regularly analyze sales and customer behavior?",

      reservasOnline:
        "📅 Does your business have online reservations, appointments, or orders?",

      si:
        "Yes",

      no:
        "No",

      obtenerDiagnostico:
        "🚀 Get My Assessment",
    },

    es: {
      titulo:
        "Diagnóstico de Crecimiento con IA",

      descripcion:
        "Descubre en menos de 3 minutos cómo atraer más clientes, automatizar procesos y aumentar las ventas de tu negocio mediante Inteligencia Artificial.",

      minutos:
        "3 minutos",

      ia:
        "IA",

      reporte:
        "Reporte personalizado",

      nombreNegocio:
        "Nombre del negocio",

      ciudad:
        "Ciudad",

      tipoNegocio:
        "Tipo de negocio",

      restaurante:
        "Restaurante",

      barberia:
        "Barbería",

      tienda:
        "Tienda",

      clinica:
        "Clínica",

      otro:
        "Otro",

      paginaWeb:
        "🌐 ¿Tu negocio tiene página web?",

      whatsapp:
        "💬 ¿Atiendes a tus clientes por WhatsApp?",

      googleBusiness:
        "📍 ¿Tu negocio aparece en Google Maps?",

      redesSociales:
        "📲 ¿Tu negocio publica contenido en redes sociales?",

      inteligenciaArtificial:
        "🤖 ¿Tu negocio utiliza Inteligencia Artificial?",

      automatizacion:
        "⚙️ ¿Automatizas respuestas o procesos de atención al cliente?",

      baseDatosClientes:
        "👥 ¿Tu negocio tiene una base de datos de clientes?",

      analizaVentas:
        "📊 ¿Analizas periódicamente las ventas y el comportamiento de tus clientes?",

      reservasOnline:
        "📅 ¿Tu negocio tiene reservas, citas o pedidos en línea?",

      si:
        "Sí",

      no:
        "No",

      obtenerDiagnostico:
        "🚀 Obtener Diagnóstico",
    },
  };

  const t =
    textos[idioma];

  /* =========================================================
     DIAGNÓSTICO
  ========================================================= */

  const obtenerDiagnostico =
    async () => {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("empresas")
          .insert({
            nombre:
              nombreNegocio,
            ciudad,
            tipo,
          })
          .select()
          .single();

        console.log(
          "data:",
          data
        );

        console.log(
          "error:",
          error
        );

        if (error) {
          alert(
            JSON.stringify(
              error,
              null,
              2
            )
          );

          return;
        }

        const diagnostico =
          calcularDiagnostico(
            tipo,
            paginaWeb,
            whatsapp,
            googleBusiness,
            redesSociales,
            inteligenciaArtificial,
            automatizacion,
            baseDatosClientes,
            analizaVentas,
            reservasOnline
          );

        const {
          data:
            nuevoDiagnostico,
          error:
            errorDiagnostico,
        } =
          await supabase
            .from(
              "diagnosticos"
            )
            .insert({
              empresa_id:
                data.id,

              tipo,

              puntaje:
                diagnostico.puntaje,

              nivel:
                diagnostico.nivel,

              atraccion:
                diagnostico.atraccion,

              atencion:
                diagnostico.atencion,

              fidelizacion:
                diagnostico.fidelizacion,

              inteligencia:
                diagnostico.inteligencia,

              oportunidades:
                diagnostico.oportunidades,
            })
            .select()
            .single();

        if (
          errorDiagnostico
        ) {
          alert(
            JSON.stringify(
              errorDiagnostico,
              null,
              2
            )
          );

          return;
        }

        router.push(
          `/resultado?id=${nuevoDiagnostico.id}`
        );
      } catch (e) {
        console.error(
          "Excepción:",
          e
        );

        alert(
          idioma === "es"
            ? "Hubo una excepción. Mira la consola."
            : "An exception occurred. Check the console."
        );
      }
    };

  /* =========================================================
     OPCIONES SI / NO
  ========================================================= */

  const opciones =
    (
      <>

        <option value="Sí">
          {t.si}
        </option>

        <option value="No">
          {t.no}
        </option>

      </>
    );

  /* =========================================================
     PÁGINA
  ========================================================= */

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">

      <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl">

        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="mb-10 text-center">

          <Image
            src="/logo-foodshortai.png"
            alt="ShortBizAI"
            width={260}
            height={70}
            className="mx-auto mb-6"
          />

          {/* =================================================
              TÍTULO
          ================================================= */}

          <h1 className="text-5xl font-bold text-gray-900">
            {t.titulo}
          </h1>

          {/* =================================================
              DESCRIPCIÓN
          ================================================= */}

          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
            {t.descripcion}
          </p>

          {/* =================================================
              BENEFICIOS
          ================================================= */}

          <div className="mt-8 flex justify-center gap-8 font-semibold text-blue-600">

            <span>
              ⚡ {t.minutos}
            </span>

            <span>
              🤖 {t.ia}
            </span>

            <span>
              📊 {t.reporte}
            </span>

          </div>

        </div>

        {/* ===================================================
            NOMBRE DEL NEGOCIO
        =================================================== */}

        <input
          type="text"
          value={nombreNegocio}
          onChange={(e) =>
            setNombreNegocio(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
          placeholder={
            t.nombreNegocio
          }
        />

        {/* ===================================================
            CIUDAD
        =================================================== */}

        <input
          type="text"
          value={ciudad}
          onChange={(e) =>
            setCiudad(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
          placeholder={
            t.ciudad
          }
        />

        {/* ===================================================
            TIPO DE NEGOCIO
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.tipoNegocio}
        </label>

        <select
          value={tipo}
          onChange={(e) =>
            setTipo(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >

          <option value="Restaurante">
            {t.restaurante}
          </option>

          <option value="Barbería">
            {t.barberia}
          </option>

          <option value="Tienda">
            {t.tienda}
          </option>

          <option value="Clínica">
            {t.clinica}
          </option>

          <option value="Otro">
            {t.otro}
          </option>

        </select>

        {/* ===================================================
            PÁGINA WEB
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.paginaWeb}
        </label>

        <select
          value={paginaWeb}
          onChange={(e) =>
            setPaginaWeb(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            WHATSAPP
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.whatsapp}
        </label>

        <select
          value={whatsapp}
          onChange={(e) =>
            setWhatsapp(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            GOOGLE BUSINESS
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.googleBusiness}
        </label>

        <select
          value={googleBusiness}
          onChange={(e) =>
            setGoogleBusiness(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            REDES SOCIALES
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.redesSociales}
        </label>

        <select
          value={redesSociales}
          onChange={(e) =>
            setRedesSociales(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            INTELIGENCIA ARTIFICIAL
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.inteligenciaArtificial}
        </label>

        <select
          value={
            inteligenciaArtificial
          }
          onChange={(e) =>
            setInteligenciaArtificial(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            AUTOMATIZACIÓN
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.automatizacion}
        </label>

        <select
          value={
            automatizacion
          }
          onChange={(e) =>
            setAutomatizacion(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            BASE DE DATOS DE CLIENTES
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.baseDatosClientes}
        </label>

        <select
          value={
            baseDatosClientes
          }
          onChange={(e) =>
            setBaseDatosClientes(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            ANÁLISIS DE VENTAS
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.analizaVentas}
        </label>

        <select
          value={analizaVentas}
          onChange={(e) =>
            setAnalizaVentas(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            RESERVAS ONLINE
        =================================================== */}

        <label className="mb-2 block font-semibold text-gray-700">
          {t.reservasOnline}
        </label>

        <select
          value={reservasOnline}
          onChange={(e) =>
            setReservasOnline(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-lg border p-3"
        >
          {opciones}
        </select>

        {/* ===================================================
            BOTÓN
        =================================================== */}

        <button
          type="button"
          onClick={
            obtenerDiagnostico
          }
          className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700"
        >
          {t.obtenerDiagnostico}
        </button>

      </div>

    </main>
  );
}