"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";


type SpeechRecognitionEventLike = Event & {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type ReservaChatProps = {
  entrada: string;
  setEntrada: (valor: string) => void;
  enviarMensaje: () => void;
  deshabilitado?: boolean;
  idioma?: "es" | "en";
};

export default function ReservaChat({
  entrada,
  setEntrada,
  enviarMensaje,
  deshabilitado = false,
  idioma = "es",
}: ReservaChatProps) {
  const [escuchando, setEscuchando] = useState(false);
  const [micDisponible, setMicDisponible] = useState(false);
  const [errorMic, setErrorMic] = useState("");

  const reconocimientoRef =
    useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    setMicDisponible(Boolean(SpeechRecognitionAPI));

    return () => {
      if (reconocimientoRef.current) {
        try {
          reconocimientoRef.current.stop();
        } catch {
          // No hacer nada si ya estaba detenido.
        }
      }
    };
  }, []);

  const alternarMicrofono = () => {
    if (deshabilitado) return;

    if (escuchando) {
      reconocimientoRef.current?.stop();
      setEscuchando(false);
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setErrorMic(
        idioma === "es"
          ? "Tu navegador no admite dictado por voz."
          : "Your browser does not support voice dictation."
      );
      return;
    }

    setErrorMic("");

    const reconocimiento = new SpeechRecognitionAPI();

    reconocimiento.lang =
      idioma === "es" ? "es-US" : "en-US";

    reconocimiento.interimResults = true;
    reconocimiento.continuous = false;

    reconocimiento.onresult = (
      event: SpeechRecognitionEventLike
    ) => {
      let texto = "";

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {
        const resultado = event.results[i];

        if (resultado?.[0]?.transcript) {
          texto += resultado[0].transcript;
        }
      }

      if (texto.trim()) {
        setEntrada(texto.trim());
      }
    };

    reconocimiento.onerror = (event) => {
      setEscuchando(false);

      if (event.error === "not-allowed") {
        setErrorMic(
          idioma === "es"
            ? "Debes permitir el acceso al micrófono."
            : "You must allow microphone access."
        );
      } else {
        setErrorMic(
          idioma === "es"
            ? "No se pudo usar el micrófono. Inténtalo nuevamente."
            : "The microphone could not be used. Please try again."
        );
      }
    };

    reconocimiento.onend = () => {
      setEscuchando(false);
      reconocimientoRef.current = null;
    };

    reconocimientoRef.current = reconocimiento;

    try {
      reconocimiento.start();
      setEscuchando(true);
    } catch {
      setEscuchando(false);
      reconocimientoRef.current = null;

      setErrorMic(
        idioma === "es"
          ? "No se pudo iniciar el micrófono."
          : "Could not start the microphone."
      );
    }
  };

  const manejarCambio = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setEntrada(event.target.value);
  };

  const manejarTecla = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (
        entrada.trim() &&
        !deshabilitado
      ) {
        enviarMensaje();
      }
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3 sm:p-5">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex w-full items-center gap-2 sm:gap-3">

          {/* CAMPO DE TEXTO */}
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={entrada}
              onChange={manejarCambio}
              onKeyDown={manejarTecla}
              placeholder={
                idioma === "es"
                  ? "Escribe tu respuesta..."
                  : "Type your answer..."
              }
              disabled={deshabilitado}
              autoComplete="off"
              className="h-14 w-full min-w-0 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[16px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100 sm:h-[58px] sm:px-5 sm:text-[17px]"
            />
          </div>

          {/* MICRÓFONO */}
          {micDisponible && (
            <button
              type="button"
              onClick={alternarMicrofono}
              disabled={deshabilitado}
              aria-label={
                escuchando
                  ? idioma === "es"
                    ? "Detener micrófono"
                    : "Stop microphone"
                  : idioma === "es"
                    ? "Hablar"
                    : "Speak"
              }
              title={
                escuchando
                  ? idioma === "es"
                    ? "Detener"
                    : "Stop"
                  : idioma === "es"
                    ? "Hablar"
                    : "Speak"
              }
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl shadow-md transition sm:h-[58px] sm:w-[58px] ${
                escuchando
                  ? "animate-pulse bg-red-500 text-white shadow-red-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {escuchando ? "⏹️" : "🎙️"}
            </button>
          )}

          {/* ENVIAR */}
          <button
            type="button"
            onClick={enviarMensaje}
            disabled={
              deshabilitado ||
              !entrada.trim()
            }
            aria-label={
              idioma === "es"
                ? "Enviar mensaje"
                : "Send message"
            }
            title={
              idioma === "es"
                ? "Enviar"
                : "Send"
            }
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-[22px] text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none sm:h-[58px] sm:w-[58px]"
          >
            ➤
          </button>

        </div>

        {/* MENSAJE DEL MICRÓFONO */}
        {errorMic && (
          <div className="mt-2 px-1 text-xs text-red-500 sm:text-sm">
            {errorMic}
          </div>
        )}

        {escuchando && (
          <div className="mt-2 flex items-center gap-2 px-1 text-xs font-medium text-red-500 sm:text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {idioma === "es"
              ? "Escuchando..."
              : "Listening..."}
          </div>
        )}
      </div>
    </div>
  );
}