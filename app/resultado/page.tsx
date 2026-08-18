import { Suspense } from "react";
import ResultadoContenido from "./ResultadoContenido";
export const dynamic = "force-dynamic";

export default function Resultado() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <ResultadoContenido />
    </Suspense>
  );
}