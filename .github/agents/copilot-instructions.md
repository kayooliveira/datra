# datra Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-26

## Active Technologies

- Go 1.23 (backend) + Node/React (frontend) + Wails v2 (Go), React 18, Vite 3 (001-connection-empty-state)

## Project Structure

```text
app.go
main.go

internal/
	...

frontend/
	src/
	wailsjs/

build/
```

## Commands

- Go tests: `go test ./...`
- Frontend dev: `cd frontend && npm install && npm run dev`
- Wails dev: `wails dev`
- Wails build: `wails build`

## Code Style

Go 1.23 (backend) + Node/React (frontend): Follow standard conventions

## Recent Changes

- 001-connection-empty-state: Added Go 1.23 (backend) + Node/React (frontend) + Wails v2 (Go), React 18, Vite 3

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
