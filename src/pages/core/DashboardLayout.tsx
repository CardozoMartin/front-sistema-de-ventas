import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  Package,
  LogOut,
  Home,
  Menu,
  X,
  CreditCard,
  DollarSign,
  Tag,
  HeartHandshake,
  BarChart3,
  AlertTriangle,
  Store,
  TrendingUp,
  Activity,
  ShieldCheck
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuthSession } from "../../store/useAuthSession";
import { useLogout } from "../../hooks/useUsers";
import { useProductsFromLocalStorage } from "../../hooks/useProducts";
import { ROLES } from "../../config/config";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSession();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const products = useProductsFromLocalStorage();

  const stockAlerts = useMemo(() => {
    const LOW_STOCK_THRESHOLD = 10;
    const outOfStock = products.filter(p => p.stock === 0 && p.active !== false).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD && p.active !== false).length;
    return { outOfStock, lowStock, total: outOfStock + lowStock };
  }, [products]);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/login', { replace: true });
      },
    });
  };

  const menuItems = [
    // PRINCIPAL
    { id: "dashboard", name: "Mi Sesión", icon: Home, path: "/dashboard/inicio", requiredRoles: [ROLES.VENDEDOR] },
    { id: "admin-dashboard", name: "Dashboard Admin", icon: TrendingUp, path: "/dashboard/admin", requiredRoles: [ROLES.ADMIN] },
    { id: "pos", name: "Punto de Venta", icon: CreditCard, path: "/dashboard/punto-venta", requiredRoles: [ROLES.VENDEDOR] },
    // INVENTARIO
    { id: "products", name: "Productos", icon: Package, path: "/dashboard/productos", requiredRoles: [ROLES.ADMIN] },
    { id: "promotions", name: "Promociones", icon: Tag, path: "/dashboard/promociones", requiredRoles: [ROLES.ADMIN] },
    { id: "maintenance", name: "Salud del Catálogo", icon: ShieldCheck, path: "/dashboard/mantenimiento-catalogo", requiredRoles: [ROLES.ADMIN] },
    // FINANZAS
    { id: "orders", name: "Cajas y Finanzas", icon: DollarSign, path: "/dashboard/cajas", requiredRoles: [ROLES.ADMIN, ROLES.VENDEDOR] },
    { id: "sales", name: "Historial de Ventas", icon: ShoppingCart, path: "/dashboard/ventas", requiredRoles: [ROLES.ADMIN] },
    // GESTION
    { id: "clients", name: "Cuentas Corrientes", icon: HeartHandshake, path: "/dashboard/clientes", requiredRoles: [ROLES.ADMIN, ROLES.VENDEDOR] },
    { id: "employees", name: "Empleados", icon: Users, path: "/dashboard/empleados", requiredRoles: [ROLES.ADMIN] },
    // ANALISIS
    { id: "reports", name: "Reportes", icon: BarChart3, path: "/dashboard/reportes", requiredRoles: [ROLES.ADMIN] },
    { id: "auditoria", name: "Auditoría", icon: Activity, path: "/dashboard/auditoria", requiredRoles: [ROLES.ADMIN] },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!user?.role) return false;
    return item.requiredRoles.includes(user.role as typeof ROLES.ADMIN | typeof ROLES.VENDEDOR);
  });

  return (
    <div className="app-shell flex h-screen overflow-hidden font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-900/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative ${
          sidebarOpen ? "translate-x-0 w-60" : "-translate-x-[120%] md:translate-x-0 md:w-[4.5rem]"
        } app-sidebar z-40 m-3 flex h-[calc(100vh-1.5rem)] flex-col transition-all duration-200 md:z-20`}
      >
        <div className={`flex-shrink-0 p-4 ${!sidebarOpen && "px-3"}`}>
          {sidebarOpen ? (
            <div className="flex w-full items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white">
                <Store size={18} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 overflow-hidden">
                <h1 className="truncate text-sm font-semibold text-neutral-900">Shaddai - Shop</h1>
                <p className="text-[11px] text-neutral-500">Sistema de ventas</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-white">
              <Store size={18} strokeWidth={1.75} />
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="mb-2 px-4 pb-2">
            <div className="flex items-center gap-3 rounded-md border border-neutral-100 bg-neutral-50/80 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="truncate text-xs font-medium text-neutral-800">{user?.nombre || "Usuario"}</p>
                <p className="text-[11px] text-neutral-500">
                  {user?.role === ROLES.ADMIN ? "Administrador" : "Vendedor"}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-3 pb-3">
          <ul className="space-y-0.5">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={
                      isActive
                        ? `${sidebarOpen ? "nav-item-active" : "flex w-full justify-center rounded-md bg-neutral-900 p-2.5 text-white"}`
                        : `${sidebarOpen ? "nav-item" : "flex w-full justify-center rounded-md p-2.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"}`
                    }
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
                    {sidebarOpen && <span className="truncate">{item.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto flex-shrink-0 p-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full ${
              sidebarOpen ? "btn-danger-ghost justify-start" : "flex justify-center rounded-md p-2.5 text-neutral-500 hover:bg-red-50 hover:text-red-700"
            } disabled:opacity-50`}
            title={!sidebarOpen ? "Cerrar Sesión" : undefined}
          >
            <LogOut size={18} strokeWidth={1.75} />
            {sidebarOpen && <span>{isLoggingOut ? "Saliendo..." : "Cerrar sesión"}</span>}
          </button>
        </div>
      </aside>

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none sticky top-0 z-20 px-4 pb-2 pt-3 sm:px-6 md:pl-3">
          <header className="pointer-events-auto flex items-center justify-between rounded-lg border border-neutral-200/80 bg-white px-4 py-2.5 shadow-sm md:px-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="icon-btn border border-neutral-200 bg-neutral-50"
                aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="hidden sm:block">
                <h2 className="text-sm font-semibold text-neutral-900">Panel principal</h2>
                <p className="text-[11px] text-neutral-500">Gestión de tienda</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {stockAlerts.total > 0 && (
                <div className="group relative">
                  <button
                    type="button"
                    className="icon-btn relative border border-neutral-200"
                    aria-label="Alertas de stock"
                  >
                    <AlertTriangle
                      size={18}
                      className={stockAlerts.outOfStock > 0 ? "text-red-600" : "text-amber-600"}
                    />
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium text-white">
                      {stockAlerts.total}
                    </span>
                  </button>

                  <div className="absolute right-0 top-full z-50 mt-2 hidden w-64 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm group-hover:block">
                    <p className="mb-3 text-sm font-semibold text-neutral-900">Alertas de inventario</p>
                    <div className="space-y-2">
                      {stockAlerts.outOfStock > 0 && (
                        <button
                          type="button"
                          onClick={() => navigate("/dashboard/productos?stock=no-stock")}
                          className="w-full rounded-md border border-red-100 bg-red-50/50 p-3 text-left text-xs hover:bg-red-50"
                        >
                          <p className="font-medium text-red-800">Sin stock</p>
                          <p className="mt-0.5 text-red-600/80">
                            {stockAlerts.outOfStock} producto{stockAlerts.outOfStock !== 1 ? "s" : ""}
                          </p>
                        </button>
                      )}
                      {stockAlerts.lowStock > 0 && (
                        <button
                          type="button"
                          onClick={() => navigate("/dashboard/productos?stock=low-stock")}
                          className="w-full rounded-md border border-amber-100 bg-amber-50/50 p-3 text-left text-xs hover:bg-amber-50"
                        >
                          <p className="font-medium text-amber-900">Stock bajo</p>
                          <p className="mt-0.5 text-amber-700/80">
                            {stockAlerts.lowStock} producto{stockAlerts.lowStock !== 1 ? "s" : ""}
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>
        </div>

        <main className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 sm:px-6 md:pl-3">
          <div className="app-card-elevated flex min-h-0 flex-1 flex-col overflow-y-auto custom-scrollbar">
            <Outlet key={location.pathname} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
