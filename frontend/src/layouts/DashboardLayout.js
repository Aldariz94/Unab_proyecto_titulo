// frontend/src/layouts/DashboardLayout.js
import React from "react";
import AuthenticatedLayout from "./AuthenticatedLayout";
import { Sidebar } from "../components";
import {
  DashboardPage, UserManagementPage, BookManagementPage, 
  ResourceManagementPage, LoanManagementPage, OverdueLoansPage, ReservationsPage, 
  SanctionsPage, InventoryManagementPage, ReportsPage,
} from "../pages";

// Mapa de las páginas del administrador
const adminPageMap = {
  dashboard: DashboardPage,
  usuarios: UserManagementPage,
  libros: BookManagementPage,
  recursos: ResourceManagementPage,
  prestamos: LoanManagementPage,
  reservas: ReservationsPage,
  atrasos: OverdueLoansPage,
  sanciones: SanctionsPage,
  inventario: InventoryManagementPage,
  reportes: ReportsPage,
};

const DashboardLayout = () => {
  return (
    <AuthenticatedLayout 
      SidebarComponent={Sidebar}
      pageMap={adminPageMap}
    />
  );
};

export default DashboardLayout;