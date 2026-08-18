"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Empresas() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<any[]>([]);
const [todasLasEmpresas, setTodasLasEmpresas] = useState<any[]>([]);
  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("empresas")
        .select("*")
        .order("id", { ascending: false });
console.log(data);
     setEmpresas(data || []);
setTodasLasEmpresas(data || []);

    };

    cargar();
  }, []);

  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-2">
        🏢 Empresas
      </h1>

      <p className="text-gray-600 mb-8">
        Empresas registradas en el sistema.
      </p>

      <input
  type="text"
  placeholder="🔍 Buscar empresa..."
  className="w-full md:w-96 border rounded-lg p-3 mb-6"
  onChange={(e) => {
    const texto = e.target.value.toLowerCase();

    if (texto === "") {
      setEmpresas(todasLasEmpresas);
      return;
    }

    setEmpresas(
      todasLasEmpresas.filter((empresa) =>
        empresa.nombre.toLowerCase().includes(texto)
      )
    );
  }}
/>

      <table className="min-w-full bg-white rounded-xl shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Ciudad</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {empresas.map((empresa) => (
            <tr key={empresa.id} className="border-b">
              <td className="p-3">{empresa.nombre}</td>
              <td className="p-3">{empresa.ciudad}</td>
              <td className="p-3">{empresa.tipo}</td>
              <td className="p-3 text-center">
  <button
  onClick={() => router.push(`/empresas/${empresa.id}`)}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  Ver
</button>
</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}