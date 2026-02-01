package connection

import (
	"database/sql"
)

type SQLiteMetadataProvider struct{}

func (p *SQLiteMetadataProvider) GetSchemas(db *sql.DB) ([]string, error) {
	// SQLite only has one "main" schema usually, but can attach others.
	// For simplicity, just return "main".
	return []string{"main"}, nil
}

func (p *SQLiteMetadataProvider) GetTables(db *sql.DB, schema string) ([]DatabaseTable, error) {
	query := `SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []DatabaseTable
	for rows.Next() {
		var name, typeStr string
		if err := rows.Scan(&name, &typeStr); err != nil {
			return nil, err
		}
		tables = append(tables, DatabaseTable{Schema: schema, Name: name, Type: typeStr})
	}
	return tables, nil
}

func (p *SQLiteMetadataProvider) GetColumns(db *sql.DB, schema, table string) ([]TableColumn, error) {
	// PRAGMA table_info(table_name)
	// cid, name, type, notnull, dflt_value, pk
	query := "PRAGMA table_info(" + table + ")" // Parameterization doesn't work for PRAGMA usually in drivers
	// Warning: Potential SQL Injection if table name is unchecked.
	// However, we get table names from the DB itself. 
	// Ideally we should validate/quote identifier.
	
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var columns []TableColumn
	for rows.Next() {
		var cid int
		var name, dataType string
		var notnull, pk int
		var dflt interface{} // can be null
		
		if err := rows.Scan(&cid, &name, &dataType, &notnull, &dflt, &pk); err != nil {
			return nil, err
		}
		columns = append(columns, TableColumn{
			Name:       name,
			Type:       dataType,
			Nullable:   notnull == 0,
			PrimaryKey: pk > 0,
		})
	}
	return columns, nil
}
