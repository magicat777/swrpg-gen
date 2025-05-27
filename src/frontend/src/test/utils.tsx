import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../services/auth/AuthContext';
import { starWarsTheme } from '../styles/theme';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
        staleTime: Infinity, // Cache forever in tests
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={starWarsTheme}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock user for authenticated tests
export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  roles: ['user']
};

// Mock localStorage for auth tests
export const mockAuthenticatedUser = () => {
  localStorage.setItem('auth_token', 'mock-token');
  localStorage.setItem('user_data', JSON.stringify(mockUser));
};

export const mockUnauthenticatedUser = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };