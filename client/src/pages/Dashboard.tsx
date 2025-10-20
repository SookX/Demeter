import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MapPin } from 'lucide-react';

import WeatherCard from '../components/WeatherCard';

interface WeatherData {
  temperature: number;
  description: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: { date: string; icon: string; tempMax: number; tempMin: number }[];
}

interface DashboardProps {
  location?: { name: string; latitude: number; longitude: number };
}

interface UserLocation {
  name: string;
  latitude: number;
  longitude: number;
  soil_type: string;
}

interface Region {
  x: number;
  y: number;
  soil_type: string;
}

export default function Dashboard({ location }: DashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plants'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const dummyProfile = { full_name: 'JohnDoe', email: 'jane@example.com' };
  const dummyLocation: UserLocation = {
    name: location?.name || 'Springfield',
    latitude: 0,
    longitude: 0,
    soil_type: 'Loamy',
  };

  useEffect(() => {
    const checkLoginAndFetchRegion = async () => {
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

        if (!data.region || Object.keys(data.region).length === 0) {
          navigate('/locationSelect');
          return;
        }

        setRegion(data.region);

        const dummyWeather: WeatherData = {
          temperature: 24,
          description: 'Sunny',
          feelsLike: 25,
          humidity: 55,
          windSpeed: 12,
          icon: '🌤️',
          forecast: [
            { date: new Date().toISOString(), icon: '🌤️', tempMax: 26, tempMin: 18 },
            { date: new Date(Date.now() + 86400000).toISOString(), icon: '⛅', tempMax: 24, tempMin: 17 },
            { date: new Date(Date.now() + 2 * 86400000).toISOString(), icon: '🌦️', tempMax: 22, tempMin: 16 },
            { date: new Date(Date.now() + 3 * 86400000).toISOString(), icon: '🌤️', tempMax: 25, tempMin: 18 },
            { date: new Date(Date.now() + 4 * 86400000).toISOString(), icon: '☀️', tempMax: 27, tempMin: 19 },
          ],
        };

        setWeather(dummyWeather);
      } catch (error) {
        console.error('Error fetching region:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginAndFetchRegion();
  }, [navigate]);

  const handleSignOut = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-green-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div>
              <h1 className="text-2xl font-bold text-green-800">Demeter</h1>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <MapPin size={14} />
                <span>{dummyLocation.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-green-800">{dummyProfile.full_name}</p>
              <p className="text-xs text-green-600">{dummyProfile.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-4 font-medium transition-colors relative ${
                activeTab === 'dashboard' ? 'text-green-700' : 'text-green-600 hover:text-green-700'
              }`}
            >
              Dashboard
              {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>}
            </button>
            <button
              onClick={() => setActiveTab('plants')}
              className={`py-3 px-4 font-medium transition-colors relative ${
                activeTab === 'plants' ? 'text-green-700' : 'text-green-600 hover:text-green-700'
              }`}
            >
              My Plants
              {activeTab === 'plants' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WeatherCard weather={weather} loading={false} />

              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-bold text-green-700">Events</h2>
                <ul className="list-disc pl-5">
                  <li>Water your plants tomorrow</li>
                  <li>Check soil moisture today</li>
                  <li>Plant companion herbs next to tomatoes</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-green-700">Recommended Plants</h2>
              <ul className="list-disc pl-5">
                <li>Tomatoes</li>
                <li>Basil</li>
                <li>Peppers</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-bold text-green-700">My Plants</h2>
            <ul className="list-disc pl-5">
              <li>Tomatoes - Growing</li>
              <li>Basil - Ready to harvest</li>
              <li>Peppers - Seedlings</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
