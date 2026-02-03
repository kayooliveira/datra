package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"datra/internal/connection"

	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gopkg.in/yaml.v3"
)

type UserPreferences struct {
	Language string `yaml:"language" json:"language"`
	Theme    string `yaml:"theme" json:"theme"`
}

type App struct {
	ctx               context.Context
	ConnectionService *connection.ConnectionService
}

func NewApp() *App {
	return &App{
		ConnectionService: connection.NewConnectionService(),
	}
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
	editLabel := T(language, "menu.edit")
	undoLabel := T(language, "menu.undo")
	redoLabel := T(language, "menu.redo")
	cutLabel := T(language, "menu.cut")
	copyLabel := T(language, "menu.copy")
	pasteLabel := T(language, "menu.paste")
	selectAllLabel := T(language, "menu.select_all")

	AppMenu := menu.NewMenu()
	FileMenu := AppMenu.AddSubmenu(fileLabel)
	FileMenu.AddText(settingsLabel, keys.CmdOrCtrl(","), func(_ *menu.CallbackData) {
		runtime.EventsEmit(a.ctx, "open-settings")
	})
	FileMenu.AddSeparator()
	FileMenu.AddText(quitLabel, keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		runtime.Quit(a.ctx)
	})

	EditMenu := AppMenu.AddSubmenu(editLabel)
	EditMenu.AddText(undoLabel, keys.CmdOrCtrl("z"), func(_ *menu.CallbackData) {
		runtime.WindowExecJS(a.ctx, "document.execCommand('undo')")
	})
	EditMenu.AddText(redoLabel, keys.CmdOrCtrl("shift+z"), func(_ *menu.CallbackData) {
		runtime.WindowExecJS(a.ctx, "document.execCommand('redo')")
	})
	EditMenu.AddSeparator()
	EditMenu.AddText(cutLabel, keys.CmdOrCtrl("x"), func(_ *menu.CallbackData) {
		runtime.WindowExecJS(a.ctx, "document.execCommand('cut')")
	})
	EditMenu.AddText(copyLabel, keys.CmdOrCtrl("c"), func(_ *menu.CallbackData) {
		runtime.WindowExecJS(a.ctx, "document.execCommand('copy')")
	})
	EditMenu.AddText(pasteLabel, keys.CmdOrCtrl("v"), func(_ *menu.CallbackData) {
		runtime.WindowExecJS(a.ctx, "document.execCommand('paste')")
	})
	EditMenu.AddSeparator()
	EditMenu.AddText(selectAllLabel, keys.CmdOrCtrl("a"), func(_ *menu.CallbackData) {
		runtime.WindowExecJS(a.ctx, "document.execCommand('selectAll')")
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

// --- Connection Wrappers for Legacy UI Support ---

func (a *App) GetConnections() ([]connection.Connection, error) {
	return a.ConnectionService.GetProfiles()
}

func (a *App) CreateConnection(conn connection.Connection, password string, tunnelPassword string) (connection.Connection, error) {
	// Tunnel password ignored for now as we haven't re-implemented tunnel yet
	return a.ConnectionService.SaveProfile(conn, password)
}

func (a *App) UpdateConnection(conn connection.Connection, password string, tunnelPassword string) (connection.Connection, error) {
	return a.ConnectionService.SaveProfile(conn, password)
}

func (a *App) DeleteConnection(id string) error {
	return a.ConnectionService.DeleteProfile(id)
}

func (a *App) TestConnection(conn connection.Connection, password string, tunnelPassword string) (string, error) {
	return a.ConnectionService.TestConnection(conn, password)
}

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
