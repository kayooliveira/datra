import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './select.module.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  className,
  disabled 
}) => {
  return (
    <div className={`${styles.selectContainer} ${className || ''}`}>
      <select
        className={styles.selectButton}
        value={value}
        onChange={(e) => {
            const val = e.target.value;
            // Best effort type conversion based on current value type
            if (typeof value === 'number') {
                onChange(Number(val));
            } else {
                onChange(val);
            }
        }}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className={styles.arrow} />
    </div>
  );
};
