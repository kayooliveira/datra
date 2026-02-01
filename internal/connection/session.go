package connection

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
)

type SessionManager struct {
	mu       sync.RWMutex
	sessions map[string]*Session // sessionID -> Session
}

func NewSessionManager() *SessionManager {
	return &SessionManager{
		sessions: make(map[string]*Session),
	}
}

func (s *SessionManager) Connect(profile Connection, password string) (string, error) {
	// Re-use TestConnection logic or Driver opening logic
	driverName, dsn, err := BuildDSN(profile, password)
	if err != nil {
		return "", err
	}

	db, err := sql.Open(driverName, dsn)
	if err != nil {
		return "", fmt.Errorf("failed to open connection: %w", err)
	}

	// Adicionar timeout de 10 segundos para o ping inicial
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return "", fmt.Errorf("connection failed: %w", err)
	}

	// Generate Session ID
	sessionID := uuid.New().String()

	session := &Session{
		ID:          sessionID,
		ProfileID:   profile.ID,
		ProfileName: profile.Name,
		Status:      "connected",
		ConnectedAt: time.Now().Format(time.RFC3339),
		DB:          db,
	}

	s.mu.Lock()
	s.sessions[sessionID] = session
	s.mu.Unlock()

	return sessionID, nil
}

func (s *SessionManager) Disconnect(sessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return nil // Already disconnected
	}

	if session.DB != nil {
		session.DB.Close()
	}

	delete(s.sessions, sessionID)
	return nil
}

func (s *SessionManager) GetActiveSessions() []SessionSummary {
	s.mu.RLock()
	defer s.mu.RUnlock()

	summaries := make([]SessionSummary, 0, len(s.sessions))
	for _, sess := range s.sessions {
		summaries = append(summaries, SessionSummary{
			ID:          sess.ID,
			ProfileID:   sess.ProfileID,
			ProfileName: sess.ProfileName,
			Status:      sess.Status,
			ConnectedAt: sess.ConnectedAt,
		})
	}
	return summaries
}

func (s *SessionManager) GetSession(sessionID string) (*Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return nil, fmt.Errorf("session not found: %s", sessionID)
	}
	return session, nil
}

func (s *SessionManager) ExecuteQuery(sessionID string, query string) (QueryResult, error) {
	s.mu.RLock()
	session, ok := s.sessions[sessionID]
	s.mu.RUnlock()

	if !ok {
		return QueryResult{Error: "Session not found"}, fmt.Errorf("session not found")
	}

	start := time.Now()
	rows, err := session.DB.Query(query)
	if err != nil {
		return QueryResult{Error: err.Error(), TimeMs: time.Since(start).Milliseconds()}, nil
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return QueryResult{Error: err.Error(), TimeMs: time.Since(start).Milliseconds()}, nil
	}

	var resultRows [][]interface{}
	// Limit rows for safety (e.g., 1000) - can be parameter later
	limit := 1000
	count := 0

	for rows.Next() {
		if count >= limit {
			break
		}
		
		// Create a slice of interface{} to hold values
		values := make([]interface{}, len(columns))
		scanArgs := make([]interface{}, len(columns))
		for i := range values {
			scanArgs[i] = &values[i]
		}

		if err := rows.Scan(scanArgs...); err != nil {
			return QueryResult{Error: err.Error(), TimeMs: time.Since(start).Milliseconds()}, nil
		}

		// Convert bytes to string for display if needed
		finalValues := make([]interface{}, len(columns))
		for i, v := range values {
			if b, ok := v.([]byte); ok {
				finalValues[i] = string(b)
			} else {
				finalValues[i] = v
			}
		}

		resultRows = append(resultRows, finalValues)
		count++
	}

	return QueryResult{
		Columns: columns,
		Rows:    resultRows,
		TimeMs:  time.Since(start).Milliseconds(),
	}, nil
}
