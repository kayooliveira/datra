package connection

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	storage *Storage
}

func NewService(storage *Storage) *Service {
	return &Service{storage: storage}
}

func (s *Service) GetConnections() ([]Connection, error) {
	return s.storage.LoadConnections()
}

func (s *Service) CreateConnection(conn Connection, password string, tunnelPassword string) (string, error) {
	if conn.ID == "" {
		conn.ID = uuid.New().String()
	}
	conn.CreatedAt = time.Now()
	conn.UpdatedAt = time.Now()

	connections, err := s.storage.LoadConnections()
	if err != nil {
		return "", err
	}

	connections = append(connections, conn)
	if err := s.storage.SaveConnections(connections); err != nil {
		return "", err
	}

	if err := s.storage.SaveSecret(conn.ID, password); err != nil {
		return "", fmt.Errorf("failed to save password: %w", err)
	}

	if conn.Tunnel.Enabled && tunnelPassword != "" {
		if err := s.storage.SaveTunnelSecret(conn.ID, tunnelPassword); err != nil {
			return "", fmt.Errorf("failed to save tunnel secret: %w", err)
		}
	}

	return conn.ID, nil
}

func (s *Service) UpdateConnection(conn Connection, password string, tunnelPassword string) error {
	connections, err := s.storage.LoadConnections()
	if err != nil {
		return err
	}

	found := false
	for i, c := range connections {
		if c.ID == conn.ID {
			conn.UpdatedAt = time.Now()
			conn.CreatedAt = c.CreatedAt // Preserve original creation time
			connections[i] = conn
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("connection not found")
	}

	if err := s.storage.SaveConnections(connections); err != nil {
		return err
	}

	if password != "" {
		if err := s.storage.SaveSecret(conn.ID, password); err != nil {
			return fmt.Errorf("failed to update password: %w", err)
		}
	}

	if conn.Tunnel.Enabled && tunnelPassword != "" {
		if err := s.storage.SaveTunnelSecret(conn.ID, tunnelPassword); err != nil {
			return fmt.Errorf("failed to update tunnel secret: %w", err)
		}
	}

	return nil
}

func (s *Service) DeleteConnection(id string) error {
	connections, err := s.storage.LoadConnections()
	if err != nil {
		return err
	}

	newConnections := []Connection{}
	found := false
	for _, c := range connections {
		if c.ID == id {
			found = true
			continue
		}
		newConnections = append(newConnections, c)
	}

	if !found {
		return fmt.Errorf("connection not found")
	}

	if err := s.storage.SaveConnections(newConnections); err != nil {
		return err
	}

	_ = s.storage.DeleteSecret(id)
	_ = s.storage.DeleteTunnelSecret(id)

	return nil
}

func (s *Service) TestConnection(conn Connection, password string, tunnelPassword string) error {
	// TODO: Implement actual database connection test using driver-specific logic
	// For now, we simulate a check or do a basic net.Dial if not using tunnel
	// If tunnel is enabled, we would need to start the tunnel first
	
	// Basic validation for now
	if conn.Host == "" || conn.Port == 0 {
		return fmt.Errorf("host and port are required")
	}

	return nil
}

func testDatabase(driver, dsn string) error {
	db, err := sql.Open(driver, dsn)
	if err != nil {
		return err
	}
	defer db.Close()
	return db.Ping()
}
