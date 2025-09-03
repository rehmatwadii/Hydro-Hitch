import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import QualityReport from 'src/pages/quality-report';
import Questions from 'src/pages/questions';
import UserReportVendorPage from 'src/pages/user-vendor-report';

export const IndexPage = lazy(() => import('src/pages/app'));
export const UserPage = lazy(() => import('src/pages/user'));
export const OrderPage = lazy(() => import('src/pages/order'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------
export default function Router() {
  const data = localStorage.getItem('loginData') &&
    JSON.parse(localStorage.getItem('loginData'))?.data;

  const adminRoutes = data?.type === 'super_admin' ? [
    { path: 'user', element: <UserPage /> },
    { path: 'reports', element: <UserReportVendorPage /> }
  ] : [];

  const routes = useRoutes([
    ...(data ? [{
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { path: '/', element: <IndexPage /> },
        { path: 'dashboard', element: <IndexPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'orders', element: <OrderPage /> },
        ...adminRoutes,
        { path: 'questions', element: <Questions /> },
        { path: 'quality-report', element: <QualityReport /> },
      ],
    }] : [{
      path: '/',
      element: <LoginPage />,
    }]),
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}