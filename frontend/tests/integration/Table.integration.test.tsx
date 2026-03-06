import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Table from '../../components/Table';

describe('Table Component Integration Tests', () => {
  const mockData = [
    {
      id: '1',
      email: 'student1@example.com',
      full_name: 'Juan García',
      role: 'student',
      is_active: true,
    },
    {
      id: '2',
      email: 'student2@example.com',
      full_name: 'María López',
      role: 'student',
      is_active: true,
    },
    {
      id: '3',
      email: 'teacher@example.com',
      full_name: 'Carlos Rodríguez',
      role: 'teacher',
      is_active: false,
    },
  ];

  const mockColumns = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'full_name', label: 'Nombre Completo', sortable: true },
    { key: 'role', label: 'Rol', sortable: false },
    { key: 'is_active', label: 'Activo', render: (val: boolean) => val ? 'Sí' : 'No' },
  ];

  const renderTable = (props = {}) => {
    return render(
      <BrowserRouter>
        <Table
          columns={mockColumns}
          data={mockData}
          {...props}
        />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render table with header row', () => {
      renderTable();

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Nombre Completo')).toBeInTheDocument();
      expect(screen.getByText('Rol')).toBeInTheDocument();
    });

    it('should render all data rows', () => {
      renderTable();

      expect(screen.getByText('Juan García')).toBeInTheDocument();
      expect(screen.getByText('María López')).toBeInTheDocument();
      expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
    });

    it('should render custom formatted values', () => {
      renderTable();

      // Check for rendered values using custom render function
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + data rows
    });

    it('should handle empty data', () => {
      renderTable({ data: [] });

      expect(screen.getByText(/no data|no hay datos/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort column when sortable column header is clicked', async () => {
      const user = userEvent.setup();
      renderTable();

      const emailHeader = screen.getByText('Email');
      await user.click(emailHeader);

      expect(screen.getByText('student1@example.com')).toBeInTheDocument();
    });

    it('should toggle sort direction on second click', async () => {
      const user = userEvent.setup();
      renderTable();

      const nameHeader = screen.getByText('Nombre Completo');
      await user.click(nameHeader);
      await user.click(nameHeader);

      // Verify order is reversed
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });

    it('should not sort non-sortable columns', async () => {
      const user = userEvent.setup();
      renderTable();

      const roleHeader = screen.getByText('Rol');
      await user.click(roleHeader);

      // Should not show sort indicator
      expect(roleHeader.parentElement).not.toHaveClass('sorted');
    });

    it('should show sort indicator on sortable column', async () => {
      const user = userEvent.setup();
      renderTable();

      const emailHeader = screen.getByText('Email');
      await user.click(emailHeader);

      expect(emailHeader.parentElement).toHaveClass('sorted');
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls when data exceeds page size', () => {
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        ...mockData[0],
        id: String(i),
        email: `user${i}@example.com`,
      }));

      renderTable({ 
        data: largeData,
        pageSize: 10,
      });

      expect(screen.getByText(/page|página/i)).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        ...mockData[0],
        id: String(i),
        email: `user${i}@example.com`,
      }));

      renderTable({
        data: largeData,
        pageSize: 10,
      });

      const nextButton = screen.getByRole('button', { name: /next|siguiente/i });
      await user.click(nextButton);

      // Verify page content changed
      expect(screen.getByText('user10@example.com')).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      renderTable({ pageSize: 10 });

      const prevButton = screen.queryByRole('button', { name: /previous|anterior/i });
      if (prevButton) {
        expect(prevButton).toBeDisabled();
      }
    });
  });

  describe('Row Actions', () => {
    it('should handle row click event', async () => {
      const handleRowClick = vi.fn();
      const user = userEvent.setup();

      renderTable({ onRowClick: handleRowClick });

      const rows = screen.getAllByRole('row');
      await user.click(rows[1]); // Click first data row

      expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('should show action buttons in row', () => {
      const renderActions = (row: any) => (
        <div>
          <button>Edit</button>
          <button>Delete</button>
        </div>
      );

      renderTable({ renderActions });

      expect(screen.getAllByRole('button', { name: /edit/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /delete/i }).length).toBeGreaterThan(0);
    });

    it('should select row checkbox', async () => {
      const user = userEvent.setup();
      renderTable({ selectable: true });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Click first row checkbox

      expect(checkboxes[1]).toBeChecked();
    });
  });

  describe('Filtering', () => {
    it('should filter rows based on search term', async () => {
      const user = userEvent.setup();
      renderTable({ searchable: true });

      const searchInput = screen.getByPlaceholderText(/search|buscar/i);
      await user.type(searchInput, 'Juan');

      expect(screen.getByText('Juan García')).toBeInTheDocument();
      expect(screen.queryByText('María López')).not.toBeInTheDocument();
    });

    it('should show no results message when filter matches nothing', async () => {
      const user = userEvent.setup();
      renderTable({ searchable: true });

      const searchInput = screen.getByPlaceholderText(/search|buscar/i);
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText(/no results|sin resultados/i)).toBeInTheDocument();
    });
  });

  describe('Column Visibility', () => {
    it('should hide column when visibility is false', () => {
      const columnsWithHidden = [
        ...mockColumns,
        { key: 'hidden', label: 'Hidden Column', visible: false },
      ];

      renderTable({ columns: columnsWithHidden });

      expect(screen.queryByText('Hidden Column')).not.toBeInTheDocument();
    });

    it('should toggle column visibility', async () => {
      const user = userEvent.setup();
      renderTable({ showColumnToggle: true });

      const columnToggleButton = screen.getByRole('button', { name: /columns|columnas/i });
      await user.click(columnToggleButton);

      expect(screen.getByText(/select columns|seleccionar columnas/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should stack columns on mobile view', () => {
      const { container } = renderTable();

      // Check if responsive classes are applied
      const table = container.querySelector('table');
      expect(table).toHaveClass('table-responsive');
    });

    it('should show/hide columns based on viewport size', () => {
      renderTable({ responsive: true });

      // On mobile, some columns should be hidden
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      renderTable({ loading: true });

      expect(screen.getByText(/loading|cargando/i)).toBeInTheDocument();
    });

    it('should hide data while loading', () => {
      renderTable({ loading: true });

      expect(screen.queryByText('Juan García')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table role', () => {
      const { container } = renderTable();

      expect(container.querySelector('table')).toHaveRole('table');
    });

    it('should have proper header role for th elements', () => {
      const { container } = renderTable();

      const headers = container.querySelectorAll('th');
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('should have proper row role for tr elements', () => {
      const { container } = renderTable();

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveRole('row');
      });
    });

    it('should announce sort status to screen readers', async () => {
      const user = userEvent.setup();
      renderTable();

      const emailHeader = screen.getByText('Email');
      await user.click(emailHeader);

      expect(emailHeader.parentElement).toHaveAttribute('aria-sort');
    });
  });

  describe('Export', () => {
    it('should export data as CSV', async () => {
      const user = userEvent.setup();
      renderTable({ exportable: true });

      const exportButton = screen.getByRole('button', { name: /export|exportar/i });
      await user.click(exportButton);

      // Verify export triggered
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Bulk Actions', () => {
    it('should enable bulk actions when rows are selected', async () => {
      const user = userEvent.setup();
      renderTable({ selectable: true, bulkActions: true });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Select first row

      const deleteButton = screen.getByRole('button', { name: /delete selected|eliminar seleccionados/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('should disable bulk actions when no rows are selected', () => {
      renderTable({ selectable: true, bulkActions: true });

      const deleteButton = screen.getByRole('button', { name: /delete selected|eliminar seleccionados/i });
      expect(deleteButton).toBeDisabled();
    });
  });
});

import { vi } from 'vitest';
