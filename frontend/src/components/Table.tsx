import type { ReactNode } from "react";

type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
};

type TableProps<T> = {
  caption: string;
  columns: Column<T>[];
  data: T[];
};

export function Table<T>({ caption, columns, data }: TableProps<T>) {
  return (
    <div className="table-responsive">
      <table className="table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column, columnIndex) => (
              <th key={`column-${columnIndex}`}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column, columnIndex) => (
                <td key={`cell-${columnIndex}`}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
