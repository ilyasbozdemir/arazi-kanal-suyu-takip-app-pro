import React, { useState, useEffect, useRef } from "react";
import { getTableConfig } from "../../config/TableConfig";
import { useVirtualizer } from "@tanstack/react-virtual";
import { GridRenderer } from "./renderers/GridRenderer";
import { ListRenderer } from "./renderers/ListRenderer";
import { TableRenderer } from "./renderers/TableRenderer";

interface TableContentProps {
  table: any;
  loading: boolean;
  columns: any[];
  combinedFilter: string;
  onRowClick?: (table: string, id: any) => void;
  onSpecialAction?: (action: string, item: any) => void;
  tableName: string;
  viewMode?: "table" | "list" | "grid";
  loadMore?: () => void;
  hasMore?: boolean;
}

export const TableContent: React.FC<TableContentProps> = ({
  table,
  loading,
  columns,
  combinedFilter,
  onRowClick,
  tableName,
  viewMode = "table",
  loadMore,
  hasMore = false,
}) => {
  const config = getTableConfig(tableName);
  const observerTarget = useRef(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const rows = table.getRowModel().rows;
  
  const [columnsCount, setColumnsCount] = useState(1);

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w >= 1600) setColumnsCount(4);
      else if (w >= 1200) setColumnsCount(3);
      else if (w >= 800) setColumnsCount(2);
      else setColumnsCount(1);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // 🛡️ Virtualization Hook
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil((hasMore ? rows.length + 1 : rows.length) / (viewMode === "grid" ? columnsCount : 1)),
    getScrollElement: () => parentRef.current,
    estimateSize: () => viewMode === "grid" ? (tableName === 'DATA_Tapu_Verisi' ? 300 : tableName === 'DATA_Vatandas' ? 340 : 260) : viewMode === "list" ? 120 : 64,
    overscan: 5,
  });

  useEffect(() => {
    if (!loadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore, rows.length]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-40 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
          VERİLER YÖNETİLİYOR...
        </p>
      </div>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-40 text-center text-slate-400 font-bold tracking-widest text-xs opacity-50 italic">
        Kaydı bulamadık: " {combinedFilter} "
      </div>
    );
  }

  const renderContent = () => {
    if (viewMode === "grid") {
      return (
        <div ref={parentRef} className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 min-h-[400px]">
          <GridRenderer 
            rows={rows}
            columnsCount={columnsCount}
            rowVirtualizer={rowVirtualizer}
            tableName={tableName}
            config={config}
            onRowClick={onRowClick}
            observerTarget={observerTarget}
            hasMore={hasMore}
          />
        </div>
      );
    }

    if (viewMode === "list" && config.listRow) {
      return (
        <div ref={parentRef} className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 min-h-[400px]">
          <ListRenderer 
            rows={rows}
            rowVirtualizer={rowVirtualizer}
            tableName={tableName}
            config={config}
            onRowClick={onRowClick}
            observerTarget={observerTarget}
            hasMore={hasMore}
          />
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex-1 min-h-0">
        <div ref={parentRef} className="overflow-auto h-full custom-scrollbar relative">
          <TableRenderer 
            table={table}
            rows={rows}
            columns={columns}
            rowVirtualizer={rowVirtualizer}
            tableName={tableName}
            onRowClick={onRowClick}
            observerTarget={observerTarget}
            hasMore={hasMore}
          />
        </div>
      </div>
    );
  };

  return renderContent();
};
