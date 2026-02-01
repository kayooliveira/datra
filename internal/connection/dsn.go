package connection

import (
	"fmt"
	"net/url"
)

// BuildDSN constructs the driver name and DSN string for a given connection profile.
func BuildDSN(profile Connection, password string) (string, string, error) {
	var driverName string
	var dsn string

	switch profile.Driver {
	case "mysql":
		driverName = "mysql"
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%d)/%s", profile.Username, password, profile.Host, profile.Port, profile.Database)
	case "postgres":
		driverName = "pgx"
		u := &url.URL{
			Scheme: "postgres",
			User:   url.UserPassword(profile.Username, password),
			Host:   fmt.Sprintf("%s:%d", profile.Host, profile.Port),
		}
		if profile.Database != "" {
			u.Path = "/" + profile.Database
		}
		q := u.Query()
		if profile.SSLMode == "" {
			q.Set("sslmode", "prefer")
		} else {
			q.Set("sslmode", profile.SSLMode)
		}
		u.RawQuery = q.Encode()
		dsn = u.String()
	case "sqlite":
		driverName = "sqlite3"
		dsn = profile.Database
	case "sqlserver":
		driverName = "sqlserver"
		u := &url.URL{
			Scheme: "sqlserver",
			User:   url.UserPassword(profile.Username, password),
			Host:   fmt.Sprintf("%s:%d", profile.Host, profile.Port),
		}
		q := u.Query()
		q.Set("database", profile.Database)
		u.RawQuery = q.Encode()
		dsn = u.String()
	default:
		return "", "", fmt.Errorf("driver '%s' is not supported yet by Datra", profile.Driver)
	}

	return driverName, dsn, nil
}
