import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import './App.css';

// Componentes core que no necesitan lazy loading
import DashboardLayout from './pages/core/DashboardLayout';
import RoutesPublic from './routes/RoutesPublic';
import RoutesPrivate from './routes/RoutesPrivate';
import ProtectedRoute from './routes/ProtectedRoute';

// Lazy loaded pages
const Dashboard = lazy(() => import('./pages/analytics/CashierDashboard'));
const AdminDashboard = lazy(() => import('./pages/analytics/AdminDashboard'));
const AuditLogsPage = lazy(() => import('./pages/analytics/AuditLogsPage'));
const PointSale = lazy(() => import('./pages/operations/PointSalePage'));
const ProductosPage = lazy(() => import('./pages/inventory/ProductPage'));
const PromotionsPage = lazy(() => import('./pages/inventory/PromotionsPage'));
const CashRegisterPage = lazy(() => import('./pages/operations/CashRegisterPage'));
const LoginPage = lazy(() => import('./pages/core/LoginPage'));
const AccesoDenegadoPage = lazy(() => import('./pages/core/AccesoDenegadoPage'));
const BoxHistoryPage = lazy(() => import('./pages/operations/BoxHistoryPage'));
const ReportsPage = lazy(() => import('./pages/analytics/ReportsPage'));
const EmpleadosPage = lazy(() => import('./pages/administration/EmployeesPage'));
const ClientesPage = lazy(() => import('./pages/administration/ClientsPage'));
const CatalogMaintenance = lazy(() => import('./pages/inventory/CatalogMaintenancePage'));

// Lazy loaded components (forms for modals/pages)
const FormProducto = lazy(() => import('./components/Producto/FormProducto'));
const FormPromotion = lazy(() => import('./components/Promociones/FormPromotion'));
const FormEmpleado = lazy(() => import('./components/Clientes/FormEmpleado'));
const FormRealCliente = lazy(() => import('./components/Clientes/FormRealCliente'));

// Config
import { ROLES } from './config/config';
import { useAllProductsNoPagination } from './hooks/useProducts';
import { useAllPromotionsNoPagination } from './hooks/usePromotions';
import { saveProductsToLocalStorage } from './components/helpers/ProductosStorage';
import { savePromotionsToLocalStorage } from './components/helpers/PromotionsStorage';
import { useAuthSession } from './store/useAuthSession';

const DashboardIndex = () => {
  const { user } = useAuthSession();
  if (user?.role === ROLES.ADMIN) {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return <Navigate to="/dashboard/inicio" replace />;
};

function App() {
  // Asegurar que el modo oscuro esté desactivado y limpiar localStorage
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  const { isLoggedIn } = useAuthSession();

  const { data: allProducts } = useAllProductsNoPagination({ enabled: isLoggedIn });
  const { data: allPromotions } = useAllPromotionsNoPagination({ enabled: isLoggedIn });
  
  // Guardar productos en localStorage solo cuando estén disponibles
  useEffect(() => {
    if (allProducts !== undefined) {
      saveProductsToLocalStorage(allProducts);
    }
  }, [allProducts]);
  
  // Guardar promociones en localStorage solo cuando estén disponibles
  useEffect(() => {
    if (allPromotions !== undefined) {
      savePromotionsToLocalStorage(allPromotions);
    }
  }, [allPromotions]);
  
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="text-gray-500 font-medium animate-pulse">Cargando...</p>
          </div>
        </div>
      }>
        <Routes>
          {/* Redirección de la raíz al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ==================== RUTAS PÚBLICAS ==================== */}
          {/* Solo el login es público */}
          <Route element={<RoutesPublic />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* ==================== RUTAS PRIVADAS ==================== */}
          {/* Todas las rutas del dashboard requieren autenticación */}
          <Route element={<RoutesPrivate />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Redirigir a dashboard por defecto dependiendo del rol */}
              <Route index element={<DashboardIndex />} />

            {/* Dashboard - Acceso solo para Vendedor */}
            <Route
              path="inicio"
              element={
                <ProtectedRoute requiredRoles={[ROLES.VENDEDOR]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard - Solo Admin */}
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Punto de Venta - Acceso solo para Vendedor */}
            <Route
              path="punto-venta"
              element={
                <ProtectedRoute requiredRoles={[ROLES.VENDEDOR]}>
                  <PointSale />
                </ProtectedRoute>
              }
            />

            {/* Productos - Solo Admin */}
            <Route
              path="productos"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <ProductosPage />
                </ProtectedRoute>
              }
            />

            {/* Mantenimiento de Catálogo - Solo Admin */}
            <Route
              path="mantenimiento-catalogo"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <CatalogMaintenance />
                </ProtectedRoute>
              }
            />

            {/* Agregar Producto - Solo Admin */}
            <Route
              path="productos/agregar"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <FormProducto />
                </ProtectedRoute>
              }
            />

            {/* Promociones - Solo Admin */}
            <Route
              path="promociones"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <PromotionsPage />
                </ProtectedRoute>
              }
            />

            {/* Agregar Promoción - Solo Admin */}
            <Route
              path="promociones/agregar"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <FormPromotion />
                </ProtectedRoute>
              }
            />

            {/* Editar Promoción - Solo Admin */}
            <Route
              path="promociones/editar/:id"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <FormPromotion />
                </ProtectedRoute>
              }
            />

            {/* Cajas Registradoras - Solo Admin y Vendedor */}
            <Route
              path="cajas"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}>
                  <CashRegisterPage />
                </ProtectedRoute>
              }
            />

             <Route
              path="ventas"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}>
                  <BoxHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Reportes - Acceso solo para Admin */}
            <Route
              path="reportes"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Auditoría - Acceso solo para Admin */}
            <Route
              path="auditoria"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Empleados - Solo Admin */}
            <Route
              path="empleados"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <EmpleadosPage />
                </ProtectedRoute>
              }
            />

            {/* Agregar Empleado - Solo Admin */}
            <Route
              path="empleados/agregar"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <FormEmpleado />
                </ProtectedRoute>
              }
            />

            {/* Editar Empleado - Solo Admin */}
            <Route
              path="empleados/editar/:id"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <FormEmpleado />
                </ProtectedRoute>
              }
            />

            {/* Clientes - Admin y Vendedor */}
            <Route
              path="clientes"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}>
                  <ClientesPage />
                </ProtectedRoute>
              }
            />

            {/* Agregar Cliente - Admin y Vendedor */}
            <Route
              path="clientes/agregar"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}>
                  <FormRealCliente />
                </ProtectedRoute>
              }
            />

            {/* Editar Cliente - Admin y Vendedor */}
            <Route
              path="clientes/editar/:id"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}>
                  <FormRealCliente />
                </ProtectedRoute>
              }
            />

            {/* Página de Acceso Denegado */}
            <Route path="acceso-denegado" element={<AccesoDenegadoPage />} />

            {/* Ruta por defecto para rutas no encontradas dentro del dashboard */}
            <Route path="*" element={<Navigate to="/dashboard/punto-venta" replace />} />
          </Route>
        </Route>

        {/* Ruta por defecto para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
