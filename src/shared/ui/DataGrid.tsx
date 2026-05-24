import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  renderCard?: (row: TData) => React.ReactNode;
}

export function DataGrid<TData>({ data, columns, searchPlaceholder = 'Buscar...', onRowClick, renderCard }: DataGridProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div style={{ background: "#fff", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header Toolbar */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
        <div style={{ position: "relative", width: 250 }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 10, display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <Search size={12} color="#aaa" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{
              width: "100%", padding: "6px 10px 6px 28px", border: "1px solid #e8e8e8", borderRadius: 3, fontSize: 11,
              outline: "none", color: "#111", background: "#fafafa"
            }}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ overflowX: "auto" }}>
        {renderCard && window.innerWidth < 768 ? (
          <div style={{ display: "flex", flexDirection: "column", padding: 12, gap: 8 }}>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  style={{
                    background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, padding: 12,
                    cursor: onRowClick ? "pointer" : "default"
                  }}
                >
                  {renderCard(row.original)}
                </div>
              ))
            ) : (
              <div style={{ padding: 40, textAlign: "center", fontSize: 12, color: "#aaa" }}>
                No se encontraron resultados
              </div>
            )}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 600 }}>
            <thead style={{ background: "#fafafa" }}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb",
                        padding: "6px 16px", textAlign: "left", borderBottom: "1px solid #f0f0f0", cursor: "pointer",
                        userSelect: "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span style={{ color: "#ccc" }}>
                          {{
                            asc: <ChevronUp size={10} />,
                            desc: <ChevronDown size={10} />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    style={{ borderBottom: "1px solid #f5f5f5", cursor: onRowClick ? "pointer" : "default" }}
                    className="hover:bg-neutral-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={{ padding: "9px 16px", fontSize: 12, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} style={{ padding: "40px 20px", textAlign: "center", fontSize: 12, color: "#aaa" }}>
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <div style={{ fontSize: 11, color: "#888" }}>
          Mostrando <span style={{ fontWeight: 600, color: "#111" }}>{table.getRowModel().rows.length}</span> de{' '}
          <span style={{ fontWeight: 600, color: "#111" }}>{table.getFilteredRowModel().rows.length}</span> resultados
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{ padding: "2px 6px", border: "1px solid #e8e8e8", borderRadius: 3, background: "#fff", cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed", opacity: table.getCanPreviousPage() ? 1 : 0.5 }}
          >
            <ChevronLeft size={12} color="#111" />
          </button>
          <span style={{ fontSize: 10, color: "#555", fontWeight: 500 }}>
            Pág {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{ padding: "2px 6px", border: "1px solid #e8e8e8", borderRadius: 3, background: "#fff", cursor: table.getCanNextPage() ? "pointer" : "not-allowed", opacity: table.getCanNextPage() ? 1 : 0.5 }}
          >
            <ChevronRight size={12} color="#111" />
          </button>
        </div>
      </div>
    </div>
  );
}
