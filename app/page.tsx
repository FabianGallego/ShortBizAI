import Link from "next/link";
import Image from "next/image";

const pilares = [
  {
    numero: "01",
    titulo: "Atracción",
    subtitulo: "Contenido que genera visibilidad",
    descripcion:
      "Convertimos la presencia digital de tu negocio en una herramienta comercial. Creamos Video Shorts estratégicos que presentan tu marca, despiertan interés y llevan nuevos prospectos hacia tu negocio.",
    imagen: "/image/atraccion2.jpg",
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

  <div className="absolute inset-0">

    <Image
      src="/image/atraccion-fondo.jpg"
      alt="ShortBizAI - Atracción de clientes"
      fill
      priority
      sizes="100vw"
      className="object-cover"
    />

  </div>

  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/35" />

  <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 pt-24">

    <div className="max-w-3xl">

      <div className="mb-8 text-center">

        <p className="text-red-600 text-lg md:text-xl lg:text-2xl font-black tracking-[0.18em]">
          ATRAEMOS · ATENDEMOS · FIDELIZAMOS
        </p>

      </div>

      <h1 className="text-5xl md:text-7xl lg:text-[76px] leading-[0.98] font-black tracking-tight text-gray-950">

        El Sistema para

        <br />

        <span className="text-red-600">
          Hacer crecer
        </span>

        <br />

        Las ventas de tu negocio.

      </h1>

      <p className="mt-7 max-w-2xl text-lg md:text-xl leading-7 text-gray-600">

        ShortBizAI integra estrategia, Inteligencia Artificial y automatización
        para atraer nuevas personas, convertirlas en clientes y construir
        relaciones cercanas que hagan que regresen.

        <br />
        <br />

        Un sistema diseñado para aumentar la recurrencia, impulsar las ventas
        y contribuir al crecimiento sostenido de tu empresa.

      </p>

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
          SISTEMA AAFI
      ===================================================== */}

      <section
        id="sistema"
        className="py-24 bg-gray-100"
      >

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="rounded-3xl bg-gray-950 shadow-2xl">

            <div className="max-w-4xl mx-auto px-8 py-14 md:px-16 md:py-20 text-center">

              <p className="text-red-500 font-black tracking-[0.22em] text-sm md:text-base">
                EL SISTEMA AAFI
              </p>

              <h2 className="mt-7 text-4xl md:text-6xl font-black leading-[1.05] text-white">

                Atrae nuevos clientes.

                <br />

                <span className="text-red-500">
                  Conquista su confianza.
                </span>

                <br />

                Hace que regresen.

              </h2>

              <div className="w-16 h-[3px] bg-red-500 mx-auto mt-8 mb-7" />

              <p className="max-w-2xl mx-auto text-base md:text-lg leading-7 md:leading-8 text-gray-300">

                Combinamos Video Shorts e Inteligencia Artificial para atraer personas
                desde las redes sociales, brindarles una atención cercana y personalizada,
                convertir su interés en clientes reales y construir una relación de confianza
                que los motive a convertirse en clientes fieles y recurrentes. Así contribuimos
                al crecimiento de la empresa.

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ATRACCIÓN
      ===================================================== */}

      <section className="py-28 bg-white">

        <div className="w-full overflow-hidden">

          {/* CELULAR — IMAGEN COMPLETA */}

   {/* CELULAR — franja central vertical de la imagen horizontal */}
<div className="block md:hidden relative w-full h-[600px] overflow-hidden">
  <Image
    src="/image/atraccion2.jpg"
    alt="Video Shorts para atraer nuevos clientes"
    fill
    priority
    sizes="100vw"
    className="object-cover object-center"
  />
</div>

          {/* COMPUTADOR — IMAGEN MÁS ABIERTA */}

          <div className="hidden md:block relative w-full aspect-[16/9] overflow-hidden bg-black">

            <Image
              src="/image/atraccion2.jpg"
              alt="Video Shorts para atraer nuevos clientes"
              fill
              priority
              sizes="100vw"
              className="object-contain object-top"
            />

          </div>

        </div>


        {/* TEXTO DEBAJO DE LA IMAGEN */}

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-10">

          <p className="text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-red-600">
            01 · ATRACCIÓN
          </p>

          <h3 className="text-4xl md:text-5xl font-black mt-3 leading-tight text-gray-900">
            Convierte la atención en clientes.
          </h3>

          <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-600 leading-7">

            Desde las redes sociales y a través de nuestros Video Shorts,
            las personas pueden conocer tu negocio y convertirse en clientes
            fieles y recurrentes.

          </p>

        </div>

      </section>


      {/* =====================================================
          ATENCIÓN IA
      ===================================================== */}
