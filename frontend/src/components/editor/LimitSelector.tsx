import React from 'react';
import styles from './limit-selector.module.css';
import { useTranslation } from 'react-i18next';
import { Select, SelectOption } from '../ui/Select';

interface LimitSelectorProps {
  value: number;
  onChange: (limit: number) => void;
}

export const LimitSelector: React.FC<LimitSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const options: SelectOption[] = [
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
    { value: 0, label: t("app.editor.unlimited", "Unlimited") },
  ];

  return (
    <div className={styles.container}>
      <label className={styles.label}>{t("app.editor.limit", "Limit")}:</label>
      <Select 
        value={value}
        onChange={(val) => onChange(Number(val))}
        options={options}
      />
    </div>
  );
};
