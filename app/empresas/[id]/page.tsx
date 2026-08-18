"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DetalleEmpresa() {
  const params = useParams();
  const [empresa, setEmpresa] = useState<any>(null);
const [diagnosticos, setDiagnosticos] = useState<any[]>([]);
  useEffect(() => {
  const cargarEmpresa = async () => {
    const { data } = await supabase
      .from("empresas")
      .select("*")
      .eq("id", params.id)
      .single();
console.log(data);
    setEmpresa(data);

const { data: listaDiagnosticos, error } = await supabase
  .from("diagnosticos")
  .select("*")
  .eq("empresa_id", Number(params.id));
setDiagnosticos(listaDiagnosticos || []);
setDiagnosticos(listaDiagnosticos || []);


  };

  if (params.id) {
    cargarEmpresa();
  }
}, [params.id]);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">
        {empresa?.nombre}
      </h1>

      <p className="text-gray-600 mt-4">
  Ciudad: {empresa?.ciudad}
  <br />
  Tipo: {empresa?.tipo}
</p>
<h2 className="text-2xl font-bold mt-8 mb-4">
  Historial de diagnósticos
</h2>

{diagnosticos.length === 0 ? (
  <p className="text-gray-500">
    Esta empresa aún no tiene diagnósticos.
  </p>
) : (
  <div className="space-y-2">
    {diagnosticos.map((d) => (
      <div
        key={d.id}
        className="border rounded-lg p-4 shadow-sm"
      >
        <p className="mb-2">
  <strong>Fecha:</strong> {new Date(d.fecha).toLocaleDateString()}
</p>

<p className="mb-2">
  <strong>Puntaje:</strong> {d.puntaje}
</p>

<p>
  <strong>Nivel:</strong> {d.nivel}
</p>
      </div>
    ))}
  </div>
)}
    </div>
  );
}