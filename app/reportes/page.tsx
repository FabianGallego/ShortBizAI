"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Reportes() {
  
    const [diagnosticos, setDiagnosticos] = useState<any[]>([]);

  useEffect(() => {
    const cargarDiagnosticos = async () => {

      const { data, error } = await supabase
  .from("diagnosticos")
  .select(`
    *,
    empresas (
      nombre,
      ciudad
    )
  `)
  .order("fecha", { ascending: false });


      console.log("DATA:", data);
console.log("ERROR:", error);



if (!error && data) {
  setDiagnosticos(data);
}
    };

    cargarDiagnosticos();
  }, []);

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Reportes ShortBizAI
      </h1>



<p className="mb-4 text-lg">
  Total de diagnósticos: <strong>{diagnosticos.length}</strong>
</p>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Empresa</th>
            <th className="border p-2">Ciudad</th>
            <th className="border p-2">Fecha</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2">Puntaje</th>
            <th className="border p-2">Nivel</th>
            <th className="border p-2">Acción</th>
          </tr>
        </thead>

        <tbody>
          {diagnosticos.map((d: any) => (
            <tr key={d.id}>

<td className="border p-2">{d.empresas?.nombre}</td>
<td className="border p-2">{d.empresas?.ciudad}</td>

              <td className="border p-2">
  {new Date(d.fecha).toLocaleString("es-CO")}
</td>
              <td className="border p-2">{d.tipo}</td>
              <td className="border p-2">{d.puntaje}</td>
              <td className="border p-2">{d.nivel}</td>
              <td className="border p-2 text-center">
  <button
    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"

    onClick={() => window.open(`/resultado?id=${d.id}`, "_blank")}
  >
    👁 Ver
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}