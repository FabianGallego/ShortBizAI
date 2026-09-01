import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Props = {
  params: Promise<{
    codigo: string;
  }>;
};

export default async function EmpresaPorCodigoPage({
  params,
}: Props) {
  const { codigo } = await params;

  // =====================================================
  // BUSCAR EMPRESA POR CÓDIGO PÚBLICO
  // =====================================================

  const { data: empresa, error } = await supabaseAdmin
    .from("empresas")
    .select(
      "id, nombre, tipo, ciudad, codigo_publico"
    )
    .eq("codigo_publico", codigo)
    .maybeSingle();

  // =====================================================
  // EMPRESA NO ENCONTRADA
  // =====================================================

  if (error) {
    console.error(
      "ERROR BUSCANDO EMPRESA:",
      error
    );

    notFound();
  }

  if (!empresa) {
    notFound();
  }

  // =====================================================
  // URL DEL AGENTE
  // =====================================================

  const urlReserva =
    `/cliente/agente-aaf?empresaId=${encodeURIComponent(
      String(empresa.id)
    )}&codigo=${encodeURIComponent(
      empresa.codigo_publico
    )}`;

  // =====================================================
  // PÁGINA
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">

      <div className="mx-auto max-w-xl">

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* =================================================
              CABECERA
          ================================================= */}

          <div className="bg-gray-950 px-6 py-8 text-white">

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-400">
              ShortBizAI
            </p>

            <h1 className="text-3xl font-black sm:text-4xl">
              {empresa.nombre}
            </h1>

            <p className="mt-2 text-lg text-gray-300">
              {empresa.tipo || "Business"}
            </p>

            {empresa.ciudad && (
              <p className="mt-1 text-gray-400">
                📍 {empresa.ciudad}
              </p>
            )}

          </div>

          {/* =================================================
              IDENTIFICACIÓN
          ================================================= */}

          <div className="px-6 py-8">

            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

              <div className="flex items-start gap-3">

                <div className="text-2xl">
                  ✅
                </div>

                <div>

                  <h2 className="text-lg font-bold text-green-900">
                    Empresa identificada
                  </h2>

                  <p className="mt-1 leading-6 text-green-800">
                    ShortBizAI identificó correctamente
                    esta empresa.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                CÓDIGO
            ================================================= */}

            <div className="mt-6 rounded-2xl bg-gray-100 p-5">

              <p className="text-sm font-semibold text-gray-500">
                Código de empresa
              </p>

              <p className="mt-2 font-mono text-xl font-bold text-gray-900">
                {empresa.codigo_publico}
              </p>

            </div>

            {/* =================================================
                RESERVA
            ================================================= */}

            <div className="mt-8">

              <h2 className="text-2xl font-black text-gray-950">
                ¿Quieres hacer una reserva?
              </h2>

              <p className="mt-2 leading-6 text-gray-600">
                Nuestro asistente puede ayudarte a
                solicitar tu reserva.
              </p>

              <Link
                href={urlReserva}
                className="mt-6 flex min-h-[58px] w-full items-center justify-center rounded-2xl bg-blue-600 px-6 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700"
              >
                🍽️ Reservar ahora
              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}