import React, { useRef, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Header,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { connection } from '../../../wailsjs/go/models';
import styles from './result-grid.module.css';

interface ResultGridProps {
  result: connection.QueryResult;
}

// Infer the data type from the value
type DataType = 'null' | 'number' | 'boolean' | 'string' | 'date' | 'json' | 'unknown';

const inferDataType = (value: any): DataType => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    // Check if it looks like a date
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    // Check if it looks like JSON
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
      try {
        JSON.parse(value);
        return 'json';
      } catch {
        return 'string';
      }
    }
    return 'string';
  }
  if (typeof value === 'object') return 'json';
  return 'unknown';
};

// Format the value for display
const formatValue = (value: any, type: DataType): string => {
  if (type === 'null') return 'NULL';
  if (type === 'boolean') return value ? 'true' : 'false';
  if (type === 'number') {
    // Format large numbers with separators
    if (Number.isInteger(value) && Math.abs(value) >= 1000) {
      return value.toLocaleString();
    }
    return String(value);
  }
  if (type === 'json' && typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

// Cell renderer component
const CellValue: React.FC<{ value: any }> = ({ value }) => {
  const type = inferDataType(value);
  const displayValue = formatValue(value, type);
  
  return (
    <span className={`${styles.cellValue} ${styles[`type${type.charAt(0).toUpperCase()}${type.slice(1)}`]}`}>
      {displayValue}
    </span>
  );
};

export const ResultGrid: React.FC<ResultGridProps & { 
  selectedRows?: Record<string, boolean>,
  onRowSelectionChange?: (updater: any) => void 
}> = ({ result, selectedRows, onRowSelectionChange }) => {
  const tableRef = useRef<ReturnType<typeof useReactTable<any>> | null>(null);

  // Calculate optimal column width based on content
  const calculateOptimalWidth = useCallback((colIndex: number, header: string) => {
    if (!result?.rows) return 150;
    
    // Sample first 100 rows for performance
    const sampleRows = result.rows.slice(0, 100);
    const headerWidth = header.length * 8 + 32; // Approximate header width
    
    let maxWidth = headerWidth;
    for (const row of sampleRows) {
      const value = row[colIndex];
      const type = inferDataType(value);
      const displayValue = formatValue(value, type);
      const valueWidth = displayValue.length * 7 + 16; // Approximate value width
      maxWidth = Math.max(maxWidth, valueWidth);
    }
    
    // Cap at reasonable limits
    return Math.min(Math.max(maxWidth, 80), 500);
  }, [result?.rows]);

  // Handle double-click on header to auto-size column
  const handleHeaderDoubleClick = useCallback((header: Header<any, unknown>) => {
    const colIndex = result.columns.indexOf(header.column.id);
    if (colIndex === -1) return;
    
    const optimalWidth = calculateOptimalWidth(colIndex, header.column.id);
    header.column.columnDef.size = optimalWidth;
    
    // Force re-render
    if (tableRef.current) {
      tableRef.current.setColumnSizing((prev) => ({
        ...prev,
        [header.column.id]: optimalWidth,
      }));
    }
  }, [result?.columns, calculateOptimalWidth]);

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => {
      if (!result || !result.columns) return [];
      return result.columns.map((colName, index) => ({
        accessorFn: (row) => row[index],
        id: colName,
        header: colName,
        cell: ({ getValue }) => <CellValue value={getValue()} />,
        size: 150,
        minSize: 50,
      }));
    },
    [result?.columns]
  );

  const table = useReactTable({
    data: result?.rows || [],
    columns,
    state: {
      rowSelection: selectedRows || {},
    },
    enableRowSelection: true,
    onRowSelectionChange: onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
  });

  // Store table ref for column resizing
  React.useEffect(() => {
    tableRef.current = table;
  }, [table]);

  if (!result || !result.columns || result.columns.length === 0) {
      return <div className={styles.noData}>No data to display</div>;
  }

  const { rows } = table.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className={styles.container}>
      <div 
        className={styles.table}
        style={{
            width: table.getTotalSize(),
        }}
      >
        {/* Header */}
        <div className={styles.headerRow}>
          {table.getHeaderGroups().map((headerGroup) => (
            <React.Fragment key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className={styles.headerCell}
                  style={{ width: header.getSize() }}
                  onDoubleClick={() => handleHeaderDoubleClick(header)}
                  title="Double-click to auto-size"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`${styles.resizer} ${
                      header.column.getIsResizing() ? styles.isResizing : ''
                    }`}
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Virtualized Body */}
        <div
          className={styles.body}
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isEven = virtualRow.index % 2 === 0;
            const isSelected = row.getIsSelected();
            return (
              <div
                key={row.id}
                className={`${styles.row} ${isEven ? styles.rowEven : styles.rowOdd} ${isSelected ? styles.rowSelected : ''}`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  display: 'flex',
                }}
                onClick={(e) => {
                    // Toggle selection logic
                    if (onRowSelectionChange) {
                        row.toggleSelected(!isSelected);
                    }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className={styles.cell}
                    style={{ width: cell.column.getSize() }}
                    title={String(cell.getValue() ?? '')}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
