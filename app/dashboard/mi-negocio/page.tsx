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

      const { data: perfilData, error: perfilError } =
        await supabase
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

      const { data: relacion, error: relacionError } =
        await supabase
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

      const { data: empresaData, error: empresaError } =
        await supabase
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
        console.error(
          "ERROR CARGANDO TELEGRAM:",
          telegramError
        );
      } else if (telegramData) {
        setTelegramActivo(
          telegramData.telegram_activo === true
        );

        setTelegramChatId(
          telegramData.telegram_chat_id
            ? String(telegramData.telegram_chat_id)
            : ""
        );

        setTelegramConectado(
          telegramData.telegram_conectado === true
        );
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
        imagen_bienvenida:
          empresaData.imagen_bienvenida || "",
        sistema_reservas:
          empresaData.sistema_reservas !== false,
        url_reservas: empresaData.url_reservas || "",
      });
    } catch (err: any) {
      console.error(
        "ERROR CARGANDO MI NEGOCIO:",
        err
      );

      setError(
        err?.message ||
          "No fue posible cargar la información."
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

    const ventanaTelegram = window.open(
      "about:blank",
      "_blank"
    );

    try {
      setConectandoTelegram(true);
      setErrorTelegram("");
      setMensajeTelegram("");

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const accessToken =
        sessionData.session?.access_token;

      if (!accessToken) {
        if (ventanaTelegram) {
          ventanaTelegram.close();
        }

        throw new Error(
          "La sesión del propietario no está disponible."
        );
      }

      const response = await fetch(
        "/api/telegram/conectar",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

      const resultado =
        await response.json();


      if (
  !response.ok ||
  !resultado.ok ||
  !resultado.telegramUrl ||
  !resultado.codigo
) {
  

        
        if (ventanaTelegram) {
          ventanaTelegram.close();
        }

        throw new Error(
          resultado.error ||
            "No fue posible generar el código de conexión."
        );
      }

      if (ventanaTelegram) {
        ventanaTelegram.location.href =
          resultado.telegramUrl;
      } else {
        window.location.href =
          resultado.telegramUrl;
      }

      setMensajeTelegram(
        `Código de conexión: ${resultado.codigo}. Abre AAF Business en Telegram y envía ese código de 6 dígitos. El código vence en 10 minutos.`
      );

      for (
        let intento = 0;
        intento < 20;
        intento++
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 1500)
        );

        const {
          data: estadoTelegram,
          error: estadoError,
        } = await supabase
          .from("empresa_notificaciones")
          .select(
            "telegram_activo, telegram_chat_id, telegram_conectado"
          )
          .eq("empresa_id", empresa.id)
          .maybeSingle();

        if (estadoError) {
          console.warn(
            "ERROR VERIFICANDO CONEXIÓN TELEGRAM:",
            estadoError
          );
          continue;
        }

        if (estadoTelegram?.telegram_conectado) {
          setTelegramActivo(
            estadoTelegram.telegram_activo === true
          );

          setTelegramChatId(
            estadoTelegram.telegram_chat_id
              ? String(
                  estadoTelegram.telegram_chat_id
                )
              : ""
          );

          setTelegramConectado(true);
          setComandoTelegram("");

          setMensajeTelegram(
            "Telegram quedó conectado correctamente para este restaurante."
          );

          break;
        }
      }
    } catch (err: any) {
      console.error(
        "ERROR CONECTANDO TELEGRAM:",
        err
      );

      setErrorTelegram(
        err?.message ||
          "No fue posible iniciar la conexión con Telegram."
      );
    } finally {
      setConectandoTelegram(false);
    }
  }

  async function guardarTelegramActivo(
    nuevoEstado: boolean
  ) {
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

      setTelegramActivo(nuevoEstado);

      setMensajeTelegram(
        nuevoEstado
          ? "Las notificaciones de Telegram están activas."
          : "Las notificaciones de Telegram están desactivadas."
      );
    } catch (err: any) {
      console.error(
        "ERROR ACTUALIZANDO TELEGRAM:",
        err
      );

      setErrorTelegram(
        err?.message ||
          "No fue posible actualizar Telegram."
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
        setError(
          "El nombre del negocio es obligatorio."
        );
        return;
      }

      const {
        data,
        error: updateError,
      } = await supabase
        .from("empresas")
        .update({
          nombre,
          tipo:
            formulario.tipo.trim() || null,
          ciudad:
            formulario.ciudad.trim() || null,
          pais:
            formulario.pais.trim() || null,
          telefono:
            formulario.telefono.trim() || null,
          email:
            formulario.email.trim() || null,
          sitio_web:
            formulario.sitio_web.trim() || null,
          direccion:
            formulario.direccion.trim() || null,
          imagen_bienvenida:
            formulario.imagen_bienvenida.trim() ||
            null,
          sistema_reservas:
            formulario.sistema_reservas,
          url_reservas:
            formulario.url_reservas.trim() ||
            null,
        })
        .eq("id", empresa.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setEmpresa(data);

      setMensaje(
        "Los datos del negocio fueron guardados correctamente."
      );

      setTimeout(() => {
        setMensaje("");
      }, 4000);
    } catch (err: any) {
      console.error(
        "ERROR GUARDANDO EMPRESA:",
        err
      );

      setError(
        err?.message ||
          "No fue posible guardar los cambios."
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
              animation:
                "spin 1s linear infinite",
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
            onClick={() =>
              router.replace("/dashboard")
            }
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
            onClick={() =>
              router.push("/dashboard")
            }
            style={menuStyle(false)}
          >
            <Icon name="home" size={18} />
            <span>Inicio</span>
          </button>

          <button
            onClick={() =>
              router.push("/dashboard/videos")
            }
            style={menuStyle(false)}
          >
            <Icon name="video" size={18} />
            <span>Videos</span>
            <span style={prontoStyle()}>
              Pronto
            </span>
          </button>

          <button
            onClick={() =>
              router.push("/dashboard/reservas")
            }
            style={menuStyle(false)}
          >
            <Icon name="calendar" size={18} />
            <span>Reservas</span>
            <span style={prontoStyle()}>
              Pronto
            </span>
          </button>

          <button
            onClick={() =>
              router.push(
                "/dashboard/fidelizacion"
              )
            }
            style={menuStyle(false)}
          >
            <Icon name="heart" size={18} />
            <span>Fidelización</span>
            <span style={prontoStyle()}>
              Pronto
            </span>
          </button>

          <button
            onClick={() =>
              router.push("/dashboard/reportes")
            }
            style={menuStyle(false)}
          >
            <Icon name="chart" size={18} />
            <span>Reportes</span>
            <span style={prontoStyle()}>
              Pronto
            </span>
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
            onClick={() =>
              router.push(
                "/dashboard/mi-negocio"
              )
            }
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
                {perfil?.nombre ||
                  "Propietario"}
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

        <section
          style={{
            flex: 1,
            minWidth: 0,
            padding: 32,
            boxSizing: "border-box",
            overflow: "auto",
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  color: "#8f7561",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Configuración
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#f7efe7",
                  fontSize: 32,
                  lineHeight: 1.1,
                  letterSpacing: "-.03em",
                }}
              >
                Mi negocio
              </h1>

              <p
                style={{
                  margin:
                    "10px 0 0",
                  color: "#9f8976",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Administra la información y los canales de comunicación de tu negocio.
              </p>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 20,
                  padding: "13px 16px",
                  borderRadius: 12,
                  border:
                    "1px solid #713c31",
                  background: "#301710",
                  color: "#efb4a6",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {mensaje && (
              <div
                style={{
                  marginBottom: 20,
                  padding: "13px 16px",
                  borderRadius: 12,
                  border:
                    "1px solid #4c6042",
                  background: "#1c2818",
                  color: "#b9d6ae",
                  fontSize: 14,
                }}
              >
                {mensaje}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1.35fr) minmax(320px, .65fr)",
                gap: 22,
                alignItems: "start",
              }}
            >
              <section style={cardStyle()}>
                <div style={sectionHeaderStyle()}>
                  <div>
                    <div
                      style={sectionTitleStyle()}
                    >
                      Información del negocio
                    </div>

                    <div
                      style={
                        sectionDescriptionStyle()
                      }
                    >
                      Estos datos se utilizan en tu sistema y en la información pública del negocio.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: 18,
                  }}
                >
                  <Campo
                    label="Nombre del negocio"
                    value={formulario.nombre}
                    onChange={(v) =>
                      actualizarCampo(
                        "nombre",
                        v
                      )
                    }
                    placeholder="Nombre del negocio"
                  />

                  <Campo
                    label="Tipo de negocio"
                    value={formulario.tipo}
                    onChange={(v) =>
                      actualizarCampo(
                        "tipo",
                        v
                      )
                    }
                    placeholder="Restaurante, barbería, tienda..."
                  />

                  <Campo
                    label="Ciudad"
                    value={formulario.ciudad}
                    onChange={(v) =>
                      actualizarCampo(
                        "ciudad",
                        v
                      )
                    }
                    placeholder="Queens"
                  />

                  <Campo
                    label="País"
                    value={formulario.pais}
                    onChange={(v) =>
                      actualizarCampo(
                        "pais",
                        v
                      )
                    }
                    placeholder="Estados Unidos"
                  />

                  <Campo
                    label="Teléfono"
                    value={formulario.telefono}
                    onChange={(v) =>
                      actualizarCampo(
                        "telefono",
                        v
                      )
                    }
                    placeholder="(718) 000-0000"
                  />

                  <Campo
                    label="Email"
                    value={formulario.email}
                    onChange={(v) =>
                      actualizarCampo(
                        "email",
                        v
                      )
                    }
                    type="email"
                    placeholder="negocio@email.com"
                  />

                  <Campo
                    label="Sitio web"
                    value={formulario.sitio_web}
                    onChange={(v) =>
                      actualizarCampo(
                        "sitio_web",
                        v
                      )
                    }
                    placeholder="https://..."
                  />

                  <Campo
                    label="Dirección"
                    value={formulario.direccion}
                    onChange={(v) =>
                      actualizarCampo(
                        "direccion",
                        v
                      )
                    }
                    placeholder="Dirección del negocio"
                  />

                  <div
                    style={{
                      gridColumn:
                        "1 / -1",
                    }}
                  >
                    <Campo
                      label="Imagen de bienvenida"
                      value={
                        formulario.imagen_bienvenida
                      }
                      onChange={(v) =>
                        actualizarCampo(
                          "imagen_bienvenida",
                          v
                        )
                      }
                      placeholder="URL de la imagen"
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 24,
                    borderTop:
                      "1px solid #392316",
                  }}
                >
                  <div
                    style={{
                      color: "#eadfd2",
                      fontSize: 14,
                      fontWeight: 800,
                      marginBottom: 12,
                    }}
                  >
                    Reservas
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: 18,
                      padding: 15,
                      borderRadius: 14,
                      background:
                        "#1b100a",
                      border:
                        "1px solid #382216",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color:
                            "#e9ddd1",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        Sistema de reservas
                      </div>

                      <div
                        style={{
                          color:
                            "#927965",
                          fontSize: 12,
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        Activa esta opción si el negocio recibe reservas.
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
                        width: 52,
                        height: 30,
                        border: 0,
                        borderRadius: 30,
                        background:
                          formulario.sistema_reservas
                            ? "#b58a5b"
                            : "#493226",
                        cursor:
                          "pointer",
                        position:
                          "relative",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position:
                            "absolute",
                          top: 4,
                          left:
                            formulario.sistema_reservas
                              ? 26
                              : 4,
                          width: 22,
                          height: 22,
                          borderRadius:
                            "50%",
                          background:
                            "#fff7ef",
                          transition:
                            "left .2s ease",
                        }}
                      />
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                    }}
                  >
                    <Campo
                      label="URL de reservas"
                      value={
                        formulario.url_reservas
                      }
                      onChange={(v) =>
                        actualizarCampo(
                          "url_reservas",
                          v
                        )
                      }
                      placeholder="https://..."
                      disabled={
                        !formulario.sistema_reservas
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    marginTop: 24,
                  }}
                >
                  <button
                    onClick={guardarCambios}
                    disabled={guardando}
                    style={{
                      height: 46,
                      border: 0,
                      borderRadius: 12,
                      padding:
                        "0 20px",
                      background:
                        guardando
                          ? "#6d543d"
                          : "#b58a5b",
                      color: "#1a0d07",
                      fontWeight: 900,
                      cursor:
                        guardando
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 9,
                    }}
                  >
                    <Icon
                      name="save"
                      size={17}
                    />

                    {guardando
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </button>
                </div>
              </section>

              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: 22,
                }}
              >
                <section style={cardStyle()}>
                  <div
                    style={
                      sectionHeaderStyle()
                    }
                  >
                    <div>
                      <div
                        style={
                          sectionTitleStyle()
                        }
                      >
                        Telegram
                      </div>

                      <div
                        style={
                          sectionDescriptionStyle()
                        }
                      >
                        Conecta Telegram para recibir las notificaciones de reservas.
                      </div>
                    </div>

                    <div
                      style={iconBoxStyle(
                        "#29351f",
                        "#b8d6aa"
                      )}
                    >
                      TG
                    </div>
                  </div>

                  {telegramConectado ? (
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        background:
                          "#192318",
                        border:
                          "1px solid #405437",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 10,
                          color:
                            "#c9dfbf",
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius:
                              "50%",
                            background:
                              "#30452b",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                          }}
                        >
                          <Icon
                            name="check"
                            size={16}
                          />
                        </div>

                        Telegram conectado
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          color:
                            "#9caf94",
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        Las reservas de este restaurante pueden enviar notificaciones al chat conectado.
                      </div>

                      {telegramChatId && (
                        <div
                          style={{
                            marginTop: 12,
                            color:
                              "#809077",
                            fontSize: 11,
                          }}
                        >
                          Chat ID:{" "}
                          {telegramChatId}
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 16,
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: 12,
                          paddingTop: 14,
                          borderTop:
                            "1px solid #304128",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color:
                                "#d8e6d2",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            Notificaciones activas
                          </div>

                          <div
                            style={{
                              color:
                                "#82917b",
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          >
                            Controla si Telegram recibe avisos.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            guardarTelegramActivo(
                              !telegramActivo
                            )
                          }
                          disabled={
                            guardandoTelegram
                          }
                          style={{
                            width: 52,
                            height: 30,
                            border: 0,
                            borderRadius:
                              30,
                            background:
                              telegramActivo
                                ? "#b58a5b"
                                : "#493226",
                            cursor:
                              guardandoTelegram
                                ? "not-allowed"
                                : "pointer",
                            position:
                              "relative",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              position:
                                "absolute",
                              top: 4,
                              left:
                                telegramActivo
                                  ? 26
                                  : 4,
                              width: 22,
                              height: 22,
                              borderRadius:
                                "50%",
                              background:
                                "#fff7ef",
                              transition:
                                "left .2s ease",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          padding: 16,
                          borderRadius: 14,
                          background:
                            "#21130c",
                          border:
                            "1px solid #382216",
                          color:
                            "#a68c77",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        Telegram todavía no está conectado. Presiona el botón para generar un código de conexión.
                      </div>

                      <button
                        type="button"
                        onClick={
                          conectarTelegram
                        }
                        disabled={
                          conectandoTelegram
                        }
                        style={{
                          width:
                            "100%",
                          height: 48,
                          marginTop: 14,
                          border: 0,
                          borderRadius: 12,
                          background:
                            conectandoTelegram
                              ? "#6d543d"
                              : "#b58a5b",
                          color:
                            "#1a0d07",
                          fontWeight: 900,
                          cursor:
                            conectandoTelegram
                              ? "not-allowed"
                              : "pointer",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          gap: 9,
                        }}
                      >
                        <Icon
                          name="arrow"
                          size={17}
                        />

                        {conectandoTelegram
                          ? "Generando código..."
                          : "Conectar Telegram"}
                      </button>

                      {mensajeTelegram && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: 14,
                            borderRadius: 12,
                            background:
                              "#202818",
                            border:
                              "1px solid #405437",
                            color:
                              "#bfd4b6",
                            fontSize: 13,
                            lineHeight: 1.6,
                          }}
                        >
                          {mensajeTelegram}
                        </div>
                      )}

                      {errorTelegram && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: 14,
                            borderRadius: 12,
                            background:
                              "#301710",
                            border:
                              "1px solid #713c31",
                            color:
                              "#efb4a6",
                            fontSize: 13,
                            lineHeight: 1.6,
                          }}
                        >
                          {errorTelegram}
                        </div>
                      )}

                      {comandoTelegram && (
                        <div
                          style={{
                            marginTop: 14,
                          }}
                        >
                          <div
                            style={{
                              color:
                                "#cdb9a5",
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing:
                                ".08em",
                              textTransform:
                                "uppercase",
                              marginBottom:
                                7,
                            }}
                          >
                            Código de conexión
                          </div>

                          <div
                            style={{
                              padding:
                                "14px 16px",
                              borderRadius:
                                12,
                              background:
                                "#160c07",
                              border:
                                "1px solid #4a3020",
                              color:
                                "#f3dfc6",
                              fontSize: 25,
                              fontWeight: 900,
                              letterSpacing:
                                ".18em",
                              textAlign:
                                "center",
                            }}
                          >
                            {comandoTelegram}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {telegramConectado &&
                    mensajeTelegram && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: 14,
                          borderRadius: 12,
                          background:
                            "#202818",
                          border:
                            "1px solid #405437",
                          color:
                            "#bfd4b6",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        {mensajeTelegram}
                      </div>
                    )}

                  {telegramConectado &&
                    errorTelegram && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: 14,
                          borderRadius: 12,
                          background:
                            "#301710",
                          border:
                            "1px solid #713c31",
                          color:
                            "#efb4a6",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        {errorTelegram}
                      </div>
                    )}
                </section>

                <section style={cardStyle()}>
                  <div
                    style={
                      sectionHeaderStyle()
                    }
                  >
                    <div>
                      <div
                        style={
                          sectionTitleStyle()
                        }
                      >
                        Identificación
                      </div>

                      <div
                        style={
                          sectionDescriptionStyle()
                        }
                      >
                        Información interna de esta empresa.
                      </div>
                    </div>
                  </div>

                  <InfoSistema
                    label="ID de empresa"
                    value={String(
                      empresa.id
                    )}
                  />

                  <InfoSistema
                    label="Código público"
                    value={
                      empresa.codigo_publico ||
                      "No disponible"
                    }
                  />

                  <InfoSistema
                    label="Plan"
                    value={
                      empresa.plan ||
                      "No definido"
                    }
                  />

                  <InfoSistema
                    label="Estado"
                    value={
                      empresa.activo === false
                        ? "Inactiva"
                        : "Activa"
                    }
                  />
                </section>
              </div>
            </div>

            <section
              style={{
                ...cardStyle(),
                marginTop: 22,
              }}
            >
              <div
                style={sectionHeaderStyle()}
              >
                <div>
                  <div
                    style={
                      sectionTitleStyle()
                    }
                  >
                    Canales de comunicación
                  </div>

                  <div
                    style={
                      sectionDescriptionStyle()
                    }
                  >
                    Aquí podrás conectar los canales que ShortBizAI utilizará para atender a tus clientes.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <Canal
                  titulo="Telegram"
                  descripcion={
                    telegramConectado
                      ? "Conectado"
                      : "Pendiente de conexión"
                  }
                  conectado={
                    telegramConectado
                  }
                />

                <Canal
                  titulo="WhatsApp"
                  descripcion="Próximamente"
                  conectado={false}
                />

                <Canal
                  titulo="Email"
                  descripcion="Próximamente"
                  conectado={false}
                />
              </div>
            </section>

            <div
              style={{
                marginTop: 24,
                paddingBottom: 30,
                color: "#6f5948",
                fontSize: 11,
                textAlign: "center",
              }}
            >
              ShortBizAI · Business OS
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        button,
        input {
          font-family: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        @media (max-width: 980px) {
          aside {
            width: 220px !important;
          }

          section > div {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          aside {
            display: none !important;
          }

          section {
            padding: 20px !important;
          }

          section > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function menuStyle(active: boolean) {
  return {
    width: "100%",
    height: 44,
    border: 0,
    borderRadius: 11,
    background: active
      ? "#2b1a10"
      : "transparent",
    color: active
      ? "#e8d5c0"
      : "#967b66",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "0 11px",
    fontSize: 13,
    fontWeight: active
      ? 800
      : 700,
    marginBottom: 4,
    textAlign: "left" as const,
  };
}

function prontoStyle() {
  return {
    marginLeft: "auto",
    color: "#765b47",
    fontSize: 9,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: ".05em",
  };
}

function cardStyle() {
  return {
    background: "#1d1009",
    border: "1px solid #392316",
    borderRadius: 18,
    padding: 22,
  };
}

function sectionHeaderStyle() {
  return {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  };
}

function sectionTitleStyle() {
  return {
    color: "#f2e8de",
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: "-.02em",
  };
}

function sectionDescriptionStyle() {
  return {
    color: "#8f7561",
    fontSize: 12,
    lineHeight: 1.5,
    marginTop: 5,
  };
}

function iconBoxStyle(
  background: string,
  color: string
) {
  return {
    width: 40,
    height: 40,
    borderRadius: 12,
    background,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 900,
    flexShrink: 0,
  };
}

function InfoSistema({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: 14,
        padding:
          "11px 0",
        borderBottom:
          "1px solid #302016",
      }}
    >
      <div
        style={{
          color: "#8f7561",
          fontSize: 12,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#d9cbbf",
          fontSize: 12,
          fontWeight: 700,
          textAlign:
            "right" as const,
          wordBreak:
            "break-word" as const,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Canal({
  titulo,
  descripcion,
  conectado,
}: {
  titulo: string;
  descripcion: string;
  conectado: boolean;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        background: "#21130c",
        border: conectado
          ? "1px solid #405437"
          : "1px solid #382216",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            color: "#eadfd2",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {titulo}
        </div>

        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: conectado
              ? "#8eb47c"
              : "#6e5542",
          }}
        />
      </div>

      <div
        style={{
          color: conectado
            ? "#9caf94"
            : "#7f6754",
          fontSize: 11,
          marginTop: 7,
        }}
      >
        {descripcion}
      </div>
    </div>
  );
}