import { useQuery } from '@tanstack/react-query';
import { GetSchemas, GetTables, GetColumns } from '../../wailsjs/go/connection/ConnectionService';

export const useSchemas = (sessionId: string | undefined, enabled: boolean) => {
    return useQuery({
        queryKey: ['schemas', sessionId],
        queryFn: () => GetSchemas(sessionId!),
        enabled: !!sessionId && enabled,
    });
};

export const useTables = (sessionId: string | undefined, schema: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['tables', sessionId, schema],
        queryFn: () => GetTables(sessionId!, schema),
        enabled: !!sessionId && !!schema && enabled,
    });
};

export const useColumns = (sessionId: string | undefined, schema: string, table: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['columns', sessionId, schema, table],
        queryFn: () => GetColumns(sessionId!, schema, table),
        enabled: !!sessionId && !!schema && !!table && enabled,
    });
};
