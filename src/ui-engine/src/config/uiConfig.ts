/**
 * 🎨 KURUM MUNICIPAL GIS - UI CONFIGURATION SYSTEM
 * This file centralizes all UI-related aesthetic and layout settings.
 * These settings can be adjusted globally and are injected via Tailwind/Style providers.
 */

export interface UIConfig {
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  uiScale: number; // 0.8 to 1.2
  fontFamily: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  compactMode: boolean;
  menuDensity: 'comfortable' | 'compact';
}

export const DEFAULT_UI_CONFIG: UIConfig = {
  fontSize: 'sm',
  uiScale: 1.0,
  fontFamily: "'Montserrat', 'Corbel', 'Inter', sans-serif",
  borderRadius: 'xl',
  compactMode: false,
  menuDensity: 'comfortable'
};

export const FONT_SIZE_MAP = {
  'xs': '0.75rem',    // 12px equivalent
  'sm': '0.875rem',   // 14px equivalent
  'base': '1rem',      // 16px equivalent
  'lg': '1.125rem',   // 18px equivalent
  'xl': '1.25rem'     // 20px equivalent
};

export const BORDER_RADIUS_MAP = {
  'none': '0rem',
  'sm': '0.25rem',    // 4px
  'md': '0.5rem',     // 8px
  'lg': '0.75rem',    // 12px
  'xl': '1.25rem',    // 20px
  'full': '9999px'    // Full radius stays fixed or use rem if preferred
};

export const FONT_FAMILY_OPTIONS = [
  { label: 'Montserrat (Resmi)', value: "'Montserrat', sans-serif" },
  { label: 'Corbel (Modern)', value: "'Corbel', 'Segoe UI', sans-serif" },
  { label: 'Inter (Sistem)', value: "'Inter', sans-serif" },
  { label: 'Roboto (Klasik)', value: "'Roboto', sans-serif" }
];
