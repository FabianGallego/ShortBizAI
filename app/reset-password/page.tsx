"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sesionValida, setSesionValida] = useState(false);

  useEffect(() => {
    let activo = true;

    const verificarSesion = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!activo) return;

        if (session) {
          setSesionValida(true);
        } else {
          setError(
            "El enlace de recuperación no es válido o ya expiró. Solicita un nuevo enlace."
          );
        }
      } catch (err) {
        console.error("ERROR VERIFICANDO SESIÓN:", err);

        if (activo) {
          setError(
            "No fue posible verificar el enlace de recuperación."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    verificarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!activo) return;

      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN"
      ) {
        if (session) {
          setSesionValida(true);
          setError("");
          setCargando(false);
        }
      }
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function cambiarPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMensaje("");

    if (!nuevaPassword || !confirmarPassword) {
      setError("Debes completar los dos campos.");
      return;
    }

    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setGuardando(true);

      const { error: updateError } =
        await supabase.auth.updateUser({
          password: nuevaPassword,
        });

      if (updateError) {
        throw updateError;
      }

      setMensaje(
        "✅ Contraseña actualizada correctamente. Ahora puedes iniciar sesión."
      );

      setNuevaPassword("");
      setConfirmarPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("ERROR ACTUALIZANDO PASSWORD:", err);

      setError(
        err?.message ||
          "No fue posible actualizar la contraseña."
      );
    } finally {
      setGuardando(false);
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
          background: "#f5f5f5",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#fff",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              marginBottom: 12,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            ShortBizAI
          </h1>

          <p style={{ color: "#666" }}>
            Verificando el enlace de recuperación...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            ShortBizAI
          </h1>

          <p
            style={{
              marginTop: 8,
              color: "#666",
              fontSize: 15,
            }}
          >
            Recuperar contraseña
          </p>
        </div>

        {!sesionValida ? (
          <>
            <div
              style={{
                background: "#fff3f3",
                border: "1px solid #ffcaca",
                color: "#b42318",
                padding: 14,
                borderRadius: 10,
                fontSize: 14,
                lineHeight: 1.5,
                marginBottom: 20,
              }}
            >
              {error ||
                "El enlace de recuperación no es válido o ya expiró."}
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 10,
                padding: "13px 16px",
                background: "#111827",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Volver al inicio de sesión
            </button>
          </>
        ) : (
          <form onSubmit={cambiarPassword}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Nueva contraseña
            </label>

            <input
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              disabled={guardando}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                fontSize: 16,
                marginBottom: 18,
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Confirmar contraseña
            </label>

            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(e.target.value)
              }
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
              disabled={guardando}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                fontSize: 16,
                marginBottom: 18,
              }}
            />

            {error && (
              <div
                style={{
                  background: "#fff3f3",
                  border: "1px solid #ffcaca",
                  color: "#b42318",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {mensaje && (
              <div
                style={{
                  background: "#ecfdf3",
                  border: "1px solid #abefc6",
                  color: "#067647",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              disabled={guardando}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 10,
                padding: "14px 16px",
                background: guardando ? "#9ca3af" : "#111827",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: guardando ? "not-allowed" : "pointer",
              }}
            >
              {guardando
                ? "Actualizando..."
                : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}