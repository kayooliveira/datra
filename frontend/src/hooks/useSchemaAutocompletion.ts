import { useQuery } from '@tanstack/react-query';
import { GetTables, GetColumns } from '../../wailsjs/go/connection/ConnectionService';
import { Completion } from '@codemirror/autocomplete';

export interface ColumnInfo {
    name: string;
    type: string;
}

export interface TableCompletion {
    columns: ColumnInfo[];
}

export interface CompletionSchema {
    [table: string]: readonly (string | Completion)[];
}

export interface SchemaData {
    schema: CompletionSchema;
    tables: string[];
    defaultSchema?: string;
}

export const useSchemaAutocompletion = (
    sessionId: string | null, 
    schema: string | undefined
) => {
    return useQuery({
        queryKey: ['autocompletion', sessionId, schema],
        queryFn: async (): Promise<SchemaData> => {
            if (!sessionId || !schema) {
                return { schema: {}, tables: [] };
            }

            const completionSchema: CompletionSchema = {};
            const tableNames: string[] = [];
            
            try {
                // 1. Fetch tables
                const tables = await GetTables(sessionId, schema);
                
                // 2. Fetch columns for all tables in parallel
                const columnPromises = tables.map(async (table) => {
                    tableNames.push(table.name);
                    
                    try {
                        const columns = await GetColumns(sessionId, schema, table.name);
                        
                        // Create completion items with type info for better suggestions
                        completionSchema[table.name] = columns.map(col => ({
                            label: col.name,
                            type: 'property',
                            detail: col.type || 'column',
                            info: `Column: ${col.name}\nType: ${col.type || 'unknown'}`,
                        } as Completion));
                        
                        // Also add with schema prefix for qualified names
                        const qualifiedName = `${schema}.${table.name}`;
                        completionSchema[qualifiedName] = completionSchema[table.name];
                    } catch (err) {
                        console.warn(`Failed to fetch columns for table ${table.name}`, err);
                        completionSchema[table.name] = [];
                    }
                });

                await Promise.all(columnPromises);
            } catch (err) {
                console.error("Failed to fetch schema for autocompletion:", err);
            }

            return {
                schema: completionSchema,
                tables: tableNames,
                defaultSchema: schema,
            };
        },
        enabled: !!sessionId && !!schema,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};
