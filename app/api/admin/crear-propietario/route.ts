import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // =====================================================
    // 1. VERIFICAR QUE QUIEN HACE LA PETICIÓN SEA ADMIN
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

    const accessToken = authHeader.replace(
      "Bearer ",
      ""
    );

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
    // 2. COMPROBAR PERFIL SUPER ADMIN
    // =====================================================

    const { data: perfil, error: perfilError } =
      await supabaseAdmin
        .from("perfiles")
        .select("user_id, nombre, rol, activo")
        .eq("user_id", user.id)
        .maybeSingle();

    if (perfilError) {
      console.error(
        "ERROR CONSULTANDO PERFIL ADMIN:",
        perfilError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible comprobar el perfil administrador.",
        },
        { status: 500 }
      );
    }

    if (
      !perfil ||
      perfil.rol !== "super_admin" ||
      perfil.activo === false
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "No tienes permisos de administrador.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 3. RECIBIR DATOS
    // =====================================================

    const body = await request.json();

    const empresaId = Number(body?.empresaId);

    const nombre = String(
      body?.nombre || ""
    ).trim();

    const email = String(
      body?.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      body?.password || ""
    );

    // =====================================================
    // 4. VALIDACIONES
    // =====================================================

    if (
      !Number.isInteger(empresaId) ||
      empresaId <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "El ID de empresa no es válido.",
        },
        { status: 400 }
      );
    }

    if (!nombre) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El nombre del propietario es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El email del propietario no es válido.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La contraseña del propietario es obligatoria.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La contraseña debe tener al menos 8 caracteres.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 5. COMPROBAR EMPRESA
    // =====================================================

    const { data: empresa, error: empresaError } =
      await supabaseAdmin
        .from("empresas")
        .select("id, nombre, activo")
        .eq("id", empresaId)
        .maybeSingle();

    if (empresaError) {
      console.error(
        "ERROR CONSULTANDO EMPRESA:",
        empresaError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible consultar la empresa.",
        },
        { status: 500 }
      );
    }

    if (!empresa) {
      return NextResponse.json(
        {
          ok: false,
          error: "La empresa no existe.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 6. CREAR USUARIO DIRECTAMENTE EN SUPABASE AUTH
    // =====================================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nombre,
          rol: "propietario",
          empresa_id: empresaId,
        },
      });

    if (authError || !authData.user) {
      console.error(
        "ERROR CREANDO USUARIO AUTH:",
        authError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            authError?.message ||
            "No fue posible crear la cuenta del propietario.",
        },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // =====================================================
    // 7. CREAR PERFIL
    // =====================================================

    const { error: perfilInsertError } =
      await supabaseAdmin
        .from("perfiles")
        .insert([
          {
            user_id: userId,
            nombre,
            rol: "propietario",
            activo: true,
          },
        ]);

    if (perfilInsertError) {
      console.error(
        "ERROR CREANDO PERFIL:",
        perfilInsertError
      );

      await supabaseAdmin.auth.admin.deleteUser(
        userId
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible crear el perfil del propietario.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 8. VINCULAR USUARIO CON EMPRESA
    // =====================================================

    const { error: relacionError } =
      await supabaseAdmin
        .from("usuarios_empresas")
        .insert([
          {
            user_id: userId,
            empresa_id: empresaId,
            rol: "propietario",
            activo: true,
          },
        ]);

    if (relacionError) {
      console.error(
        "ERROR CREANDO RELACIÓN USUARIO-EMPRESA:",
        relacionError
      );

      await supabaseAdmin
        .from("perfiles")
        .delete()
        .eq("user_id", userId);

      await supabaseAdmin.auth.admin.deleteUser(
        userId
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible vincular el propietario con la empresa.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 9. RESPUESTA
    // =====================================================

    return NextResponse.json({
      ok: true,
      message:
        "Propietario creado y vinculado correctamente.",
      propietario: {
        user_id: userId,
        nombre,
        email,
        empresa_id: empresaId,
        empresa_nombre: empresa.nombre,
        rol: "propietario",
      },
    });
  } catch (error: any) {
    console.error(
      "ERROR GENERAL CREANDO PROPIETARIO:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Error inesperado creando propietario.",
      },
      { status: 500 }
    );
  }
}