<section className="py-28 bg-gray-100">

  {/* ENCABEZADO */}
  <div className="max-w-7xl mx-auto px-6 lg:px-10">

    <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
      02 · ATENCIÓN
    </p>

    <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">
      Atención
      <br />
      inteligente.
    </h2>

  </div>


  {/* CONTENIDO */}
  <div className="max-w-7xl mx-auto mt-10 lg:mt-16">

    <div className="grid lg:grid-cols-2 gap-16 items-center">

      {/* IMAGEN */}
      <div className="relative w-full h-[600px] overflow-hidden">

        <Image
          src="/image/atencion2.jpg"
          alt="Atención y reservas con inteligencia artificial"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

      </div>


      {/* TEXTO */}
      <div className="px-6 lg:px-0">

        <p className="text-lg leading-7 text-gray-600">
          Mediante Inteligencia Artificial facilitamos la atención
          de nuevos clientes y organizamos sus solicitudes o reservas
          de forma rápida, clara y eficiente.
        </p>

        <p className="mt-4 text-lg leading-7 text-gray-600">
          A través de nuestro sistema inteligente y automatizado,
          cada persona recibe una atención cercana, rápida y efectiva.
        </p>

      </div>

    </div>

  </div>

</section>

      {/* =====================================================
          FIDELIZACIÓN
      ===================================================== */}

     <section className="py-28 bg-white">

  <div className="max-w-7xl mx-auto px-0 lg:px-10">

  <p className="text-red-500 font-bold tracking-[0.25em] text-sm mb-5">
          03 · FIDELIZACIÓN
        </p>
    {/* IMAGEN + TÍTULO */}
    <div className="relative w-full h-[600px] overflow-hidden">

      <Image
        src="/image/fidelizacion2.jpg"
        alt="Fidelización de clientes"
        fill
        sizes="100vw"
        className="object-cover"
      />

      {/* Sombra para que el texto blanco se lea bien */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* TÍTULO SOBRE LA IMAGEN */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 lg:px-10 pb-10">

      

        <h2 className="text-5xl md:text-6xl font-black leading-tight text-white">
          Haz que tus clientes
          <br />
          regresen.
        </h2>

      </div>

    </div>


    {/* CONTENIDO DEBAJO DE LA IMAGEN */}
    <div className="px-6 lg:px-0 mt-12">

      <p className="text-lg leading-8 text-gray-600">
        Cada cliente que llega a través del sistema representa
        una oportunidad para construir una relación comercial
        de largo plazo.
      </p>

      <p className="mt-5 text-lg leading-8 text-gray-600">
        Utilizamos correo electrónico, teléfono y automatización
        para enviar promociones, descuentos, novedades y campañas
        de fidelización.
      </p>


      {/* TARJETAS */}
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

  </div>

</section>
      {/* =====================================================
          INTELIGENCIA EMPRESARIAL
      ===================================================== */}

    <section className="py-28 bg-gray-100">

  <div className="max-w-7xl mx-auto px-6 lg:px-10">

    <div className="grid lg:grid-cols-2 gap-16 items-center">

      {/* IMAGEN */}
      
      {/* TEXTO */}
      <div className="order-2 lg:order-1">

        <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
          04 · INTELIGENCIA EMPRESARIAL
        </p>


        <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">
          Conoce
          <br />
          tus
          <br />
          resultados.
        </h2>

        <div className="order-1 lg:order-2 relative w-screen lg:w-full h-[600px] overflow-hidden -ml-[calc((100vw-100%)/2)] lg:ml-0">

        <Image
          src="/image/inteligencia.jpg"
          alt="Inteligencia empresarial y análisis de resultados"
          fill
          sizes="100vw"
          className="object-cover"
        />

      </div>


        <p className="mt-7 text-lg leading-8 text-gray-600">
          Convertimos la información de tu negocio en datos claros para que
          puedas entender qué está funcionando y dónde existen nuevas
          oportunidades de crecimiento.
        </p>

        <p className="mt-5 text-lg leading-8 text-gray-600">
          Recibe información sobre clientes, ventas, productos y resultados
          para tomar mejores decisiones y hacer crecer tu negocio.
        </p>

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

        <div className="absolute inset-0">

          <Image
            src="/image/inteligencia2.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />

        </div>

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