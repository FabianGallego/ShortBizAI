import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Props = {
  params: Promise<{
    codigo: string;
  }>;
};

export default async function EmpresaPorCodigoPage({
  params,
}: Props) {
  const { codigo } = await params;

  const { data: empresa, error } = await supabaseAdmin
    .from("empresas")
    .select("id")
    .eq("codigo_publico", codigo)
    .maybeSingle();

  if (error) {
    console.error("ERROR BUSCANDO EMPRESA:", error);
    notFound();
  }

  if (!empresa) {
    notFound();
  }

  redirect(
    `/cliente/agente-aaf?empresaId=${encodeURIComponent(
      String(empresa.id)
    )}`
  );
}