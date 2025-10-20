import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, Plus, Leaf } from "lucide-react";
import WeatherCard from "../components/WeatherCard";
import EventCard from "../components/EventCard";
import PlantCard from "../components/PlantCard";
import SatelliteCard from "../components/SatelliteCard";
import SoilClimateCard from "../components/SoilClimateCard";
function getWeatherEmoji(temp, description) {
    description = description.toLowerCase();
    if (description.includes("thunder") || description.includes("storm"))
        return "⛈️";
    if (description.includes("snow"))
        return "❄️";
    if (description.includes("rain") || description.includes("drizzle"))
        return "🌧️";
    if (description.includes("cloud"))
        return "☁️";
    if (description.includes("clear"))
        return "☀️";
    if (temp >= 40)
        return "🥵";
    if (temp >= 30)
        return "☀️";
    if (temp >= 25)
        return "🌤️";
    if (temp >= 15)
        return "⛅";
    if (temp >= 5)
        return "🌥️";
    if (temp >= 0)
        return "🧊";
    return "❄️";
}
export default function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [weather, setWeather] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [addingPlant, setAddingPlant] = useState(false);
    const [recommendedPlants, setRecommendedPlants] = useState([]);
    const TREFLE_TOKEN = import.meta.env.VITE_APP_TREFLE_TOKEN;
    useEffect(() => {
        const fetchUserAndWeather = async () => {
            const token = localStorage.getItem("token");
            if (!token)
                return navigate("/login");
            try {
                const userRes = await fetch("http://localhost:3000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!userRes.ok)
                    throw new Error("Failed to fetch user");
                const userData = await userRes.json();
                setUser(userData);
                if (!userData.region?.lat || !userData.region?.lon) {
                    navigate("/locationSelect");
                    return;
                }
                const { lat, lon } = userData.region;
                const currentRes = await fetch(`http://localhost:3000/weather/current?lat=${lat}&lon=${lon}`, { headers: { Authorization: `Bearer ${token}` } });
                const currentData = await currentRes.json();
                const dailyRes = await fetch(`http://localhost:3000/weather/daily?lat=${lat}&lon=${lon}`, { headers: { Authorization: `Bearer ${token}` } });
                const dailyData = await dailyRes.json();
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
            }
            catch (err) {
                console.error(err);
                navigate("/login");
            }
            finally {
                setLoading(false);
            }
        };
        fetchUserAndWeather();
    }, [navigate]);
    // Recommended plants
    useEffect(() => {
        const fetchRecommendedPlants = async () => {
            if (!user)
                return;
            const cached = localStorage.getItem("recommendedPlants");
            if (cached) {
                setRecommendedPlants(JSON.parse(cached));
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const recRes = await fetch("http://localhost:3000/plants/recommendations", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const recData = await recRes.json();
                const plantNames = recData.recommendedPlants || [];
                const plantInfos = (await Promise.all(plantNames.map(async (name) => {
                    const searchRes = await fetch(`http://localhost:3000/plants/search?query=${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (!searchRes.ok)
                        return null;
                    const data = await searchRes.json();
                    return data.data?.[0] || null;
                }))).filter(Boolean);
                setRecommendedPlants(plantInfos);
                localStorage.setItem("recommendedPlants", JSON.stringify(plantInfos));
            }
            catch (err) {
                console.error("Failed to fetch recommended plants", err);
            }
        };
        fetchRecommendedPlants();
    }, [user]);
    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };
    const handleAddPlant = async (plant) => {
        if (!user)
            return;
        setAddingPlant(true);
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:3000/plants/", {
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
            const updatedUser = await fetch("http://localhost:3000/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json());
            setUser(updatedUser);
            setSearchQuery("");
            setSearchResults([]);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setAddingPlant(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50", children: [_jsx("header", { className: "bg-white border-b-2 border-green-100 shadow-sm sticky top-0 z-40", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-3xl", children: "\uD83C\uDF31" }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-green-800", children: "Demeter" }), _jsxs("div", { className: "flex items-center gap-1 text-sm text-green-600", children: [_jsx(MapPin, { size: 14 }), _jsx("span", { children: user?.region ? `${user.region.lat.toFixed(2)}, ${user.region.lon.toFixed(2)}` : "No location" })] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right hidden sm:block", children: [_jsx("p", { className: "text-sm font-medium text-green-800", children: user?.username }), _jsx("p", { className: "text-xs text-green-600", children: user?.email })] }), _jsx("button", { onClick: handleSignOut, className: "p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors", title: "Sign Out", children: _jsx(LogOut, { size: 20 }) })] })] }) }), _jsx("nav", { className: "bg-white border-b-2 border-green-100", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 flex gap-6", children: ["dashboard", "plants"].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab), className: `py-3 px-4 font-medium transition-colors relative ${activeTab === tab ? "text-green-700" : "text-green-600 hover:text-green-700"}`, children: [tab === "dashboard" ? "Dashboard" : "My Plants", activeTab === tab && _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" })] }, tab))) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 py-6", children: activeTab === "dashboard" && user?.region ? (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsx(WeatherCard, { weather: weather, loading: false }), _jsx(SoilClimateCard, { soilType: user.region.soil_type, climate: user.region.climate }), _jsx(SatelliteCard, { lat: user.region.lat, lon: user.region.lon }), _jsx(EventCard, {})] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsxs("h2", { className: "text-xl font-semibold text-green-800 mb-4 flex items-center gap-2", children: [_jsx(Leaf, { size: 24, className: "text-green-600" }), "Recommended Plants"] }), _jsx("p", { className: "text-sm text-green-600 mb-4", children: "Based on your climate and soil conditions" }), recommendedPlants.length ? (_jsx("div", { className: "flex flex-col gap-4", children: recommendedPlants.map((plant, i) => (_jsxs("div", { className: "border rounded-lg p-3 flex items-center gap-4 hover:shadow-lg transition-shadow", children: [plant.image_url ? (_jsx("img", { src: plant.image_url, alt: plant.common_name || plant.scientific_name, className: "w-24 h-24 object-cover rounded" })) : (_jsx("div", { className: "w-24 h-24 bg-gray-200 flex items-center justify-center rounded text-gray-400", children: "No Image" })), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-semibold text-green-800", children: ["\uD83C\uDF31 ", plant.common_name || plant.scientific_name] }), _jsx("p", { className: "text-sm text-gray-500", children: plant.family })] })] }, i))) })) : (_jsx("p", { className: "text-gray-500", children: "No recommended plants yet." }))] })] })) : (
                // My Plants Tab
                _jsxs("div", { className: "bg-white p-4 rounded-lg shadow space-y-4", children: [_jsx("h2", { className: "font-bold text-green-700 mb-2", children: "My Plants" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Search plants...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "flex-1 border rounded px-3 py-2" }), _jsx("button", { onClick: () => handleSearch(), className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700", children: "Search" })] }), searchResults.length > 0 && (_jsx("div", { className: "border rounded p-2 max-h-96 overflow-y-auto space-y-3", children: searchResults.map((plant, i) => (_jsxs("div", { className: "flex items-center gap-3 border-b pb-2 last:border-b-0", children: [plant.image_url ? (_jsx("img", { src: plant.image_url, alt: plant.common_name || plant.scientific_name, className: "w-16 h-16 object-cover rounded" })) : (_jsx("div", { className: "w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-gray-400", children: "No Image" })), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-green-800", children: plant.common_name || "Unknown Name" }), _jsx("p", { className: "text-sm text-gray-600", children: plant.scientific_name }), _jsx("p", { className: "text-xs text-gray-500", children: plant.family })] }), _jsxs("button", { onClick: () => handleAddPlant(plant), disabled: addingPlant, className: "flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600", children: [_jsx(Plus, { size: 14 }), " Add"] })] }, i))) })), user.region.plants.length ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4", children: user.region.plants.map((plant) => (_jsx(PlantCard, { plant: plant, onAddWatering: () => { } }, plant._id || plant.apiId))) })) : (_jsx("p", { className: "text-gray-500 mt-4", children: "No plants added yet" }))] })) })] }));
}
