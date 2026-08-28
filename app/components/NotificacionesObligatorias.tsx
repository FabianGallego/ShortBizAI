"use client";

import { useEffect, useRef, useState } from "react";

interface NotificacionesObligatoriasProps {
  children: React.ReactNode;
  onGranted?: () => void | Promise<void>;
}

export default function NotificacionesObligatorias({
  children,
  onGranted,
}: NotificacionesObligatoriasProps) {
  const [permiso, setPermiso] =
    useState<NotificationPermission | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [activando, setActivando] =
    useState(false);

  // Guardamos la función sin provocar
  // que el useEffect se ejecute nuevamente
  const onGrantedRef = useRef(onGranted);

  useEffect(() => {
    onGrantedRef.current = onGranted;
  }, [onGranted]);

  // =====================================================
  // COMPROBAR PERMISO AL CARGAR
  // =====================================================

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermiso("denied");
      setCargando(false);
      return;
    }

    const permisoActual =
      Notification.permission;

    setPermiso(permisoActual);
    setCargando(false);

    // ===================================================
    // SI YA ESTÁ CONCEDIDO
    // REGISTRAR EL PUSH EXISTENTE UNA SOLA VEZ
    // ===================================================

    if (
      permisoActual === "granted" &&
      onGrantedRef.current
    ) {
      Promise.resolve(
        onGrantedRef.current()
      ).catch((error) => {
        console.error(
          "Error registrando notificaciones:",
          error
        );
      });
    }
  }, []);

  // =====================================================
  // ACTIVAR NOTIFICACIONES
  // =====================================================

  const activarNotificaciones =
    async () => {
      if (!("Notification" in window)) {
        alert(
          "Tu navegador no permite notificaciones. Abre esta página en Google Chrome."
        );
        return;
      }

      try {
        setActivando(true);

        const resultado =
          await Notification.requestPermission();

        setPermiso(resultado);

        // ===============================================
        // PERMISO CONCEDIDO
        // ===============================================

        if (
          resultado === "granted" &&
          onGrantedRef.current
        ) {
          await onGrantedRef.current();
        }
      } catch (error) {
        console.error(
          "Error solicitando permiso:",
          error
        );
      } finally {
        setActivando(false);
      }
    };

  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {
    return null;
  }

  // =====================================================
  // PERMISO CONCEDIDO
  // =====================================================

  if (permiso === "granted") {
    return <>{children}</>;
  }

  // =====================================================
  // PERMISO NO CONCEDIDO
  // BLOQUEAR LA PÁGINA
  // =====================================================

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        <div className="text-6xl mb-6">
          🔔
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Activa las notificaciones
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Para continuar con tu reserva debes
          activar las notificaciones.
          Las utilizaremos para enviarte
          información importante sobre tu reserva.
        </p>

        <button
          onClick={activarNotificaciones}
          disabled={activando}
          className="w-full rounded-xl bg-red-600 px-6 py-4 text-lg font-bold text-white hover:bg-red-700 transition disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {activando
            ? "Activando..."
            : "🔔 Activar notificaciones"}
        </button>

        {permiso === "denied" && (
          <div className="mt-6 rounded-xl bg-gray-100 p-4 text-left">

            <p className="font-semibold text-gray-900 mb-2">
              Las notificaciones están bloqueadas.
            </p>

            <p className="text-sm text-gray-600">
              Para continuar, debes permitir las
              notificaciones desde la configuración
              de permisos de este sitio en tu navegador.
            </p>

          </div>
        )}

        {permiso === "default" && (
          <p className="mt-4 text-sm text-gray-500">
            Pulsa el botón para permitir las
            notificaciones.
          </p>
        )}

      </div>
    </main>
  );
}