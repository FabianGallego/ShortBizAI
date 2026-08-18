"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClienteSidebar() {
  const pathname = usePathname();

  const menu = [
    { nombre: "🏠 Inicio", ruta: "/cliente" },
    { nombre: "🎥 Atracción", ruta: "/cliente/atraccion" },
    { nombre: "🤖 Atención", ruta: "/cliente/atencion" },
    { nombre: "❤️ Fidelización", ruta: "/cliente/fidelizacion" },
    { nombre: "📈 Resultados", ruta: "/cliente/resultados" },
    { nombre: "📄 Reportes", ruta: "/cliente/reportes" },
    { nombre: "⚙️ Configuración", ruta: "/cliente/configuracion" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-2">
        ShortBizAI
      </h1>

      <p className="text-sm text-slate-400 mb-8">
        Portal del Cliente
      </p>

      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.ruta}
            href={item.ruta}
            className={`block rounded-lg px-4 py-3 transition ${
              pathname === item.ruta
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`}
          >
            {item.nombre}
          </Link>
        ))}
      </nav>
    </aside>
  );
}