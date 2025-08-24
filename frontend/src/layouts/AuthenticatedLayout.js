// frontend/src/layouts/AuthenticatedLayout.js

import React, { useState } from "react";
import { Footer, MobileSidebar } from "../components";
import { Bars3Icon } from "@heroicons/react/24/outline";

const AuthenticatedLayout = ({ SidebarComponent, pageMap }) => {
  // Estado inicial ahora se basa en las claves del pageMap
  const [currentPage, setCurrentPage] = useState(Object.keys(pageMap)[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const PageToRender = pageMap[currentPage] || pageMap[Object.keys(pageMap)[0]];

  return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-900">
      {/* Sidebar de escritorio */}
      <div className="hidden md:flex">
        <SidebarComponent onNavigate={handleNavigate} currentPage={currentPage} />
      </div>

      {/* Sidebar móvil */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <SidebarComponent
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onCloseRequest={() => setIsMobileMenuOpen(false)}
        />
      </MobileSidebar>
      
      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <header className="md:hidden p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-10 animate-fadeIn"><PageToRender /></main>
        <Footer />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;