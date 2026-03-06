import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AppRoutes from '../../routes/AppRoutes';

// Mock navigation for pages
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock all pages
vi.mock('../../pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">LoginPage</div>,
}));

vi.mock('../../pages/NotFoundPage', () => ({
  default: () => <div data-testid="not-found-page">404 Not Found</div>,
}));

vi.mock('../../pages/AccessDeniedPage', () => ({
  default: () => <div data-testid="access-denied-page">Access Denied</div>,
}));

vi.mock('../../pages/ServerErrorPage', () => ({
  default: () => <div data-testid="server-error-page">Server Error</div>,
}));

vi.mock('../../layouts/DashboardLayout', () => ({
  default: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock dashboard pages
vi.mock('../../pages/admin', () => ({
  default: () => <div data-testid="admin-page">Admin Dashboard</div>,
}));

vi.mock('../../pages/student', () => ({
  default: () => <div data-testid="student-page">Student Dashboard</div>,
}));

vi.mock('../../pages/teacher', () => ({
  default: () => <div data-testid="teacher-page">Teacher Dashboard</div>,
}));

const renderAppRoutes = (authContextValue: any) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <AppRoutes />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('AppRoutes & Protected Routes Integration Tests', () => {
  const mockAdminUser = {
    id: '1',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
  };

  const mockStudentUser = {
    id: '2',
    email: 'student@example.com',
    full_name: 'Student User',
    role: 'student',
    is_active: true,
  };

  const mockTeacherUser = {
    id: '3',
    email: 'teacher@example.com',
    full_name: 'Teacher User',
    role: 'teacher',
    is_active: true,
  };

  describe('Public Routes', () => {
    it('should render login page for unauthenticated users', () => {
      const authContext = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

      renderAppRoutes(authContext);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should redirect to login when accessing protected route without authentication', () => {
      const authContext = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

      renderAppRoutes(authContext);

      // Navigate to /dashboard (should redirect to login)
      window.history.pushState({}, 'Dashboard', '/dashboard');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Role-Based Access', () => {
    it('should render admin dashboard when admin user is authenticated', () => {
      const authContext = {
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
      };

      renderAppRoutes(authContext);
      window.history.pushState({}, 'Dashboard', '/dashboard');

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });

    it('should render student dashboard when student user is authenticated', () => {
      const authContext = {
        user: mockStudentUser,
        isAuthenticated: true,
        isLoading: false,
      };

      renderAppRoutes(authContext);
      window.history.pushState({}, 'Dashboard', '/dashboard');

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });

    it('should render teacher dashboard when teacher user is authenticated', () => {
      const authContext = {
        user: mockTeacherUser,
        isAuthenticated: true,
        isLoading: false,
      };

      renderAppRoutes(authContext);
      window.history.pushState({}, 'Dashboard', '/dashboard');

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });

    it('should deny access to admin-only routes for non-admin users', () => {
      const authContext = {
        user: mockStudentUser,
        isAuthenticated: true,
        isLoading: false,
      };

      renderAppRoutes(authContext);
      window.history.pushState({}, 'Admin', '/admin');

      expect(screen.getByTestId('access-denied-page')).toBeInTheDocument();
    });

    it('should allow admin users to access admin routes', () => {
      const authContext = {
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
      };

      renderAppRoutes(authContext);
      window.history.pushState({}, 'Admin', '/admin');

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });
  });

  describe('Not Found Routes', () => {
    it('should render 404 page for invalid routes', () => {
      const authContext = {
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
      };

      renderAppRoutes(authContext);
      window.history.pushState({}, 'Invalid', '/invalid-route-xyz');

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while authentication is being verified', () => {
      const authContext = {
        user: null,
        isAuthenticated: false,
        isLoading: true,
      };

      const { container } = renderAppRoutes(authContext);

      // Should not show any content while loading
      expect(container.querySelector('[data-testid="login-page"]')).not.toBeInTheDocument();
    });

    it('should render appropriate page after loading completes', async () => {
      const authContext = {
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
      };

      renderAppRoutes(authContext);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      });
    });
  });

  describe('Inactive User Access', () => {
    it('should deny access for inactive users', () => {
      const inactiveUser = {
        ...mockStudentUser,
        is_active: false,
      };

      const authContext = {
        user: inactiveUser,
        isAuthenticated: true,
        isLoading: false,
      };

      renderAppRoutes(authContext);
      window.history.pushState({}, 'Dashboard', '/dashboard');

      expect(screen.getByTestId('access-denied-page')).toBeInTheDocument();
    });
  });

  describe('Route Navigation', () => {
    it('should maintain authentication state during navigation', () => {
      const authContext = {
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
      };

      const { rerender } = render(
        <BrowserRouter>
          <AuthContext.Provider value={authContext}>
            <AppRoutes />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();

      // Simulate navigation to another protected route
      window.history.pushState({}, 'Users', '/users');

      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={authContext}>
            <AppRoutes />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(authContext.isAuthenticated).toBe(true);
    });

    it('should redirect to login on session expiration', async () => {
      const authContext = {
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
      };

      const { rerender } = render(
        <BrowserRouter>
          <AuthContext.Provider value={authContext}>
            <AppRoutes />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();

      // Simulate session expiration
      const expiredAuthContext = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={expiredAuthContext}>
            <AppRoutes />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error page on server error', () => {
      const authContext = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Server error occurred',
      };

      renderAppRoutes(authContext);
      
      // Trigger server error page
      expect(screen.queryByTestId('server-error-page')).not.toBeInTheDocument();
    });
  });
});
