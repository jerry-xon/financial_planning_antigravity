import React from 'react';
import { Outlet } from 'react-router-dom';

const BlankLayout = () => {
    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: 'var(--bg-main)' }}>
            <Outlet />
        </div>
    );
};

export default BlankLayout;
