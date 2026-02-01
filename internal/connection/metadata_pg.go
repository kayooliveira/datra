package connection

import (
	"database/sql"
)

type PostgresMetadataProvider struct{}

func (p *PostgresMetadataProvider) GetSchemas(db *sql.DB) ([]string, error) {
	// Standard PG schemas
	query := "SELECT nspname FROM pg_catalog.pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'"
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schemas []string
	for rows.Next() {
		var s string
		if err := rows.Scan(&s); err != nil {
			return nil, err
		}
		schemas = append(schemas, s)
	}
	return schemas, nil
}

func (p *PostgresMetadataProvider) GetTables(db *sql.DB, schema string) ([]DatabaseTable, error) {
	query := `
		SELECT table_name, table_type
		FROM information_schema.tables
		WHERE table_schema = $1
	`
	rows, err := db.Query(query, schema)
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
		tType := "table"
		if typeStr == "VIEW" {
			tType = "view"
		}
		tables = append(tables, DatabaseTable{Schema: schema, Name: name, Type: tType})
	}
	return tables, nil
}

func (p *PostgresMetadataProvider) GetColumns(db *sql.DB, schema, table string) ([]TableColumn, error) {
	query := `
		SELECT column_name, data_type, is_nullable, 
		       (SELECT COUNT(*) FROM information_schema.key_column_usage kcu
		        JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
		        WHERE kcu.table_schema = c.table_schema 
		          AND kcu.table_name = c.table_name 
		          AND kcu.column_name = c.column_name
		          AND tc.constraint_type = 'PRIMARY KEY') > 0 as is_pk
		FROM information_schema.columns c
		WHERE table_schema = $1 AND table_name = $2
		ORDER BY ordinal_position
	`
	rows, err := db.Query(query, schema, table)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var columns []TableColumn
	for rows.Next() {
		var name, dataType, isNullable string
		var isPk bool
		if err := rows.Scan(&name, &dataType, &isNullable, &isPk); err != nil {
			return nil, err
		}
		columns = append(columns, TableColumn{
			Name:       name,
			Type:       dataType,
			Nullable:   isNullable == "YES",
			PrimaryKey: isPk,
		})
	}
	return columns, nil
}
