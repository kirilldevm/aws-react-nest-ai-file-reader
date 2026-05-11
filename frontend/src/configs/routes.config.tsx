import { createBrowserRouter, Navigate } from 'react-router';
import AuthLayout from '../layouts/auth-layout';
import DocumentsPage from '../pages/documents-page';
import LoginPage from '../pages/login-page';

export const routes = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to='/documents' replace /> },
      { path: 'documents', element: <DocumentsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/documents' replace />,
  },
]);
