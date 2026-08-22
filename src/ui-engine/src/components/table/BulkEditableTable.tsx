import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Save, Trash2, Copy, User } from 'lucide-react';
import { translateHeader as globalTranslate } from '@renderer/utils/translations';

interface ColumnConfig {
  accessorKey: string;
  header: string;
  type?: 'text' | 'number' | 'select' | 'boolean' | 'citizen-search' | 'datalist';
  options?: { label: string; value: string | number }[]; // For select type
  required?: boolean;
}

interface BulkEditableTableProps {
  columnsConfig: ColumnConfig[];
  onSave: (data: any[]) => Promise<void>;
  initialRows?: number;
  tableName?: string;
  onClose?: () => void;
}

const CitizenSearchCell = ({ getValue, row, column: { id }, table }: any) => {
  const initialValue = getValue() || ''; 
  const rowData = row.original;
  const initialDisplay = rowData[`_display_${id}`] || initialValue;
  
  const [displayValue, setDisplayValue] = useState(initialDisplay);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async (query: string) => {
    const upperQuery = query.toLocaleUpperCase('tr-TR');
    setDisplayValue(upperQuery);
    if (upperQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const res = await (window as any).api.executeRaw(
       "SELECT id, Ad, Soyad, TCKN, Sicil_No, Unvan FROM DATA_Vatandas WHERE (COALESCE(TR_UPPER(Ad), '') || ' ' || COALESCE(TR_UPPER(Soyad), '')) LIKE ? OR COALESCE(TR_UPPER(Unvan), '') LIKE ? OR TCKN LIKE ? OR Sicil_No LIKE ? LIMIT 20",
       [`%${upperQuery}%`, `%${upperQuery}%`, `%${upperQuery}%`, `%${upperQuery}%`]
    );
    if (res.success && res.data.length > 0) {
      setSearchResults(res.data);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (citizen: any) => {
    const name = `${citizen.Ad || ''} ${citizen.Soyad || ''} ${citizen.Unvan ? `(${citizen.Unvan})` : ''}`.trim();
    setDisplayValue(name);
    setShowDropdown(false);
    table.options.meta?.updateData(row.index, id, citizen.id, name);
    // Focus next cell if possible
    setTimeout(() => {
      const nextRow = document.querySelector(`tr[data-index="${row.index}"] td[data-col="${id}"]`)?.nextElementSibling?.querySelector('input') as HTMLInputElement;
      if (nextRow) nextRow.focus();
    }, 50);
  };

  return (
    <div className="relative w-full h-full min-h-[40px] flex items-center">
      <input
        value={displayValue}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        type="text"
        className="w-full h-full px-3 py-2 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-500 rounded-md text-sm font-bold text-slate-800 dark:text-slate-100 uppercase"
        placeholder="Kişi Ara (Ad Soyad/TCKN)..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (searchResults.length > 0) {
               handleSelect(searchResults[0]);
            } else {
               const nextRow = document.querySelector(`tr[data-index="${row.index + 1}"] td[data-col="${id}"] input`) as HTMLInputElement;
               if (nextRow) nextRow.focus();
               else table.options.meta?.addRow();
            }
          }
        }}
      />
      {showDropdown && (
        <div className="absolute left-0 top-full mt-1 w-[300px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[9999] max-h-60 overflow-auto">
          {searchResults.map((c) => (
            <div 
              key={c.id} 
              onClick={() => handleSelect(c)}
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 flex items-center gap-3 transition-colors"
            >
               <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500"><User size={14}/></div>
               <div>
                  <div className="text-xs font-black text-slate-800 dark:text-white uppercase">{c.Ad} {c.Soyad} {c.Unvan && <span className="text-[10px] text-slate-400">({c.Unvan})</span>}</div>
                  <div className="text-[10px] font-bold text-slate-500 tracking-widest">{c.TCKN || c.Sicil_No || '-'}</div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Editable Cell Component
const EditableCell = ({ getValue, row, column: { id }, table, type, options }: any) => {
  const index = row.index;
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    table.options.meta?.updateData(index, id, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (type === 'citizen-search') {
    return <CitizenSearchCell getValue={getValue} row={row} column={{id}} table={table} />;
  }

  if (type === 'select' && options) {
    return (
      <select
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        className="w-full h-full min-h-[40px] px-3 py-2 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-500 rounded-md text-sm text-slate-700 dark:text-slate-200"
      >
        <option value="">Seçiniz...</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (type === 'datalist' && options) {
    const listId = `datalist-${id}-${index}`;
    return (
      <div className="w-full h-full relative">
        <input
          list={listId}
          value={value as string}
          onChange={(e) => setValue(e.target.value.toLocaleUpperCase('tr-TR'))}
          onBlur={onBlur}
          className="w-full h-full min-h-[40px] px-3 py-2 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-500 rounded-md text-sm text-slate-700 dark:text-slate-200 uppercase"
          placeholder="..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const nextRow = document.querySelector(`tr[data-index="${index + 1}"] td[data-col="${id}"] input`) as HTMLInputElement;
              if (nextRow) nextRow.focus();
              else table.options.meta?.addRow();
            }
          }}
        />
        <datalist id={listId}>
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value} />
          ))}
        </datalist>
      </div>
    );
  }

  return (
    <input
      value={value as string}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      type={type === 'number' ? 'number' : 'text'}
      className="w-full h-full min-h-[40px] px-3 py-2 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-500 rounded-md text-sm text-slate-700 dark:text-slate-200"
      placeholder="..."
      onKeyDown={(e) => {
        // Handle Tab & Enter for better Excel-like navigation
        if (e.key === 'Enter') {
          e.preventDefault();
          const nextRow = document.querySelector(`tr[data-index="${index + 1}"] td[data-col="${id}"] input`) as HTMLInputElement;
          if (nextRow) nextRow.focus();
          else table.options.meta?.addRow();
        }
      }}
    />
  );
};

export const BulkEditableTable: React.FC<BulkEditableTableProps> = ({
  columnsConfig,
  onSave,
  initialRows = 5,
  tableName = '',
  onClose
}) => {
  const [data, setData] = useState<any[]>(() => 
    Array.from({ length: initialRows }).map(() => ({}))
  );
  const [isSaving, setIsSaving] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(data.length);

  useEffect(() => {
    if (data.length > prevLengthRef.current) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
    prevLengthRef.current = data.length;
  }, [data.length]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const dynamicCols: ColumnDef<any>[] = columnsConfig.map((col) => ({
      accessorKey: col.accessorKey,
      header: col.header || globalTranslate(col.accessorKey).toUpperCase(),
      cell: (props) => <EditableCell {...props} type={col.type || 'text'} options={col.options} />,
    }));

    // Action column for deleting a row
    const actionCol: ColumnDef<any> = {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => removeRow(row.index)}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
          title="Satırı Sil"
          tabIndex={-1}
        >
          <Trash2 size={16} />
        </button>
      ),
      size: 50,
    };

    return [...dynamicCols, actionCol];
  }, [columnsConfig]);
  const addRow = () => {
    setData((old) => {
      if (old.length > 0) {
        const lastRow = old[old.length - 1];
        const dataKeys = Object.keys(lastRow).filter(k => !k.startsWith('_'));
        const isEmpty = dataKeys.length === 0 || dataKeys.every((k) => lastRow[k] === '' || lastRow[k] === null || lastRow[k] === undefined);
        if (isEmpty) return old;
      }
      return [...old, {}];
    });
  };

  const removeRow = (index: number) => {
    setData((old) => old.filter((_, i) => i !== index));
  };

  const updateData = (rowIndex: number, columnId: string, value: any, displayValue?: string) => {
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          const newRow = {
            ...old[rowIndex]!,
            [columnId]: value,
          };
          if (displayValue !== undefined) {
             newRow[`_display_${columnId}`] = displayValue;
          }
          return newRow;
        }
        return row;
      })
    );
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const rows = pasteData.split('\n').filter((r) => r.trim() !== '');
    
    if (rows.length === 0) return;

    const newRows = rows.map((row) => {
      const cells = row.split('\t');
      const rowData: any = {};
      columnsConfig.forEach((col, idx) => {
        if (cells[idx] !== undefined) {
          rowData[col.accessorKey] = cells[idx].trim();
        }
      });
      return rowData;
    });

    setData((prev) => {
      // Find first completely empty row index to start appending/replacing
      const firstEmptyIndex = prev.findIndex(r => Object.keys(r).length === 0 || Object.values(r).every(v => !v));
      if (firstEmptyIndex === -1) {
        return [...prev, ...newRows];
      } else {
        const newData = [...prev];
        newRows.forEach((newRow, idx) => {
          if (newData[firstEmptyIndex + idx] !== undefined) {
            newData[firstEmptyIndex + idx] = newRow;
          } else {
            newData.push(newRow);
          }
        });
        return newData;
      }
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData,
      addRow
    },
  });

  const handleSave = async () => {
    // Filter out completely empty rows
    const validData = data.filter((row) => 
      Object.keys(row).length > 0 && Object.values(row).some((val) => val !== '' && val !== null && val !== undefined)
    );

    if (validData.length === 0) {
      alert("Kaydedilecek geçerli veri bulunamadı.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(validData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden h-full">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Copy className="text-primary-500" size={18} />
            Hızlı Veri Girişi (Excel Modu)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Excel'den kopyalayıp (Ctrl+V) yapıştırabilir veya klavye ile hücreler arası geçiş yapabilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addRow}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Yeni Satır
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {isSaving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
          </button>
        </div>
      </div>

      {/* Table Grid */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto bg-white dark:bg-slate-950 p-4 custom-scrollbar"
        onPaste={handlePaste}
      >
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700 select-none"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : 'auto' }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                data-index={row.index}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    data-col={cell.column.id}
                    className="p-0 border border-slate-200 dark:border-slate-700/50 relative bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 focus-within:z-10"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
