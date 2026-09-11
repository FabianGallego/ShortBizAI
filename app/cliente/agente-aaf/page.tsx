"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import NotificacionesObligatorias from "@/app/components/NotificacionesObligatorias";
import ReservaChat from "./ReservaChat";
import build from "next/dist/build";
type Empresa = {
  id: number | string;
  nombre: string;
  codigo_publico: string;
};

type Mensaje = {
  id: number;
  tipo: "ia" | "usuario";
  texto: string;
};

/* =========================================================
   IMAGEN DE FONDO DE CADA RESTAURANTE
========================================================= */

function obtenerImagenRestaurante(
  nombre: string
) {
  const nombreNormalizado =
    nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  /*
     EL FOGÓN
     La imagen está en:

     public/image/publicfogon-bg.jpg

     Desde el navegador:

     /image/publicfogon-bg.jpg
  */

  if (
    nombreNormalizado === "el fogon" ||
    nombreNormalizado.includes("el fogon")
  ) {
    return "/image/publicfogon-bg.jpg";
  }

  if (
    nombreNormalizado.includes("queensyard")
  ) {
    return "/image/queensyard-foto.png";
  }

  /*
     Aquí podremos agregar fácilmente
     los demás restaurantes.
  */

  return null;
}

/* =========================================================
   UTILIDADES
========================================================= */

function urlBase64ToUint8Array(
  base64String: string
) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  );
}

/* =========================================================
   FECHA ACTUAL
========================================================= */

