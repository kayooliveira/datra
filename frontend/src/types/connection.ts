export interface ConnectionProfile {
    id: string;
    name: string;
    driver: string; // 'mysql' | 'postgres' | 'sqlite'
    host: string;
    port: number;
    database: string;
    username: string;
    ssl_mode: string;
    params: { [key: string]: string };
    created_at: string;
    updated_at: string;
}

export interface SessionSummary {
    id: string;
    profile_id: string;
    profile_name: string;
    status: 'connected' | 'connecting' | 'failed' | 'disconnected';
    connected_at: string;
}

export interface DatabaseTable {
    schema: string;
    name: string;
    type: 'table' | 'view';
}

export interface TableColumn {
    name: string;
    type: string;
    nullable: boolean;
    primary_key: boolean;
}

export interface QueryResult {
    columns: string[];
    rows: any[][];
    error?: string;
    time_ms: number;
}
