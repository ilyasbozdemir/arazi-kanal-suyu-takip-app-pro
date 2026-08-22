import React from "react";
import { flexRender } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface TableRendererProps {
  table: any;
  rows: any[];
  columns: any[];
  rowVirtualizer: any;
  tableName: string;
  onRowClick?: (table: string, id: any) => void;
  observerTarget: React.RefObject<any>;
  hasMore: boolean;
}

export const TableRenderer: React.FC<TableRendererProps> = ({
  table,
  rows,
  columns,
  rowVirtualizer,
  tableName,
  onRowClick,
  observerTarget,
  hasMore,
}) => {
  return (
    <table className="w-full text-left border-collapse table-auto">
      <thead className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl sticky top-0 z-20">
        {table.getHeaderGroups().map((headerGroup: any) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header: any) => (
              <th
                key={header.id}
                className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none group"
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </span>
                  {header.column.getCanSort() && (
                    <div className="text-slate-300 group-hover:text-primary-400 transition-colors">
                      {{
                        asc: <ArrowUp size={12} />,
                        desc: <ArrowDown size={12} />,
                      }[header.column.getIsSorted() as string] ?? (
                        <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-sm relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
          const isSentinel = virtualRow.index >= rows.length;

          if (isSentinel) {
            return (
              <tr
                key="sentinel"
                ref={observerTarget}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "80px",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  {hasMore && (
                    <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                  )}
                </td>
              </tr>
            );
          }

          const row = rows[virtualRow.index];
          return (
            <tr
              key={row.id}
              onClick={() => onRowClick && onRowClick(tableName, row.original.id)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={`group transition-all cursor-pointer flex items-center ${row.original.deleted_at ? "bg-rose-50/30 dark:bg-rose-900/10 opacity-70 border-l-4 border-l-rose-500" : row.getIsSelected() ? "bg-primary-50/50 dark:bg-primary-900/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"}`}
            >
              {row.getVisibleCells().map((cell: any) => (
                <td
                  key={cell.id}
                  className={`px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex-1 ${cell.column.id === "select" ? "cursor-pointer" : ""}`}
                  onClick={(e) => {
                    if (cell.column.id === "select") {
                      e.stopPropagation();
                      row.toggleSelected();
                    }
                  }}
                >
                  <div className={cell.column.id === "select" ? "pointer-events-none" : ""}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
