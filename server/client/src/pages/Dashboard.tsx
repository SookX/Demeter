import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, Plus, Leaf } from "lucide-react";
import WeatherCard from "../components/WeatherCard";
import EventCard from "../components/EventCard";
import PlantCard from "../components/PlantCard";
import SatelliteCard from "../components/SatelliteCard";
import SoilClimateCard from "../components/SoilClimateCard";

interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
}

interface WeatherData {
  temperature: number;
  description: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: { date: string; icon: string; tempMax: number; tempMin: number }[];
}

interface Watering {
  amount: number;
  date: string;
}

interface Plant {
  _id?: string;
  apiId?: string;
  name: string;
  common_name?: string;
  scientific_name?: string;
  family?: string;
  image_url?: string;
  area?: number;
  waterPerArea?: number;
  plantedAt: string;
  lastWateredAt: string | null;
  nextWateringAt: string | null;
  slug?: string;
  waterings: Watering[]; 
}

interface Region {
  lat: number;
  lon: number;
  soil_type: string;
  climate: { koppen_geiger_zone: string | null; zone_description: string | null };
  plants: Plant[];
}

interface User {
  username: string;
  email: string;
  region: Region | null;
}



function getWeatherEmoji(temp: number, description: string) {
  description = description.toLowerCase();
  if (description.includes("thunder") || description.includes("storm")) return "⛈️";
  if (description.includes("snow")) return "❄️";
  if (description.includes("rain") || description.includes("drizzle")) return "🌧️";
  if (description.includes("cloud")) return "☁️";
  if (description.includes("clear")) return "☀️";
  if (temp >= 40) return "🥵";
  if (temp >= 30) return "☀️";
  if (temp >= 25) return "🌤️";
  if (temp >= 15) return "⛅";
  if (temp >= 5) return "🌥️";
  if (temp >= 0) return "🧊";
  return "❄️";
}



