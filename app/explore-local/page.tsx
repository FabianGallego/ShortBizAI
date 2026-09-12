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
   * IMAGEN DEL NEGOCIO DESTACADO
   *
   * Durante el piloto usamos una imagen local.
   * Más adelante cada empresa tendrá su propia imagen.
   */
  const businessImage = "/image/atencion2.jpg";

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/90 backdrop-blur-2xl">

        <div className="mx-auto flex min-h-[78px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-6 lg:px-10">

          <Link
            href="/"
            className="shrink-0 transition-opacity duration-300 hover:opacity-80"
          >
            <Image
              src="/logo-foodshortai.png"
              alt="ShortBizAI"
              width={190}
              height={60}
              priority
              className="h-auto w-[145px] object-contain sm:w-[175px]"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-bold text-gray-300 md:flex">

            <Link
              href="/explore-local"
              className="text-white transition-colors duration-300 hover:text-red-500"
            >
              Explore Local
            </Link>

            <Link
              href="/#sistema"
              className="transition-colors duration-300 hover:text-white"
            >
              How It Works
            </Link>

            <Link
              href="/#diagnostico"
              className="transition-colors duration-300 hover:text-white"
            >
              For Businesses
            </Link>

            <Link
              href="/cliente"
              className="transition-colors duration-300 hover:text-white"
            >
              Login
            </Link>

          </nav>

        </div>

      </header>


      {/* =====================================================
          HERO — SHORTFOODAI
      ===================================================== */}

      <section className="relative isolate min-h-[620px] overflow-hidden border-b border-white/10">

        {/* HERO IMAGE */}

        <div
          className="absolute inset-0 -z-30 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=90')",
          }}
        />

        {/* DARK CINEMATIC OVERLAY */}

        <div className="absolute inset-0 -z-20 bg-black/65" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/65 to-black/20" />

        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#080808] to-transparent" />


        {/* HERO CONTENT */}

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-6 pb-20 lg:px-10 lg:pb-24">

          <div className="max-w-4xl">

            <div className="mb-6 flex items-center gap-3">

              <span className="h-px w-12 bg-red-500" />

              <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
                ShortFoodAI
              </p>

            </div>

            <h1 className="text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl md:text-8xl">

              Discover local
              <br />

              <span className="text-white">
                food experiences.
              </span>

            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg md:text-xl md:leading-8">

              Discover restaurants, explore local food experiences,
              and book your next table through ShortBizAI.

            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          PREMIUM RESTAURANT DISCOVERY
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#f5f3ef] py-24 text-[#111111] md:py-32">
        {/* Subtle premium background */}
        <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-black/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">

          {/* PREMIUM HEADER */}
          <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-red-600" />
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-red-600">
                  ShortFoodAI
                </p>
              </div>

              <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
                Discover places
                <br />
                worth going to.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-gray-500 md:text-lg">
                A curated selection of local restaurants. Explore the place,
                choose your experience, and book directly through ShortBizAI.
              </p>
            </div>

            <div className="shrink-0">
              <p className="text-right text-[10px] font-black uppercase tracking-[0.28em] text-gray-400">
                Curated local collection
              </p>
              <p className="mt-2 text-right text-sm font-bold text-gray-700">
                Scroll to explore →
              </p>
            </div>
          </div>

          {/* PREMIUM HORIZONTAL COLLECTION */}
          <div className="-mx-6 overflow-x-auto px-6 pb-8 lg:-mx-10 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              className="restaurant-auto-track flex w-max gap-5 snap-x snap-mandatory"
              style={{
                ["--restaurant-travel" as string]:
                  "calc(min(1280px, 100vw - 80px) - 2230px)",
              }}
            >

              {/* =================================================
                  QUEENSYARD
              ================================================= */}
              <Link
                href="/r/queensyard"
                className="group relative block h-[560px] w-[320px] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:w-[390px] lg:w-[430px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=90')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs font-black text-white backdrop-blur-md">
                    Q
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65">
                    01 / 05
                  </span>
                </div>

                <div className="absolute bottom-7 left-7 right-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                    Hudson Yards · New York
                  </p>
                  <h3 className="mt-3 text-4xl font-black tracking-[-0.03em] text-white">
                    Queensyard
                  </h3>
                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-5">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white">
                      Explore & book
                    </span>
                    <span className="text-2xl text-white transition-transform duration-500 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>

              {/* =================================================
                  POLLOS MARIO
              ================================================= */}
              <Link
                href="/r/pollosmario"
                className="group relative block h-[560px] w-[320px] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:w-[390px] lg:w-[430px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=90')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs font-black text-white backdrop-blur-md">
                    PM
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65">
                    02 / 05
                  </span>
                </div>

                <div className="absolute bottom-7 left-7 right-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                    Queens · New York
                  </p>
                  <h3 className="mt-3 text-4xl font-black tracking-[-0.03em] text-white">
                    Pollos Mario
                  </h3>
                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-5">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white">
                      Explore & book
                    </span>
                    <span className="text-2xl text-white transition-transform duration-500 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>

              {/* =================================================
                  GUASTAVINO
              ================================================= */}
              <Link
                href="/r/guastavino"
                className="group relative block h-[560px] w-[320px] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:w-[390px] lg:w-[430px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1800&q=90')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs font-black text-white backdrop-blur-md">
                    G
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65">
                    03 / 05
                  </span>
                </div>

                <div className="absolute bottom-7 left-7 right-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                    Midtown East · New York
                  </p>
                  <h3 className="mt-3 text-4xl font-black tracking-[-0.03em] text-white">
                    Guastavino
                  </h3>
                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-5">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white">
                      Explore & book
                    </span>
                    <span className="text-2xl text-white transition-transform duration-500 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>

              {/* =================================================
                  BARRILES
              ================================================= */}
              <Link
                href="/r/barriles"
                className="group relative block h-[560px] w-[320px] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:w-[390px] lg:w-[430px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1800&q=90')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs font-black text-white backdrop-blur-md">
                    B
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65">
                    04 / 05
                  </span>
                </div>

                <div className="absolute bottom-7 left-7 right-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                    Queens · New York
                  </p>
                  <h3 className="mt-3 text-4xl font-black tracking-[-0.03em] text-white">
                    Barriles
                  </h3>
                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-5">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white">
                      Explore & book
                    </span>
                    <span className="text-2xl text-white transition-transform duration-500 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>

              {/* =================================================
                  MR. SEBAS
              ================================================= */}
              <Link
                href="/r/mrsebas"
                className="group relative block h-[560px] w-[320px] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:w-[390px] lg:w-[430px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=90')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs font-black text-white backdrop-blur-md">
                    MS
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65">
                    05 / 05
                  </span>
                </div>

                <div className="absolute bottom-7 left-7 right-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                    New York · Local
                  </p>
                  <h3 className="mt-3 text-4xl font-black tracking-[-0.03em] text-white">
                    Mr. Sebas
                  </h3>
                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-5">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white">
                      Explore & book
                    </span>
                    <span className="text-2xl text-white transition-transform duration-500 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>

            </div>
          </div>

          <style>{`
            @keyframes shortbizai-restaurant-pan {
              0%, 18% {
                transform: translateX(0);
              }
              50%, 68% {
                transform: translateX(var(--restaurant-travel));
              }
              100% {
                transform: translateX(0);
              }
            }

            .restaurant-auto-track {
              animation: shortbizai-restaurant-pan 22s ease-in-out infinite;
              will-change: transform;
            }

            .restaurant-auto-track:hover {
              animation-play-state: paused;
            }

            @media (max-width: 1023px) {
              .restaurant-auto-track {
                --restaurant-travel: calc(100vw - 48px - 2030px) !important;
                animation-duration: 24s;
              }
            }

            @media (max-width: 639px) {
              .restaurant-auto-track {
                --restaurant-travel: calc(100vw - 48px - 1680px) !important;
                animation-duration: 25s;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .restaurant-auto-track {
                animation: none;
              }
            }
          `}</style>

          {/* PREMIUM FOOTNOTE */}
          <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-6 text-xs font-bold text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>Five local experiences. One simple booking journey.</p>
            <p className="uppercase tracking-[0.2em]">Powered by ShortBizAI</p>
          </div>
        </div>
      </section>


      {/* =====================================================
          DISCOVERY EXPERIENCE
      ===================================================== */}

      <section className="relative overflow-hidden border-t border-white/10 bg-[#080808] py-24 md:py-32">

        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
                The ShortBizAI Experience
              </p>

              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Discover.
                <br />
                Decide.
                <br />
                Book.
              </h2>

            </div>


            <div>

              <p className="max-w-2xl text-lg leading-8 text-gray-400 md:text-xl">

                ShortBizAI connects discovery with the moment that matters:
                becoming a real customer.

              </p>

            </div>

          </div>


          {/* EXPERIENCE CARDS */}

          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-3">


            {/* DISCOVER */}

            <div className="group relative min-h-[260px] overflow-hidden bg-[#0d0d0d] p-8 transition-colors duration-500 hover:bg-[#111111] md:p-10">

              <div
                className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-20"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="relative">

                <span className="text-sm font-black text-red-500">
                  01
                </span>

                <h3 className="mt-8 text-2xl font-black">
                  Discover
                </h3>

                <p className="mt-4 leading-7 text-gray-400">
                  Find local businesses and experiences through visual,
                  engaging content.
                </p>

              </div>

            </div>


            {/* DECIDE */}

            <div className="group relative min-h-[260px] overflow-hidden bg-[#0d0d0d] p-8 transition-colors duration-500 hover:bg-[#111111] md:p-10">

              <div
                className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-20"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="relative">

                <span className="text-sm font-black text-red-500">
                  02
                </span>

                <h3 className="mt-8 text-2xl font-black">
                  Decide
                </h3>

                <p className="mt-4 leading-7 text-gray-400">
                  Explore the business, understand the experience, and choose
                  where you want to go.
                </p>

              </div>

            </div>


            {/* BOOK */}

            <div className="group relative min-h-[260px] overflow-hidden bg-[#0d0d0d] p-8 transition-colors duration-500 hover:bg-[#111111] md:p-10">

              <div
                className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-20"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="relative">

                <span className="text-sm font-black text-red-500">
                  03
                </span>

                <h3 className="mt-8 text-2xl font-black">
                  Book
                </h3>

                <p className="mt-4 leading-7 text-gray-400">
                  Reserve directly through ShortBizAI and turn discovery into
                  a real visit.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BUILT FOR GROWTH
      ===================================================== */}

      <section className="border-t border-white/10 bg-[#080808] py-20 md:py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
            Built for growth
          </p>

          <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">

            One platform.
            <br />

            Many local businesses.

          </h2>


          <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-3">


            {/* FOOD */}

            <div className="group relative min-h-[230px] overflow-hidden bg-[#080808] p-7 md:p-8">

              <div
                className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-20"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="relative">

                <p className="text-xl font-black">
                  Food
                </p>

                <p className="mt-3 max-w-sm leading-7 text-gray-400">
                  Restaurants and food businesses can have their own ShortBizAI
                  experience.
                </p>

              </div>

            </div>


            {/* TRAVEL */}

            <div className="group relative min-h-[230px] overflow-hidden bg-[#080808] p-7 md:p-8">

              <div
                className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-20"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="relative">

                <p className="text-xl font-black">
                  Travel
                </p>

                <p className="mt-3 max-w-sm leading-7 text-gray-400">
                  Travel businesses and experiences can be added as the
                  platform grows.
                </p>

              </div>

            </div>


            {/* SERVICES */}

            <div className="group relative min-h-[230px] overflow-hidden bg-[#080808] p-7 md:p-8">

              <div
                className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-20"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="relative">

                <p className="text-xl font-black">
                  Services
                </p>

                <p className="mt-3 max-w-sm leading-7 text-gray-400">
                  Barber, spa, beauty, health, and other local businesses can
                  have independent profiles.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/10 bg-black py-10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between lg:px-10">

          <p>
            © {new Date().getFullYear()} ShortBizAI. All rights reserved.
          </p>

          <p>
            Discover local. Book directly.
          </p>

        </div>

      </footer>

    </main>
  );
}