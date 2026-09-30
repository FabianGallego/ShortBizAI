"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Empresa = {
  id: number;
  nombre: string | null;
  tipo: string | null;
  ciudad: string | null;
  pais: string | null;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  imagen_bienvenida: string | null;
  codigo_publico: string | null;
  sistema_reservas: boolean | null;
  url_reservas: string | null;
  plan: string | null;
  activo: boolean | null;
};

type Perfil = {
  nombre: string | null;
  rol: string | null;
  activo: boolean | null;
};

function Icon({
  name,
  size = 20,
}: {
  name:
    | "home"
    | "video"
    | "calendar"
    | "users"
    | "heart"
    | "chart"
    | "settings"
    | "help"
    | "bell"
    | "arrow"
    | "plus"
    | "building"
    | "check"
    | "logout";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "video") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="13" height="14" rx="2" />
        <path d="m16 10 5-3v10l-5-3" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg {...common}>
        <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="m7 15 4-4 3 2 5-6" />
        <path d="M17 7h2v2" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...common}>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a2 2 0 0 0-1.4-3.4h-.2a2 2 0 0 1 0-4h.2A2 2 0 0 0 3 4.2l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a2 2 0 0 0 3.4-1.4V0a2 2 0 0 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a2 2 0 0 0 1.4 3.4h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-1.4 3.4Z" />
      </svg>
    );
  }

  if (name === "help") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 1 1 4.5 1.2c-.7 1.1-2.2 1.4-2.2 3" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === "building") {
    return (
      <svg {...common}>
        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
        <path d="M9 21v-3h6v3" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...common}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    );
  }

  return null;
}

