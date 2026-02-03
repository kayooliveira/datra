package connection

import (
	"database/sql"
)

type MySQLMetadataProvider struct{}

func (p *MySQLMetadataProvider) GetSchemas(db *sql.DB) ([]string, error) {
	rows, err := db.Query("SHOW DATABASES")
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

func (p *MySQLMetadataProvider) GetTables(db *sql.DB, schema string) ([]DatabaseTable, error) {
	// MySQL uses DATABASE() context usually, or FROM schema
	query := `
		SELECT TABLE_NAME, TABLE_TYPE 
		FROM information_schema.TABLES 
		WHERE TABLE_SCHEMA = ?
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

func (p *MySQLMetadataProvider) GetColumns(db *sql.DB, schema, table string) ([]TableColumn, error) {
	query := `
		SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
		FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
		ORDER BY ORDINAL_POSITION
	`
	rows, err := db.Query(query, schema, table)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var columns []TableColumn
	for rows.Next() {
		var name, dataType, isNullable, colKey string
		if err := rows.Scan(&name, &dataType, &isNullable, &colKey); err != nil {
			return nil, err
		}
		columns = append(columns, TableColumn{
			Name:       name,
			Type:       dataType,
			Nullable:   isNullable == "YES",
			PrimaryKey: colKey == "PRI",
		})
	}
	return columns, nil
}
