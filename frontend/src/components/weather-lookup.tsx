"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// TODO: maybe move this to a types file later
interface WeatherApiResponse {
  id: string;
  date: string;
  location: string;
  notes: string;
  weather_data: {
    current: {
      temperature: number;
      weather_descriptions: string[];
      humidity: number;
      wind_speed: number;
    };
    location: {
      name: string;
      country: string;
    };
  };
}

export function WeatherLookup() {
  const [weatherId, setWeatherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeatherApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    if (!weatherId.trim()) {
      setErrorMsg("Please enter a weather ID");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setData(null);

    try {
      const res = await fetch(`http://localhost:8000/weather/${weatherId.trim()}`);
      
      if (res.ok) {
        const weatherInfo = await res.json();
        setData(weatherInfo);
      } else if (res.status === 404) {
        setErrorMsg("Couldn't find weather data for that ID");
      } else if (res.status === 400) {
        setErrorMsg("Invalid weather ID format");
      } else {
        // fallback for other errors
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.detail || `Server error (${res.status})`);
      }
    } catch (e) {
      setErrorMsg("Can't reach the server right now");
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeatherId(e.target.value);
    // clear error when user starts typing again
    if (errorMsg) setErrorMsg(null);
  };

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchWeatherData();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Look up Weather Data</CardTitle>
        <CardDescription>
          Paste a weather ID to see the stored info
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weatherId">Weather ID</Label>
            <Input
              id="weatherId"
              type="text"
              placeholder="Paste ID here..."
              value={weatherId}
              onChange={onInputChange}
              onKeyDown={onKeyPress}
              disabled={loading}
            />
          </div>

          <Button 
            onClick={fetchWeatherData} 
            className="w-full" 
            disabled={loading || !weatherId.trim()}
          >
            {loading ? "Fetching..." : "Get Weather Info"}
          </Button>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {data && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {data.weather_data.location.name}, {data.weather_data.location.country}
                </CardTitle>
                <CardDescription>
                  {data.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Main temperature display */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Temperature:</span>
                    <span className="text-2xl font-bold">
                      {data.weather_data.current.temperature}°C
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conditions:</span>
                    <span className="text-sm text-muted-foreground">
                      {data.weather_data.current.weather_descriptions?.join(", ") || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Humidity:</span>
                    <span className="text-sm text-muted-foreground">
                      {data.weather_data.current.humidity}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wind:</span>
                    <span className="text-sm text-muted-foreground">
                      {data.weather_data.current.wind_speed} km/h
                    </span>
                  </div>

                  {data.notes && data.notes.trim() && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.notes}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-muted-foreground">
                      Record ID: {data.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}