// wheather app
import React, { useState } from 'react';
import axios from 'axios';

const districts = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198 },
  { name: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047 },
  { name: 'Salem', lat: 11.6643, lon: 78.1460 },
  { name: 'Erode', lat: 11.3410, lon: 77.7172 },
  { name: 'Vellore', lat: 12.9165, lon: 79.1325 },
  { name: 'Tirunelveli', lat: 8.7139, lon: 77.7567 },
  { name: 'Thoothukudi', lat: 8.7642, lon: 78.1348 },
  { name: 'Thanjavur', lat: 10.7867, lon: 79.1378 },
  { name: 'Dharmapuri', lat: 12.1211, lon: 78.1580 },
  { name: 'Dindigul', lat: 10.3673, lon: 77.9803 },
  { name: 'Kanyakumari', lat: 8.0883, lon: 77.5385 },
  { name: 'Namakkal', lat: 11.2196, lon: 78.1670 },
  { name: 'Theni', lat: 10.0153, lon: 77.4820 },
  { name: 'Karur', lat: 10.9601, lon: 78.0766 },
  { name: 'Villupuram', lat: 11.9392, lon: 79.4924 },
  { name: 'Cuddalore', lat: 11.7447, lon: 79.7680 },
];

const getWeatherIcon = (code) => {
  const map = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌦️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '🌨️',
    95: '⛈️', 96: '⛈️', 99: '⛈️',
  };
  return map[code] || '❓';
};

const convertToAMPM = (time) => {
  const date = new Date(time);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minuteStr} ${ampm}`;
};

function App() {
  const [search, setSearch] = useState('');
  const [forecast, setForecast] = useState({});
  const [error, setError] = useState('');
  const [districtName, setDistrictName] = useState('');

  const handleSearch = async () => {
    const district = districts.find(
      (d) => d.name.toLowerCase() === search.trim().toLowerCase()
    );

    if (!district) {
      setError('District not found.');
      setForecast({});
      setDistrictName('');
      return;
    }

    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lon}&hourly=temperature_2m,weathercode&forecast_days=3&timezone=auto`
      );

      const { time, temperature_2m, weathercode } = res.data.hourly;

      const grouped = {};

      time.forEach((t, i) => {
        const date = new Date(t).toLocaleDateString();
        const hour = new Date(t).getHours();
        if (!grouped[date]) grouped[date] = [];

        grouped[date].push({
          time: convertToAMPM(t), 
          temp: temperature_2m[i],
          code: weathercode[i],
        });
      });

      setForecast(grouped);
      setDistrictName(district.name);
      setError('');
    } catch (err) {
      setError('Failed to fetch weather.');
      setForecast({});
      setDistrictName('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-200 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl text-white font-bold mb-6 text-center drop-shadow">
          Tamil Nadu Weather Forecast
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-6">
          <input
            type="text"
            placeholder="Enter district name"
            className="p-3 rounded w-full sm:w-80 border border-gray-300 shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="bg-white text-blue-700 font-semibold px-6 py-2 rounded shadow hover:bg-blue-50"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}

        {Object.keys(forecast).length > 0 && (
          <>
            <h2 className="text-2xl font-semibold text-white mb-4 text-center drop-shadow">
              {districtName} – 3-Day Hourly Forecast
            </h2>

            <div className="space-y-6">
              {Object.entries(forecast).map(([date, hours]) => (
                <div key={date} className="bg-white/60 rounded-xl p-4 shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{date}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {hours.map((h, i) => (
                      <div key={i} className="bg-white rounded-lg shadow p-3 text-center">
                        <p className="text-sm text-gray-600">{h.time}</p>
                        <div className="text-3xl">{getWeatherIcon(h.code)}</div>
                        <p className="text-blue-700 font-bold text-lg">{h.temp}°C</p>
                        <p className="text-xs text-gray-400">Code: {h.code}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 
export default App;
