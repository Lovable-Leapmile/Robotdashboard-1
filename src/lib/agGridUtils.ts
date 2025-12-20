import { ColDef } from "ag-grid-community";
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

/**
 * Creates a date column definition with proper filtering
 */
export const createDateColumnDef = (
  field: string,
  headerName: string,
  options: Partial<ColDef> = {}
): ColDef => ({
  field,
  headerName,
  sortable: true,
  filter: "agDateColumnFilter",
  filterParams: dateFilterParams,
  flex: 1.2,
  minWidth: 150,
  valueFormatter: (params) => {
    if (!params.value) return "N/A";
    try {
      return format(new Date(params.value), "dd-MM-yyyy HH:mm:ss");
    } catch {
      return params.value;
    }
  },
  ...options,
});

/**
 * Default AG Grid props to ensure popups work correctly
 */
export const getDefaultGridProps = () => ({
  popupParent: typeof document !== "undefined" ? document.body : null,
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
