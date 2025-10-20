import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Dashboard</h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h2>Overview</h2>
                    <p>Some quick stats or summary here.</p>
                </div>
                <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h2>Recent Activity</h2>
                    <ul>
                        <li>Activity 1</li>
                        <li>Activity 2</li>
                        <li>Activity 3</li>
                    </ul>
                </div>
            </div>
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Details</h2>
                <p>More detailed information can go here.</p>
            </div>
        </div>
    );
};

export default Dashboard;