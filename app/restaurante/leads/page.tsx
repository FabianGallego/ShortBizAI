"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);

  async function cargarLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setLeads(data || []);
  }

  useEffect(() => {
    cargarLeads();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        🎯 Centro de Leads
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Origen</th>
            <th>Intención</th>
            <th>Estado AAF</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.nombre}</td>
              <td>{lead.telefono}</td>
              <td>{lead.origen}</td>
              <td>{lead.intencion}</td>
              <td>{lead.estado_aaf}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}