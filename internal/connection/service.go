package connection

import (
	"context"
	"fmt"
)

// ConnectionService handles connection profiles, sessions, and metadata.
type ConnectionService struct {
	ctx            context.Context
	manager        *ConnectionManager
	sessionManager *SessionManager
}

// NewConnectionService creates a new instance of ConnectionService.
func NewConnectionService() *ConnectionService {
	return &ConnectionService{
		manager:        NewConnectionManager(),
		sessionManager: NewSessionManager(),
	}
}

// Startup is called when the app starts.
func (s *ConnectionService) Startup(ctx context.Context) {
	s.ctx = ctx
}

// --- Profile Methods ---

func (s *ConnectionService) GetProfiles() ([]Connection, error) {
	return s.manager.GetProfiles()
}

func (s *ConnectionService) SaveProfile(profile Connection, password string) (Connection, error) {
	return s.manager.SaveProfile(profile, password)
}

func (s *ConnectionService) DeleteProfile(id string) error {
	return s.manager.DeleteProfile(id)
}

func (s *ConnectionService) TestConnection(profile Connection, password string) (string, error) {
	return s.manager.TestConnection(profile, password)
}

// --- Session Methods ---

func (s *ConnectionService) Connect(profileID string) (string, error) {
	// 1. Get Profile
	profiles, err := s.manager.GetProfiles()
	if err != nil {
		return "", err
	}
	var profile *Connection
	for _, p := range profiles {
		if p.ID == profileID {
			profile = &p
			break
		}
	}
	if profile == nil {
		return "", fmt.Errorf("profile not found: %s", profileID)
	}

	// 2. Get Password
	password, err := s.manager.GetPassword(profileID)
	if err != nil {
		// Try empty password? Or fail?
		password = "" 
	}

	// 3. Connect
	return s.sessionManager.Connect(*profile, password)
}

func (s *ConnectionService) Disconnect(sessionID string) error {
	return s.sessionManager.Disconnect(sessionID)
}

func (s *ConnectionService) GetActiveSessions() ([]SessionSummary, error) {
	// Wails needs error return for most bindings usually, or not
	return s.sessionManager.GetActiveSessions(), nil
}

func (s *ConnectionService) ExecuteQuery(sessionID string, query string, limit int) (QueryResult, error) {
	return s.sessionManager.ExecuteQuery(sessionID, query, limit)
}

func (s *ConnectionService) CancelQuery(sessionID string) error {
	return s.sessionManager.CancelQuery(sessionID)
}

// --- Metadata Methods ---

func (s *ConnectionService) GetSchemas(sessionID string) ([]string, error) {
	session, err := s.sessionManager.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	profiles, err := s.manager.GetProfiles()
	if err != nil {
		return nil, err
	}
	var driver string
	for _, p := range profiles {
		if p.ID == session.ProfileID {
			driver = p.Driver
			break
		}
	}
	if driver == "" {
		return nil, fmt.Errorf("profile not found for session")
	}

	provider, err := GetMetadataProvider(driver)
	if err != nil {
		return nil, err
	}

	return provider.GetSchemas(session.DB)
}

func (s *ConnectionService) GetTables(sessionID string, schema string) ([]DatabaseTable, error) {
	session, err := s.sessionManager.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	profiles, err := s.manager.GetProfiles()
	if err != nil {
		return nil, err
	}
	var driver string
	for _, p := range profiles {
		if p.ID == session.ProfileID {
			driver = p.Driver
			break
		}
	}

	provider, err := GetMetadataProvider(driver)
	if err != nil {
		return nil, err
	}

	return provider.GetTables(session.DB, schema)
}

func (s *ConnectionService) GetColumns(sessionID string, schema string, table string) ([]TableColumn, error) {
	session, err := s.sessionManager.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	profiles, err := s.manager.GetProfiles()
	if err != nil {
		return nil, err
	}
	var driver string
	for _, p := range profiles {
		if p.ID == session.ProfileID {
			driver = p.Driver
			break
		}
	}

	provider, err := GetMetadataProvider(driver)
	if err != nil {
		return nil, err
	}

	return provider.GetColumns(session.DB, schema, table)
}

