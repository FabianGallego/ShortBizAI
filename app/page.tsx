import Link from "next/link";
import Image from "next/image";



const pilares = [
  {
    numero: "01",
    titulo: "Atracción",
    subtitulo: "Contenido que genera visibilidad",
    descripcion:
      "Convertimos la presencia digital de tu negocio en una herramienta comercial. Creamos Video Shorts estratégicos que presentan tu marca, despiertan interés y llevan nuevos prospectos hacia tu negocio.",
    imagen: "/image/atraccion.jpg",
  },
  {
    numero: "02",
    titulo: "Atención",
    subtitulo: "Inteligencia que responde y organiza",
    descripcion:
      "Integramos Inteligencia Artificial para atender consultas, gestionar solicitudes y facilitar reservas de forma ágil y estructurada, ofreciendo a cada cliente una experiencia rápida y profesional.",
    imagen: "/image/atencion.jpg",
  },
  {
    numero: "03",
    titulo: "Fidelización",
    subtitulo: "Relaciones que generan recurrencia",
    descripcion:
      "Transformamos cada interacción en una oportunidad de relación. Utilizamos seguimiento y automatización para mantener el contacto, activar nuevas oportunidades y aumentar la frecuencia de regreso de tus clientes.",
    imagen: "/image/fidelizacion-nueva.jpg",
  },
  {
    numero: "04",
    titulo: "Inteligencia",
    subtitulo: "Datos para decidir mejor",
    descripcion:
      "Convertimos la actividad de tu negocio en información útil para la gestión. Analiza clientes, reservas y resultados para identificar oportunidades y tomar decisiones comerciales con mayor claridad.",
    imagen: "/image/inteligencia-nueva.jpg",
  },
];





export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="absolute top-0 left-0 right-0 z-50">

        <div className="bg-white/95 backdrop-blur-md shadow-sm">

          <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[82px] flex items-center justify-between">

            {/* LOGO */}

            <Link href="/" className="flex items-center">

              <Image
                src="/logo-foodshortai.png"
                alt="ShortBizAI"
                width={190}
                height={60}
                priority
                className="w-[180px] h-auto object-contain"
              />

            </Link>


            {/* MENU */}

            <nav className="hidden md:flex items-center gap-10 text-[15px] font-semibold text-gray-700">

              <a
                href="#inicio"
                className="hover:text-red-600 transition"
              >
                Inicio
              </a>

              <a
                href="#sistema"
                className="hover:text-red-600 transition"
              >
                El sistema
              </a>

              <a
                href="#soluciones"
                className="hover:text-red-600 transition"
              >
                Soluciones
              </a>

              <a
                href="#diagnostico"
                className="hover:text-red-600 transition"
              >
                Diagnóstico
              </a>

            </nav>


            {/* CTA */}

            <Link
              href="/diagnostico"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition shadow-lg"
            >
              EVALUACIÓN GRATUITA
            </Link>

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO PRINCIPAL
      ===================================================== */}

      <section
        id="inicio"
        className="relative min-h-[820px] flex items-center overflow-hidden"
      >

        {/* IMAGEN DE FONDO */}

        <div className="absolute inset-0">

          <Image
            src="/image/atraccion.jpg"
            alt="ShortBizAI - Atracción de clientes"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

        </div>


        {/* CAPA PARA FACILITAR LA LECTURA */}

        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/35" />


        {/* CONTENIDO */}

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 pt-24">

          <div className="max-w-3xl">

            <div className="flex items-center gap-4 mb-7">

              <span className="w-12 h-[3px] bg-red-600" />

              <p className="text-sm md:text-base font-extrabold tracking-[0.22em] text-gray-700">
                ATRAEMOS · ATENDEMOS · FIDELIZAMOS
              </p>

            </div>


            <h1 className="text-5xl md:text-7xl lg:text-[78px] leading-[0.98] font-black tracking-tight text-gray-950">

              El sistema para

              <br />

              <span className="text-red-600">
                hacer crecer
              </span>

              <br />

              las ventas de tu negocio.

            </h1>


            <p className="mt-8 max-w-2xl text-lg md:text-xl leading-8 text-gray-600">

              ShortBizAI combina Video Shorts, Inteligencia Artificial y
              automatización para atraer nuevos clientes, atenderlos mejor
              y conseguir que regresen.

            </p>


            {/* BOTONES */}

            <div className="mt-10 flex flex-col sm:flex-row gap-4">

              <Link
                href="/cliente/agente-aaf"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold shadow-xl transition"
              >

                HACER UNA RESERVA

                <span className="ml-4 text-xl">
                  →
                </span>

              </Link>


              <a
                href="https://TU-LINK-DE-GLIT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-4 rounded-lg font-bold shadow-lg transition"
              >

                PEDIR A DOMICILIO

                <span className="ml-4 text-xl">
                  →
                </span>

              </a>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FRASE CENTRAL
      ===================================================== */}
