import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

function crearTokenConexion(empresaId: number, expira: number) {
  if (!TELEGRAM_TOKEN) {
    throw new Error("Falta TELEGRAM_BOT_TOKEN.");
  }

  const datos = `${empresaId}.${expira}`;

  const firma = crypto
    .createHmac("sha256", TELEGRAM_TOKEN)
    .update(datos)
    .digest("hex")
    .slice(0, 32);

 return `${empresaId}_${expira}_${firma}`;
}

export async function POST(request: Request) {
  try {
    if (!TELEGRAM_TOKEN) {
      return NextResponse.json(
        {
          ok: false,
          error: "Falta TELEGRAM_BOT_TOKEN en las variables de entorno.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 1. VALIDAR SESIÓN DEL PROPIETARIO
    // =====================================================

    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          ok: false,
          error: "No autorizado.",
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Sesión no válida.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 2. BUSCAR EMPRESA DEL PROPIETARIO
    // =====================================================

    const { data: relacion, error: relacionError } =
      await supabaseAdmin
        .from("usuarios_empresas")
        .select("empresa_id, rol, activo")
        .eq("user_id", user.id)
        .eq("rol", "propietario")
        .eq("activo", true)
        .maybeSingle();

    if (relacionError) {
      console.error(
        "ERROR BUSCANDO EMPRESA DEL PROPIETARIO:",
        relacionError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "No fue posible encontrar la empresa del propietario.",
        },
        { status: 500 }
      );
    }

    if (!relacion) {
      return NextResponse.json(
        {
          ok: false,
          error: "No encontramos una empresa asociada a este propietario.",
        },
        { status: 403 }
      );
    }

    const empresaId = Number(relacion.empresa_id);

    // =====================================================
    // 3. COMPROBAR EMPRESA ACTIVA
    // =====================================================

    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from("empresas")
      .select("id, nombre, activo")
      .eq("id", empresaId)
      .maybeSingle();

    if (empresaError) {
      console.error("ERROR BUSCANDO EMPRESA:", empresaError);

      return NextResponse.json(
        {
          ok: false,
          error: "No fue posible comprobar la empresa.",
        },
        { status: 500 }
      );
    }

    if (!empresa || empresa.activo === false) {
      return NextResponse.json(
        {
          ok: false,
          error: "La empresa no está activa.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 4. OBTENER NOMBRE DEL BOT
    // =====================================================

    let botUsername = TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");

    if (!botUsername) {
      const respuestaBot = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const resultadoBot = await respuestaBot.json();

      if (!respuestaBot.ok || !resultadoBot?.ok || !resultadoBot?.result?.username) {
        console.error("ERROR OBTENIENDO BOT TELEGRAM:", resultadoBot);

        return NextResponse.json(
          {
            ok: false,
            error:
              "No fue posible obtener el nombre del bot de Telegram. Configura TELEGRAM_BOT_USERNAME.",
          },
          { status: 500 }
        );
      }

      botUsername = String(resultadoBot.result.username).replace(/^@/, "");
    }

    // =====================================================
    // 5. CREAR TOKEN TEMPORAL
    // =====================================================

    // El enlace dura 10 minutos.
    const expira = Math.floor(Date.now() / 1000) + 10 * 60;

    const token = crearTokenConexion(empresaId, expira);

    const telegramUrl =
      `https://t.me/${botUsername}?start=${encodeURIComponent(
        `empresa_${token}`
      )}`;

    console.log("=================================");
    console.log("TELEGRAM CONEXIÓN PREPARADA");
    console.log("EMPRESA:", empresa.id);
    console.log("NOMBRE:", empresa.nombre);
    console.log("BOT:", botUsername);
    console.log("EXPIRA:", new Date(expira * 1000).toISOString());
    console.log("=================================");

    return NextResponse.json({
      ok: true,
      telegramUrl,
      empresaId: empresa.id,
      empresaNombre: empresa.nombre,
      expira,
    });
  } catch (error: any) {
    console.error("ERROR PREPARANDO CONEXIÓN TELEGRAM:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "No fue posible preparar la conexión con Telegram.",
      },
      { status: 500 }
    );
  }
}
