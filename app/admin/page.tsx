"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHome from "@/components/admin/AdminHome";
import AhorradoresCrud from "@/components/admin/AhorradoresCrud";
import PrestamosCrud from "@/components/admin/PrestamosCrud";
import SimuladorPrestamo from "@/components/admin/SimuladorPrestamo";


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
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <AdminSidebar section={section} setSection={setSection} />
      <main className="flex-1 p-6">{content}</main>
    </div>
  );
}