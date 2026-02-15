import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

// Pages
import DashboardLayout from './pages/DashboardLayaout';
import PointSale from './pages/PuntoDeVenta';
import ProductosPage from './pages/ProductPage';
import PromotionsPage from './pages/PromotionsPage';
import CashRegisterPage from './pages/CashRegisterPage';
import LoginPage from './pages/LoginPage';
import AccesoDenegadoPage from './pages/AccesoDenegadoPage';
import BoxHistoryPage from './pages/BoxHistoryPage';

// Components
import FormProducto from './components/Producto/FormProducto';
import FormPromotion from './components/Promociones/FormPromotion';

// Routes
import RoutesPublic from './routes/RoutesPublic';
import RoutesPrivate from './routes/RoutesPrivate';
import ProtectedRoute from './routes/ProtectedRoute';

// Config
import { ROLES } from './config/config';
import { useAllProductsNoPagination } from './hooks/useProducts';
import { useAllPromotionsNoPagination } from './hooks/usePromotions';
import { saveProductsToLocalStorage } from './components/helpers/ProductosStorage';
import { savePromotionsToLocalStorage } from './components/helpers/PromotionsStorage';
import UpdateProductPage from './pages/UpdateProductPage';

function App() {

  //aqui cuando cargue la app vamos a cargar los productos que lo vamos a guardar en localstorage para quelas busqueda en el carrito y optimizar que no se haga peticiones todo el tiempo, cada vez que se actualice el producto se actualizara el localstorage y cada vez que se cargue la app se cargara el localstorage, esto es para optimizar las busquedas en el carrito y no hacer peticiones todo el tiempo

  const { data: allProducts } = useAllProductsNoPagination();
  const { data: allPromotions } = useAllPromotionsNoPagination();
  
  // Guardar productos en localStorage solo cuando estén disponibles
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      saveProductsToLocalStorage(allProducts);
    }
  }, [allProducts]);
  
  // Guardar promociones en localStorage solo cuando estén disponibles
  useEffect(() => {
    if (allPromotions && allPromotions.length > 0) {
      savePromotionsToLocalStorage(allPromotions);
    }
  }, [allPromotions]);
  
  return (
    <BrowserRouter>
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
            {/* Redirigir a punto de venta por defecto */}
            <Route index element={<Navigate to="/dashboard/punto-venta" replace />} />

            {/* Punto de Venta - Acceso para Admin y Vendedor */}
            <Route
              path="punto-venta"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}>
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

            {/* Actualizar Stock - Solo Admin y Vendedor */}
            <Route
              path="update-stock"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}>
                  <UpdateProductPage />
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
    </BrowserRouter>
  );
}

export default App;
