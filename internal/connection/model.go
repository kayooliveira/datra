package connection

import "time"

type AuthMethod string

const (
	AuthMethodPassword   AuthMethod = "password"
	AuthMethodPrivateKey AuthMethod = "private_key"
)

type Tunnel struct {
	Enabled             bool       `json:"enabled" yaml:"enabled"`
	Host                string     `json:"host" yaml:"host"`
	Port                int        `json:"port" yaml:"port"`
	Username            string     `json:"username" yaml:"username"`
	AuthMethod          AuthMethod `json:"auth_method" yaml:"auth_method"`
	PrivateKeyPath      string     `json:"private_key_path,omitempty" yaml:"private_key_path,omitempty"`
}

type Connection struct {
	ID           string    `json:"id" yaml:"id"`
	Name         string    `json:"name" yaml:"name"`
	Driver       string    `json:"driver" yaml:"driver"`
	Host         string    `json:"host" yaml:"host"`
	Port         int       `json:"port" yaml:"port"`
	Username     string    `json:"username" yaml:"username"`
	Database     string    `json:"database,omitempty" yaml:"database,omitempty"`
	SSLMode      string    `json:"ssl_mode" yaml:"ssl_mode"`
	Tunnel       Tunnel    `json:"tunnel" yaml:"tunnel"`
	CreatedAt    time.Time `json:"created_at" yaml:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" yaml:"updated_at"`
}
