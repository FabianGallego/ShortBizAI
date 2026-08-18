export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">

      <h1 className="text-2xl font-bold mb-8">
        AAF
      </h1>

      <nav className="space-y-4">

        <a href="/dashboard" className="block hover:text-blue-300">
          📊 Dashboard
        </a>

        <a href="/cliente" className="block hover:text-blue-300">
          📈 Centro de Crecimiento
        </a>

        <a href="/empresas" className="block hover:text-blue-300">
          🏢 Empresas
        </a>

        <a href="/diagnostico" className="block hover:text-blue-300">
          📝 Diagnóstico
        </a>

        <a href="/reportes" className="block hover:text-blue-300">
          📄 Reportes
        </a>

      </nav>

    </aside>
  );
}