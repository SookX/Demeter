const axios = require('axios');

const OPEN_WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// 1️⃣ Current weather
exports.getCurrentWeather = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'Latitude and Longitude are required' });

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon, appid: OPEN_WEATHER_API_KEY, units: 'metric' },
    });

    const data = response.data;
    res.json({
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    next(new Error('Failed to fetch current weather'));
  }
};

// 2️⃣ Full 5-day forecast (3-hour intervals)
exports.getForecast = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'Latitude and Longitude are required' });

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { lat, lon, appid: OPEN_WEATHER_API_KEY, units: 'metric' },
    });

    res.json(response.data); // full raw forecast
  } catch (err) {
    console.error(err.response?.data || err.message);
    next(new Error('Failed to fetch forecast'));
  }
};

// 3️⃣ Daily 5-day forecast (aggregated)
exports.getDailyForecast = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'Latitude and Longitude are required' });

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { lat, lon, appid: OPEN_WEATHER_API_KEY, units: 'metric' },
    });

    const forecastList = response.data.list;

    // Aggregate by date
    const dailyMap = {};
    forecastList.forEach(item => {
      const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
      if (!dailyMap[date]) {
        dailyMap[date] = { tempMin: item.main.temp_min, tempMax: item.main.temp_max, icon: item.weather[0].icon };
      } else {
        dailyMap[date].tempMin = Math.min(dailyMap[date].tempMin, item.main.temp_min);
        dailyMap[date].tempMax = Math.max(dailyMap[date].tempMax, item.main.temp_max);
      }
    });

    const today = new Date().toISOString().split('T')[0];

    const dailyForecast = Object.keys(dailyMap)
      .filter(date => date !== today) // <-- exclude today
      .map(date => ({
        date,
        tempMin: dailyMap[date].tempMin,
        tempMax: dailyMap[date].tempMax,
        icon: dailyMap[date].icon,
      }));

    res.json(dailyForecast);
  } catch (err) {
    console.error(err.response?.data || err.message);
    next(new Error('Failed to fetch daily forecast'));
  }
};

