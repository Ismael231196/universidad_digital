import { test, expect, Page } from '@playwright/test';

test.describe('E2E Tests - Complete User Flows', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Navigate to application
    await page.goto('http://localhost:5173');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Complete Student Enrollment Flow', () => {
    test('should allow student to register, login, and enroll in course', async () => {
      // 1. Start at login page
      await expect(page.locator('text=/sign in|ingresar/i')).toBeVisible();

      // 2. Login as existing student
      await page.fill('input[type="email"]', 'student@example.com');
      await page.fill('input[type="password"]', 'studentPassword123');
      await page.click('button[type="submit"]');

      // 3. Wait for dashboard to load
      await page.waitForNavigation();
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('text=/dashboard|panel de control/i')).toBeVisible();

      // 4. Navigate to courses/subjects
      await page.click('a:has-text(/courses|subjects|asignaturas/i)');
      await page.waitForLoadState('networkidle');

      // 5. View available courses
      await expect(page.locator('table')).toBeVisible();
      const courseRows = await page.locator('tbody tr').count();
      expect(courseRows).toBeGreaterThan(0);

      // 6. Enroll in a course
      const enrollButton = page.locator('button:has-text(/enroll|matricularse/i)').first();
      await enrollButton.click();

      // 7. Confirm enrollment
      await expect(page.locator('text=/enrollment confirmed|matrícula confirmada/i')).toBeVisible();

      // 8. Verify enrollment appears in student dashboard
      await page.click('a:has-text(/dashboard|my courses|mis cursos/i)');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=/enrolled|matriculado/i')).toBeVisible();
    });

    test('should display student grades after enrollment', async () => {
      // Login
      await page.fill('input[type="email"]', 'student@example.com');
      await page.fill('input[type="password"]', 'studentPassword123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();

      // Navigate to grades
      await page.click('a:has-text(/grades|calificaciones/i)');
      await page.waitForLoadState('networkidle');

      // Verify grades are displayed
      await expect(page.locator('text=/grades|calificaciones/i')).toBeVisible();
      const gradeRows = await page.locator('tbody tr').count();
      expect(gradeRows).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Complete Teacher Grading Flow', () => {
    test('should allow teacher to view students and enter grades', async () => {
      // 1. Login as teacher
      await page.fill('input[type="email"]', 'teacher@example.com');
      await page.fill('input[type="password"]', 'teacherPassword123');
      await page.click('button[type="submit"]');

      // 2. Wait for dashboard
      await page.waitForNavigation();
      await expect(page).toHaveURL(/\/dashboard/);

      // 3. Navigate to grade management
      await page.click('a:has-text(/manage grades|calificar/i)');
      await page.waitForLoadState('networkidle');

      // 4. View enrolled students
      await expect(page.locator('table')).toBeVisible();
      const studentRows = await page.locator('tbody tr').count();
      expect(studentRows).toBeGreaterThan(0);

      // 5. Click to enter grades for first student
      const firstStudent = page.locator('tbody tr').first();
      await firstStudent.locator('button:has-text(/enter grade|calificar/i)').click();

      // 6. Enter grade value
      const gradeInput = page.locator('input[type="number"]').first();
      await gradeInput.fill('85');

      // 7. Submit grade
      await page.click('button:has-text(/submit|enviar/i)');

      // 8. Verify grade saved
      await expect(page.locator('text=/grade saved|calificación guardada/i)')).toBeVisible();
    });
  });

  test.describe('Complete Admin User Management Flow', () => {
    test('should allow admin to create, view, and manage users', async () => {
      // 1. Login as admin
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'adminPassword123');
      await page.click('button[type="submit"]');

      // 2. Wait for dashboard
      await page.waitForNavigation();
      await expect(page).toHaveURL(/\/dashboard/);

      // 3. Navigate to users management
      await page.click('a:has-text(/manage users|usuarios/i)');
      await page.waitForLoadState('networkidle');

      // 4. View existing users
      await expect(page.locator('table')).toBeVisible();
      const userRows = await page.locator('tbody tr').count();
      expect(userRows).toBeGreaterThan(0);

      // 5. Click to create new user
      const createButton = page.locator('button:has-text(/create|crear|new/i)').first();
      await createButton.click();

      // 6. Fill in user form
      await page.fill('input[type="email"]', `newuser${Date.now()}@example.com`);
      await page.fill('input[name="full_name"]', 'New Student User');
      await page.selectOption('select[name="role"]', 'student');
      await page.fill('input[type="password"]', 'NewPassword123!');

      // 7. Submit form
      await page.click('button[type="submit"]');

      // 8. Verify user created
      await expect(page.locator('text=/user created|usuario creado/i')).toBeVisible();

      // 9. Verify new user appears in list
      await page.waitForTimeout(500);
      const updatedUserRows = await page.locator('tbody tr').count();
      expect(updatedUserRows).toBe(userRows + 1);
    });

    test('should allow admin to assign roles to users', async () => {
      // Login as admin
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'adminPassword123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();

      // Navigate to users
      await page.click('a:has-text(/manage users|usuarios/i)');
      await page.waitForLoadState('networkidle');

      // Find user edit button
      const editButton = page.locator('button:has-text(/edit|editar/i)').first();
      await editButton.click();

      // Change role
      await page.selectOption('select[name="role"]', 'teacher');

      // Save changes
      await page.click('button[type="submit"]');

      // Verify change
      await expect(page.locator('text=/role updated|rol actualizado/i')).toBeVisible();
    });

    test('should allow admin to deactivate users', async () => {
      // Login as admin
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'adminPassword123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();

      // Navigate to users
      await page.click('a:has-text(/manage users|usuarios/i)');
      await page.waitForLoadState('networkidle');

      // Find deactivate button
      const deactivateButton = page.locator('button:has-text(/deactivate|desactivar/i)').first();
      await deactivateButton.click();

      // Confirm action
      await page.click('button:has-text(/confirm|confirmar/i)');

      // Verify deactivation
      await expect(page.locator('text=/deactivated|desactivado/i')).toBeVisible();
    });
  });

  test.describe('Authentication & Security', () => {
    test('should prevent login with invalid credentials', async () => {
      // Fill invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'incorrectPassword');
      await page.click('button[type="submit"]');

      // Verify error message
      await expect(page.locator('text=/invalid|error|credentials|contraseña incorrecta/i')).toBeVisible();

      // Verify not redirected to dashboard
      await expect(page).toHaveURL(/\/login|\/signin/);
    });

    test('should logout and redirect to login page', async () => {
      // Login
      await page.fill('input[type="email"]', 'student@example.com');
      await page.fill('input[type="password"]', 'studentPassword123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();

      // Find and click logout
      const logoutButton = page.locator('button:has-text(/logout|salir|cerrar sesión/i)');
      await logoutButton.click();

      // Verify redirected to login
      await page.waitForNavigation();
      await expect(page).toHaveURL(/\/login|\/signin/);
      await expect(page.locator('text=/sign in|ingresar/i')).toBeVisible();
    });

    test('should prevent access to protected routes without authentication', async () => {
      // Try to access dashboard directly
      await page.goto('http://localhost:5173/dashboard');

      // Should redirect to login
      await page.waitForNavigation();
      await expect(page).toHaveURL(/\/login|\/signin/);
    });

    test('should enforce role-based access control', async () => {
      // Login as student
      await page.fill('input[type="email"]', 'student@example.com');
      await page.fill('input[type="password"]', 'studentPassword123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();

      // Try to access admin panel directly
      await page.goto('http://localhost:5173/admin');

      // Should show access denied
      await expect(page.locator('text=/access denied|acceso denegado/i')).toBeVisible();
    });
  });

  test.describe('Navigation & UI', () => {
    test('should display main navigation menu after login', async () => {
      // Login
      await page.fill('input[type="email"]', 'student@example.com');
      await page.fill('input[type="password"]', 'studentPassword123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();

      // Verify navigation items appear
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('a:has-text(/dashboard|home|inicio/i)')).toBeVisible();
    });

    test('should highlight active navigation link', async () => {
      // Login
      await page.fill('input[type="email"]', 'student@example.com');
      await page.fill('input[type="password"]', 'studentPassword123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();

      // Check active link
      const activeLink = page.locator('a.active, a[aria-current="page"]').first();
      await expect(activeLink).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields on login form', async () => {
      // Try to submit without email
      await page.click('button[type="submit"]');

      // Verify validation error
      await expect(page.locator('text=/required|requerido/i')).toBeVisible();
    });

    test('should validate email format', async () => {
      // Enter invalid email
      await page.fill('input[type="email"]', 'invalid-email');

      // Try to submit
      await page.click('button[type="submit"]');

      // Verify error
      await expect(page.locator('text=/email|válido|valid/i')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard within acceptable time', async () => {
      // Login
      const startTime = Date.now();
      
      await page.fill('input[type="email"]', 'student@example.com');
      await page.fill('input[type="password"]', 'studentPassword123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    });
  });
});
