"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Empresa = {
  id: number | string;
  nombre: string;
};

type Mensaje = {
  id: number;
  tipo: "ia" | "usuario";
  texto: string;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

function convertirFecha(fecha: string) {
  if (!fecha) return "";

  const partes = fecha.split("-");

  if (partes.length !== 3) return fecha;

  const [anio, mes, dia] = partes;

  return `${dia}/${mes}/${anio}`;
}

function convertirFechaIngles(fecha: string) {
  if (!fecha) return "";

  const partes = fecha.split("-");

  if (partes.length !== 3) return fecha;

  const [anio, mes, dia] = partes;

  return `${mes}/${dia}/${anio}`;
}

function convertirHora(hora: string) {
  if (!hora) return "";

  const [horas, minutos] = hora.split(":");

  if (!horas || !minutos) return hora;

  let h = Number(horas);

  const periodo = h >= 12 ? "PM" : "AM";

  h = h % 12;

  if (h === 0) h = 12;

  return `${h}:${minutos} ${periodo}`;
}

function fechaEsValida(fecha: string) {
  const partes = fecha.split("-");

  if (partes.length !== 3) return false;

  const [anioTexto, mesTexto, diaTexto] = partes;

  const anio = Number(anioTexto);
  const mes = Number(mesTexto);
  const dia = Number(diaTexto);

  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(dia)
  ) {
    return false;
  }

  if (mes < 1 || mes > 12) return false;

  if (dia < 1 || dia > 31) return false;

  const fechaObjeto = new Date(
    anio,
    mes - 1,
    dia
  );

  return (
    fechaObjeto.getFullYear() === anio &&
    fechaObjeto.getMonth() === mes - 1 &&
    fechaObjeto.getDate() === dia
  );
}

