"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHome from "@/components/admin/AdminHome";
import AhorradoresCrud from "@/components/admin/AhorradoresCrud";
import PrestamosCrud from "@/components/admin/PrestamosCrud";
import SimuladorPrestamo from "@/components/admin/SimuladorPrestamo";
import RequireAuth from "@/components/auth/RequireAuth";

export default function AdminPage() {
  const [section, setSection] = useState("home");

  let content;
  switch (section) {
    case "ahorradores":
      content = <AhorradoresCrud />;
      break;
    case "prestamos":
      content = <PrestamosCrud />;
      break;
    case "simulador":
      content = <SimuladorPrestamo />;
      break;
    default:
      content = <AdminHome />;
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-900">
        <AdminSidebar section={section} setSection={setSection} />
        <main className="md:ml-64 p-6 min-h-screen">{content}</main>
      </div>
    </RequireAuth>
  );
}