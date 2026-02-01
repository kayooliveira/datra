package connection

import (
	"database/sql"
	"os"
	"testing"
	"path/filepath"
	
	_ "github.com/mattn/go-sqlite3"
)

func TestSessionManager_ConnectAndDisconnect(t *testing.T) {
	// Use SQLite for testing connection
	tempDir, err := os.MkdirTemp("", "datra-session-test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)
	
	dbPath := filepath.Join(tempDir, "test.db")
	
	// Create a dummy sqlite db
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		t.Fatal(err)
	}
	db.Close()
	
	manager := NewSessionManager()
	
	profile := Connection{
		ID: "test-profile",
		Name: "Test SQLite",
		Driver: "sqlite",
		Database: dbPath,
	}
	
	// Test Connect
	sessionID, err := manager.Connect(profile, "")
	if err != nil {
		t.Fatalf("Connect failed: %v", err)
	}
	if sessionID == "" {
		t.Error("Expected valid sessionID")
	}
	
	// Verify Active Sessions
	sessions := manager.GetActiveSessions()
	if len(sessions) != 1 {
		t.Errorf("Expected 1 active session, got %d", len(sessions))
	}
	if sessions[0].ID != sessionID {
		t.Errorf("Expected session ID %s, got %s", sessionID, sessions[0].ID)
	}
	
	// Test Disconnect
	err = manager.Disconnect(sessionID)
	if err != nil {
		t.Fatalf("Disconnect failed: %v", err)
	}
	
	sessions = manager.GetActiveSessions()
	if len(sessions) != 0 {
		t.Errorf("Expected 0 active sessions after disconnect, got %d", len(sessions))
	}
}
