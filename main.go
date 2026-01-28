package main

import (
	"embed"
	"strings"

	go_runtime "runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	settings := app.GetSettings()
	lang := settings.Language

	fileLabel := T(lang, "menu.file")
	settingsLabel := T(lang, "menu.settings")
	quitLabel := T(lang, "menu.quit")

	// Create a custom menu
	AppMenu := menu.NewMenu()
	FileMenu := AppMenu.AddSubmenu(fileLabel)
	FileMenu.AddText(settingsLabel, keys.CmdOrCtrl(","), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "open-settings")
	})
	FileMenu.AddSeparator()
	FileMenu.AddText(quitLabel, keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		runtime.Quit(app.ctx)
	})

	// Only use native menu on macOS (Darwin)
	// On Windows/Linux, we will use a custom React menu bar
	var menuToUse *menu.Menu
	if go_runtime.GOOS == "darwin" {
		menuToUse = AppMenu
	}

	// Windows specific options
	var winTheme windows.Theme
	if strings.ToLower(strings.TrimSpace(settings.Theme)) == "dark" {
		winTheme = windows.Dark
	} else {
		winTheme = windows.Light
	}

	err := wails.Run(&options.App{
		Title:  "datra",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Menu:             menuToUse,
		Bind: []interface{}{
			app,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			Theme:                winTheme,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
