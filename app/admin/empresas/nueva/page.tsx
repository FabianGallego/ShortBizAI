"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaEmpresaPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [nombrePropietario, setNombrePropietario] = useState("");
  const [emailPropietario, setEmailPropietario] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("New York");
  const [direccion, setDireccion] = useState("");
  const [plan, setPlan] = useState("free");
  const [sistemaReservas, setSistemaReservas] = useState(true);
  const [urlReservas, setUrlReservas] = useState("");

  function guardarFormulario() {
    alert(
      "La pantalla está funcionando. En el siguiente paso conectaremos este formulario con Supabase para crear la empresa."
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f4f5",
        color: "#18181b",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#111827",
          color: "#ffffff",
          padding: "18px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            ShortBizAI
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "13px",
              color: "#d1d5db",
            }}
          >
            Panel de administración
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin")}
          style={{
            border: "1px solid #4b5563",
            background: "transparent",
            color: "#ffffff",
            borderRadius: "9px",
            padding: "9px 13px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Volver a empresas
        </button>
      </header>

      {/* CONTENIDO */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "35px 20px 70px",
        }}
      >
        {/* TITULO */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 800,
            }}
          >
            Crear empresa
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#71717a",
              fontSize: "15px",
            }}
          >
            Registra un nuevo negocio en ShortBizAI.
          </p>
        </div>

        {/* FORMULARIO */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "18px",
            padding: "28px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "22px",
            }}
          >
            {/* NOMBRE EMPRESA */}
            <Campo
              label="Nombre del negocio"
              requerido
              value={nombre}
              onChange={setNombre}
              placeholder="Ej. Gurys Bakery"
            />

            {/* TIPO */}
            <div>
              <label style={labelStyle}>
                Tipo de negocio <span style={{ color: "#dc2626" }}>*</span>
              </label>

              <select
                defaultValue="Restaurante"
                style={inputStyle}
              >
                <option>Restaurante</option>
                <option>Panadería</option>
                <option>Barbería</option>
                <option>Tienda</option>
                <option>Clínica</option>
                <option>Otro</option>
              </select>
            </div>

            {/* PROPIETARIO */}
            <Campo
              label="Nombre del propietario"
              requerido
              value={nombrePropietario}
              onChange={setNombrePropietario}
              placeholder="Nombre completo"
            />

            {/* EMAIL */}
            <Campo
              label="Email del propietario"
              requerido
              type="email"
              value={emailPropietario}
              onChange={setEmailPropietario}
              placeholder="owner@restaurant.com"
            />

            {/* TELEFONO */}
            <Campo
              label="Teléfono"
              requerido
              value={telefono}
              onChange={setTelefono}
              placeholder="(929) 000-0000"
            />

            {/* CIUDAD */}
            <Campo
              label="Ciudad"
              requerido
              value={ciudad}
              onChange={setCiudad}
              placeholder="New York"
            />

            {/* DIRECCION */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Dirección</label>

              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección del negocio"
                style={inputStyle}
              />
            </div>

            {/* PLAN */}
            <div>
              <label style={labelStyle}>Plan</label>

              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                style={inputStyle}
              >
                <option value="free">Free</option>
                <option value="initial">Inicial</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {/* SISTEMA RESERVAS */}
            <div>
              <label style={labelStyle}>
                Sistema de reservas
              </label>

              <select
                value={sistemaReservas ? "shortbizai" : "externo"}
                onChange={(e) =>
                  setSistemaReservas(
                    e.target.value === "shortbizai"
                  )
                }
                style={inputStyle}
              >
                <option value="shortbizai">
                  ShortBizAI
                </option>

                <option value="externo">
                  Sistema externo
                </option>
              </select>
            </div>

            {/* URL */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                URL externa de reservas
                <span
                  style={{
                    fontWeight: 400,
                    color: "#71717a",
                    marginLeft: "5px",
                  }}
                >
                  (opcional)
                </span>
              </label>

              <input
                type="url"
                value={urlReservas}
                onChange={(e) => setUrlReservas(e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* SEPARADOR */}
          <div
            style={{
              height: "1px",
              background: "#e4e4e7",
              margin: "30px 0 24px",
            }}
          />

          {/* AVISO */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "15px 16px",
              fontSize: "13px",
              color: "#475569",
              lineHeight: 1.5,
            }}
          >
            <strong>Configuración inicial</strong>
            <br />
            Después de crear la empresa configuraremos el propietario,
            las notificaciones y Telegram.
          </div>

          {/* BOTONES */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "25px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/admin")}
              style={{
                border: "1px solid #d4d4d8",
                background: "#ffffff",
                color: "#18181b",
                borderRadius: "10px",
                padding: "12px 18px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarFormulario}
              style={{
                border: "none",
                background: "#111827",
                color: "#ffffff",
                borderRadius: "10px",
                padding: "12px 20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Crear empresa
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTE CAMPO
========================================================= */

type CampoProps = {
  label: string;
  requerido?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function Campo({
  label,
  requerido,
  type = "text",
  value,
  onChange,
  placeholder,
}: CampoProps) {
  return (
    <div>
      <label style={labelStyle}>
        {label}

        {requerido && (
          <span style={{ color: "#dc2626" }}> *</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#3f3f46",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d4d4d8",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#18181b",
  padding: "12px 13px",
  fontSize: "14px",
  outline: "none",
};