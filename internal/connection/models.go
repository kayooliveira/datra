package connection

import (
	"database/sql"
)

type AuthMethod string

const (
	AuthMethodPassword   AuthMethod = "password"
	AuthMethodPrivateKey AuthMethod = "private_key"
)

type Tunnel struct {
	Enabled        bool       `json:"enabled"`
	Host           string     `json:"host"`
	Port           int        `json:"port"`
	Username       string     `json:"username"`
	AuthMethod     AuthMethod `json:"auth_method"`
	PrivateKeyPath string     `json:"private_key_path,omitempty"`
}

// Connection represents the saved configuration for a database connection.
// Password is NOT stored here to avoid sending it to the frontend.
type Connection struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Driver    string            `json:"driver"` // mysql, postgres, sqlite
	Host      string            `json:"host"`
	Port      int               `json:"port"`
	Database  string            `json:"database"`
	Username  string            `json:"username"`
	SSLMode   string            `json:"ssl_mode"`
	Params    map[string]string `json:"params"`
	Tunnel    Tunnel            `json:"tunnel"`
	CreatedAt string            `json:"created_at"`
	UpdatedAt string            `json:"updated_at"`
}

// Session represents an active connection pool.
type Session struct {
	ID          string    `json:"id"`
	ProfileID   string    `json:"profile_id"`
	ProfileName string    `json:"profile_name"`
	Status      string    `json:"status"` // connected, connecting, failed, disconnected
	ConnectedAt string    `json:"connected_at"`
	DB          *sql.DB   `json:"-"` // Internal connection pool, not exposed to FE
}

// SessionSummary is a lightweight representation of a Session for the frontend.
type SessionSummary struct {
	ID          string    `json:"id"`
	ProfileID   string    `json:"profile_id"`
	ProfileName string    `json:"profile_name"`
	Status      string    `json:"status"`
	ConnectedAt string    `json:"connected_at"`
}

// QueryResult represents the result of a SQL query.
type QueryResult struct {
	Columns []string        `json:"columns"`
	Rows    [][]interface{} `json:"rows"`
	Error   string          `json:"error,omitempty"`
	TimeMs  int64           `json:"time_ms"`
}
