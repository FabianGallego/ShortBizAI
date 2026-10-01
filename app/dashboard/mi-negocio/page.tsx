"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  created_at: string | null;
  codigo_publico: string | null;
  imagen_bienvenida: string | null;
  direccion: string | null;
  sistema_reservas: boolean | null;
  url_reservas: string | null;
  plan: string | null;
  activo: boolean | null;
};

type Perfil = {
  user_id: string;
  nombre: string | null;
  rol: string | null;
  activo: boolean | null;
};

type Formulario = {
  nombre: string;
  tipo: string;
  ciudad: string;
  pais: string;
  telefono: string;
  email: string;
  sitio_web: string;
  direccion: string;
  imagen_bienvenida: string;
  sistema_reservas: boolean;
  url_reservas: string;
};

const formularioInicial: Formulario = {
  nombre: "",
  tipo: "",
  ciudad: "",
  pais: "Estados Unidos",
  telefono: "",
  email: "",
  sitio_web: "",
  direccion: "",
  imagen_bienvenida: "",
  sistema_reservas: true,
  url_reservas: "",
};

function Icon({
  name,
  size = 20,
}: {
  name: string;
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
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-7h6v7" />
      </svg>
    );
  }

  if (name === "video") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="13" height="14" rx="2" />
        <path d="m16 10 5-3v10l-5-3z" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg {...common}>
        <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...common}>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 4-4 3 2 5-6" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...common}>
        <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
        <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3.1 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3.1-1.3l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1A1.8 1.8 0 0 0 3.3 12a1.8 1.8 0 0 0-1.3-3.1h-.2a1.8 1.8 0 0 1 0-3.6H2A1.8 1.8 0 0 0 3.3 2.2l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1A1.8 1.8 0 0 0 8.9 3.3h.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3.1 1.3l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 1.3 3.1h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-1.3 1Z" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...common}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M14 4h5v16h-5" />
      </svg>
    );
  }

  if (name === "building") {
    return (
      <svg {...common}>
        <path d="M4 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
        <path d="M2 21h20" />
        <path d="M8 7h4M8 11h4M8 15h4" />
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

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "save") {
    return (
      <svg {...common}>
        <path d="M5 3h12l3 3v15H4V3h12" />
        <path d="M8 3v6h8V3" />
        <path d="M8 21v-7h8v7" />
      </svg>
    );
  }

  return null;
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#cdb9a5",
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 8,
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 12,
          border: "1px solid #4a3020",
          background: disabled ? "#24160e" : "#21130c",
          color: "#f5eee7",
          padding: "0 14px",
          outline: "none",
          fontSize: 14,
          boxSizing: "border-box",
          opacity: disabled ? 0.65 : 1,
        }}
      />
    </div>
  );
}

