package ssh

import (
	"fmt"
	"io"
	"net"
	"os"

	"golang.org/x/crypto/ssh"
)

type TunnelConfig struct {
	SSHHost        string
	SSHPort        int
	SSHUser        string
	SSHPassword    string
	SSHPrivateKey  []byte
	SSHPrivateKeyPassphrase string
	RemoteHost     string
	RemotePort     int
}

type Tunnel struct {
	config   TunnelConfig
	client   *ssh.Client
	listener net.Listener
}

func NewTunnel(config TunnelConfig) *Tunnel {
	return &Tunnel{config: config}
}

func (t *Tunnel) Start() (int, error) {
	var auth []ssh.AuthMethod

	if t.config.SSHPrivateKey != nil {
		var signer ssh.Signer
		var err error
		if t.config.SSHPrivateKeyPassphrase != "" {
			signer, err = ssh.ParsePrivateKeyWithPassphrase(t.config.SSHPrivateKey, []byte(t.config.SSHPrivateKeyPassphrase))
		} else {
			signer, err = ssh.ParsePrivateKey(t.config.SSHPrivateKey)
		}
		if err != nil {
			return 0, fmt.Errorf("failed to parse private key: %w", err)
		}
		auth = append(auth, ssh.PublicKeys(signer))
	} else if t.config.SSHPassword != "" {
		auth = append(auth, ssh.Password(t.config.SSHPassword))
	}

	clientConfig := &ssh.ClientConfig{
		User: t.config.SSHUser,
		Auth: auth,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // TODO: Support host key verification
	}

	sshAddr := fmt.Sprintf("%s:%d", t.config.SSHHost, t.config.SSHPort)
	client, err := ssh.Dial("tcp", sshAddr, clientConfig)
	if err != nil {
		return 0, fmt.Errorf("failed to dial ssh: %w", err)
	}
	t.client = client

	localListener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		client.Close()
		return 0, fmt.Errorf("failed to listen on local port: %w", err)
	}
	t.listener = localListener

	localPort := localListener.Addr().(*net.TCPAddr).Port

	go func() {
		for {
			localConn, err := localListener.Accept()
			if err != nil {
				return
			}
			go t.forward(localConn)
		}
	}()

	return localPort, nil
}

func (t *Tunnel) forward(localConn net.Conn) {
	defer localConn.Close()

	remoteAddr := fmt.Sprintf("%s:%d", t.config.RemoteHost, t.config.RemotePort)
	remoteConn, err := t.client.Dial("tcp", remoteAddr)
	if err != nil {
		return
	}
	defer remoteConn.Close()

	copyConn := func(writer, reader net.Conn) {
		_, _ = io.Copy(writer, reader)
	}

	go copyConn(localConn, remoteConn)
	copyConn(remoteConn, localConn)
}

func (t *Tunnel) Stop() {
	if t.listener != nil {
		t.listener.Close()
	}
	if t.client != nil {
		t.client.Close()
	}
}

func ReadPrivateKey(path string) ([]byte, error) {
	return os.ReadFile(path)
}
