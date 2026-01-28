package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gopkg.in/yaml.v3"
)

type ConnectionProfile struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	DatabaseType string `json:"database_type"`
	Host         string `json:"host"`
	Port         int    `json:"port"`
	Username     string `json:"username"`
	DatabaseName string `json:"database_name"`
}

type UserPreferences struct {
	Language string `yaml:"language" json:"language"`
	Theme    string `yaml:"theme" json:"theme"`
}

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetPlatform() string {
	env := runtime.Environment(a.ctx)
	return env.Platform
}

func (a *App) UpdateMenu(language string) {
	fileLabel := T(language, "menu.file")
	settingsLabel := T(language, "menu.settings")
	quitLabel := T(language, "menu.quit")

	AppMenu := menu.NewMenu()
	FileMenu := AppMenu.AddSubmenu(fileLabel)
	FileMenu.AddText(settingsLabel, keys.CmdOrCtrl(","), func(_ *menu.CallbackData) {
		runtime.EventsEmit(a.ctx, "open-settings")
	})
	FileMenu.AddSeparator()
	FileMenu.AddText(quitLabel, keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		runtime.Quit(a.ctx)
	})

	runtime.MenuSetApplicationMenu(a.ctx, AppMenu)
}

func (a *App) GetSettingsPath() (string, error) {
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

	return filepath.Join(configDir, "settings.yaml"), nil
}

func (a *App) GetSettings() UserPreferences {
	path, err := a.GetSettingsPath()
	if err != nil {
		fmt.Printf("Error getting settings path: %v\n", err)
		return UserPreferences{Language: "en", Theme: "light"}
	}

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return UserPreferences{Language: "en", Theme: "light"}
	}

	data, err := os.ReadFile(path)
	if err != nil {
		fmt.Printf("Error reading settings file: %v\n", err)
		return UserPreferences{Language: "en", Theme: "light"}
	}

	var settings UserPreferences
	err = yaml.Unmarshal(data, &settings)
	if err != nil {
		fmt.Printf("Error unmarshaling settings: %v\n", err)
		return UserPreferences{Language: "en", Theme: "light"}
	}

	return settings
}

func (a *App) SaveSettings(settings UserPreferences) error {
	path, err := a.GetSettingsPath()
	if err != nil {
		return err
	}

	data, err := yaml.Marshal(settings)
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}

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

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
