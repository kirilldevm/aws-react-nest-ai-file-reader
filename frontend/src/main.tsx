import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { queryClient } from './configs/react-query.config.ts';
import { AuthProvider } from './contexts/auth.context.ts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider></AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
