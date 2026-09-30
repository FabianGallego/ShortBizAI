"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Empresa = {
  id: number;
  nombre: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  tipo: string | null;
  sistema_reservas: boolean | null;
  url_reservas: string | null;
  plan: string | null;
  activo: boolean | null;
  codigo_publico: string | null;
};

type Perfil = {
  user_id: string;
  nombre: string | null;
  rol: string | null;
  activo: boolean | null;
};

type FormularioEmpresa = {
  nombre: string;
  propietario: string;
  emailPropietario: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  tipo: string;
  plan: string;
  sistemaReservas: boolean;
  urlReservas: string;
};

const formularioInicial: FormularioEmpresa = {
  nombre: "",
  propietario: "",
  emailPropietario: "",
  telefono: "",
  ciudad: "New York",
  direccion: "",
  tipo: "Restaurante",
  plan: "free",
  sistemaReservas: true,
  urlReservas: "",
};

export default function AdminPage() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] =
    useState("short-food-ai");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [guardandoEmpresa, setGuardandoEmpresa] =
    useState(false);

  const [formulario, setFormulario] =
    useState<FormularioEmpresa>(formularioInicial);

  const [errorFormulario, setErrorFormulario] =
    useState("");

  const [mensajeFormulario, setMensajeFormulario] =
    useState("");

  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState<Empresa | null>(null);

  const [mostrarPropietario, setMostrarPropietario] =
    useState(false);

  const [nombrePropietario, setNombrePropietario] =
    useState("");

  const [emailPropietario, setEmailPropietario] =
    useState("");

  const [passwordPropietario, setPasswordPropietario] =
    useState("");

  const [creandoPropietario, setCreandoPropietario] =
    useState(false);

  const [errorPropietario, setErrorPropietario] =
    useState("");

  const [mensajePropietario, setMensajePropietario] =
    useState("");

  async function cargarPanel() {
    setCargando(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: perfilData, error: perfilError } =
        await supabase
          .from("perfiles")
          .select(
            "user_id, nombre, rol, activo"
          )
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

      if (
        perfilData.rol !== "super_admin" ||
        perfilData.activo === false
      ) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setPerfil(perfilData);

      const {
        data: empresasData,
        error: empresasError,
      } = await supabase
        .from("empresas")
        .select(
          `
          id,
          nombre,
          telefono,
          email,
          direccion,
          ciudad,
          tipo,
          sistema_reservas,
          url_reservas,
          plan,
          activo,
          codigo_publico
        `
        )
        .order("id", { ascending: false });

      if (empresasError) {
        throw empresasError;
      }

      setEmpresas(
        (empresasData || []) as Empresa[]
      );
    } catch (err: any) {
      console.error(
        "Error cargando administrador:",
        err
      );

      setError(
        err?.message ||
          "No fue posible cargar el panel administrativo."
      );
    } finally {
      setCargando(false);
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useEffect(() => {
    cargarPanel();
  }, []);

  function abrirFormulario() {
    setFormulario(formularioInicial);
    setErrorFormulario("");
    setMensajeFormulario("");
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    if (guardandoEmpresa) {
      return;
    }

    setMostrarFormulario(false);
    setErrorFormulario("");
    setMensajeFormulario("");
  }

  function cambiarCampo(
    campo: keyof FormularioEmpresa,
    valor: string | boolean
  ) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function crearEmpresa() {
    if (guardandoEmpresa) {
      return;
    }

    setErrorFormulario("");
    setMensajeFormulario("");

    const nombre = formulario.nombre.trim();
    const propietario =
      formulario.propietario.trim();

    const emailPropietario =
      formulario.emailPropietario
        .trim()
        .toLowerCase();

    const telefono =
      formulario.telefono.trim();

    const ciudad =
      formulario.ciudad.trim();

    const direccion =
      formulario.direccion.trim();

    const tipo =
      formulario.tipo.trim();

    const plan =
      formulario.plan.trim();

    const sistemaReservas =
      formulario.sistemaReservas;

    const urlReservas =
      formulario.urlReservas.trim();

    if (!nombre) {
      setErrorFormulario(
        "El nombre del negocio es obligatorio."
      );
      return;
    }

    if (!propietario) {
      setErrorFormulario(
        "El nombre del propietario es obligatorio."
      );
      return;
    }

    if (!emailPropietario) {
      setErrorFormulario(
        "El email del propietario es obligatorio."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailPropietario
      )
    ) {
      setErrorFormulario(
        "El email del propietario no es válido."
      );
      return;
    }

    if (!telefono) {
      setErrorFormulario(
        "El teléfono del negocio es obligatorio."
      );
      return;
    }

    if (!ciudad) {
      setErrorFormulario(
        "La ciudad es obligatoria."
      );
      return;
    }

    setGuardandoEmpresa(true);

    try {
      const codigoPublico =
        `sb-${crypto
          .randomUUID()
          .replace(/-/g, "")
          .slice(0, 12)}`;

      const {
        data,
        error,
      } = await supabase
        .from("empresas")
        .insert([
          {
            nombre,
            telefono,
            email: emailPropietario,
            direccion:
              direccion || null,
            ciudad,
            tipo:
              tipo || "Restaurante",
            sistema_reservas:
              sistemaReservas,
            url_reservas:
              urlReservas || null,
            plan:
              plan || "free",
            activo: true,
            codigo_publico:
              codigoPublico,
          },
        ])
        .select(
          `
          id,
          nombre,
          telefono,
          email,
          direccion,
          ciudad,
          tipo,
          sistema_reservas,
          url_reservas,
          plan,
          activo,
          codigo_publico
        `
        )
        .single();

      if (error) {
        console.error(
          "ERROR CREANDO EMPRESA:",
          error
        );

        throw error;
      }

      console.log(
        "EMPRESA CREADA:",
        data
      );

      setMensajeFormulario(
        "Empresa creada correctamente."
      );

      setFormulario(
        formularioInicial
      );

      await cargarPanel();

      setTimeout(() => {
        setMostrarFormulario(false);
        setMensajeFormulario("");
      }, 900);
    } catch (err: any) {
      console.error(
        "Error creando empresa:",
        err
      );

      setErrorFormulario(
        err?.message ||
          "No fue posible crear la empresa."
      );
    } finally {
      setGuardandoEmpresa(false);
    }
  }

  function abrirPropietario(
    empresa: Empresa
  ) {
    setEmpresaSeleccionada(empresa);
    setNombrePropietario("");
    setEmailPropietario(
      empresa.email || ""
    );
    setPasswordPropietario("");
    setErrorPropietario("");
    setMensajePropietario("");
    setMostrarPropietario(true);
  }

  function cerrarPropietario() {
    if (creandoPropietario) {
      return;
    }

    setMostrarPropietario(false);
    setEmpresaSeleccionada(null);
    setNombrePropietario("");
    setEmailPropietario("");
    setPasswordPropietario("");
    setErrorPropietario("");
    setMensajePropietario("");
  }

  async function crearPropietario() {
    if (
      creandoPropietario ||
      !empresaSeleccionada
    ) {
      return;
    }

    setErrorPropietario("");
    setMensajePropietario("");

    const nombre =
      nombrePropietario.trim();

    const email =
      emailPropietario
        .trim()
        .toLowerCase();

    const password =
      passwordPropietario;

    if (!nombre) {
      setErrorPropietario(
        "El nombre del propietario es obligatorio."
      );
      return;
    }

    if (!email) {
      setErrorPropietario(
        "El email del propietario es obligatorio."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setErrorPropietario(
        "El email del propietario no es válido."
      );
      return;
    }

    if (!password) {
      setErrorPropietario(
        "La contraseña es obligatoria."
      );
      return;
    }

    if (password.length < 8) {
      setErrorPropietario(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    setCreandoPropietario(true);

    try {
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
        throw new Error(
          "La sesión administrativa no está disponible."
        );
      }

      const response = await fetch(
        "/api/admin/crear-propietario",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            empresaId:
              empresaSeleccionada.id,
            nombre,
            email,
            password,
          }),
        }
      );

      const resultado =
        await response.json();

      if (!response.ok || !resultado.ok) {
        throw new Error(
          resultado.error ||
            "No fue posible crear el propietario."
        );
      }

      console.log(
        "PROPIETARIO CREADO:",
        resultado
      );

      setMensajePropietario(
        "Propietario creado correctamente. Ya puede iniciar sesión."
      );

      setPasswordPropietario("");

      setTimeout(() => {
        cerrarPropietario();
      }, 1800);
    } catch (err: any) {
      console.error(
        "ERROR CREANDO PROPIETARIO:",
        err
      );

      setErrorPropietario(
        err?.message ||
          "No fue posible crear el propietario."
      );
    } finally {
      setCreandoPropietario(false);
    }
  }

  if (cargando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f4f5",
          color: "#18181b",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        Cargando ShortBizAI...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f4f5",
        color: "#18181b",
      }}
    >
      <header
        style={{
          background: "#111827",
          color: "#ffffff",
          padding: "18px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            ShortBizAI
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "13px",
              color: "#d1d5db",
            }}
          >
            Panel de administración
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {perfil?.nombre ||
                "Administrador"}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              Super administrador
            </div>
          </div>

          <button
            onClick={cerrarSesion}
            style={{
              border:
                "1px solid #4b5563",
              background:
                "transparent",
              color:
                "#ffffff",
              borderRadius:
                "9px",
              padding:
                "9px 13px",
              cursor:
                "pointer",
            }}
          >
            Salir
          </button>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding:
            "30px 20px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "15px",
            flexWrap:
              "wrap",
            marginBottom:
              "25px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 800,
              }}
            >
              Superadministrador
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#71717a",
              }}
            >
              Administra los servicios y negocios de ShortBizAI desde un solo lugar.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              width: "100%",
              marginTop: "20px",
            }}
          >
            {[
              {
                id: "short-food-ai",
                icon: "🍔",
                nombre: "Short Food AI",
                descripcion: "Restaurantes y negocios de comida",
              },
              {
                id: "short-travel-ai",
                icon: "✈️",
                nombre: "Short Travel AI",
                descripcion: "Turismo y servicios de viaje",
              },
              {
                id: "short-barber-ai",
                icon: "💈",
                nombre: "Short Barber AI",
                descripcion: "Barberías y profesionales",
              },
            ].map((servicio) => (
              <button
                key={servicio.id}
                type="button"
                onClick={() => setServicioSeleccionado(servicio.id)}
                style={{
                  textAlign: "left",
                  border:
                    servicioSeleccionado === servicio.id
                      ? "2px solid #111827"
                      : "1px solid #e4e4e7",
                  background:
                    servicioSeleccionado === servicio.id
                      ? "#f8fafc"
                      : "#ffffff",
                  borderRadius: "16px",
                  padding: "18px",
                  cursor: "pointer",
                  boxShadow:
                    servicioSeleccionado === servicio.id
                      ? "0 8px 24px rgba(0,0,0,0.08)"
                      : "none",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                  {servicio.icon}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>
                  {servicio.nombre}
                </div>
                <div
                  style={{
                    marginTop: "5px",
                    color: "#71717a",
                    fontSize: "13px",
                  }}
                >
                  {servicio.descripcion}
                </div>
              </button>
            ))}
          </div>

          {servicioSeleccionado === "short-food-ai" ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginTop: "28px",
                width: "100%",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: 800,
                  }}
                >
                  Short Food AI
                </h2>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#71717a",
                  }}
                >
                  Restaurantes y negocios de comida registrados en la plataforma.
                </p>
              </div>

              <button
                onClick={abrirFormulario}
                style={{
                  border: "none",
                  borderRadius: "11px",
                  background: "#111827",
                  color: "#ffffff",
                  padding: "13px 18px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Crear empresa
              </button>
            </div>
          ) : (
            <div
              style={{
                marginTop: "28px",
                padding: "35px 25px",
                borderRadius: "16px",
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                textAlign: "center",
                width: "100%",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                {servicioSeleccionado === "short-travel-ai" ? "✈️" : "💈"}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800 }}>
                {servicioSeleccionado === "short-travel-ai"
                  ? "Short Travel AI"
                  : "Short Barber AI"}
              </div>
              <p
                style={{
                  margin: "8px auto 0",
                  maxWidth: "520px",
                  color: "#71717a",
                  fontSize: "14px",
                  lineHeight: 1.5,
                }}
              >
                Este servicio queda preparado para su propia administración.
                Primero dejamos completamente funcional Short Food AI.
              </p>
            </div>
          )}
        </div>

        {servicioSeleccionado === "short-food-ai" && (
          <div></div>
        )}

        {error && (
          <div
            style={{
              marginBottom:
                "22px",
              padding:
                "15px",
              borderRadius:
                "12px",
              background:
                "#fef2f2",
              border:
                "1px solid #fecaca",
              color:
                "#b91c1c",
            }}
          >
            <strong>
              Error:
            </strong>{" "}
            {error}
          </div>
        )}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap:
              "16px",
            marginBottom:
              "25px",
          }}
        >
          <div
            style={cardStyle}
          >
            <div
              style={labelStyle}
            >
              Empresas
            </div>

            <div
              style={numberStyle}
            >
              {empresas.length}
            </div>
          </div>

          <div
            style={cardStyle}
          >
            <div
              style={labelStyle}
            >
              Activas
            </div>

            <div
              style={numberStyle}
            >
              {
                empresas.filter(
                  (empresa) =>
                    empresa.activo
                ).length
              }
            </div>
          </div>

          <div
            style={cardStyle}
          >
            <div
              style={labelStyle}
            >
              Inactivas
            </div>

            <div
              style={numberStyle}
            >
              {
                empresas.filter(
                  (empresa) =>
                    !empresa.activo
                ).length
              }
            </div>
          </div>
        </div>

        <section
          style={{
            background:
              "#ffffff",
            borderRadius:
              "18px",
            border:
              "1px solid #e4e4e7",
            overflow:
              "hidden",
          }}
        >
          <div
            style={{
              padding:
                "20px 22px",
              borderBottom:
                "1px solid #e4e4e7",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize:
                  "19px",
                fontWeight:
                  800,
              }}
            >
              Negocios registrados
            </h2>
          </div>

          {empresas.length ===
          0 ? (
            <div
              style={{
                padding:
                  "55px 25px",
                textAlign:
                  "center",
                color:
                  "#71717a",
              }}
            >
              <div
                style={{
                  fontSize:
                    "40px",
                  marginBottom:
                    "12px",
                }}
              >
                🏢
              </div>

              <div
                style={{
                  fontSize:
                    "17px",
                  fontWeight:
                    700,
                  color:
                    "#3f3f46",
                }}
              >
                Todavía no hay
                empresas
              </div>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  fontSize:
                    "14px",
                }}
              >
                La primera empresa
                la crearemos desde
                este panel.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width:
                    "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "1050px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#fafafa",
                      textAlign:
                        "left",
                    }}
                  >
                    <th
                      style={
                        thStyle
                      }
                    >
                      Empresa
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Contacto
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Ciudad
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Tipo
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Plan
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Reservas
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Estado
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {empresas.map(
                    (empresa) => (
                      <tr
                        key={
                          empresa.id
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          <div
                            style={{
                              fontWeight:
                                700,
                            }}
                          >
                            {empresa.nombre ||
                              "Sin nombre"}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "3px",
                              fontSize:
                                "12px",
                              color:
                                "#71717a",
                            }}
                          >
                            ID:{" "}
                            {
                              empresa.id
                            }
                          </div>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <div>
                            {empresa.telefono ||
                              "—"}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "3px",
                              fontSize:
                                "12px",
                              color:
                                "#71717a",
                            }}
                          >
                            {empresa.email ||
                              "—"}
                          </div>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {empresa.ciudad ||
                            "—"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {empresa.tipo ||
                            "—"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {empresa.plan ||
                            "—"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "12px",
                              fontWeight:
                                700,
                              background:
                                empresa.sistema_reservas
                                  ? "#dbeafe"
                                  : "#f4f4f5",
                              color:
                                empresa.sistema_reservas
                                  ? "#1d4ed8"
                                  : "#52525b",
                            }}
                          >
                            {empresa.sistema_reservas
                              ? "ShortBizAI"
                              : "Externo"}
                          </span>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "12px",
                              fontWeight:
                                700,
                              background:
                                empresa.activo
                                  ? "#dcfce7"
                                  : "#f4f4f5",
                              color:
                                empresa.activo
                                  ? "#166534"
                                  : "#52525b",
                            }}
                          >
                            {empresa.activo
                              ? "Activa"
                              : "Inactiva"}
                          </span>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <button
                            onClick={() =>
                              abrirPropietario(
                                empresa
                              )
                            }
                            style={{
                              border:
                                "1px solid #d4d4d8",
                              background:
                                "#ffffff",
                              borderRadius:
                                "8px",
                              padding:
                                "8px 11px",
                              cursor:
                                "pointer",
                              fontWeight:
                                600,
                            }}
                          >
                            Administrar
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {mostrarFormulario && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex:
              1000,
            background:
              "rgba(0,0,0,0.55)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
            overflowY:
              "auto",
          }}
        >
          <div
            style={{
              width:
                "100%",
              maxWidth:
                "720px",
              background:
                "#ffffff",
              borderRadius:
                "20px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.25)",
              overflow:
                "hidden",
              margin:
                "20px 0",
            }}
          >
            <div
              style={{
                background:
                  "#111827",
                color:
                  "#ffffff",
                padding:
                  "22px 24px",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap:
                  "15px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      "21px",
                    fontWeight:
                      800,
                  }}
                >
                  Crear empresa
                </div>

                <div
                  style={{
                    marginTop:
                      "4px",
                    fontSize:
                      "13px",
                    color:
                      "#d1d5db",
                  }}
                >
                  Registra un nuevo
                  negocio en
                  ShortBizAI.
                </div>
              </div>

              <button
                onClick={
                  cerrarFormulario
                }
                disabled={
                  guardandoEmpresa
                }
                style={{
                  border:
                    "none",
                  background:
                    "rgba(255,255,255,0.1)",
                  color:
                    "#ffffff",
                  width:
                    "36px",
                  height:
                    "36px",
                  borderRadius:
                    "9px",
                  cursor:
                    guardandoEmpresa
                      ? "not-allowed"
                      : "pointer",
                  fontSize:
                    "20px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding:
                  "24px",
              }}
            >
              {errorFormulario && (
                <div
                  style={{
                    marginBottom:
                      "18px",
                    padding:
                      "13px 15px",
                    borderRadius:
                      "10px",
                    background:
                      "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color:
                      "#b91c1c",
                    fontSize:
                      "14px",
                  }}
                >
                  {errorFormulario}
                </div>
              )}

              {mensajeFormulario && (
                <div
                  style={{
                    marginBottom:
                      "18px",
                    padding:
                      "13px 15px",
                    borderRadius:
                      "10px",
                    background:
                      "#f0fdf4",
                    border:
                      "1px solid #bbf7d0",
                    color:
                      "#166534",
                    fontSize:
                      "14px",
                    fontWeight:
                      600,
                  }}
                >
                  ✅{" "}
                  {
                    mensajeFormulario
                  }
                </div>
              )}

              <div
                style={{
                  marginBottom:
                    "18px",
                  fontSize:
                    "16px",
                  fontWeight:
                    800,
                }}
              >
                🏢 Información del
                negocio
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap:
                    "16px",
                }}
              >
                <Campo
                  label="Nombre del negocio *"
                  value={
                    formulario.nombre
                  }
                  onChange={(
                    valor
                  ) =>
                    cambiarCampo(
                      "nombre",
                      valor
                    )
                  }
                  placeholder="Ej. Gurys Bakery"
                />

                <Campo
                  label="Tipo de negocio"
                  value={
                    formulario.tipo
                  }
                  onChange={(
                    valor
                  ) =>
                    cambiarCampo(
                      "tipo",
                      valor
                    )
                  }
                  placeholder="Restaurante"
                />

                <Campo
                  label="Nombre del propietario *"
                  value={
                    formulario.propietario
                  }
                  onChange={(
                    valor
                  ) =>
                    cambiarCampo(
                      "propietario",
                      valor
                    )
                  }
                  placeholder="Nombre completo"
                />

                <Campo
                  label="Email del propietario *"
                  type="email"
                  value={
                    formulario.emailPropietario
                  }
                  onChange={(
                    valor
                  ) =>
                    cambiarCampo(
                      "emailPropietario",
                      valor
                    )
                  }
                  placeholder="owner@restaurant.com"
                />

                <Campo
                  label="Teléfono *"
                  value={
                    formulario.telefono
                  }
                  onChange={(
                    valor
                  ) =>
                    cambiarCampo(
                      "telefono",
                      valor
                    )
                  }
                  placeholder="(929) 000-0000"
                />

                <Campo
                  label="Ciudad *"
                  value={
                    formulario.ciudad
                  }
                  onChange={(
                    valor
                  ) =>
                    cambiarCampo(
                      "ciudad",
                      valor
                    )
                  }
                  placeholder="New York"
                />

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <Campo
                    label="Dirección"
                    value={
                      formulario.direccion
                    }
                    onChange={(
                      valor
                    ) =>
                      cambiarCampo(
                        "direccion",
                        valor
                      )
                    }
                    placeholder="Dirección del negocio"
                  />
                </div>

                <Campo
                  label="Plan"
                  value={
                    formulario.plan
                  }
                  onChange={(
                    valor
                  ) =>
                    cambiarCampo(
                      "plan",
                      valor
                    )
                  }
                  placeholder="free"
                />

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    minHeight:
                      "48px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "9px",
                      fontSize:
                        "14px",
                      fontWeight:
                        700,
                      cursor:
                        "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        formulario.sistemaReservas
                      }
                      onChange={(
                        e
                      ) =>
                        cambiarCampo(
                          "sistemaReservas",
                          e.target
                            .checked
                        )
                      }
                      style={{
                        width:
                          "18px",
                        height:
                          "18px",
                      }}
                    />

                    Sistema de
                    reservas
                    ShortBizAI
                  </label>
                </div>

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <Campo
                    label="URL externa de reservas (opcional)"
                    value={
                      formulario.urlReservas
                    }
                    onChange={(
                      valor
                    ) =>
                      cambiarCampo(
                        "urlReservas",
                        valor
                      )
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop:
                    "22px",
                  padding:
                    "14px 16px",
                  borderRadius:
                    "11px",
                  background:
                    "#f4f4f5",
                  border:
                    "1px solid #e4e4e7",
                  color:
                    "#52525b",
                  fontSize:
                    "13px",
                  lineHeight:
                    1.5,
                }}
              >
                <strong>
                  Propietario:
                </strong>{" "}
                después de crear la
                empresa podrás crear
                su acceso desde
                <strong>
                  {" "}
                  Administrar
                </strong>
                .
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "10px",
                  marginTop:
                    "24px",
                  flexWrap:
                    "wrap",
                }}
              >
                <button
                  onClick={
                    cerrarFormulario
                  }
                  disabled={
                    guardandoEmpresa
                  }
                  style={{
                    border:
                      "1px solid #d4d4d8",
                    background:
                      "#ffffff",
                    color:
                      "#27272a",
                    borderRadius:
                      "10px",
                    padding:
                      "12px 17px",
                    fontWeight:
                      700,
                    cursor:
                      guardandoEmpresa
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={
                    crearEmpresa
                  }
                  disabled={
                    guardandoEmpresa
                  }
                  style={{
                    border:
                      "none",
                    background:
                      guardandoEmpresa
                        ? "#6b7280"
                        : "#111827",
                    color:
                      "#ffffff",
                    borderRadius:
                      "10px",
                    padding:
                      "12px 19px",
                    fontWeight:
                      700,
                    cursor:
                      guardandoEmpresa
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {guardandoEmpresa
                    ? "Creando..."
                    : "Crear empresa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarPropietario &&
        empresaSeleccionada && (
          <div
            style={{
              position:
                "fixed",
              inset: 0,
              zIndex:
                1100,
              background:
                "rgba(0,0,0,0.55)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding:
                "20px",
            }}
          >
            <div
              style={{
                width:
                  "100%",
                maxWidth:
                  "560px",
                background:
                  "#ffffff",
                borderRadius:
                  "20px",
                boxShadow:
                  "0 25px 70px rgba(0,0,0,0.25)",
                overflow:
                  "hidden",
              }}
            >
              <div
                style={{
                  background:
                    "#111827",
                  color:
                    "#ffffff",
                  padding:
                    "22px 24px",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap:
                    "15px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize:
                        "21px",
                      fontWeight:
                        800,
                    }}
                  >
                    👤 Propietario
                  </div>

                  <div
                    style={{
                      marginTop:
                        "4px",
                      fontSize:
                        "13px",
                      color:
                        "#d1d5db",
                    }}
                  >
                    {
                      empresaSeleccionada.nombre ||
                      "Empresa"
                    }
                  </div>
                </div>

                <button
                  onClick={
                    cerrarPropietario
                  }
                  disabled={
                    creandoPropietario
                  }
                  style={{
                    border:
                      "none",
                    background:
                      "rgba(255,255,255,0.1)",
                    color:
                      "#ffffff",
                    width:
                      "36px",
                    height:
                      "36px",
                    borderRadius:
                      "9px",
                    cursor:
                      creandoPropietario
                        ? "not-allowed"
                        : "pointer",
                    fontSize:
                      "20px",
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  padding:
                    "24px",
                }}
              >
                {errorPropietario && (
                  <div
                    style={{
                      marginBottom:
                        "18px",
                      padding:
                        "13px 15px",
                      borderRadius:
                        "10px",
                      background:
                        "#fef2f2",
                      border:
                        "1px solid #fecaca",
                      color:
                        "#b91c1c",
                      fontSize:
                        "14px",
                    }}
                  >
                    {errorPropietario}
                  </div>
                )}

                {mensajePropietario && (
                  <div
                    style={{
                      marginBottom:
                        "18px",
                      padding:
                        "13px 15px",
                      borderRadius:
                        "10px",
                      background:
                        "#f0fdf4",
                      border:
                        "1px solid #bbf7d0",
                      color:
                        "#166534",
                      fontSize:
                        "14px",
                      fontWeight:
                        600,
                    }}
                  >
                    ✅{" "}
                    {
                      mensajePropietario
                    }
                  </div>
                )}

                <div
                  style={{
                    marginBottom:
                      "20px",
                    padding:
                      "15px",
                    borderRadius:
                      "12px",
                    background:
                      "#f4f4f5",
                    border:
                      "1px solid #e4e4e7",
                    fontSize:
                      "13px",
                    lineHeight:
                      1.5,
                    color:
                      "#52525b",
                  }}
                >
                  El administrador establecerá
                  la contraseña inicial del
                  propietario. El propietario
                  podrá usar este correo y
                  contraseña para entrar a
                  ShortBizAI.
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gap:
                      "17px",
                  }}
                >
                  <Campo
                    label="Nombre del propietario *"
                    value={
                      nombrePropietario
                    }
                    onChange={
                      setNombrePropietario
                    }
                    placeholder="Nombre completo"
                  />

                  <Campo
                    label="Email de acceso *"
                    type="email"
                    value={
                      emailPropietario
                    }
                    onChange={
                      setEmailPropietario
                    }
                    placeholder="owner@restaurant.com"
                  />

                  <Campo
                    label="Contraseña inicial *"
                    type="password"
                    value={
                      passwordPropietario
                    }
                    onChange={
                      setPasswordPropietario
                    }
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      "10px",
                    fontSize:
                      "12px",
                    color:
                      "#71717a",
                  }}
                >
                  La contraseña debe tener
                  al menos 8 caracteres.
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    gap:
                      "10px",
                    marginTop:
                      "25px",
                  }}
                >
                  <button
                    onClick={
                      cerrarPropietario
                    }
                    disabled={
                      creandoPropietario
                    }
                    style={{
                      border:
                        "1px solid #d4d4d8",
                      background:
                        "#ffffff",
                      color:
                        "#27272a",
                      borderRadius:
                        "10px",
                      padding:
                        "12px 17px",
                      fontWeight:
                        700,
                      cursor:
                        creandoPropietario
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={
                      crearPropietario
                    }
                    disabled={
                      creandoPropietario
                    }
                    style={{
                      border:
                        "none",
                      background:
                        creandoPropietario
                          ? "#6b7280"
                          : "#111827",
                      color:
                        "#ffffff",
                      borderRadius:
                        "10px",
                      padding:
                        "12px 19px",
                      fontWeight:
                        700,
                      cursor:
                        creandoPropietario
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {creandoPropietario
                      ? "Creando acceso..."
                      : "Crear acceso"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    valor: string
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label
      style={{
        display:
          "block",
      }}
    >
      <div
        style={{
          marginBottom:
            "7px",
          fontSize:
            "13px",
          fontWeight:
            700,
          color:
            "#3f3f46",
        }}
      >
        {label}
      </div>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        style={{
          width:
            "100%",
          boxSizing:
            "border-box",
          border:
            "1px solid #d4d4d8",
          borderRadius:
            "9px",
          padding:
            "11px 12px",
          fontSize:
            "14px",
          outline:
            "none",
          background:
            "#ffffff",
          color:
            "#18181b",
        }}
      />
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "22px",
  border: "1px solid #e4e4e7",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#71717a",
};

const numberStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "30px",
  fontWeight: 800,
};

const thStyle: React.CSSProperties = {
  padding: "13px 16px",
  fontSize: "12px",
  fontWeight: 800,
  color: "#52525b",
  borderBottom:
    "1px solid #e4e4e7",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "16px",
  fontSize: "14px",
  borderBottom:
    "1px solid #f0f0f1",
  verticalAlign: "middle",
};