export default function AgenteAAFPage() {
  /*
   * ============================================================
   * EMPRESA
   * ============================================================
   */

  const [empresaId, setEmpresaId] =
    useState<string | null>(null);

  const [empresa, setEmpresa] =
    useState<Empresa | null>(null);

  const [cargandoEmpresa, setCargandoEmpresa] =
    useState(true);

  /*
   * ============================================================
   * IDIOMA
   * ============================================================
   */

  const [idioma, setIdioma] =
    useState<"es" | "en">("es");

  /*
   * ============================================================
   * CHATBOT
   * ============================================================
   */

  const [mensajes, setMensajes] =
    useState<Mensaje[]>([]);

  const [entrada, setEntrada] =
    useState("");

  const [paso, setPaso] = useState<
    | "inicio"
    | "nombre"
    | "telefono"
    | "fecha"
    | "hora"
    | "personas"
    | "confirmacion"
    | "finalizado"
  >("inicio");

  /*
   * ============================================================
   * DATOS DE RESERVA
   * ============================================================
   */

  const [nombre, setNombre] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [fecha, setFecha] =
    useState("");

  const [hora, setHora] =
    useState("");

  const [personas, setPersonas] =
    useState("");

  /*
   * ============================================================
   * ESTADOS DE RESERVA
   * ============================================================
   */

  const [guardando, setGuardando] =
    useState(false);

  const [mensajeExito, setMensajeExito] =
    useState("");

  const [errorReserva, setErrorReserva] =
    useState("");

  const [reservaCreada, setReservaCreada] =
    useState(false);

  /*
   * ============================================================
   * PUSH / NOTIFICACIONES
   * ============================================================
   */

  const [pushEndpoint, setPushEndpoint] =
    useState<string | null>(null);

  const [notificacionesActivas, setNotificacionesActivas] =
    useState(false);

  const [activandoNotificaciones, setActivandoNotificaciones] =
    useState(false);

  const [errorNotificaciones, setErrorNotificaciones] =
    useState("");

  /*
   * ============================================================
   * REFERENCIA CHAT
   * ============================================================
   */

  const mensajesRef =
    useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * TEXTOS
   * ============================================================
   */

  const textos = {
    es: {
      cargando:
        "Cargando...",

      bienvenida:
        "Bienvenidos a",

      descripcion:
        "Disfruta de nuestro exquisito menú y reserva tu mesa de manera rápida y sencilla.",

      reservarTitulo:
        "Para reservar, activa las notificaciones.",

      activarBoton:
        "🔔 Activar notificaciones",

      activando:
        "Activando...",

      saludo:
        "¡Hola! 👋 Será un placer ayudarte a reservar tu mesa.",

      preguntaNombre:
        "¿A nombre de quién deseas hacer la reserva?",

      preguntaTelefono:
        "Perfecto. ¿Cuál es tu número de teléfono?",

      preguntaFecha:
        "Gracias. ¿Para qué fecha deseas reservar?",

      preguntaHora:
        "Perfecto. ¿A qué hora deseas reservar?",

      preguntaPersonas:
        "¿Para cuántas personas será la reserva?",

      fechaInvalida:
        "Por favor indícame una fecha válida.",

      horaInvalida:
        "Por favor indícame una hora válida.",

      personasInvalidas:
        "Por favor indícame un número válido de personas.",

      telefonoInvalido:
        "El número de teléfono debe tener 10 dígitos.",

      resumen:
        "Perfecto. Tengo todos los datos de tu reserva:",

      resumenNombre:
        "Nombre",

      resumenTelefono:
        "Teléfono",

      resumenFecha:
        "Fecha",

      resumenHora:
        "Hora",

      resumenPersonas:
        "Personas",

      confirmar:
        "¿Deseas que envíe esta solicitud al restaurante?",

      si:
        "Sí, enviar reserva",

      no:
        "No, quiero corregir",

      reservaEnviada:
        "🎉 ¡Listo! Tu solicitud de reserva fue enviada al restaurante.",

      esperando:
        "El restaurante debe confirmar o cancelar tu solicitud. Te avisaremos directamente en este dispositivo.",

      nuevaReserva:
        "Hacer otra reserva",

      notificacionesActivadas:
        "Notificaciones activadas",

      dispositivoListo:
        "Este dispositivo está listo para recibir la confirmación o cancelación de tu reserva.",

      navegadorNoSoporta:
        "Este navegador no soporta notificaciones.",

      pushNoSoporta:
        "Este navegador no soporta notificaciones Push.",

      configuracionFaltante:
        "No se encontró la configuración de notificaciones.",

      registrarError:
        "No pudimos registrar este dispositivo. Inténtalo nuevamente.",

      activarError:
        "No pudimos activar las notificaciones. Inténtalo nuevamente.",

      errorNotificaciones:
        "Debes permitir las notificaciones para recibir la confirmación o cancelación de tu reserva.",

      empresaNoIdentificada:
        "No pudimos identificar el restaurante.",

      errorGuardar:
        "No pude guardar la reserva. Por favor inténtalo nuevamente.",
    },

    en: {
      cargando:
        "Loading...",

      bienvenida:
        "Welcome to",

      descripcion:
        "Enjoy our exquisite menu and reserve your table quickly and easily.",

      reservarTitulo:
        "To make a reservation, enable notifications.",

      activarBoton:
        "🔔 Enable notifications",

      activando:
        "Activating...",

      saludo:
        "Hello! 👋 I'll be happy to help you reserve your table.",

      preguntaNombre:
        "What name should I put the reservation under?",

      preguntaTelefono:
        "Perfect. What is your phone number?",

      preguntaFecha:
        "Thank you. What date would you like to reserve?",

      preguntaHora:
        "Perfect. What time would you like to reserve?",

      preguntaPersonas:
        "How many people will be joining?",

      fechaInvalida:
        "Please provide a valid date.",

      horaInvalida:
        "Please provide a valid time.",

      personasInvalidas:
        "Please provide a valid number of people.",

      telefonoInvalido:
        "The phone number must have 10 digits.",

      resumen:
        "Perfect. I have all the details for your reservation:",

      resumenNombre:
        "Name",

      resumenTelefono:
        "Phone",

      resumenFecha:
        "Date",

      resumenHora:
        "Time",

      resumenPersonas:
        "People",

      confirmar:
        "Would you like me to send this request to the restaurant?",

      si:
        "Yes, send reservation",

      no:
        "No, I want to correct it",

      reservaEnviada:
        "🎉 Done! Your reservation request has been sent to the restaurant.",

      esperando:
        "The restaurant must confirm or cancel your request. We will notify you directly on this device.",

      nuevaReserva:
        "Make another reservation",

      notificacionesActivadas:
        "Notifications enabled",

      dispositivoListo:
        "This device is ready to receive your reservation confirmation or cancellation.",

      navegadorNoSoporta:
        "This browser does not support notifications.",

      pushNoSoporta:
        "This browser does not support Push notifications.",

      configuracionFaltante:
        "Notification configuration was not found.",

      registrarError:
        "We could not register this device. Please try again.",

      activarError:
        "We could not enable notifications. Please try again.",

      errorNotificaciones:
        "You must allow notifications to receive your reservation confirmation or cancellation.",

      empresaNoIdentificada:
        "We could not identify the restaurant.",

      errorGuardar:
        "We could not save the reservation. Please try again.",
    },
  };

  const t = textos[idioma];

  /*
   * ============================================================
   * OBTENER EMPRESA ID DESDE LA URL
   *
   * NO usamos useSearchParams().
   * Esto evita el problema de prerenderizado de Next.js.
   * ============================================================
   */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const id =
      params.get("empresaId");

    setEmpresaId(id);
  }, []);

  /*
   * ============================================================
   * BUSCAR EMPRESA EN SUPABASE
   * ============================================================
   */

  useEffect(() => {
    async function cargarEmpresa() {
      if (!empresaId) {
        setEmpresa(null);
        setCargandoEmpresa(false);
        return;
      }

      setCargandoEmpresa(true);

      const {
        data,
        error,
      } =
        await supabase
          .from("empresas")
          .select("id, nombre")
          .eq("id", empresaId)
          .maybeSingle();

      if (error) {
        console.error(
          "ERROR BUSCANDO EMPRESA:",
          error
        );

        setEmpresa(null);
      } else {
        setEmpresa(data);
      }

      setCargandoEmpresa(false);
    }

    cargarEmpresa();
  }, [empresaId]);

  /*
   * ============================================================
   * INICIAR CHATBOT
   * ============================================================
   */

  useEffect(() => {
    if (!empresa) return;

    setMensajes([
      {
        id: Date.now(),
        tipo: "ia",
        texto:
          `${t.saludo}\n\n` +
          `${t.preguntaNombre}`,
      },
    ]);

    setPaso("nombre");
  }, [empresa, idioma]);

  /*
   * ============================================================
   * AUTO SCROLL DEL CHAT
   * ============================================================
   */

  useEffect(() => {
    if (!mensajesRef.current) return;

    mensajesRef.current.scrollTo({
      top:
        mensajesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mensajes]);

  /*
   * ============================================================
   * AGREGAR MENSAJE
   * ============================================================
   */

  function agregarMensaje(
    tipo: "ia" | "usuario",
    texto: string
  ) {
    setMensajes(
      (actuales) => [
        ...actuales,
        {
          id:
            Date.now() +
            Math.random(),
          tipo,
          texto,
        },
      ]
    );
  }

  /*
   * ============================================================
   * ACTIVAR NOTIFICACIONES PUSH
   * ============================================================
   */

  async function registrarNotificaciones() {
    if (activandoNotificaciones) {
      return;
    }

    setActivandoNotificaciones(true);
    setErrorNotificaciones("");

    try {
      /*
       * SERVICE WORKER
       */

      if (!("serviceWorker" in navigator)) {
        setErrorNotificaciones(
          t.navegadorNoSoporta
        );

        return;
      }

      /*
       * PUSH
       */

      if (!("PushManager" in window)) {
        setErrorNotificaciones(
          t.pushNoSoporta
        );

        return;
      }

      /*
       * NOTIFICACIONES
       */

      if (!("Notification" in window)) {
        setErrorNotificaciones(
          t.navegadorNoSoporta
        );

        return;
      }

      /*
       * PERMISO
       */

      let permiso =
        Notification.permission;

      if (permiso === "default") {
        permiso =
          await Notification.requestPermission();
      }

      if (permiso !== "granted") {
        setNotificacionesActivas(false);

        setErrorNotificaciones(
          t.errorNotificaciones
        );

        return;
      }

      /*
       * REGISTRAR SERVICE WORKER
       */

      const registro =
        await navigator.serviceWorker.register(
          "/sw.js"
        );

      await navigator.serviceWorker.ready;

      /*
       * BUSCAR SUSCRIPCIÓN EXISTENTE
       */

      let subscription =
        await registro.pushManager.getSubscription();

      /*
       * CREAR SUSCRIPCIÓN
       */

      if (!subscription) {
        const vapidKey =
          process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidKey) {
          console.error(
            "Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY"
          );

          setErrorNotificaciones(
            t.configuracionFaltante
          );

          return;
        }

        subscription =
          await registro.pushManager.subscribe({
            userVisibleOnly: true,

            applicationServerKey:
              urlBase64ToUint8Array(
                vapidKey
              ),
          });
      }

      /*
       * ENDPOINT
       */

      const endpoint =
        subscription.endpoint;

      setPushEndpoint(endpoint);

      /*
       * GUARDAR SUSCRIPCIÓN
       */

      const respuesta =
        await fetch(
          "/api/push",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              subscription,
            }),
          }
        );

      const resultado =
        await respuesta.json();

      if (!respuesta.ok) {
        console.error(
          "ERROR REGISTRANDO PUSH:",
          resultado
        );

        setNotificacionesActivas(false);

        setErrorNotificaciones(
          t.registrarError
        );

        return;
      }

      /*
       * TODO CORRECTO
       */

      setNotificacionesActivas(true);
      setErrorNotificaciones("");
    } catch (error) {
      console.error(
        "ERROR REGISTRANDO PUSH:",
        error
      );

      setNotificacionesActivas(false);

      setErrorNotificaciones(
        t.activarError
      );
    } finally {
      setActivandoNotificaciones(false);
    }
  }

  /*
   * ============================================================
   * REINICIAR CHATBOT
   * ============================================================
   */

  function reiniciarConversacion() {
    setNombre("");
    setTelefono("");
    setFecha("");
    setHora("");
    setPersonas("");

    setEntrada("");

    setMensajeExito("");

    setErrorReserva("");

    setReservaCreada(false);

    setMensajes([
      {
        id: Date.now(),
        tipo: "ia",
        texto:
          `${t.saludo}\n\n` +
          `${t.preguntaNombre}`,
      },
    ]);

    setPaso("nombre");
  }

  /*
   * ============================================================
   * PROCESAR MENSAJE DEL CLIENTE
   * ============================================================
   */

  async function enviarMensaje() {
    const texto =
      entrada.trim();

    if (!texto) return;

    if (guardando) return;

    setEntrada("");

    agregarMensaje(
      "usuario",
      texto
    );

    setErrorReserva("");

    /*
     * ========================================================
     * NOMBRE
     * ========================================================
     */

    if (paso === "nombre") {
      if (texto.length < 2) {
        agregarMensaje(
          "ia",
          t.preguntaNombre
        );

        return;
      }

      setNombre(texto);

      agregarMensaje(
        "ia",
        t.preguntaTelefono
      );

      setPaso("telefono");

      return;
    }

    /*
     * ========================================================
     * TELÉFONO
     * ========================================================
     */

    if (paso === "telefono") {
      const telefonoLimpio =
        texto.replace(
          /\D/g,
          ""
        );

      if (
        telefonoLimpio.length !==
        10
      ) {
        agregarMensaje(
          "ia",
          t.telefonoInvalido
        );

        return;
      }

      setTelefono(
        telefonoLimpio
      );

      agregarMensaje(
        "ia",
        t.preguntaFecha
      );

      setPaso("fecha");

      return;
    }

    /*
     * ========================================================
     * FECHA
     * ========================================================
     */

    if (paso === "fecha") {
      let fechaValida =
        texto;

      const formatoFecha =
        /^\d{4}-\d{2}-\d{2}$/;

      const formatoFechaLatino =
        /^\d{1,2}\/\d{1,2}\/\d{4}$/;

      /*
       * ACEPTAR DD/MM/YYYY
       */

      if (
        formatoFechaLatino.test(
          texto
        )
      ) {
        const partes =
          texto.split("/");

        const dia =
          partes[0].padStart(
            2,
            "0"
          );

        const mes =
          partes[1].padStart(
            2,
            "0"
          );

        const anio =
          partes[2];

        fechaValida =
          `${anio}-${mes}-${dia}`;
      }

      /*
       * VALIDAR FECHA
       */

      if (
        !formatoFecha.test(
          fechaValida
        ) ||
        !fechaEsValida(
          fechaValida
        )
      ) {
        agregarMensaje(
          "ia",
          t.fechaInvalida
        );

        return;
      }

      setFecha(
        fechaValida
      );

      agregarMensaje(
        "ia",
        t.preguntaHora
      );

      setPaso("hora");

      return;
    }

    /*
     * ========================================================
     * HORA
     * ========================================================
     */

    if (paso === "hora") {
      const formatoHora =
        /^\d{1,2}:\d{2}$/;

      if (
        !formatoHora.test(
          texto
        )
      ) {
        agregarMensaje(
          "ia",
          t.horaInvalida
        );

        return;
      }

      const [h, m] =
        texto.split(":");

      const horas =
        Number(h);

      const minutos =
        Number(m);

      if (
        horas < 0 ||
        horas > 23 ||
        minutos < 0 ||
        minutos > 59
      ) {
        agregarMensaje(
          "ia",
          t.horaInvalida
        );

        return;
      }

      const horaFormateada =
        `${String(
          horas
        ).padStart(
          2,
          "0"
        )}:${String(
          minutos
        ).padStart(
          2,
          "0"
        )}`;

      setHora(
        horaFormateada
      );

      agregarMensaje(
        "ia",
        t.preguntaPersonas
      );

      setPaso("personas");

      return;
    }

    /*
     * ========================================================
     * PERSONAS
     * ========================================================
     */

    if (paso === "personas") {
      const numero =
        Number(
          texto.replace(
            /\D/g,
            ""
          )
        );

      if (
        !Number.isInteger(
          numero
        ) ||
        numero < 1 ||
        numero > 20
      ) {
        agregarMensaje(
          "ia",
          t.personasInvalidas
        );

        return;
      }

      setPersonas(
        String(numero)
      );

      const fechaTexto =
        idioma === "es"
          ? convertirFecha(
              fecha
            )
          : convertirFechaIngles(
              fecha
            );

      const horaTexto =
        convertirHora(
          hora
        );

      const resumen =
        `${t.resumen}\n\n` +
        `👤 ${t.resumenNombre}: ${nombre}\n` +
        `📞 ${t.resumenTelefono}: ${telefono}\n` +
        `📅 ${t.resumenFecha}: ${fechaTexto}\n` +
        `🕐 ${t.resumenHora}: ${horaTexto}\n` +
        `👥 ${t.resumenPersonas}: ${numero}`;

      agregarMensaje(
        "ia",
        `${resumen}\n\n${t.confirmar}`
      );

      setPaso(
        "confirmacion"
      );

      return;
    }

    /*
     * ========================================================
     * CONFIRMACIÓN
     * ========================================================
     */

    if (
      paso === "confirmacion"
    ) {
      const respuesta =
        texto.toLowerCase();

      const afirmativo =
        [
          "si",
          "sí",
          "yes",
          "ok",
          "confirmar",
          "confirmo",
          "dale",
          "correcto",
        ].some(
          (palabra) =>
            respuesta.includes(
              palabra
            )
        );

      const negativo =
        [
          "no",
          "corregir",
          "cambiar",
          "change",
        ].some(
          (palabra) =>
            respuesta.includes(
              palabra
            )
        );

      if (afirmativo) {
        await crearReserva();

        return;
      }

      if (negativo) {
        agregarMensaje(
          "ia",
          t.preguntaNombre
        );

        setNombre("");
        setTelefono("");
        setFecha("");
        setHora("");
        setPersonas("");

        setPaso("nombre");

        return;
      }

      agregarMensaje(
        "ia",
        t.confirmar
      );

      return;
    }
  }

  /*
   * ============================================================
   * CREAR RESERVA
   * ============================================================
   */

  async function crearReserva() {
    if (guardando) return;

    /*
     * EMPRESA
     */

    if (
      !empresaId ||
      !empresa
    ) {
      setErrorReserva(
        t.empresaNoIdentificada
      );

      agregarMensaje(
        "ia",
        t.empresaNoIdentificada
      );

      return;
    }

    /*
     * DATOS
     */

    if (
      !nombre ||
      !telefono ||
      !fecha ||
      !hora ||
      !personas
    ) {
      setErrorReserva(
        t.errorGuardar
      );

      return;
    }

    /*
     * NOTIFICACIONES
     *
     * Son necesarias para poder recibir
     * la respuesta del restaurante.
     */

    if (
      !notificacionesActivas ||
      !pushEndpoint
    ) {
      setErrorReserva(
        t.errorNotificaciones
      );

      agregarMensaje(
        "ia",
        t.errorNotificaciones
      );

      return;
    }

    setGuardando(true);

    try {
      const numeroPersonas =
        Number(personas);

      /*
       * ========================================================
       * GUARDAR RESERVA EN SUPABASE
       * ========================================================
       */

      const {
        data,
        error,
      } =
        await supabase
          .from("reservas")
          .insert([
            {
              empresa_id:
                empresaId,

              cliente_nombre:
                nombre.trim(),

              telefono:
                telefono,

              fecha,

              hora,

              personas:
                String(
                  numeroPersonas
                ),

              push_endpoint:
                pushEndpoint,
            },
          ])
          .select()
          .single();

      /*
       * ERROR SUPABASE
       */

      if (error) {
        console.error(
          "ERROR AL GUARDAR RESERVA:",
          error
        );

        setErrorReserva(
          t.errorGuardar
        );

        agregarMensaje(
          "ia",
          t.errorGuardar
        );

        return;
      }

      console.log(
        "RESERVA CREADA:",
        data
      );

      /*
       * ========================================================
       * NOTIFICAR AL RESTAURANTE POR TELEGRAM
       * ========================================================
       */

      try {
        const respuestaTelegram =
          await fetch(
            "/api/reservas/notificar",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                reservaId:
                  data.id,

                empresaId:
                  empresaId,

                empresaNombre:
                  empresa.nombre,

                cliente_nombre:
                  nombre.trim(),

                telefono:
                  telefono,

                fecha,

                hora,

                personas:
                  String(
                    numeroPersonas
                  ),

                pushEndpoint:
                  pushEndpoint,
              }),
            }
          );

        const resultadoTelegram =
          await respuestaTelegram.json();

        if (
          !respuestaTelegram.ok
        ) {
          console.error(
            "ERROR NOTIFICANDO:",
            resultadoTelegram
          );
        }
      } catch (error) {
        console.error(
          "ERROR COMUNICANDO CON TELEGRAM:",
          error
        );
      }

      /*
       * ========================================================
       * RESERVA ENVIADA
       * ========================================================
       */

      setReservaCreada(true);

      setMensajeExito(
        t.reservaEnviada
      );

      agregarMensaje(
        "ia",
        `${t.reservaEnviada}\n\n${t.esperando}`
      );

      setPaso("finalizado");
    } catch (error) {
      console.error(
        "ERROR GENERAL:",
        error
      );

      setErrorReserva(
        t.errorGuardar
      );

      agregarMensaje(
        "ia",
        t.errorGuardar
      );
    } finally {
      setGuardando(false);
    }
  }

  /*
   * ============================================================
   * ENTER
   * ============================================================
   */

  function manejarTecla(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      e.preventDefault();

      enviarMensaje();
    }
  }

  /*
   * ============================================================
   * BOTONES DE CONFIRMACIÓN
   * ============================================================
   */

  async function enviarMensajeDirecto(
    texto: string
  ) {
    if (guardando) return;

    agregarMensaje(
      "usuario",
      texto
    );

    if (
      paso === "confirmacion"
    ) {
      const respuesta =
        texto.toLowerCase();

      const afirmativo =
        [
          "si",
          "sí",
          "yes",
          "ok",
          "confirmar",
          "confirmo",
          "dale",
          "correcto",
        ].some(
          (palabra) =>
            respuesta.includes(
              palabra
            )
        );

      if (afirmativo) {
        await crearReserva();

        return;
      }

      /*
       * CORREGIR
       */

      agregarMensaje(
        "ia",
        t.preguntaNombre
      );

      setNombre("");
      setTelefono("");
      setFecha("");
      setHora("");
      setPersonas("");

      setPaso("nombre");
    }
  }

  /*
   * ============================================================
   * CARGANDO
   * ============================================================
   */

  if (cargandoEmpresa) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="font-medium text-gray-600">
            {t.cargando}
          </p>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * EMPRESA NO ENCONTRADA
   * ============================================================
   */

  if (!empresa) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">

        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">

          <div className="mb-4 text-5xl">
            🍽️
          </div>

          <h1 className="text-2xl font-black text-gray-950">
            {t.empresaNoIdentificada}
          </h1>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * PÁGINA PRINCIPAL
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">

        {/* =====================================================
            IDIOMA
        ====================================================== */}

        <div className="mb-5 flex justify-end">

          <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <button
              type="button"
              onClick={() =>
                setIdioma("es")
              }
              className={`px-4 py-2 text-sm font-bold transition ${
                idioma === "es"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              🇪🇸 Español
            </button>

            <button
              type="button"
              onClick={() =>
                setIdioma("en")
              }
              className={`px-4 py-2 text-sm font-bold transition ${
                idioma === "en"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              🇺🇸 English
            </button>

          </div>

        </div>

        {/* =====================================================
            CONTENEDOR PRINCIPAL
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">

          {/* ===================================================
              ENCABEZADO
          ==================================================== */}

          <div className="px-5 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7">

            {/* LOGO MÁS PEQUEÑO */}

            <div className="mb-4 flex justify-center">

              <Image
                src="/logo-foodshortai.png"
                alt="ShortBizAI"
                width={130}
                height={130}
                priority
                className="h-auto w-[110px] object-contain sm:w-[130px]"
              />

            </div>

            {/* BIENVENIDA */}

            <div className="text-center">

              <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl">

                {t.bienvenida}

                <span className="mt-1 block text-blue-600">
                  {empresa.nombre}
                </span>

              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                {t.descripcion}
              </p>

            </div>

          </div>

          {/* ===================================================
              NOTIFICACIONES
          ==================================================== */}

          <div className="border-y border-gray-200 bg-gray-50 px-5 py-5 sm:px-8">

            {!notificacionesActivas ? (

              <div>

                <p className="text-center text-lg font-bold text-gray-950 sm:text-xl">
                  {t.reservarTitulo}
                </p>

                <button
                  type="button"
                  onClick={
                    registrarNotificaciones
                  }
                  disabled={
                    activandoNotificaciones
                  }
                  className="mt-4 min-h-[54px] w-full rounded-xl bg-blue-600 px-5 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >

                  {activandoNotificaciones
                    ? t.activando
                    : t.activarBoton}

                </button>

                {errorNotificaciones && (

                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">

                    {errorNotificaciones}

                  </div>

                )}

              </div>

            ) : (

              <div className="flex items-center gap-3">

                <div className="text-2xl">
                  🔔
                </div>

                <div>

                  <p className="font-bold text-green-700">
                    {t.notificacionesActivadas}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-green-700">
                    {t.dispositivoListo}
                  </p>

                </div>

              </div>

            )}

          </div>

          {/* ===================================================
              CHATBOT
          ==================================================== */}

          <div className="flex flex-col">

            {/* CABECERA DEL CHAT */}

            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 sm:px-7">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-xl shadow-sm">
                🤖
              </div>

              <div>

                <p className="font-black text-gray-950">
                  ShortBizAI
                </p>

                <p className="text-xs text-green-600">

                  ●{" "}

                  {idioma === "es"
                    ? "Asistente disponible"
                    : "Assistant available"}

                </p>

              </div>

            </div>

            {/* =================================================
                MENSAJES
            ================================================== */}

            <div
              ref={mensajesRef}
              className="max-h-[500px] min-h-[380px] space-y-4 overflow-y-auto bg-gray-50 px-4 py-5 sm:px-6"
            >

              {mensajes.map(
                (mensaje) => (

                  <div
                    key={mensaje.id}
                    className={`flex ${
                      mensaje.tipo ===
                      "usuario"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-[15px] leading-6 shadow-sm ${
                        mensaje.tipo ===
                        "usuario"
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                      }`}
                    >

                      {mensaje.texto}

                    </div>

                  </div>

                )
              )}

              {/* INDICADOR DE PROCESAMIENTO */}

              {guardando && (

                <div className="flex justify-start">

                  <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">

                    <div className="flex items-center gap-1">

                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />

                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{
                          animationDelay:
                            "150ms",
                        }}
                      />

                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{
                          animationDelay:
                            "300ms",
                        }}
                      />

                    </div>

                  </div>

                </div>

              )}

            </div>

            {/* =================================================
                BOTONES DE CONFIRMACIÓN
            ================================================== */}

            {paso === "confirmacion" &&
              !guardando && (

                <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">

                  <div className="grid gap-3 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={() =>
                        enviarMensajeDirecto(
                          idioma === "es"
                            ? "Sí, enviar reserva"
                            : "Yes, send reservation"
                        )
                      }
                      className="min-h-[52px] rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      ✅ {t.si}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        enviarMensajeDirecto(
                          idioma === "es"
                            ? "No, quiero corregir"
                            : "No, I want to correct it"
                        )
                      }
                      className="min-h-[52px] rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                    >
                      ✏️ {t.no}
                    </button>

                  </div>

                </div>

              )}

            {/* =================================================
                INPUT DEL CHATBOT
            ================================================== */}

            {paso !== "finalizado" &&
              paso !== "confirmacion" && (

                <div className="border-t border-gray-200 bg-white p-4 sm:p-5">

                  <div className="flex items-end gap-3">

                    <input
                      type={
                        paso === "telefono"
                          ? "tel"
                          : "text"
                      }
                      value={entrada}
                      onChange={(e) =>
                        setEntrada(
                          e.target.value
                        )
                      }
                      onKeyDown={
                        manejarTecla
                      }
                      placeholder={
                        idioma === "es"
                          ? "Escribe tu respuesta..."
                          : "Type your answer..."
                      }
                      disabled={guardando}
                      autoComplete="off"
                      inputMode={
                        paso === "telefono"
                          ? "tel"
                          : "text"
                      }
                      className="min-h-[52px] flex-1 rounded-2xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={
                        enviarMensaje
                      }
                      disabled={
                        guardando ||
                        !entrada.trim()
                      }
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      ➤
                    </button>

                  </div>

                </div>

              )}

            {/* =================================================
                RESERVA FINALIZADA
            ================================================== */}

            {paso === "finalizado" && (

              <div className="border-t border-gray-200 bg-white px-4 py-5 sm:px-6">

                {mensajeExito && (

                  <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-semibold leading-6 text-green-800">

                    {mensajeExito}

                  </div>

                )}

                {errorReserva && (

                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold leading-6 text-red-700">

                    {errorReserva}

                  </div>

                )}

                <button
                  type="button"
                  onClick={
                    reiniciarConversacion
                  }
                  className="min-h-[52px] w-full rounded-xl bg-blue-600 px-5 text-base font-bold text-white transition hover:bg-blue-700"
                >

                  {t.nuevaReserva}

                </button>

              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}