export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "plants">("dashboard");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Plant[]>([]);
  const [addingPlant, setAddingPlant] = useState(false);
  const [recommendedPlants, setRecommendedPlants] = useState<Plant[]>([]);

  const TREFLE_TOKEN = import.meta.env.VITE_APP_TREFLE_TOKEN;
  const API_BASE = import.meta.env.VITE_URL || 'http://localhost:3000';


  useEffect(() => {
    const fetchUserAndWeather = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const userRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData: User = await userRes.json();
        setUser(userData);

        if (!userData.region?.lat || !userData.region?.lon) {
          navigate("/locationSelect");
          return;
        }

        const { lat, lon } = userData.region;

        const currentRes = await fetch(
          `${API_BASE}/weather/current?lat=${lat}&lon=${lon}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const currentData = await currentRes.json();

        const dailyRes = await fetch(
          `${API_BASE}/weather/daily?lat=${lat}&lon=${lon}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const dailyData: ForecastDay[] = await dailyRes.json();

        setWeather({
          temperature: currentData.temperature,
          description: currentData.description,
          feelsLike: currentData.feelsLike,
          humidity: currentData.humidity,
          windSpeed: currentData.windSpeed,
          icon: getWeatherEmoji(currentData.temperature, currentData.description),
          forecast: dailyData.map((d) => ({
            date: d.date,
            icon: getWeatherEmoji((d.tempMax + d.tempMin) / 2, currentData.description),
            tempMax: d.tempMax,
            tempMin: d.tempMin,
          })),
        });
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndWeather();
  }, [navigate]);

  // Recommended plants
  useEffect(() => {
    const fetchRecommendedPlants = async () => {
      if (!user) return;

      const cached = localStorage.getItem("recommendedPlants");
      if (cached) {
        setRecommendedPlants(JSON.parse(cached));
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const recRes = await fetch(`${API_BASE}/plants/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const recData = await recRes.json();
        const plantNames: string[] = recData.recommendedPlants || [];

        const plantInfos = (
          await Promise.all(
            plantNames.map(async (name) => {
              const searchRes = await fetch(
                `${API_BASE}/plants/search?query=${encodeURIComponent(name)}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (!searchRes.ok) return null;
              const data = await searchRes.json();
              return data.data?.[0] || null;
            })
          )
        ).filter(Boolean) as Plant[];

        setRecommendedPlants(plantInfos);
        localStorage.setItem("recommendedPlants", JSON.stringify(plantInfos));
      } catch (err) {
        console.error("Failed to fetch recommended plants", err);
      }
    };

    fetchRecommendedPlants();
  }, [user]);


  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  const handleAddWatering = async (plantId: string, amount: number) => {
  if (!user) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Add watering to backend
    const res = await fetch(`${API_BASE}/plants/${plantId}/water`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error("Failed to add watering");

    // Refresh user data
    const updatedUser = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json());

    setUser(updatedUser);
  } catch (err) {
    console.error(err);
  }
};

  const handleAddPlant = async (plant: Plant) => {
    if (!user) return;
    setAddingPlant(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/plants/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plant.common_name || "Unknown Plant",
          plantedAt: new Date().toISOString(),
          imageUrl: plant.image_url,
          slug: plant.slug,
          apiId: plant.apiId,
          family: plant.family,
          scientificName: plant.scientific_name,
        }),
      });

      const updatedUser: User = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setUser(updatedUser);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingPlant(false);
    }
  };

    const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const token = localStorage.getItem("token"); 
      const res = await fetch(
        `${API_BASE}/plants/search?query=${encodeURIComponent(searchQuery)}`,
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
                  {user?.region ? `${user.region.lat.toFixed(2)}, ${user.region.lon.toFixed(2)}` : "No location"}
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

      {/* Tabs */}
      <nav className="bg-white border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          {["dashboard", "plants"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "dashboard" | "plants")}
              className={`py-3 px-4 font-medium transition-colors relative ${
                activeTab === tab ? "text-green-700" : "text-green-600 hover:text-green-700"
              }`}
            >
              {tab === "dashboard" ? "Dashboard" : "My Plants"}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && user?.region ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WeatherCard weather={weather} loading={false} />
              <SoilClimateCard soilType={user.region.soil_type} climate={user.region.climate} />
              <SatelliteCard lat={user.region.lat} lon={user.region.lon} />
              <EventCard />
            </div>

            {/* Recommended Plants */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                <Leaf size={24} className="text-green-600" />
                Recommended Plants
              </h2>
              <p className="text-sm text-green-600 mb-4">
                Based on your climate and soil conditions
              </p>
              {recommendedPlants.length ? (
                <div className="flex flex-col gap-4">
                  {recommendedPlants.map((plant, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-3 flex items-center gap-4 hover:shadow-lg transition-shadow"
                    >
                      {plant.image_url ? (
                        <img
                          src={plant.image_url}
                          alt={plant.common_name || plant.scientific_name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded text-gray-400">
                          No Image
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-semibold text-green-800">
                          🌱 {plant.common_name || plant.scientific_name}
                        </p>
                        <p className="text-sm text-gray-500">{plant.family}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recommended plants yet.</p>
              )}
            </div>
          </div>
        ) : (
          // My Plants Tab
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="font-bold text-green-700 mb-2">My Plants</h2>

            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <div key={i} className="flex items-center gap-3 border-b pb-2 last:border-b-0">
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
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">
                        {plant.common_name || "Unknown Name"}
                      </p>
                      <p className="text-sm text-gray-600">{plant.scientific_name}</p>
                      <p className="text-xs text-gray-500">{plant.family}</p>
                    </div>
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

            {/* My Plants */}
            {user.region.plants.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {user.region.plants.map((plant) => (
                  
                  <PlantCard 
                    key={plant._id || plant.apiId} 
                    // @ts-expect-error: waterings always defined in Dashboard
                    plant={{ ...plant, waterings: plant.waterings || [] }} 
                    onAddWatering={handleAddWatering}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-4">No plants added yet</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}