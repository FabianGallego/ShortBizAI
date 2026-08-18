export default function AtraerPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">
        🎥ShortBizAI  Atraer
      </h1>

      <p className="text-gray-600 mb-8">
        Convierte tu negocio en una máquina de atraer clientes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-semibold mb-2">💡 Ideas con IA</h2>
          <p className="text-gray-600">
            Genera ideas de contenido para redes sociales.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-semibold mb-2">📝 Guiones</h2>
          <p className="text-gray-600">
            Crea guiones para Reels, TikTok y YouTube.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-semibold mb-2">📸 Imágenes</h2>
          <p className="text-gray-600">
            Genera imágenes para campañas publicitarias.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-semibold mb-2">📅 Calendario</h2>
          <p className="text-gray-600">
            Organiza tus publicaciones.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-semibold mb-2">📚 Biblioteca</h2>
          <p className="text-gray-600">
            Guarda todo el contenido generado.
          </p>
        </div>

      </div>
    </main>
  );
}