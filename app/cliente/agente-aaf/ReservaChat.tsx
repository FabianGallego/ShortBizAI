"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

type ResultadoVoz = {
  transcript: string;
};

type ResultadoVozItem = {
  isFinal: boolean;
  0: ResultadoVoz;
};

type EventoResultadoVoz = {
  resultIndex: number;
  results: ArrayLike<ResultadoVozItem>;
};

type EventoErrorVoz = {
  error: string;
};

type ReconocimientoVoz = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: EventoErrorVoz) => void) | null;
  onresult: ((event: EventoResultadoVoz) => void) | null;
};

type VentanaConReconocimientoVoz = Window & {
  SpeechRecognition?: new () => ReconocimientoVoz;
  webkitSpeechRecognition?: new () => ReconocimientoVoz;
};

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
  const [errorVoz, setErrorVoz] = useState("");

  const reconocimientoRef =
    useRef<ReconocimientoVoz | null>(null);

  useEffect(() => {
    const ventana =
      window as VentanaConReconocimientoVoz;

    const Reconocimiento =
      ventana.SpeechRecognition ||
      ventana.webkitSpeechRecognition;

    if (!Reconocimiento) {
      setMicDisponible(false);
      return;
    }

    setMicDisponible(true);

    return () => {
      if (reconocimientoRef.current) {
        reconocimientoRef.current.abort();
        reconocimientoRef.current = null;
      }
    };
  }, []);

  const alternarMicrofono = () => {
    if (deshabilitado) return;

    const ventana =
      window as VentanaConReconocimientoVoz;

    const Reconocimiento =
      ventana.SpeechRecognition ||
      ventana.webkitSpeechRecognition;

    if (!Reconocimiento) {
      setErrorVoz(
        idioma === "es"
          ? "El reconocimiento de voz no está disponible en este navegador."
          : "Speech recognition is not available in this browser."
      );
      return;
    }

    if (escuchando) {
      reconocimientoRef.current?.stop();
      return;
    }

    setErrorVoz("");

    const reconocimiento =
      new Reconocimiento();

    reconocimiento.lang =
      idioma === "es"
        ? "es-US"
        : "en-US";

    reconocimiento.interimResults = true;
    reconocimiento.continuous = false;

    reconocimiento.onstart = () => {
      setEscuchando(true);
      setErrorVoz("");
    };

    reconocimiento.onend = () => {
      setEscuchando(false);
      reconocimientoRef.current = null;
    };

    reconocimiento.onerror = (event) => {
      setEscuchando(false);
      reconocimientoRef.current = null;

      if (event.error === "not-allowed") {
        setErrorVoz(
          idioma === "es"
            ? "Permite el acceso al micrófono para usar esta función."
            : "Allow microphone access to use this feature."
        );
      } else {
        setErrorVoz(
          idioma === "es"
            ? "No pude reconocer la voz. Inténtalo nuevamente."
            : "I couldn't recognize your voice. Please try again."
        );
      }
    };

    reconocimiento.onresult = (event) => {
      let texto = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        texto +=
          event.results[i][0].transcript;
      }

      if (texto.trim()) {
        setEntrada(texto.trim());
      }
    };

    reconocimientoRef.current =
      reconocimiento;

    try {
      reconocimiento.start();
    } catch {
      setEscuchando(false);
      reconocimientoRef.current = null;
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
    if (event.key === "Enter") {
      event.preventDefault();

      if (
        !deshabilitado &&
        entrada.trim()
      ) {
        enviarMensaje();
      }
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 sm:p-5">

      {errorVoz && (
        <div className="mb-2 text-center text-xs font-medium text-red-600">
          {errorVoz}
        </div>
      )}

      {escuchando && (
        <div className="mb-2 text-center text-sm font-semibold text-red-600">
          🔴{" "}
          {idioma === "es"
            ? "Escuchando..."
            : "Listening..."}
        </div>
      )}

      <div className="flex items-end gap-3">

        <input
          type="text"
          value={entrada}
          onChange={manejarCambio}
          onKeyDown={manejarTecla}
          placeholder={
            escuchando
              ? idioma === "es"
                ? "Habla ahora..."
                : "Speak now..."
              : idioma === "es"
              ? "Escribe tu respuesta..."
              : "Type your answer..."
          }
          disabled={deshabilitado}
          autoComplete="off"
          className="min-h-[58px] flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-5 text-[16px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100 sm:text-[17px]"
        />

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
            className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl text-xl transition-all ${
              escuchando
                ? "animate-pulse bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            🎤
          </button>
        )}

        <button
          type="button"
          onClick={enviarMensaje}
          disabled={
            deshabilitado ||
            !entrada.trim()
          }
          className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          ➤
        </button>

      </div>
    </div>
  );
}