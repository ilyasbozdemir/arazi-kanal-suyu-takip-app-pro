// SmartSearchInput.tsx
// A reusable React component for the Turkish citizen registry application.
// It parses the user input in real‑time and builds a SQL WHERE clause according to
// the detection rules defined by the user. The generated clause is shown below the
// input for debugging/transparency and emitted to the parent via the `onSearch`
// callback when the user presses Enter or clicks the search button.

import React, { useState, useEffect, KeyboardEvent } from "react";
import { Search } from "lucide-react";

interface SmartSearchInputProps {
  /**
   * Callback invoked with the final query when the user confirms the search.
   * The argument can be a raw SQL WHERE string or a structured object – for now
   * we emit the raw string.
   */
  onSearch: (query: string) => void;
}

/**
 * Normalises a Turkish date string (DD.MM.YYYY or DD/MM/YYYY) to ISO format.
 */
function normaliseDate(dateStr: string): string | null {
  const match = dateStr.match(/^(\d{2})[./](\d{2})[./](\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  // Simple validation – we trust the user for now.
  return `${year}-${month}-${day}`;
}

/**
 * Parses the raw user input and returns a SQL WHERE clause (without the leading
 * "WHERE" keyword). The rules follow the specification given by the user.
 */
function buildWhereClause(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  // Helper to escape single quotes for SQL safety.
  const esc = (v: string) => v.replace(/'/g, "''");

  // 1️⃣  Colon syntax – field:value (field may contain letters, numbers, _)
  const colonMatch = input.match(/^([a-zA-Z0-9_çÇğĞıİöÖşŞüÜ]+)\s*:\s*(.+)$/);
  if (colonMatch) {
    const field = colonMatch[1];
    const value = esc(colonMatch[2]);
    return `"${field}" = '${value}'`;
  }

  // 2️⃣  Hash shortcut for Sicil No (e.g. "#123456")
  if (input.startsWith("#")) {
    const sicil = input.slice(1).replace(/\D/g, "");
    if (sicil.length >= 6 && sicil.length <= 8) {
      return `"Sicil_No" = '${esc(sicil)}'`;
    }
  }

  // 3️⃣  TCKN – exactly 11 digits
  if (/^\d{11}$/.test(input)) {
    return `"TC" = '${input}'`;
  }

  // 4️⃣  Sicil No – 6‑8 digits (without leading #)
  if (/^\d{6,8}$/.test(input)) {
    return `"Sicil_No" = '${input}'`;
  }

  // 5️⃣  Date detection (DD.MM.YYYY or DD/MM/YYYY)
  const dateNorm = normaliseDate(input);
  if (dateNorm) {
    return `"Dogum_Tarihi" = '${dateNorm}'`;
  }

  // 6️⃣  Parent‑child syntax – children:X or parent:X
  const parentChildMatch = input.match(/^(children|parent)\s*:\s*(.+)$/i);
  if (parentChildMatch) {
    const column = parentChildMatch[1].toLowerCase() === "children" ? "parent_id" : "child_id";
    const name = esc(parentChildMatch[2]);
    // Simple sub‑query – assumes a table named "VatandasTBL" with a column "Ad"
    return `"${column}" = (SELECT "id" FROM "DATA_Vatandas" WHERE "Ad" = '${name}')`;
  }

  // 7️⃣  Ad Soyad – two or more words separated by spaces
  const words = input.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const ad = esc(words[0]);
    const soyad = esc(words.slice(1).join(" "));
    return `"Ad" = '${ad}' AND "Soyad" = '${soyad}'`;
  }

  // 8️⃣  Fallback – LIKE on common text columns (ad, soyad, notlar)
  const like = esc(input);
  return `("Ad" LIKE '%${like}%' OR "Soyad" LIKE '%${like}%' OR "Notlar" LIKE '%${like}%')`;
}

const SmartSearchInput: React.FC<SmartSearchInputProps> = ({ onSearch }) => {
  const [value, setValue] = useState("");
  const [whereClause, setWhereClause] = useState("");

  // Update the WHERE clause whenever the user types.
  useEffect(() => {
    const clause = buildWhereClause(value);
    setWhereClause(clause);
  }, [value]);

  const triggerSearch = () => {
    const clause = buildWhereClause(value);
    // Emit the full clause – the parent can prepend "WHERE" if needed.
    onSearch(clause);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch();
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full max-w-lg">
      <div className="relative">
        <input
          type="text"
          placeholder="Ara (isim soyad, alan:değer, 11 haneli TCKN, #sicil, 01.01.1990, parent:Ali)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-primary-500 transition"
        />
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <button
          onClick={triggerSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white rounded-full p-1 hover:bg-primary-700 transition"
          title="Ara"
        >
          <Search size={16} />
        </button>
      </div>
      {/* Live preview of the generated SQL WHERE clause */}
      {whereClause && (
        <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs overflow-x-auto">
          WHERE {whereClause}
        </pre>
      )}
    </div>
  );
};

export default SmartSearchInput;

