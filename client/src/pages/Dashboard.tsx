import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Region {
  x: number;
  y: number;
  soil_type: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login'); 
          return;
        }

        const response = await fetch('http://localhost:3000/region/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 404) {
          navigate('/locationSelect');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch region');
        }

        const data = await response.json();
        setRegion(data.region); // data.region is an object
      } catch (error) {
        console.error('Error fetching region:', error);
      }
    };

    fetchRegion();
  }, [navigate]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard</h1>

      {/* Render region safely */}
      {region ? (
        <p>
          Region: X: {region.x}, Y: {region.y}, Soil: {region.soil_type}
        </p>
      ) : (
        <p>Loading region...</p>
      )}

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
