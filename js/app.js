// Weather App JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchLoading = document.getElementById('searchLoading');
  const searchError = document.getElementById('searchError');
  const weatherDisplay = document.getElementById('weatherDisplay');
  const forecastSection = document.getElementById('forecastSection');
  const unitsBtn = document.getElementById('unitsBtn');
  const unitsDropdown = document.getElementById('unitsDropdown');

  // Weather display elements
  const weatherIcon = document.getElementById('weatherIcon');
  const temperature = document.getElementById('temperature');
  const tempUnit = document.getElementById('tempUnit');
  const weatherDescription = document.getElementById('weatherDescription');
  const locationName = document.getElementById('locationName');
  const locationDetails = document.getElementById('locationDetails');
  const feelsLike = document.getElementById('feelsLike');
  const feelsLikeUnit = document.getElementById('feelsLikeUnit');
  const humidity = document.getElementById('humidity');
  const windSpeed = document.getElementById('windSpeed');
  const windUnit = document.getElementById('windUnit');
  const precipitation = document.getElementById('precipitation');
  const precipUnit = document.getElementById('precipUnit');

  // Forecast elements
  const dailyForecastContainer = document.getElementById(
    'dailyForecastContainer'
  );
  const daySelector = document.getElementById('daySelector');
  const hourlyContainer = document.getElementById('hourlyContainer');

  // Unit radio buttons
  const celsiusRadio = document.getElementById('celsius');
  const fahrenheitRadio = document.getElementById('fahrenheit');
  const kmhRadio = document.getElementById('kmh');
  const mphRadio = document.getElementById('mph');
  const mmRadio = document.getElementById('mm');
  const inchesRadio = document.getElementById('inches');

  // App state
  let currentWeatherData = null;
  let currentForecastData = null;
  let selectedDayIndex = 0;
  let currentLocation = {
    name: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
  };
  let units = {
    temperature: 'celsius',
    wind: 'kmh',
    precipitation: 'mm',
  };

  // Weather icon mapping
  const weatherIcons = {
    'clear-day': './assets/images/icon-sunny.webp',
    'clear-night': './assets/images/icon-sunny.webp',
    'partly-cloudy-day': './assets/images/icon-partly-cloudy.webp',
    'partly-cloudy-night': './assets/images/icon-partly-cloudy.webp',
    cloudy: './assets/images/icon-overcast.webp',
    overcast: './assets/images/icon-overcast.webp',
    rain: './assets/images/icon-rain.webp',
    drizzle: './assets/images/icon-drizzle.webp',
    snow: './assets/images/icon-snow.webp',
    fog: './assets/images/icon-fog.webp',
    wind: './assets/images/icon-sunny.webp',
    thunderstorm: './assets/images/icon-storm.webp',
  };

  // Event listeners
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  unitsBtn.addEventListener('click', toggleUnitsDropdown);

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!unitsBtn.contains(e.target) && !unitsDropdown.contains(e.target)) {
      unitsDropdown.classList.remove('active');
    }
  });

  // Unit change listeners
  celsiusRadio.addEventListener('change', () => {
    units.temperature = 'celsius';
    updateWeatherDisplay();
  });

  fahrenheitRadio.addEventListener('change', () => {
    units.temperature = 'fahrenheit';
    updateWeatherDisplay();
  });

  kmhRadio.addEventListener('change', () => {
    units.wind = 'kmh';
    updateWeatherDisplay();
  });

  mphRadio.addEventListener('change', () => {
    units.wind = 'mph';
    updateWeatherDisplay();
  });

  mmRadio.addEventListener('change', () => {
    units.precipitation = 'mm';
    updateWeatherDisplay();
  });

  inchesRadio.addEventListener('change', () => {
    units.precipitation = 'inches';
    updateWeatherDisplay();
  });

  // Carregar dados de São Paulo/BR por padrão ao iniciar
  window.addEventListener('load', () => {
    searchInput.value = 'São Paulo, BR';
    handleSearch();
  });

  // Functions
  function toggleUnitsDropdown() {
    unitsDropdown.classList.toggle('active');
  }

  async function handleSearch() {
    const location = searchInput.value.trim();
    if (!location) return;

    // Show loading state
    searchLoading.style.display = 'block';
    searchError.style.display = 'none';
    weatherDisplay.style.display = 'none';
    forecastSection.style.display = 'none';

    try {
      // Get coordinates for the location
      const coordinates = await getCoordinates(location);
      if (!coordinates) {
        throw new Error('Location not found');
      }

      // Store location data
      currentLocation = {
        name: coordinates.name,
        country: coordinates.country,
        countryCode: coordinates.countryCode,
      };

      // Fetch weather data
      const weatherData = await fetchWeatherData(
        coordinates.lat,
        coordinates.lon
      );
      const forecastData = await fetchForecastData(
        coordinates.lat,
        coordinates.lon
      );

      // Store data
      currentWeatherData = weatherData;
      currentForecastData = forecastData;

      // Update UI
      updateWeatherDisplay();
      updateForecastDisplay();

      // Show weather display
      weatherDisplay.style.display = 'block';
      forecastSection.style.display = 'block';
    } catch (error) {
      console.error('Error fetching weather data:', error);
      searchError.style.display = 'block';
    } finally {
      searchLoading.style.display = 'none';
    }
  }

  async function getCoordinates(location) {
    // Using Nominatim API for geocoding (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      // Extrair o nome da cidade e o país de forma mais precisa
      const address = data[0].address || {};
      const cityName =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        data[0].display_name.split(',')[0];
      const countryCode = address.country_code || '';
      const countryName =
        address.country || data[0].display_name.split(',').pop().trim();

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: cityName,
        country: countryName,
        countryCode: countryCode ? countryCode.toUpperCase() : '',
      };
    }

    return null;
  }

  async function fetchWeatherData(lat, lon) {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation,weathercode`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    return await response.json();
  }

  async function fetchForecastData(lat, lon) {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&hourly=temperature_2m,weathercode&timezone=auto`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    return await response.json();
  }

  function updateWeatherDisplay() {
    if (!currentWeatherData) return;

    const current = currentWeatherData.current_weather;
    const daily = currentWeatherData.daily;

    // Update weather icon and description
    const weatherCode = current.weathercode;
    const isDayTime = isDay(current.time, daily.sunrise[0], daily.sunset[0]);
    const weatherCondition = getWeatherCondition(weatherCode, isDayTime);

    weatherIcon.src =
      weatherIcons[weatherCondition] || weatherIcons['clear-day'];
    weatherIcon.alt = weatherCondition;
    weatherDescription.textContent = formatWeatherDescription(weatherCondition);

    // Update temperature
    const temp = convertTemperature(current.temperature, units.temperature);
    temperature.textContent = Math.round(temp);
    tempUnit.textContent = units.temperature === 'celsius' ? 'C' : 'F';

    // Update location with city and country
    locationName.textContent = `${currentLocation.name}, ${currentLocation.countryCode}`;
    locationDetails.textContent = `${new Date(current.time).toLocaleDateString(
      'pt-BR',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    )}`;

    // Update metrics
    // Note: Open-Meteo doesn't provide "feels like" in the free tier, so we'll use the actual temperature
    const feelsLikeTemp = convertTemperature(
      current.temperature,
      units.temperature
    );
    feelsLike.textContent = Math.round(feelsLikeTemp);
    feelsLikeUnit.textContent = units.temperature === 'celsius' ? 'C' : 'F';

    // Get current hour data for humidity, wind, and precipitation
    const currentHour = new Date(current.time).getHours();
    const hourlyData = currentWeatherData.hourly;

    humidity.textContent = hourlyData.relativehumidity_2m[currentHour] || '--';

    const wind = convertWindSpeed(current.windspeed, units.wind);
    windSpeed.textContent = Math.round(wind);
    windUnit.textContent = units.wind === 'kmh' ? 'km/h' : 'mph';

    const precip = convertPrecipitation(
      hourlyData.precipitation[currentHour] || 0,
      units.precipitation
    );
    precipitation.textContent = precip.toFixed(1);
    precipUnit.textContent = units.precipitation === 'mm' ? 'mm' : 'in';
  }

  function updateForecastDisplay() {
    if (!currentForecastData) return;

    // Update daily forecast
    updateDailyForecast();

    // Update day selector
    updateDaySelector();

    // Update hourly forecast for the selected day
    updateHourlyForecast();
  }

  function updateDailyForecast() {
    dailyForecastContainer.innerHTML = '';

    const daily = currentForecastData.daily;
    const days = 7; // Show 7 days

    for (let i = 0; i < days; i++) {
      const date = new Date(daily.time[i]);
      const dayName =
        i === 0
          ? 'Hoje'
          : date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const weatherCode = daily.weathercode[i];
      const weatherCondition = getWeatherCondition(weatherCode, true); // Use day icons for daily forecast

      const maxTemp = convertTemperature(
        daily.temperature_2m_max[i],
        units.temperature
      );
      const minTemp = convertTemperature(
        daily.temperature_2m_min[i],
        units.temperature
      );

      const forecastItem = document.createElement('div');
      forecastItem.className = 'forecast-item';
      forecastItem.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <img src="${
          weatherIcons[weatherCondition] || weatherIcons['clear-day']
        }" alt="${weatherCondition}" class="forecast-icon">
        <div class="forecast-temps">
          <span class="forecast-high">${Math.round(maxTemp)}°</span>
          <span class="forecast-low">${Math.round(minTemp)}°</span>
        </div>
      `;

      dailyForecastContainer.appendChild(forecastItem);
    }
  }

  function updateDaySelector() {
    daySelector.innerHTML = '';

    const daily = currentForecastData.daily;
    const days = 7; // Show 7 days

    for (let i = 0; i < days; i++) {
      const date = new Date(daily.time[i]);
      const dayName =
        i === 0
          ? 'Hoje'
          : date.toLocaleDateString('pt-BR', { weekday: 'short' });

      const dayBtn = document.createElement('button');
      dayBtn.className = `day-btn ${i === selectedDayIndex ? 'active' : ''}`;
      dayBtn.textContent = dayName;
      dayBtn.addEventListener('click', () => {
        selectedDayIndex = i;
        updateDaySelector();
        updateHourlyForecast();
      });

      daySelector.appendChild(dayBtn);
    }
  }

  function updateHourlyForecast() {
    hourlyContainer.innerHTML = '';

    const hourly = currentForecastData.hourly;
    const daily = currentForecastData.daily;

    // Get the start and end hours for the selected day
    const dayStart = new Date(daily.time[selectedDayIndex]);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Find the hourly indices for this day
    let startIndex = 0;
    let endIndex = 0;

    for (let i = 0; i < hourly.time.length; i++) {
      const hourDate = new Date(hourly.time[i]);
      if (hourDate >= dayStart && startIndex === 0) {
        startIndex = i;
      }
      if (hourDate >= dayEnd && endIndex === 0) {
        endIndex = i;
        break;
      }
    }

    // If we couldn't find the end, use the last available hour
    if (endIndex === 0) {
      endIndex = hourly.time.length;
    }

    // Display hourly forecast
    for (let i = startIndex; i < endIndex; i += 3) {
      // Show every 3 hours to avoid overcrowding
      const hourDate = new Date(hourly.time[i]);
      const hour = hourDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        hour12: false,
      });
      const weatherCode = hourly.weathercode[i];
      // Default to day time for hourly forecast to avoid errors
      const weatherCondition = getWeatherCondition(weatherCode, true);
      const temp = convertTemperature(
        hourly.temperature_2m[i],
        units.temperature
      );

      const hourlyItem = document.createElement('div');
      hourlyItem.className = 'hourly-item';
      hourlyItem.innerHTML = `
        <div class="hourly-time">${hour}:00</div>
        <img src="${
          weatherIcons[weatherCondition] || weatherIcons['clear-day']
        }" alt="${weatherCondition}" class="hourly-icon">
        <div class="hourly-temp">${Math.round(temp)}°</div>
      `;

      hourlyContainer.appendChild(hourlyItem);
    }
  }

  // Utility functions
  function isDay(time, sunrise, sunset) {
    const currentTime = new Date(time);
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);

    return currentTime >= sunriseTime && currentTime <= sunsetTime;
  }

  function getWeatherCondition(code, isDay) {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    if (code === 0) return isDay ? 'clear-day' : 'clear-night';
    if (code === 1 || code === 2 || code === 3)
      return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    if (code === 45 || code === 48) return 'fog';
    if (code === 51 || code === 53 || code === 55) return 'drizzle';
    if (code === 56 || code === 57) return 'drizzle';
    if (code === 61 || code === 63 || code === 65) return 'rain';
    if (code === 66 || code === 67) return 'rain';
    if (code === 71 || code === 73 || code === 75) return 'snow';
    if (code === 77) return 'snow';
    if (code === 80 || code === 81 || code === 82) return 'rain';
    if (code === 85 || code === 86) return 'snow';
    if (code === 95) return 'thunderstorm';
    if (code === 96 || code === 99) return 'thunderstorm';

    return isDay ? 'clear-day' : 'clear-night';
  }

  function formatWeatherDescription(condition) {
    const descriptions = {
      'clear-day': 'Céu limpo',
      'clear-night': 'Céu limpo',
      'partly-cloudy-day': 'Parcialmente nublado',
      'partly-cloudy-night': 'Parcialmente nublado',
      cloudy: 'Nublado',
      overcast: 'Encoberto',
      rain: 'Chuva',
      drizzle: 'Garoa',
      snow: 'Neve',
      fog: 'Neblina',
      wind: 'Ventoso',
      thunderstorm: 'Tempestade',
    };

    return descriptions[condition] || 'Desconhecido';
  }

  function convertTemperature(celsius, unit) {
    if (unit === 'fahrenheit') {
      return (celsius * 9) / 5 + 32;
    }
    return celsius;
  }

  function convertWindSpeed(kmh, unit) {
    if (unit === 'mph') {
      return kmh * 0.621371;
    }
    return kmh;
  }

  function convertPrecipitation(mm, unit) {
    if (unit === 'inches') {
      return mm * 0.0393701;
    }
    return mm;
  }
});
