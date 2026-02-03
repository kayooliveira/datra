import { useState } from "react";
import { connection } from "../../../wailsjs/go/models";
import { useTranslation } from "react-i18next";
import { Shield, Database, Loader2, CheckCircle, XCircle } from "lucide-react";
import styles from "./connection-form.module.css";

interface ConnectionFormProps {
  initialData?: connection.Connection;
  onSubmit: (conn: connection.Connection, password: string, tunnelPassword: string) => Promise<void>;
  onTest: (conn: connection.Connection, password: string, tunnelPassword: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function ConnectionForm({ initialData, onSubmit, onTest, isSubmitting }: ConnectionFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<connection.Connection>(initialData || new connection.Connection({
    id: "",
    name: "",
    driver: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    database: "",
    ssl_mode: "disable",
    tunnel: new connection.Tunnel({
      enabled: false,
      host: "",
      port: 22,
      username: "",
      auth_method: "password",
    }),
    created_at: "",
    updated_at: "",
  }));

  const [password, setPassword] = useState("");
  const [tunnelPassword, setTunnelPassword] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Create a mutable copy to avoid directly modifying formData
    const updatedFormData = { ...formData }; 

    if (name.startsWith("tunnel.")) {
      const field = name.split(".")[1];
      // Ensure tunnel is a mutable object if it's a class instance
      updatedFormData.tunnel = { ...updatedFormData.tunnel, [field]: field === "port" ? parseInt(value) : value };
    } else {
      (updatedFormData as any)[name] = name === "port" ? parseInt(value) : value;
    }
    // Set state with a new Connection instance to ensure convertValues is present
    setFormData(new connection.Connection(updatedFormData));
  };

  const handleTunnelToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Create a mutable copy to avoid directly modifying formData
    const updatedFormData = { ...formData };
    updatedFormData.tunnel = { ...updatedFormData.tunnel, enabled: e.target.checked };
    // Set state with a new Connection instance
    setFormData(new connection.Connection(updatedFormData));
  };

  const handleTest = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTesting(true);
    try {
      await onTest(formData, password, tunnelPassword);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, password, tunnelPassword);
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      
      {/* General Information Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
            <Database size={14} className="text-muted" />
            <h3 className={styles.sectionTitle}>{t("app.connections.tabs.general", "Database Details")}</h3>
        </div>
        
        <div className={styles.grid}>
             <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>{t("app.connections.form.name", "Connection Name")}</label>
                <input className={styles.input} name="name" value={formData.name} onChange={handleChange} required placeholder="My Production DB" autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>{t("app.connections.form.driver", "Driver")}</label>
                <select className={styles.select} name="driver" value={formData.driver} onChange={handleChange}>
                    <option value="mysql">MySQL</option>
                    <option value="postgres">PostgreSQL</option>
                    <option value="sqlite">SQLite</option>
                    <option value="sqlserver">SQL Server</option>
                </select>
            </div>
             <div className={styles.group}>
                <label className={styles.label}>{t("app.connections.form.database", "Database Name")}</label>
                <input className={styles.input} name="database" value={formData.database} onChange={handleChange} placeholder="optional" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`} style={{ gridTemplateColumns: "2fr 1fr", display: "grid", gap: "16px" }}>
                <div className={styles.group}>
                    <label className={styles.label}>{t("app.connections.form.host", "Host")}</label>
                    <input className={styles.input} name="host" value={formData.host} onChange={handleChange} required placeholder="127.0.0.1" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>{t("app.connections.form.port", "Port")}</label>
                    <input className={styles.input} type="number" name="port" value={formData.port} onChange={handleChange} required />
                </div>
            </div>

             <div className={styles.group}>
                <label className={styles.label}>{t("app.connections.form.username", "Username")}</label>
                <input className={styles.input} name="username" value={formData.username} onChange={handleChange} required autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>{t("app.connections.form.password", "Password")}</label>
                <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
            </div>
        </div>
      </section>

      {/* Security Section (SSH & SSL) */}
      <section className={styles.section}>
         <div className={styles.sectionHeader}>
            <Shield size={14} className="text-muted" />
            <h3 className={styles.sectionTitle}>{t("app.connections.tabs.security", "Security & Tunneling")}</h3>
        </div>

        <div className={styles.grid}>
             <div className={`${styles.group} ${styles.fullWidth}`}>
                  <label className={styles.label}>{t("app.connections.form.ssl_mode", "SSL Mode")}</label>
                  <select className={styles.select} name="ssl_mode" value={formData.ssl_mode} onChange={handleChange}>
                    <option value="disable">Disable</option>
                    <option value="require">Require</option>
                    <option value="verify-ca">Verify CA</option>
                    <option value="verify-full">Verify Full</option>
                  </select>
            </div>
            
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <div className={styles.checkboxGroup}>
                    <input className={styles.checkbox} type="checkbox" id="ssh-enabled" checked={formData.tunnel.enabled} onChange={handleTunnelToggle} />
                    <label className={styles.checkboxLabel} htmlFor="ssh-enabled">{t("app.connections.form.ssh_enabled", "Use SSH Tunnel")}</label>
                </div>
            </div>

            {formData.tunnel.enabled && (
                <div className={`${styles.fullWidth} ${styles.sshDetails}`}>
                    <div className={styles.grid}>
                        <div className={styles.group} style={{ gridColumn: "span 2" }}>
                             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
                                <div className={styles.group}>
                                    <label className={styles.label}>{t("app.connections.form.ssh_host", "SSH Host")}</label>
                                    <input className={styles.input} name="tunnel.host" value={formData.tunnel.host} onChange={handleChange} required autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
                                </div>
                                <div className={styles.group}>
                                    <label className={styles.label}>{t("app.connections.form.ssh_port", "SSH Port")}</label>
                                    <input className={styles.input} type="number" name="tunnel.port" value={formData.tunnel.port} onChange={handleChange} required />
                                </div>
                             </div>
                        </div>

                         <div className={styles.group}>
                            <label className={styles.label}>{t("app.connections.form.ssh_user", "SSH User")}</label>
                            <input className={styles.input} name="tunnel.username" value={formData.tunnel.username} onChange={handleChange} required autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
                        </div>
                        <div className={styles.group}>
                             <label className={styles.label}>{t("app.connections.form.ssh_auth", "Auth Method")}</label>
                             <select className={styles.select} name="tunnel.auth_method" value={formData.tunnel.auth_method as any} onChange={handleChange}>
                                <option value="password">Password</option>
                                <option value="private_key">Private Key</option>
                             </select>
                        </div>
                        <div className={`${styles.group} ${styles.fullWidth}`}>
                            <label className={styles.label}>{t("app.connections.form.ssh_password", "SSH Password / Key Passphrase")}</label>
                            <input className={styles.input} type="password" value={tunnelPassword} onChange={(e) => setTunnelPassword(e.target.value)} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </section>

      <div className={styles.actions}>
        <button type="button" className={styles.btnSecondary} onClick={handleTest} disabled={isTesting || isSubmitting}>
          {isTesting ? <Loader2 size={14} className={styles.rotating} /> : null}
          {t("app.connections.form.test", "Test Connection")}
        </button>
        <button type="submit" className={styles.btnPrimary} disabled={isTesting || isSubmitting}>
          {isSubmitting ? <Loader2 size={14} className={styles.rotating} /> : null}
          {t("app.connections.form.save", "Save Connection")}
        </button>
      </div>
    </form>
  );
}
