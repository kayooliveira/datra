export namespace connection {
	
	export class Tunnel {
	    enabled: boolean;
	    host: string;
	    port: number;
	    username: string;
	    auth_method: string;
	    private_key_path?: string;
	
	    static createFrom(source: any = {}) {
	        return new Tunnel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.username = source["username"];
	        this.auth_method = source["auth_method"];
	        this.private_key_path = source["private_key_path"];
	    }
	}
	export class Connection {
	    id: string;
	    name: string;
	    driver: string;
	    host: string;
	    port: number;
	    database: string;
	    username: string;
	    ssl_mode: string;
	    params: Record<string, string>;
	    tunnel: Tunnel;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new Connection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.driver = source["driver"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.database = source["database"];
	        this.username = source["username"];
	        this.ssl_mode = source["ssl_mode"];
	        this.params = source["params"];
	        this.tunnel = this.convertValues(source["tunnel"], Tunnel);
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DatabaseTable {
	    schema: string;
	    name: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new DatabaseTable(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.schema = source["schema"];
	        this.name = source["name"];
	        this.type = source["type"];
	    }
	}
	export class QueryResult {
	    columns: string[];
	    rows: any[][];
	    error?: string;
	    time_ms: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.columns = source["columns"];
	        this.rows = source["rows"];
	        this.error = source["error"];
	        this.time_ms = source["time_ms"];
	    }
	}
	export class SessionSummary {
	    id: string;
	    profile_id: string;
	    profile_name: string;
	    status: string;
	    connected_at: string;
	
	    static createFrom(source: any = {}) {
	        return new SessionSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.profile_id = source["profile_id"];
	        this.profile_name = source["profile_name"];
	        this.status = source["status"];
	        this.connected_at = source["connected_at"];
	    }
	}
	export class TableColumn {
	    name: string;
	    type: string;
	    nullable: boolean;
	    primary_key: boolean;
	
	    static createFrom(source: any = {}) {
	        return new TableColumn(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	        this.nullable = source["nullable"];
	        this.primary_key = source["primary_key"];
	    }
	}

}

export namespace main {
	
	export class UserPreferences {
	    language: string;
	    theme: string;
	
	    static createFrom(source: any = {}) {
	        return new UserPreferences(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.language = source["language"];
	        this.theme = source["theme"];
	    }
	}

}

