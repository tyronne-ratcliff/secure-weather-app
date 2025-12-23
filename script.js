// 1. Initialize Zod from the CDN global object
const { z } = window.Zod;

const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your real key

// 2. Define the Schema (The Shield)
// This strictly defines what data we allow into our app
const WeatherSchema = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        humidity: z.number()
    }),
    weather: z.array(z.object({
        description: z.string()
    }))
});

document.getElementById('searchBtn').addEventListener('click', async () => {
    const city = document.getElementById('cityInput').value;
    const errorEl = document.getElementById('errorMessage');
    const displayEl = document.getElementById('weatherDisplay');

    if (!city) return;

    try {
        errorEl.textContent = "Loading...";
        displayEl.classList.add('hidden');
        
        // Fetch data
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error("City not found");

        const rawData = await response.json();

        // 3. VALIDATE: Use Zod to strip malicious keys like __proto__
        const result = WeatherSchema.safeParse(rawData);
        
        if (!result.success) {
            console.error("Validation failed:", result.error);
            throw new Error("Received insecure or invalid data format.");
        }

        // 4. RENDER SAFELY: Using .textContent to avoid XSS
        const data = result.data;
        errorEl.textContent = "";
        document.getElementById('cityName').textContent = data.name;
        document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('description').textContent = data.weather[0].description;
        document.getElementById('humidity').textContent = data.main.humidity;

        displayEl.classList.remove('hidden');

    } catch (err) {
        displayEl.classList.add('hidden');
        errorEl.textContent = err.message;
    }
});
