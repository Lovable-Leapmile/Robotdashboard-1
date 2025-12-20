import { ColDef, PostProcessPopupParams } from "ag-grid-community";
import { format } from "date-fns";

/**
 * Date filter comparator for AG Grid
 * Compares dates properly for filtering operations
 */
export const dateFilterComparator = (filterLocalDateAtMidnight: Date, cellValue: string): number => {
  if (cellValue == null || cellValue === "") return -1;

  try {
    const cellDate = new Date(cellValue);
    // Reset time to midnight for accurate date comparison
    const cellDateMidnight = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());

    if (cellDateMidnight.getTime() === filterLocalDateAtMidnight.getTime()) {
      return 0;
    }
    if (cellDateMidnight < filterLocalDateAtMidnight) {
      return -1;
    }
    return 1;
  } catch {
    return -1;
  }
};

/**
 * Date filter params configuration for AG Grid
 */
export const dateFilterParams = {
  comparator: dateFilterComparator,
  browserDatePicker: true,
  minValidYear: 2000,
  maxValidYear: 2100,
  inRangeFloatingFilterDateFormat: "dd-MM-yyyy",
};

export const formatDateTime24 = (value: unknown): string => {
  if (value == null || value === "") return "N/A";
  try {
    return format(new Date(String(value)), "dd-MM-yyyy HH:mm:ss");
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
  valueFormatter: (params) => formatDateTime24(params.value),
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

