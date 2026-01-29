package connection

import (
	"os"
	"testing"
)

func TestStorage_SaveLoadConnections(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "datra-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	storage := NewStorage(tempDir)

	connections := []Connection{
		{
			ID:     "test-1",
			Name:   "Test MySQL",
			Driver: "mysql",
			Host:   "localhost",
			Port:   3306,
		},
	}

	if err := storage.SaveConnections(connections); err != nil {
		t.Fatalf("failed to save connections: %v", err)
	}

	loaded, err := storage.LoadConnections()
	if err != nil {
		t.Fatalf("failed to load connections: %v", err)
	}

	if len(loaded) != 1 {
		t.Errorf("expected 1 connection, got %d", len(loaded))
	}

	if loaded[0].Name != "Test MySQL" {
		t.Errorf("expected 'Test MySQL', got '%s'", loaded[0].Name)
	}
}

func TestStorage_Secrets(t *testing.T) {
	storage := NewStorage("/tmp") // Not using file storage here

	id := "test-secret-id"
	secret := "test-password"

	// Keyring might fail in some CI environments without a GUI/Session bus
	err := storage.SaveSecret(id, secret)
	if err != nil {
		t.Logf("Skipping Keyring test: %v", err)
		return
	}

	defer storage.DeleteSecret(id)

	got, err := storage.GetSecret(id)
	if err != nil {
		t.Fatalf("failed to get secret: %v", err)
	}

	if got != secret {
		t.Errorf("expected '%s', got '%s'", secret, got)
	}
}
