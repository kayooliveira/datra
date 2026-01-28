export namespace main {
	
	export class ConnectionProfile {
	    id: string;
	    name: string;
	    database_type: string;
	    host: string;
	    port: number;
	    username: string;
	    database_name: string;
	
	    static createFrom(source: any = {}) {
	        return new ConnectionProfile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.database_type = source["database_type"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.username = source["username"];
	        this.database_name = source["database_name"];
	    }
	}

}

