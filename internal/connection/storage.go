package connection

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/zalando/go-keyring"
	"gopkg.in/yaml.v3"
)

const (
	keyringService = "datra"
	connectionsFile = "connections.yaml"
)

type Storage struct {
	configDir string
}

func NewStorage(configDir string) *Storage {
	return &Storage{configDir: configDir}
}

func (s *Storage) getFilePath() string {
	return filepath.Join(s.configDir, connectionsFile)
}

func (s *Storage) LoadConnections() ([]Connection, error) {
	path := s.getFilePath()
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return []Connection{}, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read connections file: %w", err)
	}

	var connections []Connection
	if err := yaml.Unmarshal(data, &connections); err != nil {
		return nil, fmt.Errorf("failed to unmarshal connections: %w", err)
	}

	return connections, nil
}

func (s *Storage) SaveConnections(connections []Connection) error {
	if err := os.MkdirAll(s.configDir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	data, err := yaml.Marshal(connections)
	if err != nil {
		return fmt.Errorf("failed to marshal connections: %w", err)
	}

	if err := os.WriteFile(s.getFilePath(), data, 0600); err != nil {
		return fmt.Errorf("failed to write connections file: %w", err)
	}

	return nil
}

func (s *Storage) SaveSecret(id string, secret string) error {
	return keyring.Set(keyringService, "connection:"+id, secret)
}

func (s *Storage) GetSecret(id string) (string, error) {
	return keyring.Get(keyringService, "connection:"+id)
}

func (s *Storage) DeleteSecret(id string) error {
	err := keyring.Delete(keyringService, "connection:"+id)
	if err == keyring.ErrNotFound {
		return nil
	}
	return err
}

func (s *Storage) SaveTunnelSecret(id string, secret string) error {
	return keyring.Set(keyringService, "tunnel:"+id, secret)
}

func (s *Storage) GetTunnelSecret(id string) (string, error) {
	return keyring.Get(keyringService, "tunnel:"+id)
}

func (s *Storage) DeleteTunnelSecret(id string) error {
	err := keyring.Delete(keyringService, "tunnel:"+id)
	if err == keyring.ErrNotFound {
		return nil
	}
	return err
}
