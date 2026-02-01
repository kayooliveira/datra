package connection

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/mattn/go-sqlite3"
	"github.com/zalando/go-keyring"
	"gopkg.in/yaml.v3"
)

const (
	serviceName     = "datra-app"
	connectionsFile = "connections.yaml"
)

type ConnectionManager struct {
	mu        sync.Mutex
	configDir string
}

func NewConnectionManager() *ConnectionManager {
	home, _ := os.UserHomeDir()
	configDir := filepath.Join(home, ".datra")
	return &ConnectionManager{
		configDir: configDir,
	}
}

func (m *ConnectionManager) getFilePath() string {
	return filepath.Join(m.configDir, connectionsFile)
}

func (m *ConnectionManager) GetProfiles() ([]Connection, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	path := m.getFilePath()
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return []Connection{}, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read connections file: %w", err)
	}

	var profiles []Connection
	if err := yaml.Unmarshal(data, &profiles); err != nil {
		return nil, fmt.Errorf("failed to unmarshal connections: %w", err)
	}

	return profiles, nil
}

func (m *ConnectionManager) SaveProfile(profile Connection, password string) (Connection, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	profiles, err := m.GetProfilesWithoutLock()
	if err != nil {
		return Connection{}, err
	}

	if profile.ID == "" {
		profile.ID = fmt.Sprintf("%d", time.Now().UnixNano()) // Simple ID generation for now
		profile.CreatedAt = time.Now().Format(time.RFC3339)
	}
	profile.UpdatedAt = time.Now().Format(time.RFC3339)

	found := false
	for i, p := range profiles {
		if p.ID == profile.ID {
			profiles[i] = profile
			found = true
			break
		}
	}
	if !found {
		profiles = append(profiles, profile)
	}

	if err := m.saveProfilesToFile(profiles); err != nil {
		return Connection{}, err
	}

	if password != "" {
		if err := keyring.Set(serviceName, profile.ID, password); err != nil {
			// Log error but don't fail profile save? Or fail?
			// For security, we should probably fail if we can't save the password securely.
			fmt.Printf("Warning: failed to save password to keyring: %v\n", err)
		}
	}

	return profile, nil
}

func (m *ConnectionManager) DeleteProfile(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	profiles, err := m.GetProfilesWithoutLock()
	if err != nil {
		return err
	}

	newProfiles := make([]Connection, 0, len(profiles))
	for _, p := range profiles {
		if p.ID != id {
			newProfiles = append(newProfiles, p)
		}
	}

	if err := m.saveProfilesToFile(newProfiles); err != nil {
		return err
	}

	_ = keyring.Delete(serviceName, id) // Ignore error if not found
	return nil
}

// GetProfilesWithoutLock is a helper to reuse loading logic inside locked methods
func (m *ConnectionManager) GetProfilesWithoutLock() ([]Connection, error) {
	path := m.getFilePath()
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return []Connection{}, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read connections file: %w", err)
	}

	var profiles []Connection
	if err := yaml.Unmarshal(data, &profiles); err != nil {
		return nil, fmt.Errorf("failed to unmarshal connections: %w", err)
	}
	return profiles, nil
}

func (m *ConnectionManager) saveProfilesToFile(profiles []Connection) error {
	if err := os.MkdirAll(m.configDir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	data, err := yaml.Marshal(profiles)
	if err != nil {
		return fmt.Errorf("failed to marshal connections: %w", err)
	}

	return os.WriteFile(m.getFilePath(), data, 0600)
}

func (m *ConnectionManager) TestConnection(profile Connection, password string) (string, error) {
	fmt.Printf("[DEBUG] Testing connection to %s (%s)...\n", profile.Name, profile.Driver)

	// If password is empty, try to fetch from keyring
	if password == "" && profile.ID != "" {
		storedPass, err := keyring.Get(serviceName, profile.ID)
		if err == nil {
			password = storedPass
		}
	}

	driverName, dsn, err := BuildDSN(profile, password)
	if err != nil {
		return "", err
	}

	fmt.Printf("[DEBUG] Opening driver %s...\n", driverName)
	db, err := sql.Open(driverName, dsn)
	if err != nil {
		return "", fmt.Errorf("failed to open connection: %w", err)
	}
	defer db.Close()

	// Adicionar timeout de 10 segundos para o ping
	fmt.Printf("[DEBUG] Pinging database with 10s timeout...\n")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		fmt.Printf("[DEBUG] Ping failed: %v\n", err)
		return "", fmt.Errorf("connection failed: %w", err)
	}

	fmt.Printf("[DEBUG] Connection successful!\n")
	return "Connection Successful", nil
}

func (m *ConnectionManager) GetPassword(id string) (string, error) {
	return keyring.Get(serviceName, id)
}
