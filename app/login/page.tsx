"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function iniciarSesion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMensaje("");
    setCargando(true);

    try {
      await supabase.auth.signOut();

      const correo = email.trim().toLowerCase();

      if (!correo || !password) {
        throw new Error("Ingresa tu email y contraseña.");
      }

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: correo,
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.user) {
        throw new Error("No se pudo iniciar la sesión.");
      }

      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("user_id, nombre, rol, activo")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (perfilError) {
        throw perfilError;
      }

      if (!perfil) {
        await supabase.auth.signOut();

        throw new Error(
          "Tu usuario todavía no tiene un perfil configurado en ShortBizAI."
        );
      }

      if (perfil.activo === false) {
        await supabase.auth.signOut();

        throw new Error(
          "Tu cuenta está desactivada. Contacta al administrador."
        );
      }

      if (perfil.rol === "super_admin") {
        window.location.href = "/admin";
        return;
      }

      if (
        perfil.rol === "propietario" ||
        perfil.rol === "usuario"
      ) {
        window.location.href = "/dashboard";
        return;
      }

      await supabase.auth.signOut();

      throw new Error(
        "Tu usuario no tiene un rol válido configurado."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "No fue posible iniciar sesión. Inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }

  async function recuperarContrasena() {
    setError("");
    setMensaje("");

    const correo = email.trim().toLowerCase();

    if (!correo) {
      setError(
        "Primero escribe tu email para enviarte el enlace de recuperación."
      );
      return;
    }

    setRecuperando(true);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(correo, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (resetError) {
        throw resetError;
      }

      setMensaje(
        "Te enviamos un correo para recuperar tu contraseña. Revisa también la carpeta de spam."
      );
    } catch (err: any) {
      console.error(
        "ERROR RECUPERANDO CONTRASEÑA:",
        err
      );

      setError(
        err?.message ||
          "No fue posible enviar el correo de recuperación."
      );
    } finally {
      setRecuperando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "36px",
          boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              margin: "0 auto 16px",
              borderRadius: "16px",
              background: "#111827",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: 800,
            }}
          >
            S
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            ShortBizAI
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Ingresa a tu cuenta
          </p>
        </div>

        <form onSubmit={iniciarSesion}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#374151",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 15px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              fontSize: "16px",
              outline: "none",
              marginBottom: "18px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#374151",
            }}
          >
            Contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 15px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              fontSize: "16px",
              outline: "none",
              marginBottom: "10px",
            }}
          />

          <div
            style={{
              textAlign: "right",
              marginBottom: "20px",
            }}
          >
            <button
              type="button"
              onClick={recuperarContrasena}
              disabled={recuperando}
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                fontSize: "14px",
                fontWeight: 700,
                cursor: recuperando
                  ? "default"
                  : "pointer",
                padding: 0,
              }}
            >
              {recuperando
                ? "Enviando..."
                : "¿Olvidaste tu contraseña?"}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {mensaje && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#047857",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "12px",
              padding: "15px",
              background: cargando
                ? "#6b7280"
                : "#111827",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: cargando
                ? "not-allowed"
                : "pointer",
            }}
          >
            {cargando
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>
        </form>

        <p
          style={{
            margin: "24px 0 0",
            textAlign: "center",
            fontSize: "12px",
            color: "#9ca3af",
          }}
        >
          ShortBizAI · AAF Business System
        </p>
      </div>
    </main>
  );
}