<section
  id="inicio"
  className="relative min-h-[820px] flex items-center overflow-hidden bg-white"
>
  {/* IMAGEN DE FONDO */}

  <div className="absolute inset-0">
    <Image
      src="/image/atraccion.jpg"
      alt="ShortBizAI - Sistema de crecimiento empresarial"
      fill
      priority
      sizes="100vw"
      className="object-cover"
    />
  </div>

  {/* CAPA DE LECTURA */}

  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/30" />

  {/* CONTENIDO */}

  <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 pt-24">

    <div className="max-w-4xl">

      {/* ETIQUETA */}

      <div className="flex items-center gap-4 mb-8">
        <span className="w-12 h-[3px] bg-red-600" />

        <p className="text-sm md:text-base font-extrabold tracking-[0.22em] text-gray-700">
          EL SISTEMA AAFI
        </p>
      </div>


      {/* TITULAR */}

      <h1 className="text-5xl md:text-7xl lg:text-[76px] leading-[0.98] font-black tracking-tight text-gray-950">

        Atrae nuevos clientes.
        <br />

        <span className="text-red-600">
          Conquista su confianza.
        </span>

        <br />

        Haz que regresen.

      </h1>


      {/* DESCRIPCIÓN */}

      <p className="mt-8 max-w-2xl text-lg md:text-xl leading-8 text-gray-600">

        ShortBizAI integra estrategia, Inteligencia Artificial y
        automatización para convertir personas interesadas en clientes
        reales y recurrentes, impulsando las ventas y el crecimiento
        sostenido de tu empresa.

      </p>


      {/* BOTONES */}

      <div className="mt-10 flex flex-col sm:flex-row gap-4">

        <Link
          href="/diagnostico"
          className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold shadow-xl transition"
        >
          CONOCE EL SISTEMA

          <span className="ml-4 text-xl">
            →
          </span>
        </Link>


        <Link
          href="/cliente/agente-aaf"
          className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-4 rounded-lg font-bold shadow-lg transition"
        >
          HACER UNA RESERVA

          <span className="ml-4 text-xl">
            →
          </span>
        </Link>

      </div>


      {/* MICRO MENSAJE */}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-gray-500">

        <span>
          Atracción
        </span>

        <span className="text-red-600">
          •
        </span>

        <span>
          Atención
        </span>

        <span className="text-red-600">
          •
        </span>

        <span>
          Fidelización
        </span>

        <span className="text-red-600">
          •
        </span>

        <span>
          Inteligencia
        </span>

      </div>

    </div>

  </div>