function obtenerFechaHoy() {
  const hoy =
    new Date();

  const anio =
    hoy.getFullYear();

  const mes =
    String(
      hoy.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const dia =
    String(
      hoy.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${anio}-${mes}-${dia}`;
}

/* =========================================================
   CONVERTIR FECHA ESPAÑOL
========================================================= */

function convertirFecha(
  fecha: string
) {
  if (!fecha) return "";

  const partes =
    fecha.split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  const [
    anio,
    mes,
    dia,
  ] = partes;

  return `${dia}/${mes}/${anio}`;
}

/* =========================================================
   CONVERTIR FECHA INGLÉS
========================================================= */

function convertirFechaIngles(
  fecha: string
) {
  if (!fecha) return "";

  const partes =
    fecha.split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  const [
    anio,
    mes,
    dia,
  ] = partes;

  return `${mes}/${dia}/${anio}`;
}

/* =========================================================
   CONVERTIR HORA
========================================================= */

function convertirHora(
  hora: string
) {
  if (!hora) return "";

  const [
    horas,
    minutos,
  ] = hora.split(":");

  if (!horas || !minutos) {
    return hora;
  }

  let h =
    Number(horas);

  const periodo =
    h >= 12
      ? "PM"
      : "AM";

  h =
    h % 12;

  if (h === 0) {
    h = 12;
  }

  return `${h}:${minutos} ${periodo}`;
}

/* =========================================================
   VALIDAR FECHA
========================================================= */

function fechaEsValida(
  fecha: string
) {
  const partes =
    fecha.split("-");

  if (partes.length !== 3) {
    return false;
  }

  const [
    anioTexto,
    mesTexto,
    diaTexto,
  ] = partes;

  if (
    !/^\d{4}$/.test(anioTexto) ||
    !/^\d{2}$/.test(mesTexto) ||
    !/^\d{2}$/.test(diaTexto)
  ) {
    return false;
  }

  const anio =
    Number(anioTexto);

  const mes =
    Number(mesTexto);

  const dia =
    Number(diaTexto);

  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(dia)
  ) {
    return false;
  }

  if (
    mes < 1 ||
    mes > 12
  ) {
    return false;
  }

  const diasPorMes = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  const esBisiesto =
    (anio % 4 === 0 &&
      anio % 100 !== 0) ||
    anio % 400 === 0;

  const diasDelMes =
    mes === 2 &&
    esBisiesto
      ? 29
      : diasPorMes[
          mes - 1
        ];

  return (
    dia >= 1 &&
    dia <= diasDelMes
  );
}

/* =========================================================
   VALIDAR SI FECHA ES PASADA
========================================================= */

function fechaEsPasada(
  fecha: string
) {
  if (!fecha) {
    return false;
  }

  return (
    fecha <
    obtenerFechaHoy()
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function AgenteAAFPage() {

  /* =======================================================
     EMPRESA
  ======================================================= */

  const [
    empresaId,
    setEmpresaId,
  ] = useState<string | null>(
    null
  );

  const [
    empresa,
    setEmpresa,
  ] = useState<Empresa | null>(
    null
  );

  const [
    cargandoEmpresa,
    setCargandoEmpresa,
  ] = useState(true);

  /* =======================================================
     IDIOMA
  ======================================================= */

  const [
    idioma,
    setIdioma,
  ] = useState<
    "es" | "en"
  >(
    "es"
  );

  /* =======================================================
     CHATBOT
  ======================================================= */

  const [
    mensajes,
    setMensajes,
  ] = useState<Mensaje[]>(
    []
  );

  const [
    entrada,
    setEntrada,
  ] = useState("");

  const [
    paso,
    setPaso,
  ] = useState<
    | "inicio"
    | "nombre"
    | "telefono"
    | "fecha"
    | "hora"
    | "personas"
    | "email"
    | "confirmacion"
    | "beneficio"
    | "finalizado"
  >(
    "inicio"
  );

  /* =======================================================
     DATOS RESERVA
  ======================================================= */

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    telefono,
    setTelefono,
  ] = useState("");

  const [
    fecha,
    setFecha,
  ] = useState("");

  const [
    hora,
    setHora,
  ] = useState("");

  const [
    personas,
    setPersonas,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    reservaIdCreada,
    setReservaIdCreada,
  ] = useState<number | string | null>(
    null
  );

  const [
    guardandoEmail,
    setGuardandoEmail,
  ] = useState(false);

  /* =======================================================
     ESTADO RESERVA
  ======================================================= */

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    mensajeExito,
    setMensajeExito,
  ] = useState("");

  const [
    errorReserva,
    setErrorReserva,
  ] = useState("");

  const [
    reservaCreada,
    setReservaCreada,
  ] = useState(false);

  /* =======================================================
     PUSH
  ======================================================= */

  const [
    pushEndpoint,
    setPushEndpoint,
  ] = useState<string | null>(
    null
  );

  const [
    notificacionesActivas,
    setNotificacionesActivas,
  ] = useState(false);

  const [
    activandoNotificaciones,
    setActivandoNotificaciones,
  ] = useState(false);

  const [
    errorNotificaciones,
    setErrorNotificaciones,
  ] = useState("");

  /* =======================================================
     ACCESO A LA RESERVA
  ======================================================= */

  const [
    reservaHabilitada,
    setReservaHabilitada,
  ] = useState(false);

  /* =======================================================
     REFERENCIAS
  ======================================================= */

  const mensajesRef =
    useRef<HTMLDivElement>(
      null
    );

  const fechaInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const horaInputRef =
    useRef<HTMLInputElement>(
      null
    );

  /* =========================================================
     TEXTOS
  ========================================================= */

  const textos = {

    es: {

      cargando:
        "Cargando...",

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

      preguntaEmail:
        "Perfecto. ¿Cuál es tu correo electrónico?",

      seleccionarFecha:
        "Seleccionar fecha",

      seleccionarHora:
        "Seleccionar hora",

      fechaInvalida:
        "Por favor selecciona una fecha válida.",

      horaInvalida:
        "Por favor selecciona una hora válida.",

      personasInvalidas:
        "Por favor indícame un número válido de personas.",

      telefonoInvalido:
        "El número de teléfono debe tener 10 dígitos.",

      emailInvalido:
        "Por favor introduce un correo electrónico válido.",

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

      resumenEmail:
        "Correo",

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

      reservarTitulo:
        "Para continuar con la reserva debes activar las notificaciones.",

      activarBoton:
        "🔔 Activar notificaciones",

      activando:
        "Activando...",

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

      errorTelegram:
        "La reserva fue guardada, pero no pudimos enviar el aviso al restaurante.",

      beneficioTitulo:
        "🎁 ¿Quieres recibir beneficios exclusivos?",
      beneficioDescripcion:
        "Déjanos tu email y recibe ofertas, promociones y beneficios especiales de este restaurante.",
      beneficioPlaceholder:
        "Tu email",
      beneficioBoton:
        "Sí, quiero recibir beneficios",
      beneficioOmitir:
        "No, gracias",
      
      emailGuardado:
        "🎉 Listo. Guardaremos tu email para enviarte beneficios y promociones.",
      errorEmail:
        "No pudimos guardar tu email. Puedes continuar con tu reserva.",
    },

    en: {

      cargando:
        "Loading...",

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

      preguntaEmail:
        "Perfect. What is your email address?",

      seleccionarFecha:
        "Select date",

      seleccionarHora:
        "Select time",

      fechaInvalida:
        "Please select a valid date.",

      horaInvalida:
        "Please select a valid time.",

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

      resumenEmail:
        "Email",

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

      reservarTitulo:
        "To continue with your reservation, you must enable notifications.",

      activarBoton:
        "🔔 Enable notifications",

      activando:
        "Activating...",

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
        "You must allow notifications to receive the confirmation or cancellation of your reservation.",

      empresaNoIdentificada:
        "We could not identify the restaurant.",

      errorGuardar:
        "We could not save the reservation. Please try again.",

      errorTelegram:
        "The reservation was saved, but we could not notify the restaurant.",

      beneficioTitulo:
        "🎁 Would you like to receive exclusive benefits?",
      beneficioDescripcion:
        "Leave your email and receive offers, promotions and special benefits from this restaurant.",
      beneficioPlaceholder:
        "Your email",
      beneficioBoton:
        "Yes, I want the benefits",
      beneficioOmitir:
        "No, thanks",
      emailInvalido:
        "Please enter a valid email address.",
      emailGuardado:
        "🎉 Done. We’ll save your email so we can send you benefits and promotions.",
      errorEmail:
        "We could not save your email. You can continue with your reservation.",
    },
  };

  const t =
    textos[idioma];

  /* =========================================================
     OBTENER EMPRESA ID DESDE URL
  ========================================================= */

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const id =
      params.get(
        "empresaId"
      );

    setEmpresaId(
      id
    );

  }, []);

  /* =========================================================
     BUSCAR EMPRESA
  ========================================================= */

  useEffect(() => {

    async function cargarEmpresa() {

      if (!empresaId) {

        setEmpresa(null);
        setCargandoEmpresa(false);

        return;
      }

      setCargandoEmpresa(
        true
      );

      const {
        data,
        error,
      } =
        await supabase
          .from("empresas")
          .select(
            "id, nombre, codigo_publico"
          )
          .eq(
            "id",
            empresaId
          )
          .maybeSingle();

      if (error) {

        console.error(
          "ERROR BUSCANDO EMPRESA:",
          error
        );

        setEmpresa(
          null
        );

      } else {

        setEmpresa(
          data as Empresa | null
        );
      }

      setCargandoEmpresa(
        false
      );
    }

    cargarEmpresa();

  }, [empresaId]);

  /* =========================================================
     INICIAR CHATBOT
  ========================================================= */

  useEffect(() => {

    if (!empresa) {
      return;
    }

    setMensajes([
      {
        id:
          Date.now(),

        tipo:
          "ia",

        texto:
          `${t.saludo}\n\n${t.preguntaNombre}`,
      },
    ]);

    setPaso(
      "nombre"
    );

  }, [empresa, idioma]);

  /* =========================================================
     AUTO SCROLL CHAT
  ========================================================= */

  useEffect(() => {

    if (
      mensajesRef.current
    ) {

      mensajesRef.current.scrollTo({

        top:
          mensajesRef.current
            .scrollHeight,

        behavior:
          "smooth",
      });
    }

  }, [mensajes]);

  /* =========================================================
     AGREGAR MENSAJE
  ========================================================= */

  function agregarMensaje(
    tipo:
      | "ia"
      | "usuario",
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

  /* =========================================================
     SELECCIONAR FECHA
  ========================================================= */

  function seleccionarFecha(
    nuevaFecha: string
  ) {

    if (!nuevaFecha) {
      return;
    }

    if (
      !fechaEsValida(
        nuevaFecha
      )
    ) {

      agregarMensaje(
        "ia",
        t.fechaInvalida
      );

      return;
    }

    if (
      fechaEsPasada(
        nuevaFecha
      )
    ) {

      agregarMensaje(
        "ia",
        idioma === "es"
          ? "No puedes seleccionar una fecha pasada. Por favor elige otra fecha."
          : "You cannot select a past date. Please choose another date."
      );

      return;
    }

    setFecha(
      nuevaFecha
    );

    agregarMensaje(
      "usuario",
      idioma === "es"
        ? convertirFecha(
            nuevaFecha
          )
        : convertirFechaIngles(
            nuevaFecha
          )
    );

    agregarMensaje(
      "ia",
      t.preguntaHora
    );

    setPaso(
      "hora"
    );
  }

  /* =========================================================
     SELECCIONAR HORA
  ========================================================= */

  function seleccionarHora(
    nuevaHora: string
  ) {

    if (!nuevaHora) {
      return;
    }

    const formatoHora =
      /^\d{2}:\d{2}$/;

    if (
      !formatoHora.test(
        nuevaHora
      )
    ) {

      agregarMensaje(
        "ia",
        t.horaInvalida
      );

      return;
    }

    const [
      h,
      m,
    ] =
      nuevaHora.split(
        ":"
      );

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
      "usuario",
      convertirHora(
        horaFormateada
      )
    );

    agregarMensaje(
      "ia",
      t.preguntaPersonas
    );

    setPaso(
      "personas"
    );
  }

  /* =========================================================
     ACTIVAR NOTIFICACIONES
  ========================================================= */

  async function registrarNotificaciones() {

    setActivandoNotificaciones(
      true
    );

    setErrorNotificaciones(
      ""
    );

    try {

      if (
        !("serviceWorker" in navigator)
      ) {

        setErrorNotificaciones(
          t.navegadorNoSoporta
        );

        return;
      }

      if (
        !("PushManager" in window)
      ) {

        setErrorNotificaciones(
          t.pushNoSoporta
        );

        return;
      }

      if (
        !("Notification" in window)
      ) {

        setErrorNotificaciones(
          t.navegadorNoSoporta
        );

        return;
      }

      let permiso =
        Notification.permission;

      if (
        permiso ===
        "default"
      ) {

        permiso =
          await Notification.requestPermission();
      }

      if (
        permiso !==
        "granted"
      ) {

        setNotificacionesActivas(
          false
        );

        setErrorNotificaciones(
          t.errorNotificaciones
        );

        return;
      }

      const registro =
        await navigator.serviceWorker.register(
          "/sw.js"
        );

      await navigator.serviceWorker.ready;

      let subscription =
        await registro.pushManager.getSubscription();

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

            userVisibleOnly:
              true,

            applicationServerKey:
              urlBase64ToUint8Array(
                vapidKey
              ),
          });
      }

      const endpoint =
        subscription.endpoint;

      setPushEndpoint(
        endpoint
      );

      const respuesta =
        await fetch(
          "/api/push",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                subscription,
              }),
          }
        );

      const resultado =
        await respuesta.json();

      if (
        !respuesta.ok
      ) {

        console.error(
          "ERROR REGISTRANDO PUSH:",
          resultado
        );

        setNotificacionesActivas(
          false
        );

        setErrorNotificaciones(
          t.registrarError
        );

        return;
      }

      setNotificacionesActivas(
        true
      );

      setErrorNotificaciones(
        ""
      );

      /*
         Apenas las notificaciones quedan
         correctamente activadas, se habilita
         automáticamente la página de reserva.
      */

      setReservaHabilitada(
        true
      );

    } catch (error) {

      console.error(
        "ERROR REGISTRANDO PUSH:",
        error
      );

      setNotificacionesActivas(
        false
      );

      setErrorNotificaciones(
        t.activarError
      );

    } finally {

      setActivandoNotificaciones(
        false
      );
    }
  }

  /* =========================================================
     GUARDAR EMAIL PARA BENEFICIOS
  ========================================================= */

  async function guardarEmailBeneficio() {

    const emailLimpio =
      email
        .trim()
        .toLowerCase();

    if (
      !emailLimpio ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailLimpio
      )
    ) {

      agregarMensaje(
        "ia",
        t.emailInvalido
      );

      return;
    }

    if (!reservaIdCreada) {

      agregarMensaje(
        "ia",
        t.errorEmail
      );

      return;
    }

    setGuardandoEmail(
      true
    );

    try {

      const {
        error,
      } =
        await supabase
          .from("reservas")
          .update({
            email:
              emailLimpio,
          })
          .eq(
            "id",
            reservaIdCreada
          );

      if (error) {

        console.error(
          "ERROR GUARDANDO EMAIL:",
          error
        );

        agregarMensaje(
          "ia",
          t.errorEmail
        );

        return;
      }

      agregarMensaje(
        "usuario",
        emailLimpio
      );

      agregarMensaje(
        "ia",
        `${t.emailGuardado}\n\n${t.esperando}`
      );

      setPaso(
        "finalizado"
      );

    } finally {

      setGuardandoEmail(
        false
      );
    }
  }

  /* =========================================================
     REINICIAR CONVERSACIÓN
  ========================================================= */

  function reiniciarConversacion() {

    setNombre("");
    setTelefono("");
    setFecha("");
    setHora("");
    setPersonas("");
    setEmail("");
    setReservaIdCreada(null);

    setEntrada("");

    setMensajeExito(
      ""
    );

    setErrorReserva(
      ""
    );

    setReservaCreada(
      false
    );

    setMensajes([
      {
        id:
          Date.now(),

        tipo:
          "ia",

        texto:
          `${t.saludo}\n\n${t.preguntaNombre}`,
      },
    ]);

    setPaso(
      "nombre"
    );
  }

  /* =========================================================
     ENVIAR MENSAJE
  ========================================================= */

  async function enviarMensaje() {

    const texto =
      entrada.trim();

    if (!texto) {
      return;
    }

    if (guardando) {
      return;
    }

    setEntrada("");

    agregarMensaje(
      "usuario",
      texto
    );

    setErrorReserva(
      ""
    );

    /* =====================================================
       NOMBRE
    ===================================================== */

    if (
      paso === "nombre"
    ) {

      if (
        texto.length < 2
      ) {

        agregarMensaje(
          "ia",
          t.preguntaNombre
        );

        return;
      }

      setNombre(
        texto
      );

      agregarMensaje(
        "ia",
        t.preguntaTelefono
      );

      setPaso(
        "telefono"
      );

      return;
    }

    /* =====================================================
       TELÉFONO
    ===================================================== */

    if (
      paso === "telefono"
    ) {

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

      setPaso(
        "fecha"
      );

      return;
    }

    /* =====================================================
       PERSONAS
    ===================================================== */

    if (
      paso === "personas"
    ) {

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

      agregarMensaje(
        "ia",
        t.preguntaEmail
      );

      setPaso(
        "email"
      );

      return;
    }

    /* =====================================================
       EMAIL
    ===================================================== */

    if (
      paso === "email"
    ) {

      const emailLimpio =
        texto
          .trim()
          .toLowerCase();

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          emailLimpio
        )
      ) {

        agregarMensaje(
          "ia",
          t.emailInvalido
        );

        return;
      }

      setEmail(
        emailLimpio
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
        `👥 ${t.resumenPersonas}: ${personas}\n` +
        `✉️ ${t.resumenEmail}: ${emailLimpio}`;

      agregarMensaje(
        "ia",
        `${resumen}\n\n${t.confirmar}`
      );

      setPaso(
        "confirmacion"
      );

      return;
    }

    /* =====================================================
       CONFIRMACIÓN
    ===================================================== */

    if (
      paso ===
      "confirmacion"
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

      if (
        afirmativo
      ) {

        await crearReserva();

        return;
      }

      if (
        negativo
      ) {

        agregarMensaje(
          "ia",
          t.preguntaNombre
        );

        setNombre("");
        setTelefono("");
        setFecha("");
        setHora("");
        setPersonas("");
        setEmail("");

        setPaso(
          "nombre"
        );

        return;
      }

      agregarMensaje(
        "ia",
        t.confirmar
      );

      return;
    }
  }

  /* =========================================================
     CREAR RESERVA
  ========================================================= */

  async function crearReserva() {

    if (guardando) {
      return;
    }

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

    if (
      !nombre ||
      !telefono ||
      !fecha ||
      !hora ||
      !personas ||
      !email
    ) {

      setErrorReserva(
        t.errorGuardar
      );

      agregarMensaje(
        "ia",
        t.errorGuardar
      );

      return;
    }

    /* =====================================================
       NOTIFICACIONES OBLIGATORIAS
    ===================================================== */

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

    setGuardando(
      true
    );

    try {

      const numeroPersonas =
        Number(personas);

      /* ===================================================
         GUARDAR RESERVA
      =================================================== */

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

              fecha:
                fecha,

              hora:
                hora,

              personas:
                String(
                  numeroPersonas
                ),

              email:
                email
                  .trim()
                  .toLowerCase(),

              push_endpoint:
                pushEndpoint,
            },
          ])
          .select()
          .single();

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

      /* ===================================================
         TELEGRAM
      =================================================== */

      try {

        const respuestaTelegram =
          await fetch(
            "/api/reservas/notificar",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
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

                  fecha:
                    fecha,

                  hora:
                    hora,

                  personas:
                    String(
                      numeroPersonas
                    ),

                  email:
                    email
                      .trim()
                      .toLowerCase(),

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

      /* ===================================================
         FINALIZAR
      =================================================== */

      setReservaCreada(
        true
      );

      setReservaIdCreada(
        data.id
      );

      setMensajeExito(
        t.reservaEnviada
      );

      agregarMensaje(
        "ia",
        t.reservaEnviada
      );

      setPaso(
        "finalizado"
      );

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

      setGuardando(
        false
      );
    }
  }

  /* =========================================================
     ENTER
  ========================================================= */

  function manejarTecla(
    e: KeyboardEvent<HTMLInputElement>
  ) {

    if (
      e.key ===
      "Enter"
    ) {

      e.preventDefault();

      enviarMensaje();
    }
  }

  /* =========================================================
     BOTONES DE CONFIRMACIÓN
  ========================================================= */

  async function enviarMensajeDirecto(
    texto: string
  ) {

    if (guardando) {
      return;
    }

    agregarMensaje(
      "usuario",
      texto
    );

    if (
      paso ===
      "confirmacion"
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

      if (
        afirmativo
      ) {

        await crearReserva();

        return;
      }

      agregarMensaje(
        "ia",
        t.preguntaNombre
      );

      setNombre("");
      setTelefono("");
      setFecha("");
      setHora("");
      setPersonas("");

      setPaso(
        "nombre"
      );
    }
  }

  /* =========================================================
     CARGANDO EMPRESA
  ========================================================= */

  if (
    cargandoEmpresa
  ) {

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

  /* =========================================================
     ENTRADA GENERAL SHORTBIZAI

     Cuando la página se abre sin empresaId, NO asumimos
     ningún restaurante. Esta es la puerta de entrada general
     de Booking Now / Local Store.

     Cuando existe empresaId, la ejecución continúa abajo y
     funciona como la pasarela específica de ese negocio.
  ========================================================= */

  if (!empresa) {

    if (!empresaId) {

      const servicios = [
        {
          nombre: "ShortFoodAI",
          categoriaEs: "Restaurantes",
          categoriaEn: "Restaurants",
          descripcionEs: "Descubre restaurantes locales y reserva tu mesa.",
          descripcionEn: "Discover local restaurants and book your table.",
          href: "/explore-local?categoria=restaurantes",
          imagen:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85",
        },
        {
          nombre: "ShortTravelAI",
          categoriaEs: "Viajes y experiencias",
          categoriaEn: "Travel & Experiences",
          descripcionEs: "Descubre lugares, experiencias y servicios para viajeros.",
          descripcionEn: "Discover places, experiences, and services for travelers.",
          href: "/explore-local?categoria=viajes",
          imagen:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85",
        },
        {
          nombre: "ShortBarberAI",
          categoriaEs: "Barberías",
          categoriaEn: "Barbers",
          descripcionEs: "Encuentra barberías locales y agenda tu cita.",
          descripcionEn: "Find local barbers and book your appointment.",
          href: "/explore-local?categoria=barberias",
          imagen:
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=85",
        },
        {
          nombre: "ShortSpaAI",
          categoriaEs: "Belleza y bienestar",
          categoriaEn: "Beauty & Wellness",
          descripcionEs: "Descubre spas locales y reserva tu servicio.",
          descripcionEn: "Discover local spas and book your service.",
          href: "/explore-local?categoria=spas",
          imagen:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85",
        },
        {
          nombre: "ShortHotelAI",
          categoriaEs: "Hoteles",
          categoriaEn: "Hotels",
          descripcionEs: "Explora hoteles y encuentra tu próxima estadía.",
          descripcionEn: "Explore hotels and find your next stay.",
          href: "/explore-local?categoria=hoteles",
          imagen:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85",
        },
      ];

      return (
        <main className="min-h-screen overflow-hidden bg-[#090909] px-4 py-5 text-white sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-7xl">
            {/* HEADER */}
            <header className="relative mb-8 sm:mb-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_30px_rgba(255,255,255,0.08)]">
                    <Image
                      src="/logo-foodshortai.png"
                      alt="ShortBizAI"
                      width={80}
                      height={80}
                      priority
                      className="h-9 w-9 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-white/50">
                      ShortBizAI
                    </p>
                    <p className="text-xs font-medium text-white/35">
                      Local experiences, powered by AI
                    </p>
                  </div>
                </div>

                <div className="flex overflow-hidden rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setIdioma("es")}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition sm:px-4 ${
                      idioma === "es"
                        ? "bg-white text-black shadow-sm"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    ES
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdioma("en")}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition sm:px-4 ${
                      idioma === "en"
                        ? "bg-white text-black shadow-sm"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              <div className="max-w-4xl pb-2 pt-12 sm:pt-16">
                <p className="mb-4 text-[11px] font-black uppercase tracking-[0.34em] text-white/45">
                  {idioma === "es" ? "EXPERIENCIAS LOCALES" : "LOCAL EXPERIENCES"}
                </p>
                <h1 className="max-w-4xl text-4xl font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                  {idioma === "es"
                    ? "Descubre algo que valga la pena reservar."
                    : "Discover something worth booking."}
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/45 sm:text-base sm:leading-7">
                  {idioma === "es"
                    ? "Explora negocios, servicios y experiencias locales. Descubre. Reserva. Regresa."
                    : "Explore local businesses, services, and experiences. Discover. Book. Return."}
                </p>
              </div>
            </header>

            {/* EXPERIENCE GRID */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {servicios.map((servicio, index) => (
                <a
                  key={servicio.nombre}
                  href={servicio.href}
                  className={`group relative isolate overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#141414] shadow-[0_25px_70px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_35px_90px_rgba(0,0,0,0.5)] ${
                    index === 0 ? "sm:col-span-2 lg:col-span-4 lg:min-h-[470px]" : "min-h-[300px] sm:min-h-[330px]"
                  }`}
                >
                  <div
                    className="absolute inset-0 -z-20 bg-cover bg-center transition duration-700 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${servicio.imagen})` }}
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/45 to-black/10" />
                  <div className="absolute inset-0 -z-10 bg-black/15 transition duration-500 group-hover:bg-black/5" />

                  <div className="flex h-full min-h-[inherit] flex-col justify-between p-6 sm:p-7 lg:p-9">
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                        {idioma === "es"
                          ? servicio.categoriaEs
                          : servicio.categoriaEn}
                      </span>
                      <span className="text-xs font-medium text-white/45">
                        0{index + 1}
                      </span>
                    </div>

                    <div className="max-w-2xl">
                      <h2 className={`font-semibold tracking-[-0.04em] text-white ${
                        index === 0
                          ? "text-4xl sm:text-5xl lg:text-6xl"
                          : "text-3xl sm:text-4xl"
                      }`}>
                        {servicio.nombre}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                        {idioma === "es"
                          ? servicio.descripcionEs
                          : servicio.descripcionEn}
                      </p>

                      <div className="mt-6 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-white">
                        <span>
                          {idioma === "es" ? "Explorar" : "Explore"}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base transition duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </section>

            <footer className="flex flex-col items-center justify-between gap-3 py-8 text-center sm:flex-row sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/25">
                ShortBizAI
              </p>
              <p className="text-xs text-white/25">
                {idioma === "es"
                  ? "Más servicios locales próximamente."
                  : "More local services coming soon."}
              </p>
            </footer>
          </div>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-black text-gray-950">
            {t.empresaNoIdentificada}
          </h1>
        </div>
      </main>
    );
  }

  /* =========================================================
     IMAGEN DEL RESTAURANTE
  ========================================================= */

  const imagenRestaurante =
    obtenerImagenRestaurante(
      empresa.nombre
    );

  /* =========================================================
     PÁGINA PRINCIPAL
  ========================================================= */

  return (
    <NotificacionesObligatorias>

      <main className="min-h-screen bg-gray-50 text-gray-900">

        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">

          {/* =================================================
              IDIOMA
          ================================================= */}

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

          {/* =================================================
              TARJETA PRINCIPAL
          ================================================= */}

          <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">

            {/* =================================================
                PANTALLA DE BIENVENIDA + NOTIFICACIONES
            ================================================= */}

            {!reservaHabilitada ? (

              <>

                {/* ===========================================
                    BIENVENIDA
                =========================================== */}

                <div
                  className="relative overflow-hidden px-6 pb-10 pt-9 sm:px-10 sm:pb-12 sm:pt-11"
                  style={
                    imagenRestaurante
                      ? {
                          backgroundImage:
                            `url("${imagenRestaurante}")`,
                          backgroundSize:
                            "cover",
                          backgroundPosition:
                            "center",
                        }
                      : undefined
                  }
                >

                  {imagenRestaurante && (

                    <div className="absolute inset-0 bg-black/60" />

                  )}

                  <div className="relative z-10">

                    {/* LOGO */}

                    <div className="mb-7 flex justify-center">

                      <div className="rounded-2xl bg-white/95 px-5 py-3 shadow-2xl backdrop-blur-sm">

                        <Image
                          src="/logo-foodshortai.png"
                          alt="ShortBizAI"
                          width={170}
                          height={170}
                          priority
                          className="h-auto w-[120px] object-contain sm:w-[140px]"
                        />

                      </div>

                    </div>

                    {/* TEXTO DE BIENVENIDA */}

                    <div className="text-center">

                      <p
                        className={`mb-3 text-sm font-bold uppercase tracking-[0.3em] ${
                          imagenRestaurante
                            ? "text-white/90"
                            : "text-gray-500"
                        }`}
                      >

                        {idioma === "es"
                          ? "ShortBizAI te da la bienvenida"
                          : "ShortBizAI welcomes you"}

                      </p>

                      <h1
                        className={`text-4xl font-black leading-tight tracking-tight sm:text-5xl ${
                          imagenRestaurante
                            ? "text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.75)]"
                            : "text-gray-950"
                        }`}
                      >

                        {empresa.nombre}

                      </h1>

                      <div
                        className={`mx-auto mt-5 h-[2px] w-24 ${
                          imagenRestaurante
                            ? "bg-white"
                            : "bg-blue-600"
                        }`}
                      />

                      <p
                        className={`mx-auto mt-6 max-w-xl text-base leading-7 sm:text-lg ${
                          imagenRestaurante
                            ? "text-white/95 drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]"
                            : "text-gray-600"
                        }`}
                      >

                        {idioma === "es"
                          ? "Disfruta de nuestro exquisito menú y reserva tu mesa de manera rápida y sencilla."
                          : "Enjoy our exquisite menu and reserve your table quickly and easily."}

                      </p>

                    </div>

                  </div>

                </div>

                {/* ===========================================
                    ACTIVAR NOTIFICACIONES
                =========================================== */}

                <div className="border-t border-gray-200 bg-white px-6 py-7 sm:px-10 sm:py-8">

                  <div className="mx-auto max-w-xl text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-sm">
                      🔔
                    </div>

                    <h2 className="text-xl font-black tracking-tight text-gray-950 sm:text-2xl">

                      {t.reservarTitulo}

                    </h2>

                    <p className="mt-3 text-[15px] leading-6 text-gray-500 sm:text-base">

                      {idioma === "es"
                        ? "Así podremos avisarte directamente en este dispositivo cuando el restaurante confirme o cancele tu reserva."
                        : "This allows us to notify you directly on this device when the restaurant confirms or cancels your reservation."}

                    </p>

                    <button
                      type="button"
                      onClick={
                        registrarNotificaciones
                      }
                      disabled={
                        activandoNotificaciones
                      }
                      className="mt-6 min-h-[58px] w-full rounded-2xl bg-blue-600 px-6 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-400 sm:text-lg"
                    >

                      {activandoNotificaciones
                        ? t.activando
                        : t.activarBoton}

                    </button>

                    {errorNotificaciones && (

                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold leading-6 text-red-700">

                        {
                          errorNotificaciones
                        }

                      </div>

                    )}

                  </div>

                </div>

              </>

            ) : (

              /* =================================================
                 CHATBOT PREMIUM
              ================================================= */

              <div className="flex flex-col">

                {/* =============================================
                    CABECERA PREMIUM
                ============================================= */}

                <div className="flex items-center gap-4 border-b border-gray-200 bg-white px-5 py-5 sm:px-7">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-md shadow-blue-600/20">
                    🤖
                  </div>

                  <div className="min-w-0">

                    <p className="text-lg font-black tracking-tight text-gray-950 sm:text-xl">
                      ShortBizAI
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-green-600">
                      ●{" "}
                      {idioma === "es"
                        ? "Asistente de reservas disponible"
                        : "Reservation assistant available"}
                    </p>

                  </div>

                </div>

                {/* =============================================
                    MENSAJES
                ============================================= */}

                <div
                  ref={mensajesRef}
                  className="max-h-[520px] min-h-[420px] space-y-5 overflow-y-auto bg-gray-50 px-4 py-6 sm:px-7 sm:py-7"
                >

                  {mensajes.map(
                    (mensaje) => (

                      <div
                        key={
                          mensaje.id
                        }
                        className={`flex ${
                          mensaje.tipo ===
                          "usuario"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[88%] whitespace-pre-line rounded-[1.35rem] px-5 py-4 text-[16px] leading-7 shadow-sm sm:text-[17px] ${
                            mensaje.tipo ===
                            "usuario"
                              ? "rounded-br-md bg-blue-600 text-white shadow-blue-600/10"
                              : "rounded-bl-md border border-gray-200 bg-white text-gray-800 shadow-gray-200/60"
                          }`}
                        >

                          {
                            mensaje.texto
                          }

                        </div>

                      </div>

                    )
                  )}

                  {/* INDICADOR */}

                  {guardando && (

                    <div className="flex justify-start">

                      <div className="rounded-[1.35rem] rounded-bl-md border border-gray-200 bg-white px-5 py-4 shadow-sm">

                        <div className="flex items-center gap-1.5">

                          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-400" />

                          <span
                            className="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-400"
                            style={{
                              animationDelay:
                                "150ms",
                            }}
                          />

                          <span
                            className="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-400"
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

                {/* =============================================
                    SELECTOR DE FECHA
                ============================================= */}

                {paso ===
                  "fecha" &&
                  !guardando && (

                    <div className="border-t border-gray-200 bg-white px-5 py-5 sm:px-7">

                      <div className="relative">

                        <button
                          type="button"
                          onClick={() => {
                            const input =
                              fechaInputRef.current;

                            if (!input) return;

                            try {
                              if (
                                "showPicker" in
                                HTMLInputElement.prototype
                              ) {
                                input.showPicker();
                              } else {
                                input.click();
                              }
                            } catch {
                              input.click();
                            }
                          }}
                          className="flex min-h-[62px] w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] sm:text-lg"
                        >

                          <span className="text-2xl">
                            📅
                          </span>

                          <span>
                            {fecha
                              ? idioma ===
                                "es"
                                ? convertirFecha(
                                    fecha
                                  )
                                : convertirFechaIngles(
                                    fecha
                                  )
                              : t.seleccionarFecha}
                          </span>

                        </button>

                        <input
                          ref={
                            fechaInputRef
                          }
                          type="date"
                          min={
                            obtenerFechaHoy()
                          }
                          value={
                            fecha
                          }
                          onChange={(
                            e
                          ) =>
                            seleccionarFecha(
                              e.target.value
                            )
                          }
                          aria-label={
                            t.seleccionarFecha
                          }
                          className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-0"
                        />

                      </div>

                    </div>

                  )}

                {/* =============================================
                    SELECTOR DE HORA
                ============================================= */}

                {paso ===
                  "hora" &&
                  !guardando && (

                    <div className="border-t border-gray-200 bg-white px-5 py-5 sm:px-7">

                      <button
                        type="button"
                        onClick={() => {
                          horaInputRef.current?.showPicker?.();
                        }}
                        className="flex min-h-[62px] w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] sm:text-lg"
                      >

                        <span className="text-2xl">
                          🕐
                        </span>

                        <span>
                          {hora
                            ? convertirHora(
                                hora
                              )
                            : t.seleccionarHora}
                        </span>

                      </button>

                      <input
                        ref={
                          horaInputRef
                        }
                        type="time"
                        value={
                          hora
                        }
                        onChange={(
                          e
                        ) =>
                          seleccionarHora(
                            e.target.value
                          )
                        }
                        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-0"
                        tabIndex={-1}
                        aria-hidden="true"
                      />

                    </div>

                  )}

                {/* =============================================
                    PERSONAS
                ============================================= */}

                {paso ===
                  "personas" &&
                  !guardando && (

                    <div className="border-t border-gray-200 bg-white px-5 py-5 sm:px-7">

                      <div className="mb-4 text-center text-sm font-semibold text-gray-500">

                        {idioma === "es"
                          ? "Selecciona el número de personas"
                          : "Select the number of people"}

                      </div>

                      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">

                        {[
                          1,
                          2,
                          3,
                          4,
                          5,
                          6,
                          7,
                        ].map(
                          (
                            numero
                          ) => (

                            <button
                              key={
                                numero
                              }
                              type="button"
                              onClick={() => {

                                const valor =
                                  String(
                                    numero
                                  );

                                setPersonas(
                                  valor
                                );

                                const fechaTexto =
                                  idioma ===
                                  "es"
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
                                  `👥 ${t.resumenPersonas}: ${valor}`;

                                agregarMensaje(
                                  "usuario",
                                  valor
                                );

                                agregarMensaje(
                                  "ia",
                                  t.preguntaEmail
                                );

                                setPaso(
                                  "email"
                                );
                              }}
                              className="min-h-[56px] rounded-2xl border border-gray-200 bg-white text-lg font-bold text-gray-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 active:scale-95"
                            >

                              {
                                numero
                              }

                            </button>

                          )
                        )}

                      </div>

                      <button
                        type="button"
                        onClick={() => {

                          const valor =
                            "8";

                          setPersonas(
                            valor
                          );

                          const fechaTexto =
                            idioma ===
                            "es"
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
                            `👥 ${t.resumenPersonas}: 8+`;

                          agregarMensaje(
                            "usuario",
                            "8+"
                          );

                          agregarMensaje(
                            "ia",
                            t.preguntaEmail
                          );

                          setPaso(
                            "email"
                          );
                        }}
                        className="mt-3 min-h-[56px] w-full rounded-2xl border border-gray-200 bg-white text-lg font-bold text-gray-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 active:scale-95"
                      >

                        8+

                      </button>

                    </div>

                  )}

                {/* =============================================
                    CONFIRMACIÓN
                ============================================= */}

                {paso ===
                  "confirmacion" &&
                  !guardando && (

                    <div className="border-t border-gray-200 bg-white px-5 py-5 sm:px-7">

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
                          className="min-h-[58px] rounded-2xl bg-blue-600 px-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
                        >

                          ✅{" "}
                          {
                            t.si
                          }

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
                          className="min-h-[58px] rounded-2xl border border-gray-200 bg-white px-4 text-base font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.99]"
                        >

                          ✏️{" "}
                          {
                            t.no
                          }

                        </button>

                      </div>

                    </div>

                  )}



{/* =============================================
    INPUT CHAT
============================================= */}

{paso !==
  "finalizado" &&
  paso !==
    "beneficio" &&
  paso !==
    "confirmacion" &&
  paso !==
    "fecha" &&
  paso !==
    "hora" &&
  paso !==
    "personas" &&
  paso !==
    "email" && (

    <ReservaChat
      entrada={entrada}
      setEntrada={setEntrada}
      enviarMensaje={enviarMensaje}
      deshabilitado={guardando}
      idioma={idioma}
    />

  )}

                {/* =============================================
                    EMAIL / CAPTURA OBLIGATORIA
                ============================================= */}

                {paso ===
                  "email" && (

                  <div className="border-t border-gray-200 bg-white px-5 py-6 sm:px-7">

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">

                      <div className="text-2xl">
                        ✉️
                      </div>

                      <h2 className="mt-2 text-xl font-black text-gray-950 sm:text-2xl">
                        {t.preguntaEmail}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                        {idioma === "es"
                          ? "Necesitamos tu correo para identificar tu reserva y mantenerte informado."
                          : "We need your email to identify your reservation and keep you informed."}
                      </p>

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key ===
                            "Enter"
                          ) {
                            e.preventDefault();

                            const emailLimpio =
                              email
                                .trim()
                                .toLowerCase();

                            if (
                              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                emailLimpio
                              )
                            ) {
                              agregarMensaje(
                                "ia",
                                t.emailInvalido
                              );
                              return;
                            }

                            setEmail(
                              emailLimpio
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
                              `👥 ${t.resumenPersonas}: ${personas}\n` +
                              `✉️ ${t.resumenEmail}: ${emailLimpio}`;

                            agregarMensaje(
                              "ia",
                              `${resumen}\n\n${t.confirmar}`
                            );

                            setPaso(
                              "confirmacion"
                            );
                          }
                        }}
                        placeholder="email@example.com"
                        autoComplete="email"
                        className="mt-4 min-h-[56px] w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />

                      <button
                        type="button"
                        onClick={() => {

                          const emailLimpio =
                            email
                              .trim()
                              .toLowerCase();

                          if (
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              emailLimpio
                            )
                          ) {
                            agregarMensaje(
                              "ia",
                              t.emailInvalido
                            );
                            return;
                          }

                          setEmail(
                            emailLimpio
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
                            `👥 ${t.resumenPersonas}: ${personas}\n` +
                            `✉️ ${t.resumenEmail}: ${emailLimpio}`;

                          agregarMensaje(
                            "ia",
                            `${resumen}\n\n${t.confirmar}`
                          );

                          setPaso(
                            "confirmacion"
                          );

                        }}
                        className="mt-3 min-h-[56px] w-full rounded-xl bg-blue-600 px-5 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                      >
                        {idioma === "es"
                          ? "Continuar →"
                          : "Continue →"}
                      </button>

                    </div>

                  </div>

                )}

                {/* =============================================
                    BENEFICIO / CAPTURA DE EMAIL
                ============================================= */}

                {paso ===
                  "beneficio" && (

                  <div className="border-t border-gray-200 bg-white px-5 py-6 sm:px-7">

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">

                      <div className="text-2xl">
                        🎁
                      </div>

                      <h2 className="mt-2 text-xl font-black text-gray-950 sm:text-2xl">
                        {t.beneficioTitulo}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                        {t.beneficioDescripcion}
                      </p>

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key ===
                            "Enter"
                          ) {
                            e.preventDefault();

                            if (
                              !guardandoEmail
                            ) {
                              guardarEmailBeneficio();
                            }
                          }
                        }}
                        placeholder={
                          t.beneficioPlaceholder
                        }
                        autoComplete="email"
                        disabled={
                          guardandoEmail
                        }
                        className="mt-4 min-h-[56px] w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />

                      <button
                        type="button"
                        onClick={
                          guardarEmailBeneficio
                        }
                        disabled={
                          guardandoEmail
                        }
                        className="mt-3 min-h-[56px] w-full rounded-xl bg-blue-600 px-5 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {
                          guardandoEmail
                            ? "..."
                            : t.beneficioBoton
                        }
                      </button>

                      <button
                        type="button"
                        onClick={() => {

                          agregarMensaje(
                            "ia",
                            t.esperando
                          );

                          setPaso(
                            "finalizado"
                          );

                        }}
                        disabled={
                          guardandoEmail
                        }
                        className="mt-3 w-full py-2 text-sm font-semibold text-gray-500 transition hover:text-gray-800 disabled:opacity-50"
                      >
                        {
                          t.beneficioOmitir
                        }
                      </button>

                    </div>

                  </div>

                )}

                {/* =============================================
                    FINAL
                ============================================= */}

                {paso ===
                  "finalizado" && (

                  <div className="border-t border-gray-200 bg-white px-5 py-6 sm:px-7">

                    {mensajeExito && (

                      <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-[15px] font-semibold leading-6 text-green-800 sm:text-base">

                        {
                          mensajeExito
                        }

                      </div>

                    )}

                    {errorReserva && (

                      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[15px] font-semibold leading-6 text-red-700">

                        {
                          errorReserva
                        }

                      </div>

                    )}

                    <button
                      type="button"
                      onClick={
                        reiniciarConversacion
                      }
                      className="min-h-[58px] w-full rounded-2xl bg-blue-600 px-5 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:text-lg"
                    >

                      {
                        t.nuevaReserva
                      }

                    </button>

                  </div>

                )}

              </div>

            )}

          </section>

        </div>

      </main>

    </NotificacionesObligatorias>
  );
}