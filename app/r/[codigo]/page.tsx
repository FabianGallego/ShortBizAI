import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function EmpresaPorCodigoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;

  const codigoLimpio = decodeURIComponent(codigo).trim();

  const { data: empresa, error } = await supabaseAdmin
    .from("empresas")
    .select(
      "id, nombre, tipo, ciudad, pais, codigo_publico"
    )
    .eq("codigo_publico", codigoLimpio)
    .maybeSingle();

  if (error) {
    console.error(
      "ERROR BUSCANDO EMPRESA POR CÓDIGO:",
      error
    );

    throw new Error(
      "No se pudo consultar la empresa"
    );
  }

  if (!empresa) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "32px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          {empresa.nombre}
        </h1>

        <p
          style={{
            fontSize: "18px",
            marginBottom: "8px",
          }}
        >
          {empresa.tipo || "Restaurante"}
        </p>

        <p
          style={{
            color: "#666",
            marginBottom: "24px",
          }}
        >
          {empresa.ciudad}
          {empresa.pais
            ? `, ${empresa.pais}`
            : ""}
        </p>

        <div
          style={{
            padding: "16px",
            borderRadius: "12px",
            background: "#f0f0f0",
            marginBottom: "20px",
          }}
        >
          <strong>Código detectado:</strong>

          <div
            style={{
              marginTop: "6px",
              fontFamily: "monospace",
              fontSize: "18px",
            }}
          >
            {empresa.codigo_publico}
          </div>
        </div>

        <p
          style={{
            color: "#555",
          }}
        >
          ✅ ShortBizAI identificó correctamente esta
          empresa.
        </p>
      </div>
    </main>
  );
}