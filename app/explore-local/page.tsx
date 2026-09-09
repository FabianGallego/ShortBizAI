import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Empresa = {
  id: number | string;
  nombre: string;
  ciudad: string | null;
  tipo: string | null;
  codigo_publico: string;
};

async function getFeaturedBusiness(): Promise<Empresa | null> {
  const { data, error } = await supabaseAdmin
    .from("empresas")
    .select("id, nombre, ciudad, tipo, codigo_publico")
    .ilike("nombre", "Queensyard")
    .maybeSingle();

  if (error) {
    console.error("ERROR BUSCANDO NEGOCIO DESTACADO:", error);
    return null;
  }

  return data as Empresa | null;
}

export default async function ExploreLocalPage() {
  const business = await getFeaturedBusiness();

  /*
   * TEMPORAL DURANTE EL PILOTO
   * Más adelante cada empresa tendrá su propia imagen.
   */
  const businessImage = "/image/atencion2.jpg";

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/95 backdrop-blur-xl">

        <div className="mx-auto flex min-h-[78px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-6 lg:px-10">

          <Link href="/" className="shrink-0">
            <Image
              src="/logo-foodshortai.png"
              alt="ShortBizAI"
              width={190}
              height={60}
              priority
              className="w-[145px] sm:w-[175px] h-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-bold text-gray-300 md:flex">

            <Link
              href="/explore-local"
              className="text-white transition hover:text-red-500"
            >
              Explore Local
            </Link>

            <Link
              href="/#sistema"
              className="transition hover:text-white"
            >
              How It Works
            </Link>

            <Link
              href="/#diagnostico"
              className="transition hover:text-white"
            >
              For Businesses
            </Link>

            <Link
              href="/cliente"
              className="transition hover:text-white"
            >
              Login
            </Link>

          </nav>

        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-white/10 py-24 md:py-32">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.24),transparent_42%)]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
            Explore Local
          </p>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
            Discover local businesses.
            <br />
            <span className="text-red-500">
              Start with Queensyard.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-300 md:text-xl">
            Discover local businesses, experiences, and services through
            ShortBizAI.
          </p>

        </div>

      </section>


      {/* =====================================================
          FEATURED PARTNER
      ===================================================== */}

      <section className="bg-white py-20 text-gray-950 md:py-28">

        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          <div className="mb-10">

            <p className="text-sm font-black uppercase tracking-[0.25em] text-red-600">
              Featured Partner
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Queensyard
            </h2>

          </div>


          {business ? (

            <article className="overflow-hidden border border-gray-200 bg-gray-50 shadow-2xl">

              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">

                {/* IMAGE */}

                <div className="relative min-h-[420px] bg-gray-900 lg:min-h-[560px]">

                  <Image
                    src={businessImage}
                    alt={`${business.nombre} — ShortBizAI`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute bottom-7 left-7 right-7">

                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                      {business.tipo || "Local Business"}
                    </p>

                    <h3 className="mt-2 text-4xl font-black text-white md:text-5xl">
                      {business.nombre}
                    </h3>

                  </div>

                </div>


                {/* BUSINESS INFO */}

                <div className="flex flex-col justify-between p-8 md:p-12">

                  <div>

                    <span className="inline-flex bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white">
                      Featured Partner
                    </span>

                    <p className="mt-8 text-lg leading-8 text-gray-600">
                      Discover {business.nombre} and book your next visit
                      directly through ShortBizAI.
                    </p>

                    {business.ciudad && (
                      <p className="mt-5 text-sm font-black uppercase tracking-widest text-gray-400">
                        {business.ciudad}
                      </p>
                    )}

                  </div>


                  {/* BOOK NOW */}

                  <div className="mt-12">

                    <Link
                      href={`/r/${encodeURIComponent(
                        business.codigo_publico
                      )}`}
                      className="inline-flex w-full items-center justify-center gap-4 rounded-lg bg-red-600 px-7 py-5 text-base font-black text-white shadow-xl transition hover:bg-red-700"
                    >
                      BOOK NOW

                      <span className="text-xl">
                        →
                      </span>

                    </Link>

                    <p className="mt-4 text-center text-xs font-bold text-gray-400">
                      Your booking goes directly to {business.nombre}.
                    </p>

                  </div>

                </div>

              </div>

            </article>

          ) : (

            <div className="border border-gray-200 bg-gray-50 p-10 text-gray-700">

              <p className="font-black">
                Queensyard is not configured yet.
              </p>

              <p className="mt-2 text-sm">
                The featured business needs a matching record in the empresas
                table.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          BUILT FOR GROWTH
      ===================================================== */}

      <section className="border-t border-white/10 bg-gray-950 py-20 md:py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
            Built for growth
          </p>

          <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            One platform.
            <br />
            Many local businesses.
          </h2>

          <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-3">

            <div className="bg-gray-950 p-7">

              <p className="text-xl font-black">
                Food
              </p>

              <p className="mt-3 leading-7 text-gray-400">
                Restaurants and food businesses can have their own ShortBizAI
                experience.
              </p>

            </div>

            <div className="bg-gray-950 p-7">

              <p className="text-xl font-black">
                Travel
              </p>

              <p className="mt-3 leading-7 text-gray-400">
                Travel businesses and experiences can be added as the platform
                grows.
              </p>

            </div>

            <div className="bg-gray-950 p-7">

              <p className="text-xl font-black">
                Services
              </p>

              <p className="mt-3 leading-7 text-gray-400">
                Barber, spa, beauty, health, and other local businesses can
                have independent profiles.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}