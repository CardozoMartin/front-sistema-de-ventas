import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
  CreditCard,
  DollarSign,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useAuthSession } from "../store/useAuthSession";
import { useLogout } from "../hooks/useUsers";
import { ROLES } from "../config/config";

// Layout del Dashboard - Con navegación
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSession();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  
  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/login', { replace: true });
      },
    });
  };
  
  const menuItems = [
    { 
      id: "dashboard", 
      name: "Dashboard", 
      icon: Home, 
      path: "/dashboard",
      requiredRoles: [ROLES.ADMIN, ROLES.VENDEDOR]
    },
    {
      id: "pos",
      name: "Punto de Venta",
      icon: CreditCard,
      path: "/dashboard/punto-venta",
      requiredRoles: [ROLES.ADMIN, ROLES.VENDEDOR]
    },
    {
      id: "sales",
      name: "Ventas",
      icon: ShoppingCart,
      path: "/dashboard/ventas",
      requiredRoles: [ROLES.ADMIN, ROLES.VENDEDOR]
    },
    {
      id: "products",
      name: "Productos",
      icon: Package,
      path: "/dashboard/productos",
      requiredRoles: [ROLES.ADMIN]
    },
    {
      id: "promotions",
      name: "Promociones",
      icon: Zap,
      path: "/dashboard/promociones",
      requiredRoles: [ROLES.ADMIN]
    },
    {
      id: "customers",
      name: "Clientes",
      icon: Users,
      path: "/dashboard/clientes",
      requiredRoles: [ROLES.ADMIN]
    },
    {
      id: "orders",
      name: "Cajas",
      icon: DollarSign,
      path: "/dashboard/cajas",
      requiredRoles: [ROLES.ADMIN, ROLES.VENDEDOR]
    },
    {
      id: "update-stock",
      name: "Actualizar Stock",
      icon: Settings,
      path: "/dashboard/update-stock",
      requiredRoles: [ROLES.ADMIN]
    },
  ];

  // Filtrar items según el rol del usuario
  const filteredMenuItems = menuItems.filter((item) => {
    if (!user?.role) return false;
    return item.requiredRoles.includes(user.role as typeof ROLES.ADMIN | typeof ROLES.VENDEDOR);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Expandido o Compacto */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-500/30 transition-all duration-300 flex flex-col`}
      >
        {/* Header del Sidebar */}
        <div className={`p-6 border-b border-gray-500/30 flex-shrink-0 ${!sidebarOpen && 'px-4'}`}>
          {sidebarOpen ? (
            <>
              <h1 className="text-xl font-bold text-gray-800">Sistema Ventas</h1>
              <p className="text-xs text-gray-600 mt-1">Panel de Control</p>
              <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                {user?.role === ROLES.ADMIN ? "Administrador" : "Vendedor"}
              </div>
            </>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold">
                SV
              </div>
            </div>
          )}
        </div>

        {/* Navegación */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center ${
                      sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
                    } py-2.5 rounded-md text-sm font-medium transition ${
                      isActive
                        ? "bg-gray-500/20 text-gray-800"
                        : "text-gray-700 hover:bg-gray-500/10"
                    }`}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Botón de logout */}
        <div className="p-4 border-t border-gray-500/30 flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center ${
              sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
            } py-2.5 rounded-md text-sm font-medium text-red-600/80 hover:bg-red-600/10 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            title={!sidebarOpen ? "Cerrar Sesión" : undefined}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-500/30 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.nombre || user?.email || "Usuario"}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.email || "usuario@ejemplo.com"}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content - SOLO ESTA ÁREA tiene scroll */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;