export default function MiNegocioPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [telegramChatId, setTelegramChatId] = useState("");
  const [conectandoTelegram, setConectandoTelegram] = useState(false);
  const [telegramActivo, setTelegramActivo] = useState(false);
  const [telegramConectado, setTelegramConectado] = useState(false);
  const [guardandoTelegram, setGuardandoTelegram] = useState(false);
  const [errorTelegram, setErrorTelegram] = useState("");
  const [mensajeTelegram, setMensajeTelegram] = useState("");
  const [comandoTelegram, setComandoTelegram] = useState("");

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: perfilData, error: perfilError } = await supabase
        .from("perfiles")
        .select("user_id, nombre, rol, activo")
        .eq("user_id", user.id)
        .maybeSingle();

      if (perfilError) {
        throw perfilError;
      }

      if (!perfilData) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      if (perfilData.activo === false) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      if (perfilData.rol === "super_admin") {
        router.replace("/admin");
        return;
      }

      if (
        perfilData.rol !== "propietario" &&
        perfilData.rol !== "usuario"
      ) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setPerfil(perfilData);

      const { data: relacion, error: relacionError } = await supabase
        .from("usuarios_empresas")
        .select("empresa_id, rol, activo")
        .eq("user_id", user.id)
        .eq("activo", true)
        .maybeSingle();

      if (relacionError) {
        throw relacionError;
      }

      if (!relacion) {
        throw new Error(
          "No encontramos una empresa asociada a este usuario."
        );
      }

      const { data: empresaData, error: empresaError } = await supabase
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
          created_at,
          codigo_publico,
          imagen_bienvenida,
          direccion,
          sistema_reservas,
          url_reservas,
          plan,
          activo
        `)
        .eq("id", relacion.empresa_id)
        .maybeSingle();

      if (empresaError) {
        throw empresaError;
      }

      if (!empresaData) {
        throw new Error("No encontramos la empresa asociada.");
      }

      setEmpresa(empresaData);

      const {
        data: telegramData,
        error: telegramError,
      } = await supabase
        .from("empresa_notificaciones")
        .select(
          "telegram_activo, telegram_chat_id, telegram_conectado"
        )
        .eq("empresa_id", empresaData.id)
        .maybeSingle();

      if (telegramError) {
        console.error("ERROR CARGANDO TELEGRAM:", telegramError);
      } else if (telegramData) {
        setTelegramActivo(telegramData.telegram_activo === true);
        setTelegramChatId(
          telegramData.telegram_chat_id
            ? String(telegramData.telegram_chat_id)
            : ""
        );
        setTelegramConectado(telegramData.telegram_conectado === true);
      }

      setFormulario({
        nombre: empresaData.nombre || "",
        tipo: empresaData.tipo || "",
        ciudad: empresaData.ciudad || "",
        pais: empresaData.pais || "Estados Unidos",
        telefono: empresaData.telefono || "",
        email: empresaData.email || "",
        sitio_web: empresaData.sitio_web || "",
        direccion: empresaData.direccion || "",
        imagen_bienvenida: empresaData.imagen_bienvenida || "",
        sistema_reservas: empresaData.sistema_reservas !== false,
        url_reservas: empresaData.url_reservas || "",
      });
    } catch (err: any) {
      console.error("ERROR CARGANDO MI NEGOCIO:", err);
      setError(
        err?.message || "No fue posible cargar la información."
      );
    } finally {
      setLoading(false);
    }
  }

  function actualizarCampo(
    campo: keyof Formulario,
    valor: string | boolean
  ) {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function conectarTelegram() {
    if (!empresa || conectandoTelegram) return;

    try {
      setConectandoTelegram(true);
      setErrorTelegram("");
      setMensajeTelegram("");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("La sesión del propietario no está disponible.");
      }

      const response = await fetch("/api/telegram/conectar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const resultado = await response.json();

      if (!response.ok || !resultado.ok || !resultado.telegramUrl) {
        throw new Error(
          resultado.error || "No fue posible preparar la conexión con Telegram."
        );
      }

      // Telegram Web puede abrir el chat sin ejecutar correctamente el
      // parámetro ?start=. Para evitar que el propietario tenga que copiar
      // el código, preparamos el comando /start en el portapapeles y abrimos
      // directamente Telegram Web.
      const urlTelegram = new URL(resultado.telegramUrl);
      const parametroStart = urlTelegram.searchParams.get("start") || "";

      if (!parametroStart) {
        throw new Error("Telegram no devolvió el parámetro de conexión.");
      }

      const comandoStart = `/start ${parametroStart}`;
      let comandoCopiado = false;

      try {
        await navigator.clipboard.writeText(comandoStart);
        comandoCopiado = true;
        setComandoTelegram("");
      } catch (clipboardError) {
        console.warn(
          "NO FUE POSIBLE COPIAR EL COMANDO DE TELEGRAM:",
          clipboardError
        );
        setComandoTelegram(comandoStart);
      }

      const botUsername = urlTelegram.pathname.replace("/", "");
      const telegramWebUrl = `https://web.telegram.org/k/#@${botUsername}`;

      window.open(telegramWebUrl, "_blank", "noopener,noreferrer");

      setMensajeTelegram(
        comandoCopiado
          ? "Telegram Web está abierto. El comando de conexión quedó copiado; pégalo en el chat de AAF Business y envíalo."
          : "Telegram Web está abierto. Copia el comando que aparece abajo, pégalo en el chat de AAF Business y envíalo."
      );

      // Esperamos unos segundos y consultamos la configuración de esta empresa.
      // Cuando el webhook recibe /start, el estado pasa automáticamente a CONECTADO.
      for (let intento = 0; intento < 10; intento++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const { data: estadoTelegram, error: estadoError } = await supabase
          .from("empresa_notificaciones")
          .select("telegram_activo, telegram_chat_id, telegram_conectado")
          .eq("empresa_id", empresa.id)
          .maybeSingle();

        if (estadoError) {
          console.warn("ERROR VERIFICANDO CONEXIÓN TELEGRAM:", estadoError);
          continue;
        }

        if (estadoTelegram?.telegram_conectado) {
          setTelegramActivo(estadoTelegram.telegram_activo === true);
          setTelegramChatId(
            estadoTelegram.telegram_chat_id
              ? String(estadoTelegram.telegram_chat_id)
              : ""
          );
          setTelegramConectado(true);
          setMensajeTelegram(
            "Telegram quedó conectado correctamente para este restaurante."
          );
          break;
        }
      }
    } catch (err: any) {
      console.error("ERROR CONECTANDO TELEGRAM:", err);
      setErrorTelegram(
        err?.message || "No fue posible iniciar la conexión con Telegram."
      );
    } finally {
      setConectandoTelegram(false);
    }
  }

  async function guardarTelegramActivo(nuevoEstado: boolean) {
    if (!empresa) return;

    try {
      setGuardandoTelegram(true);
      setErrorTelegram("");
      setMensajeTelegram("");

      const { error } = await supabase
        .from("empresa_notificaciones")
        .update({
          telegram_activo: nuevoEstado,
        })
        .eq("empresa_id", empresa.id);

      if (error) throw error;

      setMensajeTelegram(
        nuevoEstado
          ? "Las notificaciones de Telegram están activas."
          : "Las notificaciones de Telegram están desactivadas."
      );
    } catch (err: any) {
      console.error("ERROR ACTUALIZANDO TELEGRAM:", err);
      setErrorTelegram(
        err?.message || "No fue posible actualizar Telegram."
      );
    } finally {
      setGuardandoTelegram(false);
    }
  }

  async function guardarCambios() {
    if (!empresa) return;

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const nombre = formulario.nombre.trim();

      if (!nombre) {
        setError("El nombre del negocio es obligatorio.");
        return;
      }

      const { data, error: updateError } = await supabase
        .from("empresas")
        .update({
          nombre,
          tipo: formulario.tipo.trim() || null,
          ciudad: formulario.ciudad.trim() || null,
          pais: formulario.pais.trim() || null,
          telefono: formulario.telefono.trim() || null,
          email: formulario.email.trim() || null,
          sitio_web: formulario.sitio_web.trim() || null,
          direccion: formulario.direccion.trim() || null,
          imagen_bienvenida:
            formulario.imagen_bienvenida.trim() || null,
          sistema_reservas: formulario.sistema_reservas,
          url_reservas:
            formulario.url_reservas.trim() || null,
        })
        .eq("id", empresa.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setEmpresa(data);

      setMensaje("Los datos del negocio fueron guardados correctamente.");

      setTimeout(() => {
        setMensaje("");
      }, 4000);
    } catch (err: any) {
      console.error("ERROR GUARDANDO EMPRESA:", err);
      setError(
        err?.message || "No fue posible guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#160c07",
          color: "#f6efe7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "3px solid #4a3020",
              borderTopColor: "#c69a6b",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />

          <div
            style={{
              color: "#cdb9a5",
              fontSize: 14,
            }}
          >
            Cargando información de tu negocio...
          </div>

          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#160c07",
          color: "#f6efe7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#21130c",
            border: "1px solid #4a3020",
            borderRadius: 20,
            padding: 30,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              background: "#382216",
              color: "#d3ad7d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <Icon name="building" size={25} />
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: 24,
              color: "#f6efe7",
            }}
          >
            No encontramos tu negocio
          </h1>

          <p
            style={{
              margin: "0 0 22px",
              color: "#bca896",
              lineHeight: 1.6,
            }}
          >
            Tu usuario todavía no tiene una empresa asociada.
          </p>

          <button
            onClick={() => router.replace("/dashboard")}
            style={{
              height: 46,
              border: 0,
              borderRadius: 12,
              padding: "0 18px",
              background: "#b58a5b",
              color: "#1a0d07",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Volver al dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#160c07",
        color: "#f6efe7",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            width: 250,
            flexShrink: 0,
            background:
              "linear-gradient(180deg, #1d1009 0%, #160c07 100%)",
            borderRight: "1px solid #392316",
            padding: 22,
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 34,
              padding: "4px 6px",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                background:
                  "linear-gradient(145deg, #c69a6b, #8c5e38)",
                color: "#1b0e08",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              S
            </div>

            <div>
              <div
                style={{
                  color: "#f7efe7",
                  fontWeight: 900,
                  fontSize: 17,
                  letterSpacing: "-.02em",
                }}
              >
                ShortBizAI
              </div>

              <div
                style={{
                  color: "#8f7561",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                BUSINESS OS
              </div>
            </div>
          </div>

          <div
            style={{
              color: "#725844",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              padding: "0 10px",
              marginBottom: 10,
            }}
          >
            Principal
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            style={menuStyle(false)}
          >
            <Icon name="home" size={18} />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/videos")}
            style={menuStyle(false)}
          >
            <Icon name="video" size={18} />
            <span>Videos</span>
            <span style={prontoStyle()}>Pronto</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/reservas")}
            style={menuStyle(false)}
          >
            <Icon name="calendar" size={18} />
            <span>Reservas</span>
            <span style={prontoStyle()}>Pronto</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/fidelizacion")}
            style={menuStyle(false)}
          >
            <Icon name="heart" size={18} />
            <span>Fidelización</span>
            <span style={prontoStyle()}>Pronto</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/reportes")}
            style={menuStyle(false)}
          >
            <Icon name="chart" size={18} />
            <span>Reportes</span>
            <span style={prontoStyle()}>Pronto</span>
          </button>

          <div
            style={{
              color: "#725844",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              padding: "0 10px",
              marginTop: 26,
              marginBottom: 10,
            }}
          >
            Negocio
          </div>

          <button
            style={menuStyle(true)}
            onClick={() => router.push("/dashboard/mi-negocio")}
          >
            <Icon name="settings" size={18} />
            <span>Mi negocio</span>
          </button>

          <div style={{ flex: 1 }} />

          <div
            style={{
              borderTop: "1px solid #392316",
              paddingTop: 16,
              marginTop: 16,
            }}
          >
            <div
              style={{
                color: "#725844",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                padding: "0 10px",
                marginBottom: 10,
              }}
            >
              Cuenta
            </div>

            <div
              style={{
                padding: "10px",
                borderRadius: 12,
                background: "#21130c",
                border: "1px solid #382216",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  color: "#eadfd2",
                  fontWeight: 700,
                  fontSize: 13,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {perfil?.nombre || "Propietario"}
              </div>

              <div
                style={{
                  color: "#8f7561",
                  fontSize: 11,
                  marginTop: 3,
                }}
              >
                Propietario
              </div>
            </div>

            <button
              onClick={cerrarSesion}
              style={{
                width: "100%",
                height: 42,
                border: "1px solid #392316",
                borderRadius: 11,
                background: "transparent",
                color: "#aa8f79",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 12px",
                fontWeight: 700,
              }}
            >
              <Icon name="logout" size={17} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <section
          style={{
            flex: 1,
            minWidth: 0,
            padding: "34px 42px 50px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 20,
                marginBottom: 30,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    color: "#b58a5b",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    marginBottom: 9,
                  }}
                >
                  <Icon name="settings" size={14} />
                  Configuración del negocio
                </div>

                <h1
                  style={{
                    margin: 0,
                    color: "#f8f1ea",
                    fontSize: 34,
                    lineHeight: 1.1,
                    letterSpacing: "-.04em",
                  }}
                >
                  Mi negocio
                </h1>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#a88d77",
                    fontSize: 15,
                    lineHeight: 1.6,
                    maxWidth: 700,
                  }}
                >
                  Administra la información que ShortBizAI utiliza para
                  representar y operar tu negocio.
                </p>
              </div>

              <button
                onClick={guardarCambios}
                disabled={guardando}
                style={{
                  height: 46,
                  border: 0,
                  borderRadius: 12,
                  background: guardando
                    ? "#725438"
                    : "linear-gradient(145deg, #c69a6b, #9d7047)",
                  color: "#1b0e08",
                  padding: "0 20px",
                  fontWeight: 900,
                  cursor: guardando ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  boxShadow: "0 10px 25px rgba(0,0,0,.18)",
                }}
              >
                <Icon name="save" size={17} />
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>

            {/* MENSAJES */}
            {mensaje && (
              <div
                style={{
                  marginBottom: 20,
                  borderRadius: 13,
                  border: "1px solid #53633b",
                  background: "#25301c",
                  color: "#cbd9b0",
                  padding: "13px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                <Icon name="check" size={18} />
                {mensaje}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginBottom: 20,
                  borderRadius: 13,
                  border: "1px solid #633b32",
                  background: "#321914",
                  color: "#e7b8a9",
                  padding: "13px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            )}

            {/* IDENTIDAD */}
            <section style={cardStyle()}>
              <div style={sectionHeaderStyle()}>
                <div>
                  <h2 style={sectionTitleStyle()}>
                    Información del negocio
                  </h2>
                  <p style={sectionDescriptionStyle()}>
                    Estos datos identifican a tu negocio dentro de
                    ShortBizAI.
                  </p>
                </div>

                <div style={iconBoxStyle()}>
                  <Icon name="building" size={21} />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 20,
                }}
              >
                <Campo
                  label="Nombre del negocio"
                  value={formulario.nombre}
                  onChange={(v) => actualizarCampo("nombre", v)}
                  placeholder="Ej. Restaurante Sebas"
                />

                <Campo
                  label="Tipo de negocio"
                  value={formulario.tipo}
                  onChange={(v) => actualizarCampo("tipo", v)}
                  placeholder="Ej. Restaurante"
                />

                <Campo
                  label="Teléfono"
                  value={formulario.telefono}
                  onChange={(v) => actualizarCampo("telefono", v)}
                  placeholder="Ej. +1 929 000 0000"
                />

                <Campo
                  label="Email"
                  value={formulario.email}
                  onChange={(v) => actualizarCampo("email", v)}
                  placeholder="negocio@email.com"
                  type="email"
                />

                <Campo
                  label="Ciudad"
                  value={formulario.ciudad}
                  onChange={(v) => actualizarCampo("ciudad", v)}
                  placeholder="Ej. New York"
                />

                <Campo
                  label="País"
                  value={formulario.pais}
                  onChange={(v) => actualizarCampo("pais", v)}
                  placeholder="Ej. Estados Unidos"
                />

                <div style={{ gridColumn: "1 / -1" }}>
                  <Campo
                    label="Dirección"
                    value={formulario.direccion}
                    onChange={(v) =>
                      actualizarCampo("direccion", v)
                    }
                    placeholder="Dirección completa del negocio"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <Campo
                    label="Sitio web"
                    value={formulario.sitio_web}
                    onChange={(v) =>
                      actualizarCampo("sitio_web", v)
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>

            {/* IMAGEN */}
            <section style={cardStyle()}>
              <div style={sectionHeaderStyle()}>
                <div>
                  <h2 style={sectionTitleStyle()}>
                    Imagen del negocio
                  </h2>
                  <p style={sectionDescriptionStyle()}>
                    Puedes guardar aquí la URL de la imagen que
                    representa al negocio.
                  </p>
                </div>
              </div>

              <Campo
                label="URL de imagen / logo"
                value={formulario.imagen_bienvenida}
                onChange={(v) =>
                  actualizarCampo("imagen_bienvenida", v)
                }
                placeholder="https://..."
              />

              {formulario.imagen_bienvenida && (
                <div
                  style={{
                    marginTop: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: 14,
                    borderRadius: 14,
                    background: "#1a0f09",
                    border: "1px solid #3b2618",
                  }}
                >
                  <img
                    src={formulario.imagen_bienvenida}
                    alt="Imagen del negocio"
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 14,
                      objectFit: "cover",
                      border: "1px solid #4a3020",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div>
                    <div
                      style={{
                        color: "#eadfd2",
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      Imagen configurada
                    </div>

                    <div
                      style={{
                        color: "#8f7561",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Se utilizará como imagen de referencia del
                      negocio.
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* RESERVAS */}
            <section style={cardStyle()}>
              <div style={sectionHeaderStyle()}>
                <div>
                  <h2 style={sectionTitleStyle()}>
                    Sistema de reservas
                  </h2>
                  <p style={sectionDescriptionStyle()}>
                    Controla si este negocio utiliza el sistema de
                    reservas de ShortBizAI.
                  </p>
                </div>

                <div style={iconBoxStyle()}>
                  <Icon name="calendar" size={21} />
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #3f291b",
                  background: "#1a0f09",
                  borderRadius: 15,
                  padding: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#eee3d8",
                      fontSize: 15,
                      fontWeight: 800,
                    }}
                  >
                    Reservas ShortBizAI
                  </div>

                  <div
                    style={{
                      color: "#927865",
                      fontSize: 13,
                      marginTop: 5,
                      lineHeight: 1.5,
                    }}
                  >
                    Permite que tus clientes soliciten reservas
                    utilizando ShortBizAI.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    actualizarCampo(
                      "sistema_reservas",
                      !formulario.sistema_reservas
                    )
                  }
                  style={{
                    border: "1px solid #59402d",
                    borderRadius: 999,
                    padding: "7px 12px 7px 8px",
                    background: formulario.sistema_reservas
                      ? "#28311e"
                      : "#281812",
                    color: formulario.sistema_reservas
                      ? "#c8d6a7"
                      : "#ad8170",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  <span
                    style={{
                      width: 25,
                      height: 25,
                      borderRadius: "50%",
                      background: formulario.sistema_reservas
                        ? "#91a56d"
                        : "#694439",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#171008",
                    }}
                  >
                    {formulario.sistema_reservas ? (
                      <Icon name="check" size={14} />
                    ) : null}
                  </span>

                  {formulario.sistema_reservas
                    ? "Activado"
                    : "Desactivado"}
                </button>
              </div>

              <div style={{ marginTop: 20 }}>
                <Campo
                  label="URL de reservas"
                  value={formulario.url_reservas}
                  onChange={(v) =>
                    actualizarCampo("url_reservas", v)
                  }
                  placeholder="URL pública de reservas"
                />
              </div>
            </section>

            {/* DATOS DEL SISTEMA */}
            <section style={cardStyle()}>
              <div style={sectionHeaderStyle()}>
                <div>
                  <h2 style={sectionTitleStyle()}>
                    Información de ShortBizAI
                  </h2>
                  <p style={sectionDescriptionStyle()}>
                    Datos generados por el sistema. Estos valores no
                    se modifican desde aquí.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: 16,
                }}
              >
                <InfoSistema
                  label="ID de empresa"
                  value={String(empresa.id)}
                />

                <InfoSistema
                  label="Código público"
                  value={empresa.codigo_publico || "Pendiente"}
                />

                <InfoSistema
                  label="Plan"
                  value={empresa.plan || "free"}
                />

                <InfoSistema
                  label="Estado"
                  value={empresa.activo ? "Activa" : "Inactiva"}
                  estado={empresa.activo}
                />
              </div>
            </section>

            {/* NOTIFICACIONES */}
            <section style={cardStyle()}>
              <div style={sectionHeaderStyle()}>
                <div>
                  <h2 style={sectionTitleStyle()}>
                    Notificaciones
                  </h2>

                  <p style={sectionDescriptionStyle()}>
                    Aquí conectaremos los canales de comunicación
                    del negocio.
                  </p>
                </div>

                <div style={iconBoxStyle()}>
                  <Icon name="heart" size={21} />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    border: "1px solid #392518",
                    background: "#1a0f09",
                    borderRadius: 14,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        color: "#eadfd2",
                        fontSize: 14,
                        fontWeight: 850,
                      }}
                    >
                      Telegram
                    </div>

                    <span
                      style={{
                        color: telegramConectado ? "#9eb17b" : "#795d49",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {telegramConectado ? "CONECTADO" : "NO CONFIGURADO"}
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#806754",
                      fontSize: 12,
                      lineHeight: 1.45,
                      marginTop: 7,
                    }}
                  >
                    Recibe avisos de nuevas reservas de este restaurante.
                  </div>

                  {!telegramConectado ? (
                    <button
                      type="button"
                      onClick={conectarTelegram}
                      disabled={conectandoTelegram}
                      style={{
                        width: "100%",
                        marginTop: 16,
                        height: 44,
                        border: 0,
                        borderRadius: 11,
                        background: conectandoTelegram
                          ? "#725438"
                          : "linear-gradient(145deg, #c69a6b, #9d7047)",
                        color: "#1b0e08",
                        fontWeight: 900,
                        cursor: conectandoTelegram ? "default" : "pointer",
                      }}
                    >
                      {conectandoTelegram
                        ? "Preparando conexión..."
                        : "🔗 Conectar Telegram"}
                    </button>
                  ) : (
                    <>
                      <div
                        style={{
                          marginTop: 16,
                          padding: 12,
                          borderRadius: 11,
                          border: "1px solid #394528",
                          background: "#182016",
                          color: "#c8d6a7",
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        ✅ Telegram conectado automáticamente.
                        <br />
                        El Chat ID fue asignado por ShortBizAI.
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const nuevoEstado = !telegramActivo;
                          setTelegramActivo(nuevoEstado);
                          void guardarTelegramActivo(nuevoEstado);
                        }}
                        disabled={guardandoTelegram}
                        style={{
                          marginTop: 14,
                          border: "1px solid #59402d",
                          borderRadius: 999,
                          padding: "7px 12px",
                          background: telegramActivo ? "#28311e" : "#281812",
                          color: telegramActivo ? "#c8d6a7" : "#ad8170",
                          cursor: guardandoTelegram ? "default" : "pointer",
                          fontWeight: 800,
                        }}
                      >
                        {telegramActivo
                          ? "🟢 Telegram activo"
                          : "⚪ Telegram desactivado"}
                      </button>
                    </>
                  )}

                  {mensajeTelegram && (
                    <div
                      style={{
                        marginTop: 12,
                        color: "#9eb17b",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      ✅ {mensajeTelegram}
                    </div>
                  )}

                  {comandoTelegram && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 11,
                        border: "1px solid #59402d",
                        background: "#120c08",
                      }}
                    >
                      <div
                        style={{
                          color: "#806754",
                          fontSize: 11,
                          fontWeight: 800,
                          marginBottom: 7,
                        }}
                      >
                        Comando de conexión
                      </div>

                      <div
                        style={{
                          color: "#eadfd2",
                          fontSize: 11,
                          lineHeight: 1.45,
                          wordBreak: "break-all",
                          marginBottom: 10,
                        }}
                      >
                        {comandoTelegram}
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(comandoTelegram);
                            setMensajeTelegram(
                              "Comando copiado. Pégalo en Telegram Web y envíalo."
                            );
                          } catch (err) {
                            console.error(
                              "ERROR COPIANDO COMANDO TELEGRAM:",
                              err
                            );
                            setErrorTelegram(
                              "No fue posible copiar automáticamente. Selecciona el comando y cópialo."
                            );
                          }
                        }}
                        style={{
                          border: 0,
                          borderRadius: 9,
                          padding: "8px 12px",
                          background: "#c69a6b",
                          color: "#1b0e08",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        📋 Copiar comando
                      </button>
                    </div>
                  )}

                  {errorTelegram && (
                    <div
                      style={{
                        marginTop: 12,
                        color: "#e7b8a9",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {errorTelegram}
                    </div>
                  )}
                </div>

                <Canal
                  nombre="Email"
                  descripcion="Confirmaciones al cliente"
                  estado="Activo"
                  activo
                />

                <Canal
                  nombre="Push"
                  descripcion="Notificaciones del navegador"
                  estado="Disponible"
                  activo
                />

                <Canal
                  nombre="WhatsApp"
                  descripcion="Mensajes al cliente"
                  estado="Próximamente"
                />
              </div>
            </section>

            {/* FUTURO */}
            <section
              style={{
                ...cardStyle(),
                background:
                  "linear-gradient(145deg, #21130c, #29180e)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    background: "#3b2618",
                    color: "#c69a6b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="arrow" size={21} />
                </div>

                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: "#f0e5db",
                      fontSize: 16,
                    }}
                  >
                    Próximamente
                  </h3>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#a88d77",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    Desde este perfil iremos incorporando horarios,
                    redes sociales, preferencias de contenido,
                    información para videos y configuración avanzada
                    del negocio.
                  </p>
                </div>
              </div>
            </section>

            <div
              style={{
                textAlign: "center",
                color: "#644b38",
                fontSize: 11,
                padding: "18px 0 0",
              }}
            >
              ShortBizAI · Perfil del negocio · ID {empresa.id}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function menuStyle(activo: boolean) {
  return {
    width: "100%",
    height: 44,
    border: "1px solid transparent",
    borderRadius: 11,
    background: activo ? "#342115" : "transparent",
    color: activo ? "#e3c29e" : "#a58a73",
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "0 11px",
    marginBottom: 5,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: activo ? 800 : 650,
    textAlign: "left" as const,
  };
}

function prontoStyle() {
  return {
    marginLeft: "auto",
    color: "#6d5441",
    fontSize: 9,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: ".05em",
  };
}

function cardStyle() {
  return {
    background: "#21130c",
    border: "1px solid #3b2618",
    borderRadius: 19,
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 14px 40px rgba(0,0,0,.13)",
  };
}

function sectionHeaderStyle() {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 22,
  };
}

function sectionTitleStyle() {
  return {
    margin: 0,
    color: "#f1e6dc",
    fontSize: 18,
    fontWeight: 850,
    letterSpacing: "-.02em",
  };
}

function sectionDescriptionStyle() {
  return {
    margin: "6px 0 0",
    color: "#927865",
    fontSize: 13,
    lineHeight: 1.5,
  };
}

function iconBoxStyle() {
  return {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#342115",
    color: "#c69a6b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
}

function InfoSistema({
  label,
  value,
  estado,
}: {
  label: string;
  value: string;
  estado?: boolean | null;
}) {
  return (
    <div
      style={{
        border: "1px solid #392518",
        background: "#1a0f09",
        borderRadius: 13,
        padding: 15,
      }}
    >
      <div
        style={{
          color: "#765b46",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 7,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            estado === true
              ? "#a9bb82"
              : estado === false
              ? "#bd8270"
              : "#d9c6b5",
          fontSize: 14,
          fontWeight: 800,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Canal({
  nombre,
  descripcion,
  estado,
  activo = false,
}: {
  nombre: string;
  descripcion: string;
  estado: string;
  activo?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid #392518",
        background: "#1a0f09",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            color: "#eadfd2",
            fontSize: 14,
            fontWeight: 850,
          }}
        >
          {nombre}
        </div>

        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: activo ? "#91a56d" : "#6c5140",
            flexShrink: 0,
          }}
        />
      </div>

      <div
        style={{
          color: "#806754",
          fontSize: 12,
          lineHeight: 1.45,
          marginTop: 6,
        }}
      >
        {descripcion}
      </div>

      <div
        style={{
          color: activo ? "#9eb17b" : "#795d49",
          fontSize: 11,
          fontWeight: 750,
          marginTop: 12,
        }}
      >
        {estado}
      </div>
    </div>
  );
}