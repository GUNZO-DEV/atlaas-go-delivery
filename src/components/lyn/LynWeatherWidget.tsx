import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, Sun, CloudRain, CloudSnow, Wind, 
  Thermometer, TrendingUp, AlertTriangle, Users 
} from "lucide-react";

interface LynWeatherWidgetProps {
  restaurant: any;
}

// Simulated weather data for Ifrane (in production, use a weather API)
const getIfraneWeather = () => {
  const month = new Date().getMonth();
  const hour = new Date().getHours();
  
  // Ifrane weather patterns
  const winterMonths = [11, 0, 1, 2]; // Dec-Mar
  const isWinter = winterMonths.includes(month);
  
  // Simulated temperatures based on season
  let baseTemp = isWinter ? 2 : 22;
  if (hour >= 6 && hour <= 10) baseTemp -= 5;
  if (hour >= 11 && hour <= 15) baseTemp += 5;
  if (hour >= 20 || hour <= 5) baseTemp -= 8;
  
  // Random variation
  baseTemp += Math.floor(Math.random() * 6) - 3;

  // Conditions based on season
  const conditions = isWinter 
    ? ["snowy", "cloudy", "partly_cloudy", "clear"]
    : ["sunny", "partly_cloudy", "cloudy", "clear"];
  
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature: baseTemp,
    condition,
    humidity: 40 + Math.floor(Math.random() * 40),
    windSpeed: 5 + Math.floor(Math.random() * 20),
    isWinter,
    snowWarning: isWinter && baseTemp < 0,
    forecast: [
      { time: "12:00", temp: baseTemp + 3, condition: "partly_cloudy" },
      { time: "15:00", temp: baseTemp + 5, condition: "sunny" },
      { time: "18:00", temp: baseTemp + 2, condition: "cloudy" },
      { time: "21:00", temp: baseTemp - 2, condition: isWinter ? "snowy" : "clear" }
    ]
  };
};

// Rush hour prediction based on weather
const predictRushHour = (weather: any) => {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  let prediction = "normal";
  let message = "Normal traffic expected";
  
  // Cold weather drives people to restaurants
  if (weather.temperature < 5) {
    prediction = "high";
    message = "Cold weather - expect higher indoor dining";
  }
  
  // Bad weather reduces deliveries but increases dine-in
  if (weather.condition === "snowy" || weather.condition === "rainy") {
    prediction = "high";
    message = "Bad weather - increased dine-in, fewer deliveries";
  }
  
  // Perfect weather - moderate
  if (weather.temperature >= 15 && weather.temperature <= 25 && weather.condition === "sunny") {
    prediction = isWeekend ? "high" : "moderate";
    message = "Good weather - terrace dining popular";
  }
  
  // Time-based predictions
  if (hour >= 12 && hour <= 14) {
    prediction = "high";
    message += " (lunch rush)";
  } else if (hour >= 19 && hour <= 21) {
    prediction = "high";
    message += " (dinner rush)";
  }
  
  return { prediction, message };
};

const LynWeatherWidget = ({ restaurant }: LynWeatherWidgetProps) => {
  const [weather, setWeather] = useState<any>(null);
  const [rushPrediction, setRushPrediction] = useState<any>(null);

  useEffect(() => {
    const weatherData = getIfraneWeather();
    setWeather(weatherData);
    setRushPrediction(predictRushHour(weatherData));
    
    // Refresh every 30 minutes
    const interval = setInterval(() => {
      const newWeather = getIfraneWeather();
      setWeather(newWeather);
      setRushPrediction(predictRushHour(newWeather));
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!weather) return null;

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "sunny": case "clear": return <Sun className="h-8 w-8 text-yellow-500" />;
      case "partly_cloudy": return <Cloud className="h-8 w-8 text-gray-400" />;
      case "cloudy": return <Cloud className="h-8 w-8 text-gray-500" />;
      case "rainy": return <CloudRain className="h-8 w-8 text-blue-500" />;
      case "snowy": return <CloudSnow className="h-8 w-8 text-blue-300" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getSmallIcon = (condition: string) => {
    switch (condition) {
      case "sunny": case "clear": return <Sun className="h-4 w-4 text-yellow-500" />;
      case "partly_cloudy": return <Cloud className="h-4 w-4 text-gray-400" />;
      case "cloudy": return <Cloud className="h-4 w-4 text-gray-500" />;
      case "rainy": return <CloudRain className="h-4 w-4 text-blue-500" />;
      case "snowy": return <CloudSnow className="h-4 w-4 text-blue-300" />;
      default: return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "high": return "bg-red-500/20 text-red-700 border-red-300";
      case "moderate": return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
      default: return "bg-green-500/20 text-green-700 border-green-300";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Ifrane Weather</h3>
            <p className="text-sm text-muted-foreground">Weather-based insights</p>
          </div>
          {getConditionIcon(weather.condition)}
        </div>

        {/* Current Weather */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-red-500" />
            <span className="text-3xl font-bold">{weather.temperature}°C</span>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1 justify-end">
              <Wind className="h-4 w-4" />
              <span>{weather.windSpeed} km/h</span>
            </div>
            <span>Humidity: {weather.humidity}%</span>
          </div>
        </div>

        {/* Snow Warning */}
        {weather.snowWarning && (
          <div className="mb-4 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Snow conditions - Roads may be affected
            </span>
          </div>
        )}

        {/* Rush Hour Prediction */}
        <div className="mb-4 p-3 bg-card rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Rush Prediction</span>
            </div>
            <Badge className={getPredictionColor(rushPrediction?.prediction)}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {rushPrediction?.prediction}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{rushPrediction?.message}</p>
        </div>

        {/* Forecast */}
        <div>
          <p className="text-sm font-medium mb-2">Today's Forecast</p>
          <div className="grid grid-cols-4 gap-2">
            {weather.forecast.map((f: any, i: number) => (
              <div key={i} className="text-center p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">{f.time}</p>
                {getSmallIcon(f.condition)}
                <p className="text-sm font-medium">{f.temp}°</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LynWeatherWidget;
