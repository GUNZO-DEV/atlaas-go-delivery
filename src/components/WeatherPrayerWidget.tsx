import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const WeatherPrayerWidget = () => {
  const [weather, setWeather] = useState<string>("Clear");
  const [temperature, setTemperature] = useState<number>(22);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);

  useEffect(() => {
    // Simulated weather (in real app, would use weather API)
    simulateWeather();
    
    // Calculate next prayer time for Morocco
    calculateNextPrayer();
    
    const interval = setInterval(() => {
      calculateNextPrayer();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const simulateWeather = () => {
    const conditions = ["Clear", "Cloudy", "Rainy", "Windy"];
    const temps = [18, 20, 22, 24, 26, 28];
    setWeather(conditions[Math.floor(Math.random() * conditions.length)]);
    setTemperature(temps[Math.floor(Math.random() * temps.length)]);
  };

  const calculateNextPrayer = () => {
    // Approximate prayer times for Morocco (Casablanca)
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayerTimes: PrayerTimes = {
      Fajr: "05:30",
      Dhuhr: "13:15",
      Asr: "16:30",
      Maghrib: "19:00",
      Isha: "20:15",
    };

    const prayers = Object.entries(prayerTimes).map(([name, time]) => {
      const [hours, minutes] = time.split(':').map(Number);
      return { name, time, minutes: hours * 60 + minutes };
    });

    // Find next prayer
    let next = prayers.find(p => p.minutes > currentTime);
    if (!next) next = prayers[0]; // If all prayers passed, next is Fajr tomorrow

    setNextPrayer({ name: next.name, time: next.time });
  };

  const getWeatherIcon = () => {
    switch (weather) {
      case "Clear":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "Cloudy":
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case "Rainy":
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case "Windy":
        return <Wind className="h-6 w-6 text-cyan-500" />;
      default:
        return <Sun className="h-6 w-6" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon()}
            <div>
              <p className="text-2xl font-bold">{temperature}°C</p>
              <p className="text-sm text-blue-100">{weather}</p>
            </div>
          </div>
          
          {nextPrayer && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                <Clock className="h-4 w-4" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {nextPrayer.name}
                </Badge>
              </div>
              <p className="text-xl font-bold">{nextPrayer.time}</p>
              <p className="text-xs text-blue-100">Next Prayer</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherPrayerWidget;
