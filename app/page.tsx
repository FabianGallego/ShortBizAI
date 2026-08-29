"use client";

import Link from "next/link";
import Image from "next/image";

const pilares = [
  {
    numero: "01",
    titulo: "Attraction",
    subtitulo: "Content that generates visibility",
    descripcion:
      "We turn your business's digital presence into a commercial tool. We create strategic Video Shorts that present your brand, generate interest, and bring new prospects to your business.",
    imagen: "/image/atraccion2.jpg",
  },
  {
    numero: "02",
    titulo: "Service",
    subtitulo: "Intelligence that responds and organizes",
    descripcion:
      "We integrate Artificial Intelligence to answer questions, manage requests, and facilitate reservations quickly and efficiently, giving every customer a professional experience.",
    imagen: "/image/atencion.jpg",
  },
  {
    numero: "03",
    titulo: "Loyalty",
    subtitulo: "Relationships that generate repeat business",
    descripcion:
      "We turn every interaction into an opportunity to build a relationship. We use follow-up and automation to maintain contact, activate new opportunities, and increase customer return frequency.",
    imagen: "/image/fidelizacion-nueva.jpg",
  },
  {
    numero: "04",
    titulo: "Business Intelligence",
    subtitulo: "Data to make better decisions",
    descripcion:
      "We turn your business activity into useful information for management. Analyze customers, reservations, and results to identify opportunities and make clearer commercial decisions.",
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 min-h-[82px] flex items-center justify-between gap-4">

            {/* LOGO */}

            <Link
              href="/"
              className="flex items-center shrink-0"
            >
              <Image
                src="/logo-foodshortai.png"
                alt="ShortBizAI"
                width={190}
                height={60}
                priority
                className="w-[145px] sm:w-[180px] h-auto object-contain"
              />
            </Link>


            {/* =================================================
                MENÚ DESKTOP
            ================================================= */}

            <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[14px] lg:text-[15px] font-semibold text-gray-700">

              <a
                href="#inicio"
                className="hover:text-red-600 transition"
              >
                Home
              </a>

              <a
                href="#sistema"
                className="hover:text-red-600 transition"
              >
                The System
              </a>

              <a
                href="#soluciones"
                className="hover:text-red-600 transition"
              >
                Solutions
              </a>

              <a
                href="#diagnostico"
                className="hover:text-red-600 transition"
              >
                Assessment
              </a>

            </nav>


            {/* =================================================
                IDIOMA DESKTOP
            ================================================= */}

            <div className="hidden lg:flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">

              <button
                type="button"
                className="rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white"
              >
                🇺🇸 English
              </button>

              <button
                type="button"
                className="rounded-md px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                🇪🇸 Español
              </button>

            </div>


            {/* =================================================
                BOTÓN DESKTOP
            ================================================= */}

            <Link
              href="/diagnostico"
              className="hidden sm:inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-5 lg:px-6 py-3 rounded-lg font-bold text-xs lg:text-sm transition shadow-lg whitespace-nowrap"
            >
              FREE BUSINESS ASSESSMENT
            </Link>


            {/* =================================================
                MENÚ HAMBURGUESA — TABLET / CELULAR
            ================================================= */}

            <details className="relative md:hidden shrink-0">

              <summary
                className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm"
                aria-label="Open menu"
              >

                <span className="flex flex-col gap-1.5">

                  <span className="block h-0.5 w-6 bg-gray-900" />
                  <span className="block h-0.5 w-6 bg-gray-900" />
                  <span className="block h-0.5 w-6 bg-gray-900" />

                </span>

              </summary>


              {/* PANEL DEL MENÚ */}

              <div className="absolute right-0 top-14 z-[100] w-[280px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                <div className="flex flex-col p-3">

                  {/* HOME */}

                  <a
                    href="#inicio"
                    className="rounded-xl px-4 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    Home
                  </a>


                  {/* SYSTEM */}

                  <a
                    href="#sistema"
                    className="rounded-xl px-4 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    The System
                  </a>


                  {/* SOLUTIONS */}

                  <a
                    href="#soluciones"
                    className="rounded-xl px-4 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    Solutions
                  </a>


                  {/* ASSESSMENT */}

                  <a
                    href="#diagnostico"
                    className="rounded-xl px-4 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    Assessment
                  </a>


                  {/* DIVISOR */}

                  <div className="my-2 border-t border-gray-200" />


                  {/* IDIOMAS */}

                  <div className="px-4 py-2">

                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Language
                    </p>

                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white"
                      >
                        🇺🇸 English
                      </button>

                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
                      >
                        🇪🇸 Español
                      </button>

                    </div>

                  </div>


                  {/* DIVISOR */}

                  <div className="my-2 border-t border-gray-200" />


                  {/* ASSESSMENT */}

                  <Link
                    href="/diagnostico"
                    className="mt-1 rounded-xl bg-red-600 px-4 py-4 text-center text-sm font-black text-white hover:bg-red-700"
                  >
                    FREE BUSINESS ASSESSMENT
                  </Link>

                </div>

              </div>

            </details>

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
            alt="ShortBizAI - Attract new customers"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

        </div>


        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/35" />


        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 pt-28">

          <div className="max-w-3xl">

            <div className="mb-8 text-center">

              <p className="text-red-600 text-lg md:text-xl lg:text-2xl font-black tracking-[0.18em]">
                ATTRACT · SERVE · BUILD LOYALTY
              </p>

            </div>


            <h1 className="text-5xl md:text-7xl lg:text-[76px] leading-[0.98] font-black tracking-tight text-gray-950">

              The System to

              <br />

              <span className="text-red-600">
                Grow
              </span>

              <br />

              Your Business

              <br />

              Sales.

            </h1>


            <p className="mt-7 max-w-2xl text-lg md:text-xl leading-7 text-gray-600">

              ShortBizAI integrates strategy, Artificial Intelligence,
              and automation to attract new people, turn them into
              customers, and build meaningful relationships that bring
              them back.

              <br />
              <br />

              A system designed to increase repeat business, drive sales,
              and contribute to the sustainable growth of your company.

            </p>


            <div className="mt-10 flex flex-col sm:flex-row gap-4">

              <Link
                href="/cliente/agente-aaf"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold shadow-xl transition"
              >
                MAKE A RESERVATION

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
                ORDER DELIVERY

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
                THE AAFI SYSTEM
              </p>


              <h2 className="mt-7 text-4xl md:text-6xl font-black leading-[1.05] text-white">

                Attract new customers.

                <br />

                <span className="text-red-500">
                  Earn their trust.
                </span>

                <br />

                Make them come back.

              </h2>


              <div className="w-16 h-[3px] bg-red-500 mx-auto mt-8 mb-7" />


              <p className="max-w-2xl mx-auto text-base md:text-lg leading-7 md:leading-8 text-gray-300">

                We combine Video Shorts and Artificial Intelligence
                to attract people through social media, provide
                personalized attention, turn interest into real customers,
                and build trusted relationships that encourage them to
                become loyal and repeat customers.

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SOLUTIONS / ATRACCIÓN
      ===================================================== */}

      <section
        id="soluciones"
        className="py-28 bg-white"
      >

        <div className="w-full overflow-hidden">

          {/* CELULAR */}

          <div className="block md:hidden relative w-full h-[600px] overflow-hidden">

            <Image
              src="/image/atraccion2.jpg"
              alt="Video Shorts to attract new customers"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />

          </div>


          {/* COMPUTADOR */}

          <div className="hidden md:block relative w-full aspect-[16/9] overflow-hidden bg-black">

            <Image
              src="/image/atraccion2.jpg"
              alt="Video Shorts to attract new customers"
              fill
              priority
              sizes="100vw"
              className="object-contain object-top"
            />

          </div>

        </div>


        {/* TEXTO */}

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-10">

          <p className="text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-red-600">
            01 · ATTRACTION
          </p>


          <h3 className="text-4xl md:text-5xl font-black mt-3 leading-tight text-gray-900">
            Turn attention into customers.
          </h3>


          <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-600 leading-7">

            Through social media and our Video Shorts,
            people can discover your business and become
            loyal and repeat customers.

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
            02 · SERVICE
          </p>


          <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">

            Intelligent
            <br />
            service.

          </h2>

        </div>


        {/* CONTENIDO */}

        <div className="max-w-7xl mx-auto mt-10 lg:mt-16">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* IMAGEN */}

            <div className="relative w-full h-[600px] overflow-hidden">

              <Image
                src="/image/atencion2.jpg"
                alt="Customer service and reservations with Artificial Intelligence"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />

            </div>


            {/* TEXTO */}

            <div className="px-6 lg:px-0">

              <p className="text-lg leading-7 text-gray-600">

                Through Artificial Intelligence, we make it easier
                to serve new customers and organize their requests
                or reservations quickly, clearly, and efficiently.

              </p>


              <p className="mt-4 text-lg leading-7 text-gray-600">

                Through our intelligent and automated system,
                every person receives fast, personalized,
                and effective service.

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FIDELIZACIÓN
      ===================================================== */}

      <section className="py-28 bg-white">

        {/* TÍTULO */}

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 mb-6">

          <p className="text-red-500 font-bold tracking-[0.25em] text-sm">
            03 · LOYALTY
          </p>

        </div>


        {/* IMAGEN */}

        <div className="relative w-full h-[600px] overflow-hidden">

          <Image
            src="/image/fidelizacion2.jpg"
            alt="Customer loyalty"
            fill
            sizes="100vw"
            className="object-cover"
          />


          {/* TÍTULO SOBRE IMAGEN */}

          <div className="absolute inset-x-0 bottom-0 z-10 px-6 lg:px-10 pb-10">

            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />


            <h2 className="text-5xl md:text-6xl font-black leading-tight text-white">

              Make your customers
              <br />
              come back.

            </h2>

          </div>

        </div>


        {/* CONTENIDO */}

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-12">

          <p className="text-lg leading-8 text-gray-600">

            Every customer who arrives through the system represents
            an opportunity to build a long-term commercial relationship.

          </p>


          <p className="mt-5 text-lg leading-8 text-gray-600">

            We use email, phone communication, and automation
            to send promotions, discounts, news, and loyalty campaigns.

          </p>


          {/* TARJETAS */}

          <div className="mt-8 grid sm:grid-cols-3 gap-4">

            <div className="border border-gray-200 rounded-xl p-5 bg-white">

              <p className="font-black text-red-600">
                Promotions
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Personalized offers.
              </p>

            </div>


            <div className="border border-gray-200 rounded-xl p-5 bg-white">

              <p className="font-black text-red-600">
                Follow-up
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Stay connected.
              </p>

            </div>


            <div className="border border-gray-200 rounded-xl p-5 bg-white">

              <p className="font-black text-red-600">
                Return
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Repeat customers.
              </p>

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

            {/* TEXTO */}

            <div className="order-2 lg:order-1">

              <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
                04 · BUSINESS INTELLIGENCE
              </p>


              <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">

                Know
                <br />
                your
                <br />
                results.

              </h2>


              <p className="mt-7 text-lg leading-8 text-gray-600">

                We turn your business information into clear data
                so you can understand what is working and where
                new growth opportunities exist.

              </p>


              <p className="mt-5 text-lg leading-8 text-gray-600">

                Receive information about customers, sales,
                products, and results to make better decisions
                and grow your business.

              </p>

            </div>


            {/* IMAGEN */}

            <div className="order-1 lg:order-2 relative w-full h-[600px] overflow-hidden">

              <Image
                src="/image/inteligencia.jpg"
                alt="Business intelligence and results analysis"
                fill
                sizes="100vw"
                className="object-cover"
              />

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
            BUSINESS ASSESSMENT
          </p>


          <h2 className="mt-5 text-5xl md:text-7xl font-black text-gray-950">

            How prepared is
            <br />
            your business?

          </h2>


          <p className="mt-7 text-xl leading-8 text-gray-600">

            Take our free business assessment and discover how
            prepared your company is for Artificial Intelligence,
            automation, and digital growth.

          </p>


          <Link
            href="/diagnostico"
            className="inline-flex items-center gap-5 mt-10 bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-lg font-black shadow-xl transition"
          >

            START ASSESSMENT

            <span className="text-xl">
              →
            </span>

          </Link>


          <p className="mt-5 text-sm text-gray-500">

            Free · Less than 3 minutes · Personalized results

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

                We Attract.
                <br className="md:hidden" />

                We Serve.
                <br className="md:hidden" />

                We Build Loyalty.

              </h2>

            </div>


            <Link
              href="/diagnostico"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-black transition shadow-xl"
            >
              DISCOVER YOUR BUSINESS
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
            All rights reserved.

          </p>

        </div>

      </footer>

    </main>
  );
}