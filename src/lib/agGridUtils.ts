import { ColDef, PostProcessPopupParams } from "ag-grid-community";
import { format, isValid, parse, parseISO } from "date-fns";

/**
 * Best-effort parsing for API date strings so AG Grid date filtering works reliably.
 * Supports:
 * - ISO strings (with/without timezone)
 * - "yyyy-MM-dd HH:mm:ss" (common API format)
 * - "dd-MM-yyyy hh:mm:ss a" (our display format)
 * - epoch millis (string/number)
 */
const parseToDate = (value: unknown): Date | null => {
  if (value == null || value === "") return null;
  if (value instanceof Date) return isValid(value) ? value : null;

  if (typeof value === "number") {
    const d = new Date(value);
    return isValid(d) ? d : null;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  // Epoch millis as a string
  if (/^\d{10,}$/.test(raw)) {
    const d = new Date(Number(raw));
    return isValid(d) ? d : null;
  }

  // ISO (most common)
  try {
    const d = parseISO(raw);
    if (isValid(d)) return d;
  } catch {
    // ignore
  }

  // Native Date parsing (covers many cases like RFC2822)
  const native = new Date(raw);
  if (isValid(native)) return native;

  // Common API string formats
  const candidates: Array<[string, boolean]> = [
    ["yyyy-MM-dd HH:mm:ss.SSS", false],
    ["yyyy-MM-dd HH:mm:ss", false],
    ["yyyy-MM-dd'T'HH:mm:ss.SSS", false],
    ["yyyy-MM-dd'T'HH:mm:ss", false],
    ["dd-MM-yyyy hh:mm:ss a", true],
    ["dd-MM-yyyy HH:mm:ss", false],
    ["dd-MM-yyyy", false],
  ];

  for (const [fmt, hasMeridiem] of candidates) {
    try {
      const d = parse(raw, fmt, new Date());
      if (isValid(d) && (!hasMeridiem || /\b(AM|PM)\b/i.test(raw))) return d;
    } catch {
      // ignore
    }
  }

  return null;
};

/**
 * Date filter comparator for AG Grid
 * Compares dates properly for filtering operations
 */
export const dateFilterComparator = (filterLocalDateAtMidnight: Date, cellValue: unknown): number => {
  const cellDate = parseToDate(cellValue);
  if (!cellDate) return -1;

  // Reset time to midnight for accurate date-only comparison (local time)
  const cellDateMidnight = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());

  const a = cellDateMidnight.getTime();
  const b = filterLocalDateAtMidnight.getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return -1;

  if (a === b) return 0;
  if (a < b) return -1;
  return 1;
};

/**
 * Date filter params configuration for AG Grid
 * Configured for date-only filtering (no time picker)
 */
export const dateFilterParams = {
  comparator: dateFilterComparator,
  browserDatePicker: true,
  minValidYear: 2000,
  maxValidYear: 2100,
  inRangeFloatingFilterDateFormat: "yyyy-MM-dd",
  // Ensure date-only comparison and display
  filterOptions: [
    "equals",
    "notEqual", 
    "lessThan",
    "greaterThan",
    "inRange",
    "blank",
    "notBlank",
  ],
  defaultOption: "equals",
  // Suppress time-related UI elements
  suppressAndOrCondition: false,
  buttons: ["apply", "reset", "cancel"],
};

export const formatDateTime12 = (value: unknown): string => {
  const d = parseToDate(value);
  if (!d) return value == null || value === "" ? "N/A" : String(value);
  try {
    return format(d, "dd-MM-yyyy hh:mm:ss a");
  } catch {
    return String(value);
  }
};

/**
 * Creates a date column definition with proper filtering
 */
export const createDateColumnDef = (field: string, headerName: string, options: Partial<ColDef> = {}): ColDef => ({
  field,
  headerName,
  sortable: true,
  filter: "agDateColumnFilter",
  filterParams: dateFilterParams,
  flex: 1.2,
  minWidth: 150,
  valueFormatter: (params) => formatDateTime12(params.value),
  ...options,
});

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

/**
 * Reposition popups so they:
 * - Open aligned to their event source (header menu/filter button)
 * - Never overflow the viewport (all resolutions)
 */
export const postProcessAgGridPopup = (params: PostProcessPopupParams) => {
  if (typeof window === "undefined") return;

  // Let AG Grid do its initial placement first
  window.requestAnimationFrame(() => {
    const popupEl = params.ePopup as HTMLElement | null;
    const sourceEl = params.eventSource as HTMLElement | null;
    if (!popupEl) return;

    const margin = 8;
    const popupRect = popupEl.getBoundingClientRect();

    // If we have a source element, anchor to it (this fixes "wrong position" issues)
    if (sourceEl?.getBoundingClientRect) {
      const sourceRect = sourceEl.getBoundingClientRect();

      // Default: open below, left-aligned with the source
      let left = sourceRect.left;
      let top = sourceRect.bottom;

      // Clamp horizontally
      left = clamp(left, margin, window.innerWidth - popupRect.width - margin);

      // Clamp vertically: if doesn't fit below, try above; otherwise clamp to viewport
      const bottomOverflow = top + popupRect.height > window.innerHeight - margin;
      if (bottomOverflow) {
        const aboveTop = sourceRect.top - popupRect.height;
        if (aboveTop >= margin) {
          top = aboveTop;
        }
      }
      top = clamp(top, margin, window.innerHeight - popupRect.height - margin);

      // popupParent is document.body in our defaults; use scroll offsets
      popupEl.style.left = `${left + window.scrollX}px`;
      popupEl.style.top = `${top + window.scrollY}px`;
      popupEl.style.right = "auto";
      popupEl.style.bottom = "auto";
      popupEl.style.transform = "none";
      return;
    }

    // Fallback: just clamp current position into the viewport
    const desiredLeft = clamp(popupRect.left, margin, window.innerWidth - popupRect.width - margin);
    const desiredTop = clamp(popupRect.top, margin, window.innerHeight - popupRect.height - margin);

    popupEl.style.left = `${desiredLeft + window.scrollX}px`;
    popupEl.style.top = `${desiredTop + window.scrollY}px`;
    popupEl.style.right = "auto";
    popupEl.style.bottom = "auto";
    popupEl.style.transform = "none";
  });
};

/**
 * Default AG Grid props to ensure popups work correctly
 */
export const getDefaultGridProps = () => ({
  popupParent: typeof document !== "undefined" ? document.body : null,
  postProcessPopup: postProcessAgGridPopup,
  enableCellTextSelection: true,
  ensureDomOrder: true,
  suppressMenuHide: true,
});

// Legacy export for backward compatibility
export const defaultGridProps = {
  enableCellTextSelection: true,
  ensureDomOrder: true,
  suppressMenuHide: true,
};

