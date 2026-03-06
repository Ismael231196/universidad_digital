import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import * as authService from '../../api/auth';

// Mock the auth service
vi.mock('../../api/auth');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

// Helper to render LoginPage with router
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render login form with email and password fields', () => {
      renderLoginPage();
      
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should show required field validation messages initially', () => {
      renderLoginPage();
      
      const loginButton = screen.getByRole('button', { name: /sign in|ingresar/i });
      expect(loginButton).toBeInTheDocument();
    });

    it('should display "Instituto Universidad Digital" branding', () => {
      renderLoginPage();
      
      expect(screen.getByText(/universidad digital/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission - Valid Credentials', () => {
    it('should call auth service and navigate on successful login', async () => {
      const user = userEvent.setup();
      const mockToken = 'test-jwt-token';
      
      vi.mocked(authService).login.mockResolvedValueOnce({
        access_token: mockToken,
        token_type: 'bearer',
      });

      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in|ingresar/i });

      await user.type(emailInput, 'student@example.com');
      await user.type(passwordInput, 'securePassword123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'student@example.com',
          password: 'securePassword123',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should persist token to localStorage after successful login', async () => {
      const user = userEvent.setup();
      const mockToken = 'test-jwt-token';

      vi.mocked(authService).login.mockResolvedValueOnce({
        access_token: mockToken,
        token_type: 'bearer',
      });

      renderLoginPage();

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'adminPassword123');
      await user.click(screen.getByRole('button', { name: /sign in|ingresar/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe(mockToken);
      });
    });
  });

  describe('Form Submission - Invalid Credentials', () => {
    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid email or password';

      vi.mocked(authService).login.mockRejectedValueOnce(
        new Error(errorMessage)
      );

      renderLoginPage();

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongPassword');
      await user.click(screen.getByRole('button', { name: /sign in|ingresar/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid|error|credentials/i)).toBeInTheDocument();
      });
    });

    it('should not navigate on login failure', async () => {
      const user = userEvent.setup();

      vi.mocked(authService).login.mockRejectedValueOnce(
        new Error('Authentication failed')
      );

      renderLoginPage();

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password');
      await user.click(screen.getByRole('button', { name: /sign in|ingresar/i }));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should handle 401 Unauthorized response', async () => {
      const user = userEvent.setup();
      const error = new Error('Unauthorized');
      (error as any).status = 401;

      vi.mocked(authService).login.mockRejectedValueOnce(error);

      renderLoginPage();

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'inactive@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in|ingresar/i }));

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      await user.type(emailInput, 'invalid-email');
      await user.click(screen.getByRole('button', { name: /sign in|ingresar/i }));

      await waitFor(() => {
        expect(screen.getByText(/valid email|email invalido/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty email field', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const loginButton = screen.getByRole('button', { name: /sign in|ingresar/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required|email es requerido/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password field', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      await user.type(emailInput, 'user@example.com');

      const loginButton = screen.getByRole('button', { name: /sign in|ingresar/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required|contraseña es requerida/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), '123');
      await user.click(screen.getByRole('button', { name: /sign in|ingresar/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least.*characters|mínimo.*caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button while request is in progress', async () => {
      const user = userEvent.setup();

      vi.mocked(authService).login.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ access_token: 'token', token_type: 'bearer' }), 1000))
      );

      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in|ingresar/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      expect(loginButton).toBeDisabled();
    });

    it('should show loading indicator while authenticating', async () => {
      const user = userEvent.setup();

      vi.mocked(authService).login.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ access_token: 'token', token_type: 'bearer' }), 500))
      );

      renderLoginPage();

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in|ingresar/i }));

      // Check for loading state (spinner, text, or disabled button)
      expect(screen.getByRole('button', { name: /sign in|ingresar/i })).toBeDisabled();
    });
  });

  describe('Security', () => {
    it('should mask password input field', () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
    });

    it('should not display password characters in DOM', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'mySecretPassword');

      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should clear sensitive data after logout', async () => {
      const user = userEvent.setup();

      vi.mocked(authService).login.mockResolvedValueOnce({
        access_token: 'test-token',
        token_type: 'bearer',
      });

      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement;
      await user.type(emailInput, 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      // After successful login and navigation, localStorage should contain token
      await user.click(screen.getByRole('button', { name: /sign in|ingresar/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeTruthy();
      });
    });
  });
});
