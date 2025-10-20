import { Droplets, Wind, Calendar } from 'lucide-react';

export interface WeatherForecast {
  date: string;
  icon: string;
  tempMax: number;
  tempMin: number;
}

export interface WeatherData {
  temperature: number;
  description: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: WeatherForecast[];
}

interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
}

export default function WeatherCard({ weather, loading }: WeatherCardProps) {
  const dummyWeather: WeatherData = {
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
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-green-100 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-green-100 rounded"></div>
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
        <span className="text-2xl">{currentWeather.icon}</span>
        Current Weather
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-7xl">{currentWeather.icon}</div>
          <div>
            <div className="text-5xl font-bold">{currentWeather.temperature}°C</div>
            <div className="text-white font-medium">{currentWeather.description}</div>
            <div className="text-white font-medium mt-1">
              Feels like {currentWeather.feelsLike}°C
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-white bg-opacity-30 rounded-lg p-3">
            <Droplets size={24} className="text-black" />
            <div>
              <div className="text-black font-medium text-sm">Humidity</div>
              <div className="text-black font-bold">{currentWeather.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white bg-opacity-30 rounded-lg p-3">
            <Wind size={24} className="text-black" />
            <div>
              <div className="text-black font-medium text-sm">Wind Speed</div>
              <div className="text-black font-bold">{currentWeather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white border-opacity-30 pt-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
          <Calendar size={18} />
          5-Day Forecast
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {currentWeather.forecast.map((day, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-30 rounded-lg p-3 text-center hover:bg-opacity-40 transition-all"
            >
              <div className="text-xs text-white mb-1">{formatDate(day.date)}</div>
              <div className="text-3xl mb-2">{day.icon}</div>
              <div className="text-sm font-semibold text-white">
                {day.tempMax}° / {day.tempMin}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}