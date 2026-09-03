import React from 'react';

const GoalProgressDonut = ({ pct = 100, size = 48, strokeWidth = 4, tone = 'success' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPct = Math.min(100, Math.max(0, pct));
    const offset = circumference - (clampedPct / 100) * circumference;

    const strokeColor = tone === 'success'
        ? '#059669'
        : tone === 'partial'
            ? '#d97706'
            : '#dc2626';

    const trackColor = tone === 'success'
        ? 'rgba(5, 150, 105, 0.15)'
        : tone === 'partial'
            ? 'rgba(217, 119, 6, 0.15)'
            : 'rgba(220, 38, 38, 0.15)';

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />
                {/* Foreground Filled Arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <span
                style={{
                    position: 'absolute',
                    fontSize: size > 40 ? '0.72rem' : '0.65rem',
                    fontWeight: 700,
                    color: strokeColor,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {clampedPct}%
            </span>
        </div>
    );
};

export default GoalProgressDonut;
