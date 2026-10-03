import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

function crearCodigoConexion() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request: Request) {
  try {
    // =====================================================
    // 1. COMPROBAR TOKEN DEL BOT
    // =====================================================

    if (!TELEGRAM_TOKEN) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Falta TELEGRAM_BOT_TOKEN en las variables de entorno.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 2. VALIDAR SESIÓN DEL PROPIETARIO
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

    const accessToken = authHeader
      .replace("Bearer ", "")
      .trim();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error(
        "ERROR VALIDANDO SESIÓN:",
        userError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Sesión no válida.",
        },
        { status: 401 }
      );
    }

    console.log(
      "TELEGRAM CONECTAR - USUARIO:",
      user.id
    );

    // =====================================================
    // 3. BUSCAR EMPRESA DEL PROPIETARIO
    // =====================================================

    const {
      data: relacion,
      error: relacionError,
    } = await supabaseAdmin
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
          error:
            "No fue posible encontrar la empresa del propietario.",
        },
        { status: 500 }
      );
    }

    if (!relacion) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No encontramos una empresa asociada a este propietario.",
        },
        { status: 403 }
      );
    }

    const empresaId = Number(relacion.empresa_id);

    console.log(
      "TELEGRAM CONECTAR - EMPRESA:",
      empresaId
    );

    // =====================================================
    // 4. COMPROBAR EMPRESA
    // =====================================================

    const {
      data: empresa,
      error: empresaError,
    } = await supabaseAdmin
      .from("empresas")
      .select("id, nombre, activo")
      .eq("id", empresaId)
      .maybeSingle();

    if (empresaError) {
      console.error(
        "ERROR BUSCANDO EMPRESA:",
        empresaError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible comprobar la empresa.",
        },
        { status: 500 }
      );
    }

    if (!empresa) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No encontramos la empresa asociada.",
        },
        { status: 404 }
      );
    }

    if (empresa.activo === false) {
      return NextResponse.json(
        {
          ok: false,
          error: "La empresa no está activa.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 5. OBTENER NOMBRE DEL BOT
    // =====================================================

    let botUsername =
      TELEGRAM_BOT_USERNAME
        ?.trim()
        .replace(/^@/, "");

    if (!botUsername) {
      console.log(
        "TELEGRAM_BOT_USERNAME no está configurado. Consultando getMe..."
      );

      const respuestaBot = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const resultadoBot =
        await respuestaBot.json();

      console.log(
        "RESPUESTA TELEGRAM getMe:",
        JSON.stringify(
          resultadoBot,
          null,
          2
        )
      );

      if (
        !respuestaBot.ok ||
        !resultadoBot?.ok ||
        !resultadoBot?.result?.username
      ) {
        console.error(
          "ERROR OBTENIENDO BOT TELEGRAM:",
          resultadoBot
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "No fue posible obtener el nombre del bot de Telegram. Configura TELEGRAM_BOT_USERNAME.",
          },
          { status: 500 }
        );
      }

      botUsername = String(
        resultadoBot.result.username
      ).replace(/^@/, "");
    }

    // =====================================================
    // 6. GENERAR CÓDIGO DE 6 DÍGITOS
    // =====================================================

    const codigo = crearCodigoConexion();

    const expiraAt = new Date(
      Date.now() + 10 * 60 * 1000
    ).toISOString();

    console.log(
      "================================="
    );
    console.log(
      "TELEGRAM CÓDIGO DE CONEXIÓN"
    );
    console.log(
      "EMPRESA:",
      empresa.id
    );
    console.log(
      "NOMBRE:",
      empresa.nombre
    );
    console.log(
      "BOT:",
      botUsername
    );
    console.log(
      "CÓDIGO:",
      codigo
    );
    console.log(
      "EXPIRA:",
      expiraAt
    );
    console.log(
      "================================="
    );

    // =====================================================
    // 7. GUARDAR CÓDIGO EN SUPABASE
    // =====================================================

    const {
      error: codigoError,
    } = await supabaseAdmin
      .from("telegram_conexiones")
      .upsert(
        {
          empresa_id: empresa.id,
          codigo,
          expira_at: expiraAt,
          usado_at: null,
        },
        {
          onConflict: "empresa_id",
        }
      );

    if (codigoError) {
      console.error(
        "ERROR GUARDANDO CÓDIGO TELEGRAM:",
        codigoError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible guardar el código de conexión.",
          detalle: codigoError.message,
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 8. DEVOLVER DATOS A LA PÁGINA
    // =====================================================

    const telegramUrl =
      `https://t.me/${botUsername}`;

    return NextResponse.json({
      ok: true,
      codigo,
      telegramUrl,
      botUsername,
      empresaId: empresa.id,
      empresaNombre: empresa.nombre,
      expiraAt,
    });
  } catch (error: any) {
    console.error(
      "ERROR PREPARANDO CONEXIÓN TELEGRAM:",
      error
    );

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