import React, { useState, useEffect } from 'react';

const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    const numericValue = value.toString().replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('en-IN').format(parseInt(numericValue, 10));
};

const parseCurrency = (formattedValue) => {
    if (!formattedValue) return '';
    return formattedValue.replace(/,/g, '');
};

const CurrencyInput = ({ value, onChange, name, placeholder, className, required, id, readOnly, style, ...props }) => {
    const [displayValue, setDisplayValue] = useState(formatCurrency(value));

    // Update display value if external value changes
    useEffect(() => {
        setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleChange = (e) => {
        let inputVal = e.target.value;
        
        // Allow user to clear input
        if (inputVal === '') {
            setDisplayValue('');
            if (onChange) {
                // Simulate an event object to pass the raw string/number upstream
                onChange({ target: { name, value: '' } });
            }
            return;
        }

        // Format for display
        const formatted = formatCurrency(inputVal);
        setDisplayValue(formatted);

        // Send raw numeric string upstream
        if (onChange) {
            const rawValue = parseCurrency(formatted);
            onChange({ target: { name, value: rawValue } });
        }
    };

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <span style={{ 
                position: 'absolute', 
                left: '1rem', 
                color: 'var(--text-muted)',
                fontWeight: 600 
            }}>₹</span>
            <input
                id={id}
                type="text"
                name={name}
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={className}
                required={required}
                readOnly={readOnly}
                style={{ paddingLeft: '2.2rem', width: '100%', ...style }}
                {...props}
            />
        </div>
    );
};

export default CurrencyInput;
