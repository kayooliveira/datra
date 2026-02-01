import React, { useState } from 'react';
import { useSchemas, useTables, useColumns } from '../../hooks/useMetadata';
import { ChevronRight, ChevronDown, Folder, Table, Columns } from 'lucide-react';

interface MetadataTreeProps {
    sessionId: string;
}

const ColumnList: React.FC<{ sessionId: string; schema: string; table: string }> = ({ sessionId, schema, table }) => {
    const { data: columns, isLoading, error } = useColumns(sessionId, schema, table, true);

    if (isLoading) return <div className="pl-4 text-xs text-gray-500">Loading columns...</div>;
    if (error) return <div className="pl-4 text-xs text-red-500">Error</div>;

    return (
        <div className="pl-4">
            {columns?.map(col => (
                <div key={col.name} className="flex items-center gap-1 text-xs text-gray-400 py-0.5">
                    <Columns size={10} />
                    <span>{col.name}</span>
                    <span className="text-gray-600">({col.type})</span>
                </div>
            ))}
        </div>
    );
};

const TableList: React.FC<{ sessionId: string; schema: string }> = ({ sessionId, schema }) => {
    const { data: tables, isLoading, error } = useTables(sessionId, schema, true);
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

    const toggleTable = (name: string) => {
        const newSet = new Set(expandedTables);
        if (newSet.has(name)) newSet.delete(name);
        else newSet.add(name);
        setExpandedTables(newSet);
    };

    if (isLoading) return <div className="pl-4 text-xs text-gray-500">Loading tables...</div>;
    if (error) return <div className="pl-4 text-xs text-red-500">Error</div>;

    return (
        <div className="pl-4">
            {tables?.map(t => (
                <div key={t.name}>
                    <div 
                        className="flex items-center gap-1 hover:bg-gray-800 cursor-pointer py-0.5"
                        onClick={() => toggleTable(t.name)}
                    >
                        {expandedTables.has(t.name) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Table size={12} className="text-blue-400" />
                        <span className="text-sm">{t.name}</span>
                    </div>
                    {expandedTables.has(t.name) && (
                        <ColumnList sessionId={sessionId} schema={schema} table={t.name} />
                    )}
                </div>
            ))}
        </div>
    );
};

export const MetadataTree: React.FC<MetadataTreeProps> = ({ sessionId }) => {
    const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
    // Initially load schemas? Yes.
    const { data: schemas, isLoading, error } = useSchemas(sessionId, true);

    const toggleSchema = (name: string) => {
        const newSet = new Set(expandedSchemas);
        if (newSet.has(name)) newSet.delete(name);
        else newSet.add(name);
        setExpandedSchemas(newSet);
    };

    if (isLoading) return <div className="p-2 text-xs text-gray-500">Loading schemas...</div>;
    if (error) return <div className="p-2 text-xs text-red-500">Error loading schemas</div>;

    return (
        <div className="pl-2">
            {schemas?.map(s => (
                <div key={s}>
                    <div 
                        className="flex items-center gap-1 hover:bg-gray-800 cursor-pointer py-0.5"
                        onClick={() => toggleSchema(s)}
                    >
                        {expandedSchemas.has(s) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Folder size={12} className="text-yellow-500" />
                        <span className="text-sm font-medium">{s}</span>
                    </div>
                    {expandedSchemas.has(s) && (
                        <TableList sessionId={sessionId} schema={s} />
                    )}
                </div>
            ))}
        </div>
    );
};
