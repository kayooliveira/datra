package connection

import (
	"os"
	"testing"

	"github.com/zalando/go-keyring"
)

func TestConnectionManager_SaveAndGetProfile(t *testing.T) {
	// Setup temporary directory
	tempDir, err := os.MkdirTemp("", "datra-test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	// Mock keyring if possible, or just skip keyring part in test env if it fails
	keyring.MockInit()

	manager := &ConnectionManager{
		configDir: tempDir,
	}

	profile := Connection{
		Name:     "Test Profile",
		Driver:   "postgres",
		Host:     "localhost",
		Port:     5432,
		Database: "testdb",
		Username: "user",
		SSLMode:  "disable",
	}

	// Test Save
	savedProfile, err := manager.SaveProfile(profile, "secret")
	if err != nil {
		t.Fatalf("SaveProfile failed: %v", err)
	}
	if savedProfile.ID == "" {
		t.Error("Expected ID to be generated")
	}

	// Test Get
	profiles, err := manager.GetProfiles()
	if err != nil {
		t.Fatalf("GetProfiles failed: %v", err)
	}
	if len(profiles) != 1 {
		t.Errorf("Expected 1 profile, got %d", len(profiles))
	}
	if profiles[0].Name != "Test Profile" {
		t.Errorf("Expected Name 'Test Profile', got '%s'", profiles[0].Name)
	}

	// Test Password Retrieval
	pass, err := keyring.Get(serviceName, savedProfile.ID)
	if err != nil {
		t.Fatalf("Failed to retrieve password from keyring: %v", err)
	}
	if pass != "secret" {
		t.Errorf("Expected password 'secret', got '%s'", pass)
	}

	// Test Delete
	err = manager.DeleteProfile(savedProfile.ID)
	if err != nil {
		t.Fatalf("DeleteProfile failed: %v", err)
	}

	profiles, err = manager.GetProfiles()
	if len(profiles) != 0 {
		t.Errorf("Expected 0 profiles after delete, got %d", len(profiles))
	}
}
