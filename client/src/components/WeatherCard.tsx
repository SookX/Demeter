import { Droplets, Wind, Calendar } from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
}

export default function WeatherCard({ weather, loading }: WeatherCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-green-100 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-green-100 rounded"></div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-green-600">Unable to load weather data</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🌤️</span>
        Current Weather
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-7xl">{weather.icon}</div>
          <div>
            <div className="text-5xl font-bold">{weather.temperature}°C</div>
            <div className="text-green-100">{weather.description}</div>
            <div className="text-sm text-green-100 mt-1">
              Feels like {weather.feelsLike}°C
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-white bg-opacity-20 rounded-lg p-3">
            <Droplets size={24} />
            <div>
              <div className="text-sm text-green-100">Humidity</div>
              <div className="font-semibold">{weather.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white bg-opacity-20 rounded-lg p-3">
            <Wind size={24} />
            <div>
              <div className="text-sm text-green-100">Wind Speed</div>
              <div className="font-semibold">{weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-green-400 pt-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar size={18} />
          5-Day Forecast
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {weather.forecast.map((day, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 rounded-lg p-3 text-center hover:bg-opacity-30 transition-all"
            >
              <div className="text-xs text-green-100 mb-1">{formatDate(day.date)}</div>
              <div className="text-3xl mb-2">{day.icon}</div>
              <div className="text-sm font-semibold">
                {day.tempMax}° / {day.tempMin}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}