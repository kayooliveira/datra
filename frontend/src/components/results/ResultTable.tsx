import React from 'react';
import { connection } from '../../../wailsjs/go/models';

interface ResultTableProps {
    result: connection.QueryResult;
}

export const ResultTable: React.FC<ResultTableProps> = ({ result }) => {
    if (!result.rows || result.rows.length === 0) {
        return <div className="p-2 text-sm text-gray-500">No results ({result.time_ms}ms)</div>;
    }

    return (
        <div className="w-full">
            <div className="p-1 bg-gray-800 text-xs text-gray-400 border-b border-gray-700">
                {result.rows.length} rows retrieved in {result.time_ms}ms
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-800 text-gray-300">
                        {result.columns.map((col, i) => (
                            <th key={i} className="p-2 text-xs font-medium border-b border-gray-700 border-r border-gray-700 last:border-r-0 whitespace-nowrap">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {result.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-800 text-gray-300">
                            {row.map((cell: any, j: number) => (
                                <td key={j} className="p-2 text-xs border-b border-gray-700 border-r border-gray-700 last:border-r-0 whitespace-nowrap overflow-hidden max-w-[200px] truncate">
                                    {String(cell)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
