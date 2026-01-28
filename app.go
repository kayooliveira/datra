package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// ConnectionProfile represents a saved database connection configuration
type ConnectionProfile struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	DatabaseType string `json:"database_type"`
	Host         string `json:"host"`
	Port         int    `json:"port"`
	Username     string `json:"username"`
	DatabaseName string `json:"database_name"`
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetStoragePath returns the path to the connections file
func (a *App) GetStoragePath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	configDir := filepath.Join(home, ".datra")
	if _, err := os.Stat(configDir); os.IsNotExist(err) {
		err := os.MkdirAll(configDir, 0755)
		if err != nil {
			return "", err
		}
	}

	return filepath.Join(configDir, "connections.yaml"), nil
}

// GetConnections returns the list of saved connection profiles
func (a *App) GetConnections() []ConnectionProfile {
	path, err := a.GetStoragePath()
	if err != nil {
		fmt.Printf("Error getting storage path: %v\n", err)
		return []ConnectionProfile{}
	}

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return []ConnectionProfile{}
	}

	data, err := os.ReadFile(path)
	if err != nil {
		fmt.Printf("Error reading connections file: %v\n", err)
		return []ConnectionProfile{}
	}

	var connections []ConnectionProfile
	err = yaml.Unmarshal(data, &connections)
	if err != nil {
		fmt.Printf("Error unmarshaling connections: %v\n", err)
		return []ConnectionProfile{}
	}

	return connections
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
