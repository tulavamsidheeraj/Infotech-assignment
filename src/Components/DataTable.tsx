import { useState,useCallback, useMemo } from "react";

type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
    key: string;
    title: string;
    dataIndex: keyof T;
    sortable?: boolean;
    
    render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode; 
}

interface DataTableProps<T extends Record<string, any>> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    selectable?: boolean;
    emptyMessage?: string;
    onRowSelect?: (selectedRows: T[]) => void;
}
const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ChevronUp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);

const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);


const DataTable = <T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    selectable = false,
    emptyMessage = "No data available.",
    onRowSelect,
}: DataTableProps<T>) => {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());

// sorting logic
    const handleSort = useCallback((key: keyof T) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else {
            setSortKey(null);
            setSortDirection(null);
        }
    }, [sortKey, sortDirection]);

    const sortedData = useMemo(() => {
        if (!sortKey || !sortDirection) return data;
        const sortableData = [...data];
        sortableData.sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortDirection === 'asc' 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sortableData;
    }, [data, sortKey, sortDirection]);


   
    const primaryDataIndex: keyof T = (columns[0]?.dataIndex || 'id') as keyof T; 

    const handleSelectRow = useCallback((row: T, isChecked: boolean) => {
        setSelectedRowKeys(prevKeys => {
            const newKeys = new Set(prevKeys);
            // Use the dataIndex to reliably get the unique ID from the row object
            const key = row[primaryDataIndex]; 
            
            if (isChecked) {
                newKeys.add(String(key));
            } else {
                newKeys.delete(String(key));
            }

            
            if (onRowSelect) {
                const selectedRows = data.filter(r => newKeys.has(String(r[primaryDataIndex])));
                onRowSelect(selectedRows);
            }

            return newKeys;
        });
    }, [data, primaryDataIndex, onRowSelect]);

    const handleSelectAll = useCallback((isChecked: boolean) => {
        setSelectedRowKeys(() => {
            const newKeys = new Set<string>();
            if (isChecked) {
                // Use the dataIndex to reliably get the unique ID from the row object
                data.forEach(row => newKeys.add(String(row[primaryDataIndex])));
            }
            
            // Notify parent component
            if (onRowSelect) {
                const selectedRows = isChecked ? data : [];
                onRowSelect(selectedRows);
            }

            return newKeys;
        });
    }, [data, primaryDataIndex, onRowSelect]);

    const isAllSelected = data.length > 0 && selectedRowKeys.size === data.length;

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex justify-center items-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner text-blue-500">
                <LoadingSpinner />
                <span className="ml-3 font-medium text-lg dark:text-gray-300">Loading data...</span>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex justify-center items-center p-12 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-dashed border-gray-300 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-lg">{emptyMessage}</span>
            </div>
        );
    }


    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        {/* Selection Checkbox Header */}
                        {selectable && (
                            <th scope="col" className="px-6 py-3 text-left w-10">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                    aria-label="Select all rows"
                                />
                            </th>
                        )}

                        {/* Column Headers */}
                        {columns.map(column => {
                            const isSorted = sortKey === column.dataIndex;
                            const isSortable = column.sortable;

                            return (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isSortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''}`}
                                    onClick={() => isSortable && handleSort(column.dataIndex)}
                                    aria-sort={isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                    <div className="flex items-center">
                                        {column.title}
                                        {isSortable && (
                                            <span className="ml-1 text-gray-400">
                                                {isSorted ? (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                ) : (
                                                    // Neutral indicator (up/down chevron stack, for visual clarity)
                                                    <div className="flex flex-col opacity-50">
                                                        <ChevronUp className="w-3 h-3 -mb-1" />
                                                        <ChevronDown className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedData.map((row, rowIndex) => {
                        // FIX: Use primaryDataIndex to get the unique row key
                        const rowKey = String(row[primaryDataIndex]);
                        const isSelected = selectedRowKeys.has(rowKey);
                        
                        return (
                            <tr 
                                key={rowKey} 
                                className={`transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                {/* Selection Checkbox Cell */}
                                {selectable && (
                                    <td className="px-6 py-4 whitespace-nowrap w-10">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleSelectRow(row, e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                            aria-label={`Select row ${rowKey}`}
                                        />
                                    </td>
                                )}

                                {/* Data Cells */}
                                {columns.map(column => {
                                    const cellContent = row[column.dataIndex];
                                    
                                    return (
                                        <td 
                                            key={column.key} 
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                                        >
                                            {column.render 
                                                ? column.render(cellContent, row, rowIndex) 
                                                : String(cellContent)}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;