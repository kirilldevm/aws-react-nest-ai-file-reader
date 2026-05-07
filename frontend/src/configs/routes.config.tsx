import { createBrowserRouter, Navigate } from 'react-router';
import AuthLayout from '../layouts/auth-layout';
import Home from '../pages/home';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/' replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [{ index: true, element: <Home /> }],
  },
]);
