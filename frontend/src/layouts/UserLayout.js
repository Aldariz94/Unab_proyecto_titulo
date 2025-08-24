// frontend/src/layouts/UserLayout.js
import React from "react";
import AuthenticatedLayout from "./AuthenticatedLayout";
import { UserSidebar } from "../components";
import { CatalogPage, MyLoansPage, MyReservationsPage, ReportsPage } from "../pages";

// Mapa de las páginas de usuario
const userPageMap = {
  'catalog-books': () => <CatalogPage isUserView={true} itemType="book" />,
  'catalog-resources': () => <CatalogPage isUserView={true} itemType="resource" />,
  'my-loans': MyLoansPage,
  'my-reservations': MyReservationsPage,
  'reports': ReportsPage,
};

const UserLayout = () => {
  return (
    <AuthenticatedLayout 
      SidebarComponent={UserSidebar}
      pageMap={userPageMap}
    />
  );
};

export default UserLayout;