function StatCard({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#4a3322] bg-[#28180f] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#735235] hover:shadow-[0_18px_45px_rgba(45,25,12,0.22)]">
      <div
        className={`absolute left-0 top-0 h-full w-[3px] ${accent}`}
      />

      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#362317] text-[#d3ad7d]">
          {icon}
        </div>

        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d735c]">
          Actual
        </span>
      </div>

      <p className="mt-6 text-sm font-medium text-[#b39a84]">
        {label}
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#f1e2d2]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#806751]">
        {detail}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [cargando, setCargando] = useState(true);

  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [usuarioEmail, setUsuarioEmail] = useState("");

  const [empresa, setEmpresa] = useState<Empresa | null>(null);

  const [reservasHoy, setReservasHoy] = useState(0);
  const [reservasProximas, setReservasProximas] = useState(0);
  const [clientes, setClientes] = useState(0);
  const [campanas, setCampanas] = useState(0);

  const [error, setError] = useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    try {
      setCargando(true);
      setError("");

      /* =========================================================
         USUARIO
      ========================================================= */

      const {
        data: { user },
        error: errorUsuario,
      } = await supabase.auth.getUser();

      if (errorUsuario) {
        throw new Error(errorUsuario.message);
      }

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUsuarioEmail(user.email || "");

      /* =========================================================
         PERFIL
      ========================================================= */

      const { data: perfil, error: errorPerfil } = await supabase
        .from("perfiles")
        .select("nombre, rol, activo")
        .eq("user_id", user.id)
        .maybeSingle();

      if (errorPerfil) {
        throw new Error(
          `No se pudo cargar el perfil: ${errorPerfil.message}`
        );
      }

      if (!perfil) {
        await supabase.auth.signOut();
        window.location.href = "/login";
        return;
      }

      const perfilData = perfil as Perfil;

      if (!perfilData.activo) {
        await supabase.auth.signOut();
        window.location.href = "/login";
        return;
      }

      if (
        perfilData.rol !== "propietario" &&
        perfilData.rol !== "usuario"
      ) {
        if (perfilData.rol === "super_admin") {
          window.location.href = "/admin";
          return;
        }

        await supabase.auth.signOut();
        window.location.href = "/login";
        return;
      }

      setUsuarioNombre(
        perfilData.nombre ||
          user.user_metadata?.nombre ||
          user.email ||
          "Propietario"
      );

      /* =========================================================
         RELACIÓN USUARIO → EMPRESA
      ========================================================= */

      const { data: relacion, error: errorRelacion } = await supabase
        .from("usuarios_empresas")
        .select("empresa_id, rol, activo")
        .eq("user_id", user.id)
        .eq("activo", true)
        .maybeSingle();

      if (errorRelacion) {
        throw new Error(
          `No se pudo identificar la empresa: ${errorRelacion.message}`
        );
      }

      if (!relacion?.empresa_id) {
        throw new Error(
          "Este usuario todavía no tiene una empresa asignada."
        );
      }

      /* =========================================================
         EMPRESA
      ========================================================= */

      const { data: empresaData, error: errorEmpresa } = await supabase
        .from("empresas")
        .select(`
          id,
          nombre,
          tipo,
          ciudad,
          pais,
          telefono,
          email,
          sitio_web,
          direccion,
          imagen_bienvenida,
          codigo_publico,
          sistema_reservas,
          url_reservas,
          plan,
          activo
        `)
        .eq("id", relacion.empresa_id)
        .maybeSingle();

      if (errorEmpresa) {
        throw new Error(
          `No se pudo cargar la empresa: ${errorEmpresa.message}`
        );
      }

      if (!empresaData) {
        throw new Error(
          "La empresa asociada a este usuario no fue encontrada."
        );
      }

      setEmpresa(empresaData as Empresa);

      const empresaId = empresaData.id;

      /* =========================================================
         FECHA
      ========================================================= */

      const hoy = new Date();

      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
      const dd = String(hoy.getDate()).padStart(2, "0");

      const fechaHoy = `${yyyy}-${mm}-${dd}`;

      /* =========================================================
         RESERVAS HOY
      ========================================================= */

      const { count: countReservasHoy } = await supabase
        .from("reservas")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("empresa_id", empresaId)
        .eq("fecha", fechaHoy);

      setReservasHoy(countReservasHoy || 0);

      /* =========================================================
         RESERVAS PRÓXIMAS
      ========================================================= */

      const { count: countReservasProximas } = await supabase
        .from("reservas")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("empresa_id", empresaId)
        .gte("fecha", fechaHoy)
        .neq("estado", "Cancelada");

      setReservasProximas(countReservasProximas || 0);

      /* =========================================================
         CLIENTES
      ========================================================= */

      const { data: clientesData } = await supabase
        .from("reservas")
        .select("email, telefono, cliente_nombre")
        .eq("empresa_id", empresaId)
        .neq("estado", "Cancelada");

      if (clientesData) {
        const clientesUnicos = new Set<string>();

        clientesData.forEach((cliente) => {
          const clave =
            cliente.email?.trim().toLowerCase() ||
            cliente.telefono?.trim() ||
            cliente.cliente_nombre?.trim().toLowerCase();

          if (clave) {
            clientesUnicos.add(clave);
          }
        });

        setClientes(clientesUnicos.size);
      }

      /* =========================================================
         FIDELIZACIÓN
      ========================================================= */

      const { count: countCampanas } = await supabase
        .from("fidelizacion_campanas")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("empresa_id", empresaId)
        .eq("estado", "enviada");

      setCampanas(countCampanas || 0);
    } catch (err: any) {
      console.error("ERROR DASHBOARD:", err);

      setError(
        err?.message ||
          "No pudimos cargar la información de tu empresa."
      );
    } finally {
      setCargando(false);
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#160c07] text-[#f1e2d2]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#60432c] bg-[#2c1a10] text-white shadow-xl">
              S
            </div>

            <p className="mt-5 text-sm font-semibold tracking-wide text-[#b69b82]">
              Preparando tu espacio...
            </p>

            <div className="mx-auto mt-4 h-1 w-28 overflow-hidden rounded-full bg-[#3a2417]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#b58a5b]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !empresa) {
    return (
      <main className="min-h-screen bg-[#160c07] p-6 text-[#f1e2d2]">
        <div className="flex min-h-[90vh] items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-[#4a3322] bg-[#28180f] p-9 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3a2417] text-xl text-[#d3ad7d]">
              !
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#f1e2d2]">
              No pudimos cargar tu panel
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#a98e75]">
              {error ||
                "No encontramos una empresa asociada a tu usuario."}
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-[#9a6d3f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b07d49]"
              >
                Intentar nuevamente
              </button>

              <button
                onClick={cerrarSesion}
                className="rounded-xl border border-[#59402b] px-5 py-3 text-sm font-semibold text-[#c2aa91] transition hover:bg-[#332015]"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const primerNombre =
    usuarioNombre.trim().split(" ")[0] || "bienvenido";

  return (
    <main className="min-h-screen bg-[#eadfd2] text-[#2b1b11]">
      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR DESKTOP
        ===================================================== */}

        <aside className="hidden w-[248px] shrink-0 flex-col bg-[#1d1009] text-white lg:flex">

          {/* LOGO */}

          <div className="flex h-[82px] items-center border-b border-white/[0.06] px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#735235] bg-[#302015] text-sm font-black text-[#d8b07d]">
                S
              </div>

              <div>
                <p className="text-[15px] font-bold tracking-[-0.02em]">
                  ShortBizAI
                </p>

                <p className="text-[10px] uppercase tracking-[0.18em] text-[#806954]">
                  Business OS
                </p>
              </div>
            </div>
          </div>

          {/* EMPRESA */}

          <div className="px-4 pt-5">
            <div className="rounded-2xl border border-[#493121] bg-[#29180e] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.025)]">
              <div className="flex items-center gap-3">
                {empresa.imagen_bienvenida ? (
                  <img
                    src={empresa.imagen_bienvenida}
                    alt={empresa.nombre || "Negocio"}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3a2417] text-[#c49b6c]">
                    <Icon name="building" size={19} />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f0e0cf]">
                    {empresa.nombre || "Mi negocio"}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-[#846a53]">
                    {empresa.ciudad || "Local"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-[#a28a72]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#91a56d]" />
                Cuenta activa
              </div>
            </div>
          </div>

          {/* NAVEGACIÓN */}

          <div className="mt-7 flex-1 px-4">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#654d39]">
              Gestión
            </p>

            <nav className="space-y-1">
              <a
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl border border-[#62452e] bg-[#3b2618] px-3.5 py-3 text-sm font-semibold text-[#f2e2d1] shadow-lg shadow-black/10"
              >
                <span className="text-[#d1a774]">
                  <Icon name="home" size={18} />
                </span>
                Inicio
              </a>

              <div className="flex cursor-default items-center justify-between rounded-xl px-3.5 py-3 text-sm text-[#806650]">
                <span className="flex items-center gap-3">
                  <Icon name="video" size={18} />
                  Videos
                </span>

                <span className="text-[9px] font-bold uppercase tracking-wider text-[#5b4432]">
                  Pronto
                </span>
              </div>

              <div className="flex cursor-default items-center justify-between rounded-xl px-3.5 py-3 text-sm text-[#806650]">
                <span className="flex items-center gap-3">
                  <Icon name="calendar" size={18} />
                  Reservas
                </span>

                <span className="text-[9px] font-bold uppercase tracking-wider text-[#5b4432]">
                  Pronto
                </span>
              </div>

              <div className="flex cursor-default items-center justify-between rounded-xl px-3.5 py-3 text-sm text-[#806650]">
                <span className="flex items-center gap-3">
                  <Icon name="users" size={18} />
                  Clientes
                </span>

                <span className="text-[9px] font-bold uppercase tracking-wider text-[#5b4432]">
                  Pronto
                </span>
              </div>

              <div className="flex cursor-default items-center justify-between rounded-xl px-3.5 py-3 text-sm text-[#806650]">
                <span className="flex items-center gap-3">
                  <Icon name="heart" size={18} />
                  Fidelización
                </span>

                <span className="text-[9px] font-bold uppercase tracking-wider text-[#5b4432]">
                  Pronto
                </span>
              </div>

              <div className="flex cursor-default items-center justify-between rounded-xl px-3.5 py-3 text-sm text-[#806650]">
                <span className="flex items-center gap-3">
                  <Icon name="chart" size={18} />
                  Reportes
                </span>

                <span className="text-[9px] font-bold uppercase tracking-wider text-[#5b4432]">
                  Pronto
                </span>
              </div>
            </nav>

            <div className="my-7 h-px bg-[#39271b]" />

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#654d39]">
              Cuenta
            </p>

            <nav className="space-y-1">
              <a
                href="/dashboard/mi-negocio"
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-[#c2aa91] transition hover:bg-[#332015] hover:text-[#f1e2d2]"
              >
                <Icon name="settings" size={18} />
                Mi negocio
              </a>

              <div className="flex cursor-default items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-[#806650]">
                <Icon name="help" size={18} />
                Ayuda
              </div>
            </nav>
          </div>

          {/* PERFIL */}

          <div className="border-t border-[#39271b] p-4">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5c412b] bg-[#342116] text-xs font-bold text-[#d2a875]">
                {primerNombre.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#decbb7]">
                  {usuarioNombre}
                </p>

                <p className="truncate text-[10px] text-[#6d543f]">
                  {usuarioEmail}
                </p>
              </div>

              <button
                onClick={cerrarSesion}
                title="Cerrar sesión"
                className="text-[#725944] transition hover:text-[#d2a875]"
              >
                <Icon name="logout" size={17} />
              </button>
            </div>
          </div>
        </aside>

        {/* =====================================================
            ÁREA PRINCIPAL
        ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* TOP BAR */}

          <header className="sticky top-0 z-20 border-b border-[#d8c8b8] bg-[#eadfd2]/90 backdrop-blur-xl">
            <div className="flex h-[82px] items-center justify-between px-5 sm:px-8 xl:px-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#967b63]">
                  Panel de negocio
                </p>

                <p className="mt-1 text-sm font-semibold text-[#493225]">
                  {empresa.nombre}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#d5c5b5] bg-[#f4ede5] text-[#634b38] transition hover:border-[#bfa991] hover:text-[#332116]"
                  title="Notificaciones"
                >
                  <Icon name="bell" size={18} />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#b37a43]" />
                </button>

                <div className="hidden h-8 w-px bg-[#d2c0ae] sm:block" />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#6a4b31] bg-[#2d1b10] text-xs font-bold text-[#ead6bf]">
                    {primerNombre.charAt(0).toUpperCase()}
                  </div>

                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-[#493225]">
                      {usuarioNombre}
                    </p>

                    <p className="text-[10px] text-[#987d65]">
                      Propietario
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT */}

          <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 xl:px-10">

            {/* HERO */}

            <div className="relative overflow-hidden rounded-[28px] border border-[#513724] bg-[#24150d] px-7 py-8 text-white shadow-[0_24px_60px_rgba(61,35,18,0.24)] sm:px-10 sm:py-10">

              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(123,82,48,.20) 0%, transparent 38%, rgba(184,132,76,.09) 75%, transparent 100%)",
                }}
              />

              <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#a87543]/20 blur-3xl" />

              <div className="absolute -bottom-32 right-40 h-72 w-72 rounded-full bg-[#6b4125]/20 blur-3xl" />

              <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <div className="max-w-2xl">

                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#755333] bg-[#352116] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c5a581]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#91a56d]" />
                    Sistema activo
                  </div>

                  <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#f3e4d4] sm:text-5xl">
                    Buenos días, {primerNombre}.
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-[#aa9078] sm:text-base">
                    Este es el centro de operaciones de{" "}
                    <span className="font-medium text-[#e3cdb5]">
                      {empresa.nombre}
                    </span>
                    . Desde aquí podrás gestionar la presencia digital,
                    reservas y fidelización de tu negocio.
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="rounded-2xl border border-[#5b4029] bg-[#301e12]/80 px-5 py-4 backdrop-blur-sm">

                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#806650]">
                      Estado del negocio
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#91a56d]" />

                      <span className="text-sm font-semibold text-[#ead9c7]">
                        {empresa.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MÉTRICAS */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Icon name="calendar" size={19} />}
                label="Reservas hoy"
                value={reservasHoy}
                detail="Solicitudes para hoy"
                accent="bg-[#a87645]"
              />

              <StatCard
                icon={<Icon name="calendar" size={19} />}
                label="Próximas reservas"
                value={reservasProximas}
                detail="Reservas activas"
                accent="bg-[#765237]"
              />

              <StatCard
                icon={<Icon name="users" size={19} />}
                label="Clientes"
                value={clientes}
                detail="Clientes identificados"
                accent="bg-[#a38a70]"
              />

              <StatCard
                icon={<Icon name="heart" size={19} />}
                label="Campañas enviadas"
                value={campanas}
                detail="Fidelización"
                accent="bg-[#b08a5a]"
              />
            </div>

            {/* GRID PRINCIPAL */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

              {/* ACTIVIDAD */}

              <section className="rounded-2xl border border-[#d6c5b4] bg-[#f6efe7] p-6 shadow-[0_8px_30px_rgba(77,47,26,0.07)] sm:p-7">

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8067]">
                      Actividad
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#3e291b]">
                      Resumen del negocio
                    </h2>
                  </div>

                  <span className="rounded-full border border-[#ddcfc0] bg-[#ebe0d4] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#856a52]">
                    Hoy
                  </span>
                </div>

                <div className="mt-7 rounded-2xl border border-dashed border-[#d5c3b1] bg-[#eee3d7] p-8 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d9c8b6] bg-[#f7f0e8] text-[#917255] shadow-sm">
                    <Icon name="chart" size={21} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#4a3222]">
                    Tu actividad aparecerá aquí
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#987e66]">
                    A medida que lleguen reservas, clientes y campañas,
                    este espacio mostrará la actividad más importante de
                    tu negocio.
                  </p>
                </div>
              </section>

              {/* ACCIONES */}

              <section className="rounded-2xl border border-[#d6c5b4] bg-[#f6efe7] p-6 shadow-[0_8px_30px_rgba(77,47,26,0.07)] sm:p-7">

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8067]">
                  Acciones
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#3e291b]">
                  Acceso rápido
                </h2>

                <div className="mt-6 space-y-2">

                  <div className="group flex items-center justify-between rounded-xl border border-[#dfd1c2] bg-[#fbf7f2] p-4 transition hover:border-[#c7b29d] hover:bg-white">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebe0d5] text-[#77563a]">
                        <Icon name="calendar" size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#4a3222]">
                          Reservas
                        </p>

                        <p className="text-[11px] text-[#9a8069]">
                          Gestiona tus reservas
                        </p>
                      </div>
                    </div>

                    <Icon name="arrow" size={16} />
                  </div>

                  <div className="group flex items-center justify-between rounded-xl border border-[#dfd1c2] bg-[#fbf7f2] p-4 transition hover:border-[#c7b29d] hover:bg-white">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebe0d5] text-[#77563a]">
                        <Icon name="video" size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#4a3222]">
                          Videos
                        </p>

                        <p className="text-[11px] text-[#9a8069]">
                          Contenido para tu negocio
                        </p>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#a18b77]">
                      Próximo
                    </span>
                  </div>

                  <div className="group flex items-center justify-between rounded-xl border border-[#dfd1c2] bg-[#fbf7f2] p-4 transition hover:border-[#c7b29d] hover:bg-white">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebe0d5] text-[#77563a]">
                        <Icon name="heart" size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#4a3222]">
                          Fidelización
                        </p>

                        <p className="text-[11px] text-[#9a8069]">
                          Clientes y campañas
                        </p>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#a18b77]">
                      Próximo
                    </span>
                  </div>

                  <div className="group flex items-center justify-between rounded-xl border border-[#dfd1c2] bg-[#fbf7f2] p-4 transition hover:border-[#c7b29d] hover:bg-white">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebe0d5] text-[#77563a]">
                        <Icon name="settings" size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#4a3222]">
                          Mi negocio
                        </p>

                        <p className="text-[11px] text-[#9a8069]">
                          Información y configuración
                        </p>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#a18b77]">
                      Próximo
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* NEGOCIO + RESERVAS */}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* NEGOCIO */}

              <section className="rounded-2xl border border-[#d6c5b4] bg-[#f6efe7] p-6 shadow-[0_8px_30px_rgba(77,47,26,0.07)] sm:p-7">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8067]">
                      Perfil
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#3e291b]">
                      Tu negocio
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9ded2] text-[#76553a]">
                    <Icon name="building" size={19} />
                  </div>
                </div>

                <div className="mt-6 space-y-0">

                  <div className="flex items-center justify-between border-b border-[#e3d5c7] py-3">
                    <span className="text-xs text-[#9a8069]">
                      Nombre
                    </span>

                    <span className="max-w-[60%] truncate text-right text-sm font-semibold text-[#4a3222]">
                      {empresa.nombre || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#e3d5c7] py-3">
                    <span className="text-xs text-[#9a8069]">
                      Tipo
                    </span>

                    <span className="text-sm font-semibold text-[#4a3222]">
                      {empresa.tipo || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#e3d5c7] py-3">
                    <span className="text-xs text-[#9a8069]">
                      Ubicación
                    </span>

                    <span className="max-w-[60%] truncate text-right text-sm font-semibold text-[#4a3222]">
                      {empresa.ciudad || "—"}
                      {empresa.pais ? `, ${empresa.pais}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-[#9a8069]">
                      Plan
                    </span>

                    <span className="rounded-full border border-[#d7c4b1] bg-[#e9ded2] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#795c43]">
                      {empresa.plan || "free"}
                    </span>
                  </div>
                </div>
              </section>

              {/* RESERVAS */}

              <section className="rounded-2xl border border-[#d6c5b4] bg-[#f6efe7] p-6 shadow-[0_8px_30px_rgba(77,47,26,0.07)] sm:p-7">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8067]">
                      Reservas
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#3e291b]">
                      Estado del sistema
                    </h2>
                  </div>

                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      empresa.sistema_reservas
                        ? "border border-[#c7d1b9] bg-[#e4eadc] text-[#61704f]"
                        : "bg-[#e9e0d8] text-[#89715d]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        empresa.sistema_reservas
                          ? "bg-[#7d9861]"
                          : "bg-[#aaa]"
                      }`}
                    />

                    {empresa.sistema_reservas
                      ? "Conectado"
                      : "No activado"}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#ded0c1] bg-[#ebe0d5] p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d5c1ae] bg-[#f8f2eb] text-[#7a5a3d] shadow-sm">
                      <Icon name="check" size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#4a3222]">
                        Sistema de reservas ShortBizAI
                      </p>

                      <p className="mt-1 text-xs text-[#987e66]">
                        Las reservas están asociadas a este negocio.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-[#ded0c1] bg-[#fbf7f2] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#a08a74]">
                      Hoy
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-[#493225]">
                      {reservasHoy}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#ded0c1] bg-[#fbf7f2] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#a08a74]">
                      Próximas
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-[#493225]">
                      {reservasProximas}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* FOOTER */}

            <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#d4c3b2] pt-6 text-xs text-[#9b826b] sm:flex-row">
              <p>
                © {new Date().getFullYear()} ShortBizAI
              </p>

              <div className="flex items-center gap-4">
                <span>Business OS</span>
                <span>•</span>
                <span>Panel privado</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}