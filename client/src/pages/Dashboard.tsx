import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, Plus } from "lucide-react";
import WeatherCard from "../components/WeatherCard";

interface WeatherData {
  temperature: number;
  description: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: { date: string; icon: string; tempMax: number; tempMin: number }[];
}

interface Plant {
  name: string;
  area: number;
  waterPerArea: number;
  plantedAt: string;
  lastWateredAt: string | null;
  nextWateringAt: string | null;
}

interface Region {
  lat: number;
  lon: number;
  soil_type: string;
  climate: {
    koppen_geiger_zone: string | null;
    zone_description: string | null;
  };
  plants: Plant[];
}

interface User {
  username: string;
  email: string;
  region: Region;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "plants">("dashboard");
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // --- For plant search ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [addingPlant, setAddingPlant] = useState(false);
  const TREFLE_TOKEN = import.meta.env.VITE_APP_TREFLE_TOKEN; 

  // --- Fetch user and dummy weather ---
  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);

        if (!data.region?.lat || !data.region?.lon) {
          navigate("/locationSelect");
          return; // stop further execution
        }
        // Dummy weather
        const dummyWeather: WeatherData = {
          temperature: 24,
          description: "Sunny",
          feelsLike: 25,
          humidity: 55,
          windSpeed: 12,
          icon: "🌤️",
          forecast: [
            { date: new Date().toISOString(), icon: "🌤️", tempMax: 26, tempMin: 18 },
            { date: new Date(Date.now() + 86400000).toISOString(), icon: "⛅", tempMax: 24, tempMin: 17 },
            { date: new Date(Date.now() + 2 * 86400000).toISOString(), icon: "🌦️", tempMax: 22, tempMin: 16 },
            { date: new Date(Date.now() + 3 * 86400000).toISOString(), icon: "🌤️", tempMax: 25, tempMin: 18 },
            { date: new Date(Date.now() + 4 * 86400000).toISOString(), icon: "☀️", tempMax: 27, tempMin: 19 },
          ],
        };
        setWeather(dummyWeather);
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // --- Sign out ---
  const handleSignOut = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  // --- Search Trefle API ---
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      // Call your backend instead of Trefle directly
      const token = sessionStorage.getItem("token"); // if your backend requires auth
      const res = await fetch(
        `http://localhost:3000/plants/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
  
      if (!res.ok) throw new Error("Failed to fetch plants from backend");
  
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (err) {
      console.error("Backend search error:", err);
    }
  };
  

  // --- Add plant to user region ---
  const handleAddPlant = async (plant: any) => {
    if (!user) return;
    setAddingPlant(true);

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:3000/plants/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: plant.common_name || plant.scientific_name,
          area: 1,
          waterPerArea: 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to add plant");

      // Refresh user
      const updatedUser = await fetch("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());

      setUser(updatedUser);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingPlant(false);
    }
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
                <span>
                  {user?.region?.lat && user?.region?.lon
                    ? `${user.region.lat.toFixed(2)}, ${user.region.lon.toFixed(2)}`
                    : "No location"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-green-800">{user?.username}</p>
              <p className="text-xs text-green-600">{user?.email}</p>
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

      {/* Navigation */}
      <nav className="bg-white border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-3 px-4 font-medium transition-colors relative ${
                activeTab === "dashboard" ? "text-green-700" : "text-green-600 hover:text-green-700"
              }`}
            >
              Dashboard
              {activeTab === "dashboard" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>}
            </button>
            <button
              onClick={() => setActiveTab("plants")}
              className={`py-3 px-4 font-medium transition-colors relative ${
                activeTab === "plants" ? "text-green-700" : "text-green-600 hover:text-green-700"
              }`}
            >
              My Plants
              {activeTab === "plants" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" ? (
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
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="font-bold text-green-700 mb-2">My Plants</h2>

            {/* Search & Add Plant */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Search
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
  <div className="border rounded p-2 max-h-96 overflow-y-auto space-y-3">
    {searchResults.map((plant, i) => (
      <div
        key={i}
        className="flex items-center gap-3 border-b pb-2 last:border-b-0"
      >
        {/* Plant Image */}
        {plant.image_url ? (
          <img
            src={plant.image_url}
            alt={plant.common_name || plant.scientific_name}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-gray-400">
            No Image
          </div>
        )}

        {/* Plant Info */}
        <div className="flex-1">
          <p className="font-semibold text-green-800">
            {plant.common_name || "Unknown Name"}
          </p>
          <p className="text-sm text-gray-600">{plant.scientific_name}</p>
          <p className="text-xs text-gray-500">{plant.family}</p>
        </div>

        {/* Add Button */}
        <button
          onClick={() => handleAddPlant(plant)}
          disabled={addingPlant}
          className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Plus size={14} /> Add
        </button>
      </div>
    ))}
  </div>
)}

            <ul className="list-disc pl-5">
              {user?.region?.plants?.length ? (
                user.region.plants.map((p, i) => (
                  <li key={i}>
                    {p.name} - Last watered:{" "}
                    {p.lastWateredAt ? new Date(p.lastWateredAt).toLocaleDateString() : "Never"} - Next:{" "}
                    {p.nextWateringAt ? new Date(p.nextWateringAt).toLocaleDateString() : "TBD"}
                  </li>
                ))
              ) : (
                <li>No plants added yet</li>
              )}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
