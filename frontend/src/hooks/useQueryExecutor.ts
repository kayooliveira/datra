interface QueryContext {
  database?: string;
  schema?: string;
}

export const useQueryExecutor = () => {
  const processQuery = (query: string, limit: number, driver?: string, context?: QueryContext): string => {
    let processedQuery = query.trim();

    // 1. Context Injection - DISABLED
    // Drivers like go-sql-driver/mysql disable multi-statements by default.
    // Sending "USE db; SELECT..." fails. Context switching should be handled 
    // by a dedicated backend method or by the user for now to ensure stability.
    /*
    if (context?.schema || context?.database) {
      const target = context.schema || context.database;
      if (target) {
        let contextCmd = '';
        const drv = driver?.toLowerCase() || '';

        if (drv.includes('mysql') || drv.includes('mariadb')) {
          contextCmd = `USE ${target};\n`;
        } else if (drv.includes('postgres') || drv.includes('pg')) {
          contextCmd = `SET search_path TO ${target};\n`;
        }
        
        if (contextCmd && !processedQuery.toLowerCase().startsWith(contextCmd.toLowerCase().trim())) {
            processedQuery = contextCmd + processedQuery;
        }
      }
    }
    */

    // 2. Limit Injection
    if (limit > 0) {
      // Check if query is a SELECT statement (basic check)
      if (/^\s*SELECT\b/i.test(processedQuery)) {
          // Check if LIMIT is already present (case insensitive, word boundary)
          // Matches "LIMIT 123" but not "LIMITLESS"
          const hasLimit = /\bLIMIT\s+\d+/i.test(processedQuery);
          
          if (!hasLimit) {
              // Check if query ends with semicolon
              if (processedQuery.endsWith(';')) {
                  processedQuery = processedQuery.slice(0, -1) + ` LIMIT ${limit};`;
              } else {
                  processedQuery = `${processedQuery} LIMIT ${limit}`;
              }
          }
      }
    }
    
    return processedQuery;
  };

  const splitQueries = (sql: string): string[] => {
    const queries: string[] = [];
    let currentQuery = '';
    let inQuote: "'" | '"' | "`" | null = null;
    let isEscaped = false;

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        
        if (isEscaped) {
            isEscaped = false;
            currentQuery += char;
            continue;
        }

        if (char === '\\') {
            isEscaped = true;
            currentQuery += char;
            continue;
        }

        if (inQuote) {
            if (char === inQuote) {
                inQuote = null;
            }
            currentQuery += char;
        } else {
            if (char === "'" || char === '"' || char === "`") {
                inQuote = char;
                currentQuery += char;
            } else if (char === ';') {
                if (currentQuery.trim()) {
                    queries.push(currentQuery.trim());
                    currentQuery = '';
                }
            } else {
                currentQuery += char;
            }
        }
    }

    if (currentQuery.trim()) {
        queries.push(currentQuery.trim());
    }

    return queries;
  };

  return { processQuery, splitQueries };
};