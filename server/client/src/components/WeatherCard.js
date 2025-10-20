import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Droplets, Wind, Calendar } from 'lucide-react';
export default function WeatherCard({ weather, loading }) {
    const dummyWeather = {
        temperature: 25,
        description: 'Sunny',
        feelsLike: 27,
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
    const currentWeather = weather || dummyWeather;
    if (loading) {
        return (_jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 animate-pulse", children: [_jsx("div", { className: "h-8 bg-green-100 rounded w-1/3 mb-4" }), _jsx("div", { className: "h-24 bg-green-100 rounded" })] }));
    }
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    return (_jsxs("div", { className: "bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white", children: [_jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2", children: [_jsx("span", { className: "text-2xl", children: currentWeather.icon }), "Current Weather"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "text-7xl", children: currentWeather.icon }), _jsxs("div", { children: [_jsxs("div", { className: "text-5xl font-bold", children: [currentWeather.temperature, "\u00B0C"] }), _jsx("div", { className: "text-white font-medium", children: currentWeather.description }), _jsxs("div", { className: "text-white font-medium mt-1", children: ["Feels like ", currentWeather.feelsLike, "\u00B0C"] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 bg-white bg-opacity-30 rounded-lg p-3", children: [_jsx(Droplets, { size: 24, className: "text-black" }), _jsxs("div", { children: [_jsx("div", { className: "text-black font-medium text-sm", children: "Humidity" }), _jsxs("div", { className: "text-black font-bold", children: [currentWeather.humidity, "%"] })] })] }), _jsxs("div", { className: "flex items-center gap-3 bg-white bg-opacity-30 rounded-lg p-3", children: [_jsx(Wind, { size: 24, className: "text-black" }), _jsxs("div", { children: [_jsx("div", { className: "text-black font-medium text-sm", children: "Wind Speed" }), _jsxs("div", { className: "text-black font-bold", children: [currentWeather.windSpeed, " km/h"] })] })] })] })] }), _jsxs("div", { className: "border-t border-white border-opacity-30 pt-4", children: [_jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2 text-white", children: [_jsx(Calendar, { size: 18 }), "5-Day Forecast"] }), _jsx("div", { className: "grid grid-cols-5 gap-2", children: currentWeather.forecast.map((day, index) => (_jsxs("div", { className: "bg-white bg-opacity-30 rounded-lg p-3 text-center hover:bg-opacity-40 transition-all", children: [_jsx("div", { className: "text-xs text-black mb-1", children: formatDate(day.date) }), _jsx("div", { className: "text-3xl mb-2", children: day.icon }), _jsxs("div", { className: "text-sm font-semibold text-black", children: [day.tempMax, "\u00B0 / ", day.tempMin, "\u00B0"] })] }, index))) })] })] }));
}
