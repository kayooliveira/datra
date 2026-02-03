package connection

import (
	"database/sql"
	"fmt"
)

type DatabaseTable struct {
	Schema string `json:"schema"`
	Name   string `json:"name"`
	Type   string `json:"type"` // table, view
}

type TableColumn struct {
	Name       string `json:"name"`
	Type       string `json:"type"`
	Nullable   bool   `json:"nullable"`
	PrimaryKey bool   `json:"primary_key"`
}

type MetadataProvider interface {
	GetSchemas(db *sql.DB) ([]string, error)
	GetTables(db *sql.DB, schema string) ([]DatabaseTable, error)
	GetColumns(db *sql.DB, schema, table string) ([]TableColumn, error)
}

// Factory to get provider
func GetMetadataProvider(driver string) (MetadataProvider, error) {
	switch driver {
	case "mysql":
		return &MySQLMetadataProvider{}, nil
	case "postgres":
		return &PostgresMetadataProvider{}, nil
	case "sqlite":
		return &SQLiteMetadataProvider{}, nil
	default:
		return nil, fmt.Errorf("unsupported metadata provider for driver: %s", driver)
	}
}
