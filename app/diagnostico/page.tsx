"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { calcularDiagnostico } from "@/lib/calcularDiagnostico";
import Image from "next/image";
export default function Diagnostico() {
    const router = useRouter();

const [tipo, setTipo] = useState("Restaurante");

const [nombreNegocio, setNombreNegocio] = useState("");
const [ciudad, setCiudad] = useState("");

const [paginaWeb, setPaginaWeb] = useState("Sí");
const [whatsapp, setWhatsapp] = useState("Sí");
const [googleBusiness, setGoogleBusiness] = useState("Sí");

const [redesSociales, setRedesSociales] = useState("Sí");
const [inteligenciaArtificial, setInteligenciaArtificial] = useState("No");
const [automatizacion, setAutomatizacion] = useState("No");
const [baseDatosClientes, setBaseDatosClientes] = useState("No");
const [analizaVentas, setAnalizaVentas] = useState("No");
const [reservasOnline, setReservasOnline] = useState("No");
  
const obtenerDiagnostico = async () => {
 

 try {
  const { data, error } = await supabase
    .from("empresas")
    .insert({
      nombre: nombreNegocio,
      ciudad,
      tipo,
    })
    .select()
    .single();

    

  console.log("data:", data);
  console.log("error:", error);

  
if (error) {

  alert(JSON.stringify(error, null, 2));

  return;
}

const diagnostico = calcularDiagnostico(
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

const { data: nuevoDiagnostico, error: errorDiagnostico } = await supabase
  .from("diagnosticos")
  .insert({
    empresa_id: data.id,
    tipo,
    puntaje: diagnostico.puntaje,
    nivel: diagnostico.nivel,
    atraccion: diagnostico.atraccion,
    atencion: diagnostico.atencion,
    fidelizacion: diagnostico.fidelizacion,
    inteligencia: diagnostico.inteligencia,
    oportunidades: diagnostico.oportunidades,
  })
  .select()
  .single();

if (errorDiagnostico) {
  alert(JSON.stringify(errorDiagnostico, null, 2));
  return;
}

router.push(`/resultado?id=${nuevoDiagnostico.id}`);

} catch (e) {
  console.error("Excepción:", e);
  alert("Hubo una excepción. Mira la consola.");
}
};

  return (
    
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-xl">

        <div className="text-center mb-10">

  <Image
    src="/logo-foodshortai.png"
    alt="ShortBizAI"
    width={260}
    height={70}
    className="mx-auto mb-6"
  />

  <h1 className="text-5xl font-bold text-gray-900">
    Diagnóstico de Crecimiento con IA
  </h1>

  <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
    Descubre en menos de 3 minutos cómo atraer más clientes,
    automatizar procesos y aumentar las ventas de tu negocio
    mediante Inteligencia Artificial.
  </p>

  <div className="flex justify-center gap-8 mt-8 text-blue-600 font-semibold">
    <span>⚡ 3 minutos</span>
    <span>🤖 IA</span>
    <span>📊 Reporte personalizado</span>
  </div>

</div>

        <input
  type="text"
  value={nombreNegocio}
  onChange={(e) => setNombreNegocio(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
  placeholder="Nombre del negocio"
/>

<input
  type="text"
  value={ciudad}
  onChange={(e) => setCiudad(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
  placeholder="Ciudad"
/>

<label className="block font-semibold text-gray-700 mb-2">
  Tipo de negocio
</label>

<select
  value={tipo}
  onChange={(e) => setTipo(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Restaurante</option>
  <option>Barbería</option>
  <option>Tienda</option>
  <option>Clínica</option>
  <option>Otro</option>
</select>

<label className="block font-semibold text-gray-700 mb-2">
  🌐 ¿Tu negocio tiene página web?
</label>

<select
  value={paginaWeb}
  onChange={(e) => setPaginaWeb(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Sí</option>
  <option>No</option>
</select>

<label className="block font-semibold text-gray-700 mb-2">
  💬 ¿Atiendes a tus clientes por WhatsApp?
</label>

<select
  value={whatsapp}
  onChange={(e) => setWhatsapp(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Sí</option>
  <option>No</option>
</select>

<label className="block font-semibold text-gray-700 mb-2">
  📍 ¿Tu negocio aparece en Google Maps?
</label>

<select
  value={googleBusiness}
  onChange={(e) => setGoogleBusiness(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Sí</option>
  <option>No</option>
</select>
<label className="block font-semibold text-gray-700 mb-2">
  📲 ¿Tu negocio publica contenido en redes sociales?
</label>

<select
  value={redesSociales}
  onChange={(e) => setRedesSociales(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Sí</option>
  <option>No</option>
</select>

<label className="block font-semibold text-gray-700 mb-2">
  🤖 ¿Tu negocio utiliza Inteligencia Artificial?
</label>

<select
  value={inteligenciaArtificial}
  onChange={(e) => setInteligenciaArtificial(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Sí</option>
  <option>No</option>
</select>

<label className="block font-semibold text-gray-700 mb-2">
  ⚙️ ¿Automatizas respuestas o procesos de atención al cliente?
</label>

<select
  value={automatizacion}
  onChange={(e) => setAutomatizacion(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Sí</option>
  <option>No</option>
</select>

<label className="block font-semibold text-gray-700 mb-2">
  📊 ¿Analizas periódicamente las ventas y el comportamiento de tus clientes?
</label>

<select
  value={analizaVentas}
  onChange={(e) => setAnalizaVentas(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Sí</option>
  <option>No</option>
</select>

<label className="block font-semibold text-gray-700 mb-2">
  📅 ¿Tu negocio tiene reservas, citas o pedidos en línea?
</label>

<select
  value={reservasOnline}
  onChange={(e) => setReservasOnline(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
>
  <option>Sí</option>
  <option>No</option>
</select>

<button
  onClick={obtenerDiagnostico}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
>
  🚀 Obtener Diagnóstico
</button>

      </div>
    </main>
  );
}