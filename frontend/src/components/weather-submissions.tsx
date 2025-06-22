"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/lib/api";

interface WeatherSubmission {
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

export function WeatherSubmissions() {
  const [submissions, setSubmissions] = useState<WeatherSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`${API_URL}/weather_records`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.reverse());
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    
    // Listen for form submissions to refresh the list
    const handleRefresh = () => fetchSubmissions();
    window.addEventListener('weatherSubmitted', handleRefresh);
    
    return () => window.removeEventListener('weatherSubmitted', handleRefresh);
  }, []);

  if (loading) return <div>Loading...</div>;

  if (submissions.length === 0) {
    return <div className="text-muted-foreground">No submissions yet</div>;
  }

  return (
    <div className="space-y-4">
      {submissions.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {item.weather_data.location.name}, {item.weather_data.location.country}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{item.date}</p>
          </CardHeader>
          <CardContent>
            {item.notes && (
              <div className="mb-3">
                <span className="font-medium text-sm">Notes:</span>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.notes.length > 100 ? `${item.notes.slice(0, 100)}...` : item.notes}
                </p>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              ID: <code className="bg-muted px-1 rounded text-xs">{item.id}</code>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}