</section>


      {/* =====================================================
          ATRACCIÓN
      ===================================================== */}

      <section className="py-28 bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="relative h-[520px] overflow-hidden rounded-3xl shadow-2xl">

            <Image
              src="/image/atraccion.jpg"
              alt="ShortBizAI - Video Shorts para atraer nuevos clientes"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 100vw"
              className="object-cover"
            />


            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />


            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">

              <p className="text-sm font-semibold tracking-[0.25em] uppercase">
                01 · ATRACCIÓN
              </p>




              <h3 className="text-4xl md:text-6xl font-black mt-2 leading-[1.02]">
  Haz que tu negocio
  <br />
  sea imposible de ignorar.
</h3>

<p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl leading-7">
  Creamos Video Shorts estratégicos que presentan tu negocio de forma
  atractiva, captan la atención de nuevos clientes y convierten tu
  presencia en redes sociales en una oportunidad real de crecimiento.
</p>



            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ATENCIÓN IA
      ===================================================== */}

      <section className="py-28 bg-gray-100">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* IMAGEN */}

            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl">

              <Image
                src="/image/atencion2.jpg"
                alt="Atención mediante Inteligencia Artificial"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

            </div>


            {/* TEXTO */}

            <div className="order-1 lg:order-2">

              <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
                02 · ATENCIÓN
              </p>


              <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">

                Atención
                <br />
                inteligente.

              </h2>


              <p className="mt-7 text-lg leading-8 text-gray-600">

                Mediante Inteligencia Artificial facilitamos la atención
                de tus clientes y organizamos sus solicitudes de forma
                rápida, clara y eficiente.

              </p>


              <p className="mt-5 text-lg leading-8 text-gray-600">

                El cliente puede indicar su nombre, teléfono, fecha,
                hora y cantidad de personas. El negocio recibe la solicitud
                y puede confirmarla, cancelarla o modificarla.

              </p>


              <div className="mt-8">

                <Link
                  href="/cliente/agente-aaf"
                  className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-7 py-4 rounded-lg font-bold shadow-lg transition"
                >

                  HACER UNA RESERVA

                  <span className="ml-4">
                    →
                  </span>

                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FIDELIZACIÓN
      ===================================================== */}

      <section className="py-28 bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* TEXTO */}

            <div>

              <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
                03 · FIDELIZACIÓN
              </p>


              <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">

                Haz que tus clientes
                <br />
                regresen.

              </h2>


              <p className="mt-7 text-lg leading-8 text-gray-600">

                Cada cliente que llega a través del sistema representa
                una oportunidad para construir una relación comercial
                de largo plazo.

              </p>


              <p className="mt-5 text-lg leading-8 text-gray-600">

                Utilizamos correo electrónico, teléfono y automatización
                para enviar promociones, descuentos, novedades y campañas
                de fidelización.

              </p>


              <div className="mt-8 grid sm:grid-cols-3 gap-4">

                <div className="border border-gray-200 rounded-xl p-5 bg-white">

                  <p className="font-black text-red-600">
                    Promociones
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Ofertas personalizadas.
                  </p>

                </div>


                <div className="border border-gray-200 rounded-xl p-5 bg-white">

                  <p className="font-black text-red-600">
                    Seguimiento
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Mantén el contacto.
                  </p>

                </div>


                <div className="border border-gray-200 rounded-xl p-5 bg-white">

                  <p className="font-black text-red-600">
                    Regreso
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Clientes recurrentes.
                  </p>

                </div>

              </div>

            </div>


            {/* IMAGEN */}

            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl">

              <Image
                src="/image/fidelizacion2.jpg"
                alt="Fidelización de clientes"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />


              <div className="absolute bottom-8 left-8 text-white">

                <p className="text-red-400 font-bold tracking-widest text-sm">
                  FIDELIZACIÓN
                </p>


                <p className="text-3xl md:text-4xl font-black mt-2">
                  Clientes que vuelven.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTELIGENCIA EMPRESARIAL
      ===================================================== */}

      <section className="py-28 bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* IMAGEN */}

            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">

              <Image
                src="/image/inteligencia2.jpg"
                alt="Inteligencia empresarial y reportes de ShortBizAI"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

            </div>


            {/* TEXTO */}

            <div>

              <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
                04 · INTELIGENCIA EMPRESARIAL
              </p>


              <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">

                Conoce
                <br />
                tus resultados.

              </h2>


              <p className="mt-7 text-lg leading-8 text-gray-600">

                Convertimos la información de tu negocio en datos claros
                para que puedas entender qué está funcionando y dónde
                existen nuevas oportunidades de crecimiento.

              </p>


              <p className="mt-5 text-lg leading-8 text-gray-600">

                Recibe información sobre clientes, reservas, ventas,
                comportamiento y resultados del sistema ShortBizAI.

              </p>


              {/* INDICADORES */}

              <div className="grid grid-cols-2 gap-4 mt-10">

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                  <p className="text-red-600 text-xl font-black">
                    CLIENTES
                  </p>

                  <p className="mt-2 text-gray-500 text-sm">
                    Nuevas oportunidades generadas.
                  </p>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                  <p className="text-red-600 text-xl font-black">
                    RESERVAS
                  </p>

                  <p className="mt-2 text-gray-500 text-sm">
                    Solicitudes recibidas y atendidas.
                  </p>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                  <p className="text-red-600 text-xl font-black">
                    VENTAS
                  </p>

                  <p className="mt-2 text-gray-500 text-sm">
                    Evolución del resultado comercial.
                  </p>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                  <p className="text-red-600 text-xl font-black">
                    REPORTES
                  </p>

                  <p className="mt-2 text-gray-500 text-sm">
                    Información para tomar decisiones.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          DIAGNÓSTICO
      ===================================================== */}

      <section
        id="diagnostico"
        className="relative py-32 overflow-hidden"
      >

        {/* IMAGEN DE FONDO */}

        <div className="absolute inset-0">

          <Image
            src="/image/inteligencia2.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />

        </div>


        {/* CAPA DE LECTURA */}

        <div className="absolute inset-0 bg-white/90" />


        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

          <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
            DIAGNÓSTICO EMPRESARIAL
          </p>


          <h2 className="mt-5 text-5xl md:text-7xl font-black text-gray-950">

            ¿Qué tan preparado está
            <br />
            tu negocio?

          </h2>


          <p className="mt-7 text-xl leading-8 text-gray-600">

            Realiza nuestro diagnóstico gratuito y descubre cómo se encuentra
            tu empresa frente a la Inteligencia Artificial, automatización y
            crecimiento digital.

          </p>


          <Link
            href="/diagnostico"
            className="inline-flex items-center gap-5 mt-10 bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-lg font-black shadow-xl transition"
          >

            COMENZAR EVALUACIÓN

            <span className="text-xl">
              →
            </span>

          </Link>


          <p className="mt-5 text-sm text-gray-500">
            Gratis · Menos de 3 minutos · Resultado personalizado
          </p>

        </div>

      </section>


      {/* =====================================================
          CTA FINAL
      ===================================================== */}

      <section className="bg-red-600 py-20">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

            <div className="text-white">

              <p className="text-white/70 font-bold tracking-widest text-sm">
                SHORTBIZAI
              </p>


              <h2 className="text-4xl md:text-5xl font-black mt-3">

                Atraemos.
                <br className="md:hidden" />
                Atendemos.
                <br className="md:hidden" />
                Fidelizamos.

              </h2>

            </div>


            <Link
              href="/diagnostico"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-black transition shadow-xl"
            >
              CONOCER MI NEGOCIO
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-white border-t border-gray-200 py-10">

        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-5">

          <Image
            src="/logo-foodshortai.png"
            alt="ShortBizAI"
            width={160}
            height={50}
            className="w-[160px] h-auto"
          />


          <p className="text-sm text-gray-400">

            © {new Date().getFullYear()} ShortBizAI.
            Todos los derechos reservados.

          </p>

        </div>

      </footer>

    </main>
  );
}