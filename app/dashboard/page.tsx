"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [total, setTotal] = useState(0);

const [empresas, setEmpresas] = useState(0);
const [promedio, setPromedio] = useState(0);
const [excelente, setExcelente] = useState(0);
const [bueno, setBueno] = useState(0);
const [ayuda, setAyuda] = useState(0);
const [ultimos, setUltimos] = useState<any[]>([]);

  useEffect(() => {
    const cargar = async () => {
      const { count } = await supabase
        .from("diagnosticos")
        .select("*", { count: "exact", head: true });

      setTotal(count || 0);
const { count: totalEmpresas } = await supabase
  .from("empresas")
  .select("*", { count: "exact", head: true });

const { data: lista } = await supabase
  .from("diagnosticos")
  .select("puntaje");

if (lista && lista.length > 0) {
  const suma = lista.reduce((acc, item) => acc + item.puntaje, 0);
  setPromedio(Math.round(suma / lista.length));
if (lista) {
  setExcelente(lista.filter((x) => x.puntaje >= 80).length);
  setBueno(lista.filter((x) => x.puntaje >= 60 && x.puntaje < 80).length);
  setAyuda(lista.filter((x) => x.puntaje < 60).length);
}

}
setEmpresas(totalEmpresas || 0);
const { data: recientes } = await supabase
  .from("diagnosticos")
  .select(`
    *,
    empresas (
      nombre,
      ciudad
    )
  `)
  .order("fecha", { ascending: false })
  .limit(5);

setUltimos(recientes || []);

    };

    cargar();
    
  }, []);

  const datosGrafico = [
  { nombre: "Excelente", valor: excelente },
  { nombre: "Bueno", valor: bueno },
  { nombre: "Necesitan ayuda", valor: ayuda },
  
];

  return (
  <div className="p-8">

    <div className="mb-8">
      <h1 className="text-4xl font-bold">
        📊 Dashboard ShortBizAI
      </h1>

      <p className="text-gray-600 mt-2">
        Bienvenido al panel administrativo.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-6">

  <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg">
    <h2 className="text-xl">Total Diagnósticos</h2>
    <p className="text-5xl font-bold mt-3">{total}</p>
  </div>

  <div className="bg-green-600 text-white rounded-xl p-6 shadow-lg">
    <h2 className="text-xl">Empresas</h2>
    <p className="text-5xl font-bold mt-3">{empresas}</p>
  </div>

  <div className="bg-yellow-500 text-white rounded-xl p-6 shadow-lg">
    <h2 className="text-xl">Promedio</h2>
    <p className="text-5xl font-bold mt-3">{promedio}</p>
  </div>

</div>

<div className="grid grid-cols-3 gap-6 mt-6">

  <div className="bg-purple-600 text-white rounded-xl p-6 shadow-lg">
    <h2 className="text-xl">Excelente</h2>
    <p className="text-5xl font-bold mt-3">{excelente}</p>
  </div>

  <div className="bg-orange-500 text-white rounded-xl p-6 shadow-lg">
    <h2 className="text-xl">Bueno</h2>
    <p className="text-5xl font-bold mt-3">{bueno}</p>
  </div>

  <div className="bg-red-600 text-white rounded-xl p-6 shadow-lg">
    <h2 className="text-xl">Necesitan ayuda</h2>
    <p className="text-5xl font-bold mt-3">{ayuda}</p>
  </div>

</div>
<div className="bg-white rounded-xl shadow-lg p-6 mt-8">
  <h2 className="text-2xl font-bold mb-4">
    Diagnósticos por Nivel
  </h2>

  <div style={{ width: "100%", height: 350 }}>
    <ResponsiveContainer>
      <BarChart data={datosGrafico}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nombre" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="valor" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>


<div className="mt-10">
  <h2 className="text-2xl font-bold mb-4">
    Últimos Diagnósticos
  </h2>

  <div className="overflow-x-auto">
    <table className="min-w-full bg-white rounded-xl shadow">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Empresa</th>
          <th className="p-3 text-left">Ciudad</th>
          <th className="p-3 text-left">Puntaje</th>
          <th className="p-3 text-left">Nivel</th>
        </tr>
      </thead>

      <tbody>
        {ultimos.map((d) => (
          <tr key={d.id} className="border-b">
            <td className="p-3">{d.empresas?.nombre}</td>
            <td className="p-3">{d.empresas?.ciudad}</td>
            <td className="p-3">{d.puntaje}</td>
            <td className="p-3">{d.nivel}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div><div className="mt-10">
  <h2 className="text-2xl font-bold mb-6">
    Acciones rápidas
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

    <a
      href="/diagnostico"
      className="bg-blue-600 text-white rounded-xl p-6 text-center shadow-lg hover:bg-blue-700"
    >
      <div className="text-4xl">➕</div>
      <p className="mt-3 font-bold">Nuevo Diagnóstico</p>
    </a>

    <a
      href="/reportes"
      className="bg-green-600 text-white rounded-xl p-6 text-center shadow-lg hover:bg-green-700"
    >
      <div className="text-4xl">📄</div>
      <p className="mt-3 font-bold">Reportes</p>
    </a>

    <a
      href="/empresas"
      className="bg-purple-600 text-white rounded-xl p-6 text-center shadow-lg hover:bg-purple-700"
    >
      <div className="text-4xl">🏢</div>
      <p className="mt-3 font-bold">Empresas</p>
    </a>

    <a
      href="/estadisticas"
      className="bg-orange-500 text-white rounded-xl p-6 text-center shadow-lg hover:bg-orange-600"
    >
      <div className="text-4xl">📊</div>
      <p className="mt-3 font-bold">Estadísticas</p>
    </a>

  </div>
</div>
    </div>

  
);}